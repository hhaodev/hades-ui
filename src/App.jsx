import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  ChipTabs,
  DatePicker,
  DateRangePicker,
  Divider,
  DragDropProvider,
  DragDropTable,
  Draggable,
  Dropdown,
  Droppable,
  Ellipsis,
  Form,
  Input,
  message,
  Modal,
  OverFlow,
  Panel,
  ResizableBox,
  RightClickMenu,
  SearchIcon,
  Select,
  Stack,
  Table,
  Tabs,
  toast,
  Tooltip,
  UploadFile,
  XIcon,
} from "./components";
import { useTheme } from "./theme/useTheme";
import { formatDate } from "./utils";

const menu = [
  {
    element: <Stack>text1</Stack>,
    onClick: () => console.log("text 1"),
  },
  {
    element: <Stack style={{ color: "red" }}>text2</Stack>,
    onClick: () => console.log("text 2"),
  },
  {
    element: <Stack>text3</Stack>,
    onClick: () => console.log("text 3"),
  },
  {
    element: <Stack>text4</Stack>,
    onClick: () => console.log("text 4"),
  },
];

const Render = ({ title }) => {
  const [loading, setLoading] = useState(true);
  const randomDivs = useMemo(() => {
    const count = Math.floor(Math.random() * 5) + 1;
    return Array.from({ length: count }, (_, i) => `Item ${i + 1}`);
  }, []);

  useEffect(() => {
    console.log(`Content render ${title}`);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div>
        <div>{`Loading ${title}...`}</div>
      </div>
    );
  }

  return (
    <div>
      <div>{`Content render ${title}`}</div>
      {randomDivs.map((item, index) => (
        <div key={index} style={{ paddingLeft: 12 }}>
          - {item}
        </div>
      ))}
    </div>
  );
};

