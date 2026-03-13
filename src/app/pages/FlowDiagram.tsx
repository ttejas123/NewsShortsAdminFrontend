import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Megaphone,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function FlowDiagram() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className={`p-2 rounded-lg transition-colors ${darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"}`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className={`text-xs mb-1 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>Admin → Data and Screen Flow</div>
              <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>System Architecture Flow</h1>
              <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Visual overview of how content flows from RSS ingestion to end-user delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Diagram container */}
        <div className={`rounded-2xl p-8 flex justify-center shadow-inner transition-colors ${darkMode ? "bg-gray-900/40" : "bg-[#d9e4ed]"}`}>
          <div className="relative" style={{ width: 700, minHeight: 960 }}>
            <svg
              className="absolute inset-0 pointer-events-none"
              width="700"
              height="960"
              viewBox="0 0 700 960"
            >
              {/* Arrow marker */}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill={darkMode ? "#4b5563" : "#5c7a96"} />
                </marker>
              </defs>

              {/* RSS Section to Queue */}
              <line x1="100" y1="120" x2="100" y2="230" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />
              <line x1="390" y1="120" x2="100" y2="230" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />
              
              {/* Queue to Edit/Archive */}
              <line x1="100" y1="300" x2="100" y2="380" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />
              <line x1="100" y1="300" x2="390" y2="380" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* Edit to Admin Published */}
              <line x1="100" y1="470" x2="100" y2="550" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* Admin Published to Client Published & Taken Down */}
              <line x1="100" y1="620" x2="100" y2="680" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />
              <line x1="100" y1="620" x2="390" y2="680" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* Client Published to Apps */}
              <line x1="100" y1="750" x2="100" y2="820" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />
              <line x1="100" y1="750" x2="390" y2="820" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* Ads Section */}
              <line x1="580" y1="120" x2="580" y2="820" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" strokeDasharray="4" />
            </svg>

            {/* Row 1 - Ingestion */}
            <FlowBox
              label="RSS Setup"
              sublabel="Add new sources"
              x={10} y={40} width={180}
              clickable onClick={() => navigate("/rss/setup")}
              darkMode={darkMode}
            />
            <FlowBox
              label="RSS Sources"
              sublabel="Manage connections"
              x={300} y={40} width={180}
              clickable onClick={() => navigate("/rss/list")}
              darkMode={darkMode}
            />
            <FlowBox
              label="Ads Manager"
              sublabel="Campaigns & Logic"
              x={500} y={40} width={160}
              clickable onClick={() => navigate("/ads")}
              darkMode={darkMode}
              icon={<Megaphone size={14} className="text-amber-500" />}
            />

            {/* Row 2 - Processing */}
            <FlowBox
              label="Article Queue"
              sublabel="Summarized by AI"
              x={10} y={230} width={180}
              clickable onClick={() => navigate("/articles/queue")}
              darkMode={darkMode}
            />

            {/* Row 3 - Curation */}
            <FlowBox
              label="Editor"
              sublabel="Refine & Feature"
              x={10} y={380} width={180}
              clickable onClick={() => navigate("/articles/new")}
              darkMode={darkMode}
            />
            <FlowBox
              label="Archive"
              sublabel="Auto-cleared (7d)"
              x={300} y={380} width={180}
              darkMode={darkMode}
            />

            {/* Row 4 - Approval */}
            <FlowBox
              label="Admin Published"
              sublabel="Ready for sync"
              x={10} y={550} width={180}
              clickable onClick={() => navigate("/articles/published")}
              darkMode={darkMode}
              icon={<CheckCircle size={14} className="text-emerald-500" />}
            />

            {/* Row 5 - Delivery */}
            <FlowBox
              label="Published Feeds"
              sublabel="Client-side live"
              x={10} y={680} width={180}
              clickable onClick={() => navigate("/feeds/published")}
              darkMode={darkMode}
            />
            <FlowBox
              label="Taken Down"
              sublabel="Removed articles"
              x={300} y={680} width={180}
              clickable onClick={() => navigate("/feeds/taken-down")}
              darkMode={darkMode}
              icon={<Trash2 size={14} className="text-red-500" />}
            />

            {/* Row 6 - End Points */}
            <FlowBox label="Android App" x={10} y={820} width={180} darkMode={darkMode} />
            <FlowBox label="iPhone App" x={300} y={820} width={180} darkMode={darkMode} />
            <div 
              className={`absolute text-center p-3 rounded-lg border border-dashed transition-colors ${darkMode ? "bg-gray-800/20 border-gray-700 text-gray-400" : "bg-white/50 border-gray-300 text-gray-500"}`}
              style={{ left: 500, top: 820, width: 160 }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-1">Integrated Ads</p>
              <p className="text-[10px]">Native ad slots in apps</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap gap-6 text-xs transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded shadow-sm border-2 ${darkMode ? "bg-indigo-500/20 border-indigo-500/50" : "bg-indigo-50 border-indigo-400"}`}></div>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Clickable Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}></div>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Informational</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowBox({
  label,
  sublabel,
  x,
  y,
  width,
  clickable,
  onClick,
  darkMode,
  icon,
}: {
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  clickable?: boolean;
  onClick?: () => void;
  darkMode?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={`absolute rounded-xl shadow-sm text-center px-4 py-3 transition-all duration-200 ${
        clickable
          ? `cursor-pointer border-2 hover:shadow-lg active:scale-95 ${
              darkMode 
                ? "bg-gray-800 border-indigo-500/20 hover:border-indigo-400 hover:bg-gray-700" 
                : "bg-white border-transparent hover:border-indigo-400"
            }`
          : `border ${darkMode ? "bg-gray-900/50 border-gray-800" : "bg-white/80 border-gray-200"}`
      }`}
      style={{ left: x, top: y, width }}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center justify-center gap-2 mb-0.5">
        {icon}
        <p className={`text-sm font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>{label}</p>
      </div>
      {sublabel && <p className={`text-[10px] leading-tight ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{sublabel}</p>}
      {clickable && (
        <div className={`mt-2 text-[9px] font-bold uppercase tracking-tighter ${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
          Open Screen →
        </div>
      )}
    </div>
  );
}
