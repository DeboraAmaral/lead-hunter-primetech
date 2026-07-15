import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type Language = "pt-BR" | "en-US" | "es";

export interface AppSettings {
  companyName: string;
  logoUrl?: string;
  defaultSearchLimit: number;
  theme: ThemeMode;
  language: Language;
}

const DEFAULT_SETTINGS: AppSettings = {
  companyName: "PrimeTech",
  logoUrl: "",
  defaultSearchLimit: 25,
  theme: "light",
  language: "pt-BR",
};

const STORAGE_KEY = "leadhunter.settings.v1";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  toggleTheme: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings, hydrated]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      settings,
      updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
      toggleTheme: () =>
        setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
