import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Ellipsis from "../Ellipsis";
import Checkbox from "../Checkbox";
import SortIcon from "../SortIcon";

const SELECT_COL_W = 40;
const MIN_W_COL = 60;
const ROW_HEIGHT = 40;
const BUFFER_ROWS = 10;

function estimateTextWidth(text, font = "600 14px system-ui") {
  if (typeof document === "undefined") return 100;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return 100;
  ctx.font = font;
  return ctx.measureText(text).width;
}

const SelectHeaderCell = React.memo(
  ({ allChecked, someChecked, toggleAll }) => (
    <Checkbox
      value={allChecked}
      indeterminate={someChecked}
      onChange={toggleAll}
    />
  )
);
SelectHeaderCell.displayName = "SelectHeaderCell";

const SelectCell = React.memo(({ item, rowKey, selectedSet, toggleRow }) => {
  const key = item[rowKey];
  const selected = selectedSet.has(key);
  return <Checkbox onChange={() => toggleRow(key)} value={selected} />;
});
SelectCell.displayName = "SelectCell";

const HeaderCell = React.memo(
  ({
    col,
    width,
    isLastColumn,
    leftOffset,
    isSelectCol,
    sortConfig,
    handleSort,
    handleMouseDown,
    index,
  }) => {
    const flexStyle = useMemo(
      () => (isLastColumn ? { flex: "1 1 auto" } : { flex: `0 0 ${width}px` }),
      [isLastColumn, width]
    );

    const stickyStyle = useMemo(
      () =>
        col.fixed === "left"
          ? {
              position: "sticky",
              left: leftOffset,
              zIndex: 3,
              background: "var(--hadesui-bg-color)",
            }
          : {},
      [col.fixed, leftOffset]
    );

    return (
      <div
        style={{
          ...flexStyle,
          minWidth: isSelectCol ? SELECT_COL_W : MIN_W_COL,
          padding: "8px 12px",
          boxSizing: "border-box",
          borderRight: "1px solid var(--hadesui-border-color)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "center",
          cursor: col.sortable ? "pointer" : "default",
          ...stickyStyle,
        }}
        onClick={() => handleSort(col)}
      >
        {isSelectCol ? col.title : <Ellipsis>{col.title}</Ellipsis>}
        {col.sortable && (
          <SortIcon
            isActive={sortConfig.key === col.dataIndex}
            activeDirection={sortConfig.direction}
          />
        )}
        {col.resize && (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => handleMouseDown(e, index)}
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
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--hadesui-blue-6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
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
        )}
      </div>
    );
  }
);
HeaderCell.displayName = "HeaderCell";

const Header = React.memo(
  ({
    columns,
    widths,
    leftOffsets,
    sortConfig,
    handleSort,
    handleMouseDown,
    totalWidth,
  }) => {
    const headerStyle = useMemo(
      () => ({
        position: "sticky",
        top: 0,
        display: "flex",
        minWidth:
          typeof totalWidth === "number" && !isNaN(totalWidth)
            ? totalWidth
            : "100%",
        minHeight: 40,
        borderBottom: "1px solid var(--hadesui-border-color)",
        background: "var(--hadesui-bg-color)",
        fontWeight: 600,
        zIndex: 3,
      }),
      [totalWidth]
    );

    return (
      <div style={headerStyle}>
        {columns.map((col, i) => (
          <HeaderCell
            key={col.id}
            col={col}
            width={widths[i]}
            isLastColumn={i === columns.length - 1}
            leftOffset={leftOffsets[i]}
            isSelectCol={col.id === "__select__"}
            sortConfig={sortConfig}
            handleSort={handleSort}
            handleMouseDown={handleMouseDown}
            index={i}
          />
        ))}
      </div>
    );
  }
);
Header.displayName = "Header";

