import { useState, useMemo } from "react";
import Layout from "../components/layout";
import { useJobs } from "../hooks/UseJobs";
import AddJobPopUp from "../components/AddJobPopUp";

function JobsPage() {
  const { jobs, loading, error, handleCleanup, handleCreate, handleDelete } =
    useJobs();
  const [platformFilter, setPlatformFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddJob, setShowAddJob] = useState(false);

  const platforms = useMemo(() => {
    const set = new Set(jobs.map((j) => j.platform));
    return Array.from(set).sort();
  }, [jobs]);

  const filteredJobs = jobs
    .filter((j) => platformFilter === "all" || j.platform === platformFilter)
    .filter(
      (j) =>
        locationFilter === "all" || j.work_location_type === locationFilter,
    )
    .filter((j) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        (j.location?.toLowerCase().includes(q) ?? false)
      );
    });

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
          <h1 className="text-xl font-medium">Jobs</h1>
          <p className="text-sm text-gray-400 mt-1">{jobs.length} jobs found</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddJob(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
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
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add job
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete jobs older than 7 days? Related matches will also be deleted.",
                )
              ) {
                handleCleanup(7);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
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
            Cleanup
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, company or location..."
            className="text-sm pl-9 pr-3 py-2 border border-gray-200 rounded-lg w-full"
          />
        </div>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg"
        >
          <option value="all">All platforms</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg"
        >
          <option value="all">All locations</option>
          <option value="on-site">On-site</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {jobs.length === 0 ? (
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
              d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-gray-500 mb-1">No jobs yet</p>
          <p className="text-xs text-gray-400">
            Start a scrape or add a job manually
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="border border-gray-200 rounded-xl py-12 text-center">
          <p className="text-sm text-gray-500 mb-1">No jobs found</p>
          <p className="text-xs text-gray-400">
            Try a different search term or filter
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
            {filteredJobs.length} {filteredJobs.length === 1 ? "job" : "jobs"}
          </p>

          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Platform icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      job.platform === "manual"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {job.platform === "manual" ? (
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    ) : (
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
                          d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <a
                      href={job.url}
                      target="_blank"
                      className="text-sm font-medium hover:text-blue-600 transition-colors truncate block"
                    >
                      {job.title}
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {job.company}
                      {job.location && ` · ${job.location}`}
                    </p>
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {job.platform}
                  </span>

                  {job.work_location_type &&
                    job.work_location_type !== "none" && (
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full ${
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

                  {job.job_type && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {job.job_type}
                    </span>
                  )}

                  {job.min_years_experience != null && (
                    <span className="text-xs text-gray-400">
                      {job.min_years_experience}y exp
                    </span>
                  )}

                  <span className="text-xs text-gray-300">
                    {new Date(job.scraped_at).toLocaleDateString("en-GB")}
                  </span>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete "${job.title}"? Related matches and cover letters will also be deleted.`,
                        )
                      ) {
                        handleDelete(job.id);
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
            ))}
          </div>
        </>
      )}

      {showAddJob && (
        <AddJobPopUp
          onClose={() => setShowAddJob(false)}
          onSubmit={handleCreate}
        />
      )}
    </Layout>
  );
}

export default JobsPage;
