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
} from "./components";
import { useTheme } from "./theme/useTheme";

function App() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  return (
    <Stack
      style={{
        padding: "10px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <Stack direction="row">
        <span>Theme</span>: {theme}
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
      <Stack>Button</Stack>
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
      <Stack>horizontal overflow</Stack>
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
      <Stack>vertical overflow</Stack>
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

      <Stack>
        <Stack>dropdown</Stack>
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
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => console.log("Action 1")}>
                  <Stack>Action 1</Stack>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => console.log("Action 2")}>
                  Action 2
                </Dropdown.Item>
                <Dropdown.Item onClick={() => console.log("Action 3")}>
                  Action 3
                </Dropdown.Item>
                <Dropdown.Item onClick={() => console.log("Action 4")}>
                  Action 4
                </Dropdown.Item>
                <Dropdown.Item onClick={() => console.log("Action 5")}>
                  Action 5
                </Dropdown.Item>
                <Dropdown.Item onClick={() => console.log("Action 6")}>
                  Action 6
                </Dropdown.Item>
                <Dropdown.Item onClick={() => console.log("Action 7")}>
                  Action 7
                </Dropdown.Item>
              </Dropdown.Menu>
            )}
          >
            <Button type="default">OpenDropdown</Button>
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
            <Button type="default">
              <EllipsisWithTooltip style={{ maxWidth: 75 }}>
                Hover me !!!!!!!!
              </EllipsisWithTooltip>
            </Button>
          </Dropdown>
        </Stack>
      </Stack>
      <Stack>tooltip</Stack>
      <Stack>
        <Tooltip title="tooltip">
          <Button>hover me</Button>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default App;
