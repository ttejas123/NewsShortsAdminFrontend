import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Trash2, CheckCircle, X } from "lucide-react";

interface CategoryMappingRow {
  id: number;
  category: string;
  feedSpecific: string;
}

export function RSSFeedSetup() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    language: "English",
    feedName: "",
    loginUrl: "",
    username: "",
    password: "",
    feedUrl: "",
    categoryType: "Fixed",
    fixedCategory: "General",
    geo: "Worldwide",
    pullHours: "1",
    titleHeader: "",
    imageUrl: "",
    articleUrl: "",
    date: "",
  });

  const [mappingRows, setMappingRows] = useState<CategoryMappingRow[]>([
    { id: 1, category: "General", feedSpecific: "" },
  ]);

  const addMappingRow = () => {
    setMappingRows((rows) => [
      ...rows,
      { id: Date.now(), category: "General", feedSpecific: "" },
    ]);
  };

  const removeMappingRow = (id: number) => {
    setMappingRows((rows) => rows.filter((r) => r.id !== id));
  };

  const updateMapping = (id: number, field: keyof CategoryMappingRow, value: string) => {
    setMappingRows((rows) =>
      rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    "border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 bg-white";
  const labelClass = "text-sm font-bold text-gray-800 whitespace-nowrap";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 mb-1">
        Admin → Rss Feeds (RSS Feeds Admin Section (Setup new RSS feeds / edit existing feeds))
      </div>

      {/* Toast */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle size={16} />
          <span className="text-sm">RSS Feed saved successfully!</span>
          <button onClick={() => setSaved(false)} className="ml-2">
            <X size={14} />
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
          <span className="text-xs text-gray-500 ml-2">
            Admin - Rss Feeds (RSS Feeds Admin Section (Setup new RSS feeds / edit existing feeds))
          </span>
        </div>

        <div className="p-8">
          <h1 className="text-gray-900 mb-6" style={{ fontStyle: "italic" }}>
            Setup new RSS feeds
          </h1>

          {/* Section 1: Feed Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 220 }}>Language:</label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className={`${inputClass} w-48`}
              >
                <option>English</option>
                <option>Arabic</option>
                <option>French</option>
                <option>Urdu</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 220 }}>
                Feed name(Will be shown in News Card):
              </label>
              <input
                type="text"
                placeholder="Feed Name"
                value={form.feedName}
                onChange={(e) => setForm({ ...form, feedName: e.target.value })}
                className={`${inputClass} w-64`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 220 }}>Website Login URL</label>
              <input
                type="url"
                placeholder="URL"
                value={form.loginUrl}
                onChange={(e) => setForm({ ...form, loginUrl: e.target.value })}
                className={`${inputClass} w-64`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 220 }}>Website Username</label>
              <input
                type="text"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className={`${inputClass} w-64`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 220 }}>Website Password</label>
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputClass} w-64`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 220 }}>Feed URL:</label>
              <input
                type="url"
                placeholder="URL"
                value={form.feedUrl}
                onChange={(e) => setForm({ ...form, feedUrl: e.target.value })}
                className={`${inputClass} w-56`}
              />
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Section 2: Category */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 100 }}>Category:</label>
              <select
                value={form.categoryType}
                onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
                className={`${inputClass} w-48`}
              >
                <option>Fixed</option>
                <option>Variable</option>
              </select>
            </div>

            {form.categoryType === "Fixed" && (
              <div className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-bold text-gray-800">
                  [Only show if admin picks Fixed from previous Drop Down] Category :
                </label>
                <select
                  value={form.fixedCategory}
                  onChange={(e) => setForm({ ...form, fixedCategory: e.target.value })}
                  className={`${inputClass} w-48`}
                >
                  <option>General</option>
                  <option>Business</option>
                  <option>Technology</option>
                  <option>Sports</option>
                  <option>Entertainment</option>
                </select>
              </div>
            )}

            {form.categoryType === "Variable" && (
              <div>
                <p className="text-sm font-bold text-gray-800 mb-3">
                  [Only show if admin picks Variable from previous Drop Down] Category Mapping:
                </p>
                <div className="space-y-2">
                  {mappingRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-3">
                      <select
                        value={row.category}
                        onChange={(e) => updateMapping(row.id, "category", e.target.value)}
                        className={`${inputClass} w-36`}
                      >
                        <option>General</option>
                        <option>Business</option>
                        <option>Technology</option>
                        <option>Sports</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Feed Specific Category"
                        value={row.feedSpecific}
                        onChange={(e) => updateMapping(row.id, "feedSpecific", e.target.value)}
                        className={`${inputClass} w-52`}
                      />
                      {mappingRows.length > 1 && (
                        <button
                          onClick={() => removeMappingRow(row.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMappingRow}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <Plus size={14} /> (add more rows)
                </button>
              </div>
            )}

            {form.categoryType === "Fixed" && (
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-800">
                  [Only show if admin picks Variable from previous Drop Down] Category Mapping:
                </p>
                <div className="flex items-center gap-3 opacity-40 cursor-not-allowed">
                  <select disabled className={`${inputClass} w-36`}>
                    <option>General</option>
                  </select>
                  <input
                    disabled
                    type="text"
                    placeholder="Feed Specific Category"
                    className={`${inputClass} w-52`}
                  />
                </div>
                <p className="text-xs text-gray-400 italic">
                  Switch category to "Variable" to enable mapping
                </p>
              </div>
            )}
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Section 3: Geo & Pull Frequency */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 160 }}>Geo[Dropdown]:</label>
              <select
                value={form.geo}
                onChange={(e) => setForm({ ...form, geo: e.target.value })}
                className={`${inputClass} w-48`}
              >
                <option>Worldwide</option>
                <option>UAE</option>
                <option>Saudi Arabia</option>
                <option>Kuwait</option>
                <option>Qatar</option>
                <option>Bahrain</option>
                <option>Oman</option>
              </select>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <label className={`${labelClass} flex-shrink-0`}>
                Feed is pulled once how many hours(Number of times the RSS feed is accessed):
              </label>
              <select
                value={form.pullHours}
                onChange={(e) => setForm({ ...form, pullHours: e.target.value })}
                className={`${inputClass} w-20`}
              >
                {[1, 2, 3, 4, 6, 8, 12, 24].map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Section 4: XML Mapping */}
          <div className="space-y-3 mb-8">
            <p className={labelClass}>XML Mapping:</p>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 200 }}>Title rss feed header:</label>
              <input
                type="text"
                placeholder="<header>"
                value={form.titleHeader}
                onChange={(e) => setForm({ ...form, titleHeader: e.target.value })}
                className={`${inputClass} w-56`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 200 }}>Image URL :</label>
              <input
                type="url"
                placeholder="URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className={`${inputClass} w-56`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 200 }}>Full article URL: :</label>
              <input
                type="url"
                placeholder="URL"
                value={form.articleUrl}
                onChange={(e) => setForm({ ...form, articleUrl: e.target.value })}
                className={`${inputClass} w-56`}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className={labelClass} style={{ minWidth: 200 }}>date:</label>
              <input
                type="text"
                placeholder="Date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`${inputClass} w-44`}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate("/rss/list")}
              className="px-5 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
