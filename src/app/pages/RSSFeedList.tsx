import React, { useState, useEffect, useMemo, Fragment } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Edit3,
  Trash2,
  Search,
  MoreVertical,
  Pause,
  Play,
  RefreshCw,
  Tag,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  FileCode,
  Beaker,
  X,
  ChevronRight,
  ChevronDown,
  Copy,
} from "lucide-react";
import { apiClient } from "../services/api";
import type { RSSSource, DashboardSummary } from "../types/api";
import { useDebounce } from "../hook/useDebounce";
import { useTheme } from "../context/ThemeContext";

// --- Enhanced JSON Viewer Components ---

interface JsonNodeProps {
  data: any;
  name?: string | number;
  isLast?: boolean;
  depth?: number;
  initialExpanded?: boolean;
}

function JsonNode({ data, name, isLast = true, depth = 0, initialExpanded = false }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2 || initialExpanded);
  const { darkMode } = useTheme();
  const dm = darkMode;

  const isObject = data !== null && typeof data === "object";
  const isArray = Array.isArray(data);
  const isEmpty = isObject && (isArray ? data.length === 0 : Object.keys(data).length === 0);

  const getTypeColor = (val: any) => {
    if (typeof val === "string") return dm ? "text-emerald-400" : "text-emerald-600";
    if (typeof val === "number") return dm ? "text-blue-400" : "text-blue-600";
    if (typeof val === "boolean") return dm ? "text-purple-400" : "text-purple-600";
    if (val === null) return dm ? "text-gray-500" : "text-gray-400";
    return dm ? "text-gray-300" : "text-gray-700";
  };

  const renderValue = (val: any) => {
    if (typeof val === "string") return `"${val}"`;
    if (val === null) return "null";
    return String(val);
  };

  if (!isObject) {
    return (
      <div className="flex items-start gap-1 py-0.5 ml-4">
        {name !== undefined && (
          <span className={dm ? "text-indigo-400" : "text-indigo-600"}>"{name}": </span>
        )}
        <span className={`${getTypeColor(data)} break-all`}>{renderValue(data)}</span>
        {!isLast && <span className={dm ? "text-gray-600" : "text-gray-400"}>,</span>}
      </div>
    );
  }

  return (
    <div className="py-0.5">
      <div 
        className={`flex items-center gap-1 cursor-pointer hover:bg-white/5 rounded px-1 -mx-1 transition-colors`}
        onClick={() => setExpanded(!expanded)}
      >
        <span className={dm ? "text-gray-500" : "text-gray-400"}>
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        {name !== undefined && (
          <span className={dm ? "text-indigo-400" : "text-indigo-600"}>"{name}": </span>
        )}
        <span className={dm ? "text-gray-400" : "text-gray-500"}>
          {isArray ? `Array(${data.length}) [` : "{"}
          {!expanded && !isEmpty && " ... "}
          {(!expanded || isEmpty) && (isArray ? "]" : "}")}
          {!expanded && !isLast && <span className={dm ? "text-gray-600" : "text-gray-400"}>,</span>}
        </span>
      </div>

      {expanded && !isEmpty && (
        <div className="ml-4 border-l border-gray-800/50 pl-2 mt-0.5">
          {isArray
            ? data.map((item, i) => (
                <JsonNode
                  key={i}
                  data={item}
                  isLast={i === data.length - 1}
                  depth={depth + 1}
                />
              ))
            : Object.entries(data).map(([key, value], i, arr) => (
                <JsonNode
                  key={key}
                  name={key}
                  data={value}
                  isLast={i === arr.length - 1}
                  depth={depth + 1}
                />
              ))}
        </div>
      )}

      {expanded && !isEmpty && (
        <div className={`ml-4 ${dm ? "text-gray-400" : "text-gray-500"}`}>
          {isArray ? "]" : "}"}
          {!isLast && <span className={dm ? "text-gray-600" : "text-gray-400"}>,</span>}
        </div>
      )}
    </div>
  );
}

