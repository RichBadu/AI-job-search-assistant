import Layout from "../components/layout";
import { useScrape } from "../hooks/UseScrape";

function ScrapePage() {
  const {
    cvs,
    selectedCVId,
    setSelectedCVId,
    locationBe,
    setLocationBe,
    locationAu,
    setLocationAu,
    scraping,
    result,
    error,
    loadingCvs,
    handleScrape,
    cancelScrape,
  } = useScrape();

  const canScrape =
    selectedCVId > 0 &&
    (locationBe.trim() !== "" || locationAu.trim() !== "") &&
    !scraping;

  if (loadingCvs) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-xl font-medium">Scrape Jobs</h1>
        <p className="text-sm text-gray-400 mt-1">
          Search for jobs based on your CV analysis
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
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
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
          </svg>
          <p className="text-sm text-gray-500 mb-1">No analyzed CVs</p>
          <p className="text-xs text-gray-400">
            Upload and analyze a CV on the CVs page first
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-700">
                Configuration
              </h2>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  CV
                </label>
                <select
                  value={selectedCVId}
                  onChange={(e) => setSelectedCVId(Number(e.target.value))}
                  className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
                >
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.file_name.replace(`.${cv.file_type}`, "")}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  Only analyzed CVs are shown
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  <span className="inline-flex items-center gap-1.5">
                    Belgium locations
                  </span>
                </label>
                <input
                  type="text"
                  value={locationBe}
                  onChange={(e) => setLocationBe(e.target.value)}
                  placeholder="antwerpen, gent, brussel"
                  className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Comma separated — leave empty to skip Belgium
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                  <span className="inline-flex items-center gap-1.5">
                    Australia locations
                  </span>
                </label>
                <input
                  type="text"
                  value={locationAu}
                  onChange={(e) => setLocationAu(e.target.value)}
                  placeholder="sydney, melbourne"
                  className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Comma separated — leave empty to skip Australia
                </p>
              </div>

              {scraping ? (
                <button
                  onClick={cancelScrape}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
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
                  Cancel scrape
                </button>
              ) : (
                <button
                  onClick={handleScrape}
                  disabled={!canScrape}
                  className="w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  Start scrape
                </button>
              )}

              {!scraping && !locationBe && !locationAu && (
                <p className="text-[11px] text-amber-500 text-center">
                  Enter at least one location to start
                </p>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-medium text-gray-700">Results</h2>
            </div>

            {result ? (
              <div className="p-5">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 rounded-lg p-3.5">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                      Scraped
                    </p>
                    <p className="text-2xl font-semibold mt-1">
                      {result.jobs_scraped}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3.5">
                    <p className="text-[11px] text-blue-500 uppercase tracking-wide">
                      New
                    </p>
                    <p className="text-2xl font-semibold text-blue-600 mt-1">
                      {result.jobs_new}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3.5">
                    <p className="text-[11px] text-green-500 uppercase tracking-wide">
                      Matches
                    </p>
                    <p className="text-2xl font-semibold text-green-600 mt-1">
                      {result.matches_created}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3.5">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                      Skipped
                    </p>
                    <p className="text-2xl font-semibold text-gray-400 mt-1">
                      {result.jobs_skipped}
                    </p>
                  </div>
                </div>

                {result.platform_stats && result.platform_stats.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      By platform
                    </p>
                    <div className="space-y-2">
                      {result.platform_stats.map((ps) => (
                        <div
                          key={ps.platform}
                          className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-xs font-medium text-gray-700 w-20">
                            {ps.platform}
                          </span>
                          <div className="flex-1 flex items-center gap-3 text-[11px] text-gray-500">
                            <span>{ps.jobs_scraped} scraped</span>
                            <span className="text-blue-600">
                              {ps.jobs_new} new
                            </span>
                            <span className="text-gray-400">
                              {ps.jobs_skipped} skipped
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Search terms used
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords_used.map((k, i) => (
                      <span
                        key={i}
                        className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[11px] text-gray-300">
                    Platforms: {result.platforms.join(", ")}
                  </p>
                </div>
              </div>
            ) : scraping ? (
              <div className="flex flex-col items-center justify-center py-16">
                <svg
                  className="w-8 h-8 animate-spin text-blue-500 mb-3"
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
                <p className="text-sm text-gray-500">Searching for jobs...</p>
                <p className="text-xs text-gray-400 mt-1">
                  This may take a few minutes
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <svg
                  className="w-10 h-10 text-gray-200 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
                  />
                </svg>
                <p className="text-sm text-gray-400">No results yet</p>
                <p className="text-xs text-gray-300 mt-1">
                  Start a scrape to search for jobs
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ScrapePage;
