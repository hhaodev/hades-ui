import React from "react";
import { Button, Stack } from "../../components";
import { useTheme } from "../../theme/useTheme";

const ThemeDemo = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Stack>
      <Stack flex>
        <span>THEME</span>: {theme.toUpperCase()}
      </Stack>
      <Stack flex gap={8}>
        <Button theme="default" onClick={() => setTheme("light")}>
          Light
        </Button>
        <Button theme="default" onClick={() => setTheme("dark")}>
          Dark
        </Button>
        <Button onClick={() => setTheme("system")}>System</Button>
      </Stack>
    </Stack>
  );
};

export default ThemeDemo;