const Cell = React.memo(
  ({
    col,
    item,
    rowIdx,
    width,
    isSelectCol,
    selected,
    leftOffset,
    isLastColumn,
  }) => {
    const stickyStyle = useMemo(
      () =>
        col.fixed === "left"
          ? {
              position: "sticky",
              left: leftOffset,
              zIndex: 2,
              background: selected
                ? "var(--hadesui-bg-selected-color)"
                : "var(--hadesui-bg-color)",
            }
          : {},
      [col.fixed, leftOffset, selected]
    );

    const flexStyle = useMemo(
      () => ({
        ...(isLastColumn ? { flex: "1 1 auto" } : { flex: `0 0 ${width}px` }),
        minWidth: isSelectCol ? SELECT_COL_W : MIN_W_COL,
        padding: "8px 12px",
        boxSizing: "border-box",
        borderRight: "1px solid var(--hadesui-border-color)",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        ...stickyStyle,
      }),
      [isSelectCol, width, stickyStyle, isLastColumn]
    );

    return (
      <div
        style={flexStyle}
        onClick={(e) => {
          if (isSelectCol) e.stopPropagation();
        }}
      >
        {isSelectCol ? (
          typeof col.render === "function" ? (
            col.render(null, item, rowIdx)
          ) : null
        ) : (
          <Ellipsis>
            {typeof col.render === "function"
              ? col.render(item[col.dataIndex], item, rowIdx)
              : item[col.dataIndex]}
          </Ellipsis>
        )}
      </div>
    );
  }
);
Cell.displayName = "Cell";

const Row = React.memo(
  ({
    item,
    rowIdx,
    columns,
    widths,
    selected,
    toggleRow,
    leftOffsets,
    rowKey,
    totalWidth,
    checkable,
  }) => {
    const rowStyle = useMemo(
      () => ({
        display: "flex",
        minWidth:
          typeof totalWidth === "number" && !isNaN(totalWidth)
            ? totalWidth
            : "100%",
        minHeight: ROW_HEIGHT,
        maxHeight: ROW_HEIGHT,
        borderBottom: "1px solid var(--hadesui-border-color)",
        background: selected
          ? "var(--hadesui-bg-selected-color)"
          : "var(--hadesui-bg-color)",
        cursor: checkable ? "pointer" : "default",
      }),
      [selected, totalWidth, checkable]
    );

    return (
      <div style={rowStyle} onClick={() => toggleRow(item[rowKey])}>
        {columns.map((col, i) => (
          <Cell
            key={col.id}
            col={col}
            item={item}
            rowIdx={rowIdx}
            width={widths[i]}
            isSelectCol={col.id === "__select__"}
            selected={selected}
            leftOffset={leftOffsets[i]}
            isLastColumn={i === columns.length - 1}
          />
        ))}
      </div>
    );
  }
);
Row.displayName = "Row";

