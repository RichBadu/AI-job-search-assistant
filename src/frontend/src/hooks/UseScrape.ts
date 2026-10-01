import { useState, useEffect } from 'react'
import { getAll } from '../services/CVRoutes'
import { type CVResponse } from '../types/index'
import { useScrapeContext } from '../context/ScrapeContext'

export function useScrape() {
    const [cvs, setCvs] = useState<CVResponse[]>([])
    const [selectedCVId, setSelectedCVId] = useState<number>(0)
    const [locationBe, setLocationBe] = useState("")
    const [locationAu, setLocationAu] = useState("")
    const [loadingCvs, setLoadingCvs] = useState(true)
    const [localError, setLocalError] = useState<string | null>(null)

    const { scraping, result, error: scrapeError, startScrape, cancelScrape, clearResult } = useScrapeContext()

    useEffect(() => {
        async function loadCVs() {
            try {
                const data = await getAll()
                const analyzed = data.filter(cv => cv.status === 'analyzed')
                setCvs(analyzed)
                if (analyzed.length > 0) setSelectedCVId(analyzed[0].id)
            } catch {
                setLocalError("couldnt load CVs")
            } finally {
                setLoadingCvs(false)
            }
        }
        loadCVs()
    }, [])

    useEffect(() => {
        if (localError) {
            const timer = setTimeout(() => setLocalError(null), 5000)
            return () => clearTimeout(timer)
        }
    }, [localError])

    function handleScrape() {
        if (!selectedCVId) return
        if (!locationBe && !locationAu) {
            setLocalError("Vul minstens één locatie in")
            return
        }
        startScrape(
            selectedCVId,
            locationBe || undefined,
            locationAu || undefined
        )
    }

    const error = localError || scrapeError

    return {
        cvs, selectedCVId, setSelectedCVId,
        locationBe, setLocationBe,
        locationAu, setLocationAu,
        scraping, result, error, loadingCvs, handleScrape, cancelScrape, clearResult
    }
}
