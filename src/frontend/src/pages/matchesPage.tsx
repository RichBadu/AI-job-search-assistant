import { useState, useEffect } from "react";
import Layout from "../components/layout";
import { useMatches } from "../hooks/UseMatches";
import { getAll } from "../services/CVRoutes";
import {
  type CVResponse,
  type JobMatchResponse,
  type JobResponse,
} from "../types/index";
import { generateCoverLetter } from "../services/coverletterRoutes";
import MatchReasoningPopUp from "../components/MatchReasoningPopUp";

const STATUS_OPTIONS = [
  { value: "all", label: "All", color: "bg-gray-100 text-gray-600" },
  {
    value: "interested",
    label: "Interested",
    color: "bg-gray-100 text-gray-600",
  },
  { value: "applied", label: "Applied", color: "bg-blue-50 text-blue-600" },
  {
    value: "interview",
    label: "Interview",
    color: "bg-purple-50 text-purple-700",
  },
  { value: "rejected", label: "Rejected", color: "bg-red-50 text-red-600" },
  { value: "offer", label: "Offer", color: "bg-green-50 text-green-700" },
];

function getStatusColor(status: string) {
  return (
    STATUS_OPTIONS.find((s) => s.value === status)?.color ??
    "bg-gray-100 text-gray-600"
  );
}

function ScoreRing({ score, size = 40 }: { score: number; size?: number }) {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color =
    score >= 80
      ? "#1D9E75"
      : score >= 60
        ? "#378ADD"
        : score >= 40
          ? "#EF9F27"
          : "#B4B2A9";

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: size, height: size }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-gray-100"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {score}
      </div>
    </div>
  );
}

function MatchesPage() {
  const [cvs, setCvs] = useState<CVResponse[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<number>(0);
  const [selectedMatch, setSelectedMatch] = useState<JobMatchResponse | null>(
    null,
  );
  const [selectedJob, setSelectedJob] = useState<JobResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAllScores, setShowAllScores] = useState(false);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [coverLetterLanguage, setCoverLetterLanguage] = useState("Dutch");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  async function handleGenerateCoverLetter() {
    if (!selectedMatch) return;
    setGeneratingCL(true);
    try {
      await generateCoverLetter({
        cv_id: selectedCVId,
        job_id: selectedMatch.job_id,
        language: coverLetterLanguage,
      });
      setSuccessMessage("Cover letter generated!");
      setSelectedMatch(null);
      setSelectedJob(null);
    } catch {
      setSuccessMessage(null);
    } finally {
      setGeneratingCL(false);
    }
  }

  useEffect(() => {
    async function loadCVs() {
      const data = await getAll();
      setCvs(data);
      if (data.length > 0) setSelectedCVId(data[0].id);
    }
    loadCVs();
  }, []);

  const { matches, loading, error, handleStatusUpdate, handleDelete, jobs } =
    useMatches(selectedCVId);

  const filteredMatches = matches
    .filter((m) => showAllScores || m.match_score >= 60)
    .filter((m) => statusFilter === "all" || m.status === statusFilter)
    .sort((a, b) => b.match_score - a.match_score);

  const totalCount = matches.length;
  const goodMatchCount = matches.filter((m) => m.match_score >= 60).length;

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
          <h1 className="text-xl font-medium">Matches</h1>
          <p className="text-sm text-gray-400 mt-1">
            {goodMatchCount} good matches out of {totalCount} total
          </p>
        </div>
        <select
          value={selectedCVId}
          onChange={(e) => setSelectedCVId(Number(e.target.value))}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg"
        >
          {cvs.map((cv) => (
            <option key={cv.id} value={cv.id}>
              {cv.file_name.replace(`.${cv.file_type}`, "")}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
          {successMessage}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                statusFilter === opt.value
                  ? opt.value === "all"
                    ? "bg-gray-900 text-white"
                    : opt.color.replace("50", "100")
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <label className="ml-auto flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showAllScores}
            onChange={(e) => setShowAllScores(e.target.checked)}
            className="rounded border-gray-300"
          />
          Show all scores
        </label>
      </div>

      {matches.length === 0 ? (
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
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <p className="text-sm text-gray-500 mb-1">No matches yet</p>
          <p className="text-xs text-gray-400">
            Start a scrape to match jobs to your CV
          </p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="border border-gray-200 rounded-xl py-12 text-center">
          <p className="text-sm text-gray-500 mb-1">
            No matches with these filters
          </p>
          <p className="text-xs text-gray-400">
            Try a different filter or show all scores
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            {filteredMatches.length}{" "}
            {filteredMatches.length === 1 ? "match" : "matches"}
          </p>

          <div className="space-y-3">
            {filteredMatches.map((match) => {
              const job = jobs[match.job_id];

              return (
                <div
                  key={match.id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <ScoreRing score={match.match_score} />

                    <div className="flex-1 min-w-0">
                      <a
                        href={job?.url}
                        target="_blank"
                        className="text-sm font-medium hover:text-blue-600 transition-colors truncate block"
                      >
                        {job?.title ?? "Loading..."}
                      </a>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {job?.company}
                        {job?.location && ` · ${job.location}`}
                        {job?.work_location_type &&
                          job.work_location_type !== "none" && (
                            <span
                              className={`ml-2 inline-flex text-xs px-2 py-0.5 rounded-full ${
                                job.work_location_type === "remote"
                                  ? "bg-green-50 text-green-700"
                                  : job.work_location_type === "hybrid"
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {job.work_location_type}
                            </span>
                          )}
                      </p>
                    </div>

                    {match.matching_skills &&
                      match.matching_skills.length > 0 && (
                        <div className="hidden lg:flex flex-wrap gap-1 max-w-48">
                          {match.matching_skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {match.matching_skills.length > 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              +{match.matching_skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                    <select
                      value={match.status}
                      onChange={(e) =>
                        handleStatusUpdate(match.id, e.target.value)
                      }
                      className={`text-xs px-3 py-1.5 rounded-full border-0 font-medium cursor-pointer ${getStatusColor(match.status)}`}
                    >
                      <option value="interested">Interested</option>
                      <option value="applied">Applied</option>
                      <option value="interview">Interview</option>
                      <option value="rejected">Rejected</option>
                      <option value="offer">Offer</option>
                    </select>

                    {match.status === "interview" && (
                      <input
                        type="date"
                        value={
                          match.interview_date
                            ? match.interview_date.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleStatusUpdate(
                            match.id,
                            "interview",
                            e.target.value || null,
                          )
                        }
                        className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg"
                        title="Interview date"
                      />
                    )}

                    <button
                      onClick={() => {
                        setSelectedMatch(match);
                        setSelectedJob(job ?? null);
                      }}
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
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Details
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this match?",
                          )
                        ) {
                          handleDelete(match.id);
                        }
                      }}
                      className="inline-flex items-center p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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

      <MatchReasoningPopUp
        match={selectedMatch}
        job={selectedJob}
        onClose={() => {
          setSelectedMatch(null);
          setSelectedJob(null);
        }}
        onGenerateCoverLetter={handleGenerateCoverLetter}
        generatingCoverLetter={generatingCL}
        coverLetterLanguage={coverLetterLanguage}
        onLanguageChange={setCoverLetterLanguage}
      />
    </Layout>
  );
}

export default MatchesPage;
