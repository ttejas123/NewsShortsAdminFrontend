import { useState } from "react";
import { useNavigate } from "react-router";
import { Edit3, Plus, Filter } from "lucide-react";

const MALL_IMG = "https://images.unsplash.com/photo-1725121688291-ed19354b618b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBhcmNoaXRlY3R1cmUlMjBtb2Rlcm58ZW58MXx8fHwxNzcyNTYxNzU0fDA&ixlib=rb-4.1.0&q=80&w=80";
const CITY_IMG = "https://images.unsplash.com/photo-1641030902803-cf68c6206c22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0JTIwbW9kZXJufGVufDF8fHx8MTc3MjU2MTc1NHww&ixlib=rb-4.1.0&q=80&w=80";

interface Article {
  id: number;
  image: string;
  title: string;
  from: string;
  publishDate: string;
  checked: boolean;
}

const initialArticles: Article[] = [
  { id: 1, image: CITY_IMG, title: "New Visa rules released today", from: "Khaleej Times", publishDate: "8:43 am 10/27/2022", checked: false },
  { id: 2, image: MALL_IMG, title: "New mall opening up", from: "Gulf news", publishDate: "9:00 am 10/27/2022", checked: false },
  { id: 3, image: CITY_IMG, title: "Central Bank announces new policy measures for 2026", from: "Reuters", publishDate: "10:15 am 10/27/2022", checked: false },
  { id: 4, image: MALL_IMG, title: "Tech summit highlights major AI breakthroughs", from: "Arabia Times", publishDate: "11:30 am 10/27/2022", checked: false },
];

export function NewArticleQueue() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [filters, setFilters] = useState({
    geo: "",
    language: "",
    feedName: "",
    dateTimeLess: "",
    dateTimeMore: "",
  });
  const [archived, setArchived] = useState<number[]>([]);

  const toggleCheck = (id: number) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const handleArchive = () => {
    const checkedIds = articles.filter((a) => a.checked).map((a) => a.id);
    if (checkedIds.length === 0) return;
    setArchived((prev) => [...prev, ...checkedIds]);
    setArticles((prev) => prev.filter((a) => !a.checked));
  };

  const visible = articles.filter((a) => !archived.includes(a.id));
  const anyChecked = visible.some((a) => a.checked);

  const selectClass =
    "border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 appearance-none pr-6";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → Articles → New Article Queue</div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Title bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-5 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">New Article Queue</span>
        </div>

        <div className="p-6">
          <h1 className="text-gray-900 mb-0.5">New Article Queue</h1>
          <p className="text-sm font-semibold text-gray-700 mb-4">Filters</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5 items-center">
            <div className="relative">
              <select
                value={filters.geo}
                onChange={(e) => setFilters({ ...filters, geo: e.target.value })}
                className={selectClass}
              >
                <option value="">GEO</option>
                <option value="UAE">UAE</option>
                <option value="Worldwide">Worldwide</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className={selectClass}
              >
                <option value="">Language</option>
                <option value="English">English</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={filters.feedName}
                onChange={(e) => setFilters({ ...filters, feedName: e.target.value })}
                className={selectClass}
              >
                <option value="">Feed Name</option>
                <option value="Khaleej Times">Khaleej Times</option>
                <option value="Gulf News">Gulf News</option>
                <option value="Reuters">Reuters</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={filters.dateTimeLess}
                onChange={(e) => setFilters({ ...filters, dateTimeLess: e.target.value })}
                className={`${selectClass} max-w-52`}
              >
                <option value="">Date time (Less than x hours old)</option>
                <option value="1">Less than 1 hour</option>
                <option value="3">Less than 3 hours</option>
                <option value="6">Less than 6 hours</option>
                <option value="12">Less than 12 hours</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={filters.dateTimeMore}
                onChange={(e) => setFilters({ ...filters, dateTimeMore: e.target.value })}
                className={`${selectClass} max-w-52`}
              >
                <option value="">Date time (More than x hours old)</option>
                <option value="1">More than 1 hour</option>
                <option value="3">More than 3 hours</option>
                <option value="6">More than 6 hours</option>
                <option value="24">More than 24 hours</option>
              </select>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
              <Filter size={14} />
              Apply filters
            </button>
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* Archive button */}
          <div className="mb-3">
            <button
              onClick={handleArchive}
              disabled={!anyChecked}
              className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                anyChecked
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-300 cursor-not-allowed"
              }`}
            >
              Archive
            </button>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-36">Check Box</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-20">Image</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Article title</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-40">Article from</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-52">article publish date</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-20">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                      No articles in queue
                    </td>
                  </tr>
                ) : (
                  visible.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={article.checked}
                          onChange={() => toggleCheck(article.id)}
                          className="accent-indigo-600 w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-10 h-10 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-700">{article.title}</td>
                      <td className="px-4 py-3 text-gray-600">{article.from}</td>
                      <td className="px-4 py-3 text-gray-500">{article.publishDate}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/articles/edit/${article.id}`)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="Edit article"
                        >
                          <Edit3 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* New Article button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => navigate("/articles/edit")}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={16} />
              New Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
