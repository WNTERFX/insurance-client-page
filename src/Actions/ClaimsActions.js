//client side
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
      .select("uid, first_Name, family_Name, email, phone_Number, auth_id")
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
 * Fetch all active policies for this client
 */
export async function fetchClientActivePolicies(clientUid) {
  if (!clientUid) return [];

  try {
    const { data, error } = await db
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
        voided_date
      `)
      .eq("client_id", clientUid)
      .eq("policy_is_active", true)
      .or("is_archived.is.null,is_archived.eq.false");

    if (error) {
      console.error("fetchClientActivePolicies error:", error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("fetchClientActivePolicies error:", err);
    return [];
  }
}

/**
 * Upload files to Supabase Storage
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

      const { data, error } = await db.storage
        .from('claim-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
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

    const client = await getCurrentClient();
    if (!client) throw new Error("Unable to get current client");
    if (!client.auth_id) throw new Error("Client auth_id not found");

    const now = new Date().toISOString();
    const claimData = {
      policy_id: parseInt(policyId),
      type_of_incident: typeOfIncident,
      incident_date: incidentDate,
      claim_date: claimDate,
      estimate_amount: parseFloat(claimAmount) || 0,
      documents: [],
      status: 'Pending',
      is_approved: false,
      created_at: now
    };

    const { data: claimRecord, error } = await db
      .from("claims_Table")
      .insert([claimData])
      .select()
      .single();

    if (error) throw new Error("Failed to insert claim: " + error.message);

    const allFiles = [...(photos || []), ...(documents || [])];

    if (allFiles.length > 0) {
      const uploadedFiles = await uploadFilesToStorage(
        allFiles, 
        client.auth_id, 
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
 * Fetch all claims for the current client
 */
export async function fetchClientClaims(clientUid) {
  if (!clientUid) return [];

  try {
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
        phone_number,
        location_of_incident,
        incident_date,
        claim_date,
        estimate_amount,
        approved_amount,
        description_of_incident, 
        documents,
        status,
        is_approved,
        message,
        under_review_date,
        reject_claim_date,
        approved_claim_date,
        completed_date,
        created_at,
        policy_Table (
          id,
          internal_id,
          policy_type,
          client_id,
          partner_id,
          insurance_Partners (
            id,
            insurance_Name
          ),
          clients_Table (
            uid,
            first_Name,
            family_Name,
            phone_Number,
            auth_id
          ),
          policy_Computation_Table (
            policy_claim_amount,
            current_Value
          )
        )
      `)
      .in("policy_id", policyIds)
      .order("created_at", { ascending: false });

    if (claimsError) throw claimsError;

    return claims || [];
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
export async function fetchClientVoidedPolicies(clientId) {
  try {
    const { data, error } = await db
      .from("policy_Table")
      .select("*")
      .eq("client_id", clientId)
      .eq("policy_status", "voided")
      .order("voided_date", { ascending: false });

    if (error) {
      console.error("Error fetching voided policies:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("fetchClientVoidedPolicies error:", err);
    return [];
  }
}