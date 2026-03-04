import { useNavigate } from "react-router";
import {
  Rss,
  FileText,
  CheckCircle,
  Radio,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  List,
  Edit3,
  Archive,
} from "lucide-react";

const stats = [
  { label: "Total RSS Feeds", value: "24", icon: <Rss size={20} />, color: "bg-blue-500", change: "+2 this week" },
  { label: "Articles Today", value: "138", icon: <FileText size={20} />, color: "bg-indigo-500", change: "+14% vs yesterday" },
  { label: "Pending Reviews", value: "47", icon: <Clock size={20} />, color: "bg-amber-500", change: "12 urgent" },
  { label: "Published Today", value: "93", icon: <Radio size={20} />, color: "bg-emerald-500", change: "+8% vs yesterday" },
];

const recentActivity = [
  { type: "published", text: "New Visa rules released today", source: "Khaleej Times", time: "2 min ago", reviewer: "Sanjay" },
  { type: "archived", text: "Old market report Q3", source: "Gulf News", time: "15 min ago", reviewer: "Ahmed" },
  { type: "edited", text: "New mall opening ceremony coverage", source: "Arabia Times", time: "32 min ago", reviewer: "Sanjay" },
  { type: "queued", text: "Tech summit highlights 2026", source: "TechCrunch", time: "1h ago", reviewer: null },
  { type: "published", text: "Central Bank announces rate cut", source: "Reuters", time: "2h ago", reviewer: "Ahmed" },
];

const activityIcon: Record<string, React.ReactNode> = {
  published: <CheckCircle size={14} className="text-emerald-500" />,
  archived: <Archive size={14} className="text-gray-400" />,
  edited: <Edit3 size={14} className="text-indigo-500" />,
  queued: <Clock size={14} className="text-amber-500" />,
};

export function Dashboard() {
  const navigate = useNavigate();
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
            onClick={() => navigate("/rss/setup")}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            New RSS Feed
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className={`${s.color} w-10 h-10 rounded-lg flex items-center justify-center text-white`}>
                {s.icon}
              </span>
              <TrendingUp size={16} className="text-gray-300" />
            </div>
            <p className="text-2xl text-gray-900 font-semibold">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-emerald-600 mt-1">{s.change}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
            <button className="text-xs text-indigo-600 hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <div className="mt-0.5 flex-shrink-0">{activityIcon[item.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">{item.text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.source} · {item.time}
                    {item.reviewer && ` · by ${item.reviewer}`}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[11px] capitalize flex-shrink-0 ${
                  item.type === "published" ? "bg-emerald-100 text-emerald-700" :
                  item.type === "archived" ? "bg-gray-100 text-gray-600" :
                  item.type === "edited" ? "bg-indigo-100 text-indigo-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {item.type}
                </span>
              </div>
            ))}
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
    </div>
  );
}
