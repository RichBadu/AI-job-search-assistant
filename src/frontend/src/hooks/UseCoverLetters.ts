import { useState, useEffect } from 'react'
import { getCoverLetters, deleteCoverLetter } from '../services/coverletterRoutes'
import { getJobById } from '../services/jobRoutes'
import { type CoverLetterResponse, type JobResponse } from '../types/index'

export function useCoverLetters() {
    const [coverLetters, setCoverLetters] = useState<CoverLetterResponse[]>([])
    const [jobs, setJobs] = useState<Record<number, JobResponse>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadCoverLetters()
    }, [])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    async function loadCoverLetters() {
        try {
            const data = await getCoverLetters()
            setCoverLetters(data)
            await loadJobs(data)
        } catch {
            setError("couldnt load cover letters")
        } finally {
            setLoading(false)
        }
    }

    async function loadJobs(letters: CoverLetterResponse[]) {
        const jobMap: Record<number, JobResponse> = {}
        for (const cl of letters) {
            if (!jobMap[cl.job_id]) {
                try {
                    const job = await getJobById(cl.job_id)
                    jobMap[cl.job_id] = job
                } catch {
                }
            }
        }
        setJobs(jobMap)
    }

    async function handleDelete(id: number): Promise<void> {
        try {
            await deleteCoverLetter(id)
            setCoverLetters(prev => prev.filter(cl => cl.id !== id))
        } catch {
            setError("couldnt delete cover letter")
        }
    }

    return { coverLetters, jobs, loading, error, handleDelete }
}
