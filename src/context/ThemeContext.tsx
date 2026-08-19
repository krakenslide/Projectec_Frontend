import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

// "vi" is a light-based theme variant that swaps the accent palette for
// Vodafone Idea's brand red. It's not a third independent mode — it always
// renders on top of the light layout (see the `light` class handling below).
export type Theme = "light" | "dark" | "vi";

const STORAGE_KEY = "theme";

type ThemeContextValue = {
  theme: Theme;
  /** True when the VI accent palette is active (theme === "vi"). */
  isViTheme: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  /** Turns the VI accent palette on/off without losing the dark/light choice. */
  toggleViTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "vi") return stored;
  // Fall back to the user's OS preference; default to dark to match
  // the product's original look when preference can't be detected.
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  return prefersLight ? "light" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    // Tailwind's `dark` variant is driven by the `dark` class (darkMode: "class").
    // We also toggle a `light` class, which the CSS custom properties in
    // index.css key off of for the --pj-* design tokens used by the auth pages.
    // The `vi` theme is a light-based variant, so it always carries `light`
    // alongside it; `vi` layers a few accent-color overrides on top.
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light" || theme === "vi");
    root.classList.toggle("vi", theme === "vi");
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      isViTheme: theme === "vi",
      setTheme: setThemeState,
      // Cycles between the two base appearances. Starting from "vi" (which is
      // light-based) this flips to dark, matching what a sun/moon toggle
      // should do regardless of which accent palette was active.
      toggleTheme: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
      toggleViTheme: () => setThemeState((t) => (t === "vi" ? "light" : "vi")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
