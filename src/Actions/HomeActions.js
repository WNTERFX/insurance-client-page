import { db } from '../dbServer';

// Helper to get the current user's UID using your 'db' instance
const getCurrentUserId = async () => {
  const { data: { user }, error } = await db.auth.getUser();
  if (error) {
    console.error("Error getting user from auth:", error.message);
    return null;
  }
  return user ? user.id : null;
};

export const getRecentClaim = async () => {
  try {
    const authUserId = await getCurrentUserId();
    if (!authUserId) {
      console.warn("No user logged in, cannot fetch claims.");
      return null;
    }

    const { data: clientData, error: clientError } = await db
      .from('clients_Table')
      .select('uid')
      .eq('auth_id', authUserId)
      .single();

    if (clientError) {
      console.error("Error fetching client:", clientError.message);
      return null;
    }

    if (!clientData) {
      console.log("No client record found for this auth user.");
      return null;
    }

    const clientUid = clientData.uid;

    const { data: policies, error: policyError } = await db
      .from('policy_Table')
      .select('id')
      .eq('client_id', clientUid);

    if (policyError) {
      throw policyError;
    }

    if (!policies || policies.length === 0) {
      console.log("No policies found for this user, thus no claims.");
      return null;
    }

    const policyIds = policies.map(p => p.id);

    // FIXED: Changed to order by ID descending to get the most recent claim (LIFO)
    const { data: claimData, error: claimError } = await db
      .from('claims_Table')
      .select(`
        id,
        type_of_incident,
        incident_date,
        claim_date,
        policy_Table:policy_id(
          policy_type,
          insurance_Partners:partner_id(insurance_Name)
        )
      `)
      .in('policy_id', policyIds)
      .order('id', { ascending: false })  // Changed from claim_date to id
      .limit(1);

    if (claimError) {
      console.error("Error in claim query:", claimError);
      throw claimError;
    }

    if (!claimData || claimData.length === 0) {
      console.log("No claims found for this user.");
      return null;
    }

    const claim = claimData[0];
    
    return {
      type_of_incident: claim.type_of_incident,
      incident_date: claim.incident_date,
      claim_date: claim.claim_date,
      policy_type: claim.policy_Table?.policy_type,
      insurance_partner: claim.policy_Table?.insurance_Partners?.insurance_Name
    };

  } catch (error) {
    console.error("Error fetching recent claim:", error.message);
    return null;
  }
};

export const getRecentPolicyAndClient = async () => {
  try {
    const authUserId = await getCurrentUserId();
    if (!authUserId) {
      console.warn("No user logged in, cannot fetch policy.");
      return null;
    }

    const { data: clientData, error: clientError } = await db
      .from('clients_Table')
      .select('uid, first_Name, family_Name, phone_Number')
      .eq('auth_id', authUserId)
      .limit(1);

    if (clientError) {
      throw clientError;
    }

    if (!clientData || clientData.length === 0) {
      console.warn("No client record found for this auth user.");
      return null;
    }

    const client = clientData[0];
    const clientUid = client.uid;

    // FIXED: Changed to order by ID descending to get the most recent policy (LIFO)
    const { data: policyData, error: policyError } = await db
      .from('policy_Table')
      .select('id, client_id, internal_id, partner_id, policy_inception, policy_is_active')
      .eq('client_id', clientUid)
      .order('id', { ascending: false })  // Changed from policy_inception to id
      .limit(1);

    if (policyError) {
      throw policyError;
    }

    if (!policyData || policyData.length === 0) {
      console.log("No policy found for this client.");
      return null;
    }

    const recentPolicy = policyData[0];

    let partnerName = null;
    if (recentPolicy.partner_id) {
      const { data: partnerData, error: partnerError } = await db
        .from('insurance_Partners')
        .select('insurance_Name')
        .eq('id', recentPolicy.partner_id)
        .limit(1);
      
      if (!partnerError && partnerData && partnerData.length > 0) {
        partnerName = partnerData[0].insurance_Name;
      }
    }

    return {
      name: `${client.first_Name} ${client.family_Name}`,
      phoneNumber: client.phone_Number,
      policyNumber: recentPolicy.internal_id,
      effective: recentPolicy.policy_inception,
      insurancePartner: partnerName,
      status: recentPolicy.policy_is_active ? 'Active' : 'Inactive',
    };

  } catch (error) {
    console.error("Error fetching recent policy and client:", error.message);
    return null;
  }
};

export const fetchBestInsurancePartners = async (month, year) => {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('Calling RPC with dates:', startDateStr, endDateStr);

    const { data, error } = await db
      .rpc('get_best_insurance_partners', {
        p_start_date: startDateStr,
        p_end_date: endDateStr
      });

    if (error) {
      console.error('RPC Error:', error);
      throw error;
    }

    console.log('RPC Response:', data);

    if (!data || data.length === 0) {
      console.log('No data returned from RPC');
      return {
        data: [],
        totalPolicies: 0
      };
    }

    const partnersMap = new Map();
    
    data.forEach(row => {
      if (!partnersMap.has(row.partner_id)) {
        partnersMap.set(row.partner_id, {
          id: row.partner_id,
          name: row.insurance_name,
          policies: []
        });
      }
      
      if (row.policy_id) {
        partnersMap.get(row.partner_id).policies.push({
          id: row.policy_id,
          policy_is_active: row.policy_is_active,
          policy_inception: row.policy_inception
        });
      }
    });

    const partnersData = Array.from(partnersMap.values());

    const processedData = partnersData.map(partner => {
      const activePolicies = partner.policies.filter(policy => {
        if (!policy.policy_is_active || !policy.policy_inception) return false;
        
        const inceptionDate = new Date(policy.policy_inception);
        return inceptionDate >= startDate && inceptionDate <= endDate;
      });

      return {
        id: partner.id,
        name: partner.name,
        policyCount: activePolicies.length
      };
    });

    const filteredData = processedData.filter(partner => partner.policyCount > 0);

    if (filteredData.length === 0) {
      console.log('No policies found within date range');
      return {
        data: [],
        totalPolicies: 0
      };
    }

    const totalPolicies = filteredData.reduce((sum, partner) => sum + partner.policyCount, 0);

    const formattedData = filteredData.map(partner => ({
      id: partner.id,
      name: partner.name,
      policyCount: partner.policyCount,
      percentage: totalPolicies > 0 ? (partner.policyCount / totalPolicies) * 100 : 0
    }));

    formattedData.sort((a, b) => b.policyCount - a.policyCount);

    return {
      data: formattedData,
      totalPolicies
    };
  } catch (error) {
    console.error('Error in fetchBestInsurancePartners:', error);
    throw error;
  }
};

export const getAvailableYears = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2013;
  const years = [];
  
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }
  
  return years;
};

export const getMonths = () => {
  return [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
};