import { useState, useEffect } from 'react'
import { getAll, uploadCV, deleteCV, getCVAnalyses } from '../services/CVRoutes'
import { type CVResponse, type CVAnalysisResponse } from '../types/index'
import { useAnalysisContext } from '../context/AnalysisContext'

export function useCVs() {
    const [cvs, setCvs] = useState<CVResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [analyses, setAnalyses] = useState<Record<number, CVAnalysisResponse | null>>({})

    const {
        analyzingCvId,
        latestResult,
        error: analysisError,
        startAnalysis,
        cancelAnalysis
    } = useAnalysisContext()

    useEffect(() => {
        loadCVs()
    }, [])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    useEffect(() => {
        if (latestResult) {
            setCvs(prev => prev.map(cv =>
                cv.id === latestResult.cvId ? { ...cv, status: 'analyzed' } : cv
            ))
            setAnalyses(prev => ({ ...prev, [latestResult.cvId]: latestResult.analysis }))
        }
    }, [latestResult])

    async function loadCVs() {
        try {
            const data = await getAll()
            setCvs(data)
            await loadAnalyses(data)
        } catch {
            setError("couldnt load CVs")
        } finally {
            setLoading(false)
        }
    }

    async function handleUpload(file: File): Promise<void> {
        try {
            setUploading(true)
            const newCV = await uploadCV(file)
            setCvs(prev => [...prev, newCV])
        } catch {
            setError("couldnt upload CV")
        } finally {
            setUploading(false)
        }
    }

    async function loadAnalyses(cvList: CVResponse[]) {
        const analysisMap: Record<number, CVAnalysisResponse | null> = {}
        for (const cv of cvList) {
            if (cv.status === 'analyzed') {
                analysisMap[cv.id] = await getLatestAnalysis(cv.id)
            }
        }
        setAnalyses(analysisMap)
    }

    function handleAnalyze(cv_id: number) {
        startAnalysis(cv_id)
    }

    async function handleDelete(cv_id: number): Promise<void> {
        try {
            await deleteCV(cv_id)
            setCvs(prev => prev.filter(cv => cv.id !== cv_id))
        } catch {
            setError("couldnt delete CV")
        }
    }

    async function getLatestAnalysis(cv_id: number): Promise<CVAnalysisResponse | null> {
        try {
            const data = await getCVAnalyses(cv_id)
            if (data.length === 0) return null
            return data[data.length - 1]
        } catch {
            return null
        }
    }

    const combinedError = error || analysisError

    return {
        cvs, loading, error: combinedError, uploading,
        handleUpload, handleAnalyze, handleDelete, cancelAnalysis,
        getLatestAnalysis, analyses, analyzingCvId, latestResult
    }
}
