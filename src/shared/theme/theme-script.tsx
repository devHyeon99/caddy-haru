import { darkTheme, lightTheme } from "./theme.css";
import { THEME_STORAGE_KEY } from "./theme-context";

/**
 * Renders a blocking inline script that applies the correct theme class to
 * <html> before the first paint, preventing the light-to-dark flash (FOUC).
 *
 * The vanilla-extract theme class names are hashed at build time, so they are
 * injected into the script from the server. Keep this in sync with the runtime
 * logic in AppProviders.
 */
export function ThemeScript() {
  const script = `(function () {
  try {
    var mode = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) || "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
    var root = document.documentElement;
    root.classList.remove(${JSON.stringify(lightTheme)}, ${JSON.stringify(darkTheme)});
    root.classList.add(resolved === "dark" ? ${JSON.stringify(darkTheme)} : ${JSON.stringify(lightTheme)});
    root.style.colorScheme = resolved;
  } catch (e) {}
})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
