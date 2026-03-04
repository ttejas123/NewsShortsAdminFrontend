import { useState } from "react";
import { Archive, Search, Trash2, RefreshCw } from "lucide-react";

const MALL_IMG = "https://images.unsplash.com/photo-1725121688291-ed19354b618b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBhcmNoaXRlY3R1cmUlMjBtb2Rlcm58ZW58MXx8fHwxNzcyNTYxNzU0fDA&ixlib=rb-4.1.0&q=80&w=80";
const CITY_IMG = "https://images.unsplash.com/photo-1641030902803-cf68c6206c22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0JTIwbW9kZXJufGVufDF8fHx8MTc3MjU2MTc1NHww&ixlib=rb-4.1.0&q=80&w=80";

interface ArchivedArticle {
  id: number;
  image: string;
  title: string;
  from: string;
  archivedDate: string;
  expiresIn: string;
  checked: boolean;
}

const initialArchived: ArchivedArticle[] = [
  { id: 1, image: CITY_IMG, title: "Old Visa policy update 2022", from: "Khaleej Times", archivedDate: "10/20/2022", expiresIn: "2 days", checked: false },
  { id: 2, image: MALL_IMG, title: "Retail market report Q3 2022", from: "Gulf News", archivedDate: "10/21/2022", expiresIn: "3 days", checked: false },
  { id: 3, image: CITY_IMG, title: "Infrastructure project delays", from: "Arabia Times", archivedDate: "10/18/2022", expiresIn: "Today", checked: false },
  { id: 4, image: MALL_IMG, title: "Annual tech conference recap", from: "Reuters", archivedDate: "10/22/2022", expiresIn: "4 days", checked: false },
];

export function ArticleArchive() {
  const [articles, setArticles] = useState<ArchivedArticle[]>(initialArchived);
  const [search, setSearch] = useState("");

  const toggleCheck = (id: number) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const deleteSelected = () => {
    setArticles((prev) => prev.filter((a) => !a.checked));
  };

  const restoreSelected = () => {
    setArticles((prev) => prev.filter((a) => !a.checked));
  };

  const anyChecked = articles.some((a) => a.checked);
  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.from.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → Articles → Archive</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Article Archive</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Articles get cleared every 7 days from Archive automatically.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          <Archive size={14} />
          Articles auto-delete after 7 days
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search archived articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300"
            />
          </div>
          {anyChecked && (
            <div className="flex gap-2">
              <button
                onClick={restoreSelected}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <RefreshCw size={14} /> Restore
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} /> Delete Permanently
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setArticles((prev) =>
                        prev.map((a) => ({ ...a, checked: e.target.checked }))
                      )
                    }
                    className="accent-indigo-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Article title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Source</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-36">Archived date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-28">Expires in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    <Archive size={32} className="mx-auto mb-2 opacity-30" />
                    Archive is empty
                  </td>
                </tr>
              ) : (
                filtered.map((article) => (
                  <tr
                    key={article.id}
                    className={`hover:bg-gray-50 transition-colors ${article.checked ? "bg-indigo-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={article.checked}
                        onChange={() => toggleCheck(article.id)}
                        className="accent-indigo-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-10 h-10 object-cover rounded opacity-70"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{article.title}</td>
                    <td className="px-4 py-3 text-gray-500">{article.from}</td>
                    <td className="px-4 py-3 text-gray-500">{article.archivedDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          article.expiresIn === "Today"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {article.expiresIn}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
