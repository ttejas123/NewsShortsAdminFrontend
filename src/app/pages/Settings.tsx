import React, { useState } from "react";
import { Bell, Shield, Globe, Monitor } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function Settings() {
  const { darkMode, setDarkMode, followSystem, setFollowSystem } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("English");

  const dm = darkMode;

  // Helper class shorthand
  const card = `rounded-xl border shadow-sm overflow-hidden transition-colors duration-200 ${
    dm ? "bg-gray-900 border-gray-700/80" : "bg-white border-gray-200"
  }`;
  const cardHeader = `px-6 py-4 border-b ${
    dm ? "border-gray-700/80 bg-gray-800/60" : "border-gray-100 bg-gray-50/50"
  }`;
  const cardTitle = `text-lg font-semibold flex items-center gap-2 ${dm ? "text-gray-100" : "text-gray-800"}`;
  const text = dm ? "text-gray-100" : "text-gray-900";
  const subtext = dm ? "text-gray-400" : "text-gray-500";
  const divider = `border-t ${dm ? "border-gray-700/80" : "border-gray-100"}`;

  return (
    <div className={`p-6 max-w-4xl mx-auto w-full min-h-screen transition-colors duration-200 ${dm ? "bg-gray-950" : "bg-gray-50"}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${text}`}>Settings</h1>
        <p className={`text-sm mt-1 ${subtext}`}>Manage your preferences and account settings</p>
      </div>

      <div className="space-y-6">
        {/* ─── General Preferences ────────────────────────────────── */}
        <div className={card}>
          <div className={cardHeader}>
            <h2 className={cardTitle}>
              <Globe size={18} className="text-indigo-500" /> General Preferences
            </h2>
          </div>
          <div className="p-6 space-y-6">

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-sm font-medium ${text}`}>Push Notifications</h3>
                <p className={`text-sm ${subtext}`}>Receive alerts when new articles are published or queued.</p>
              </div>
              <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
            </div>

            {/* Dark Mode */}
            <div className={`${divider} pt-6 flex items-center justify-between`}>
              <div>
                <h3 className={`text-sm font-medium ${text}`}>Dark Mode</h3>
                <p className={`text-sm ${subtext}`}>Switch between light and dark themes.</p>
              </div>
              <Toggle
                checked={darkMode}
                onChange={() => {
                  if (followSystem) setFollowSystem(false);
                  setDarkMode(!darkMode);
                }}
                disabled={followSystem}
              />
            </div>

            {/* Follow System */}
            <div className={`${divider} pt-6 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dm ? "bg-gray-800 border border-gray-700" : "bg-indigo-50"}`}>
                  <Monitor size={16} className="text-indigo-500" />
                </div>
                <div>
                  <h3 className={`text-sm font-medium ${text}`}>Follow System Theme</h3>
                  <p className={`text-sm ${subtext}`}>
                    Automatically match your OS dark/light preference.
                    {followSystem && (
                      <span className="ml-1 text-indigo-500 font-medium">
                        (Current: {darkMode ? "Dark" : "Light"})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Toggle checked={followSystem} onChange={() => setFollowSystem(!followSystem)} />
            </div>

            {/* Language */}
            <div className={`${divider} pt-6`}>
              <label htmlFor="language" className={`block text-sm font-medium mb-2 ${text}`}>
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={`block w-full max-w-xs pl-3 pr-10 py-2 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  dm
                    ? "bg-gray-800 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Arabic</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Appearance Preview ─────────────────────────────────── */}
        <div className={card}>
          <div className={cardHeader}>
            <h2 className={cardTitle}>
              <Bell size={18} className="text-indigo-500" /> Appearance Preview
            </h2>
          </div>
          <div className="p-6">
            <div className={`rounded-xl p-4 border transition-all duration-300 ${dm ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Bell size={14} className="text-white" />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${text}`}>Current Theme: {darkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}</p>
                  <p className={`text-xs ${subtext}`}>{followSystem ? "Following system preference" : "Manual override"}</p>
                </div>
              </div>
              <div className={`flex gap-2 text-xs font-medium`}>
                <span className={`px-2.5 py-1 rounded-full ${dm ? "bg-indigo-600/20 text-indigo-400" : "bg-indigo-100 text-indigo-700"}`}>
                  {darkMode ? "Dark" : "Light"} active
                </span>
                {followSystem && (
                  <span className={`px-2.5 py-1 rounded-full ${dm ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-600"}`}>
                    System sync on
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Switch Component ─────────────────────────────────────────────────
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label className={`relative inline-flex items-center ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-gray-700" />
    </label>
  );
}
