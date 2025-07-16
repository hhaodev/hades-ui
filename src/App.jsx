import { useState } from "react";
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
} from "./components";
import { useTheme } from "./theme/useTheme";

function App() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [openModal3, setOpenModal3] = useState(false);
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

        {/* dropdown region */}
        <Stack>DROPDOWN</Stack>
        <Stack>
          <Stack
            style={{
              display: "flex",
              gap: 8,
            }}
          >
            <Dropdown
              open={open}
              onOpenChange={setOpen}
              popupRender={() => (
                <Dropdown.Menu>this is custom popup</Dropdown.Menu>
              )}
            >
              <Button type="default">Open Custom Popup</Button>
            </Dropdown>
            <Dropdown
              open={open2}
              onOpenChange={setOpen2}
              menu={[
                {
                  text: <Stack>text1</Stack>,
                  onClick: () => console.log("text 1"),
                },
                {
                  text: <Stack style={{ color: "red" }}>text2</Stack>,
                  onClick: () => console.log("text 2"),
                },
                {
                  text: <Stack>text3</Stack>,
                  onClick: () => console.log("text 3"),
                },
                {
                  text: <Stack>text4</Stack>,
                  onClick: () => console.log("text 4"),
                },
                { text: "text5", onClick: () => console.log("text 5") },
              ]}
            >
              <Button type="default">Open</Button>
            </Dropdown>
          </Stack>
        </Stack>
        {/* end dropdown region */}

        {/* tooltip region */}
        <Stack>TOOLTIP</Stack>
        <Stack>
          <Button>
            <Tooltip tooltip="Button Tooltip">Button Tooltip</Tooltip>
          </Button>
        </Stack>
        <Tooltip tooltip="Div Tooltip">
          <div style={{ textAlign: "center", border: "1px solid red" }}>
            Div Tooltip
          </div>
        </Tooltip>
        <Tooltip tooltip="Tooltip string">Tooltip string</Tooltip>
        <EllipsisWithTooltip style={{ maxWidth: 100 }}>
          Tooltip with ellipsis
        </EllipsisWithTooltip>
        {/* end tooltip region */}

        {/* modal region */}
        <Stack
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button onClick={() => setOpenModal(true)}>Open Modal</Button>
          <Button onClick={() => setOpenModal2(true)}>Open Modal 2</Button>
        </Stack>
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
    </>
  );
}

export default App;
