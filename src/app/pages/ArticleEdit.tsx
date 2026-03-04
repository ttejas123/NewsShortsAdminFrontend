import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Upload, CheckCircle, X, Save } from "lucide-react";

const MALL_IMG = "https://images.unsplash.com/photo-1725121688291-ed19354b618b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG9wcGluZyUyMG1hbGwlMjBhcmNoaXRlY3R1cmUlMjBtb2Rlcm58ZW58MXx8fHwxNzcyNTYxNzU0fDA&ixlib=rb-4.1.0&q=80&w=800";

const ORIGINAL_ARTICLE = {
  url: "www.gulfnews.com/newmall.html",
  header: "New Mall opening",
  text: `Tenete ergo quod si servitus quae natura liber, et aliena tua tunc impeditur. Dolebis, et turbabantur, et invenietis, cum culpa tam dis hominibusque.
Quod si tibi tantum sit propria et aliena quale sit,
Tenete ergo quod si servitus quae natura liber, et aliena tua tunc impeditur. Dolebis, et turbabantur, et invenietis, cum culpa tam dis hominibusque.
Quod si tibi tantum sit propria et aliena quale sit,
Tenete ergo quod si servitus quae natura liber, et aliena tua tunc impeditur. Dolebis, et turbabantur, et invenietis, cum culpa tam dis hominibusque.
Quod si tibi tantum sit propria et aliena quale sit,`,
};

const SUMMARIZED_TEXT = `Tenete ergo quod si servitus quae natura liber, et aliena tua tunc impeditur. Dolebis, et turbabantur, et invenietis, cum culpa tam dis hominibusque. Quod si tibi tantum sit propria et aliena quale sit,
Tenete ergo quod si servitus quae natura liber, et aliena tua tunc impeditur.`;

