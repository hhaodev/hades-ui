import themeToken from "./theme.css?raw";
(() => {
  if (typeof document === "undefined") return;
  try {
    const theme = localStorage.getItem("theme") || "system";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);
    document.documentElement.classList.add(isDark ? "dark" : "light");
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
    const themeStyle = document.createElement("style");
    themeStyle.id = "--hadesui-theme--";
    themeStyle.textContent = themeToken;
    document.head.appendChild(themeStyle);
  } catch (_) {}
})();
