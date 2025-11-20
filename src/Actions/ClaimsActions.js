//client side - Uses Edge Functions for claim creation, client-side for file uploads
import { db } from "../dbServer";

/**
 * Get the currently logged-in client
 */
export async function getCurrentClient() {
  try {
    const { data: { user }, error } = await db.auth.getUser();

    if (error) throw error;
    if (!user) throw new Error("No active session found");

    const { data, error: clientError } = await db
      .from("clients_Table")
      .select("uid, first_Name, family_Name, email, phone_Number, auth_id, agent_Id")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (clientError) throw clientError;
    if (!data) throw new Error("Client record not found in database");

    return data;
  } catch (err) {
    console.error("getCurrentClient error:", err.message);
    return null;
  }
}

/**
 * Get the currently logged-in moderator/employee
 */
export async function getCurrentModerator() {
  try {
    const { data: { user }, error } = await db.auth.getUser();

    if (error) throw error;
    if (!user) return null;

    const { data, error: empError } = await db
      .from("employee_Accounts")
      .select("id, is_Admin, employee_email, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    if (empError) throw empError;
    return data || null;
  } catch (err) {
    console.error("getCurrentModerator error:", err.message);
    return null;
  }
}

/**
 * Fetch all active policies for a client
 */
export async function fetchClientActivePolicies(clientUid, moderatorId = null) {
  if (!clientUid) return [];

  try {
    let query = db
      .from("policy_Table")
      .select(`
        id, 
        internal_id, 
        policy_type, 
        policy_inception, 
        policy_expiry, 
        policy_is_active, 
        is_archived, 
        partner_id,
        policy_status,
        void_reason,
        voided_date,
        client_id
      `)
      .eq("client_id", clientUid)
      .eq("policy_is_active", true)
      .or("is_archived.is.null,is_archived.eq.false");

    const { data, error } = await query;

    if (error) {
      console.error("fetchClientActivePolicies error:", error.message);
      return [];
    }

    if (moderatorId && data && data.length > 0) {
      const { data: clientData, error: clientError } = await db
        .from("clients_Table")
        .select("uid, agent_Id")
        .eq("uid", clientUid)
        .single();

      if (clientError) {
        console.error("Error fetching client agent_Id:", clientError);
        return [];
      }

      if (clientData.agent_Id !== moderatorId) {
        console.log("🔒 Client not assigned to this moderator");
        return [];
      }
    }

    return data || [];
  } catch (err) {
    console.error("fetchClientActivePolicies error:", err);
    return [];
  }
}

/**
 * Upload files to Supabase Storage
 * This runs CLIENT-SIDE after claim creation (secure via RLS)
 */
async function uploadFilesToStorage(files, clientAuthId, claimId) {
  if (!files || files.length === 0) return [];

  const uploadedPaths = [];
  const failedFiles = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    try {
      if (!file || !file.name) {
        failedFiles.push(`File ${i} (invalid)`);
        continue;
      }

      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const sanitizedFileName = file.name
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_');

      const fileName = `${timestamp}_${randomStr}_${sanitizedFileName}`;
      const filePath = `${clientAuthId}/${claimId}/${fileName}`;

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const validDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      const isValidImage = validImageTypes.includes(file.type);
      const isValidDoc = validDocTypes.includes(file.type);

      if (!isValidImage && !isValidDoc) {
        console.warn(`Skipping invalid file type: ${file.name} (${file.type})`);
        failedFiles.push(file.name);
        continue;
      }

      const { data, error } = await db.storage
        .from('claim-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream'
        });

      if (error) {
        console.error(`Upload failed for ${file.name}:`, error.message);
        failedFiles.push(file.name);
        continue;
      }

      if (!data || !data.path) {
        failedFiles.push(file.name);
        continue;
      }

      const { data: urlData } = db.storage
        .from('claim-documents')
        .getPublicUrl(data.path);

      uploadedPaths.push({
        path: data.path,
        url: urlData?.publicUrl || null,
        name: file.name,
        originalName: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error(`Error uploading ${file.name}:`, err.message);
      failedFiles.push(file.name);
      continue;
    }
  }

  if (failedFiles.length > 0) {
    console.warn(`Failed to upload ${failedFiles.length} file(s):`, failedFiles);
  }

  return uploadedPaths;
}

/**
 * Create a new claim record
 * DIRECT DATABASE INSERTION (Simpler, no Edge Function needed)
 */
export async function createClientClaim({
  policyId,
  clientName,
  typeOfIncident,
  incidentDate,
  claimDate,
  claimAmount,
  photos,
  documents,
}) {
  try {
    if (!policyId) throw new Error("Policy ID is required");
    if (!typeOfIncident) throw new Error("Type of incident is required");
    if (!incidentDate) throw new Error("Incident date is required");
    if (!claimDate) throw new Error("Claim date is required");

    // Get current user
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    // Check if current user is a moderator/employee
    const moderator = await getCurrentModerator();
    
    let clientAuthId;
    let assignedAgentId = null;
    
    if (moderator) {
      // Moderator creating claim
      console.log('✅ Moderator creating claim:', moderator.id);
      
      const { data: policyData, error: policyError } = await db
        .from("policy_Table")
        .select(`id, client_id`)
        .eq("id", parseInt(policyId))
        .single();

      if (policyError) throw new Error("Failed to fetch policy data: " + policyError.message);
      if (!policyData) throw new Error("Policy not found");
      
      const { data: clientData, error: clientError } = await db
        .from("clients_Table")
        .select("uid, auth_id, agent_Id")
        .eq("uid", policyData.client_id)
        .single();

      if (clientError) throw new Error("Failed to fetch client data: " + clientError.message);
      
      if (clientData.agent_Id !== moderator.id) {
        throw new Error("You don't have permission to create claims for this client");
      }
      
      clientAuthId = clientData.auth_id;
      assignedAgentId = clientData.agent_Id;
      
    } else {
      // Client creating their own claim
      const client = await getCurrentClient();
      if (!client) throw new Error("Unable to get current client");
      if (!client.auth_id) throw new Error("Client auth_id not found");
      
      console.log('✅ Client creating claim:', client.uid);
      clientAuthId = client.auth_id;
      assignedAgentId = client.agent_Id;
      console.log('📋 Client assigned agent:', assignedAgentId);
    }

    const now = new Date().toISOString();
    
    // Build claim data
    const claimData = {
      policy_id: parseInt(policyId),
      type_of_incident: typeOfIncident,
      incident_date: incidentDate,
      claim_date: claimDate,
      estimate_amount: parseFloat(claimAmount) || 0,
      documents: [],
      status: 'Pending',
      is_approved: false,
      created_at: now,
      agent_id: assignedAgentId
    };

    console.log('📝 Claim data to insert:', claimData);

    const { data: claimRecord, error } = await db
      .from("claims_Table")
      .insert([claimData])
      .select()
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      throw new Error("Failed to insert claim: " + error.message);
    }

    console.log('✅ Claim created successfully with agent_id:', claimRecord.agent_id);

    const allFiles = [...(photos || []), ...(documents || [])];

    if (allFiles.length > 0) {
      const uploadedFiles = await uploadFilesToStorage(
        allFiles, 
        clientAuthId, 
        claimRecord.id
      );

      if (uploadedFiles.length > 0) {
        const { data: updatedClaim, error: updateError } = await db
          .from("claims_Table")
          .update({ documents: uploadedFiles })
          .eq("id", claimRecord.id)
          .select()
          .single();

        if (updateError) {
          console.error("Failed to update claim with documents:", updateError);
          return claimRecord;
        }
        
        return updatedClaim;
      }
    }

    return claimRecord;
  } catch (err) {
    console.error("createClientClaim error:", err.message);
    throw err;
  }
}

