import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import "./index.css";
import { isEmpty } from "../../utils";

function toOtpArray(input, length) {
  const str = (input ?? "").toString().replace(/\D/g, "").slice(0, length);
  const arr = str.split("");
  while (arr.length < length) arr.push("");
  return arr;
}

const OtpInput = ({
  length = 6,
  onChange,
  onBlur,
  disabled,
  value,
  ...rest
}) => {
  const [needOnChange, setNeedOnChange] = useState(false);
  const [valueInternal, setValueInternal] = useState(
    value ? String(value).replace(/\D/g, "").slice(0, length) : undefined
  );
  const valueChange = useRef();
  const otp = useMemo(
    () => toOtpArray(valueInternal, length),
    [valueInternal, length]
  );
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isEmpty(value))
      setValueInternal(String(value).replace(/\D/g, "").slice(0, length));
  }, [value]);

  const joinCode = useCallback((arr) => arr.join(""), []);

  const updateCode = (newOtpArr) => {
    const code = joinCode(newOtpArr);
    setValueInternal(code);
    if (!newOtpArr.includes("")) {
      onChange?.(code);
      setNeedOnChange(true);
      valueChange.current = false;
    } else if (needOnChange && !valueChange.current) {
      valueChange.current = true;
      onChange?.("");
    }
  };

  const handleChange = (value) => {
    if (!/^\d*$/.test(value)) return;

    const firstEmptyIndex = otp.findIndex((val) => val === "");
    if (firstEmptyIndex === -1) return;

    const newOtp = [...otp];
    newOtp[firstEmptyIndex] = value.slice(-1);
    updateCode(newOtp);
    if (firstEmptyIndex < length - 1) {
      requestAnimationFrame(() =>
        inputRefs.current[firstEmptyIndex + 1]?.focus()
      );
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const digits = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!digits) return;

    const activeIndex = inputRefs.current.findIndex(
      (el) => el === document.activeElement
    );

    const nextArr = [...otp];

    let start =
      activeIndex >= 0 ? activeIndex : nextArr.findIndex((c) => c === "");
    if (start === -1) {
      return;
    }

    let i = start;
    let di = 0;
    while (i < length && di < digits.length) {
      nextArr[i] = digits[di];
      i++;
      di++;
    }

    updateCode(nextArr);

    const focusIndex = Math.min(start + di, length - 1);
    requestAnimationFrame(() => inputRefs.current[focusIndex]?.focus());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace") {
      const lastFilledIndex = otp.reduceRight(
        (acc, value, idx) => (value ? (acc === -1 ? idx : acc) : acc),
        -1
      );

      if (lastFilledIndex !== -1) {
        const newOtp = [...otp];
        newOtp[lastFilledIndex] = "";
        updateCode(newOtp);
        inputRefs.current[lastFilledIndex]?.focus();
      }
    }
  };

  const handleClick = () => {
    const firstEmptyIndex = otp.findIndex((val) => val === "");
    inputRefs.current[firstEmptyIndex]?.focus();
  };

  return (
    <div
      tabIndex={-1}
      className="otp-input-container"
      {...rest}
      data-border-red-error="false"
      onBlur={(e) => {
        const next = e.relatedTarget || e.nativeEvent.relatedTarget;
        if (next && e.currentTarget.contains(next)) {
          return;
        }
        onBlur?.(e);
      }}
    >
      {Array.from({ length }).map((_, index) => (
        <input
          title={!isEmpty(otp[index]) ? otp[index] : `OTP-${index + 1}`}
          onClick={handleClick}
          key={index}
          name={`otp-${index}`}
          id={`otp-${index}`}
          type="text"
          value={otp[index]}
          onChange={(e) => handleChange(e.target.value)}
          onPaste={handlePaste}
          disabled={disabled}
          data-disabled-action={disabled}
          data-border-red-error={
            rest["data-border-red-error"] && isEmpty(otp[index])
          }
          onKeyDown={handleKeyDown}
          ref={(el) => (inputRefs.current[index] = el)}
          maxLength={1}
          className="otp-input"
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OtpInput;
