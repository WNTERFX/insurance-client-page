import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentClient,
  fetchClientActivePolicies,
  fetchClientVoidedPolicies,
  createClientClaim,
} from '../Actions/ClaimsActions';
import { enrichPoliciesWithClaimData, validateNewClaim } from '../Actions/claimsValidation';
import ClientClaimsCreationForm from '../ClientForms/ClientClaimsCreationForm';
import DeleteConfirmationModal from '../ClientForms/DeleteConfirmationModal';
import CustomAlertModal from '../ClientForms/CustomAlertModal';

/** Local-timezone safe “today” -> "YYYY-MM-DD"
 *  Hoisted function declaration avoids TDZ issues in useState init.
 */
function todayISO() {
  const d = new Date();
  const offsetMs = d.getTimezoneOffset() * 60 * 1000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 10);
}

export default function ClientClaimsCreationController({ onCancel, onClaimCreated }) {
  const navigate = useNavigate();
  const [currentClient, setCurrentClient] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPolicyClaimableAmount, setSelectedPolicyClaimableAmount] = useState(0);

  const [incidentTypes, setIncidentTypes] = useState([]);
  const [selectPolicy, setSelectPolicy] = useState('');
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [claimDate, setClaimDate] = useState(() => todayISO()); // auto today
  const [estimatedDamage, setEstimatedDamage] = useState('');
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: '',
    title: 'Alert',
  });

  // Load current client and their policies (both active and voided)
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        console.log('🔄 Loading client and policies...');
        const client = await getCurrentClient();

        if (!client) {
          console.error('❌ No client found');
          setAlertModal({
            isOpen: true,
            message: 'Unable to load client information. Please log in again.',
            title: 'Error',
          });
          return;
        }

        console.log('✅ Client loaded:', client);

        // Fetch both active and voided policies
        const [activePolicies, voidedPolicies] = await Promise.all([
          fetchClientActivePolicies(client.uid),
          fetchClientVoidedPolicies(client.uid),
        ]);

        console.log('✅ Active policies loaded:', activePolicies);
        console.log('✅ Voided policies loaded:', voidedPolicies);

        // Filter out expired active policies
        const now = new Date();
        const nonExpiredActivePolicies = activePolicies.filter((policy) => {
          if (!policy.policy_expiry) return true;
          const expiryDate = new Date(policy.policy_expiry);
          return expiryDate >= now;
        });

        console.log(`✅ Filtered ${nonExpiredActivePolicies.length} non-expired active policies`);

        // Combine active and voided policies
        const allPolicies = [...nonExpiredActivePolicies, ...voidedPolicies];
        console.log(`✅ Total policies to display: ${allPolicies.length}`);

        // Enrich all policies with claim data
        const enrichedPolicies = await enrichPoliciesWithClaimData(allPolicies);
        console.log('✅ Policies enriched with claim data:', enrichedPolicies);

        if (mounted) {
          setCurrentClient(client);
          setPolicies(enrichedPolicies || []);
        }
      } catch (err) {
        console.error('❌ Error loading client/policies:', err);
        setAlertModal({
          isOpen: true,
          message: 'Error loading data: ' + err.message,
          title: 'Error',
        });
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Update claimable amount when policy is selected
  useEffect(() => {
    if (selectPolicy) {
      const selectedPolicy = policies.find((p) => p.id === parseInt(selectPolicy));
      if (selectedPolicy) {
        setSelectedPolicyClaimableAmount(selectedPolicy.claimableAmount || 0);
        console.log(`💰 Selected policy claimable amount: ₱${selectedPolicy.claimableAmount}`);
      }
    } else {
      setSelectedPolicyClaimableAmount(0);
    }
  }, [selectPolicy, policies]);

  const handlePhotoUpload = (event) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      console.log('No photos selected');
      return;
    }

    console.log(`Selected ${files.length} photo(s)`);
    const filesArray = Array.from(files);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = filesArray.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setAlertModal({
        isOpen: true,
        message: `Invalid file type(s): ${invalidFiles.map((f) => f.name).join(', ')}\n\nPlease upload only images (JPG, PNG, GIF, WebP)`,
        title: 'Invalid File Type',
      });
      event.target.value = null;
      return;
    }

    setPhotos((prevPhotos) => {
      const newPhotos = [...prevPhotos, ...filesArray];
      console.log(`Total photos: ${newPhotos.length}`);
      return newPhotos;
    });

    event.target.value = null;
  };

  const handleDeletePhoto = (fileToDelete) => {
    console.log(`Requesting to delete photo: ${fileToDelete.name}`);
    setFileToDelete(fileToDelete);
    setDeleteType('photo');
    setIsModalOpen(true);
  };

  const handleDocumentUpload = (event) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      console.log('No documents selected');
      return;
    }

    console.log(`Selected ${files.length} document(s)`);
    const filesArray = Array.from(files);

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const invalidFiles = filesArray.filter((file) => !validTypes.includes(file.type));

    if (invalidFiles.length > 0) {
      setAlertModal({
        isOpen: true,
        message: `Invalid file type(s): ${invalidFiles.map((f) => f.name).join(', ')}\n\nPlease upload only PDFs, Word documents, or text files`,
        title: 'Invalid File Type',
      });
      event.target.value = null;
      return;
    }

    setDocuments((prevDocuments) => {
      const newDocuments = [...prevDocuments, ...filesArray];
      console.log(`Total documents: ${newDocuments.length}`);
      return newDocuments;
    });

    event.target.value = null;
  };

  const handleDeleteDocument = (fileToDelete) => {
    console.log(`Requesting to delete document: ${fileToDelete.name}`);
    setFileToDelete(fileToDelete);
    setDeleteType('document');
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteType === 'photo') {
      setPhotos((prevPhotos) => prevPhotos.filter((file) => file !== fileToDelete));
      console.log(`Photo deleted: ${fileToDelete.name}`);
    } else if (deleteType === 'document') {
      setDocuments((prevDocuments) => prevDocuments.filter((file) => file !== fileToDelete));
      console.log(`Document deleted: ${fileToDelete.name}`);
    }

    setIsModalOpen(false);
    setFileToDelete(null);
    setDeleteType('');
  };

  const cancelDelete = () => {
    console.log('Delete cancelled');
    setIsModalOpen(false);
    setFileToDelete(null);
    setDeleteType('');
  };

  const closeAlertModal = () => {
    setAlertModal({
      isOpen: false,
      message: '',
      title: 'Alert',
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate incident types
    if (incidentTypes.length === 0) {
      newErrors.incidentTypes = true;
    }

    if (!selectPolicy) newErrors.selectPolicy = true;
    if (!incidentDate) newErrors.incidentDate = true;
    if (!claimDate) newErrors.claimDate = true; // should always be present
    if (!estimatedDamage || estimatedDamage === '') newErrors.estimatedDamage = true;

    setErrors(newErrors);

    if (incidentTypes.length === 0) {
      setAlertModal({
        isOpen: true,
        message: 'Please select at least one Type of Incident',
        title: 'Alert',
      });
      return false;
    }

    if (photos.length === 0 && documents.length === 0) {
      setAlertModal({
        isOpen: true,
        message: 'There is no Attachment of Documents!',
        title: 'Alert',
      });
      return false;
    }

    if (Object.keys(newErrors).length > 0) {
      setAlertModal({
        isOpen: true,
        message: 'Please fill in all required fields',
        title: 'Alert',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log('📝 Form submission started');

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    const validation = await validateNewClaim(parseInt(selectPolicy));
    if (!validation.canCreate) {
      setAlertModal({
        isOpen: true,
        message: `Cannot create claim:\n\n${validation.reason}`,
        title: 'Cannot Create Claim',
      });
      return;
    }

    if (!currentClient) {
      setAlertModal({
        isOpen: true,
        message: 'Unable to identify current client. Please refresh and try again.',
        title: 'Error',
      });
      return;
    }

    console.log('✅ Form validation passed');
    console.log('📊 Form data:', {
      policyId: selectPolicy,
      typeOfIncidents: incidentTypes,
      locationOfIncident: incidentLocation,
      incidentDate: incidentDate,
      claimDate: claimDate,
      claimAmount: estimatedDamage,
      photosCount: photos.length,
      documentsCount: documents.length,
    });

    setLoading(true);

    try {
      const typeOfIncident = incidentTypes.join(', ');

      const claimData = {
        policyId: selectPolicy,
        clientName: currentClient.first_Name,
        typeOfIncident,
        locationOfIncident: incidentLocation,
        incidentDate,
        claimDate,
        claimAmount: estimatedDamage,
        descriptionOfIncident: description,
        photos,
        documents,
      };

      console.log('🚀 Submitting claim to backend...');
      const createdClaim = await createClientClaim(claimData);

      console.log('✅ Claim created successfully:', createdClaim);

      // Reset form (keep claim date auto today)
      setIncidentTypes([]);
      setSelectPolicy('');
      setDescription('');
      setIncidentLocation('');
      setIncidentDate('');
      setClaimDate(todayISO()); // auto again
      setEstimatedDamage('');
      setPhotos([]);
      setDocuments([]);
      setErrors({});
      setSelectedPolicyClaimableAmount(0);

      if (typeof onClaimCreated === 'function') onClaimCreated(createdClaim);
      if (typeof onCancel === 'function') onCancel(createdClaim);

      console.log('🔄 Navigating to ClientClaimsDisplay page...');
      navigate('/insurance-client-page/main-portal/Claims', {
        replace: true,
        state: { claimCreated: true, claimId: createdClaim.id },
      });
    } catch (error) {
      console.error('❌ Error submitting claim:', error);
      setAlertModal({
        isOpen: true,
        message: 'Failed to submit claim: ' + (error?.message || error),
        title: 'Error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ClientClaimsCreationForm
        incidentTypes={incidentTypes}
        setIncidentTypes={setIncidentTypes}
        selectPolicy={selectPolicy}
        setSelectPolicy={setSelectPolicy}
        description={description}
        setDescription={setDescription}
        incidentLocation={incidentLocation}
        setIncidentLocation={setIncidentLocation}
        incidentDate={incidentDate}
        setIncidentDate={setIncidentDate}
        claimDate={claimDate}
        setClaimDate={setClaimDate}
        estimatedDamage={estimatedDamage}
        setEstimatedDamage={setEstimatedDamage}
        photos={photos}
        handlePhotoUpload={handlePhotoUpload}
        handleDeletePhoto={handleDeletePhoto}
        documents={documents}
        handleDocumentUpload={handleDocumentUpload}
        handleDeleteDocument={handleDeleteDocument}
        handleSubmit={handleSubmit}
        errors={errors}
        setErrors={setErrors}
        policies={policies}
        loading={loading}
        selectedPolicyClaimableAmount={selectedPolicyClaimableAmount}
      />

      <DeleteConfirmationModal
        isOpen={isModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        fileName={fileToDelete?.name}
      />

      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlertModal}
        message={alertModal.message}
        title={alertModal.title}
      />
    </>
  );
}
