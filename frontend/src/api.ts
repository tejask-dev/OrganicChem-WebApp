import axios from 'axios';
import { StructureResponse, ExplanationResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = {
    resolveStructure: async (data: string, type: 'smiles' | 'name'): Promise<StructureResponse> => {
        const response = await axios.post<StructureResponse>(`${API_URL}/resolve`, {
            structure: data,
            inputType: type
        });
        return response.data;
    },

    explainStructure: async (data: StructureResponse): Promise<ExplanationResponse> => {
        const response = await axios.post<ExplanationResponse>(`${API_URL}/explain`, data);
        return response.data;
    }
};