export function ArticleEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    fullArticleUrl: "www.gulfnews.com/newmall.html",
    category: "General",
    setNewsNotification: false,
    articleHeader: "New Mall opening",
    summarizedText: SUMMARIZED_TEXT,
    summarizedText2: SUMMARIZED_TEXT,
  });

  const [similarArticles, setSimilarArticles] = useState([
    { id: 1, title: "New Mall Opens", source: "Khaleej Times", checked: false },
    { id: 2, title: "Sahar Mall opens", source: "Arabia  Times", checked: false },
  ]);

  const MAX_HEADER = 90;
  const MAX_SUMMARY = 460;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleArchive = () => {
    navigate("/articles/archive");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-xs text-gray-400 mb-1">Admin → Articles → Article Edit {id ? `(#${id})` : ""}</div>

      {/* Toast */}
      {saved && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle size={16} />
          <span className="text-sm">Article saved as reviewed!</span>
          <button onClick={() => setSaved(false)}>
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
          <span className="text-xs text-gray-500 ml-2">Article Edit</span>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Original + Editable */}
            <div>
              {/* Original Article */}
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Original Article</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 w-28 flex-shrink-0">Full article URL</label>
                    <div className="px-3 py-1.5 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-md flex-1 truncate">
                      {ORIGINAL_ARTICLE.url}
                    </div>
                  </div>
                  <div>
                    <img
                      src={MALL_IMG}
                      alt="Article Image"
                      className="w-full max-h-40 object-cover rounded-lg border border-gray-200"
                    />
                    <p className="text-xs text-center text-gray-400 mt-1">Image Preview</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 w-28 flex-shrink-0">Article Header</label>
                    <div className="px-3 py-1.5 text-sm text-gray-600 bg-indigo-50 border border-indigo-200 rounded-md flex-1">
                      {ORIGINAL_ARTICLE.header}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Full article text</label>
                    <textarea
                      readOnly
                      value={ORIGINAL_ARTICLE.text}
                      rows={8}
                      className="w-full text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-3 resize-none"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 mb-6" />

              {/* Editable Article Area */}
              <div>
                <h2 className="text-sm font-semibold text-gray-800 mb-3">Editable Article Area</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 w-28 flex-shrink-0">Full article URL</label>
                    <input
                      type="url"
                      value={form.fullArticleUrl}
                      onChange={(e) => setForm({ ...form, fullArticleUrl: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 w-28 flex-shrink-0">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-400"
                    >
                      <option>General</option>
                      <option>Business</option>
                      <option>Technology</option>
                      <option>Sports</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newsNotif"
                      checked={form.setNewsNotification}
                      onChange={(e) => setForm({ ...form, setNewsNotification: e.target.checked })}
                      className="accent-indigo-600"
                    />
                    <label htmlFor="newsNotif" className="text-sm text-gray-600">
                      Set News Notification
                    </label>
                  </div>

                  <div>
                    <div className="relative group cursor-pointer">
                      <img
                        src={MALL_IMG}
                        alt="Edit Image"
                        className="w-full max-h-40 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs flex items-center gap-1">
                          <Upload size={14} /> Replace image
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-center text-gray-400">Image Editor</p>
                      <button className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                        <Upload size={12} /> Upload Replacement image
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 w-28 flex-shrink-0">Article Header</label>
                      <input
                        type="text"
                        value={form.articleHeader}
                        onChange={(e) =>
                          setForm({ ...form, articleHeader: e.target.value.slice(0, MAX_HEADER) })
                        }
                        maxLength={MAX_HEADER}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-right">
                      {form.articleHeader.length} out of {MAX_HEADER} characters
                    </p>
                  </div>

                  {/* Summarized text pair */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <input type="checkbox" className="accent-indigo-600" />
                        <label className="text-xs text-gray-600">Summarized article text</label>
                      </div>
                      <textarea
                        value={form.summarizedText}
                        onChange={(e) =>
                          setForm({ ...form, summarizedText: e.target.value.slice(0, MAX_SUMMARY) })
                        }
                        rows={7}
                        maxLength={MAX_SUMMARY}
                        className="w-full text-xs text-gray-600 border border-gray-200 rounded-md p-2.5 resize-none focus:outline-none focus:border-indigo-300"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {form.summarizedText.length} out of {MAX_SUMMARY} characters
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <input type="checkbox" className="accent-indigo-600" />
                        <label className="text-xs text-gray-600">Summarized article text 2</label>
                      </div>
                      <textarea
                        value={form.summarizedText2}
                        onChange={(e) =>
                          setForm({ ...form, summarizedText2: e.target.value.slice(0, MAX_SUMMARY) })
                        }
                        rows={7}
                        maxLength={MAX_SUMMARY}
                        className="w-full text-xs text-gray-600 border border-gray-200 rounded-md p-2.5 resize-none focus:outline-none focus:border-indigo-300"
                      />
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {form.summarizedText2.length} out of {MAX_SUMMARY} characters
                      </p>
                    </div>
                  </div>

                  {/* Similar articles */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-2">
                      Similar Articles from Other Feeds (Check box to Archive similar news)
                    </p>
                    <div className="space-y-1.5">
                      {similarArticles.map((a) => (
                        <div key={a.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={a.checked}
                            onChange={() =>
                              setSimilarArticles((prev) =>
                                prev.map((x) => (x.id === a.id ? { ...x, checked: !x.checked } : x))
                              )
                            }
                            className="accent-indigo-600"
                          />
                          <span className="text-sm text-gray-700">
                            <strong>{a.title}</strong> - {a.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Preview Window */}
            <div>
              <h2 className="text-sm font-semibold text-gray-800 mb-3 text-center">Preview Window</h2>

              {/* Mobile device frame */}
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
                  <div className="bg-white rounded-b-[2rem] overflow-hidden" style={{ minHeight: 460 }}>
                    <img
                      src={MALL_IMG}
                      alt="Preview"
                      className="w-full h-36 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-gray-900 text-sm mb-2">{form.articleHeader || "Article Title"}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-6">
                        {form.summarizedText || "Article summary will appear here..."}
                      </p>
                      <hr className="border-gray-100 my-3" />
                      <div className="h-16 bg-gray-50 rounded"></div>
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

          {/* Footer actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleArchive}
              className="px-5 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Archive
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={15} />
              Save as reviewed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
