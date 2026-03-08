import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Edit3,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { DraftFeed, Feed } from "../types/api";

export function AdminPublished() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<{ Feed: Feed, DraftFeed: DraftFeed, published_at: string, createdAt: string, createdBy: string, draftId: string, feedId: string, id: string, updatedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchQuery]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getAdminPublished({
        page,
        limit,
        search: searchQuery || undefined,
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → Articles → Published (Admin)</div>

      <div className="mb-5">
        <h1 className="text-gray-900">Published Admin Articles</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Articles published from admin panel (currently live)
        </p>
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
          <span className="text-xs text-gray-500 ml-2">Published Admin Articles</span>
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
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              onClick={loadArticles}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-20">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-40">
                    Provider
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-32">
                    Published
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
                      {searchQuery ? "No articles match your search" : "No published articles yet"}
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => {
                    const coverImage = article.Feed.resources?.find(
                      (r) => r.name === "cover_image"
                    )?.url;
                    return (
                      <tr
                        key={article.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin-feeds/${article.DraftFeed.id}`)}
                      >
                        <td className="px-4 py-3">
                          {coverImage ? (
                            <img
                              src={coverImage}
                              alt={article.DraftFeed?.title || "N/A"}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <FileText size={20} className="text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="font-medium line-clamp-2">{article.DraftFeed?.title}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{article.Feed.Provider?.name || "N/A"}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(article.published_at)}
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
