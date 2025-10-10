import { createContext, useEffect, useState } from "react";
import themeToken from "./theme.css?raw";

(() => {
  let themeStyle = document.getElementById("--hadesui-theme--");

  if (!themeStyle) {
    themeStyle = document.createElement("style");
    themeStyle.id = "--hadesui-theme--";
    document.head.appendChild(themeStyle);
  }

  themeStyle.textContent = themeToken;
})();

export const ThemeContext = createContext();

export const ThemeProvider = ({ children, defaultTheme = "system" }) => {
  const [theme, _setTheme] = useState(
    () => localStorage.getItem("theme") || defaultTheme
  );

  const setTheme = (nextTheme) => {
    const html = document.documentElement;
    html.classList.add("no-transition");
    _setTheme(nextTheme);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        html.classList.remove("no-transition");
      });
    });
  };

  useEffect(() => {
    const html = document.documentElement;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);

    html.classList.remove("light", "dark");
    html.classList.add(isDark ? "dark" : "light");
    html.setAttribute("data-theme", isDark ? "dark" : "light");
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applySystemTheme = () => {
      if (theme === "system") {
        const prefersDark = mediaQuery.matches;
        const html = document.documentElement;
        html.classList.remove("light", "dark");
        html.classList.add(prefersDark ? "dark" : "light", "no-transition");
        html.dataset.theme = prefersDark ? "dark" : "light";
        document.body.dataset.theme = prefersDark ? "dark" : "light";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            html.classList.remove("no-transition");
          });
        });
      }
    };

    applySystemTheme();

    mediaQuery.addEventListener("change", applySystemTheme);
    return () => mediaQuery.removeEventListener("change", applySystemTheme);
  }, [theme]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "theme") {
        const newTheme = event.newValue || "system";
        setTheme(newTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
