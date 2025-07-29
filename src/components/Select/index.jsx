import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { DropdownItem } from "../Dropdown/DropdownItem";
import { DropdownMenu } from "../Dropdown/DropdownMenu";
import Ellipsis from "../Ellipsis";
import { CloseIcon, DownIcon, SearchIcon, UpIcon, XIcon } from "../Icon";
import Input from "../Input";
import Stack from "../Stack";
import Divider from "../Divider";

const Select = forwardRef(
  (
    {
      value,
      onChange,
      onBlur,
      name,
      options = [],
      placeholder = "Select...",
      placement: placementProps = "bottom-start",
      popupWidthFull = false,
      disabled = false,
      style,
      onClear,
      hasSearch,
      ...rest
    },
    ref
  ) => {
    const [placement, setPlacement] = useState("");
    const menuRef = useRef(null);
    const itemRefs = useRef({});
    const timeoutRef = useRef();
    const containerRef = useRef(null);

    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [searchValueOrigin, setSearchValueOrigin] = useState("");
    const [internalValue, setInternalValue] = useState();
    const finalValue = value !== undefined ? value : internalValue;
    const selected = options.find((opt) => opt.value === finalValue);

    const setValue = (val) => {
      onChange?.(val);
      setInternalValue(val);
    };

    useEffect(() => {
      if (!open && containerRef.current) {
        const el = containerRef.current;
        if (!disabled) {
          el.style.borderColor = "var(--hadesui-border-color)";
        }
      }
    }, [open]);

    useLayoutEffect(() => {
      if (!open || searchValue) return;

      const frame = requestAnimationFrame(() => {
        setTimeout(() => {
          const menuEl = menuRef.current;
          const selectedEl = itemRefs.current[selected?.value];
          if (menuEl && selectedEl) {
            const relativeOffsetTop = selectedEl.offsetTop - menuEl.offsetTop;
            menuEl.scrollTop =
              relativeOffsetTop -
              menuEl.clientHeight / 2 +
              selectedEl.offsetHeight / 2;
          }
        });
      });

      return () => cancelAnimationFrame(frame);
    }, [open, selected, value, searchValue]);

    useEffect(() => {
      if (!open) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setSearchValue("");
          setSearchValueOrigin("");
        }, 200);
      }

      return () => {
        clearTimeout(timeoutRef.current);
      };
    }, [open]);

    return (
      <Stack
        ref={(el) => {
          containerRef.current = el;
          if (typeof ref === "function") ref(el);
          else if (ref) ref.current = el;
        }}
        tabIndex={0}
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
          padding: "0px 8px",
          fontSize: 14,
          height: 36,
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
      >
        <Dropdown
          disabled={disabled}
          fixedWidthPopup={popupWidthFull}
          placement={placementProps}
          open={open}
          onOpenChange={setOpen}
          getPlacement={setPlacement}
          popupRender={() => (
            <Stack wfull>
              {hasSearch && (
                <Stack
                  wfull
                  style={{
                    padding: "8px",
                  }}
                >
                  <Input
                    value={searchValueOrigin}
                    onChange={(e) => {
                      setSearchValueOrigin(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearchValue(searchValueOrigin);
                      }
                    }}
                    prefix={
                      <Button
                        theme="icon"
                        onClick={() => {
                          setSearchValue(searchValueOrigin);
                        }}
                      >
                        <SearchIcon size={16} />
                      </Button>
                    }
                    suffix={
                      searchValueOrigin && (
                        <Button
                          onClick={() => {
                            setSearchValue("");
                            setSearchValueOrigin("");
                          }}
                          theme="icon"
                        >
                          <CloseIcon />
                        </Button>
                      )
                    }
                  />
                </Stack>
              )}
              {hasSearch && (
                <Divider style={{ marginBottom: 0, marginTop: 0 }} />
              )}
              <DropdownMenu
                ref={(el) => {
                  if (el) {
                    menuRef.current = el;
                  }
                }}
                style={{
                  maxHeight: "400px",
                  overflow: "auto",
                }}
              >
                {options?.filter((opt) =>
                  opt.label.toLowerCase().includes(searchValue.toLowerCase())
                )?.length === 0 ? (
                  <DropdownItem view key="no-item">
                    No item to show here.
                  </DropdownItem>
                ) : (
                  options
                    ?.filter((opt) =>
                      opt.label
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                    )
                    ?.map((opt) => (
                      <DropdownItem
                        key={opt.value}
                        ref={(el) => {
                          if (el) itemRefs.current[opt.value] = el;
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          setValue(opt.value);
                          setOpen(false);
                        }}
                        checked={opt.value === value}
                      >
                        {opt.label}
                      </DropdownItem>
                    ))
                )}
              </DropdownMenu>
            </Stack>
          )}
        >
          <Stack
            tabIndex={0}
            flex
            gap={8}
            align="center"
            style={{ flex: 1, height: "100%", minWidth: 0 }}
          >
            <Ellipsis
              key={selected ? "selectedlabel" : "placeholder"}
              style={{
                color: disabled
                  ? "inherit"
                  : selected
                  ? "var(--hadesui-text-color)"
                  : "var(--hadesui-placeholder-color)",
              }}
            >
              {selected ? selected.label : placeholder}
            </Ellipsis>
            <Stack
              onMouseDown={(e) => {
                e.stopPropagation();
                if (disabled) return;
                if (selected) {
                  setValue("");
                  onClear?.();
                  setOpen(false);
                } else {
                  setOpen((prev) => !prev);
                }
              }}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "var(--hadesui-placeholder-color)",
              }}
            >
              {selected ? (
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
  }
);

Select.displayName = "Select";
export default Select;
