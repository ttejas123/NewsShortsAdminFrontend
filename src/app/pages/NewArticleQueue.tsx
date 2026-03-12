import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Edit3,
  Plus,
  Search,
  RefreshCw,
  Archive,
  Loader2,
  AlertCircle,
  FileText,
  Activity,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { Feed, ProcessingStats, TodayStats } from "../types/api";
import { ArticlePreviewModal } from "../components/ArticlePreviewModal";

export function NewArticleQueue() {
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [processingStats, setProcessingStats] = useState<ProcessingStats[]>([]);
  
  const [filters, setFilters] = useState({
    lang: "",
    status: "",
    search: "",
  });
  
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previewFeed, setPreviewFeed] = useState<Feed | null>(null);
  const [cursor, setCursor] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  useEffect(() => {
    loadFeeds();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadAnalytics = async () => {
    try {
      const [today, stats] = await Promise.all([
        apiClient.getTodayStats(),
        apiClient.getProcessingStats(),
      ]);
      setTodayStats(today);
      setProcessingStats(stats);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
  };

  const loadFeeds = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getFeeds({
        limit,
        cursor,
        lang: filters.lang || undefined,
      });
      
      // Client-side filter by status and search
      let filtered = response.items;
      if (filters.status) {
        filtered = filtered.filter((f) => f.status.name === filters.status);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.title.toLowerCase().includes(searchLower) ||
            f.description.toLowerCase().includes(searchLower)
        );
      }
      
      setFeeds(filtered);
      setHasMore(response.has_more);
      if (response.cursor) {
        setCursor(response.cursor);
      }
    } catch (err: any) {
      setError(err.error || "Failed to load feeds");
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

  const handleBulkArchive = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Archive ${selected.size} article(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selected).map((id) => apiClient.softDeleteFeed(id))
      );
      setSelected(new Set());
      await loadFeeds();
      alert("Articles archived successfully!");
    } catch (err: any) {
      alert(err.error || "Failed to archive articles");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-700";
      case "PROCESSING":
        return "bg-amber-100 text-amber-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      case "PREVIEW":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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

  const anyChecked = selected.size > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → Articles → New Article Queue</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Article Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage and review articles from RSS feeds
          </p>
        </div>
        <button
          onClick={() => navigate("/articles/edit")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {todayStats && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-indigo-500" />
              <p className="text-xs text-gray-500 font-medium">Today's Articles</p>
            </div>
            <p className="text-2xl text-gray-900 font-semibold">{todayStats.today}</p>
            <p className={`text-xs mt-1 ${todayStats.trend === "up" ? "text-emerald-600" : "text-red-600"}`}>
              {todayStats.percentageChange} vs yesterday
            </p>
          </div>
        )}

        {processingStats.map((stat, idx) => (
          <div key={stat.status} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={16} className="text-amber-500" />
              <p className="text-xs text-gray-500 font-medium">{stat.status}</p>
            </div>
            <p className="text-2xl text-gray-900 font-semibold">{stat.count}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.last_24h} in last 24h</p>
          </div>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Error loading articles</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={loadFeeds}
            className="text-sm text-red-700 hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Title bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-5 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">Article Queue</span>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Filters</p>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>

              <select
                value={filters.lang}
                onChange={(e) => setFilters({ ...filters, lang: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
              >
                <option value="">All Status</option>
                <option value="PREVIEW">PREVIEW</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="FAILED">FAILED</option>
              </select>

              <button
                onClick={loadFeeds}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* Archive button */}
          {anyChecked && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleBulkArchive}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Archive size={14} />
                Archive ({selected.size})
              </button>
            </div>
          )}

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selected.size === feeds.length && feeds.length > 0}
                      onChange={toggleAll}
                      className="accent-indigo-600 w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-20">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Article Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-40">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">
                    Published
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-20">
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Loading articles...</p>
                    </td>
                  </tr>
                ) : feeds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No articles found
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
                        className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                          selected.has(feed.id) ? "bg-indigo-50" : ""
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
                            className="accent-indigo-600 w-4 h-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={feed.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <FileText size={20} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="font-medium line-clamp-2">{feed.title}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{feed.Provider?.name || "N/A"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              feed.status.name
                            )}`}
                          >
                            {feed.status.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(feed.published_at)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/articles/edit/${feed.id}`);
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit article"
                          >
                            <Edit3 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {hasMore && !loading && feeds.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={loadFeeds}
                className="px-4 py-2 text-sm text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Load More
              </button>
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
          navigate(`/articles/edit/${id}`);
        }}
      />
    </div>
  );
}
