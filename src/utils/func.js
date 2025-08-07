import { useCallback, useEffect, useRef, useState } from "react";

export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useMergedState(defaultStateValue, options = {}) {
  const { defaultValue, value, onChange } = options;

  const isControlled = value !== undefined;

  const [innerValue, setInnerValue] = useState(() => {
    if (isControlled) return value;
    if (defaultValue !== undefined)
      return typeof defaultValue === "function" ? defaultValue() : defaultValue;
    return typeof defaultStateValue === "function"
      ? defaultStateValue()
      : defaultStateValue;
  });

  const mergedValue = isControlled ? value : innerValue;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next) => {
      if (!isControlled) {
        setInnerValue(next);
      }
      if (mergedValue !== next && onChangeRef.current) {
        onChangeRef.current(next);
      }
    },
    [isControlled, mergedValue]
  );

  useEffect(() => {
    if (isControlled) {
      setInnerValue(value);
    }
  }, [value]);

  return [mergedValue, setValue];
}
