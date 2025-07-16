import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children, defaultTheme = "system" }) => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || defaultTheme
  );

  useEffect(() => {
    const html = document.documentElement;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark = theme === "dark" || (theme === "system" && prefersDark);

    html.classList.remove("light", "dark");
    html.classList.add(isDark ? "dark" : "light");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const prefersDark = mediaQuery.matches;
        const html = document.documentElement;
        html.classList.remove("light", "dark");
        html.classList.add(prefersDark ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
