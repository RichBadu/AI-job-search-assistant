import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { scrapeJobs } from "../services/jobRoutes";
import { type JobScrapeResponse } from "../types/index";

interface ScrapeState {
  scraping: boolean;
  result: JobScrapeResponse | null;
  error: string | null;
  startScrape: (cvId: number, locationBe?: string, locationAu?: string) => void;
  cancelScrape: () => void;
  clearResult: () => void;
}

const ScrapeContext = createContext<ScrapeState | null>(null);

export function ScrapeProvider({ children }: { children: ReactNode }) {
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<JobScrapeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-dismiss errors na 5 seconden
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  function startScrape(cvId: number, locationBe?: string, locationAu?: string) {
    if (scraping) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setScraping(true);
    setError(null);
    setResult(null);

    scrapeJobs(cvId, locationBe, locationAu, controller.signal)
      .then((data) => {
        setResult(data);
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          setError("Scrape geannuleerd");
        } else {
          setError("Scrape mislukt — probeer het opnieuw");
        }
      })
      .finally(() => {
        setScraping(false);
        abortRef.current = null;
      });
  }

  function cancelScrape() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }

  function clearResult() {
    setResult(null);
    setError(null);
  }

  return (
    <ScrapeContext.Provider
      value={{
        scraping,
        result,
        error,
        startScrape,
        cancelScrape,
        clearResult,
      }}
    >
      {children}
    </ScrapeContext.Provider>
  );
}

export function useScrapeContext() {
  const ctx = useContext(ScrapeContext);
  if (!ctx)
    throw new Error("useScrapeContext must be used within ScrapeProvider");
  return ctx;
}
