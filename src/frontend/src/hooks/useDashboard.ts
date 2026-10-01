import { useState, useEffect } from 'react'
import { getAll } from '../services/CVRoutes'
import { getAllJobs } from '../services/jobRoutes'
import { getAllMatches } from '../services/matchRoutes'
import { getCoverLetters } from '../services/coverletterRoutes'
import { type CVResponse, type JobResponse, type JobMatchResponse, type CoverLetterResponse } from '../types/index'

export function useDashboard(selectedCVId: number = 0) {
    const [cvs, setCvs] = useState<CVResponse[]>([])
    const [jobs, setJobs] = useState<JobResponse[]>([])
    const [matches, setMatches] = useState<JobMatchResponse[]>([])
    const [coverLetters, setCoverLetters] = useState<CoverLetterResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadAll()
    }, [])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    async function loadAll() {
        try {
            const [cvsData, jobsData, matchesData, clData] = await Promise.all([
                getAll(),
                getAllJobs(),
                getAllMatches(),
                getCoverLetters()
            ])
            setCvs(cvsData)
            setJobs(jobsData)
            setMatches(matchesData)
            setCoverLetters(clData)
        } catch {
            setError("couldnt load data")
        } finally {
            setLoading(false)
        }
    }

    const filteredMatches = selectedCVId === 0
        ? matches
        : matches.filter(m => m.cv_id === selectedCVId)

    const filteredCoverLetters = selectedCVId === 0
        ? coverLetters
        : coverLetters.filter(cl => cl.cv_id === selectedCVId)

    return { cvs, jobs, matches: filteredMatches, coverLetters: filteredCoverLetters, loading, error }
}
