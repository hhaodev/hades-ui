import { useMergedState } from "../../utils";

const Checkbox = ({
  type = "checkbox", // "checkbox" | "radio"
  value,
  defaultValue = false,
  indeterminate = false,
  onChange,
  disabled = false,
  ...rest
}) => {
  const [checked, setChecked] = useMergedState(false, {
    value,
    defaultValue,
    onChange,
  });

  const toggle = (e) => {
    e.stopPropagation();
    if (disabled) return;
    setChecked(!checked);
  };

  const isRadio = type === "radio";

  return (
    <div
      onClick={toggle}
      role={isRadio ? "radio" : "checkbox"}
      aria-checked={checked}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      style={{
        width: isRadio ? 16 : 15,
        height: isRadio ? 16 : 15,
        border: "1px solid var(--hadesui-border-color)",
        borderRadius: isRadio ? "50%" : 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        background:
          checked && !isRadio
            ? "var(--hadesui-blue-6)"
            : "var(--hadesui-bg-checkbox)",
        flexShrink: 0,
        userSelect: "none",
        overflow: "hidden",
      }}
      {...rest}
    >
      {checked && !isRadio && (
        <div style={{ color: "white", fontSize: 11, userSelect: "none" }}>
          ✓
        </div>
      )}
      {checked && isRadio && (
        <div
          style={{
            width: 8,
            height: 8,
            background: "var(--hadesui-blue-6)",
            borderRadius: "50%",
          }}
        />
      )}
      {!checked && !isRadio && indeterminate && (
        <div
          style={{
            width: 7,
            height: 7,
            background: "var(--hadesui-blue-6)",
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
};

export default Checkbox;
