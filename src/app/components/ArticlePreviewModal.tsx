import React from "react";
import { X, Edit3, Clock, TrendingUp, User, Tag as TagIcon } from "lucide-react";
import type { Feed } from "../types/api";
import { useTheme } from "../context/ThemeContext";

interface ArticlePreviewModalProps {
  feed: Feed | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}

export function ArticlePreviewModal({ feed, isOpen, onClose, onEdit }: ArticlePreviewModalProps) {
  const { darkMode } = useTheme();
  if (!isOpen || !feed) return null;

  const dm = darkMode;
  const textTitle = dm ? "text-gray-100" : "text-gray-900";
  const textBody = dm ? "text-gray-300" : "text-gray-800";
  const textMuted = dm ? "text-gray-400" : "text-gray-500";
  const borderCol = dm ? "border-gray-800" : "border-gray-200";
  const bgCard = dm ? "bg-gray-900" : "bg-white";
  const bgHeader = dm ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const bgFooter = dm ? "bg-gray-900/50 border-gray-800" : "bg-gray-50 border-gray-200";
  const feedData: any = {
    ...feed,
    status: feed.Status || feed.status,
    provider: feed.Provider || feed.provider,
    author: feed.Author || feed.author,
    source: feed.Source || feed.source,
    category: feed.Category || feed.category,
    language: feed.Language || feed.language,
    region: feed.Region || feed.region,
  }
  const coverImage = feedData.resources?.find((r: any) => r.name === "cover_image")?.url;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return dm ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-100 text-emerald-700";
      case "PROCESSING":
        return dm ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-100 text-amber-700";
      case "FAILED":
        return dm ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-red-100 text-red-700";
      case "PREVIEW":
        return dm ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-100 text-blue-700";
      default:
        return dm ? "bg-gray-500/10 text-gray-400 border border-gray-500/20" : "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`${bgCard} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border ${borderCol}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderCol}`}>
          <h2 className={`text-lg font-semibold ${textTitle}`}>Article Preview</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${dm ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Details */}
            <div className="space-y-4">
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${textTitle}`}>{feedData.title}</h3>
                {feedData.subtitle && (
                  <p className={`text-lg ${dm ? "text-gray-400" : "text-gray-600"}`}>{feedData.subtitle}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    feedData.status.name
                  )}`}
                >
                  {feedData.status.name}
                </span>
                {feedData.is_featured && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${dm ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-100 text-purple-700"}`}>
                    Featured
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${dm ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-200 text-gray-700"}`}>
                  {feedData.layout}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className={`flex items-center gap-2 ${textMuted}`}>
                  <User size={16} />
                  <span className="font-medium">Provider:</span>
                  <span className={textBody}>{feedData.provider.name}</span>
                </div>

                <div className={`flex items-center gap-2 ${textMuted}`}>
                  <Clock size={16} />
                  <span className="font-medium">Published:</span>
                  <span className={textBody}>{formatDate(feedData.published_at)}</span>
                </div>

                <div className={`flex items-center gap-2 ${textMuted}`}>
                  <TrendingUp size={16} />
                  <span className="font-medium">Engagement:</span>
                  <span className={textBody}>{feedData.engagement_score.toFixed(2)}</span>
                </div>

                <div className={`flex items-start gap-2 ${textMuted}`}>
                  <TagIcon size={16} className="mt-0.5" />
                  <span className="font-medium">Category:</span>
                  <span className={textBody}>{feedData.category.name}</span>
                </div>

                <div className={`flex items-start gap-2 ${textMuted}`}>
                  <span className="font-medium">Language:</span>
                  <span className={textBody}>
                    {feedData.language.name} ({feedData.language.code})
                  </span>
                </div>

                <div className={`flex items-start gap-2 ${textMuted}`}>
                  <span className="font-medium">Region:</span>
                  <span className={textBody}>{feedData.region.name}</span>
                </div>
              </div>

              {feedData.tags && feedData.tags.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${dm ? "text-gray-300" : "text-gray-700"}`}>Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {feedData.tags.map((tag:any) => (
                      <span
                        key={tag.id}
                        className={`px-2 py-1 text-xs rounded-md ${dm ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-indigo-50 text-indigo-700"}`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className={`text-sm font-medium mb-2 ${dm ? "text-gray-300" : "text-gray-700"}`}>Description:</p>
                <p className={`text-sm leading-relaxed wrap-break-word ${textBody}`}>
                  {feedData.description}
                </p>
              </div>

              {feedData.web_url && (
                <a
                  href={feedData.web_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-medium ${dm ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700 underline"}`}
                >
                  View Original Article →
                </a>
              )}
            </div>

            {/* Right: Mobile Preview */}
            <div>
              <p className={`text-sm font-medium mb-4 text-center ${dm ? "text-gray-300" : "text-gray-700"}`}>
                Mobile Preview
              </p>
              <div className="flex justify-center">
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
                    {coverImage && (
                      <img
                        src={coverImage}
                        alt={feedData.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-gray-900 text-sm font-semibold mb-2 line-clamp-2">
                        {feedData.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{feedData.provider.name}</p>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-6 wrap-break-word">
                        {feedData.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <span>{formatDate(feedData.published_at).split(",")[0]}</span>
                        <span>⭐ {feedData.engagement_score.toFixed(1)}</span>
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

        {/* Footer Actions */}
        <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${bgFooter}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm rounded-lg transition-colors border ${
              dm
                ? "text-gray-300 border-gray-700 hover:bg-gray-800"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Close
          </button>
          <button
            onClick={() => onEdit(feedData.id)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Edit3 size={16} />
            Edit Article
          </button>
        </div>
      </div>
    </div>
  );
}
