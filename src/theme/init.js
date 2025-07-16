(function () {
  try {
    const theme = localStorage.getItem("theme") || "system";
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);
    document.documentElement.classList.add(isDark ? "dark" : "light");
  } catch (_) {}
})();
