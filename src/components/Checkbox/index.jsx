import { useState } from "react";

const Checkbox = ({
  value,
  defaultValue = false,
  indeterminate = false,
  onChange,
  disabled = false,
  ...rest
}) => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const checked = isControlled ? value : internal;

  const toggle = (e) => {
    e.stopPropagation();
    if (disabled) return;

    if (!isControlled) {
      setInternal(!internal);
    }
    onChange?.(!checked);
  };

  return (
    <div
      onClick={toggle}
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      style={{
        width: 14,
        height: 14,
        border: "1px solid var(--hadesui-border-color)",
        borderRadius: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "var(--hadesui-blue-6)" : "white",
        position: "relative",
        flexShrink: 0,
        userSelect: "none",
      }}
      {...rest}
    >
      {checked && (
        <span style={{ color: "white", fontSize: 10, userSelect: "none" }}>
          ✓
        </span>
      )}
      {!checked && indeterminate && (
        <div
          style={{
            width: 8,
            height: 8,
            background: "var(--hadesui-blue-6)",
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
};

export default Checkbox;
