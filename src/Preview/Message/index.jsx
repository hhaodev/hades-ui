import React from "react";
import { Button, message, Stack } from "../../components";

const MessageDemo = () => {
  return (
    <Stack flex gap={8}>
      <Button
        onClick={() => {
          message.success({
            message: "Successfully!",
            allowClear: true,
          });
        }}
      >
        Make message success
      </Button>
      <Button
        onClick={() => {
          message.info({
            message: "Information!",
          });
        }}
      >
        Make message info
      </Button>
      <Button
        onClick={() => {
          message.warning({
            message: "Warning!",
          });
        }}
      >
        Make message warning
      </Button>
      <Button
        onClick={() => {
          message.error({
            message: "Error!",
          });
        }}
      >
        Make message error
      </Button>
      <Button
        onClick={() => {
          message.info({
            message:
              "This is long message! This is long message! This is long message! This is long message!",
          });
        }}
      >
        Make long message
      </Button>
      <Button onClick={() => message.clearAll()}>Clear all message</Button>
    </Stack>
  );
};

export default MessageDemo;
