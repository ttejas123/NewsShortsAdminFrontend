import { useNavigate } from "react-router";

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  bold?: boolean;
  path?: string;
  col: number;
  row: number;
}

const nodes: FlowNode[] = [
  {
    id: "rss-admin",
    label: "RSS Feeds Admin Section",
    sublabel: "(Setup new RSS feeds)",
    bold: true,
    path: "/rss/setup",
    col: 1,
    row: 1,
  },
  {
    id: "rss-list",
    label: "RSS Feeds List -",
    sublabel: "(Editing existing feeds)",
    bold: true,
    path: "/rss/list",
    col: 2,
    row: 1,
  },
  {
    id: "article-queue",
    label: "New Article Queue",
    path: "/articles/queue",
    col: 1,
    row: 2,
  },
  {
    id: "article-edit",
    label: "Article Edit",
    sublabel: "(Articles are summarized using the python script)",
    bold: true,
    path: "/articles/edit",
    col: 1,
    row: 3,
  },
  {
    id: "article-archive",
    label: "Article archive",
    sublabel: "(Articles get cleared every 7 days from Archive)",
    path: "/articles/archive",
    col: 2,
    row: 3,
  },
  {
    id: "approved",
    label: "Articles approved for Publishing",
    path: "/articles/reviewed",
    col: 1,
    row: 4,
  },
  {
    id: "pushed-live",
    label: "Pushed live to users",
    col: 1,
    row: 5,
  },
  {
    id: "live-articles",
    label: "Live Articles",
    sublabel: "(Stays here for 30 days and then deletes it self)",
    col: 1,
    row: 6,
  },
  {
    id: "android",
    label: "Android App",
    col: 1,
    row: 7,
  },
  {
    id: "iphone",
    label: "iPhone App",
    col: 2,
    row: 7,
  },
];

