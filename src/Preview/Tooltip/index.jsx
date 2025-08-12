import React from "react";
import { Ellipsis, Stack, Tooltip } from "../../components";

const TooltipDemo = () => {
  return (
    <Stack flexCol gap={10}>
      <Tooltip tooltip="Div Tooltip">
        <div style={{ textAlign: "center", border: "1px solid red" }}>
          Div Tooltip
        </div>
      </Tooltip>

      <Tooltip tooltip="Tooltip string">auto có tooltip</Tooltip>

      <Ellipsis placement="right" style={{ maxWidth: 100 }}>
        <div>Tooltip with ellipsis</div>
      </Ellipsis>

      <Ellipsis style={{ maxWidth: 2000 }}>
        Đủ chiều rộng. nên sẽ k có tooltip
      </Ellipsis>

      <Ellipsis row={3}>
        ttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontenttttttttttttttttttttttttttttttcontentttttttttttttttttttttttttttttttcontentttttttttttttttcontentttttttttttttttttttttttt
      </Ellipsis>
    </Stack>
  );
};

export default TooltipDemo;
