const SortIcon = ({ activeDirection, isActive }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontSize: 8,
        lineHeight: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <div
        style={{
          opacity: isActive && activeDirection === "asc" ? 1 : 0.3,
          transition: "opacity 0.2s, color 0.2s",
        }}
      >
        ▲
      </div>
      <div
        style={{
          opacity: isActive && activeDirection === "desc" ? 1 : 0.3,
          transition: "opacity 0.2s, color 0.2s",
        }}
      >
        ▼
      </div>
    </div>
  );
};

export default SortIcon;
