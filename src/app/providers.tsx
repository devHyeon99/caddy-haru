"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { darkTheme, lightTheme } from "@/styles/theme.css";
import { THEME_STORAGE_KEY } from "./theme-script";

export type ThemeMode = "system" | "light" | "dark";

function readStoredMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveTheme(mode: ThemeMode, matchesDark: boolean) {
  return mode === "system" ? (matchesDark ? "dark" : "light") : mode;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [mode, setMode] = useState<ThemeMode>(readStoredMode);

  const handleSetMode = useCallback((next: ThemeMode) => {
    setMode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolved = resolveTheme(mode, mediaQuery.matches);
      const root = document.documentElement;

      root.classList.remove(lightTheme, darkTheme);
      root.classList.add(resolved === "dark" ? darkTheme : lightTheme);
      root.style.colorScheme = resolved;
    };

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [mode]);

  const themeValue = useMemo(
    () => ({ mode, setMode: handleSetMode }),
    [mode, handleSetMode],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={themeValue}>
        {children}
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within AppProviders");
  }

  return context;
}
