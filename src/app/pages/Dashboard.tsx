import { useNavigate } from "react-router";
import React, { useState, useEffect } from "react";
import {
  Rss,
  FileText,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  List,
  Edit3,
  Activity,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { DashboardSummary, TopFeed } from "../types/api";
import { ArticlePreviewModal } from "../components/ArticlePreviewModal";

const activityIcon: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircle size={14} className="text-emerald-500" />,
  PROCESSING: <Clock size={14} className="text-amber-500" />,
  FAILED: <AlertCircle size={14} className="text-red-500" />,
  PREVIEW: <Edit3 size={14} className="text-indigo-500" />,
};

export function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<DashboardSummary | null>(null);
  const [topFeeds, setTopFeeds] = useState<TopFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFeedId, setPreviewFeedId] = useState<string | null>(null);
  const [previewFeed, setPreviewFeed] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
    loadTopFeeds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboardSummary();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
      console.error("Failed to load dashboard analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopFeeds = async () => {
    try {
      const feeds = await apiClient.getTopFeeds({ limit: 5 });
      setTopFeeds(feeds);
    } catch (err) {
      console.error("Failed to load top feeds:", err);
    }
  };

  const handleFeedClick = async (feedId: string) => {
    try {
      const feed = await apiClient.getFeedById(feedId);
      setPreviewFeed(feed);
      setPreviewFeedId(feedId);
    } catch (err: any) {
      alert(err.message || "Failed to load feed preview");
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const stats = analytics
    ? [
        {
          label: "Total RSS Sources",
          value: analytics.total_rss_sources.toString(),
          icon: <Rss size={20} />,
          color: "bg-blue-500",
          change: `${analytics.active_rss_sources} active`,
        },
        {
          label: "Total Feeds Fetched",
          value: analytics.total_feeds.toLocaleString(),
          icon: <FileText size={20} />,
          color: "bg-indigo-500",
          change: "All time",
        },
        {
          label: "Cron Runs (24h)",
          value: analytics.recent_cron_runs_24h.toString(),
          icon: <Activity size={20} />,
          color: "bg-amber-500",
          change: "Last 24 hours",
        },
        {
          label: "Avg Engagement",
          value: Number.parseFloat(analytics.avg_engagement_score).toFixed(2),
          icon: <TrendingUp size={20} />,
          color: "bg-emerald-500",
          change: "Score",
        },
      ]
    : [];
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/rss/list")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <List size={16} />
            Manage Feeds
          </button>
          <button
            onClick={() => navigate("/rss/setup")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            New RSS Source
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800 font-medium">Failed to load analytics</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={loadAnalytics}
            className="text-sm text-red-700 hover:text-red-900 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          ))
        ) : (
          stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className={`${s.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                  {s.icon}
                </span>
                <TrendingUp size={16} className="text-gray-300" />
              </div>
              <p className="text-2xl text-gray-900 font-semibold">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-indigo-600 mt-1">{s.change}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Activity - Top 5 Feeds */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Top 5 Recent Feeds</h2>
            <button
              onClick={() => navigate("/feeds/published")}
              className="text-xs text-indigo-600 hover:underline"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {topFeeds.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                No recent feeds available
              </div>
            ) : (
              topFeeds.map((feed: any) => (
                <div
                  key={feed.id}
                  className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleFeedClick(feed.id)}
                >
                  <div className="mt-0.5 flex-shrink-0">{activityIcon[feed.status]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">{feed.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {feed.provider} · {formatTimeAgo(feed.published_at)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] capitalize flex-shrink-0 ${
                      feed.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-700"
                        : feed.status === "PROCESSING"
                        ? "bg-amber-100 text-amber-700"
                        : feed.status === "FAILED"
                        ? "bg-red-100 text-red-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {feed.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions + System Health */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Setup New RSS Feed", path: "/rss/setup", icon: <Plus size={16} /> },
                { label: "View Article Queue", path: "/articles/queue", icon: <List size={16} /> },
                { label: "Review Articles", path: "/articles/reviewed", icon: <CheckCircle size={16} /> },
                { label: "View Flow Diagram", path: "/flow", icon: <Rss size={16} /> },
              ].map((a) => (
                <button
                  key={a.path}
                  onClick={() => navigate(a.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-gray-100 hover:border-indigo-200"
                >
                  <span className="text-indigo-500">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">System Health</h2>
            <div className="space-y-3">
              {[
                { label: "Feed Ingestion", status: "Healthy", color: "bg-emerald-500" },
                { label: "Article Parser", status: "Healthy", color: "bg-emerald-500" },
                { label: "Publishing Service", status: "Degraded", color: "bg-amber-500" },
                { label: "Archive Service", status: "Healthy", color: "bg-emerald-500" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
                    <span className="text-xs text-gray-500">{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Warning */}
            <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Publishing service latency above threshold (avg 2.4s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <ArticlePreviewModal
        feed={previewFeed}
        isOpen={!!previewFeedId}
        onClose={() => {
          setPreviewFeedId(null);
          setPreviewFeed(null);
        }}
        onEdit={(id) => {
          setPreviewFeedId(null);
          setPreviewFeed(null);
          navigate(`/feeds/edit/${id}`);
        }}
      />
    </div>
  );
}
