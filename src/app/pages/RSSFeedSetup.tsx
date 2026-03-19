import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { apiClient } from "../services/api";
import type { CreateRSSSourceRequest } from "../types/api";
import { useTheme } from "../context/ThemeContext";

export function RSSFeedSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { darkMode } = useTheme();
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
    extractor_js: "",
  });

  const EXTRACTOR_TEMPLATE = `(item) => {
  const providerName = "${form.provider_name || "News Provider"}";

  function extractAuthor(author) {
    if (!author) return "Unknown Author";

    return author
      .replace(/إعداد:\\s*/g, "")
      .replace(/وكالات/g, "Agencies")
      .trim();
  }

  function extractCategory(categories, link) {
    if (categories && categories.length > 0) {
      // skip weird ad category like "/"
      const cleanCategory = categories.find(c => !c.startsWith("/"));
      return cleanCategory || categories[0];
    }

    try {
      const parts = new URL(link).pathname.split("/");
      return parts[2] || "World";
    } catch {
      return "World";
    }
  }

  function extractSubCategory(categories) {
    if (!categories || categories.length < 2) return "";

    const valid = categories.filter(c => !c.startsWith("/"));
    return valid[1] || "";
  }

  return {
    id: item.guid || item.link,

    title: item.title || "",
    subtitle: extractSubCategory(item.categories),

    description: item.contentSnippet || "",

    slug: item.link?.split("/").pop() || "",

    provider: {
      id: "provider-id",
      name: providerName,
      type: "News",
      subType: "News"
    },

    published_at: item.isoDate || item.pubDate,

    is_featured: false,
    engagement_score: 0,

    html: item.content || item["content:encoded"] || "",

    layout: "standardCard",

    web_url: item.link,

    author: {
      id: 1,
      name: extractAuthor(item["dc:creator"] || item.creator),
      bio: "",
      profile_picture: ""
    },

    source: {
      id: 1,
      name: providerName,
      website: item.link
    },

    category: {
      id: 1,
      name: extractCategory(item.categories, item.link),
      description: ""
    },

    tags: (item.categories || []).filter(c => !c.startsWith("/")),

    language: {
      id: 2,
      name: "Arabic",
      code: "ar"
    },

    region: {
      id: 1,
      name: "Middle East",
      code: "me"
    },

    status: {
      id: 1,
      name: "PENDING",
      description: "Awaiting AI enrichment"
    },

    resources:
      item.enclosure?.url
        ? [
            {
              id: 1,
              name: "cover_image",
              url: item.enclosure.url,
              content_type: {
                id: 1,
                name: "story",
                description: "Text-based story"
              }
            }
          ]
        : [],

    sentiment: null,

    entities: []
  };
}`;

  // Dark mode helpers
  const dm = darkMode;
  const textTitle = dm ? "text-gray-100" : "text-gray-900";
  const textBody = dm ? "text-gray-300" : "text-gray-700";
  const textMuted = dm ? "text-gray-400" : "text-gray-500";
  const cardBg = dm ? "bg-gray-900 border-gray-700/80" : "bg-white border-gray-200";
  const headerBg = dm ? "bg-gray-800/60 border-gray-700/50" : "bg-gray-100 border-gray-200";
  const inputBg = dm ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900";

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
        extractor_js: source.extractor_js || "",
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
        extractor_js: form.extractor_js.trim() || undefined,
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

  const inputClass = `border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${inputBg}`;
  const labelClass = `text-sm font-bold whitespace-nowrap ${textTitle}`;

  if (loadingSource) {
    return (
      <div className={`p-6 max-w-4xl mx-auto min-h-screen ${dm ? "bg-gray-950" : ""}`}>
        <div className={`rounded-xl border shadow-sm p-12 text-center ${cardBg}`}>
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto" />
          <p className={`mt-4 ${textMuted}`}>Loading source...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-4xl mx-auto min-h-screen transition-colors duration-200 ${dm ? "bg-gray-950" : ""}`}>
      {/* Breadcrumb */}
      <div className={`text-xs mb-1 ${textMuted}`}>
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

      <div className={`rounded-xl border shadow-sm overflow-hidden ${cardBg}`}>
        {/* Mac-style Title bar */}
        <div className={`${headerBg} border-b px-5 py-2 flex items-center gap-2`}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
          </div>
          <span className={`text-xs ml-2 ${textMuted}`}>
            Admin - RSS Feeds ({editId ? "Edit" : "Setup New"} RSS Feed)
          </span>
        </div>

        <div className="p-8">
          <h1 className={`${textTitle} mb-6`} style={{ fontStyle: "italic" }}>
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

            <hr className={`my-6 ${dm ? "border-gray-800" : "border-gray-100"}`} />

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

            <hr className={`my-6 ${dm ? "border-gray-800" : "border-gray-100"}`} />

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
                  className="w-4 h-4 accent-indigo-600 rounded"
                  disabled={loading}
                />
                <span className={`text-sm ${textBody}`}>
                  Active (Enable automatic fetching)
                </span>
              </label>
            </div>

            <hr className={`my-6 ${dm ? "border-gray-800" : "border-gray-100"}`} />

            {/* Extractor JS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelClass}>
                  JavaScript Extractor (extractor_js):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Reset to default template? This will overwrite your changes.")) {
                      setForm({ ...form, extractor_js: EXTRACTOR_TEMPLATE });
                    }
                  }}
                  className="text-xs text-indigo-500 hover:text-indigo-400 font-medium"
                >
                  Use Template
                </button>
              </div>
              <p className={`text-xs ${textMuted}`}>
                Define a function that takes an <code>item</code> (from the RSS parser) and returns a <code>Feed</code> object.
              </p>
              <textarea
                value={form.extractor_js}
                onChange={(e) => setForm({ ...form, extractor_js: e.target.value })}
                placeholder={EXTRACTOR_TEMPLATE}
                className={`${inputBg} w-full min-h-[400px] p-4 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-y`}
                spellCheck={false}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`flex justify-end gap-3 pt-4 border-t ${dm ? "border-gray-800" : "border-gray-200"}`}>
            <button
              onClick={() => navigate("/rss/list")}
              className={`px-5 py-2 text-sm border rounded-lg transition-colors ${
                dm ? "border-gray-700 text-gray-300 hover:bg-gray-800" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
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
