import React, { useState, useRef, useEffect } from "react";
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
  User,
  Settings,
  LogOut,
  ListFilter,
  Plus,
  Users,
  Megaphone,
  CreditCard,
  CheckCheck,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

import { apiClient } from "../services/api";
import { AdminNotification } from "../types/api";
import { getCurrentUser } from "../helper/getCurrentUser";

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
      { label: "Article Queue", path: "/articles/queue", icon: <FileText size={16} /> },
      { label: "New Article", path: "/articles/new", icon: <Plus size={16} /> },
      { label: "Published (Admin)", path: "/articles/published", icon: <CheckSquare size={16} /> },
    ],
  },
  {
    label: "Published Articles",
    icon: <FileText size={18} />,
    children: [
      { label: "Live Feeds", path: "/feeds/published", icon: <FileText size={16} /> },
      { label: "Taken Down", path: "/feeds/taken-down", icon: <Archive size={16} /> },
    ],
  },
  {
    label: "User Management",
    icon: <Users size={18} />,
    children: [
      { label: "Users", path: "/users", icon: <User size={16} /> },
      { label: "Subscriptions", path: "/subscriptions", icon: <CreditCard size={16} /> },
    ],
  },
  {
    label: "Ads Management",
    icon: <Megaphone size={18} />,
    path: "/ads",
  }
];

const notifIconMap = {
  NEW_ARTICLES: <FileText size={14} className="text-blue-400" />,
  RSS_ERROR: <AlertTriangle size={14} className="text-amber-400" />,
  ADMIN_PUBLISHED: <CheckCheck size={14} className="text-emerald-400" />,
  SYSTEM_HEALTH: <Info size={14} className="text-blue-400" />,
  NEW_REGISTRATION: <Users size={14} className="text-indigo-400" />,
};

const notifColorMap = {
  NEW_ARTICLES: "bg-blue-500/10 border-blue-500/20",
  RSS_ERROR: "bg-amber-500/10 border-amber-500/20",
  ADMIN_PUBLISHED: "bg-emerald-500/10 border-emerald-500/20",
  SYSTEM_HEALTH: "bg-blue-500/10 border-blue-500/20",
  NEW_REGISTRATION: "bg-indigo-500/10 border-indigo-500/20",
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const currentUser = getCurrentUser();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.getAdminNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // Poll every 5 minutes
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const markAllRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const dismissNotif = (id: string) => {
    // Current API doesn't have a delete endpoint for notifications, only UI-side dismissal
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Dark mode class helpers
  const dm = darkMode;

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-200 ${dm ? "bg-gray-950" : "bg-gray-50"}`}>
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
              Yalla News Admin
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
          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Settings size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header
          className={`h-14 flex items-center px-4 gap-4 flex-shrink-0 z-10 border-b transition-colors duration-200 ${
            dm
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors ${dm ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            </svg>
          </button>

          <div className="ml-auto flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className={`relative p-2 rounded-lg transition-colors ${
                  dm
                    ? "text-gray-400 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Panel */}
              {notifOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-[360px] rounded-xl shadow-2xl border overflow-hidden z-50 ${
                    dm
                      ? "bg-gray-900 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  {/* Panel header */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 border-b ${
                      dm ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-gray-50/80"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Bell size={15} className={dm ? "text-indigo-400" : "text-indigo-600"} />
                      <span className={`font-semibold text-sm ${dm ? "text-white" : "text-gray-900"}`}>
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className={`text-xs font-medium flex items-center gap-1 ${
                          dm ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
                        }`}
                      >
                        <CheckCheck size={13} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification list */}
                  <div className="max-h-[380px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className={`py-12 flex flex-col items-center gap-2 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                        <Bell size={28} />
                        <span className="text-sm font-medium">All caught up!</span>
                        <span className="text-xs">No notifications right now.</span>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.is_read && markRead(n.id)}
                          className={`group relative flex gap-3 px-4 py-3 border-b cursor-pointer transition-colors ${
                            dm
                              ? `border-gray-800 ${n.is_read ? "hover:bg-gray-800/50" : "bg-indigo-950/30 hover:bg-gray-800/50"}`
                              : `border-gray-100 ${n.is_read ? "hover:bg-gray-50" : "bg-indigo-50/60 hover:bg-indigo-50"}`
                          }`}
                        >
                          {/* Type icon */}
                          <div
                            className={`mt-0.5 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border ${notifColorMap[n.type]}`}
                          >
                            {notifIconMap[n.type]}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-xs font-semibold truncate ${dm ? "text-gray-100" : "text-gray-900"}`}>
                                {n.title}
                              </p>
                              <span className={`text-[10px] flex-shrink-0 ${dm ? "text-gray-500" : "text-gray-400"}`}>
                                {formatTime(n.created_at)}
                              </span>
                            </div>
                            <p className={`text-xs mt-0.5 leading-relaxed ${dm ? "text-gray-400" : "text-gray-500"}`}>
                              {n.message}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {!n.is_read && (
                            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          )}

                          {/* Dismiss button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dismissNotif(n.id);
                            }}
                            className={`opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5 transition-opacity ${
                              dm ? "text-gray-600 hover:text-gray-300" : "text-gray-300 hover:text-gray-500"
                            }`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Panel footer */}
                  {notifications.length > 0 && (
                    <div
                      className={`px-4 py-2.5 border-t text-center ${
                        dm ? "border-gray-800 bg-gray-900" : "border-gray-100 bg-gray-50/80"
                      }`}
                    >
                      <button
                        className={`text-xs font-medium ${
                          dm ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-700"
                        }`}
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotifOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                  dm ? "hover:bg-white/10" : "hover:bg-gray-100"
                }`}
              >
                <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                  {
                    currentUser?.profile_picture ? (
                      <img src={currentUser.profile_picture} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      <User size={14} className="text-indigo-600" />
                    )
                  }
                </div>
                <span className={`text-sm hidden sm:block ${dm ? "text-gray-200" : "text-gray-700"}`}>
                  {currentUser?.display_name}
                </span>
                <ChevronDown size={14} className={dm ? "text-gray-400" : "text-gray-400"} />
              </button>
              {profileOpen && (
                <div
                  className={`absolute right-0 top-full mt-1 w-44 rounded-lg shadow-lg border py-1 z-50 ${
                    dm ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => { setProfileOpen(false); navigate("/profile"); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                      dm ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <User size={14} /> Profile
                  </button>
                  <button
                    onClick={() => { setProfileOpen(false); navigate("/settings"); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                      dm ? "text-gray-300 hover:bg-white/10" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <div className={`border-t mt-1 pt-1 ${dm ? "border-gray-700" : "border-gray-100"}`}>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        navigate("/login");
                        window.location.reload();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          className={`flex-1 overflow-auto transition-colors duration-200 ${
            dm ? "bg-gray-950" : "bg-gray-50"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
