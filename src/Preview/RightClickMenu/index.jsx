import React from "react";
import { RightClickMenu, Stack } from "../../components";
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
const RightClickDemo = () => {
  return (
    <RightClickMenu
      style={{
        border: "1px dashed #ccc",
        height: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      menu={menu}
    >
      Right click here
    </RightClickMenu>
  );
};

export default RightClickDemo;
