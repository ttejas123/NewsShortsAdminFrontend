import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Megaphone,
  Trash2,
  CheckCircle,
  Zap,
  Cpu,
  Layers,
  Activity,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function FlowDiagram() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${darkMode ? "bg-gray-950" : "bg-gray-50"}`}>
      <div className="max-w-[1050px] mx-auto">
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
                Visual overview of automated content processing, manual curation, and recommendation ranking.
              </p>
            </div>
          </div>
        </div>

        {/* Diagram container */}
        <div className={`rounded-2xl p-8 flex justify-center shadow-inner transition-colors ${darkMode ? "bg-gray-900/40" : "bg-[#d9e4ed]"} overflow-x-auto`}>
          <div className="relative" style={{ width: 940, minHeight: 880 }}>
            <svg
              className="absolute inset-0 pointer-events-none"
              width="940"
              height="880"
              viewBox="0 0 940 880"
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

              {/* 1. RSS Setup to RSS Sources */}
              <line x1="200" y1="77.5" x2="255" y2="77.5" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 2. RSS Sources to Article Queue */}
              {/* <path d="M 350 115 L 350 145 L 110 145 L 110 175" fill="none" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" /> */}

              {/* 3. RSS Sources to Rehydration */}
              <path d="M 350 115 L 350 145 L 590 145 L 590 175" fill="none" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 4. Article Queue to Editor */}
              <line x1="110" y1="255" x2="110" y2="315" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 5. Article Queue to Archive */}
              <path d="M 110 255 L 110 285 L 350 285 L 350 315" fill="none" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 6. Editor to Admin Published */}
              <line x1="110" y1="395" x2="110" y2="455" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 7. Rehydration to Cloud Analysis */}
              <line x1="590" y1="255" x2="590" y2="315" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 8. Cloud Analysis to Published Feeds (DIRECT AUTO-PUBLISH) */}
              <path 
                d="M 590 395 L 590 415 L 470 415 L 470 560 L 350 560 L 350 595" 
                fill="none" 
                stroke={darkMode ? "#44617d" : "#5c7a96"} 
                strokeWidth="2.5" 
                strokeDasharray="4,4" 
                markerEnd="url(#arrowhead)" 
              />
              <text x="465" y="487" transform="rotate(-90, 465, 487)" textAnchor="middle" className={`text-[10px] font-bold ${darkMode ? "fill-emerald-400" : "fill-emerald-600"}`}>DIRECT AUTO-PUBLISH</text>

              {/* 9. Admin Published to Published Feeds */}
              <path d="M 110 535 L 110 570 L 310 570 L 310 595" fill="none" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 10. Recommendations to Published Feeds (Ranking) */}
              <path d="M 590 535 L 590 580 L 390 580 L 390 595" fill="none" stroke={darkMode ? "#818cf8" : "#6366f1"} strokeDasharray="6,2" markerEnd="url(#arrowhead)" strokeWidth="2" />
              <text x="490" y="574" textAnchor="middle" className={`text-[9px] font-bold ${darkMode ? "fill-indigo-400" : "fill-indigo-600"}`}>10MIN CRON RANKING</text>

              {/* 11. Published Feeds to Taken Down */}
              <line x1="440" y1="637.5" x2="495" y2="637.5" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 12. Published Feeds to Android */}
              <path d="M 350 675 L 350 705 L 230 705 L 230 735" fill="none" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 13. Published Feeds to iPhone */}
              <path d="M 350 675 L 350 705 L 470 705 L 470 735" fill="none" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" markerEnd="url(#arrowhead)" />

              {/* 14. Ads Manager to Integrated Ads */}
              <line x1="820" y1="115" x2="820" y2="735" stroke={darkMode ? "#4b5563" : "#5c7a96"} strokeWidth="1.8" strokeDasharray="4" markerEnd="url(#arrowhead)" />
            </svg>

            {/* Row 1 - Ingestion */}
            <FlowBox
              label="RSS Setup"
              sublabel="Add new sources"
              x={20} y={40} width={180}
              clickable onClick={() => navigate("/rss/setup")}
              darkMode={darkMode}
              icon={<Zap size={14} className="text-yellow-500" />}
            />
            <FlowBox
              label="RSS Sources"
              sublabel="Manage connections"
              x={260} y={40} width={180}
              clickable onClick={() => navigate("/rss/list")}
              darkMode={darkMode}
            />
            <FlowBox
              label="Ads Manager"
              sublabel="Campaigns & Logic"
              x={740} y={40} width={160}
              clickable onClick={() => navigate("/ads")}
              darkMode={darkMode}
              icon={<Megaphone size={14} className="text-amber-500" />}
            />

            {/* Row 2 - Automated Processing (Backend Only) */}
            <FlowBox
              label="Article Queue"
              sublabel="Awaiting review"
              x={20} y={180} width={180}
              clickable onClick={() => navigate("/articles/queue")}
              darkMode={darkMode}
              icon={<Clock size={14} className="text-blue-400" />}
            />
            <FlowBox
              label="Rehydration"
              sublabel="Python / Newspaper3k"
              x={500} y={180} width={180}
              darkMode={darkMode}
              icon={<Cpu size={14} className="text-indigo-400" />}
            />

            {/* Row 3 - Logic & Waiting Queue */}
            <FlowBox
              label="Editor"
              sublabel="Refine & Feature"
              x={20} y={320} width={180}
              clickable onClick={() => navigate("/articles/new")}
              darkMode={darkMode}
            />
            <FlowBox
              label="Archive"
              sublabel="Auto-cleared (7d)"
              x={260} y={320} width={180}
              darkMode={darkMode}
            />
            <FlowBox
              label="Cloud Analysis"
              sublabel="Tags & Sentiment"
              x={500} y={320} width={180}
              darkMode={darkMode}
              icon={<Activity size={14} className="text-emerald-400" />}
            />

            {/* Row 4 - Manual Curation / Logic */}
            <FlowBox
              label="Admin Published"
              sublabel="Manually approved"
              x={20} y={460} width={180}
              clickable onClick={() => navigate("/articles/published")}
              darkMode={darkMode}
              icon={<CheckCircle size={14} className="text-emerald-500" />}
            />
            <FlowBox
              label="Recommendation Engine"
              sublabel="Ranking Algorithms"
              x={500} y={460} width={180}
              clickable onClick={() => navigate("/recommendations")}
              darkMode={darkMode}
              icon={<Layers size={14} className="text-indigo-500" />}
            />

            {/* Row 5 - Delivery & Safety */}
            <FlowBox
              label="Published Feeds"
              sublabel="Client-side live stream"
              x={260} y={600} width={180}
              clickable onClick={() => navigate("/feeds/published")}
              darkMode={darkMode}
              icon={<ShieldCheck size={14} className="text-emerald-600" />}
            />
            <FlowBox
              label="Taken Down"
              sublabel="Blocked articles"
              x={500} y={600} width={180}
              clickable onClick={() => navigate("/feeds/taken-down")}
              darkMode={darkMode}
              icon={<Trash2 size={14} className="text-red-500" />}
            />

            {/* Row 6 - End Points */}
            <FlowBox label="Android App" x={140} y={740} width={180} darkMode={darkMode} />
            <FlowBox label="iPhone App" x={380} y={740} width={180} darkMode={darkMode} />
            <div 
              className={`absolute text-center p-3 rounded-lg border border-dashed transition-colors ${darkMode ? "bg-gray-800/20 border-gray-700 text-gray-400" : "bg-white/50 border-gray-300 text-gray-500"}`}
              style={{ left: 740, top: 740, width: 160 }}
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
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Clickable Interface</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded shadow-sm border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}></div>
            <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Background Process</span>
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
