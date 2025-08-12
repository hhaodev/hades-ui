import React from "react";
import { Button, OverFlow, ResizableBox, Stack } from "../../components";

const OverflowDemo = () => {
  return (
    <Stack>
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
    </Stack>
  );
};

export default OverflowDemo;
