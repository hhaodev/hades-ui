export const PlusIcon = ({ size = 14, color = "currentColor", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const CloseIcon = ({ size = 14, color = "currentColor", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const MoreIcon = ({
  size = 14,
  color = "currentColor",
  direction = "horizontal",
  ...props
}) => {
  if (direction === "vertical") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        {...props}
      >
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
};

export const TrashIcon = ({
  size = 14,
  color = "currentColor",
  strokeWidth = 1,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
};

export const TrashOpenIcon = ({
  size = 14,
  color = "currentColor",
  strokeWidth = 1,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M8 3l1.5 3" />
      <path d="M16 3l-1.5 3" />
      <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
};

export const PenIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

export const SaveIcon = ({ size = 14 }) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zM12 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm2-10H6V5h8v4z" />
    </svg>
  );
};
