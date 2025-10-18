import React from 'react';
import { Camera, FileText } from 'lucide-react';

// Helper function to format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Reusable component for displaying an uploaded file
const UploadedFileItem = ({ file, onDelete, type }) => {
    const handleDeleteClick = () => {
        // Call onDelete with the file - the parent will handle showing the modal
        onDelete(file);
    };

    return (
        <div className="uploaded-file-item">
            <span className="file-icon">
                {type === 'image' ? (
                    <Camera size={20} color="#666" />
                ) : (
                    <FileText size={20} color="#666" />
                )}
            </span>
            <span className="file-name">{file.name}</span>
            <span className="file-size">{formatFileSize(file.size)}</span>
            <button type="button" className="delete-file-button" onClick={handleDeleteClick}>
                &times;
            </button>
        </div>
    );
};

export default UploadedFileItem;