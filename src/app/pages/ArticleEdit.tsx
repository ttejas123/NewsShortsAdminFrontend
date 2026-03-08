import React,{ useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  Trash2,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { Feed } from "../types/api";

export function ArticleEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    html: "",
    slug: "",
    provider_id: "",
    provider_name: "",
    published_at: "",
    is_featured: false,
    engagement_score: 0,
    layout: "standardCard",
    web_url: "",
    author_name: "",
    category_name: "",
    language_code: "en",
    region_name: "Universal",
    cover_image_url: "",
  });

  useEffect(() => {
    if (isEdit) {
      loadFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const feed = await apiClient.getAdminFeedById(id!);
      setFormData({
        title: feed.title,
        subtitle: feed.subtitle || "",
        description: feed.description,
        html: feed.html || "",
        slug: feed.slug,
        provider_id: feed.Provider?.id || "",
        provider_name: feed.Provider?.name || "",
        published_at: feed.published_at || "",
        is_featured: feed.is_featured,
        engagement_score: feed.engagement_score,
        layout: feed.layout,
        web_url: feed.web_url || "",
        author_name: feed.Author?.name || "",
        category_name: feed.Category?.name || "",
        language_code: feed.Language?.code || "",
        region_name: feed.Region?.name || "",
        cover_image_url: feed.resources?.find((r) => r.name === "cover_image")?.url || "",
      });
    } catch (err: any) {
      setError(err.message || "Failed to load article");
      console.error("Failed to load article:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const draftData = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        html: formData.html,
        slug: formData.slug,
        provider_name: formData.provider_name,
        published_at: formData.published_at,
        is_featured: formData.is_featured,
        engagement_score: formData.engagement_score,
        layout: formData.layout as "standardCard" | "photoDominant" | "textDominant" | "gallery",
        web_url: formData.web_url,
        author_name: formData.author_name,
        category_name: formData.category_name,
        language_code: formData.language_code,
        region_name: formData.region_name,
        cover_image_url: formData.cover_image_url,
      };

      if (isEdit) {
        // Check if this is an admin feed or client feed from path
        const isAdminFeed = window.location.pathname.includes("/admin-feeds/");
        
        if (isAdminFeed) {
          // Update in admin_feeds table using admin endpoint
          await apiClient.updateAdminFeed(id!, draftData as any);
        } else {
          // Update draft
          await apiClient.updateDraft(id!, draftData);
        }
        alert("Article updated successfully!");
      } else {
        // Create new draft
        await apiClient.createDraft(draftData);
        alert("Article created successfully!");
      }
      
      navigate("/articles/queue");
    } catch (err: any) {
      setError(err.message || "Failed to save article");
      alert(err.message || "Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm("Are you sure you want to archive this article?")) return;

    try {
      await apiClient.softDeleteFeed(id!);
      alert("Article archived successfully!");
      navigate("/articles/queue");
    } catch (err: any) {
      alert(err.message || "Failed to archive article");
    }
  };

  const handlePreview = () => {
    navigate(`/articles/preview/${id}`);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">
        Admin → Articles → {isEdit ? "Edit" : "Create"} Article
      </div>

      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/articles/queue")}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-gray-900">{isEdit ? "Edit Article" : "Create Article"}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {isEdit ? "Update article details" : "Add a new article"}
            </p>
          </div>
        </div>

        {isEdit && (
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye size={16} />
            Preview
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Editor (2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Title bar */}
              <div className="bg-gray-100 border-b border-gray-200 px-5 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">Article Editor</span>
              </div>

              <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="Enter article title"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="Enter subtitle (optional)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400 resize-none"
                  placeholder="Enter article description"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Content (HTML)
                </label>
                <textarea
                  value={formData.html}
                  onChange={(e) => setFormData({ ...formData, html: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400 font-mono resize-none"
                  placeholder="Enter article HTML content"
                />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Metadata */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={formData.provider_name}
                  onChange={(e) =>
                    setFormData({ ...formData, provider_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="e.g., BBC News"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) =>
                    setFormData({ ...formData, author_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="e.g., John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category_name}
                  onChange={(e) =>
                    setFormData({ ...formData, category_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="e.g., Technology"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Language
                </label>
                <select
                  value={formData.language_code}
                  onChange={(e) =>
                    setFormData({ ...formData, language_code: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>

                  

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Engagement Score
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.engagement_score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      engagement_score: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="article-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Published At
                </label>
                <input
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) =>
                    setFormData({ ...formData, published_at: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Web URL
                </label>
                <input
                  type="url"
                  value={formData.web_url}
                  onChange={(e) => setFormData({ ...formData, web_url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="https://example.com/article"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formData.cover_image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, cover_image_url: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-400"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="accent-indigo-600 w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm text-gray-700">
                  Featured Article
                </label>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/articles/queue")}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Article
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Preview (1 column) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
              {/* Title bar */}
              <div className="bg-gray-100 border-b border-gray-200 px-5 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">
                  <Eye size={12} className="inline mr-1" />
                  Mobile Preview
                </span>
              </div>

              <div className="p-6 flex justify-center">
                <div
                  className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl"
                  style={{ width: 280 }}
                >
                  {/* Status bar */}
                  <div className="bg-gray-800 rounded-t-[2rem] px-5 py-1.5 flex items-center justify-between">
                    <span className="text-white text-[10px]">3:49 PM</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1.5 bg-white rounded-sm opacity-60"></div>
                      <div className="w-3 h-1.5 bg-white rounded-sm opacity-60"></div>
                      <div className="w-4 h-2 bg-white rounded-sm opacity-80"></div>
                    </div>
                  </div>

                  {/* Screen */}
                  <div
                    className="bg-white rounded-b-[2rem] overflow-hidden"
                    style={{ minHeight: 500 }}
                  >
                    {formData.cover_image_url && (
                      <img
                        src={formData.cover_image_url}
                        alt={formData.title || "Preview"}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-gray-900 text-sm font-semibold mb-2 line-clamp-2">
                        {formData.title || "Article Title"}
                      </h3>
                      {formData.subtitle && (
                        <p className="text-xs text-gray-500 mb-2">{formData.subtitle}</p>
                      )}
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                        {formData.description || "Article description"}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>{formData.layout}</span>
                        <span>⭐ {formData.engagement_score?.toFixed(1) || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Home button */}
                  <div className="flex justify-center py-2">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-600"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
