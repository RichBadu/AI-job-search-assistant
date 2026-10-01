import Layout from "../components/layout";
import { useDashboard } from "../hooks/useDashboard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [selectedCVId, setSelectedCVId] = useState<number>(0);
  const { cvs, jobs, matches, coverLetters, loading, error } =
    useDashboard(selectedCVId);
  const navigate = useNavigate();

  const analyzedCvs = cvs.filter((c) => c.status === "analyzed").length;

  const pipeline = [
    {
      label: "Interested",
      count: matches.filter((m) => m.status === "interested").length,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
    },
    {
      label: "Applied",
      count: matches.filter((m) => m.status === "applied").length,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Interview",
      count: matches.filter((m) => m.status === "interview").length,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      label: "Offer",
      count: matches.filter((m) => m.status === "offer").length,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      label: "Rejected",
      count: matches.filter((m) => m.status === "rejected").length,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
    },
  ];

  const scoreDistribution = [
    {
      label: "Excellent",
      range: "80+",
      count: matches.filter((m) => m.match_score >= 80).length,
      color: "bg-green-500",
    },
    {
      label: "Good",
      range: "60-79",
      count: matches.filter((m) => m.match_score >= 60 && m.match_score < 80)
        .length,
      color: "bg-blue-500",
    },
    {
      label: "Fair",
      range: "40-59",
      count: matches.filter((m) => m.match_score >= 40 && m.match_score < 60)
        .length,
      color: "bg-yellow-500",
    },
    {
      label: "Low",
      range: "<40",
      count: matches.filter((m) => m.match_score < 40).length,
      color: "bg-gray-300",
    },
  ];

  const topMatches = [...matches]
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, 5);

  const recentMatches = [...matches]
    .sort(
      (a, b) =>
        new Date(b.matched_at).getTime() - new Date(a.matched_at).getTime(),
    )
    .slice(0, 5);

  const upcomingInterviews = matches
    .filter((m) => m.status === "interview" && m.interview_date)
    .sort(
      (a, b) =>
        new Date(a.interview_date!).getTime() -
        new Date(b.interview_date!).getTime(),
    );

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
          <h1 className="text-xl font-medium">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview of your job search
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCVId}
            onChange={(e) => setSelectedCVId(Number(e.target.value))}
            className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
          >
            <option value={0}>All CVs</option>
            {cvs.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.file_name.replace(`.${cv.file_type}`, "")}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-300">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => navigate("/cvs")}
          className="text-left bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
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
            <p className="text-xs text-gray-500">CVs</p>
          </div>
          <p className="text-2xl font-semibold">{cvs.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {analyzedCvs} analyzed
          </p>
        </button>

        <button
          onClick={() => navigate("/jobs")}
          className="text-left bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Jobs</p>
          </div>
          <p className="text-2xl font-semibold">{jobs.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {new Set(jobs.map((j) => j.platform)).size} platforms
          </p>
        </button>

        <button
          onClick={() => navigate("/matches")}
          className="text-left bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-xs text-gray-500">Matches</p>
          </div>
          <p className="text-2xl font-semibold">{matches.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {matches.length > 0
              ? `avg ${Math.round(matches.reduce((s, m) => s + m.match_score, 0) / matches.length)}% score`
              : "no matches"}
          </p>
        </button>

        <button
          onClick={() => navigate("/cover-letters")}
          className="text-left bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
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
            </div>
            <p className="text-xs text-gray-500">Cover Letters</p>
          </div>
          <p className="text-2xl font-semibold">{coverLetters.length}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">letters generated</p>
        </button>
      </div>

      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Application pipeline
        </p>
        <div className="grid grid-cols-5 gap-2">
          {pipeline.map((step) => (
            <div
              key={step.label}
              className={`${step.bg} border ${step.border} rounded-xl p-3.5 text-center`}
            >
              <p className={`text-2xl font-semibold ${step.color}`}>
                {step.count}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Top matches</p>
            <button
              onClick={() => navigate("/matches")}
              className="text-[11px] text-blue-500 hover:text-blue-700 transition-colors"
            >
              View all →
            </button>
          </div>
          {topMatches.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No matches yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Start a scrape to find matches
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {topMatches.map((match) => {
                const job = jobs.find((j) => j.id === match.job_id);
                return (
                  <div
                    key={match.id}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                        match.match_score >= 80
                          ? "bg-green-50 text-green-700"
                          : match.match_score >= 60
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {match.match_score}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {job?.title ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {job?.company ?? ""}
                        {job?.location ? ` · ${job.location}` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full ${
                        match.status === "offer"
                          ? "bg-green-50 text-green-700"
                          : match.status === "interview"
                            ? "bg-purple-50 text-purple-600"
                            : match.status === "applied"
                              ? "bg-blue-50 text-blue-600"
                              : match.status === "rejected"
                                ? "bg-red-50 text-red-500"
                                : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {match.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">
              Score distribution
            </p>
          </div>
          <div className="p-4 space-y-3">
            {scoreDistribution.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-20">
                  <p className="text-xs font-medium text-gray-700">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-gray-400">{item.range}</p>
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all`}
                    style={{
                      width: `${matches.length > 0 ? (item.count / matches.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right font-medium">
                  {item.count}
                </span>
              </div>
            ))}
            {matches.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No data yet
              </p>
            )}
          </div>
        </div>

        {upcomingInterviews.length > 0 && (
          <div className="border border-purple-200 rounded-xl overflow-hidden bg-purple-50/30">
            <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
              <p className="text-sm font-medium text-purple-700">
                Upcoming interviews
              </p>
            </div>
            <div className="divide-y divide-purple-100">
              {upcomingInterviews.map((match) => {
                const job = jobs.find((j) => j.id === match.job_id);
                const date = new Date(match.interview_date!);
                const isToday =
                  date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={match.id}
                    className="px-4 py-3 flex items-center gap-3"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${
                        isToday
                          ? "bg-purple-600 text-white"
                          : "bg-white border border-purple-200 text-purple-600"
                      }`}
                    >
                      <span className="text-[10px] font-medium leading-none">
                        {date.toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold leading-none">
                        {date.getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {job?.title ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {job?.company ?? ""}
                      </p>
                    </div>
                    {isToday && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-medium">
                        Today
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">Recent matches</p>
          </div>
          {recentMatches.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">No activity yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentMatches.map((match) => {
                const job = jobs.find((j) => j.id === match.job_id);
                return (
                  <div
                    key={match.id}
                    className="px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {job?.title ?? "Unknown"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {job?.company ?? ""}
                      </p>
                    </div>
                    <span className="text-[11px] text-gray-300 whitespace-nowrap">
                      {new Date(match.matched_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