/**
 * Fetch claims for the current user
 */
export async function fetchClientClaims(clientUid = null) {
  try {
    const { data: { user } } = await db.auth.getUser();
    if (!user) throw new Error("No authenticated user");

    const moderator = await getCurrentModerator();
    
    if (moderator) {
      const { data: clients, error: clientsError } = await db
        .from("clients_Table")
        .select("uid")
        .eq("agent_Id", moderator.id);

      if (clientsError) {
        console.error("Error fetching moderator clients:", clientsError);
        throw clientsError;
      }
      
      if (!clients || clients.length === 0) {
        console.log("🔒 No clients assigned to this moderator");
        return [];
      }

      const clientUids = clients.map(c => c.uid);

      const { data: policies, error: policiesError } = await db
        .from("policy_Table")
        .select("id, client_id")
        .in("client_id", clientUids);

      if (policiesError) {
        console.error("Error fetching policies:", policiesError);
        throw policiesError;
      }
      
      if (!policies || policies.length === 0) return [];

      const policyIds = policies.map(p => p.id);

      const { data: claims, error: claimsError } = await db
        .from("claims_Table")
        .select(`
          id,
          policy_id,
          type_of_incident,
          incident_date,
          claim_date,
          estimate_amount,
          approved_amount,
          documents,
          status,
          is_approved,
          under_review_date,
          reject_claim_date,
          approved_claim_date,
          completed_date,
          created_at,
          agent_id
        `)
        .in("policy_id", policyIds)
        .order("created_at", { ascending: false });

      if (claimsError) {
        console.error("Error fetching claims:", claimsError);
        throw claimsError;
      }

      const enrichedClaims = await Promise.all(
        (claims || []).map(async (claim) => {
          const { data: policyData } = await db
            .from("policy_Table")
            .select(`
              id,
              internal_id,
              policy_type,
              client_id,
              partner_id,
              insurance_Partners (
                id,
                insurance_Name
              ),
              policy_Computation_Table (
                policy_claim_amount,
                current_Value
              )
            `)
            .eq("id", claim.policy_id)
            .single();

          let clientData = null;
          if (policyData?.client_id) {
            const { data: client } = await db
              .from("clients_Table")
              .select("uid, first_Name, family_Name, phone_Number, auth_id")
              .eq("uid", policyData.client_id)
              .single();
            clientData = client;
          }

          return {
            ...claim,
            policy_Table: {
              ...policyData,
              clients_Table: clientData
            }
          };
        })
      );

      console.log(`✅ Fetched ${enrichedClaims?.length || 0} claims for moderator`);
      return enrichedClaims;

    } else if (clientUid) {
      console.log('🔒 Filtering claims for client:', clientUid);
      
      const { data: policies, error: policyError } = await db
        .from("policy_Table")
        .select("id")
        .eq("client_id", clientUid);

      if (policyError) throw policyError;
      if (!policies?.length) return [];

      const policyIds = policies.map((p) => p.id);

      const { data: claims, error: claimsError } = await db
        .from("claims_Table")
        .select(`
          id,
          policy_id,
          type_of_incident,
          incident_date,
          claim_date,
          estimate_amount,
          approved_amount,
          documents,
          status,
          is_approved,
          under_review_date,
          reject_claim_date,
          approved_claim_date,
          completed_date,
          created_at,
          agent_id
        `)
        .in("policy_id", policyIds)
        .order("created_at", { ascending: false });

      if (claimsError) throw claimsError;

      const enrichedClaims = await Promise.all(
        (claims || []).map(async (claim) => {
          const { data: policyData } = await db
            .from("policy_Table")
            .select(`
              id,
              internal_id,
              policy_type,
              client_id,
              partner_id,
              insurance_Partners (
                id,
                insurance_Name
              ),
              policy_Computation_Table (
                policy_claim_amount,
                current_Value
              )
            `)
            .eq("id", claim.policy_id)
            .single();

          let clientData = null;
          if (policyData?.client_id) {
            const { data: client } = await db
              .from("clients_Table")
              .select("uid, first_Name, family_Name, phone_Number, auth_id")
              .eq("uid", policyData.client_id)
              .single();
            clientData = client;
          }

          return {
            ...claim,
            policy_Table: {
              ...policyData,
              clients_Table: clientData
            }
          };
        })
      );

      console.log(`✅ Fetched ${enrichedClaims?.length || 0} claims for client`);
      return enrichedClaims;
    } else {
      return [];
    }
    
  } catch (err) {
    console.error("fetchClientClaims error:", err);
    return [];
  }
}

