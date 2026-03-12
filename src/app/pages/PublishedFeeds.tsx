import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Edit3,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Trash2,
  Filter,
  Clock,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { Feed } from "../types/api";
import { ArticlePreviewModal } from "../components/ArticlePreviewModal";
import { useTheme } from "../context/ThemeContext";

export function PublishedFeeds() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    lang: "",
    source: "", // rss-generated or admin-generated
    search: "",
  });
  
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewFeed, setPreviewFeed] = useState<Feed | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [recentFeeds, setRecentFeeds] = useState<any[]>([]);
  const limit = 20;

  // Dark mode helpers
  const dm = darkMode;
  const textTitle = dm ? "text-gray-100" : "text-gray-900";
  const textBody = dm ? "text-gray-300" : "text-gray-800";
  const textMuted = dm ? "text-gray-400" : "text-gray-500";
  const cardBg = dm ? "bg-gray-900 border-gray-700/80" : "bg-white border-gray-200";
  const borderCol = dm ? "border-gray-800" : "border-gray-100";
  const hoverBg = dm ? "hover:bg-gray-800/50" : "hover:bg-gray-50";
  const inputBg = dm ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900";
  const recentCardBg = dm ? "bg-gray-900/50 hover:bg-gray-800/80 border-gray-700/50" : "bg-white border-gray-200 hover:shadow-md";

  useEffect(() => {
    loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  useEffect(() => {
    loadRecentFeeds();
  }, []);

  const loadRecentFeeds = async () => {
    try {
      const feeds = await apiClient.getTopFeeds({ limit: 5 });
      setRecentFeeds(feeds);
    } catch (err) {
      console.error("Failed to load recent feeds:", err);
    }
  };

  const handleRecentFeedClick = async (feedId: string) => {
    try {
      const feed = await apiClient.getFeedById(feedId);
      setPreviewFeed(feed);
    } catch (err: any) {
      alert(err.message || "Failed to load feed preview");
    }
  };

  const loadFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate cursor from page (offset-based)
      const cursor = (page - 1) * limit;
      
      const response = await apiClient.getFeeds({
        limit,
        cursor,
        lang: filters.lang || undefined,
      });
      
      // Client-side filter by search and source
      let filtered = response.items;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.title.toLowerCase().includes(searchLower) ||
            f.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.source) {
        if (filters.source === "rss") {
          filtered = filtered.filter((f) => !f.admin_feed_id);
        } else if (filters.source === "admin") {
          filtered = filtered.filter((f) => f.admin_feed_id);
        }
      }
      
      setFeeds(filtered);
      setTotalCount(response.count);
      setTotalPages(Math.ceil(response.count / limit));
    } catch (err: any) {
      setError(err.message || "Failed to load feeds");
      console.error("Failed to load feeds:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheck = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === feeds.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(feeds.map((f) => f.id)));
    }
  };

  const handleBulkTakeDown = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Take down ${selected.size} feed(s)? They will be removed from live.`)) return;

    try {
      await Promise.all(
        Array.from(selected).map((id) => apiClient.takeDownFeed(id))
      );
      setSelected(new Set());
      await loadFeeds();
      alert("Feeds taken down successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to take down feeds");
    }
  };

  const handleTakeDown = async (id: string) => {
    if (!confirm("Take down this feed? It will be removed from live.")) return;

    try {
      await apiClient.takeDownFeed(id);
      await loadFeeds();
      alert("Feed taken down successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to take down feed");
    }
  };

  const getSourceBadge = (feed: Feed) => {
    if (feed.admin_feed_id) {
      return (
        <span className={`px-2 py-1 text-xs rounded-md font-medium ${
          dm ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-100 text-purple-700"
        }`}>
          Admin Generated
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-md font-medium ${
        dm ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-100 text-blue-700"
      }`}>
        RSS Generated
      </span>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours} hr ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const anyChecked = selected.size > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={`text-xs mb-1 ${textMuted}`}>Admin → Published Feeds (Client-Side)</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className={textTitle}>Published Feeds</h1>
          <p className={`text-sm mt-0.5 ${textMuted}`}>
            Manage all published feeds visible to users (RSS + Admin created)
          </p>
        </div>
      </div>

      {error && (
        <div className={`mb-6 border rounded-lg p-4 flex items-start gap-3 ${
          dm ? "bg-red-900/20 border-red-800/50" : "bg-red-50 border-red-200"
        }`}>
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className={`text-sm font-medium ${dm ? "text-red-400" : "text-red-800"}`}>Error loading feeds</p>
            <p className={`text-xs mt-1 ${dm ? "text-red-500/80" : "text-red-600"}`}>{error}</p>
          </div>
          <button
            onClick={loadFeeds}
            className={`text-sm font-medium ${dm ? "text-red-400 hover:text-red-300" : "text-red-700 hover:text-red-900"}`}
          >
            Retry
          </button>
        </div>
      )}

      {/* Top 5 Recent Feeds */}
      {recentFeeds.length > 0 && (
        <div className="mb-6">
          <h2 className={`text-sm font-semibold mb-3 ${textTitle}`}>Top 5 Recent Feeds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentFeeds.map((feed: any) => (
              <div 
                key={feed.id} 
                className={`rounded-xl border p-4 shadow-sm transition-all cursor-pointer flex flex-col h-full ${recentCardBg}`}
                onClick={() => handleRecentFeedClick(feed.id)}
              >
                <h3 className={`text-sm font-semibold line-clamp-2 mb-1 ${textTitle}`} title={feed.title}>{feed.title}</h3>
                <p className={`text-xs line-clamp-2 flex-grow mb-3 ${textMuted}`} title={feed.description || feed.subtitle || "No description available"}>
                  {feed.description || feed.subtitle || "No description available"}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  {feed.Language?.name ? (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      dm ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                    }`}>
                      {feed.Language?.name }
                    </span>
                  ) : (
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                      dm ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    }`}>
                      Unknown
                    </span>
                  )}
                  <span className={`text-[11px] flex items-center gap-1 shrink-0 ${textMuted}`}>
                    <Clock size={10} />
                    {formatTimeAgo(feed.published_at || feed.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`rounded-xl border shadow-sm overflow-hidden ${cardBg}`}>
        {/* Title bar */}
        <div className={`border-b px-5 py-2 flex items-center gap-2 ${dm ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
          </div>
          <span className={`text-xs ml-2 ${textMuted}`}>Published Feeds</span>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-5">
            <p className={`text-sm font-semibold mb-3 flex items-center gap-2 ${textTitle}`}>
              <Filter size={16} />
              Filters
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search feeds..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${inputBg}`}
                />
              </div>

              <select
                value={filters.lang}
                onChange={(e) => setFilters({ ...filters, lang: e.target.value })}
                className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${inputBg}`}
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>

              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${inputBg}`}
              >
                <option value="">All Sources</option>
                <option value="rss">RSS Generated</option>
                <option value="admin">Admin Generated</option>
              </select>

              <button
                onClick={loadFeeds}
                className={`p-2 rounded-lg transition-colors ${dm ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <hr className={`mb-4 ${dm ? "border-gray-800" : "border-gray-200"}`} />

          {/* Bulk Take Down button */}
          {anyChecked && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleBulkTakeDown}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
              >
                <Trash2 size={14} />
                Take Down ({selected.size})
              </button>
            </div>
          )}

          {/* Table */}
          <div className={`border rounded-lg overflow-hidden ${dm ? "border-gray-800" : "border-gray-200"}`}>
            <table className="w-full text-sm">
              <thead className={`border-b ${dm ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selected.size === feeds.length && feeds.length > 0}
                      onChange={toggleAll}
                      className="accent-indigo-600 w-4 h-4 rounded"
                    />
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-20 ${textMuted}`}>
                    Image
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${textMuted}`}>
                    Feed Title
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-40 ${textMuted}`}>
                    Provider
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-40 ${textMuted}`}>
                    Source Type
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-32 ${textMuted}`}>
                    Published
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-32 ${textMuted}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dm ? "divide-gray-800" : "divide-gray-100"}`}>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                      <p className={`text-sm mt-2 ${textMuted}`}>Loading feeds...</p>
                    </td>
                  </tr>
                ) : feeds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-12 text-center ${textMuted}`}>
                      No published feeds found
                    </td>
                  </tr>
                ) : (
                  feeds.map((feed) => {
                    const coverImage = feed.resources?.find(
                      (r) => r.name === "cover_image"
                    )?.url;
                    return (
                      <tr
                        key={feed.id}
                        className={`transition-colors cursor-pointer ${
                          selected.has(feed.id)
                            ? dm ? "bg-indigo-900/20" : "bg-indigo-50"
                            : hoverBg
                        }`}
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest("input, button")) return;
                          setPreviewFeed(feed);
                        }}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(feed.id)}
                            onChange={() => toggleCheck(feed.id)}
                            className="accent-indigo-600 w-4 h-4 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={feed.title}
                              className="w-12 h-12 object-cover rounded shadow-sm"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded flex items-center justify-center ${dm ? "bg-gray-800" : "bg-gray-200"}`}>
                              <FileText size={20} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-medium line-clamp-2 ${textTitle}`}>{feed.title}</div>
                        </td>
                        <td className={`px-4 py-3 ${textBody}`}>{feed.provider?.name}</td>
                        <td className="px-4 py-3">{getSourceBadge(feed)}</td>
                        <td className={`px-4 py-3 ${textMuted}`}>
                          {formatDate(feed.published_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/feeds/edit/${feed.id}`);
                              }}
                              className="text-blue-500 hover:text-blue-400 transition-colors"
                              title="Edit feed"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTakeDown(feed.id);
                              }}
                              className="text-red-500 hover:text-red-400 transition-colors"
                              title="Take down feed"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className={`text-sm ${textMuted}`}>
                Page {page} of {totalPages} ({totalCount} total feeds)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    dm ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    dm ? "border-gray-700 hover:bg-gray-800" : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {!loading && feeds.length > 0 && totalPages === 1 && (
            <div className="flex justify-center mt-4">
              <p className={`text-sm ${textMuted}`}>{totalCount} total feeds</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <ArticlePreviewModal
        feed={previewFeed}
        isOpen={!!previewFeed}
        onClose={() => setPreviewFeed(null)}
        onEdit={(id) => {
          setPreviewFeed(null);
          navigate(`/feeds/edit/${id}`);
        }}
      />
    </div>
  );
}
