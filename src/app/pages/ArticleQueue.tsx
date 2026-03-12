import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Edit3,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
  Send,
  Trash2,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { DraftFeed } from "../types/api";
import { useTheme } from "../context/ThemeContext";

export function ArticleQueue() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [articles, setArticles] = useState<DraftFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    status: "" as "" | "draft" | "review" | "scheduled",
    search: "",
  });
  
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
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAdminQueue({
        page,
        limit,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      
      setArticles(response.items);
      setTotalPages(response.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to load articles");
      console.error("Failed to load articles:", err);
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
    if (selected.size === articles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(articles.map((a) => a.id)));
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm("Publish this article? It will go live immediately.")) return;

    try {
      await apiClient.publishDraft(id, new Date().toISOString()); // Replace with actual user ID
      alert("Article published successfully!");
      await loadArticles();
    } catch (err: any) {
      alert(err.message || "Failed to publish article");
    }
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} article(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selected).map((id) => apiClient.deleteDraft(id))
      );
      setSelected(new Set());
      await loadArticles();
      alert("Articles deleted successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to delete articles");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      draft: dm ? "bg-gray-800 text-gray-400 border border-gray-700" : "bg-gray-100 text-gray-700",
      review: dm ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-100 text-amber-700",
      scheduled: dm ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-100 text-blue-700",
      published: dm ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-100 text-emerald-700",
    };
    return statusColors[status] || (dm ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-700");
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
      <div className={`text-xs mb-1 ${textMuted}`}>Admin → Articles → Queue</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className={textTitle}>Article Queue</h1>
          <p className={`text-sm mt-0.5 ${textMuted}`}>
            Manage admin-created articles (drafts, reviews, scheduled)
          </p>
        </div>
        <button
          onClick={() => navigate("/articles/new")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      {error && (
        <div className={`mb-6 border rounded-lg p-4 flex items-start gap-3 ${
          dm ? "bg-red-900/20 border-red-800/50" : "bg-red-50 border-red-200"
        }`}>
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className={`text-sm font-medium ${dm ? "text-red-400" : "text-red-800"}`}>Error loading articles</p>
            <p className={`text-xs mt-1 ${dm ? "text-red-500/80" : "text-red-600"}`}>{error}</p>
          </div>
          <button
            onClick={loadArticles}
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
          <span className={`text-xs ml-2 ${textMuted}`}>Article Queue</span>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="mb-5">
            <p className={`text-sm font-semibold mb-3 ${textTitle}`}>Filters</p>
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
                  className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${inputBg}`}
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${inputBg}`}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
              </select>

              <button
                onClick={loadArticles}
                className={`p-2 rounded-lg transition-colors ${dm ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <hr className={`mb-4 ${dm ? "border-gray-800" : "border-gray-200"}`} />

          {/* Bulk Actions */}
          {anyChecked && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
                Delete ({selected.size})
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
                      checked={selected.size === articles.length && articles.length > 0}
                      onChange={toggleAll}
                      className="accent-indigo-600 w-4 h-4 rounded"
                    />
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${textMuted}`}>
                    Title
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-32 ${textMuted}`}>
                    Status
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-32 ${textMuted}`}>
                    Created
                  </th>
                  <th className={`px-4 py-3 text-left text-xs font-semibold uppercase w-40 ${textMuted}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dm ? "divide-gray-800" : "divide-gray-100"}`}>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                      <p className={`text-sm mt-2 ${textMuted}`}>Loading articles...</p>
                    </td>
                  </tr>
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-4 py-12 text-center ${textMuted}`}>
                      No articles found
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr
                      key={article.id}
                      className={`transition-colors ${
                        selected.has(article.id)
                          ? dm ? "bg-indigo-900/20" : "bg-indigo-50"
                          : hoverBg
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(article.id)}
                          onChange={() => toggleCheck(article.id)}
                          className="accent-indigo-600 w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-medium line-clamp-2 ${textTitle}`}>{article.title}</div>
                        {article.subtitle && (
                          <div className={`text-xs mt-1 line-clamp-1 ${textMuted}`}>
                            {article.subtitle}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                            article.status || "draft"
                          )}`}
                        >
                          {article.status || "draft"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${textMuted}`}>
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/articles/edit/${article.id}`)}
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                            title="Edit article"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handlePublish(article.id)}
                            className="text-emerald-500 hover:text-emerald-400 transition-colors"
                            title="Publish (Go Live)"
                          >
                            <Send size={18} />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm("Delete this article?")) {
                                try {
                                  await apiClient.deleteDraft(article.id);
                                  await loadArticles();
                                  alert("Article deleted!");
                                } catch (err: any) {
                                  alert(err.message || "Failed to delete");
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-400 transition-colors"
                            title="Delete article"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