/**
 * Get signed URLs for claim documents
 */
export async function getClaimDocumentUrls(documents) {
  if (!documents || documents.length === 0) return [];

  const urlPromises = documents.map(async (doc) => {
    try {
      const { data, error } = await db.storage
        .from('claim-documents')
        .createSignedUrl(doc.path, 3600);

      if (error) {
        console.error(`Failed to get signed URL for ${doc.path}:`, error.message);
        return null;
      }

      return {
        ...doc,
        url: data.signedUrl
      };
    } catch (err) {
      console.error("Error getting signed URL:", err);
      return null;
    }
  });

  const results = await Promise.all(urlPromises);
  return results.filter(r => r !== null);
}

/**
 * Upload additional files to an existing claim
 * This is CLIENT-SIDE (secure via RLS) - NO EDGE FUNCTION NEEDED
 */
export async function uploadAdditionalFiles(claimId, files) {
  try {
    if (!claimId) throw new Error("Claim ID is required");
    if (!files || files.length === 0) throw new Error("No files provided");

    const client = await getCurrentClient();
    if (!client) throw new Error("Unable to get current client");
    if (!client.auth_id) throw new Error("Client auth_id not found");

    const { data: existingClaim, error: claimError } = await db
      .from("claims_Table")
      .select("documents")
      .eq("id", claimId)
      .single();

    if (claimError) throw claimError;

    const existingDocs = existingClaim.documents || [];
    const uploadedFiles = await uploadFilesToStorage(files, client.auth_id, claimId);

    if (uploadedFiles.length === 0) {
      throw new Error("No files were uploaded successfully");
    }

    const updatedDocs = [...existingDocs, ...uploadedFiles];

    const { data: updatedClaim, error: updateError } = await db
      .from("claims_Table")
      .update({ documents: updatedDocs })
      .eq("id", claimId)
      .select()
      .single();

    if (updateError) throw updateError;

    return uploadedFiles;
  } catch (err) {
    console.error("uploadAdditionalFiles error:", err.message);
    throw err;
  }
}

