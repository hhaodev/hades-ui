export function cn(...args) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === "object") {
        return Object.entries(cls)
          .filter(([_, value]) => Boolean(value))
          .map(([key]) => key)
          .join(" ");
      }
      return cls;
    })
    .join(" ")
    .trim();
}
