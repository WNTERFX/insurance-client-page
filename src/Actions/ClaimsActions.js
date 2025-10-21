//client side
import { db } from "../dbServer";

/**
 * Get the currently logged-in client
 */
export async function getCurrentClient() {
  try {
    console.log("🔍 Step 1: Getting authenticated user...");
    const { data: { user }, error } = await db.auth.getUser();
    
    if (error) {
      console.error("❌ Auth error:", error);
      throw error;
    }
    
    if (!user) {
      console.error("❌ No user session found");
      throw new Error("No active session found");
    }

    console.log("✅ Authenticated user found:");
    console.log("  - Email:", user.email);
    console.log("  - Auth ID:", user.id);

    console.log("🔍 Step 2: Querying clients_Table...");
    const { data, error: clientError } = await db
      .from("clients_Table")
      .select("uid, first_Name, family_Name, email, auth_id")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (clientError) {
      console.error("❌ Database error:", clientError);
      throw clientError;
    }
    
    if (!data) {
      console.error("❌ No client record found for auth_id:", user.id);
      throw new Error("Client record not found in database");
    }

    console.log("✅ Client record found:");
    console.log("  - UID:", data.uid);
    console.log("  - Name:", data.first_Name, data.family_Name);

    return data;
  } catch (err) {
    console.error("❌ getCurrentClient error:", err.message);
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
      .select("id, internal_id, policy_type, policy_inception, policy_expiry, policy_is_active, is_archived, partner_id")
      .eq("client_id", clientUid)
      .eq("policy_is_active", true)
      .or("is_archived.is.null,is_archived.eq.false");

    if (error) {
      console.error("❌ fetchClientActivePolicies error:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("❌ fetchClientActivePolicies unexpected:", err);
    return [];
  }
}

/**
 * Upload files to Supabase Storage
 */
async function uploadFilesToStorage(files, clientAuthId, claimId) {
  if (!files || files.length === 0) return [];

  const uploadedPaths = [];

  for (const file of files) {
    try {
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      const filePath = `${clientAuthId}/${claimId}/${fileName}`;

      console.log(`📤 Uploading file: ${file.name} to ${filePath}`);

      const { data, error } = await db.storage
        .from('claim-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error.message);
        continue;
      }

      console.log(`✅ File uploaded successfully: ${data.path}`);
      
      uploadedPaths.push({
        path: data.path,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(`❌ Error uploading ${file.name}:`, err);
      continue;
    }
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
  //phoneNumber,
 // locationOfIncident,
  incidentDate,
  claimDate,
  claimAmount,
  //descriptionOfIncident,
  photos,
  documents,
}) {
  try {
    console.log("📝 Creating client claim for policy:", policyId);

    // Validate required fields
    if (!policyId) throw new Error("Policy ID is required");
    if (!typeOfIncident) throw new Error("Type of incident is required");
   //if (!phoneNumber) throw new Error("Phone number is required");
    if (!incidentDate) throw new Error("Incident date is required");
    if (!claimDate) throw new Error("Claim date is required");

    // Get current client
    const client = await getCurrentClient();
    if (!client) throw new Error("Unable to get current client");
    if (!client.auth_id) throw new Error("Client auth_id not found");

    console.log("✅ Client auth_id:", client.auth_id);

    // Prepare claim data with explicit created_at
    const now = new Date().toISOString();
    const claimData = {
      policy_id: policyId,
      type_of_incident: typeOfIncident,
      //phone_number: phoneNumber,
      //location_of_incident: locationOfIncident || null,
      incident_date: incidentDate,
      claim_date: claimDate,
      estimate_amount: parseFloat(claimAmount) || 0,
      //description_of_incident: descriptionOfIncident || null,
      documents: [],
      status: 'Pending',
      is_approved: false,
      created_at: now  // Explicitly set the created_at timestamp
    };

    console.log("📊 Claim data to insert:", claimData);

    // Insert claim into database
    const { data: claimRecord, error } = await db
      .from("claims_Table")
      .insert([claimData])
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to insert claim:", error);
      throw new Error("Failed to insert claim: " + error.message);
    }

    console.log("✅ Claim created successfully with ID:", claimRecord.id);

    // Upload files if any
    const allFiles = [...(photos || []), ...(documents || [])];

    if (allFiles.length > 0) {
      console.log(`📤 Uploading ${allFiles.length} file(s)...`);
      
      try {
        const uploadedFiles = await uploadFilesToStorage(
          allFiles, 
          client.auth_id, 
          claimRecord.id
        );

        if (uploadedFiles.length > 0) {
          console.log(`✅ ${uploadedFiles.length} file(s) uploaded`);

          const { error: updateError } = await db
            .from("claims_Table")
            .update({ documents: uploadedFiles })
            .eq("id", claimRecord.id);

          if (updateError) {
            console.error("❌ Failed to update claim with documents:", updateError.message);
          } else {
            console.log(`✅ ${uploadedFiles.length} file(s) linked to claim`);
          }
        }
      } catch (uploadErr) {
        console.error("❌ Error during file upload:", uploadErr);
      }
    }

    return claimRecord;
  } catch (err) {
    console.error("❌ createClientClaim error:", err.message);
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

    console.log("📋 Fetched claims:", claims?.length || 0);
    if (claims?.length > 0) {
      console.log("📅 First claim created_at:", claims[0].created_at);
    }

    return claims || [];
  } catch (err) {
    console.error("❌ fetchClientClaims error:", err);
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
        console.error(`❌ Failed to get signed URL for ${doc.path}:`, error.message);
        return null;
      }

      return {
        ...doc,
        url: data.signedUrl
      };
    } catch (err) {
      console.error(`❌ Error getting signed URL:`, err);
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

    console.log(`📤 Uploading ${files.length} additional file(s)...`);

    const { data: existingClaim, error: claimError } = await db
      .from("claims_Table")
      .select("documents")
      .eq("id", claimId)
      .single();

    if (claimError) throw claimError;

    const existingDocs = existingClaim.documents || [];
    const uploadedFiles = await uploadFilesToStorage(files, client.auth_id, claimId);
    const updatedDocs = [...existingDocs, ...uploadedFiles];

    const { error: updateError } = await db
      .from("claims_Table")
      .update({ documents: updatedDocs })
      .eq("id", claimId);

    if (updateError) throw updateError;

    console.log(`✅ Successfully added ${uploadedFiles.length} file(s)`);

    return uploadedFiles;
  } catch (err) {
    console.error("❌ uploadAdditionalFiles error:", err.message);
    throw err;
  }
}