export function FlowDiagram() {
  const navigate = useNavigate();

  const clickableNodes = new Set([
    "rss-admin",
    "rss-list",
    "article-queue",
    "article-edit",
    "article-archive",
    "approved",
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs text-gray-400 mb-1">Admin → Data and Screen Flow</div>
        <h1 className="text-gray-900">Data and Screen Flow</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visual overview of how content flows from RSS ingestion to end-user delivery.
        </p>
      </div>

      {/* Diagram container */}
      <div className="bg-[#d9e4ed] rounded-2xl p-8 flex justify-center">
        <div className="relative" style={{ width: 560, minHeight: 900 }}>
          <svg
            className="absolute inset-0 pointer-events-none"
            width="560"
            height="960"
            viewBox="0 0 560 960"
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
                <polygon points="0 0, 10 3.5, 0 7" fill="#5c7a96" />
              </marker>
            </defs>

            {/* RSS Admin → RSS List (horizontal right) */}
            <line
              x1="200" y1="90" x2="310" y2="90"
              stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* RSS Admin → Article Queue (down) */}
            <line
              x1="100" y1="148" x2="100" y2="250"
              stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* RSS List → Article Queue (curved right to left) */}
            <path
              d="M 390 190 Q 390 265 200 268"
              fill="none" stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* Article Queue → Article Edit (down) */}
            <line
              x1="100" y1="310" x2="100" y2="400"
              stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* Article Queue → Article Archive (right) */}
            <path
              d="M 200 280 Q 390 280 390 400"
              fill="none" stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* Article Edit → Approved (down) */}
            <line
              x1="100" y1="490" x2="100" y2="570"
              stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* Approved → Pushed Live (down) */}
            <line
              x1="100" y1="635" x2="100" y2="668"
              stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* Pushed Live → Live Articles (down) */}
            <line
              x1="100" y1="700" x2="100" y2="730"
              stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* Live Articles → Android (down-left) */}
            <line
              x1="100" y1="820" x2="100" y2="860"
              stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />

            {/* Live Articles → iPhone (down-right) */}
            <path
              d="M 200 820 Q 390 820 390 860"
              fill="none" stroke="#5c7a96" strokeWidth="1.8" markerEnd="url(#arrowhead)"
            />
          </svg>

          {/* Nodes */}

          {/* Row 1 - RSS Admin */}
          <FlowBox
            id="rss-admin"
            label="RSS Feeds Admin Section"
            sublabel="(Setup new RSS feeds)"
            bold
            x={10}
            y={20}
            width={190}
            clickable
            onClick={() => navigate("/rss/setup")}
          />

          {/* Row 1 - RSS List */}
          <FlowBox
            id="rss-list"
            label="RSS Feeds List -"
            sublabel="(Editing existing feeds)"
            bold
            x={310}
            y={20}
            width={175}
            clickable
            onClick={() => navigate("/rss/list")}
          />

          {/* Row 2 - Article Queue */}
          <FlowBox
            id="article-queue"
            label="New Article Queue"
            x={10}
            y={250}
            width={190}
            clickable
            onClick={() => navigate("/articles/queue")}
          />

          {/* Row 3 - Article Edit */}
          <FlowBox
            id="article-edit"
            label="Article Edit"
            sublabel="(Articles are summarized using the python script)"
            bold
            x={10}
            y={400}
            width={190}
            clickable
            onClick={() => navigate("/articles/edit")}
          />

          {/* Row 3 - Archive */}
          <FlowBox
            id="article-archive"
            label="Article archive"
            sublabel="(Articles get cleared every 7 days from Archive)"
            x={310}
            y={400}
            width={175}
            clickable
            onClick={() => navigate("/articles/archive")}
          />

          {/* Row 4 - Approved */}
          <FlowBox
            id="approved"
            label="Articles approved for Publishing"
            x={10}
            y={570}
            width={190}
            clickable
            onClick={() => navigate("/articles/reviewed")}
          />

          {/* Row 5 - Pushed live (label only, no box) */}
          <div
            className="absolute text-sm text-[#3d5a72]"
            style={{ left: 10, top: 668, width: 190, textAlign: "center" }}
          >
            Pushed live to users
          </div>

          {/* Row 6 - Live Articles */}
          <FlowBox
            id="live-articles"
            label="Live Articles"
            sublabel="(Stays here for 30 days and then deletes it self)"
            x={10}
            y={730}
            width={190}
          />

          {/* Row 7 - Android */}
          <FlowBox id="android" label="Android App" x={10} y={860} width={175} />

          {/* Row 7 - iPhone */}
          <FlowBox id="iphone" label="iPhone App" x={310} y={860} width={175} />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-2 border-indigo-400 rounded bg-white"></div>
          <span>Clickable — navigate to screen</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-gray-300 rounded bg-white"></div>
          <span>Informational node</span>
        </div>
      </div>
    </div>
  );
}

function FlowBox({
  label,
  sublabel,
  bold,
  x,
  y,
  width,
  clickable,
  onClick,
}: {
  id: string;
  label: string;
  sublabel?: string;
  bold?: boolean;
  x: number;
  y: number;
  width: number;
  clickable?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`absolute bg-white rounded-lg shadow-sm text-center px-3 py-3 transition-all ${
        clickable
          ? "cursor-pointer border-2 border-transparent hover:border-indigo-400 hover:shadow-md active:scale-95"
          : "border border-gray-200"
      }`}
      style={{ left: x, top: y, width }}
      onClick={clickable ? onClick : undefined}
      title={clickable ? `Navigate to ${label}` : undefined}
    >
      <p className={`text-sm text-[#2c4a63] ${bold ? "font-bold" : ""}`}>{label}</p>
      {sublabel && <p className="text-xs text-[#3d5a72] mt-0.5">{sublabel}</p>}
      {clickable && (
        <div className="mt-1">
          <span className="text-[10px] text-indigo-500 font-medium">→ Open</span>
        </div>
      )}
    </div>
  );
}
