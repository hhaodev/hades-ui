import { Button, OverFlow, ResizableBox, Stack } from "../../components";

const OverflowDemo = () => {
  return (
    <Stack>
      <Stack>VERTICAL OVERFLOW</Stack>
      <Stack>
        <ResizableBox mode={"vertical"} width={140} minHeight={60} height={200}>
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
        <ResizableBox mode={"horizontal"} width={500} height={60}>
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
      <Stack>BOTH RESIZE</Stack>
      <Stack>
        <ResizableBox width={500} minHeight={100}>
          <Stack style={{ height: "40px" }}>
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
          <Stack style={{ height: "calc(100% - 40px)" }}>
            <OverFlow mode="vertical">
              <Button theme="default">default</Button>
              <Button theme="primary">primary</Button>
              <Button theme="link">link</Button>
              <Button theme="text">text</Button>
              <Button theme="dashed">dashed</Button>
              <Button loading>loading</Button>
              <Button disabled>disabled</Button>
            </OverFlow>
          </Stack>
        </ResizableBox>
      </Stack>
    </Stack>
  );
};

export default OverflowDemo;
