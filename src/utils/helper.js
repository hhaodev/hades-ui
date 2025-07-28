import { useEffect } from "react";

function getElement(refOrEl) {
  if (!refOrEl) return document.body;
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

    if (el.dataset["disableScroll"] === "true") return;

    el.dataset["disableScroll"] = "true";

    const scrollY = window.scrollY;
    const originalStyle = {
      top: el.style.top,
      left: el.style.left,
      right: el.style.right,
      position: el.style.position,
      overflow: el.style.overflow,
      width: el.style.width,
      paddingRight: el.style.paddingRight,
    };

    const scrollbarWidth = getScrollbarWidth(el);
    if (scrollbarWidth > 0) {
      el.style.paddingRight = `${scrollbarWidth}px`;
    }

    el.style.position = "fixed";
    el.style.top = `-${scrollY}px`;
    el.style.left = "0";
    el.style.right = "0";
    el.style.width = "100%";
    el.style.overflow = "hidden";

    const focusableEls = [
      ...document.querySelectorAll(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
      ),
    ];
    const previousTabIndexes = new Map();

    focusableEls.forEach((el) => {
      previousTabIndexes.set(el, el.getAttribute("tabindex"));
      el.setAttribute("tabindex", "-1");
    });

    return () => {
      delete el.dataset["disableScroll"];
      Object.assign(el.style, originalStyle);
      window.scrollTo(0, scrollY);
      focusableEls.forEach((el) => {
        const prev = previousTabIndexes.get(el);
        if (prev === null) {
          el.removeAttribute("tabindex");
        } else {
          el.setAttribute("tabindex", prev);
        }
      });
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

export function disableBodyScrollSafe() {
  const scrollY = window.scrollY;
  const body = document.body;

  const originalStyle = {
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    position: body.style.position,
    overflow: body.style.overflow,
    width: body.style.width,
    paddingRight: body.style.paddingRight,
  };

  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  body.style.position = "fixed";
  body.style.top = `-${scrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  body.style.overflow = "hidden";

  const focusableEls = [
    ...document.querySelectorAll(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    ),
  ];
  const previousTabIndexes = new Map();

  focusableEls.forEach((el) => {
    previousTabIndexes.set(el, el.getAttribute("tabindex"));
    el.setAttribute("tabindex", "-1");
  });

  return () => {
    Object.assign(body.style, originalStyle);
    window.scrollTo(0, scrollY);
    focusableEls.forEach((el) => {
      const prev = previousTabIndexes.get(el);
      if (prev === null) {
        el.removeAttribute("tabindex");
      } else {
        el.setAttribute("tabindex", prev);
      }
    });
  };
}