const Table = ({
  columns: inputCols = [],
  data = [],
  rowKey = "id",
  onCheck,
  checkable,
  style = {},
}) => {
  const containerRef = useRef(null);
  const startX = useRef(0);
  const startWidths = useRef({});
  const resizingIdx = useRef(null);

  const [baseWidths, setBaseWidths] = useState([]);
  const [fixedWidths, setFixedWidths] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null }); // direction: "asc"|"desc"|null
  const [sortCache] = useState(() => new Map()); // key: `${key}-${direction}` -> sorted array
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = useMemo(
    () => Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS),
    [scrollTop]
  );

  const endIndex = useMemo(() => {
    const visibleRows = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_ROWS;
    return Math.min(data.length, startIndex + visibleRows);
  }, [containerHeight, startIndex, data.length]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;
    const cacheKey = `${sortConfig.key}-${sortConfig.direction}`;
    return sortCache.get(cacheKey) ?? data;
  }, [sortConfig, data, sortCache]);
  const visibleData = useMemo(() => {
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex]);

  const totalHeight = useMemo(() => data.length * ROW_HEIGHT, [data.length]);

  const allChecked = useMemo(
    () => selectedKeys.length === data.length && data.length > 0,
    [selectedKeys, data]
  );

  const someChecked = useMemo(
    () => selectedKeys.length > 0 && selectedKeys.length < data.length,
    [selectedKeys, data]
  );

  const toggleAll = useCallback(() => {
    const newKeys = allChecked ? [] : data.map((d) => d[rowKey]);
    setSelectedKeys(newKeys);
    onCheck?.(allChecked ? [] : data);
  }, [allChecked, data, rowKey, onCheck]);

  const toggleRow = useCallback(
    (key) => {
      setSelectedKeys((prev) => {
        const exists = prev.includes(key);
        const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
        const selectedRows = data.filter((d) => next.includes(d[rowKey]));
        onCheck?.(selectedRows);
        return next;
      });
    },
    [data, rowKey, onCheck]
  );

  const baseColumns = useMemo(() => {
    return inputCols.map((col, index) => {
      const hasId = col.id != null && col.id !== "";
      return {
        ...col,
        id: hasId ? col.id : `__col-${index}__`,
        resize: col.resize ?? true,
      };
    });
  }, [inputCols]);

  const columns = useMemo(() => {
    if (!checkable) return baseColumns;
    return [
      {
        id: "__select__",
        width: SELECT_COL_W,
        fixed: "left",
        title: (
          <SelectHeaderCell
            allChecked={allChecked}
            someChecked={someChecked}
            toggleAll={toggleAll}
          />
        ),
        render: (_, item) => (
          <SelectCell
            item={item}
            rowKey={rowKey}
            selectedSet={selectedSet}
            toggleRow={toggleRow}
          />
        ),
        resize: false,
      },
      ...baseColumns,
    ];
  }, [
    checkable,
    baseColumns,
    allChecked,
    someChecked,
    toggleAll,
    rowKey,
    selectedSet,
    toggleRow,
  ]);

  useLayoutEffect(() => {
    if (columns.length === 0) {
      setBaseWidths([]);
      return;
    }
    const padding = 24;
    const result = columns.map((col) => {
      if (col.id === "__select__") return SELECT_COL_W;
      if (typeof col.width === "number") return col.width;
      let w = estimateTextWidth(col.title || "", "600 14px");
      for (let j = 0; j < Math.min(3, data.length); j++) {
        const cell = data[j][col.dataIndex];
        if (cell != null)
          w = Math.max(w, estimateTextWidth(String(cell), "400 14px"));
      }
      return Math.ceil(w + padding);
    });
    setBaseWidths(result);
  }, [columns, data]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      setContainerWidth(containerRef.current.clientWidth || 0);
      setContainerHeight(containerRef.current.clientHeight || 0);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const computeWidths = useCallback(
    (cols) => {
      const result = Array(cols.length).fill(0);
      const fixedMap = {};
      let totalFixed = 0;
      let flexBaseSum = 0;

      cols.forEach((col, i) => {
        const minW = col.minWidth || MIN_W_COL;
        const maxW = col.maxWidth ?? Infinity;
        const effectiveMinW = Math.min(minW, maxW);

        if (col.id === "__select__") {
          fixedMap[i] = SELECT_COL_W;
          totalFixed += SELECT_COL_W;
        } else if (fixedWidths[i] != null) {
          const w = Math.min(maxW, Math.max(fixedWidths[i], effectiveMinW));
          fixedMap[i] = w;
          totalFixed += w;
        } else if (typeof col.width === "number") {
          const w = Math.min(maxW, Math.max(col.width, effectiveMinW));
          fixedMap[i] = w;
          totalFixed += w;
        } else {
          const base = baseWidths[i] != null ? baseWidths[i] : effectiveMinW;
          flexBaseSum += base;
        }
      });

      const remaining = Math.max(0, containerWidth - totalFixed);

      cols.forEach((col, i) => {
        const minW = (col.minWidth ?? col.width) || MIN_W_COL;
        const maxW = col.maxWidth ?? Infinity;
        const effectiveMinW = Math.min(minW, maxW);

        if (fixedMap[i] != null) {
          result[i] = fixedMap[i];
        } else {
          const flexBase =
            baseWidths[i] != null ? baseWidths[i] : effectiveMinW;
          let w =
            flexBaseSum === 0 ? flexBase : (flexBase / flexBaseSum) * remaining;
          w = Math.min(maxW, Math.max(w, effectiveMinW));
          result[i] = w;
        }
      });

      return result;
    },
    [baseWidths, fixedWidths, containerWidth]
  );

  const widths = useMemo(
    () => computeWidths(columns),
    [computeWidths, columns]
  );
  const totalWidth = useMemo(() => widths.reduce((a, b) => a + b, 0), [widths]);

  const leftOffsets = useMemo(() => {
    const offsets = [];
    let acc = 0;
    columns.forEach((col, i) => {
      if (col.fixed === "left") {
        offsets[i] = acc;
        acc += widths[i];
      } else {
        offsets[i] = undefined;
      }
    });
    return offsets;
  }, [columns, widths]);

  const handleMouseMove = useCallback(
    (e) => {
      if (resizingIdx.current === null) return;
      const delta = e.clientX - startX.current;
      const idx = resizingIdx.current;
      const col = columns[idx];
      if (!col) return;
      const minW = col.minWidth || MIN_W_COL;
      const maxW = col.maxWidth || Infinity;
      setFixedWidths(() => {
        const next = { ...startWidths.current };
        const newWidth = startWidths.current[idx] + delta;
        next[idx] = Math.min(maxW, Math.max(minW, newWidth));
        return next;
      });
    },
    [columns]
  );

  const handleMouseUp = useCallback(() => {
    resizingIdx.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e, idx) => {
      e.preventDefault();
      e.stopPropagation();
      if (columns[idx]?.disableResize) return;
      startX.current = e.clientX;
      resizingIdx.current = idx;
      const current = computeWidths(columns);
      startWidths.current = current.reduce((acc, w, i) => {
        acc[i] = w;
        return acc;
      }, {});
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [columns, computeWidths, handleMouseMove, handleMouseUp]
  );

  useEffect(() => {
    const block = (e) => {
      if (resizingIdx.current != null) e.preventDefault();
    };
    document.addEventListener("selectstart", block);
    return () => document.removeEventListener("selectstart", block);
  }, []);

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const defaultCompare = useCallback((a, b, key) => {
    const va = a[key];
    const vb = b[key];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (va === vb) return 0;
    if (typeof va === "number" && typeof vb === "number") return va - vb;
    return String(va).localeCompare(String(vb), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }, []);

  const handleSort = useCallback(
    (col) => {
      if (!col.sortable) return;
      setSortConfig((prev) => {
        let next;
        if (prev.key === col.dataIndex) {
          if (prev.direction === "asc")
            next = { key: col.dataIndex, direction: "desc" };
          else if (prev.direction === "desc")
            next = { key: null, direction: null };
          else next = { key: col.dataIndex, direction: "asc" };
        } else {
          next = { key: col.dataIndex, direction: "asc" };
        }

        if (next.key && next.direction) {
          const cacheKey = `${next.key}-${next.direction}`;
          if (!sortCache.has(cacheKey)) {
            const base = [...data];
            const comparator = (a, b) => {
              let cmp = 0;
              if (typeof col.sorter === "function") {
                cmp = col.sorter(a, b);
              } else {
                cmp = defaultCompare(a, b, next.key);
              }
              return next.direction === "asc" ? cmp : -cmp;
            };
            const sorted = [...base].sort(comparator);
            sortCache.set(cacheKey, sorted);
          }
        }
        return next;
      });
    },
    [data, defaultCompare, sortCache]
  );

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        border: "1px solid var(--hadesui-border-color)",
        borderRadius: 6,
        overflowX: "auto",
        overflowY: "auto",
        fontSize: 14,
        maxHeight: "100vh",
        ...style,
      }}
      onScroll={handleScroll}
    >
      <Header
        columns={columns}
        widths={widths}
        leftOffsets={leftOffsets}
        sortConfig={sortConfig}
        handleSort={handleSort}
        handleMouseDown={handleMouseDown}
        totalWidth={totalWidth}
      />
      <div
        style={{
          height: totalHeight,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: startIndex * ROW_HEIGHT,
            width: "100%",
          }}
        >
          {visibleData.map((item, index) => (
            <Row
              key={item[rowKey] ?? startIndex + index}
              item={item}
              rowIdx={startIndex + index}
              columns={columns}
              widths={widths}
              selected={selectedSet.has(item[rowKey])}
              toggleRow={toggleRow}
              leftOffsets={leftOffsets}
              rowKey={rowKey}
              totalWidth={totalWidth}
              checkable={checkable}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Table;
