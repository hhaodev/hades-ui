import { Button, Stack } from "../../components";

const LoadingDemo = () => {
  return (
    <Stack>
      <Button
        theme="default"
        onClick={() => {
          $$.loading(true);
          setTimeout(() => $$.loading(false), 3000);
        }}
      >
        Start Loading
      </Button>
    </Stack>
  );
};

export default LoadingDemo;
