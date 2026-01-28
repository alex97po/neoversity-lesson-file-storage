import React from 'react';
import type { FileItem } from '../services/api';
import './FileCard.css';

interface FileCardProps {
    file: FileItem;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
    const getFileExtension = (key: string): string => {
        const parts = key.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    };

    const isImage = (ext: string): boolean => {
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    };

    const isVideo = (ext: string): boolean => {
        return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
    };

    const extension = getFileExtension(file.key);
    const fileName = file.key.split('-').slice(1).join('-') || file.key;

    const handleDownload = () => {
        window.open(file.url, '_blank');
    };

    return (
        <div className="file-card glass glass-hover fade-in">
            <div className="file-preview">
                {isImage(extension) ? (
                    <img src={file.url} alt={fileName} className="file-image" />
                ) : isVideo(extension) ? (
                    <video src={file.url} className="file-video" controls />
                ) : (
                    <div className="file-icon">
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                            <polyline points="13 2 13 9 20 9" />
                        </svg>
                        <span className="file-extension">{extension || 'file'}</span>
                    </div>
                )}
            </div>
            <div className="file-info">
                <h3 className="file-name" title={fileName}>
                    {fileName}
                </h3>
                <button className="download-btn" onClick={handleDownload}>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download
                </button>
            </div>
        </div>
    );
};

export default FileCard;
