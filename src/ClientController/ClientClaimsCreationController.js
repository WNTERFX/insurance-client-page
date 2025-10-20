import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getCurrentClient,
    fetchClientActivePolicies,
    createClientClaim,
} from '../Actions/ClaimsActions';
import { enrichPoliciesWithClaimData, validateNewClaim } from '../Actions/claimsValidation';
import ClientClaimsCreationForm from '../ClientForms/ClientClaimsCreationForm'; 
import DeleteConfirmationModal from '../ClientForms/DeleteConfirmationModal';

export default function ClientClaimsCreationController({ onCancel, onClaimCreated }) {
    const navigate = useNavigate();
    const [currentClient, setCurrentClient] = useState(null);
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPolicyClaimableAmount, setSelectedPolicyClaimableAmount] = useState(0);

    const [incidentType, setIncidentType] = useState('');
    const [selectPolicy, setSelectPolicy] = useState('');
    const [description, setDescription] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [incidentLocation, setIncidentLocation] = useState('');
    const [incidentDate, setIncidentDate] = useState('');
    const [claimDate, setClaimDate] = useState('');
    const [estimatedDamage, setEstimatedDamage] = useState('');
    const [photos, setPhotos] = useState([]);
    const [documents, setDocuments] = useState([]);
    
    // Validation errors state
    const [errors, setErrors] = useState({});
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(''); // 'photo' or 'document'

    // Load current client and their policies
    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                console.log("🔄 Loading client and policies...");
                const client = await getCurrentClient();
                
                if (!client) {
                    console.error("❌ No client found");
                    alert("Unable to load client information. Please log in again.");
                    return;
                }

                console.log("✅ Client loaded:", client);

                const activePolicies = await fetchClientActivePolicies(client.uid);
                console.log("✅ Active policies loaded:", activePolicies);

                // Enrich policies with claimable amounts and validation
                const enrichedPolicies = await enrichPoliciesWithClaimData(activePolicies);
                console.log("✅ Policies enriched with claim data:", enrichedPolicies);

                if (mounted) {
                    setCurrentClient(client);
                    setPolicies(enrichedPolicies || []);
                }
            } catch (err) {
                console.error("❌ Error loading client/policies:", err);
                alert("Error loading data: " + err.message);
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
            const selectedPolicy = policies.find(p => p.id === parseInt(selectPolicy));
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
        
        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\nPlease upload only images (JPG, PNG, GIF, WebP)`);
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
        
        // Validate file types
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        const invalidFiles = filesArray.filter(file => !validTypes.includes(file.type));
        
        if (invalidFiles.length > 0) {
            alert(`Invalid file type(s): ${invalidFiles.map(f => f.name).join(', ')}\nPlease upload only PDFs, Word documents, or text files`);
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

    const validateForm = () => {
        const newErrors = {};

        if (!selectPolicy) {
            newErrors.selectPolicy = true;
        }
       {/* if (!contactNumber || contactNumber.trim() === '') {
            newErrors.contactNumber = true;
        }*/}
        if (!incidentDate) {
            newErrors.incidentDate = true;
        }
        if (!claimDate) {
            newErrors.claimDate = true;
        }
        if (!estimatedDamage || estimatedDamage === '') {
            newErrors.estimatedDamage = true;
        }

        setErrors(newErrors);
        
        if (!incidentType) {
            alert('Please select a Type of Incident');
            return false;
        }
        
        if (Object.keys(newErrors).length > 0) {
            alert('Please fill in all required fields');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log("📝 Form submission started");

        // Validate form
        if (!validateForm()) {
            console.log("❌ Form validation failed");
            return;
        }

        // Validate if claim can be created for selected policy
        const validation = await validateNewClaim(parseInt(selectPolicy));
        if (!validation.canCreate) {
            alert(`Cannot create claim:\n\n${validation.reason}`);
            return;
        }

        if (!currentClient) {
            alert('Unable to identify current client. Please refresh and try again.');
            return;
        }

        console.log("✅ Form validation passed");
        console.log("📊 Form data:", {
            policyId: selectPolicy,
            typeOfIncident: incidentType,
          //  phoneNumber: contactNumber,
            locationOfIncident: incidentLocation,
            incidentDate: incidentDate,
            claimDate: claimDate,
            claimAmount: estimatedDamage,
            photosCount: photos.length,
            documentsCount: documents.length
        });

        setLoading(true);

        try {
            const claimData = {
                policyId: selectPolicy,
                clientName: currentClient.first_Name,
                typeOfIncident: incidentType,
              //  phoneNumber: contactNumber,
                locationOfIncident: incidentLocation,
                incidentDate: incidentDate,
                claimDate: claimDate,
                claimAmount: estimatedDamage,
                descriptionOfIncident: description,
                photos: photos,
                documents: documents,
            };

            console.log("🚀 Submitting claim to backend...");
            const createdClaim = await createClientClaim(claimData);

            console.log('✅ Claim created successfully:', createdClaim);
            
            // Reset form after successful submission
            setIncidentType('');
            setSelectPolicy('');
            setDescription('');
           // setContactNumber('');
            setIncidentLocation('');
            setIncidentDate('');
            setClaimDate('');
            setEstimatedDamage('');
            setPhotos([]);
            setDocuments([]);
            setErrors({});
            setSelectedPolicyClaimableAmount(0);

            // Call callbacks if provided
            if (typeof onClaimCreated === "function") onClaimCreated(createdClaim);
            if (typeof onCancel === "function") onCancel(createdClaim);

            // Navigate to ClientClaimsDisplay page
            console.log("🔄 Navigating to ClientClaimsDisplay page...");
            navigate('/insurance-client-page/main-portal/Claims', { 
                replace: true,
                state: { claimCreated: true, claimId: createdClaim.id }
            });

        } catch (error) {
            console.error('❌ Error submitting claim:', error);
            alert('Failed to submit claim: ' + (error?.message || error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ClientClaimsCreationForm
                incidentType={incidentType}
                setIncidentType={setIncidentType}
                selectPolicy={selectPolicy}
                setSelectPolicy={setSelectPolicy}
                description={description}
                setDescription={setDescription}
                //contactNumber={contactNumber}
                //setContactNumber={setContactNumber}
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
        </>
    );
}