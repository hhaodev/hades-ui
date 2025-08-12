import React, { useState } from "react";
import { Button, Panel, Stack } from "../../components";

const PanelDemo = () => {
  const [openPanel, setOpenPanel] = useState(false);
  const [placementPanel, setPlacementPanel] = useState("right");

  return (
    <Stack>
      <Stack style={{ display: "flex", gap: 10 }}>
        <Button
          onClick={() => {
            setOpenPanel(true);
            setPlacementPanel("right");
          }}
        >
          Open Panel Right
        </Button>
        <Button
          onClick={() => {
            setOpenPanel(true);
            setPlacementPanel("left");
          }}
        >
          Open Panel Left
        </Button>
        <Button
          onClick={() => {
            setOpenPanel(true);
            setPlacementPanel("top");
          }}
        >
          Open Panel Top
        </Button>
        <Button
          onClick={() => {
            setOpenPanel(true);
            setPlacementPanel("bottom");
          }}
        >
          Open Panel Bottom
        </Button>
      </Stack>
      <Panel
        open={openPanel}
        onClose={() => setOpenPanel(false)}
        placement={placementPanel}
      >
        ContentPanel
      </Panel>
    </Stack>
  );
};

export default PanelDemo;
