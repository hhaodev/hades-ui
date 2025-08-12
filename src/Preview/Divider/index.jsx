import React from "react";
import { Divider, Stack } from "../../components";

const DividerDemo = () => {
  return (
    <div>
      <Divider />
      <Divider dashed />
      <Divider>divider</Divider>
      <Divider>divider center</Divider>
      <Divider align="left">divider left</Divider>
      <Divider align="right">divider right</Divider>
      <Divider dashed>divider dashed</Divider>
    </div>
  );
};

export default DividerDemo;
