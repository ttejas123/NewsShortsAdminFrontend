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

export function ArticleQueue() {
  const navigate = useNavigate();
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
      draft: "bg-gray-100 text-gray-700",
      review: "bg-amber-100 text-amber-700",
      scheduled: "bg-blue-100 text-blue-700",
      published: "bg-emerald-100 text-emerald-700",
    };
    return statusColors[status] || "bg-gray-100 text-gray-700";
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
      <div className="text-xs text-gray-400 mb-1">Admin → Articles → Queue</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Article Queue</h1>
          <p className="text-sm text-gray-500 mt-0.5">
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
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Error loading articles</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={loadArticles}
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
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="scheduled">Scheduled</option>
              </select>

              <button
                onClick={loadArticles}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <hr className="border-gray-200 mb-4" />

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
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selected.size === articles.length && articles.length > 0}
                      onChange={toggleAll}
                      className="accent-indigo-600 w-4 h-4"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Loading articles...</p>
                    </td>
                  </tr>
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                      No articles found
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr
                      key={article.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selected.has(article.id) ? "bg-indigo-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(article.id)}
                          onChange={() => toggleCheck(article.id)}
                          className="accent-indigo-600 w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <div className="font-medium line-clamp-2">{article.title}</div>
                        {article.subtitle && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-1">
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
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/articles/edit/${article.id}`)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit article"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handlePublish(article.id)}
                            className="text-green-500 hover:text-green-700 transition-colors"
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
                            className="text-red-500 hover:text-red-700 transition-colors"
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
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