/**
 * Fetch voided policies for client
 */
export async function fetchClientVoidedPolicies(clientId, moderatorId = null) {
  try {
    let query = db
      .from("policy_Table")
      .select("*")
      .eq("client_id", clientId)
      .eq("policy_status", "voided")
      .order("voided_date", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching voided policies:", error);
      return [];
    }

    if (moderatorId && data && data.length > 0) {
      const { data: clientData, error: clientError } = await db
        .from("clients_Table")
        .select("uid, agent_Id")
        .eq("uid", clientId)
        .single();

      if (clientError) {
        console.error("Error fetching client agent_Id:", clientError);
        return [];
      }

      if (clientData.agent_Id !== moderatorId) {
        console.log("🔒 Client not assigned to this moderator");
        return [];
      }
    }

    return data || [];
  } catch (err) {
    console.error("fetchClientVoidedPolicies error:", err);
    return [];
  }
}

/**
 * Fetch clients assigned to a specific moderator
 */
export async function fetchModeratorClients(moderatorId) {
  try {
    if (!moderatorId) return [];
    
    const { data, error } = await db
      .from("clients_Table")
      .select("*")
      .eq("agent_Id", moderatorId)
      .order("first_Name", { ascending: true });

    if (error) throw error;
    
    return data || [];
  } catch (err) {
    console.error("fetchModeratorClients error:", err);
    return [];
  }
}