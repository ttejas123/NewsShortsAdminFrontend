import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  followSystem: boolean;
  setFollowSystem: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  setDarkMode: () => {},
  followSystem: false,
  setFollowSystem: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [followSystem, setFollowSystemState] = useState(() => {
    return localStorage.getItem("followSystem") === "true";
  });
  const [darkMode, setDarkModeState] = useState(() => {
    if (localStorage.getItem("followSystem") === "true") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (!followSystem) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setDarkModeState(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [followSystem]);

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    localStorage.setItem("darkMode", String(value));
  };

  const setFollowSystem = (value: boolean) => {
    setFollowSystemState(value);
    localStorage.setItem("followSystem", String(value));
    if (value) {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkModeState(systemDark);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, followSystem, setFollowSystem }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
