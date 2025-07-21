import { useEffect, useState } from "react";
import "./App.css";
import {
  Button,
  Dropdown,
  EllipsisWithTooltip,
  OverFlow,
  ResizableBox,
  Stack,
  Tooltip,
  Modal,
  Panel,
  Divider,
  DragDropTable,
  Select,
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

const DEFAULT_CARDS = [
  {
    title: "col1",
    id: "col1",
    items: [
      { title: "card1", id: "1" },
      { title: "card2", id: "2" },
      { title: "card3", id: "3" },
      { title: "card4", id: "4" },
    ],
  },
  {
    title: "col2",
    id: "col2",
    items: [
      { title: "card5", id: "5" },
      { title: "card6", id: "6" },
      { title: "card7", id: "7" },
      { title: "card8", id: "8" },
    ],
  },
  {
    title: "col3",
    id: "col3",
    items: [
      { title: "card9", id: "9" },
      { title: "card10", id: "10" },
      { title: "card11", id: "11" },
      { title: "card12", id: "12" },
    ],
  },
];

function App() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [openModal3, setOpenModal3] = useState(false);
  const [openPanel, setOpenPanel] = useState(false);
  const [placementPanel, setPlacementPanel] = useState("right");
  const [selectedValue, setSelectedValue] = useState("");
  const [data, setData] = useState(DEFAULT_CARDS);
  const [itemsChange, setItemsChange] = useState({});
  useEffect(() => {
    const timer = setTimeout(() => {
      setItemsChange({
        type: "cardMove",
        data: {
          card: { title: "card5", id: "5" },
          oldCol: {
            title: "col2",
            id: "col2",
            items: [
              { title: "card5", id: "5" },
              { title: "card6", id: "6" },
              { title: "card7", id: "7" },
              { title: "card8", id: "8" },
            ],
          },
          targetCol: {
            title: "col1",
            id: "col1",
            items: [
              { title: "card1", id: "1" },
              { title: "card2", id: "2" },
              { title: "card3", id: "3" },
              { title: "card4", id: "4" },
            ],
          },
          dropIndex: 4,
        },
      });
    }, [2000]);
    const timer2 = setTimeout(() => {
      setItemsChange({
        type: "columnMove",
        data: {
          column: {
            title: "col1",
            id: "col1",
            items: [
              {
                title: "card1",
                id: "1",
              },
              {
                title: "card2",
                id: "2",
              },
              {
                title: "card3",
                id: "3",
              },
              {
                title: "card4",
                id: "4",
              },
              {
                title: "card5",
                id: "5",
              },
            ],
          },
          newIndex: 3,
        },
      });
    }, [4000]);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);
  return (
    <>
      <Stack
        style={{
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* theme region */}
        <Stack direction="row">
          <span>THEME</span>: {theme.toUpperCase()}
        </Stack>
        <Stack
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <Button type="default" onClick={() => setTheme("light")}>
            Light
          </Button>
          <Button type="default" onClick={() => setTheme("dark")}>
            Dark
          </Button>
          <Button onClick={() => setTheme("system")}>System</Button>
        </Stack>
        {/* end theme region */}
        <DragDropTable
          itemsChange={itemsChange}
          data={data}
          onChange={(newData, itemsChange) => {
            console.log("🚀 ~ App ~ itemsChange:", itemsChange);
            setData(newData);
          }}
        />
        <Divider />
        <Divider dashed />
        <Divider>divider</Divider>
        <Divider>divider center</Divider>
        <Divider align="left">divider left</Divider>
        <Divider align="right">divider right</Divider>
        <Divider dashed>divider dashed</Divider>
        {/* button region */}
        <Stack>BUTTON</Stack>
        <Stack
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <OverFlow>
            <Button type="default">default</Button>
            <Button type="primary">primary</Button>
            <Button type="link">link</Button>
            <Button type="text">text</Button>
            <Button type="dashed">dashed</Button>
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
              <Button type="default">default</Button>
              <Button type="primary">primary</Button>
              <Button type="link">link</Button>
              <Button type="text">text</Button>
              <Button type="dashed">dashed</Button>
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
              <Button type="default">default</Button>
              <Button type="primary">primary</Button>
              <Button type="link">link</Button>
              <Button type="text">text</Button>
              <Button type="dashed">dashed</Button>
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
          <Stack
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <Dropdown placement="top-start" menu={menu}>
              <Button type="default">TOP L</Button>
            </Dropdown>
            <Dropdown placement="top" menu={menu}>
              <Button type="default">TOP CENTER</Button>
            </Dropdown>
            <Dropdown placement="top-end" menu={menu}>
              <Button type="default">TOP R</Button>
            </Dropdown>
            <Dropdown placement="bottom-start" menu={menu}>
              <Button type="default">BOT L</Button>
            </Dropdown>
            <Dropdown placement="bottom" menu={menu}>
              <Button type="default">BOT CENTER</Button>
            </Dropdown>
            <Dropdown placement="bottom-end" menu={menu}>
              <Button type="default">BOT R</Button>
            </Dropdown>
            <Dropdown menu={menu}>
              <Button type="default">NO</Button>
            </Dropdown>
            <Dropdown menu={menu} placement="right">
              <Button type="default">RIGHT</Button>
            </Dropdown>
            <Dropdown menu={menu} placement="left">
              <Button type="default">LEFT</Button>
            </Dropdown>
            <Dropdown
              fixedWidthPopup={false}
              open={open}
              onOpenChange={setOpen}
              popupRender={() => (
                <Dropdown.Menu>
                  <DropdownItem>
                    <EllipsisWithTooltip>
                      ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
                    </EllipsisWithTooltip>
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
              <Button type="default">Open Custom Popup</Button>
            </Dropdown>
            <Dropdown
              open={open2}
              onOpenChange={setOpen2}
              popupStyles={{
                maxWidth: "100%",
              }}
              menu={<>hehehehehehe</>}
            >
              <Button type="default">Open Custom Popup</Button>
            </Dropdown>
          </Stack>
        </Stack>
        {/* end dropdown region */}
        <Divider>DROPDOWN</Divider>

        {/* tooltip region */}
        <Stack>TOOLTIP</Stack>
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

        <EllipsisWithTooltip placement="right" style={{ maxWidth: 100 }}>
          <div>Tooltip with ellipsis</div>
        </EllipsisWithTooltip>
        <Divider />

        <EllipsisWithTooltip style={{ maxWidth: 2000 }}>
          Đủ chiều rộng. nên sẽ k có tooltip
        </EllipsisWithTooltip>
        <Divider />

        <EllipsisWithTooltip row={3}>
          ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
        </EllipsisWithTooltip>
        {/* end tooltip region */}
        <Divider>TOOLTIP</Divider>

        {/* modal region */}
        <Stack>MODAL</Stack>

        <Stack
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
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
          <Button type="default" key="ok">
            Custom btn
          </Button>,
          <Button key="close">Custom btn</Button>,
        ]}
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        content modal 1
        <Dropdown menu={menu}>
          <Button type="default">NO</Button>
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
