import { useState, useEffect } from 'react'
import { getAllJobs, cleanupJobs, createJob, deleteJob } from '../services/jobRoutes'
import { type JobCreate, type JobResponse } from '../types/index'

export function useJobs() {
    const [jobs, setJobs] = useState<JobResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadJobs()
    }, [])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    async function loadJobs() {
        try {
            const data = await getAllJobs()
            setJobs(data)
        } catch {
            setError("couldnt load jobs")
        } finally {
            setLoading(false)
        }
    }

    async function handleCleanup(days: number = 7): Promise<void> {
        try {
            await cleanupJobs(days)
            await loadJobs()
        } catch {
            setError("Cleanup failed")
        }
    }

    async function handleCreate(jobData: JobCreate): Promise<void> {
        try {
            const newJob = await createJob(jobData)
            setJobs(prev => [...prev, newJob])
        } catch {
            setError("couldnt create job")
        }
    }

    async function handleDelete(jobId: number): Promise<void> {
        try {
            await deleteJob(jobId)
            setJobs(prev => prev.filter(j => j.id !== jobId))
        } catch {
            setError("couldnt delete job")
        }
    }

    return { jobs, loading, error, handleCleanup, handleCreate, handleDelete }
}
