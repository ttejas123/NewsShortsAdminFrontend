import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Archive as ArchiveIcon,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { Feed } from "../types/api";
import { useTheme } from "../context/ThemeContext";

export function TakenDownFeeds() {
  const { darkMode } = useTheme();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

  useEffect(() => {
    loadFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getTakenDownFeeds({
        page,
        limit,
        search: searchQuery || undefined,
      });
      
      setFeeds(response.items);
      setTotalPages(response.pagination.totalPages);
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

  const handleBulkRestore = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Restore ${selected.size} feed(s)? They will be visible to users again.`)) return;

    try {
      await Promise.all(
        Array.from(selected).map((id) => apiClient.restoreClientFeed(id))
      );
      setSelected(new Set());
      await loadFeeds();
      alert("Feeds restored successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to restore feeds");
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm("Restore this feed? It will be visible to users again.")) return;

    try {
      await apiClient.restoreClientFeed(id);
      alert("Feed restored successfully!");
      await loadFeeds();
    } catch (err: any) {
      alert(err.message || "Failed to restore feed");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getSourceBadge = (feed: Feed) => {
    if (feed.admin_feed_id) {
      return (
        <span className={`px-2 py-1 text-xs rounded-md font-medium ${
          dm ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-100 text-purple-700"
        }`}>
          Admin
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-md font-medium ${
        dm ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-100 text-blue-700"
      }`}>
        RSS
      </span>
    );
  };

  const anyChecked = selected.size > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={`text-xs mb-1 ${textMuted}`}>Admin → Published Articles → Taken Down</div>

      <div className="mb-5">
        <h1 className={textTitle}>Taken Down Feeds</h1>
        <p className={`text-sm mt-0.5 ${textMuted}`}>
          Feeds removed from client view (can be restored)
        </p>
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

      <div className={`rounded-xl border shadow-sm overflow-hidden ${cardBg}`}>
        {/* Title bar */}
        <div className={`border-b px-5 py-2 flex items-center gap-2 ${dm ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
          </div>
          <span className={`text-xs ml-2 ${textMuted}`}>Taken Down Feeds</span>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search feeds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${inputBg}`}
              />
            </div>
            <button
              onClick={loadFeeds}
              className={`p-2 rounded-lg transition-colors ${dm ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <hr className={`mb-4 ${dm ? "border-gray-800" : "border-gray-200"}`} />

          {/* Bulk Restore */}
          {anyChecked && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleBulkRestore}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
              >
                <RotateCcw size={14} />
                Restore ({selected.size})
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
                    Title
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-32 ${textMuted}`}>
                    Source
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-32 ${textMuted}`}>
                    Taken Down
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-24 ${textMuted}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dm ? "divide-gray-800" : "divide-gray-100"}`}>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Loading feeds...</p>
                    </td>
                  </tr>
                ) : feeds.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <ArchiveIcon size={32} className={`mx-auto mb-2 ${dm ? "text-gray-700" : "text-gray-300"}`} />
                      <p className={textMuted}>
                        {searchQuery ? "No feeds match your search" : "No taken down feeds"}
                      </p>
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
                        className={`transition-colors ${
                          selected.has(feed.id)
                            ? dm ? "bg-indigo-900/20" : "bg-indigo-50"
                            : hoverBg
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selected.has(feed.id)}
                            onChange={() => toggleCheck(feed.id)}
                            className="accent-indigo-600 w-4 h-4 rounded"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={feed.title}
                              className="w-12 h-12 object-cover rounded opacity-50"
                            />
                          ) : (
                            <div className={`w-12 h-12 rounded flex items-center justify-center opacity-50 ${dm ? "bg-gray-800" : "bg-gray-200"}`}>
                              <FileText size={20} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-medium line-clamp-2 ${textTitle}`}>{feed.title}</div>
                        </td>
                        <td className="px-4 py-3">{getSourceBadge(feed)}</td>
                        <td className={`px-4 py-3 ${textMuted}`}>
                          {formatDate(feed.deleted_at || undefined)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleRestore(feed.id)}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors text-xs font-medium"
                            title="Restore feed"
                          >
                            <RotateCcw size={14} />
                            Restore
                          </button>
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
                Page {page} of {totalPages}
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
        </div>
      </div>
    </div>
  );
}
