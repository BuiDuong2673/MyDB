/** localStorage key for persisted light/dark preference */
export const THEME_STORAGE_KEY = "mydb-theme";

export function applyThemeToDocument(theme: "light" | "dark"): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
}

export function readStoredTheme(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
}
