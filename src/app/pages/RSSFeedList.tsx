import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  MoreVertical,
  Pause,
  Play,
  RefreshCw,
  Tag,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { RSSSource, DashboardSummary } from "../types/api";
import { useDebounce } from "../hook/useDebounce";

export function RSSFeedList() {
  const navigate = useNavigate();
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [analytics, setAnalytics] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const debouncedSearchTerm = useDebounce(search, 500);

  useEffect(() => {
    loadSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearchTerm, selectedTags]);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await apiClient.getDashboardSummary();
      setAnalytics(data);
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getRSSSources({
        page,
        limit,
        search: debouncedSearchTerm || undefined,
      });
      setSources(response.items);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
      
      // Extract unique tags from all sources - Not available in API
      setAvailableTags([]);
    } catch (err: any) {
      setError(err.message || "Failed to load RSS sources");
      console.error("Failed to load RSS sources:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Client-side filter by tags (you can also implement server-side)
  const filteredSources = selectedTags.length > 0 && sources.length > 0
    ? sources.filter((source) =>
        selectedTags.every((tag) => false) // Tags not available in API
      )
    : sources;

  const toggleAll = () => {
    if (selected.size === filteredSources.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredSources.map((s) => s.id)));
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.toggleRSSSourceStatus(id, !currentStatus);
      await loadSources();
      setOpenMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const deleteFeed = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RSS source?")) return;

    try {
      await apiClient.deleteRSSSource(id);
      await loadSources();
      await loadAnalytics();
      setOpenMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete RSS source");
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} RSS sources?`))
      return;

    try {
      await apiClient.deleteRSSSourcesBulk(Array.from(selected));
      setSelected(new Set());
      await loadSources();
      await loadAnalytics();
    } catch (err: any) {
      alert(err.message || "Failed to delete RSS sources");
    }
  };

  const triggerFetch = async (id: string) => {
    try {
      await apiClient.triggerFeedFetch(id);
      alert("Feed fetch triggered successfully!");
      setOpenMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to trigger feed fetch");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearch("");
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → RSS Feeds → Manage Sources</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">RSS Feed Sources</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage RSS sources and monitor feed analytics.
          </p>
        </div>
        <button
          onClick={() => navigate("/rss/setup")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add New Source
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))
        ) : analytics ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={16} className="text-indigo-500" />
                <p className="text-xs text-gray-500 font-medium">Total Feeds</p>
              </div>
              <p className="text-2xl text-gray-900 font-semibold">
                {analytics.total_feeds.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Fetched all time</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-emerald-500" />
                <p className="text-xs text-gray-500 font-medium">Active Sources</p>
              </div>
              <p className="text-2xl text-gray-900 font-semibold">
                {analytics.active_rss_sources}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                of {analytics.total_rss_sources} total
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-amber-500" />
                <p className="text-xs text-gray-500 font-medium">Cron Runs (24h)</p>
              </div>
              <p className="text-2xl text-gray-900 font-semibold">
                {analytics.recent_cron_runs_24h}
              </p>
              <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-blue-500" />
                <p className="text-xs text-gray-500 font-medium">Avg Engagement</p>
              </div>
              <p className="text-2xl text-gray-900 font-semibold">
                {Number.parseFloat(analytics.avg_engagement_score).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Score</p>
            </div>
          </>
        ) : null}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Error loading sources</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={loadSources}
            className="text-sm text-red-700 hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search sources by name or URL..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300"
              />
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{selected.size} selected</span>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            )}
            <button
              onClick={loadSources}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Filter by tags:</span>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Tag size={12} />
                  {tag}
                </button>
              ))}
              {(selectedTags.length > 0 || search) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-medium ml-2"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === sources.length && sources.length > 0}
                    onChange={toggleAll}
                    className="accent-indigo-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Source Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Language
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Feeds
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Last Fetched
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                    <p className="text-sm text-gray-500 mt-2">Loading sources...</p>
                  </td>
                </tr>
              ) : filteredSources.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    {selectedTags.length > 0 || search
                      ? "No sources found matching your filters"
                      : "No RSS sources yet. Add one to get started!"}
                  </td>
                </tr>
              ) : (
                filteredSources.map((source) => (
                  <tr
                    key={source.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      selected.has(source.id) ? "bg-indigo-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(source.id)}
                        onChange={() => toggleSelect(source.id)}
                        className="accent-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{source.provider_name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-64">
                        {source.rss_url}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {source.language_code || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">N/A</td>
                    <td className="px-4 py-3 text-gray-600">N/A</td>
                    <td className="px-4 py-3 text-gray-600">-</td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(source.last_fetched_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          source.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {source.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 relative">
                        <button
                          onClick={() => navigate(`/rss/setup?id=${source.id}`)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === source.id ? null : source.id)
                          }
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === source.id && (
                          <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => triggerFetch(source.id)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <RefreshCw size={14} /> Trigger Fetch
                            </button>
                            <button
                              onClick={() => toggleStatus(source.id, source.is_active)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              {source.is_active ? (
                                <>
                                  <Pause size={14} /> Pause Source
                                </>
                              ) : (
                                <>
                                  <Play size={14} /> Activate Source
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => deleteFeed(source.id)}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Source
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {filteredSources.length === 0 ? 0 : (page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} sources
            {selectedTags.length > 0 && ` (filtered by ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''})`}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded border transition-colors ${
                    page === pageNum
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
