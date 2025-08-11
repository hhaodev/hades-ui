import {
  forwardRef,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMergedState } from "../../utils";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { DropdownItem } from "../Dropdown/DropdownItem";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import Ellipsis from "../Ellipsis";
import { CloseIcon, DownIcon, SearchIcon, UpIcon, XIcon } from "../Icon";
import Input from "../Input";
import Stack from "../Stack";

const Select = forwardRef(function Select(
  {
    value,
    onChange,
    onFocus,
    onBlur,
    name,
    options = [],
    placeholder = "Select...",
    placement: placementProps = "bottom-start",
    popupWidthFull = true,
    multiple = false,
    disabled = false,
    style,
    onClear,
    hasSearch = false,
    ...rest
  },
  ref
) {
  const [placement, setPlacement] = useState("");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isEnter, setIsEnter] = useState(false);

  const idGene = useId();
  const id = `dropdown-select-${idGene}`;

  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const itemRefs = useRef({});

  const [finalValue, setFinalValue] = useMergedState(multiple ? [] : "", {
    value,
    onChange,
  });

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  const isSelected = (opt) =>
    multiple
      ? Array.isArray(finalValue) && finalValue.includes(opt.value)
      : finalValue === opt.value;

  const selectedOptions = useMemo(() => {
    if (multiple) {
      const vals = Array.isArray(finalValue) ? finalValue : [];
      return vals
        .map((val) => options.find((o) => o.value === val))
        .filter(Boolean);
    }
    const found = options.find((o) => o.value === finalValue);
    return found ? [found] : [];
  }, [finalValue, options, multiple]);

  const selectedSingle = !multiple ? selectedOptions[0] : undefined;

  useEffect(() => {
    if (!open && containerRef.current && !isEnter) {
      const el = containerRef.current;
      if (!disabled) el.style.borderColor = "var(--hadesui-border-color)";
    }
  }, [open, disabled, isEnter]);

  useLayoutEffect(() => {
    if (!open || multiple || search) return;
    let f1, f2, f3;
    f1 = requestAnimationFrame(() => {
      f2 = requestAnimationFrame(() => {
        f3 = requestAnimationFrame(() => {
          const menuEl = menuRef.current;
          const selectedEl = itemRefs.current[selectedSingle?.value];
          if (menuEl && selectedEl) {
            const relativeTop = selectedEl.offsetTop - menuEl.offsetTop;
            menuEl.scrollTop =
              relativeTop -
              menuEl.clientHeight / 2 +
              selectedEl.offsetHeight / 2;
          }
        });
      });
    });
    return () => {
      cancelAnimationFrame(f1);
      cancelAnimationFrame(f2);
      cancelAnimationFrame(f3);
    };
  }, [open, multiple, search, selectedSingle]);

  useEffect(() => {
    if (!open && hasSearch) {
      setSearch("");
    }
  }, [open, hasSearch]);

  const handleSelectSingle = (opt) => {
    setFinalValue(opt.value);
    setIsEnter(false);
    setOpen(false);
  };

  const handleToggleMultiple = (opt) => {
    const list = Array.isArray(finalValue) ? finalValue.slice() : [];
    const idx = list.indexOf(opt.value);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(opt.value);
    setFinalValue(list);
  };

  const clearAll = () => {
    if (multiple) setFinalValue([]);
    else setFinalValue("");
    onClear?.();
    setOpen(false);
  };

  const renderMenu = () => {
    const noItem = filteredOptions.length === 0;
    return (
      <DropdownMenu
        ref={(el) => (menuRef.current = el)}
        style={{ maxHeight: "400px", overflow: "auto" }}
      >
        {noItem ? (
          <DropdownItem style={{ justifyContent: "center" }} view key="no-item">
            No item to show here.
          </DropdownItem>
        ) : (
          filteredOptions.map((opt) => (
            <DropdownItem
              key={opt.value}
              ref={(el) => (itemRefs.current[opt.value] = el)}
              onClick={(e) => {
                e.preventDefault();
                if (multiple) handleToggleMultiple(opt);
                else handleSelectSingle(opt);
              }}
              checked={isSelected(opt)}
            >
              {opt.label}
            </DropdownItem>
          ))
        )}
      </DropdownMenu>
    );
  };

  const renderValueSingle = () => (
    <Ellipsis
      key={selectedSingle ? "selectedlabel" : "placeholder"}
      style={{
        width: "100%",
        color: disabled
          ? "inherit"
          : selectedSingle
          ? "var(--hadesui-text-color)"
          : "var(--hadesui-placeholder-color)",
      }}
    >
      {selectedSingle ? selectedSingle.label : placeholder}
    </Ellipsis>
  );

  const removeTag = (val) => {
    const list = Array.isArray(finalValue) ? finalValue.slice() : [];
    const idx = list.indexOf(val);
    if (idx >= 0) {
      list.splice(idx, 1);
      setFinalValue(list);
    }
  };

  const renderValueMultiple = () => (
    <Stack flex wrap wfull gap={4} style={{ padding: "4px 0px" }}>
      {selectedOptions.length === 0 ? (
        <Ellipsis
          style={{
            width: "100%",
            color: disabled ? "inherit" : "var(--hadesui-placeholder-color)",
          }}
        >
          {placeholder}
        </Ellipsis>
      ) : (
        selectedOptions.map((opt) => (
          <Stack
            key={opt.value}
            align="center"
            gap={8}
            flex
            style={{
              border: "1px solid var(--hadesui-border-color)",
              borderRadius: 6,
              padding: "4px 6px",
              width: "fit-content",
            }}
          >
            <Ellipsis style={{ maxWidth: 150 }}>{opt.label}</Ellipsis>
            <Stack
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "var(--hadesui-placeholder-color)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(opt.value);
              }}
            >
              <CloseIcon />
            </Stack>
          </Stack>
        ))
      )}
    </Stack>
  );

  return (
    <Stack
      ref={(el) => {
        containerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      tabIndex={disabled ? -1 : 0}
      data-border-red-error={rest["data-border-red-error"]}
      data-disabled-action={disabled}
      flex
      wfull
      gap={8}
      align="center"
      style={{
        width: "100%",
        borderRadius: 8,
        border: "1px solid var(--hadesui-border-color)",
        fontSize: 14,
        height: multiple ? "auto" : 36,
        minHeight: multiple ? 36 : undefined,
        background: disabled
          ? "var(--hadesui-bg-disabled-color)"
          : "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "border-color 0.2s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !open) {
          e.currentTarget.style.borderColor = "var(--hadesui-blue-6)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !open) {
          e.currentTarget.style.borderColor = "var(--hadesui-border-color)";
        }
      }}
      onFocus={(e) => {
        onFocus?.(e);
        setIsEnter(true);
      }}
      onBlur={(e) => {
        const next = e.relatedTarget;
        const portalEl = document.getElementById(id);
        if (next && portalEl && portalEl.contains(next)) {
          return;
        }
        onBlur?.(e);
        setIsEnter(false);
      }}
      {...rest}
    >
      <Dropdown
        id={id}
        disabled={disabled}
        fixedWidthPopup={popupWidthFull}
        placement={placementProps}
        open={open}
        onOpenChange={setOpen}
        getPlacement={setPlacement}
        menu={() => (
          <Stack wfull onPointerDownCapture={(e) => e.stopPropagation()}>
            {hasSearch && (
              <Stack wfull style={{ padding: "8px" }}>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearch("");
                  }}
                  prefix={
                    <Button theme="icon" onClick={() => {}}>
                      <SearchIcon size={16} />
                    </Button>
                  }
                  suffix={
                    search && (
                      <Button onClick={() => setSearch("")} theme="icon">
                        <CloseIcon />
                      </Button>
                    )
                  }
                />
              </Stack>
            )}
            {renderMenu()}
          </Stack>
        )}
      >
        <Stack
          tabIndex={disabled ? -1 : 0}
          flex
          gap={8}
          align="center"
          style={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            padding: "0 8px",
            height: multiple ? "auto" : 36,
            minHeight: multiple ? 36 : undefined,
          }}
        >
          {!multiple && renderValueSingle()}
          {multiple && renderValueMultiple()}

          <Stack
            data-toggle-for={id}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              const hasValue = multiple
                ? Array.isArray(finalValue) && finalValue.length > 0
                : Boolean(selectedSingle);
              if (hasValue) {
                clearAll();
              } else if (open) {
                setOpen(false);
              } else {
                setOpen(true);
              }
            }}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "var(--hadesui-placeholder-color)",
            }}
          >
            {(
              multiple
                ? Array.isArray(finalValue) && finalValue.length > 0
                : Boolean(selectedSingle)
            ) ? (
              <XIcon />
            ) : open && !placement.startsWith("top") ? (
              <UpIcon />
            ) : (
              <DownIcon />
            )}
          </Stack>
        </Stack>
      </Dropdown>
    </Stack>
  );
});

Select.displayName = "Select";
export default Select;
