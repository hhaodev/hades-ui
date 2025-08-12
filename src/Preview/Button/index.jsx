import React from "react";
import { Button, Stack } from "../../components";

const ButtonDemo = () => {
  return (
    <Stack flex gap={8}>
      <Button theme="default">default</Button>
      <Button theme="primary">primary</Button>
      <Button theme="link">link</Button>
      <Button theme="text">text</Button>
      <Button theme="dashed">dashed</Button>
      <Button loading>loading</Button>
      <Button disabled>disabled</Button>
    </Stack>
  );
};

export default ButtonDemo;
