import { useState, useEffect } from 'react'
import { getMatchesForCV, UpdateMatchStatus, deleteMatch } from '../services/matchRoutes'
import { type JobMatchResponse, type JobMatchStatusUpdate, type JobResponse } from '../types/index'
import { getJobById } from '../services/jobRoutes'

export function useMatches(cv_id: number) {
    const [matches, setMatches] = useState<JobMatchResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [jobs, setJobs] = useState<Record<number, JobResponse>>({})
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadMatches()
    }, [cv_id])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    async function loadMatches() {
        try {
            setLoading(true)
            const data = await getMatchesForCV(cv_id)
            setMatches(data)
            await loadJobs(data)
        } catch {
            setError("couldnt load matches")
        } finally {
            setLoading(false)
        }
    }

    async function loadJobs(matchList: JobMatchResponse[]) {
        const jobMap: Record<number, JobResponse> = {}
        for (const match of matchList) {
            if (!jobMap[match.job_id]) {
                try {
                    const job = await getJobById(match.job_id)
                    jobMap[match.job_id] = job
                } catch {
                }
            }
        }
        setJobs(jobMap)
    }

    async function handleStatusUpdate(match_id: number, status: string, interview_date: string | null = null): Promise<void> {
        try {
            const data: JobMatchStatusUpdate = { status, interview_date }
            const updated = await UpdateMatchStatus(match_id, data)
            setMatches(prev => prev.map(m => m.id === match_id ? updated : m))
        } catch {
            setError("Status update failed")
        }
    }

    async function handleDelete(match_id: number): Promise<void> {
        try {
            await deleteMatch(match_id)
            setMatches(prev => prev.filter(m => m.id !== match_id))
        } catch {
            setError("couldnt delete match")
        }
    }

    return { matches, loading, error, handleStatusUpdate, handleDelete, jobs }
}
