import axios from 'axios';

export interface FileItem {
    key: string;
    url: string;
}

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
