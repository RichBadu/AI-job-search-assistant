import { type CVAnalysisResponse } from "../types/index";

interface Props {
  analysis: CVAnalysisResponse | null;
  cvName: string;
  cvId: number;
  onClose: () => void;
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
      ? "Excellent"
      : score >= 60
        ? "Good"
        : score >= 40
          ? "Average"
          : "Needs work";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium w-8 text-right">{score}</span>
      <span className="text-xs text-gray-400 w-20">{label}</span>
    </div>
  );
}

function Section({
  title,
  items,
  icon,
  color = "gray",
}: {
  title: string;
  items: string[] | null | undefined;
  icon: React.ReactNode;
  color?: "green" | "red" | "blue" | "purple" | "gray";
}) {
  if (!items || items.length === 0) return null;

  const colorMap = {
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-700",
    gray: "bg-gray-50 text-gray-600",
  };

  const dotColor = {
    green: "bg-green-400",
    red: "bg-red-400",
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    gray: "bg-gray-400",
  };

  return (
    <div className="border border-gray-100 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-6 h-6 rounded-md flex items-center justify-center ${colorMap[color]}`}
        >
          {icon}
        </div>
        <p className="text-xs font-medium text-gray-700">{title}</p>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div
              className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor[color]}`}
            />
            <p className="text-xs text-gray-600 leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CVAnalysisPopUp({ analysis, cvName, cvId, onClose }: Props) {
  if (!analysis) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-[640px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-sm font-medium text-gray-900">CV Analysis</h2>
            <p className="text-xs text-gray-400 mt-0.5">{cvName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
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
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2">Overall score</p>
            <ScoreBar score={analysis.overall_score ?? 0} />
          </div>

          <div className="flex gap-2">
            <a
              href={`http://localhost:8000/api/cvs/${cvId}/file`}
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
              View CV
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Section
              title="Strengths"
              items={analysis.strengths}
              color="green"
              icon={
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
              }
            />

            <Section
              title="Weaknesses"
              items={analysis.weaknesses}
              color="red"
              icon={
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
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                  />
                </svg>
              }
            />

            <Section
              title="Missing skills"
              items={analysis.missing_skills}
              color="blue"
              icon={
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
              }
            />

            <Section
              title="Suggestions"
              items={analysis.suggestions}
              color="purple"
              icon={
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
              }
            />
          </div>

          {/* Search keywords */}
          {analysis.search_keywords && analysis.search_keywords.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">
                Search keywords
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysis.search_keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer meta */}
          {analysis.ai_model_version && (
            <p className="text-xs text-gray-300 pt-2 border-t border-gray-100">
              Analyzed with {analysis.ai_model_version} ·{" "}
              {new Date(analysis.analyzed_at).toLocaleDateString("nl-BE")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CVAnalysisPopUp;