function JsonViewer({ data, title }: { data: any; title: string }) {
  const { darkMode } = useTheme();
  const dm = darkMode;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("Copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          {title.includes("Parsed") ? <FileCode size={16} className="text-blue-500" /> : <CheckCircle size={16} className="text-emerald-500" />}
          <span className={`text-sm font-medium ${dm ? "text-gray-100" : "text-gray-900"}`}>{title}</span>
        </div>
        <button 
          onClick={copyToClipboard}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${dm ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}`}
          title="Copy JSON"
        >
          <Copy size={14} />
        </button>
      </div>
      <div className={`flex-1 rounded-xl border overflow-hidden flex flex-col ${dm ? "bg-gray-950 border-gray-800" : "bg-gray-50 border-gray-200"}`}>
        <div className="flex-1 overflow-auto p-4 font-mono text-xs custom-scrollbar">
          <JsonNode data={data} initialExpanded={true} />
        </div>
      </div>
    </div>
  );
}

export function RSSFeedList() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [analytics, setAnalytics] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [testId, setTestId] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ parsed_result: any; extractor_js_result: any } | null>(null);
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const limit = 1000;
  const debouncedSearchTerm = useDebounce(search, 500);

  // Dark mode helpers
  const dm = darkMode;
  const cardBg = dm ? "bg-gray-900 border-gray-700/80" : "bg-white border-gray-200";
  const textTitle = dm ? "text-gray-100" : "text-gray-900";
  const textBody = dm ? "text-gray-300" : "text-gray-800";
  const textMuted = dm ? "text-gray-400" : "text-gray-500";
  const borderCol = dm ? "border-gray-800" : "border-gray-100";
  const hoverBg = dm ? "hover:bg-gray-800/50" : "hover:bg-gray-50";
  const inputBg = dm ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-900";

  useEffect(() => {
    loadSources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearchTerm, selectedTags]);

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const data = await apiClient.getDashboardSummary();
      setAnalytics(data);
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const loadSources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allItems: RSSSource[] = [];
      let currentPage = 1;
      let totalPgs = 1;
      let grandTotal = 0;

      // Fetch all pages to display on a single page
      do {
        const response = await apiClient.getRSSSources({
          page: currentPage,
          limit: 100, // Fetch in batches of 100
          search: debouncedSearchTerm || undefined,
        });
        
        allItems = [...allItems, ...response.items];
        totalPgs = response.pagination.totalPages;
        grandTotal = response.pagination.total;
        currentPage++;
      } while (currentPage <= totalPgs);

      setSources(allItems);
      setTotal(grandTotal);
      setTotalPages(1);
      
      // Extract unique tags from all sources - Not available in API
      setAvailableTags([]);
    } catch (err: any) {
      setError(err.message || "Failed to load RSS sources");
      console.error("Failed to load RSS sources:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Client-side filter by tags (you can also implement server-side)
  const filteredSources = selectedTags.length > 0 && sources.length > 0
    ? sources.filter((source) =>
        selectedTags.every((tag) => false) // Tags not available in API
      )
    : sources;

  const { groupedSources, grandTotalFetched, grandTotalSaved } = useMemo(() => {
    const groups: Record<string, {
      provider_name: string;
      sources: RSSSource[];
      total_feeds_fetched_24h: number;
      total_feeds_saved_24h: number;
      last_fetched_at: string | undefined;
    }> = {};

    let grandTotalFetched = 0;
    let grandTotalSaved = 0;

    filteredSources.forEach((source) => {
      const provider = source.provider_name ? source.provider_name.trim() : 'Unknown Provider';
      if (!groups[provider]) {
        groups[provider] = {
          provider_name: provider,
          sources: [],
          total_feeds_fetched_24h: 0,
          total_feeds_saved_24h: 0,
          last_fetched_at: source.last_fetched_at,
        };
      }
      
      const fetched = Number(source.feeds_fetched_24h) || 0;
      const saved = Number(source.feeds_saved_24h) || 0;

      groups[provider].sources.push(source);
      groups[provider].total_feeds_fetched_24h += fetched;
      groups[provider].total_feeds_saved_24h += saved;

      grandTotalFetched += fetched;
      grandTotalSaved += saved;

      if (source.last_fetched_at) {
        if (!groups[provider].last_fetched_at || new Date(source.last_fetched_at) > new Date(groups[provider].last_fetched_at!)) {
          groups[provider].last_fetched_at = source.last_fetched_at;
        }
      }
    });

    return {
      groupedSources: Object.values(groups).sort((a, b) => a.provider_name.localeCompare(b.provider_name)),
      grandTotalFetched,
      grandTotalSaved
    };
  }, [filteredSources]);

  const toggleProvider = (providerName: string) => {
    setExpandedProviders((prev) => {
      const next = new Set(prev);
      if (next.has(providerName)) next.delete(providerName);
      else next.add(providerName);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filteredSources.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredSources.map((s) => s.id)));
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await apiClient.toggleRSSSourceStatus(id, !currentStatus);
      await loadSources();
      setOpenMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to toggle status");
    }
  };

  const deleteFeed = async (id: string) => {
    if (!confirm("Are you sure you want to delete this RSS source?")) return;

    try {
      await apiClient.deleteRSSSource(id);
      await loadSources();
      await loadAnalytics();
      setOpenMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete RSS source");
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} RSS sources?`))
      return;

    try {
      await apiClient.deleteRSSSourcesBulk(Array.from(selected));
      setSelected(new Set());
      await loadSources();
      await loadAnalytics();
    } catch (err: any) {
      alert(err.message || "Failed to delete RSS sources");
    }
  };

  const triggerFetch = async (id: string) => {
    try {
      await apiClient.triggerFeedFetch(id);
      alert("Feed fetch triggered successfully!");
      setOpenMenu(null);
    } catch (err: any) {
      alert(err.message || "Failed to trigger feed fetch");
    }
  };

  const handleTest = async (id: string) => {
    try {
      setTestId(id);
      setTestLoading(true);
      setTestResult(null);
      const data = await apiClient.testRSSSource(id);
      setTestResult(data);
    } catch (err: any) {
      alert(err.message || "Failed to test RSS source");
      setTestId(null);
    } finally {
      setTestLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSearch("");
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={`text-xs mb-1 ${textMuted}`}>Admin → RSS Feeds → Manage Sources</div>

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className={textTitle}>RSS Feed Sources</h1>
          <p className={`text-sm mt-0.5 ${textMuted}`}>
            Manage RSS sources and monitor feed analytics.
          </p>
        </div>
        <button
          onClick={() => navigate("/rss/setup")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add New Source
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analyticsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-xl border p-4 shadow-sm animate-pulse ${cardBg}`}
            >
              <div className={`h-4 rounded w-24 mb-2 ${dm ? "bg-gray-800" : "bg-gray-200"}`}></div>
              <div className={`h-8 rounded w-16 ${dm ? "bg-gray-800" : "bg-gray-200"}`}></div>
            </div>
          ))
        ) : analytics ? (
          <>
            <div className={`rounded-xl border p-4 shadow-sm ${cardBg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Activity size={16} className="text-indigo-500" />
                <p className={`text-xs font-medium ${textMuted}`}>Total Feeds</p>
              </div>
              <p className={`text-2xl font-semibold ${textTitle}`}>
                {analytics.total_feeds.toLocaleString()}
              </p>
              <p className={`text-[10px] mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Fetched all time</p>
            </div>

            <div className={`rounded-xl border p-4 shadow-sm ${cardBg}`}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} className="text-emerald-500" />
                <p className={`text-xs font-medium ${textMuted}`}>Active Sources</p>
              </div>
              <p className={`text-2xl font-semibold ${textTitle}`}>
                {analytics.active_rss_sources}
              </p>
              <p className={`text-[10px] mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                of {analytics.total_rss_sources} total
              </p>
            </div>

            <div className={`rounded-xl border p-4 shadow-sm ${cardBg}`}>
              <div className="flex items-center gap-2 mb-1">
                <Clock size={16} className="text-amber-500" />
                <p className={`text-xs font-medium ${textMuted}`}>Cron Runs (24h)</p>
              </div>
              <p className={`text-2xl font-semibold ${textTitle}`}>
                {analytics.recent_cron_runs_24h}
              </p>
              <p className={`text-[10px] mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Last 24 hours</p>
            </div>

            <div className={`rounded-xl border p-4 shadow-sm ${cardBg}`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={16} className="text-blue-500" />
                <p className={`text-xs font-medium ${textMuted}`}>Avg Engagement</p>
              </div>
              <p className={`text-2xl font-semibold ${textTitle}`}>
                {Number.parseFloat(analytics.avg_engagement_score).toFixed(2)}
              </p>
              <p className={`text-[10px] mt-1 ${dm ? "text-gray-500" : "text-gray-400"}`}>Score</p>
            </div>
          </>
        ) : null}
      </div>

      {/* Error Alert */}
      {error && (
        <div className={`mb-6 border rounded-lg p-4 flex items-start gap-3 ${
          dm ? "bg-red-900/20 border-red-800/50" : "bg-red-50 border-red-200"
        }`}>
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className={`text-sm font-medium ${dm ? "text-red-400" : "text-red-800"}`}>Error loading sources</p>
            <p className={`text-xs mt-1 ${dm ? "text-red-500/80" : "text-red-600"}`}>{error}</p>
          </div>
          <button
            onClick={loadSources}
            className={`text-sm font-medium ${dm ? "text-red-400 hover:text-red-300" : "text-red-700 hover:text-red-900"}`}
          >
            Retry
          </button>
        </div>
      )}

      <div className={`rounded-xl border shadow-sm ${cardBg}`}>
        {/* Toolbar */}
        <div className={`px-5 py-4 border-b space-y-3 ${borderCol}`}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-48">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search sources by name or URL..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${inputBg}`}
              />
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className={`text-sm ${textMuted}`}>{selected.size} selected</span>
                <button
                  onClick={deleteSelected}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors border ${
                    dm ? "text-red-400 border-red-900/50 hover:bg-red-500/10" : "text-red-600 border-red-200 hover:bg-red-50"
                  }`}
                >
                  Delete Selected
                </button>
              </div>
            )}
            <button
              onClick={loadSources}
              className={`p-2 rounded-lg transition-colors ${dm ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          {/* Tag Filters */}
          {availableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-medium ${textMuted}`}>Filter by tags:</span>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-indigo-600 text-white"
                      : dm
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Tag size={12} />
                  {tag}
                </button>
              ))}
              {(selectedTags.length > 0 || search) && (
                <button
                  onClick={clearFilters}
                  className={`text-xs font-medium ml-2 ${dm ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-700"}`}
                >
                  Clear filters
                </button>
              )}
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
                    checked={selected.size === sources.length && sources.length > 0}
                    onChange={toggleAll}
                    className="accent-indigo-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Source Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Language
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Region
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Feeds
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Fetched (24h)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Saved (24h)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Last Fetched
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dm ? "divide-gray-800" : "divide-gray-100"}`}>
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto" />
                    <p className={`text-sm mt-2 ${textMuted}`}>Loading sources...</p>
                  </td>
                </tr>
              ) : groupedSources.length === 0 ? (
                <tr>
                  <td colSpan={11} className={`px-4 py-12 text-center text-sm ${textMuted}`}>
                    {selectedTags.length > 0 || search
                      ? "No sources found matching your filters"
                      : "No RSS sources yet. Add one to get started!"}
                  </td>
                </tr>
              ) : (
                groupedSources.map((group) => (
                  <Fragment key={group.provider_name}>
                    {/* Header Row for Provider */}
                    <tr
                      className={`transition-colors border-b ${dm ? "bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60" : "bg-gray-50 border-gray-200 hover:bg-gray-100"} cursor-pointer`}
                      onClick={() => toggleProvider(group.provider_name)}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        {/* Empty checkbox space for the group row */}
                      </td>
                      <td className="px-4 py-3" colSpan={5}>
                        <div className="flex items-center gap-2">
                          <button className={`p-1 rounded transition-colors ${dm ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-600"}`}>
                            {expandedProviders.has(group.provider_name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                          <span className={`font-semibold ${textTitle}`}>{group.provider_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${dm ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-100 text-indigo-700"}`}>
                            {group.sources.length} {group.sources.length === 1 ? 'source' : 'sources'}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-semibold ${textTitle}`}>
                        {group.total_feeds_fetched_24h}
                        {grandTotalFetched > 0 && (
                          <span className={`ml-1 text-xs font-normal ${textMuted}`}>
                            ({((group.total_feeds_fetched_24h / grandTotalFetched) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 font-semibold ${textTitle}`}>
                        {group.total_feeds_saved_24h}
                        {grandTotalSaved > 0 && (
                          <span className={`ml-1 text-xs font-normal ${textMuted}`}>
                            ({((group.total_feeds_saved_24h / grandTotalSaved) * 100).toFixed(1)}%)
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 ${textMuted}`}>
                        {formatDate(group.last_fetched_at)}
                      </td>
                      <td className="px-4 py-3" colSpan={2}></td>
                    </tr>
                    
                    {/* Expanded Source Rows */}
                    {expandedProviders.has(group.provider_name) &&
                      group.sources.map((source) => (
                        <tr
                          key={source.id}
                          className={`transition-colors border-b last:border-0 ${
                            selected.has(source.id)
                              ? dm ? "bg-indigo-900/20 border-indigo-900/40" : "bg-indigo-50 border-indigo-100"
                              : dm ? "bg-gray-900/40 border-gray-800/50 hover:bg-gray-800/40" : "bg-white border-gray-100 hover:bg-gray-50/50"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(source.id)}
                              onChange={() => toggleSelect(source.id)}
                              className="accent-indigo-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 pl-8">
                            <div className={`font-medium text-sm ${textTitle}`}>
                              {source.provider_name}
                            </div>
                            <div className={`text-xs truncate max-w-64 ${textMuted}`}>
                              {source.rss_url}
                            </div>
                          </td>
                          <td className={`px-4 py-3 ${textBody}`}>
                            {source.language_code || "N/A"}
                          </td>
                          <td className={`px-4 py-3 ${textBody}`}>N/A</td>
                          <td className={`px-4 py-3 ${textBody}`}>N/A</td>
                          <td className={`px-4 py-3 ${textBody}`}>-</td>
                          <td className={`px-4 py-3 ${textBody}`}>
                            {source.feeds_fetched_24h || 0}
                          </td>
                          <td className={`px-4 py-3 ${textBody}`}>
                            {source.feeds_saved_24h || 0}
                          </td>
                          <td className={`px-4 py-3 ${textMuted}`}>
                            {formatDate(source.last_fetched_at)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                source.is_active
                                  ? dm ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-100 text-emerald-700"
                                  : dm ? "bg-gray-800 text-gray-400 border border-gray-700" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {source.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 relative">
                              <button
                                onClick={() => triggerFetch(source.id)}
                                className={`p-1.5 rounded-md transition-colors ${dm ? "text-gray-400 hover:text-emerald-400 hover:bg-white/5" : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                                title="Fetch Feeds"
                              >
                                <RefreshCw size={15} />
                              </button>
                              <button
                                onClick={() => handleTest(source.id)}
                                className={`p-1.5 rounded-md transition-colors ${dm ? "text-gray-400 hover:text-amber-400 hover:bg-white/5" : "text-gray-400 hover:text-amber-600 hover:bg-amber-50"}`}
                                title="Test Extractor"
                              >
                                <Beaker size={15} />
                              </button>
                              <button
                                onClick={() => navigate(`/rss/setup?id=${source.id}`)}
                                className={`p-1.5 rounded-md transition-colors ${dm ? "text-gray-400 hover:text-indigo-400 hover:bg-white/5" : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"}`}
                                title="Edit"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() =>
                                  setOpenMenu(openMenu === source.id ? null : source.id)
                                }
                                className={`p-1.5 rounded-md transition-colors ${dm ? "text-gray-400 hover:text-gray-200 hover:bg-white/5" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"}`}
                              >
                                <MoreVertical size={15} />
                              </button>
                              {openMenu === source.id && (
                                <div className={`absolute right-0 top-8 w-48 rounded-lg shadow-lg border py-1 z-20 ${dm ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
                                  <button
                                    onClick={() => triggerFetch(source.id)}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${dm ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"}`}
                                  >
                                    <RefreshCw size={14} /> Trigger Fetch
                                  </button>
                                  <button
                                    onClick={() => handleTest(source.id)}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${dm ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"}`}
                                  >
                                    <Beaker size={14} /> Test Extractor
                                  </button>
                                  <button
                                    onClick={() => toggleStatus(source.id, source.is_active)}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${dm ? "text-gray-300 hover:bg-white/5" : "text-gray-700 hover:bg-gray-50"}`}
                                  >
                                    {source.is_active ? (
                                      <>
                                        <Pause size={14} /> Pause Source
                                      </>
                                    ) : (
                                      <>
                                        <Play size={14} /> Activate Source
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => deleteFeed(source.id)}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 ${dm ? "text-red-400 hover:bg-red-500/10" : "text-red-600 hover:bg-red-50"}`}
                                  >
                                    <Trash2 size={14} /> Delete Source
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                ))
              )}
              
              {/* Grand Total Row */}
              {groupedSources.length > 0 && (
                <tr className={`border-t-2 ${dm ? "border-gray-700 bg-gray-800/80 text-gray-100" : "border-gray-200 bg-gray-100/80 text-gray-900"}`}>
                  <td className="px-4 py-4 text-right font-bold uppercase tracking-wider text-xs" colSpan={6}>
                    Grand Total
                  </td>
                  <td className="px-4 py-4 font-bold">
                    {grandTotalFetched}
                  </td>
                  <td className="px-4 py-4 font-bold">
                    {grandTotalSaved}
                  </td>
                  <td className="px-4 py-4" colSpan={3}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info (Pagination removed since all items are shown) */}
        <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${borderCol} ${textMuted}`}>
          <span>
            Showing {filteredSources.length === 0 ? 0 : 1} to {filteredSources.length} of {total} sources
            {selectedTags.length > 0 && ` (filtered by ${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''})`}
          </span>
        </div>
      </div>

      {/* Test Result Modal */}
      {testId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border shadow-2xl flex flex-col ${cardBg}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${borderCol}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <Beaker size={20} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${textTitle}`}>Extractor Test Results</h3>
                  <p className={`text-xs ${textMuted}`}>Source ID: {testId}</p>
                </div>
              </div>
              <button
                onClick={() => setTestId(null)}
                className={`p-2 rounded-full transition-colors ${dm ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {testLoading ? (
                <div className="py-24 text-center">
                  <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto" />
                  <p className={`mt-4 text-sm ${textMuted}`}>Parsing RSS and applying extractor...</p>
                </div>
              ) : testResult ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <JsonViewer data={testResult.parsed_result} title="Parsed RSS Data (First Item)" />
                  <JsonViewer data={testResult.extractor_js_result} title="Extractor JS Result" />
                </div>
              ) : (
                <div className="py-24 text-center">
                  <AlertCircle size={40} className="text-red-500 mx-auto" />
                  <p className={`mt-4 text-sm ${textMuted}`}>Failed to get test results.</p>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex justify-end ${borderCol}`}>
              <button
                onClick={() => setTestId(null)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
