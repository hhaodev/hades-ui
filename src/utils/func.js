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
  const { defaultValue, value, onChange, postState } = options;

  const isControlled = value !== undefined;

  const [innerValue, setInnerValue] = useState(() => {
    let initial;
    if (isControlled) initial = value;
    else if (defaultValue !== undefined)
      initial =
        typeof defaultValue === "function" ? defaultValue() : defaultValue;
    else
      initial =
        typeof defaultStateValue === "function"
          ? defaultStateValue()
          : defaultStateValue;

    return postState ? postState(initial) : initial;
  });

  const mergedValue = isControlled
    ? postState
      ? postState(value)
      : value
    : innerValue;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next) => {
      const nextValue = postState ? postState(next) : next;
      if (!isControlled) {
        setInnerValue(nextValue);
      }
      if (mergedValue !== nextValue && onChangeRef.current) {
        onChangeRef.current(nextValue);
      }
    },
    [isControlled, mergedValue, postState]
  );

  useEffect(() => {
    if (isControlled) {
      const v = postState ? postState(value) : value;
      setInnerValue(v);
    }
  }, [value, isControlled, postState]);

  return [mergedValue, setValue];
}
