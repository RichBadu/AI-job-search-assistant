import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { analyzeCV, getCVAnalyses } from "../services/CVRoutes";
import { type CVAnalysisResponse } from "../types/index";

interface AnalysisState {
  analyzingCvId: number | null;
  latestResult: { cvId: number; analysis: CVAnalysisResponse } | null;
  error: string | null;
  startAnalysis: (cvId: number) => void;
  cancelAnalysis: () => void;
  clearResult: () => void;
}

const AnalysisContext = createContext<AnalysisState | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analyzingCvId, setAnalyzingCvId] = useState<number | null>(null);
  const [latestResult, setLatestResult] = useState<{ cvId: number; analysis: CVAnalysisResponse } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  function startAnalysis(cvId: number) {
    if (analyzingCvId !== null) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setAnalyzingCvId(cvId);
    setError(null);
    setLatestResult(null);

    analyzeCV(cvId, controller.signal)
      .then((analysis) => {
        setLatestResult({ cvId, analysis });
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
          setError("Analyse failed");
        } else {
          setError("CV analyse failed");
        }
      })
      .finally(() => {
        setAnalyzingCvId(null);
        abortRef.current = null;
      });
  }

  function cancelAnalysis() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }

  function clearResult() {
    setLatestResult(null);
    setError(null);
  }

  return (
    <AnalysisContext.Provider value={{ analyzingCvId, latestResult, error, startAnalysis, cancelAnalysis, clearResult }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysisContext must be used within AnalysisProvider");
  return ctx;
}
