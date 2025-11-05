import { useCallback, useEffect, useRef, useState } from "react";

export function debounce(fn, delay = 300, immediate = false) {
  let timeout;
  let result;

  const debounced = function (...args) {
    const context = this;

    const later = function () {
      timeout = null;
      if (!immediate) {
        result = fn.apply(context, args);
      }
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);

    if (callNow) {
      result = fn.apply(context, args);
    }

    return result;
  };

  debounced.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = function () {
    if (timeout) {
      clearTimeout(timeout);
      fn();
      timeout = null;
    }
  };

  return debounced;
}

export function throttle(fn, delay = 100) {
  let lastCall = 0;
  let timeoutId = null;
  let lastArgs;
  let lastThis;

  function throttled(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    lastArgs = args;
    lastThis = this;

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn.apply(lastThis, lastArgs);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  }

  throttled.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
  };

  throttled.flush = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      fn.apply(lastThis, lastArgs);
      timeoutId = null;
    }
  };

  return throttled;
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
    if (isControlled) initial = value ?? defaultValue ?? defaultStateValue;
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
      const prev = mergedValue;
      const nextInner = typeof next === "function" ? next(prev) : next;
      const nextValue = postState ? postState(nextInner) : nextInner;
      if (!isControlled) {
        setInnerValue(nextValue);
      }
      if (nextValue !== prev) {
        onChangeRef.current?.(nextValue);
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
