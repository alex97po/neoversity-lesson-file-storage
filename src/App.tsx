import { useState, useEffect } from 'react';
import FileGrid from './components/FileGrid';
import UploadArea from './components/UploadArea';
import { fetchFiles, uploadFile } from './services/api';
import type { FileItem, UploadStrategy } from './services/api';
import './App.css';

function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStrategy, setUploadStrategy] = useState<UploadStrategy>('multipart');

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFiles();
      setFiles(data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load files. Make sure the backend is running on http://localhost:8080');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleMultipartUpload = async (file: File) => {
    try {
      setError(null);
      await uploadFile(file);
      await loadFiles();
    } catch (err) {
      console.error('Failed to upload file:', err);
      setError('Failed to upload file. Please try again.');
      throw err;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <div className="header-content">
            <div className="header-top">
              <div className="header-left">
                <h1 className="app-title">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  File Gallery
                </h1>
                <p className="app-subtitle">Upload and manage your files</p>
              </div>
              <div className="upload-strategy-toggle">
                <span className="toggle-label">Upload Method:</span>
                <div className="toggle-buttons">
                  <button
                    className={`toggle-btn ${uploadStrategy === 'multipart' ? 'active' : ''}`}
                    onClick={() => setUploadStrategy('multipart')}
                  >
                    Multipart
                  </button>
                  <button
                    className={`toggle-btn ${uploadStrategy === 'presigned' ? 'active' : ''}`}
                    onClick={() => setUploadStrategy('presigned')}
                  >
                    Presigned URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {error && (
            <div className="error-banner">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <UploadArea
            onUpload={handleMultipartUpload}
            uploadStrategy={uploadStrategy}
            onRefresh={loadFiles}
          />
          <FileGrid files={files} loading={loading} />
        </div>
      </main>
    </div>
  );
}

export default App;
