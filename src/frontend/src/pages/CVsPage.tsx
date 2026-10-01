import Layout from "../components/layout";
import { useCVs } from "../hooks/UseCVs";
import CVAnalysisPopUp from "../components/CVAnalysisPopUp";
import { type CVAnalysisResponse, type CVResponse } from "../types/index";
import { useState, useEffect } from "react";

function ScoreRing({ score }: { score: number | null | undefined }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const hasScore = score != null;
  const progress = hasScore ? (score / 100) * circumference : 0;

  const color =
    score != null && score >= 80
      ? "#1D9E75"
      : score != null && score >= 60
        ? "#378ADD"
        : score != null && score >= 40
          ? "#EF9F27"
          : "#B4B2A9";

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg viewBox="0 0 48 48" className="w-12 h-12">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-gray-200"
          strokeWidth="3"
        />
        {hasScore && (
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${progress} ${circumference - progress}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            transform="rotate(-90 24 24)"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
        {hasScore ? score : "—"}
      </div>
    </div>
  );
}

function CVsPage() {
  const {
    cvs,
    loading,
    error,
    uploading,
    handleUpload,
    handleAnalyze,
    handleDelete,
    cancelAnalysis,
    getLatestAnalysis,
    analyses,
    analyzingCvId,
    latestResult,
  } = useCVs();

  const [selectedAnalysis, setSelectedAnalysis] =
    useState<CVAnalysisResponse | null>(null);
  const [selectedCVName, setSelectedCVName] = useState("");
  const [selectedCVId, setSelectedCVId] = useState(0);

  // Auto-open popup when analysis is done and you're on the page
  useEffect(() => {
    if (latestResult) {
      const cv = cvs.find((c) => c.id === latestResult.cvId);
      if (cv) {
        setSelectedAnalysis(latestResult.analysis);
        setSelectedCVName(cv.file_name.replace(`.${cv.file_type}`, ""));
        setSelectedCVId(cv.id);
      }
    }
  }, [latestResult]);

  async function onViewAnalysis(cv: CVResponse) {
    const analysis = await getLatestAnalysis(cv.id);
    if (analysis) {
      setSelectedAnalysis(analysis);
      setSelectedCVName(cv.file_name.replace(`.${cv.file_type}`, ""));
      setSelectedCVId(cv.id);
    }
  }

  if (loading)
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium">My CVs</h1>
          <p className="text-sm text-gray-400 mt-1">
            Upload and analyze your CVs to find better matches
          </p>
        </div>
        <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
              Upload CV
            </>
          )}
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </label>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {analyzingCvId !== null && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-4 h-4 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-blue-700">
              Analyzing CV
              {cvs.find((c) => c.id === analyzingCvId)
                ? ` — ${cvs.find((c) => c.id === analyzingCvId)!.file_name.replace(`.${cvs.find((c) => c.id === analyzingCvId)!.file_type}`, "")}`
                : ""}
              ...
            </span>
          </div>
          <button
            onClick={cancelAnalysis}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
        </div>
      )}

      {cvs.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl py-16 text-center">
          <svg
            className="w-10 h-10 mx-auto text-gray-300 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          <p className="text-sm text-gray-500 mb-1">No CVs uploaded yet</p>
          <p className="text-xs text-gray-400">
            Upload your first CV to start analyzing and matching
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            {cvs.length} {cvs.length === 1 ? "document" : "documents"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cvs.map((cv) => {
              const analysis = analyses[cv.id];
              const isAnalyzed = cv.status === "analyzed";
              const isAnalyzing = analyzingCvId === cv.id;

              return (
                <div
                  key={cv.id}
                  className={`border rounded-xl p-5 transition-colors ${isAnalyzing ? "border-blue-300 bg-blue-50/30" : "border-gray-200 hover:border-gray-300"}`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {cv.file_name.replace(`.${cv.file_type}`, "")}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {cv.file_type.toUpperCase()} ·{" "}
                        {new Date(cv.uploaded_at).toLocaleDateString("en-GB")}
                        <span
                          className={`inline-flex items-center gap-1 ml-2 text-xs px-2 py-0.5 rounded-full ${
                            isAnalyzing
                              ? "bg-blue-100 text-blue-600"
                              : isAnalyzed
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isAnalyzing ? (
                            <>
                              <svg
                                className="w-3 h-3 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              analyzing
                            </>
                          ) : isAnalyzed ? (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M4.5 12.75l6 6 9-13.5"
                                />
                              </svg>
                              {cv.status}
                            </>
                          ) : (
                            cv.status
                          )}
                        </span>
                      </p>
                    </div>
                    <ScoreRing score={analysis?.overall_score} />
                  </div>

                  {analysis?.search_keywords &&
                    analysis.search_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {analysis.search_keywords
                          .slice(0, 6)
                          .map((keyword, i) => (
                            <span
                              key={i}
                              className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700"
                            >
                              {keyword}
                            </span>
                          ))}
                        {analysis.search_keywords.length > 6 && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            +{analysis.search_keywords.length - 6}
                          </span>
                        )}
                      </div>
                    )}

                  <div className="border-t border-gray-100 pt-3 flex items-center gap-2">
                    {isAnalyzed ? (
                      <button
                        onClick={() => onViewAnalysis(cv)}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Analysis
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAnalyze(cv.id)}
                        disabled={isAnalyzing || analyzingCvId !== null}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {isAnalyzing ? (
                          <>
                            <svg
                              className="w-3.5 h-3.5 animate-spin"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                              />
                            </svg>
                            Analyze
                          </>
                        )}
                      </button>
                    )}

                    <a
                      href={`http://localhost:8000/api/cvs/${cv.id}/file`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                      View CV
                    </a>

                    {isAnalyzed && (
                      <button
                        onClick={() => handleAnalyze(cv.id)}
                        disabled={analyzingCvId !== null}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                          />
                        </svg>
                        Re-analyze
                      </button>
                    )}

                    {isAnalyzing && (
                      <button
                        onClick={cancelAnalysis}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete "${cv.file_name}"? All analyses, matches and cover letters will also be deleted.`,
                          )
                        ) {
                          handleDelete(cv.id);
                        }
                      }}
                      className="ml-auto inline-flex items-center text-xs p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <CVAnalysisPopUp
        analysis={selectedAnalysis}
        cvName={selectedCVName}
        cvId={selectedCVId}
        onClose={() => setSelectedAnalysis(null)}
      />
    </Layout>
  );
}

export default CVsPage;
