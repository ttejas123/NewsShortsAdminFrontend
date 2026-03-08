import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { apiClient } from "../services/api";
import type { CreateRSSSourceRequest } from "../types/api";

export function RSSFeedSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);

  const [form, setForm] = useState({
    provider_name: "",
    rss_url: "",
    language_code: "en",
    fetch_interval_minutes: "30",
    is_active: true,
  });

  useEffect(() => {
    if (editId) {
      loadSource(editId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId]);

  const loadSource = async (id: string) => {
    try {
      setLoadingSource(true);
      const source = await apiClient.getRSSSourceById(id);
      setForm({
        provider_name: source.provider_name,
        rss_url: source.rss_url,
        language_code: source.language_code || "en",
        fetch_interval_minutes: String(source.fetch_interval_minutes || 30),
        is_active: source.is_active,
      });
    } catch (err: any) {
      console.error("Failed to load source:", err);
      alert(err.message || "Failed to load RSS source");
    } finally {
      setLoadingSource(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!form.provider_name.trim()) {
      alert("Please enter a provider name");
      return;
    }
    if (!form.rss_url.trim()) {
      alert("Please enter a RSS feed URL");
      return;
    }

    try {
      setLoading(true);
      
      const data: CreateRSSSourceRequest = {
        provider_name: form.provider_name.trim(),
        rss_url: form.rss_url.trim(),
        language_code: form.language_code,
        is_active: form.is_active,
        fetch_interval_minutes: Number.parseInt(form.fetch_interval_minutes, 10),
      };

      if (editId) {
        await apiClient.updateRSSSource(editId, data);
      } else {
        await apiClient.createRSSSource(data);
      }

      setSaved(true);
      setTimeout(() => {
        navigate("/rss/list");
      }, 1500);
    } catch (err: any) {
      console.error("Failed to save:", err);
      alert(err.message || "Failed to save RSS source");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed";
  const labelClass = "text-sm font-bold text-gray-800 whitespace-nowrap";

  if (loadingSource) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto" />
          <p className="text-gray-500 mt-4">Loading source...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 mb-1">
        Admin → RSS Feeds → {editId ? "Edit" : "Setup New"} RSS Feed
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle size={16} />
          <span className="text-sm">
            RSS Feed {editId ? "updated" : "created"} successfully!
          </span>
          <button onClick={() => setSaved(false)} className="ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mac-style Title bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-5 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            Admin - RSS Feeds ({editId ? "Edit" : "Setup New"} RSS Feed)
          </span>
        </div>

        <div className="p-8">
          <h1 className="text-gray-900 mb-6" style={{ fontStyle: "italic" }}>
            {editId ? "Edit RSS Feed" : "Setup new RSS feed"}
          </h1>

          {/* Form Fields */}
          <div className="space-y-4 mb-8">
            {/* Provider Name */}
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 180 }}>
                Provider Name: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Emarat Al Youm"
                value={form.provider_name}
                onChange={(e) => setForm({ ...form, provider_name: e.target.value })}
                className={`${inputClass} flex-1 max-w-md`}
                disabled={loading}
              />
            </div>

            {/* RSS Feed URL */}
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 180 }}>
                RSS Feed URL: <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/rss"
                value={form.rss_url}
                onChange={(e) => setForm({ ...form, rss_url: e.target.value })}
                className={`${inputClass} flex-1 max-w-md`}
                disabled={loading}
              />
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Language */}
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 180 }}>
                Language:
              </label>
              <select
                value={form.language_code}
                onChange={(e) => setForm({ ...form, language_code: e.target.value })}
                className={`${inputClass} w-48`}
                disabled={loading}
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
                <option value="ur">Urdu</option>
              </select>
            </div>

            {/* Fetch Interval */}
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 180 }}>
                Fetch Interval (minutes):
              </label>
              <select
                value={form.fetch_interval_minutes}
                onChange={(e) => setForm({ ...form, fetch_interval_minutes: e.target.value })}
                className={`${inputClass} w-48`}
                disabled={loading}
              >
                <option value="15">Every 15 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 1 hour</option>
                <option value="120">Every 2 hours</option>
                <option value="180">Every 3 hours</option>
                <option value="240">Every 4 hours</option>
                <option value="360">Every 6 hours</option>
                <option value="720">Every 12 hours</option>
                <option value="1440">Every 24 hours</option>
              </select>
            </div>

            <hr className="border-gray-200 my-6" />

            {/* Active Status */}
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 180 }}>
                Status:
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-indigo-600"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">
                  Active (Enable automatic fetching)
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate("/rss/list")}
              className="px-5 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {editId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editId ? "Update Feed" : "Create Feed"}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
