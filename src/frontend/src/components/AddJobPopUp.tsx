import { useState } from "react";
import { type JobCreate } from "../types/index";

interface Props {
  onClose: () => void;
  onSubmit: (job: JobCreate) => Promise<void>;
}

function AddJobPopUp({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<JobCreate>({
    title: "",
    company: "",
    location: null,
    description: null,
    requirements: null,
    job_type: null,
    work_location_type: "none",
    url: "",
    platform: "manual",
    posted_date: null,
    min_years_experience: null,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!form.title || !form.company || !form.url) return;
    try {
      setSubmitting(true);
      await onSubmit(form);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-[560px] max-w-[90vw] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-sm font-medium text-gray-900">
              Add job manually
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              fields with * are required
            </p>
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

        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
              placeholder="e.g. .NET Developer"
            />
          </div>

          {/* Company + URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Company *
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
                placeholder="e.g. Bimona"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                URL *
              </label>
              <input
                type="text"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Location + Work location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Location
              </label>
              <input
                type="text"
                value={form.location ?? ""}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value || null })
                }
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
                placeholder="e.g. Antwerp"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Work location
              </label>
              <select
                value={form.work_location_type ?? "none"}
                onChange={(e) =>
                  setForm({ ...form, work_location_type: e.target.value })
                }
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
              >
                <option value="none">Unknown</option>
                <option value="on-site">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Job type
              </label>
              <select
                value={form.job_type ?? ""}
                onChange={(e) =>
                  setForm({ ...form, job_type: e.target.value || null })
                }
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
              >
                <option value="">Unknown</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1.5 block">
                Min years experience
              </label>
              <input
                type="number"
                value={form.min_years_experience ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    min_years_experience: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors"
                placeholder="e.g. 2"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value || null })
              }
              className="text-sm px-3 py-2 border border-gray-200 rounded-lg w-full focus:border-blue-300 focus:ring-1 focus:ring-blue-100 outline-none transition-colors resize-none"
              rows={3}
              placeholder="Job description..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-2 rounded-b-xl">
          <button
            onClick={handleSubmit}
            disabled={submitting || !form.title || !form.company || !form.url}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? (
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
                Saving...
              </>
            ) : (
              "Save job"
            )}
          </button>
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddJobPopUp;
