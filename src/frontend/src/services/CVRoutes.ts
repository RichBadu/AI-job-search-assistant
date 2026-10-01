import axios from 'axios'
import { type CVResponse,type CVAnalysisResponse,} from '../types/index'

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        'Content-Type': 'application/json'
    }
})

export async function getAll(): Promise<CVResponse[]>{
    const response = await api.get<CVResponse[]>('/cvs')
    return response.data
}

export async function getById(id: number): Promise<CVResponse>{
    const response = await api.get<CVResponse>(`/cvs/${id}`)
    return response.data
}

export async function getCVAnalyses(cv_id: number): Promise<CVAnalysisResponse[]> {
    const response = await api.get(`/cvs/${cv_id}/analysis`)
    return response.data
}

export async function uploadCV(file: File): Promise<CVResponse>{
    const formData = new FormData()
    formData.append('cv_file', file)

    const response = await api.post<CVResponse>('/cvs', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'}})

    return response.data
}

export async function analyzeCV(cv_id: number, signal?: AbortSignal): Promise<CVAnalysisResponse> {
    const response = await api.post(`/cvs/${cv_id}/analyze`, null, { signal })
    return response.data
}

export async function deleteCV(cv_id: number): Promise<void> {
    await api.delete(`/cvs/${cv_id}`)
} 
