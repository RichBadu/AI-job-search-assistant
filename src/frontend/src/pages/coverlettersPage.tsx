import { useState } from "react";
import Layout from "../components/layout";
import { useCoverLetters } from "../hooks/UseCoverLetters";
import { type CoverLetterResponse } from "../types/index";

function CoverLettersPage() {
  const { coverLetters, jobs, loading, error, handleDelete } =
    useCoverLetters();
  const [selectedLetter, setSelectedLetter] =
    useState<CoverLetterResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  function handleCopy(content: string) {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleConfirmDelete(id: number) {
    handleDelete(id);
    setConfirmDeleteId(null);
    if (selectedLetter?.id === id) {
      setSelectedLetter(null);
    }
  }

  function getPreview(content: string): string {
    const lines = content.split("\n").filter((l) => l.trim());
    return (
      lines.slice(0, 2).join(" ").slice(0, 120) +
      (lines.join(" ").length > 120 ? "..." : "")
    );
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
      <div className="mb-6">
        <h1 className="text-xl font-medium">Cover Letters</h1>
        <p className="text-sm text-gray-400 mt-1">
          {coverLetters.length}{" "}
          {coverLetters.length === 1 ? "letter" : "letters"} generated
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {coverLetters.length === 0 ? (
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
              d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V18z"
            />
          </svg>
          <p className="text-sm text-gray-500 mb-1">No cover letters yet</p>
          <p className="text-xs text-gray-400">
            Generate a cover letter from the matches page
          </p>
        </div>
      ) : (
        <div
          className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden"
          style={{ height: "calc(100vh - 220px)" }}
        >
          <div className="w-[340px] flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50/50">
            {coverLetters.map((cl) => {
              const job = jobs[cl.job_id];
              const isSelected = selectedLetter?.id === cl.id;
              const isDeleting = confirmDeleteId === cl.id;

              return (
                <div key={cl.id} className="relative">
                  <button
                    onClick={() => {
                      setSelectedLetter(cl);
                      setConfirmDeleteId(null);
                    }}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-200 transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-l-2 border-l-blue-500"
                        : "hover:bg-white border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium truncate ${isSelected ? "text-blue-700" : "text-gray-900"}`}
                        >
                          {job ? job.title : `Job #${cl.job_id}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {job ? job.company : "Unknown company"}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-300 whitespace-nowrap mt-0.5">
                        {new Date(cl.generated_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {getPreview(cl.content)}
                    </p>
                  </button>

                  {!isDeleting && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(cl.id);
                      }}
                      className="absolute top-3 right-3 opacity-0 hover:opacity-100 focus:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 transition-all group-hover:opacity-100"
                      style={{ opacity: isSelected ? 0.6 : undefined }}
                      title="Delete"
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                  )}

                  {isDeleting && (
                    <div className="absolute inset-0 bg-white/95 flex items-center justify-center gap-2 px-4">
                      <span className="text-xs text-gray-500">Delete?</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDelete(cl.id);
                        }}
                        className="text-xs px-2.5 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="text-xs px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedLetter ? (
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-base font-medium text-gray-900">
                      {jobs[selectedLetter.job_id]?.title ??
                        `Job #${selectedLetter.job_id}`}
                    </h2>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {jobs[selectedLetter.job_id]?.company ??
                        "Unknown company"}
                      {jobs[selectedLetter.job_id]?.location &&
                        ` · ${jobs[selectedLetter.job_id].location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedLetter.content)}
                      className={`inline-flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-lg transition-all ${
                        copied
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {copied ? (
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
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                          Copied
                        </>
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
                              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                            />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                    {jobs[selectedLetter.job_id]?.url && (
                      <a
                        href={jobs[selectedLetter.job_id].url}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 text-sm px-3.5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                      >
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
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                        Job posting
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-100 mb-6" />

                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {selectedLetter.content}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-4">
                  <span className="text-[11px] text-gray-300">
                    Generated on{" "}
                    {new Date(selectedLetter.generated_at).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "long", year: "numeric" },
                    )}
                  </span>
                  {selectedLetter.ai_model_version && (
                    <span className="text-[11px] text-gray-300">
                      · {selectedLetter.ai_model_version}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-200 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V18z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400">Select a cover letter</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Choose a letter from the list on the left
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CoverLettersPage;
