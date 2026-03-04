import { useState } from "react";
import { useNavigate } from "react-router";
import { Edit3, Filter, CheckCircle, X, Radio } from "lucide-react";

interface ReviewedArticle {
  id: number;
  checked: boolean;
  image?: string;
  title: string;
  from: string;
  reviewedDate: string;
  reviewedBy: string;
}

const MALL_IMG = "https://images.unsplash.com/photo-1725121688291-ed19354b618b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBhcmNoaXRlY3R1cmUlMjBtb2Rlcm58ZW58MXx8fHwxNzcyNTYxNzU0fDA&ixlib=rb-4.1.0&q=80&w=80";
const CITY_IMG = "https://images.unsplash.com/photo-1641030902803-cf68c6206c22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0JTIwbW9kZXJufGVufDF8fHx8MTc3MjU2MTc1NHww&ixlib=rb-4.1.0&q=80&w=80";

const initialArticles: ReviewedArticle[] = [
  { id: 1, checked: false, image: CITY_IMG, title: "New Visa rules released today", from: "Khaleej Times", reviewedDate: "8:43 am 10/27/202243", reviewedBy: "Sanjay" },
  { id: 2, checked: false, image: MALL_IMG, title: "New mall opening up", from: "Gulf news", reviewedDate: "9:00 am 10/27/2022", reviewedBy: "Ahmed" },
  { id: 3, checked: false, image: CITY_IMG, title: "Central Bank announces new policy measures", from: "Reuters", reviewedDate: "10:30 am 10/27/2022", reviewedBy: "Sanjay" },
  { id: 4, checked: false, image: MALL_IMG, title: "Tech summit highlights AI breakthroughs", from: "Arabia Times", reviewedDate: "11:15 am 10/27/2022", reviewedBy: "Priya" },
];

export function ReviewedArticleQueue() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ReviewedArticle[]>(initialArticles);
  const [filters, setFilters] = useState({
    geo: "",
    language: "",
    feedName: "",
    dateTimeLess: "",
    dateTimeMore: "",
    reviewedBy: "",
  });
  const [toast, setToast] = useState<{ msg: string; type: "success" | "info" } | null>(null);

  const toggleCheck = (id: number) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const toggleAll = () => {
    const allChecked = articles.every((a) => a.checked);
    setArticles((prev) => prev.map((a) => ({ ...a, checked: !allChecked })));
  };

  const anyChecked = articles.some((a) => a.checked);

  const showToast = (msg: string, type: "success" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleArchive = () => {
    const count = articles.filter((a) => a.checked).length;
    if (count === 0) return;
    setArticles((prev) => prev.filter((a) => !a.checked));
    showToast(`${count} article(s) archived.`, "info");
  };

  const handlePublish = () => {
    const count = articles.filter((a) => a.checked).length;
    if (count === 0) return;
    setArticles((prev) => prev.filter((a) => !a.checked));
    showToast(`${count} article(s) published successfully!`);
  };

  const selectClass =
    "border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → Articles → Reviewed Article Queue</div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === "success" ? "bg-emerald-600" : "bg-gray-700"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <Radio size={16} />}
          <span className="text-sm">{toast.msg}</span>
          <button onClick={() => setToast(null)}>
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
          <span className="text-xs text-gray-500 ml-2">Reviewed Article Queue</span>
        </div>

        <div className="p-6">
          <h1 className="text-gray-900 mb-0.5">Reviewed Article Queue</h1>
          <p className="text-sm font-semibold text-gray-700 mb-4">Filters</p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5 items-center">
            <select value={filters.geo} onChange={(e) => setFilters({ ...filters, geo: e.target.value })} className={selectClass}>
              <option value="">GEO</option>
              <option>UAE</option>
              <option>Worldwide</option>
              <option>Saudi Arabia</option>
            </select>

            <select value={filters.language} onChange={(e) => setFilters({ ...filters, language: e.target.value })} className={selectClass}>
              <option value="">Language</option>
              <option>English</option>
              <option>Arabic</option>
            </select>

            <select value={filters.feedName} onChange={(e) => setFilters({ ...filters, feedName: e.target.value })} className={selectClass}>
              <option value="">Feed Name</option>
              <option>Khaleej Times</option>
              <option>Gulf News</option>
              <option>Reuters</option>
            </select>

            <select value={filters.dateTimeLess} onChange={(e) => setFilters({ ...filters, dateTimeLess: e.target.value })} className={`${selectClass} max-w-52`}>
              <option value="">Date time (Less than x hours old)</option>
              <option value="1">Less than 1 hour</option>
              <option value="3">Less than 3 hours</option>
              <option value="6">Less than 6 hours</option>
            </select>

            <select value={filters.dateTimeMore} onChange={(e) => setFilters({ ...filters, dateTimeMore: e.target.value })} className={`${selectClass} max-w-52`}>
              <option value="">Date time (More than x hours old)</option>
              <option value="1">More than 1 hour</option>
              <option value="3">More than 3 hours</option>
              <option value="24">More than 24 hours</option>
            </select>

            <select value={filters.reviewedBy} onChange={(e) => setFilters({ ...filters, reviewedBy: e.target.value })} className={selectClass}>
              <option value="">Reviewed by</option>
              <option>Sanjay</option>
              <option>Ahmed</option>
              <option>Priya</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
              <Filter size={14} />
              Apply filters
            </button>
          </div>

          <hr className="border-gray-200 mb-4" />

          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={handleArchive}
              disabled={!anyChecked}
              className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                anyChecked ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
              }`}
            >
              Archive
            </button>
            <button
              onClick={handlePublish}
              disabled={!anyChecked}
              className={`px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                anyChecked ? "bg-indigo-600 hover:bg-indigo-700" : "bg-indigo-300 cursor-not-allowed"
              }`}
            >
              Publish
            </button>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-36">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={articles.every((a) => a.checked) && articles.length > 0}
                        onChange={toggleAll}
                        className="accent-indigo-600"
                      />
                      <span className="text-gray-700 font-semibold">Check Box</span>
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-20">Image</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold">Article title</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-36">Article from</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-48">article Reviewed date</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-32">Reviewed by</th>
                  <th className="px-4 py-3 text-left text-gray-700 font-semibold w-20">Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                      No articles in reviewed queue
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr
                      key={article.id}
                      className={`hover:bg-gray-50 transition-colors ${article.checked ? "bg-indigo-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={article.checked}
                          onChange={() => toggleCheck(article.id)}
                          className="accent-indigo-600 w-4 h-4"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {article.image && (
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{article.title}</td>
                      <td className="px-4 py-3 text-gray-600">{article.from}</td>
                      <td className="px-4 py-3 text-gray-500">{article.reviewedDate}</td>
                      <td className="px-4 py-3 text-gray-600">{article.reviewedBy}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/articles/edit/${article.id}`)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
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
        </div>
      </div>
    </div>
  );
}
