import { type JobMatchResponse, type JobResponse } from "../types/index";

interface Props {
  match: JobMatchResponse | null;
  job: JobResponse | null;
  onClose: () => void;
  onGenerateCoverLetter: () => void;
  generatingCoverLetter?: boolean;
  coverLetterLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-green-500"
      : score >= 60
        ? "bg-blue-500"
        : score >= 40
          ? "bg-yellow-500"
          : "bg-gray-400";

  const label =
    score >= 80
      ? "Excellent match"
      : score >= 60
        ? "Good match"
        : score >= 40
          ? "Partial match"
          : "Low match";

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">Match score</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-lg font-medium w-10 text-right">{score}</span>
      </div>
    </div>
  );
}

function SkillSection({
  title,
  skills,
  color,
}: {
  title: string;
  skills: string[] | null | undefined;
  color: "green" | "red";
}) {
  if (!skills || skills.length === 0) return null;

  const tagColor =
    color === "green" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600";
  const iconColor =
    color === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500";

  return (
    <div className="border border-gray-100 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center ${iconColor}`}
        >
          {color === "green" ? (
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
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          ) : (
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          )}
        </div>
        <p className="text-xs font-medium text-gray-700">{title}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill, i) => (
          <span
            key={i}
            className={`text-xs px-2.5 py-0.5 rounded-full ${tagColor}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function MatchReasoningPopUp({
  match,
  job,
  onClose,
  onGenerateCoverLetter,
  generatingCoverLetter = false,
  coverLetterLanguage = "Dutch",
  onLanguageChange,
}: Props) {
  if (!match || !job) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-[600px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-xl">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-medium text-gray-900 truncate">
              {job.title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {job.company}
              {job.location && ` · ${job.location}`}
              {job.work_location_type && job.work_location_type !== "none" && (
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
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors ml-3"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <ScoreBar score={match.match_score} />

          <div className="flex items-center gap-2">
            <a
              href={job.url}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
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
              View job
            </a>

            <select
              value={coverLetterLanguage}
              onChange={(e) => onLanguageChange?.(e.target.value)}
              className="text-xs px-3 py-2 border border-gray-200 rounded-lg text-gray-600"
            >
              <option value="Dutch">Nederlands</option>
              <option value="English">English</option>
              <option value="French">Français</option>
            </select>

            <button
              onClick={onGenerateCoverLetter}
              disabled={generatingCoverLetter}
              className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {generatingCoverLetter ? (
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
                  Generating...
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
                  Generate cover letter
                </>
              )}
            </button>
          </div>

          {/* Reasoning */}
          {match.reasoning && (
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center bg-purple-50 text-purple-600">
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
                      d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
                    />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-700">
                  AI reasoning
                </p>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {match.reasoning}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <SkillSection
              title="Matching skills"
              skills={match.matching_skills}
              color="green"
            />
            <SkillSection
              title="Missing skills"
              skills={match.missing_skills}
              color="red"
            />
          </div>

          <p className="text-xs text-gray-300 pt-2 border-t border-gray-100">
            Matched on {new Date(match.matched_at).toLocaleDateString("en-GB")}{" "}
            · Status: {match.status}
            {match.interview_date && (
              <>
                {" "}
                · Interview:{" "}
                {new Date(match.interview_date).toLocaleDateString("en-GB")}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default MatchReasoningPopUp;
