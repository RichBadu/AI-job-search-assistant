import axios from 'axios'
import { type JobMatchResponse,type JobMatchCreate,type JobMatchStatusUpdate} from '../types/index'

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        'Content-Type': 'application/json'
    }
})

export async function getAllMatches(): Promise<JobMatchResponse[]> {
    const response = await api.get<JobMatchResponse[]>('/matches')
    return response.data
}

export async function getMatchById(id : number): Promise<JobMatchResponse> {
    const response = await api.get<JobMatchResponse>(`/matches/${id}`)
    return response.data
}

export async function getMatchesForCV(cv_id: number): Promise<JobMatchResponse[]> {
    const response = await api.get<JobMatchResponse[]>(`/matches/cv/${cv_id}`)
    return response.data
}

export async function createMatch(data: JobMatchCreate): Promise<JobMatchResponse> {
    const response = await api.post<JobMatchResponse>('/matches', data)
    return response.data
}

export async function UpdateMatchStatus(match_id: number,data: JobMatchStatusUpdate): Promise<JobMatchResponse> {
    const response = await api.patch<JobMatchResponse>(`/matches/${match_id}/status`, data)
    return response.data
}

export async function deleteMatch(match_id: number): Promise<void> {
    await api.delete(`/matches/${match_id}`)
}