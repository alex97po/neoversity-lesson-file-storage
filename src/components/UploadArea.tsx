import React, { useState, useRef } from 'react';
import type { UploadStrategy } from '../services/api';
import { getPresignedUploadUrl, uploadToPresignedUrl } from '../services/api';
import './UploadArea.css';

interface UploadAreaProps {
    onUpload: (file: File) => Promise<void>;
    uploadStrategy: UploadStrategy;
    onRefresh: () => Promise<void>;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUpload, uploadStrategy, onRefresh }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };


    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);

        try {
            if (uploadStrategy === 'multipart') {
                // Multipart upload - use existing onUpload callback
                await onUpload(file);
            } else {
                // Presigned URL upload
                console.log('Starting presigned URL upload for:', file.name);

                // Step 1: Get presigned URL
                const presignedData = await getPresignedUploadUrl({
                    filename: file.name,
                    contentType: file.type,
                    sizeBytes: file.size,
                });
                console.log('Got presigned URL:', presignedData);

                // Step 2: Upload to S3 with progress tracking
                console.log('Uploading to S3...');
                await uploadToPresignedUrl(file, presignedData, (progress) => {
                    console.log('Upload progress:', progress);
                    setUploadProgress(progress);
                });
                console.log('Upload to S3 complete!');

                // Step 3: Refresh the file list
                await onRefresh();
                console.log('File list refreshed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`upload-area glass ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={isUploading}
            />

            {isUploading ? (
                <div className="upload-status">
                    {uploadStrategy === 'presigned' ? (
                        <>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p>Uploading... {uploadProgress}%</p>
                        </>
                    ) : (
                        <>
                            <div className="spinner" />
                            <p>Uploading...</p>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="upload-icon"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <h3>Drop files here or click to upload</h3>
                    <p>Support for images, videos, and documents</p>
                </>
            )}
        </div>
    );
};

export default UploadArea;
