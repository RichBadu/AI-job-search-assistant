import axios from 'axios'
import { type CoverLetterResponse, type CoverLetterRequest} from '../types/index'

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        'Content-Type': 'application/json'
    }
})

export async function getCoverLetters(): Promise<CoverLetterResponse[]>{
    const response = await api.get<CoverLetterResponse[]>('/cover-letters')
    return response.data
}

export async function getCoverLetterById(id: number): Promise<CoverLetterResponse>{
    const response = await api.get<CoverLetterResponse>(`/cover-letters/${id}`)
    return response.data
}

export async function generateCoverLetter(coverLetterData: CoverLetterRequest): Promise<CoverLetterResponse>{
    const response = await api.post<CoverLetterResponse>('/cover-letters', coverLetterData)
    return response.data
}

export async function deleteCoverLetter(id: number): Promise<void> {
    await api.delete(`/cover-letters/${id}`)
}