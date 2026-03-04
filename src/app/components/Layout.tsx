import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Rss,
  FileText,
  CheckSquare,
  Archive,
  GitFork,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ListFilter,
  Plus,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string; icon?: React.ReactNode }[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    path: "/",
  },
  {
    label: "Flow Diagram",
    icon: <GitFork size={18} />,
    path: "/flow",
  },
  {
    label: "RSS Feeds",
    icon: <Rss size={18} />,
    children: [
      { label: "Setup New Feed", path: "/rss/setup", icon: <Plus size={16} /> },
      { label: "Manage Feeds", path: "/rss/list", icon: <ListFilter size={16} /> },
    ],
  },
  {
    label: "Articles",
    icon: <FileText size={18} />,
    children: [
      { label: "New Queue", path: "/articles/queue", icon: <FileText size={16} /> },
      { label: "Article Edit", path: "/articles/edit", icon: <FileText size={16} /> },
      { label: "Reviewed Queue", path: "/articles/reviewed", icon: <CheckSquare size={16} /> },
      { label: "Archive", path: "/articles/archive", icon: <Archive size={16} /> },
    ],
  },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>(["RSS Feeds", "Articles"]);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } bg-[#1e2235] flex flex-col transition-all duration-300 flex-shrink-0 z-20`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Rss size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="text-white font-semibold text-sm tracking-wide truncate">
              FeedAdmin Pro
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {navItems.map((item) => (
            <div key={item.label} className="mb-1">
              {item.path ? (
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {expandedItems.includes(item.label) ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </>
                    )}
                  </button>
                  {sidebarOpen && expandedItems.includes(item.label) && item.children && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-2 rounded-md text-xs transition-colors ${
                              isActive
                                ? "text-white bg-white/15"
                                : "text-gray-500 hover:text-gray-200 hover:bg-white/8"
                            }`
                          }
                        >
                          {child.icon && <span>{child.icon}</span>}
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <Settings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, feeds..."
                className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:border-indigo-300 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                3
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
              >
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User size={14} className="text-indigo-600" />
                </div>
                <span className="text-sm text-gray-700 hidden sm:block">Admin</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <User size={14} /> Profile
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings size={14} /> Settings
                  </button>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
