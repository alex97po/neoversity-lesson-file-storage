import React from 'react';
import FileCard from './FileCard';
import type { FileItem } from '../services/api';
import './FileGrid.css';

interface FileGridProps {
    files: FileItem[];
    loading?: boolean;
}

const FileGrid: React.FC<FileGridProps> = ({ files, loading = false }) => {
    if (loading) {
        return (
            <div className="file-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="file-card-skeleton loading-shimmer" />
                ))}
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="empty-state">
                <svg
                    width="80"
                    height="80"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <h2>No files yet</h2>
                <p>Upload your first file to get started</p>
            </div>
        );
    }

    return (
        <div className="file-grid">
            {files.map((file) => (
                <FileCard key={file.key} file={file} />
            ))}
        </div>
    );
};

export default FileGrid;
