import { useCallback, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light" | "system";

type Prefs = {
  autoScroll: boolean;
  showThoughts: boolean;
  showUtils: boolean;
  theme: Theme;
};

const STORAGE_KEY = "aa_prefs_v1";

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { autoScroll: true, showThoughts: true, showUtils: false, theme: "dark" };
    }
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      autoScroll: parsed.autoScroll ?? true,
      showThoughts: parsed.showThoughts ?? true,
      showUtils: parsed.showUtils ?? false,
      theme: parsed.theme ?? "dark",
    };
  } catch {
    return { autoScroll: true, showThoughts: true, showUtils: false, theme: "dark" };
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    
    const root = document.documentElement;
    const isDark = 
      prefs.theme === "dark" || 
      (prefs.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [prefs]);

  useEffect(() => {
    if (prefs.theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = document.documentElement;
      if (mediaQuery.matches) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [prefs.theme]);

  const set = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  return useMemo(() => ({ prefs, set }), [prefs, set]);
}
