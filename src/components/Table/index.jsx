import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import Ellipsis from "../Ellipsis";
import Checkbox from "../Checkbox";

function estimateTextWidth(text, font = "600 14px system-ui") {
  if (typeof document === "undefined") return 100;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
}

const Table = ({
  columns: inputCols,
  data = [],
  rowKey = "key",
  onCheck,
  checkable,
  style = {},
}) => {
  const containerRef = useRef(null);
  const SELECT_COL_W = 40;

  const [baseWidths, setBaseWidths] = useState([]);
  const [fixedWidths, setFixedWidths] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const allChecked = selectedKeys.length === data.length && data.length > 0;
  const someChecked =
    selectedKeys.length > 0 && selectedKeys.length < data.length;

  useLayoutEffect(() => {
    const padding = 24;
    const result = inputCols.map((col) => {
      if (typeof col.width === "number") return col.width;
      let w = estimateTextWidth(col.title || "", "600 14px");
      for (let i = 0; i < Math.min(3, data.length); i++) {
        const cell = data[i][col.dataIndex];
        if (cell != null) w = Math.max(w, estimateTextWidth(String(cell)));
      }
      return Math.ceil(w + padding);
    });
    setBaseWidths(result);
  }, [inputCols, data]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const width = containerRef.current.clientWidth;
      setContainerWidth(width);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  const computeWidths = useCallback(() => {
    const result = Array(inputCols.length).fill(0);
    const fixedMap = {};
    let totalFixed = 0;
    let flexSum = 0;

    inputCols.forEach((col, i) => {
      const minW = (col.minWidth ?? col.width) || 60;
      if (fixedWidths[i] != null) {
        const w = Math.max(fixedWidths[i], minW);
        fixedMap[i] = w;
        totalFixed += w;
      } else {
        flexSum += baseWidths[i] != null ? baseWidths[i] : minW;
      }
    });

    const remaining = Math.max(
      0,
      containerWidth - (checkable === true ? SELECT_COL_W : 0) - totalFixed
    );

    inputCols.forEach((col, i) => {
      const minW = (col.minWidth ?? col.width) || 60;
      if (fixedMap[i] != null) {
        result[i] = fixedMap[i];
      } else {
        const flexBase = baseWidths[i] != null ? baseWidths[i] : minW;
        let w = flexSum === 0 ? flexBase : (flexBase / flexSum) * remaining;
        w = Math.max(w, minW);
        result[i] = w;
      }
    });

    return result;
  }, [inputCols, baseWidths, fixedWidths, containerWidth, checkable]);

  const widths = computeWidths();
  const totalWidth = widths.reduce(
    (a, b) => a + b,
    checkable === true ? SELECT_COL_W : 0
  );

  const startX = useRef(0);
  const startWidths = useRef({});
  const resizingIdx = useRef(null);

  const handleMouseDown = (e, idx) => {
    e.preventDefault();
    startX.current = e.clientX;
    resizingIdx.current = idx;
    startWidths.current = computeWidths().reduce((acc, w, i) => {
      acc[i] = w;
      return acc;
    }, {});
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (resizingIdx.current === null) return;
      const delta = e.clientX - startX.current;
      const idx = resizingIdx.current;
      const minW = inputCols[idx].minWidth || 60;
      const maxW = inputCols[idx].maxWidth || Infinity;
      setFixedWidths(() => {
        const next = { ...startWidths.current };
        const newWidth = startWidths.current[idx] + delta;
        next[idx] = Math.min(maxW, Math.max(minW, newWidth));
        return next;
      });
    },
    [inputCols]
  );

  const handleMouseUp = () => {
    resizingIdx.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    const block = (e) => {
      if (resizingIdx.current != null) e.preventDefault();
    };
    document.addEventListener("selectstart", block);
    return () => document.removeEventListener("selectstart", block);
  }, []);

  const toggleAll = () => {
    const newKeys = allChecked ? [] : data.map((d) => d[rowKey]);
    setSelectedKeys(newKeys);
    const selectedRows = allChecked ? [] : data;
    onCheck?.(selectedRows);
  };

  const toggleRow = (key) => {
    setSelectedKeys((prev) => {
      const exists = prev.includes(key);
      const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
      const selectedRows = data.filter((d) => next.includes(d[rowKey]));
      onCheck?.(selectedRows);
      return next;
    });
  };

  const renderRow = (item, rowIdx) => {
    const key = item[rowKey] ?? rowIdx;
    const selected = selectedKeys.includes(key);
    return (
      <div
        key={key}
        style={{
          display: "flex",
          minWidth:
            typeof totalWidth === "number" && !isNaN(totalWidth)
              ? totalWidth
              : "100%",
          borderBottom: "1px solid var(--hadesui-border-color)",
          background: selected
            ? "var(--hadesui-bg-selected-color)"
            : "var(--hadesui-bg-color)",
        }}
        onClick={() => {
          if (!checkable) return;
          toggleRow(key);
        }}
      >
        {checkable && (
          <div
            style={{
              width: SELECT_COL_W,
              flexShrink: 0,
              position: "sticky",
              left: 0,
              background: selected
                ? "var(--hadesui-bg-selected-color)"
                : "var(--hadesui-bg-color)",
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRight: "1px solid var(--hadesui-border-color)",
              padding: "8px 4px",
              boxSizing: "border-box",
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleRow(key);
            }}
          >
            <Checkbox onChange={() => toggleRow(key)} value={selected} />
          </div>
        )}
        {inputCols.map((col, i) => (
          <div
            key={col.key || col.dataIndex || i}
            style={{
              flex:
                i === inputCols.length - 1 ? "1 1 auto" : `0 0 ${widths[i]}px`,
              minWidth: 60,
              padding: "8px 12px",
              boxSizing: "border-box",
              borderRight: "1px solid var(--hadesui-border-color)",
            }}
          >
            <Ellipsis>
              {typeof col.render === "function"
                ? col.render(item[col.dataIndex], item, rowIdx)
                : item[col.dataIndex]}
            </Ellipsis>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        border: "1px solid var(--hadesui-border-color)",
        borderRadius: 6,
        overflowX: "auto",
        fontSize: 14,
        ...style,
      }}
    >
      <div
        style={{
          minWidth:
            typeof totalWidth === "number" && !isNaN(totalWidth)
              ? totalWidth
              : "100%",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            minWidth:
              typeof totalWidth === "number" && !isNaN(totalWidth)
                ? totalWidth
                : "100%",
            borderBottom: "1px solid var(--hadesui-border-color)",
            background: "var(--hadesui-bg-color)",
            fontWeight: 600,
            userSelect: "none",
            zIndex: 4,
          }}
        >
          {checkable && (
            <div
              style={{
                width: SELECT_COL_W,
                flexShrink: 0,
                position: "sticky",
                left: 0,
                background: "var(--hadesui-bg-color)",
                zIndex: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRight: "1px solid var(--hadesui-border-color)",
                padding: "8px 4px",
                boxSizing: "border-box",
              }}
            >
              <Checkbox
                value={allChecked}
                indeterminate={someChecked}
                onChange={toggleAll}
              />
            </div>
          )}
          {inputCols.map((col, i) => (
            <div
              key={col.key || col.dataIndex || i}
              style={{
                flex:
                  i === inputCols.length - 1
                    ? "1 1 auto"
                    : `0 0 ${widths[i]}px`,
                minWidth: 60,
                padding: "8px 12px",
                boxSizing: "border-box",
                borderRight: "1px solid var(--hadesui-border-color)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Ellipsis>{col.title}</Ellipsis>
              <div
                onMouseDown={(e) => handleMouseDown(e, i)}
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: 8,
                  cursor: "col-resize",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 2,
                    height: "60%",
                    background: "var(--hadesui-bg-selected-color)",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        {data.map(renderRow)}
      </div>
    </div>
  );
};

export default Table;