function App() {
  const [form] = Form.useForm();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [openModal3, setOpenModal3] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [placementPanel, setPlacementPanel] = useState("right");
  const [selectedValue, setSelectedValue] = useState("");
  const [file, setFile] = useState();
  const [toastId, setToastId] = useState("");
  const fetchDataFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem("data");
      const parsed = stored ? JSON.parse(stored) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse localStorage data", e);
      return [];
    }
  };

  const [data, setData] = useState(() => fetchDataFromLocalStorage());

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "data") {
        const newData = JSON.parse(event.newValue || "[]");
        setData(newData);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("data", JSON.stringify(data));
  }, [data]);

  let queue = [];
  let isRunning = false;

  function handleMove(newData, diffInfo) {
    queue.push({ newData, diffInfo });
    processQueue();
  }

  async function processQueue() {
    if (isRunning || queue.length === 0) return;
    isRunning = true;

    const { newData, diffInfo } = queue.shift();
    setData(newData);

    try {
      await fakeApiCall({ shouldFail: false });
    } catch {
      setData((prev) => rollbackMoveCard(prev, diffInfo));
    } finally {
      isRunning = false;
      processQueue();
    }
  }
  function rollbackMoveCard(board, diff, useOriginalIndex = false) {
    const { cardId, fromColId, toColId, fromIndex } = diff;
    const next = structuredClone(board);

    const fromCol = next.find((col) => col.id === fromColId);
    const toCol = next.find((col) => col.id === toColId);
    if (!fromCol || !toCol) return board;

    const idx = toCol.items.findIndex((item) => item.id === cardId);
    if (idx === -1) return board;

    const [moved] = toCol.items.splice(idx, 1);

    if (useOriginalIndex && fromIndex !== -1) {
      fromCol.items.splice(fromIndex, 0, moved);
    } else {
      fromCol.items.push(moved);
    }

    return next;
  }
  function fakeApiCall({ shouldFail = false, delay = 3000 } = {}) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail || Math.random() < 0) {
          reject(new Error("Lỗi gọi API (giả lập)"));
        } else {
          resolve({ data: "Dữ liệu trả về từ API" });
        }
      }, delay);
    });
  }
  const TabList = () => (
    <>
      <Tabs.Item tabKey="tab1" title="Tab 1">
        <Render key="tab1" title={1} />
      </Tabs.Item>
      <Tabs.Item tabKey="tab2" title="Tab 2">
        <Render key="tab2" title={2} />
      </Tabs.Item>
      <Tabs.Item tabKey="tab3" title="Tab 3">
        <Render key="tab3" title={3} />
      </Tabs.Item>
      <Tabs.Item tabKey="tab4" title="Tab 4">
        <Render key="tab4" title={4} />
      </Tabs.Item>
      <Tabs.Item tabKey="tab5" title="Tab 5">
        <Render key="tab5" title={5} />
      </Tabs.Item>
      <Tabs.Item tabKey="tab6" title="Tab 6">
        <Render key="tab6" title={6} />
      </Tabs.Item>
      <Tabs.Item tabKey="tab7" title="Tab 7">
        <Render key="tab7" title={7} />
      </Tabs.Item>
      <Tabs.Item tabKey="tab8" title="Tab 8">
        <Render key="tab8" title={8} />
      </Tabs.Item>
    </>
  );

  const columns = useMemo(() => {
    return [
      {
        title: <span style={{ color: "red" }}>Name</span>,
        dataIndex: "name",
        key: "name",
        render: (v) => <span style={{ color: "red" }}>{v}</span>,
        sortable: true,
        sorter: (a, b) =>
          String(a.name).localeCompare(String(b.name), undefined, {
            sensitivity: "base",
            numeric: true,
          }),
        fixed: "left",
        searchable: true,
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sortable: true,
        searchable: true,
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (v) => <span>{formatDate(v, "DD-MM-YYYY")}</span>,
        sortable: true,
        sorter: (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => {
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                width: "250px",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600 }}>Custom filter</div>
              <DateRangePicker
                value={selectedKeys?.selected[0]}
                onChange={(value) =>
                  setSelectedKeys(
                    value ? [{ start: value.start, end: value.end }] : [] // required array => return array[0] at value in OnFilter
                  )
                }
              />
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  theme="text"
                  onClick={() => clearFilters()}
                  size="small"
                >
                  Reset
                </Button>
                <Button onClick={() => confirm()} size="small">
                  Apply
                </Button>
              </div>
            </div>
          );
        },
        onFilter: (value, record) => {
          // value expected: { start: string|Date, end: string|Date }
          if (!value || !value.start || !value.end) return true;

          const recordDate = new Date(record.createdAt);
          if (isNaN(recordDate.getTime())) return false;

          const startDay = new Date(value.start);
          startDay.setHours(0, 0, 0, 0);

          const endDay = new Date(value.end);
          endDay.setHours(23, 59, 59, 999);

          return recordDate >= startDay && recordDate <= endDay;
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        // ví dụ custom active > pending > inactive > banned
        sortable: true,
        sorter: (a, b) => {
          const order = { active: 0, pending: 1, inactive: 2, banned: 3 };
          return (order[a.status] ?? 99) - (order[b.status] ?? 99);
        },
        filters: [
          { text: "Active", value: "active" },
          { text: "Pending", value: "pending" },
          { text: "Inactive", value: "inactive" },
          { text: "Banned", value: "banned" },
          { text: "Not Active", value: "notActive" },
        ],
        onFilter: (value, record) => {
          // custom filter
          if (value === "notActive") {
            return ["inactive", "banned"].includes(record.status);
          }
          return record.status === value;
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (v) => <span>{typeof v === "number" ? v.toFixed(2) : v}</span>,
        sortable: true,
        sorter: (a, b) => {
          const va = a.amount ?? 0;
          const vb = b.amount ?? 0;
          return va - vb;
        },
      },
      ...Array.from({ length: 5 }, (_, i) => {
        const dataIndex = `col${i + 1}`;
        return {
          title: `Tag ${i + 1}`,
          dataIndex,
          key: dataIndex,
          render: (v) => <span>{v}</span>,
          sortable: true,
        };
      }),
    ];
  }, []);

  const dataTable = useMemo(() => {
    const rand = ((s) => {
      let a = s;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })(42);

    const firstNames = [
      "Linh",
      "An",
      "Minh",
      "Huy",
      "Thu",
      "Trang",
      "Hoa",
      "Quang",
      "Hà",
      "Vy",
    ];
    const lastNames = [
      "Nguyễn",
      "Trần",
      "Lê",
      "Phạm",
      "Hoàng",
      "Phan",
      "Vũ",
      "Đặng",
      "Bùi",
      "Đỗ",
    ];
    const tags = ["alpha", "beta", "gamma", "delta", "epsilon"];
    const now = Date.now();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    const normal = (mean = 120, sd = 30) => {
      const u = 1 - rand();
      const v = 1 - rand();
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return Math.round(Math.max(0, mean + z * sd) * 100) / 100;
    };

    return Array.from({ length: 100000 }, (_, i) => {
      const id = (i + 1).toString();
      const key = id;
      const first = firstNames[Math.floor(rand() * firstNames.length)];
      const last = lastNames[Math.floor(rand() * lastNames.length)];
      const name = `${first} ${last}`;
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(
        rand() * 100
      )}@example.com`;
      const createdAt = new Date(
        now - Math.floor(rand() * oneYear)
      ).toISOString();
      const p = rand();
      const status =
        p < 0.7
          ? "active"
          : p < 0.85
          ? "pending"
          : p < 0.95
          ? "inactive"
          : "banned";
      const amount = normal();

      return {
        id,
        key,
        name,
        email,
        createdAt,
        status,
        amount,
        col1: tags[Math.floor(rand() * tags.length)],
        col2: tags[Math.floor(rand() * tags.length)],
        col3: tags[Math.floor(rand() * tags.length)],
        col4: tags[Math.floor(rand() * tags.length)],
        col5: tags[Math.floor(rand() * tags.length)],
      };
    });
  }, []);

  return (
    <>
      <Stack
        style={{
          padding: "10px",
        }}
        flexCol
        gap={8}
      >
        {/* theme region */}
        <Stack flex>
          <span>THEME</span>: {theme.toUpperCase()}
        </Stack>
        <Stack flex gap={8}>
          <Button theme="default" onClick={() => setTheme("light")}>
            Light
          </Button>
          <Button theme="default" onClick={() => setTheme("dark")}>
            Dark
          </Button>
          <Button onClick={() => setTheme("system")}>System</Button>
        </Stack>
        {/* end theme region */}
        <DragDropTable data={data} onChange={handleMove} />
        <UploadFile multiple onChange={setFile} />
        {/* <DragDropProvider onDragEnd={(props) => console.log(props)}>
          <Droppable droppableId="board" acceptType="column">
            <div style={{ display: "flex", gap: 8 }}>
              <Draggable
                droppableId="board"
                draggableId="col-1"
                dragType="column"
                data={{ id: "col-1" }}
              >
                <div
                  style={{
                    padding: 16,
                    background: "#ccc",
                  }}
                >
                  <div className="column-header">Column 1</div>
                  <Droppable droppableId="col-1" acceptType="card">
                    <div className="card-list">
                      <Draggable
                        draggableId="card-1"
                        dragType="card"
                        droppableId="col-1"
                        data={{ id: "card-1" }}
                      >
                        <div className="card">Card 1</div>
                        <div>
                          <Droppable
                            droppableId="card-1"
                            acceptType="mini-card"
                          >
                            <Draggable
                              draggableId="mini-card-1"
                              dragType="mini-card"
                              droppableId="card-1"
                              data={{ id: "mini-card-1" }}
                            >
                              <div>mini card 1</div>
                            </Draggable>
                          </Droppable>
                        </div>
                      </Draggable>
                    </div>
                  </Droppable>
                </div>
              </Draggable>
              <Draggable
                droppableId="board"
                draggableId="col-2"
                dragType="column"
                data={{ id: "col-2" }}
              >
                <div
                  style={{
                    padding: 16,
                    background: "#ccc",
                  }}
                >
                  <div className="column-header">Column 2</div>
                  <Droppable droppableId="col-2" acceptType="card">
                    <div className="card-list">
                      <Draggable
                        draggableId="card-2"
                        dragType="card"
                        droppableId="col-2"
                        data={{ id: "card-2" }}
                      >
                        <div className="card">Card 2</div>
                        <div>
                          <Droppable
                            droppableId="card-2"
                            acceptType="mini-card"
                          >
                            <Draggable
                              draggableId="mini-card-2"
                              dragType="mini-card"
                              droppableId="card-2"
                              data={{ id: "mini-card-2" }}
                            >
                              <div>mini card 2</div>
                            </Draggable>
                          </Droppable>
                        </div>
                      </Draggable>
                    </div>
                  </Droppable>
                </div>
              </Draggable>
            </div>
          </Droppable>
        </DragDropProvider> */}
        <Table
          checkable
          columns={columns}
          data={dataTable}
          onCheck={(items) => {
            console.log(items);
          }}
          rowKey="key" //id để biết từng row là khác nhau
          style={{
            maxHeight: "400px",
          }}
        />
        <ResizableBox>
          <ChipTabs
            tabs={[
              { key: 1, title: "Tab 1" /*props....*/ },
              { key: 2, title: "Tab 2" },
              { key: 3, title: "Tab 3" },
              { key: 4, title: "Tab 4" },
            ]}
            defaultActive={4}
            onChange={(tab) => {
              console.log(tab);
            }}
          />
        </ResizableBox>
        <ChipTabs
          tabs={[
            { key: 1, title: "Tab 1" /*props....*/ },
            { key: 2, title: "Tab 2" },
            { key: 3, title: "Tab 3" },
            { key: 4, title: "Tab 4" },
          ]}
          defaultActive={4}
          onChange={(tab) => {
            console.log(tab);
          }}
        />
        <ResizableBox>
          <Tabs defaultActive="tab1" tabPosition="top">
            <TabList />
          </Tabs>
        </ResizableBox>
        <Tabs defaultActive="tab2" tabPosition="bottom">
          <TabList />
        </Tabs>
        <ResizableBox>
          <Tabs defaultActive="tab3" tabPosition="left">
            <TabList />
          </Tabs>
        </ResizableBox>
        <Stack>destroy tabs</Stack>
        <Tabs destroy defaultActive="tab4" tabPosition="right">
          <TabList />
        </Tabs>

        <Input placeholder="Nhập email" />
        <Form
          form={form}
          onFinish={(values) => {
            console.log("Submit:", values);
          }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Email là bắt buộc" },
              { pattern: /^\S+@\S+\.\S+$/, message: "Email không hợp lệ" },
            ]}
          >
            <Input
              placeholder="Nhập email"
              suffix={
                <Button theme="icon">
                  <SearchIcon size={16} />
                </Button>
              }
            />
          </Form.Item>
          <Form.Item
            label="Age"
            name="age"
            rules={[
              { required: true, message: "Tuổi là bắt buộc" },
              {
                validate: {
                  positive: (v) => v > 0 || "Phải lớn hơn 0",
                  lessThan100: (v) => v < 100 || "Phải nhỏ hơn 100",
                },
              },
            ]}
          >
            <Input placeholder="Input number ..." type="number" />
          </Form.Item>

          <Form.Item label="Checkbox" name="check" rules={[{ required: true }]}>
            {/* <UploadFile
              view
              accept={[".jpg", ".png", "image/*", ".xls", ".xlsx"]}
              multiple
              maxSize={1 * 1024 * 1024}
            /> */}
            <Checkbox />
          </Form.Item>

          <Form.Item label="Chọn số" name="select" rules={[{ required: true }]}>
            <Select
              hasSearch
              options={Array.from({ length: 5 }, (_, i) => {
                const val = `${i + 1}0000000000000`.toString();
                return { label: val, value: val };
              })}
              placeholder="Select..."
            />
          </Form.Item>

          {/* <Form.Item label="Chọn ngày" name="date" rules={[{ required: true }]}>
            <DateRangePicker />
          </Form.Item> */}

          <Button type="submit">Submit</Button>
        </Form>
        <DateRangePicker
          hasTimePicker
          format={"ddd, MMMM D, YYYY [at] hh:mm:ss A"}
        />
        <DatePicker />

        <Stack flexCol gap={8}>
          <Button
            onClick={() =>
              form.setFieldsValue({
                date: {
                  start: "2025-07-22T17:00:00.000Z",
                  end: "2025-07-26T17:00:00.000Z",
                },
                email: "test@gmail.com",
                age: 54,
                select: "30000000000000",
                file: file,
                check: true,
              })
            }
          >
            Set form data
          </Button>
          <Button
            onClick={() =>
              form.setError("email", {
                type: "manual",
                message: "Nội dung email lỗi",
              })
            }
          >
            Set error email
          </Button>
          <Button onClick={() => form.clearErrors("email")}>
            Clear email error
          </Button>
          <Button onClick={() => form.clearErrors()}>Clear all error</Button>
        </Stack>
        <Divider />
        <Divider dashed />
        <Divider>divider</Divider>
        <Divider>divider center</Divider>
        <Divider align="left">divider left</Divider>
        <Divider align="right">divider right</Divider>
        <Divider dashed>divider dashed</Divider>
        {/* button region */}
        <Stack>BUTTON</Stack>
        <Stack flex gap={8}>
          <OverFlow>
            <Button theme="default">default</Button>
            <Button theme="primary">primary</Button>
            <Button theme="link">link</Button>
            <Button theme="text">text</Button>
            <Button theme="dashed">dashed</Button>
            <Button loading>loading</Button>
            <Button disabled>disabled</Button>
          </OverFlow>
        </Stack>
        {/* end button region */}
        <Divider>BUTTON</Divider>

        <Button
          theme="default"
          onClick={() => {
            $$.loading(true);
            setTimeout(() => $$.loading(false), 3000);
          }}
        >
          Start Loading
        </Button>
        <Stack flex gap={8}>
          <Button
            theme="default"
            onClick={() => {
              const toastId = toast.success({
                title: "Notification!!!",
                description: "Đây là notification không tự động tắt..",
                placement: "topRight", // default
                duration: 0, // 0 is don't auto closeable
              });
              setToastId(toastId);
            }}
          >
            Make toast top right
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.remove(toastId);
            }}
          >
            Remove toast
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.clearAll();
            }}
          >
            Clear all toast
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.success({
                title: "topLeft",
                description: "topLeft",
                placement: "topLeft",
              });
            }}
          >
            Make toast top left
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.success({
                title: "bottomLeft",
                description: "bottomLeft",
                placement: "bottomLeft",
              });
            }}
          >
            Make toast bottom left
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.success({
                title: "bottomRight",
                description: "bottomRight",
                placement: "bottomRight",
              });
            }}
          >
            Make toast bottom right
          </Button>
        </Stack>
        <Stack flex gap={8}>
          <Button
            theme="default"
            onClick={() => {
              toast.success({
                title: "Success",
                description: "Success",
              });
            }}
          >
            Make toast Success
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.warning({
                title: "Warning",
                description: "Warning",
              });
            }}
          >
            Make toast Warning
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.info({
                title: "Info",
                description: "Info",
              });
            }}
          >
            Make toast Info
          </Button>
          <Button
            theme="default"
            onClick={() => {
              toast.error({
                title: "Error",
                description: "Error",
              });
            }}
          >
            Make toast Error
          </Button>
        </Stack>
        <Stack flex gap={8}>
          <Button
            onClick={() => {
              message.success({
                message: "Successfully!",
                allowClear: true,
              });
            }}
          >
            Make message success
          </Button>
          <Button
            onClick={() => {
              message.info({
                message: "Information!",
              });
            }}
          >
            Make message info
          </Button>
          <Button
            onClick={() => {
              message.warning({
                message: "Warning!",
              });
            }}
          >
            Make message warning
          </Button>
          <Button
            onClick={() => {
              message.error({
                message: "Error!",
              });
            }}
          >
            Make message error
          </Button>
          <Button
            onClick={() => {
              message.info({
                message:
                  "This is long message! This is long message! This is long message! This is long message!",
              });
            }}
          >
            Make long message
          </Button>
          <Button onClick={() => message.clearAll()}>Clear all message</Button>
        </Stack>

        <Divider>Test Loading</Divider>

        <RightClickMenu style={{ border: "1px dashed #ccc" }} menu={menu}>
          <div>right click here</div>
          <div>right click here</div>
          <div>right click here</div>
          <div>right click here</div>
          <div>right click here</div>
          <div>right click here</div>
        </RightClickMenu>

        {/* overflow region */}
        <Stack>VERTICAL OVERFLOW</Stack>
        <Stack>
          <ResizableBox width={50}>
            <OverFlow mode="vertical">
              <Button theme="default">default</Button>
              <Button theme="primary">primary</Button>
              <Button theme="link">link</Button>
              <Button theme="text">text</Button>
              <Button theme="dashed">dashed</Button>
              <Button loading>loading</Button>
              <Button disabled>disabled</Button>
            </OverFlow>
          </ResizableBox>
        </Stack>
        <Divider>VERTICAL OVERFLOW</Divider>

        <Stack>HORIZONTAL OVERFLOW</Stack>
        <Stack>
          <ResizableBox width={500}>
            <OverFlow>
              <Button theme="default">default</Button>
              <Button theme="primary">primary</Button>
              <Button theme="link">link</Button>
              <Button theme="text">text</Button>
              <Button theme="dashed">dashed</Button>
              <Button loading>loading</Button>
              <Button disabled>disabled</Button>
            </OverFlow>
          </ResizableBox>
        </Stack>
        {/* end overflow region */}
        <Divider>HORIZONTAL OVERFLOW</Divider>

        {/* dropdown region */}
        <Stack>DROPDOWN</Stack>
        <OverFlow>
          <Stack flex gap={8}>
            <Dropdown placement="top-start" menu={menu}>
              <Button theme="default">TOP L</Button>
            </Dropdown>
            <Dropdown placement="top" menu={menu}>
              <Button theme="default">TOP CENTER</Button>
            </Dropdown>
            <Dropdown placement="top-end" menu={menu}>
              <Button theme="default">TOP R</Button>
            </Dropdown>
            <Dropdown placement="bottom-start" menu={menu}>
              <Button theme="default">BOT L</Button>
            </Dropdown>
            <Dropdown placement="bottom" menu={menu}>
              <Button theme="default">BOT CENTER</Button>
            </Dropdown>
            <Dropdown placement="bottom-end" menu={menu}>
              <Button theme="default">BOT R</Button>
            </Dropdown>
            <Dropdown menu={menu}>
              <Button theme="default">NO</Button>
            </Dropdown>
            <Dropdown menu={menu} placement="right">
              <Button theme="default">RIGHT</Button>
            </Dropdown>
            <Dropdown menu={menu} placement="left">
              <Button theme="default">LEFT</Button>
            </Dropdown>
            <Dropdown menu={<DateRangePicker />}>
              <Button theme="default">Open Custom Popup</Button>
            </Dropdown>
            <Dropdown
              menu={
                <Select
                  hasSearch
                  options={Array.from({ length: 5 }, (_, i) => {
                    const val = `${i + 1}0000000000000`.toString();
                    return { label: val, value: val };
                  })}
                  placeholder="Select..."
                />
              }
            >
              <Button theme="default">Open Custom Popup</Button>
            </Dropdown>
            <Dropdown menu={<>hehehehehehe</>}>
              <Button theme="default">Open Custom Popup</Button>
            </Dropdown>
          </Stack>
        </OverFlow>
        {/* end dropdown region */}
        <Divider>DROPDOWN</Divider>

        {/* tooltip region */}
        <Stack>TOOLTIP</Stack>

        <Stack>
          <Button>
            <Tooltip tooltip="Button Tooltip">Button Tooltip</Tooltip>
          </Button>
        </Stack>
        <Divider />
        <Tooltip tooltip="Div Tooltip">
          <div style={{ textAlign: "center", border: "1px solid red" }}>
            Div Tooltip
          </div>
        </Tooltip>
        <Divider />

        <Tooltip tooltip="Tooltip string">auto có tooltip</Tooltip>
        <Divider />

        <Ellipsis placement="right" style={{ maxWidth: 100 }}>
          <div>Tooltip with ellipsis</div>
        </Ellipsis>
        <Divider />

        <Ellipsis style={{ maxWidth: 2000 }}>
          Đủ chiều rộng. nên sẽ k có tooltip
        </Ellipsis>
        <Divider />

        <Ellipsis row={3}>
          ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
        </Ellipsis>
        {/* end tooltip region */}
        <Divider>TOOLTIP</Divider>

        {/* modal region */}
        <Stack>MODAL</Stack>

        <Stack flex justify="space-between">
          <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
          <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        </Stack>

        <Divider>MODAL</Divider>
        {/* panel region */}
        <Stack>PANEL</Stack>
        <Stack style={{ display: "flex", gap: 10 }}>
          <Button
            onClick={() => {
              setOpenPanel(true);
              setPlacementPanel("right");
            }}
          >
            Open Panel Right
          </Button>
          <Button
            onClick={() => {
              setOpenPanel(true);
              setPlacementPanel("left");
            }}
          >
            Open Panel Left
          </Button>
          <Button
            onClick={() => {
              setOpenPanel(true);
              setPlacementPanel("top");
            }}
          >
            Open Panel Top
          </Button>
          <Button
            onClick={() => {
              setOpenPanel(true);
              setPlacementPanel("bottom");
            }}
          >
            Open Panel Bottom
          </Button>
        </Stack>
        <Divider>PANEL</Divider>
      </Stack>

      <Modal
        title={"Modal 1"}
        buttons={[
          <Button theme="default" key="ok">
            Custom btn
          </Button>,
          <Button key="close">Custom btn</Button>,
        ]}
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        content modal 1
        <Dropdown menu={menu}>
          <Button theme="default">NO</Button>
        </Dropdown>
        <Button onClick={() => setOpenModal3(true)}>Open next modal</Button>
      </Modal>
      <Modal
        title={"modal2"}
        open={openModal2}
        onClose={() => setOpenModal2(false)}
      >
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
        <Stack>long content</Stack>
      </Modal>
      <Modal
        title={"modal3"}
        open={openModal3}
        onClose={() => setOpenModal3(false)}
      >
        content next modal
        <Button onClick={() => setOpenModal2(true)}>Open next modal</Button>
      </Modal>

      <Panel
        open={openPanel}
        onClose={() => setOpenPanel(false)}
        placement={placementPanel}
      >
        <Stack
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
          <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        </Stack>
        <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
      </Panel>
    </>
  );
}

export default App;
