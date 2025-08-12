import React, { useState } from "react";
import {
  Button,
  DateRangePicker,
  Dropdown,
  Select,
  Stack,
} from "../../components";
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
const DropdownDemo = () => {
  const [open, setOpen] = useState(false);

  return (
    <Stack
      flexCol
      gap={8}
      justify="center"
      align="center"
      style={{ height: "calc(100vh - 20px)" }}
    >
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
      </Stack>
      <Stack flex gap={8}>
        <Dropdown placement="bottom-start" menu={menu}>
          <Button theme="default">BOT L</Button>
        </Dropdown>
        <Dropdown placement="bottom" menu={menu}>
          <Button theme="default">BOT CENTER</Button>
        </Dropdown>
        <Dropdown placement="bottom-end" menu={menu}>
          <Button theme="default">BOT R</Button>
        </Dropdown>
      </Stack>
      <Stack flex gap={8}>
        <Dropdown menu={menu} placement="left">
          <Button theme="default">LEFT</Button>
        </Dropdown>
        <Dropdown menu={menu} placement="right">
          <Button theme="default">RIGHT</Button>
        </Dropdown>
      </Stack>
      <Stack flex gap={8}>
        <Dropdown menu={<DateRangePicker />}>
          <Button theme="default">Open Custom Popup</Button>
        </Dropdown>
        <Dropdown
          open={open}
          onOpenChange={setOpen}
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
    </Stack>
  );
};

export default DropdownDemo;
