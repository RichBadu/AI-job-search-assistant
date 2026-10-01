import axios from 'axios'
import { type JobResponse,type JobCreate, type JobScrapeResponse,} from '../types/index'

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        'Content-Type': 'application/json'
    }
})

export async function getAllJobs(): Promise<JobResponse[]> {
    const response = await api.get<JobResponse[]>('/jobs')
    return response.data
}

export async function getJobById(id: number): Promise<JobResponse> {
    const response = await api.get<JobResponse>(`/jobs/${id}`)
    return response.data
}

export async function createJob(data: JobCreate): Promise<JobResponse>{
    const response = await api.post('jobs',data)
    return response.data
}

export async function scrapeJobs(cv_id:number, location_be?: string, location_au?: string, signal?: AbortSignal): Promise<JobScrapeResponse> {
    const params: Record<string, string> = {}
    if (location_be) params.location_be = location_be
    if (location_au) params.location_au = location_au

    const response = await api.post<JobScrapeResponse>(`/jobs/scrape/${cv_id}`,null,
        { params, signal } )
    return response.data
}

export async function deleteJob(job_id: number): Promise<void> {
    await api.delete(`/jobs/${job_id}`)
}

export async function cleanupJobs(days:number = 7) : Promise<void>{
    await api.delete('jobs/cleanup', {params: {days}})
}

