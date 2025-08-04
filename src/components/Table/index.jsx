import React, {
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
  useCallback,
  useMemo,
  startTransition,
} from "react";
import Ellipsis from "../Ellipsis";
import Checkbox from "../Checkbox";
import SortIcon from "../SortIcon";
import { CloseIcon, FilterIcon, SearchIcon } from "../Icon";
import Dropdown from "../Dropdown";
import Button from "../Button";
import Input from "../Input";
import { getTextFromNode } from "../../utils";
import SortWorker from "../../sortWorker.js?worker";

const SELECT_COL_W = 40;
const MIN_W_COL = 100;
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

const FilterPanel = React.memo(
  ({ col, currentFilter = { search: "", selected: [] }, onApply }) => {
    const [localSearch, setLocalSearch] = useState(currentFilter.search);
    const [localSelected, setLocalSelected] = useState(currentFilter.selected);

    const toggleOption = (value) => {
      setLocalSelected((prev) => {
        if (prev.includes(value)) {
          return prev.filter((v) => v !== value);
        } else {
          return [...prev, value];
        }
      });
    };

    const handleApply = () => {
      onApply?.({ search: localSearch, selected: localSelected });
    };

    const handleClear = () => {
      setLocalSearch("");
      setLocalSelected([]);
    };

    return (
      <div
        style={{
          width: 150,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {col.searchable && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Search</div>
            <Input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApply();
              }}
              placeholder={`Search ${getTextFromNode(col.title)}`}
              prefix={
                <Button theme="icon" onClick={() => {}}>
                  <SearchIcon size={16} />
                </Button>
              }
              suffix={
                localSearch ? (
                  <Button theme="icon" onClick={() => setLocalSearch("")}>
                    <CloseIcon />
                  </Button>
                ) : null
              }
            />
          </div>
        )}
        {col.filters && Array.isArray(col.filters) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Filters</div>
            <div
              style={{
                maxHeight: 200,
                overflowY: "auto",
                border: "1px solid var(--hadesui-border-color)",
                borderRadius: 4,
                padding: 6,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {col.filters.map((f) => (
                <div
                  key={String(f.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                  onClick={() => toggleOption(f.value)}
                >
                  <Checkbox
                    value={localSelected.includes(f.value)}
                    onChange={() => toggleOption(f.value)}
                  />
                  <span
                    style={{
                      background: localSelected.includes(f.value)
                        ? "var(--hadesui-bg-selected-color)"
                        : "transparent",
                      padding: "4px",
                      width: "100%",
                      borderRadius: 6,
                    }}
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button size="small" onClick={handleClear} theme="text">
            Reset
          </Button>
          <Button size="small" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    );
  }
);
FilterPanel.displayName = "FilterPanel";

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
    currentFilter,
    onFilterApply,
  }) => {
    const dropdownRef = useRef();
    const [tempFilter, setTempFilter] = useState(
      currentFilter ?? { search: "", selected: [] }
    );
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

    const filterState = currentFilter ?? { search: "", selected: [] };

    const { hasFilter, filterIconColor } = useMemo(() => {
      const active =
        (col.searchable && filterState.search?.trim() !== "") ||
        ((col.filters || col.filterDropdown) &&
          Array.isArray(filterState.selected) &&
          filterState.selected.length > 0);
      return {
        hasFilter: active,
        filterIconColor: active
          ? "var(--hadesui-blue-6)"
          : "var(--hadesui-text2-color)",
      };
    }, [
      col.searchable,
      col.filters,
      col.filterDropdown,
      filterState.search,
      filterState.selected,
    ]);

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
        {(col.searchable || col.filters || col.filterDropdown) && (
          <Dropdown
            ref={dropdownRef}
            fixedWidthPopup={false}
            placement="bottom-end"
            menu={
              col.filterDropdown ? (
                col.filterDropdown({
                  setSelectedKeys: (keys) => {
                    setTempFilter((prev) => ({
                      ...prev,
                      selected: Array.isArray(keys) ? keys : [],
                    }));
                  },
                  selectedKeys: tempFilter,
                  confirm: () => {
                    onFilterApply(col, {
                      selected: Array.from(tempFilter.selected),
                    });
                    dropdownRef.current.hide();
                  },
                  clearFilters: () => {
                    setTempFilter((prev) => ({
                      ...prev,
                      selected: [],
                    }));
                  },
                })
              ) : (
                <FilterPanel
                  col={col}
                  currentFilter={currentFilter}
                  onApply={({ search, selected }) => {
                    onFilterApply(col, {
                      search,
                      selected: Array.from(selected),
                    });
                    dropdownRef.current.hide();
                  }}
                />
              )
            }
          >
            <Button
              theme="icon"
              style={{
                padding: "1px 0px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <FilterIcon size={18} color={filterIconColor} />
                {hasFilter && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--hadesui-blue-6)",
                    }}
                  />
                )}
              </div>
            </Button>
          </Dropdown>
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
    onFilterApply,
    currentFilter,
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
            onFilterApply={onFilterApply}
            currentFilter={currentFilter[col.id]}
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
      <div style={flexStyle}>
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
  // loading = true,
  loading = false,
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

  const [columnFilters, setColumnFilters] = useState({});
  const [sorting, setSorting] = useState(false);
  const [sortedData, setSortedData] = useState([]);
  const sortWorkerRef = useRef(null);

  useEffect(() => {
    sortWorkerRef.current = new SortWorker();
    sortWorkerRef.current.onmessage = (e) => {
      const { cacheKey, sorted } = e.data;
      startTransition(() => {
        sortCache.set(cacheKey, sorted);
        setSortedData(sorted);
      });
      setSorting(false);
    };
    return () => sortWorkerRef.current?.terminate();
  }, []);

  const onFilterApply = useCallback((col, filter) => {
    setColumnFilters((prev) => ({
      ...prev,
      [col.id]: {
        search: filter.search ?? "",
        selected: Array.isArray(filter.selected)
          ? filter.selected
          : [...(filter.selected ?? [])],
      },
    }));
    containerRef.current.scrollTop = 0;
    setScrollTop(0);
  }, []);

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

  const hasActiveFilters = useMemo(() => {
    return Object.values(columnFilters).some(
      (filter) =>
        filter.search !== "" || (filter.selected && filter.selected.length > 0)
    );
  }, [columnFilters]);

  const startIndex = useMemo(
    () => Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS),
    [scrollTop]
  );

  const endIndex = useMemo(() => {
    const visibleRows = Math.ceil(containerHeight / ROW_HEIGHT) + BUFFER_ROWS;
    return Math.min(data.length, startIndex + visibleRows);
  }, [containerHeight, startIndex, data.length]);

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
      if (!checkable) return;
      setSelectedKeys((prev) => {
        const exists = prev.includes(key);
        const next = exists ? prev.filter((k) => k !== key) : [...prev, key];
        const selectedRows = data.filter((d) => next.includes(d[rowKey]));
        onCheck?.(selectedRows);
        return next;
      });
    },
    [data, rowKey, onCheck, checkable]
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

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter((item) => {
      for (const col of columns) {
        const f = columnFilters[col.id];
        if (!f) continue;

        if (
          (col.filters || col.filterDropdown) &&
          Array.isArray(f.selected) &&
          f.selected.length
        ) {
          const passesAny = f.selected.some((val) => {
            if (typeof col.onFilter === "function") {
              return col.onFilter(val, item);
            }
            return item[col.dataIndex] === val;
          });
          if (!passesAny) return false;
        }

        if (col.searchable && f.search && f.search.trim() !== "") {
          const target = String(item[col.dataIndex] ?? "").toLowerCase();
          if (!target.includes(f.search.trim().toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });
  }, [data, columns, columnFilters]);

  useLayoutEffect(() => {
    if (!sortConfig.key || !sortConfig.direction || filteredData.length === 0) {
      setSortedData(filteredData);
      return;
    }

    const cacheKey = hasActiveFilters
      ? `${sortConfig.key}-${sortConfig.direction}-${JSON.stringify(
          Object.entries(columnFilters).sort()
        )}`
      : `${sortConfig.key}-${sortConfig.direction}`;

    if (sortCache.has(cacheKey)) {
      setSortedData(sortCache.get(cacheKey));
    } else {
      setSorting(true);
      sortWorkerRef.current?.postMessage({
        type: "sort",
        data: filteredData,
        key: sortConfig.key,
        direction: sortConfig.direction,
        sorterFnString:
          typeof columns.find((c) => c.dataIndex === sortConfig.key)?.sorter ===
          "function"
            ? columns
                .find((c) => c.dataIndex === sortConfig.key)
                ?.sorter.toString()
            : defaultCompare.toString(),
        cacheKey,
      });
    }
  }, [
    filteredData,
    sortConfig,
    hasActiveFilters,
    columnFilters,
    sortCache,
    defaultCompare,
    columns,
  ]);

  const visibleData = useMemo(() => {
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, startIndex, endIndex]);

  const totalHeight = useMemo(
    () => filteredData.length * ROW_HEIGHT,
    [filteredData.length]
  );

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
        let cellContent;
        if (col.render) {
          cellContent = col.render(data[j][col.dataIndex], data[j], j);
          if (typeof cellContent === "string") {
            w = Math.max(w, estimateTextWidth(cellContent, "400 14px"));
          } else if (typeof cellContent === "number" || cellContent == null) {
            w = Math.max(w, estimateTextWidth(String(cellContent), "400 14px"));
          } else {
            const textContent = getTextFromNode(cellContent);
            w = Math.max(w, estimateTextWidth(textContent, "400 14px"));
          }
        } else {
          const cell = data[j][col.dataIndex];
          if (cell != null) {
            w = Math.max(w, estimateTextWidth(String(cell), "400 14px"));
          }
        }
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

  const handleSort = useCallback((col) => {
    if (!col.sortable) return;
    setSortConfig((prev) => {
      if (prev.key === col.dataIndex) {
        if (prev.direction === "asc")
          return { key: col.dataIndex, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
        return { key: col.dataIndex, direction: "asc" };
      }
      return { key: col.dataIndex, direction: "asc" };
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 6,
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          border: "1px solid var(--hadesui-border-color)",
          borderRadius: 6,
          overflowX: loading ? "hidden" : "auto",
          overflowY: loading ? "hidden" : "auto",
          fontSize: 14,
          maxHeight: "100vh",
          pointerEvents: loading ? "all" : "auto",
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
          onFilterApply={onFilterApply}
          currentFilter={columnFilters}
        />
        <React.Fragment>
          {visibleData?.length === 0 ? (
            <div
              style={{
                position: "sticky",
                left: 0,
                height: "100%",
                padding: 12,
                textAlign: "center",
                fontSize: 14,
                color: "var(--hadesui-text2-color)",
                width: "100%",
              }}
            >
              No item to show here.
            </div>
          ) : (
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
          )}
        </React.Fragment>
      </div>
      {(loading || sorting) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(1px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            pointerEvents: "all",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "5px solid transparent",
              borderTopColor: "var(--hadesui-gray-1)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              color: "var(--hadesui-gray-1)",
            }}
          >
            Loading...
          </div>

          <style>
            {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            `}
          </style>
        </div>
      )}
    </div>
  );
};

export default Table;
