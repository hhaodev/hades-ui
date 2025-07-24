import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Button,
  Dropdown,
  Ellipsis,
  OverFlow,
  ResizableBox,
  Stack,
  Tooltip,
  Modal,
  Panel,
  Divider,
  DragDropTable,
  Select,
  Input,
  Form,
  UploadFile,
  DatePicker,
} from "./components";
import { useTheme } from "./theme/useTheme";
import { DropdownItem } from "./components/Dropdown/DropdownItem";

const menu = [
  {
    element: <Stack>text111111111111111111</Stack>,
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
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
  {
    element: "aaa",
    onClick: () => console.log("text 5"),
  },
];
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
        if (shouldFail || Math.random() < 1) {
          reject(new Error("Lỗi gọi API (giả lập)"));
        } else {
          resolve({ data: "Dữ liệu trả về từ API" });
        }
      }, delay);
    });
  }

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
        {/* <UploadFile multiple onChange={setFile} /> */}
        <Input type="date" onChange={(v) => console.log(v)} />
        <Select
          value={selectedValue}
          onChange={(v) => setSelectedValue(v)}
          options={Array.from({ length: 50 }, (_, i) => {
            const val = `${i + 1}0000000000000`.toString();
            return { label: val, value: val };
          })}
          placeholder="Chọn 1 số nào hẹ hẹ"
          onClear={() => setSelectedValue("")}
        />
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
            <Input placeholder="Nhập email" />
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
            <Input type="number" />
          </Form.Item>

          <Form.Item label="Chọn file" name="file" rules={[{ required: true }]}>
            <UploadFile
              accept={[".jpg", ".png", "image/*", ".xls", ".xlsx"]}
              multiple
              maxSize={1 * 1024 * 1024}
            />
          </Form.Item>

          <Form.Item label="Chọn số" name="select" rules={[{ required: true }]}>
            <Select
              hasSearch
              options={Array.from({ length: 50 }, (_, i) => {
                const val = `${i + 1}0000000000000`.toString();
                return { label: val, value: val };
              })}
              placeholder="Chọn 1 số nào hẹ hẹ"
            />
          </Form.Item>

          <Form.Item label="Chọn ngày" name="date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>

          <Button type="submit">Submit</Button>
        </Form>
        <Stack flexCol gap={8}>
          <Button onClick={() => form.setFieldsValue({ file: "" })}>
            Set email to hehe@gmail.com
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
        <Stack>
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
            <Dropdown
              fixedWidthPopup={false}
              open={open}
              onOpenChange={setOpen}
              popupRender={() => (
                <Dropdown.Menu>
                  <DropdownItem>
                    <Ellipsis>
                      ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
                    </Ellipsis>
                  </DropdownItem>
                  <DropdownItem row={2}>
                    <Stack>
                      ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
                    </Stack>
                  </DropdownItem>
                  <DropdownItem row={2}>
                    <Stack>
                      ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
                    </Stack>
                  </DropdownItem>
                  <DropdownItem row={2}>
                    <Stack>
                      ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
                    </Stack>
                  </DropdownItem>
                  <DropdownItem row={2}>
                    <Stack>
                      ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
                    </Stack>
                  </DropdownItem>
                  <DropdownItem row={2}>
                    <Stack>
                      ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
                    </Stack>
                  </DropdownItem>
                </Dropdown.Menu>
              )}
            >
              <Button theme="default">Open Custom Popup</Button>
            </Dropdown>
            <Dropdown
              open={open2}
              onOpenChange={setOpen2}
              popupStyles={{
                maxWidth: "100%",
              }}
              menu={<>hehehehehehe</>}
            >
              <Button theme="default">Open Custom Popup</Button>
            </Dropdown>
          </Stack>
        </Stack>
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
