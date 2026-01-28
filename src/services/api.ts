import axios from 'axios';

export interface FileItem {
    key: string;
    url: string;
    thumbnailUrl?: string;
}

export interface FileUploadUrlRequest {
    filename: string;
    contentType: string;
    sizeBytes: number;
}

export interface FileUploadPreSignedUrlResponse {
    key: string;
    method: string;
    url: string;
    headers: Record<string, string>;
    expiresAt: string;
}

export type UploadStrategy = 'multipart' | 'presigned';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchFiles = async (): Promise<FileItem[]> => {
    const response = await api.get<FileItem[]>('/files');
    return response.data;
};

export const uploadFile = async (file: File): Promise<{ key: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ key: string }>('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

export const getPresignedUploadUrl = async (
    request: FileUploadUrlRequest
): Promise<FileUploadPreSignedUrlResponse> => {
    const response = await api.post<FileUploadPreSignedUrlResponse>(
        '/files/upload/urls',
        request
    );
    return response.data;
};

export const uploadToPresignedUrl = async (
    file: File,
    presignedData: FileUploadPreSignedUrlResponse,
    onProgress?: (progress: number) => void
): Promise<void> => {
    // Encode header values to handle non-ISO-8859-1 characters
    const encodedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(presignedData.headers)) {
        // Convert to ISO-8859-1 compatible string by encoding to base64 or removing non-ASCII
        // For S3 metadata headers, we can safely encode the value
        try {
            // Try to keep the value as-is if it's ASCII-only
            if (/^[\x00-\x7F]*$/.test(value)) {
                encodedHeaders[key] = value;
            } else {
                // For non-ASCII characters, encode as UTF-8 bytes then to Latin-1
                const encoder = new TextEncoder();
                const bytes = encoder.encode(value);
                encodedHeaders[key] = String.fromCharCode(...bytes);
            }
        } catch (e) {
            // Fallback: just use ASCII characters
            encodedHeaders[key] = value.replace(/[^\x00-\x7F]/g, '');
        }
    }

    await axios.put(presignedData.url, file, {
        headers: encodedHeaders,
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
            }
        },
    });
};
