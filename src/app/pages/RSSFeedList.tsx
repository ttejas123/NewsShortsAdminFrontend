import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Edit3, Trash2, Search, MoreVertical, Pause, Play } from "lucide-react";

interface Feed {
  id: number;
  name: string;
  url: string;
  language: string;
  geo: string;
  category: string;
  pullHours: number;
  status: "Active" | "Paused";
  lastPulled: string;
  articlesCount: number;
}

const initialFeeds: Feed[] = [
  { id: 1, name: "Khaleej Times", url: "https://khaleejtimes.com/feed", language: "English", geo: "UAE", category: "General", pullHours: 1, status: "Active", lastPulled: "5 min ago", articlesCount: 342 },
  { id: 2, name: "Gulf News", url: "https://gulfnews.com/rss", language: "English", geo: "UAE", category: "Business", pullHours: 2, status: "Active", lastPulled: "12 min ago", articlesCount: 218 },
  { id: 3, name: "Arabia Times", url: "https://arabiatimes.com/feed", language: "Arabic", geo: "Saudi Arabia", category: "General", pullHours: 1, status: "Paused", lastPulled: "2h ago", articlesCount: 156 },
  { id: 4, name: "Reuters Middle East", url: "https://reuters.com/me/feed", language: "English", geo: "Worldwide", category: "Business", pullHours: 1, status: "Active", lastPulled: "3 min ago", articlesCount: 521 },
  { id: 5, name: "Al Arabiya", url: "https://alarabiya.net/feed", language: "Arabic", geo: "UAE", category: "General", pullHours: 4, status: "Active", lastPulled: "1h ago", articlesCount: 98 },
];

export function RSSFeedList() {
  const navigate = useNavigate();
  const [feeds, setFeeds] = useState<Feed[]>(initialFeeds);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = feeds.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.url.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((f) => f.id)));
    }
  };

  const toggleStatus = (id: number) => {
    setFeeds((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: f.status === "Active" ? "Paused" : "Active" } : f
      )
    );
    setOpenMenu(null);
  };

  const deleteFeed = (id: number) => {
    setFeeds((prev) => prev.filter((f) => f.id !== id));
    setOpenMenu(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → RSS Feeds → Manage Feeds</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">RSS Feeds List</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and edit existing RSS feed configurations.</p>
        </div>
        <button
          onClick={() => navigate("/rss/setup")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add New Feed
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search feeds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300"
            />
          </div>
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{selected.size} selected</span>
              <button
                onClick={() => {
                  setFeeds((prev) => prev.filter((f) => !selected.has(f.id)));
                  setSelected(new Set());
                }}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete Selected
              </button>
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
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="accent-indigo-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Feed Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Language</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Geo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pull Freq.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Articles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Pulled</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No feeds found
                  </td>
                </tr>
              ) : (
                filtered.map((feed) => (
                  <tr key={feed.id} className={`hover:bg-gray-50 transition-colors ${selected.has(feed.id) ? "bg-indigo-50" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(feed.id)}
                        onChange={() => toggleSelect(feed.id)}
                        className="accent-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{feed.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-48">{feed.url}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{feed.language}</td>
                    <td className="px-4 py-3 text-gray-600">{feed.geo}</td>
                    <td className="px-4 py-3 text-gray-600">{feed.category}</td>
                    <td className="px-4 py-3 text-gray-600">Every {feed.pullHours}h</td>
                    <td className="px-4 py-3 text-gray-600">{feed.articlesCount}</td>
                    <td className="px-4 py-3 text-gray-500">{feed.lastPulled}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        feed.status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {feed.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 relative">
                        <button
                          onClick={() => navigate("/rss/setup")}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setOpenMenu(openMenu === feed.id ? null : feed.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <MoreVertical size={15} />
                        </button>
                        {openMenu === feed.id && (
                          <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => toggleStatus(feed.id)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              {feed.status === "Active" ? <Pause size={14} /> : <Play size={14} />}
                              {feed.status === "Active" ? "Pause Feed" : "Activate Feed"}
                            </button>
                            <button
                              onClick={() => deleteFeed(feed.id)}
                              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Feed
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
          <span>Showing {filtered.length} of {feeds.length} feeds</span>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-40" disabled>
              Prev
            </button>
            <button className="px-3 py-1.5 rounded border border-indigo-600 bg-indigo-600 text-white">1</button>
            <button className="px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50 transition-colors" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
