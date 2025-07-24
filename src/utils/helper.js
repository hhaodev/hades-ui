import { useEffect } from "react";

function getElement(refOrEl) {
  if (!refOrEl) return document.documentElement;
  if (refOrEl instanceof Element) return refOrEl;
  return refOrEl?.current ?? null;
}

export function hasScrollbar(refOrEl) {
  const el = getElement(refOrEl);
  if (!el) return false;
  return el.scrollHeight > el.clientHeight;
}

export function getScrollbarWidth(refOrEl) {
  const el = getElement(refOrEl);

  if (el && el !== document.body && el !== document.documentElement) {
    if (!hasScrollbar(el)) return 0;
    return el.offsetWidth - el.clientWidth;
  }

  const scrollDiv = document.createElement("div");
  scrollDiv.style.width = "100px";
  scrollDiv.style.height = "100px";
  scrollDiv.style.overflow = "scroll";
  scrollDiv.style.position = "absolute";
  scrollDiv.style.top = "-9999px";
  document.body.appendChild(scrollDiv);
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}

export function calculatePaddingR(padding = 16, refOrEl) {
  const el = getElement(refOrEl);
  return hasScrollbar(el) ? padding - getScrollbarWidth(el) : padding;
}

export function useDisableScroll(condition = true, refOrEl = null) {
  useEffect(() => {
    const el = getElement(refOrEl) || document.body;
    if (!condition || !el) return;

    const prevOverflow = el.style.overflow;
    const prevPaddingRight = el.style.paddingRight;

    const scrollbarWidth = getScrollbarWidth(el);
    if (scrollbarWidth > 0) {
      el.style.paddingRight = `${scrollbarWidth}px`;
    }

    el.style.overflow = "hidden";

    return () => {
      el.style.overflow = prevOverflow;
      el.style.paddingRight = prevPaddingRight;
    };
  }, [condition, refOrEl]);
}

export function isEmpty(value) {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
