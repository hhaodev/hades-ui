import React, { useState } from "react";
import { Button, Stack, toast } from "../../components";

const NotificationDemo = () => {
  const [toastId, setToastId] = useState("");

  return (
    <Stack>
      <Stack flex gap={8}>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.success({
              title: "Notification!!!",
              description: "Đây là notification không tự động tắt..",
              placement: "topRight", // default
              duration: 0, // 0 is don't auto closeable
            });
            setToastId(toastId);
          }}
        >
          Make toast top right
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.remove(toastId);
          }}
        >
          Remove toast
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.clearAll();
          }}
        >
          Clear all toast
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.success({
              title: "topLeft",
              description: "topLeft",
              placement: "topLeft",
            });
          }}
        >
          Make toast top left
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.success({
              title: "bottomLeft",
              description: "bottomLeft",
              placement: "bottomLeft",
            });
          }}
        >
          Make toast bottom left
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.success({
              title: "bottomRight",
              description: "bottomRight",
              placement: "bottomRight",
            });
          }}
        >
          Make toast bottom right
        </Button>
      </Stack>
      <Stack flex gap={8}>
        <Button
          theme="default"
          onClick={() => {
            toast.success({
              title: "Success",
              description: "Success",
            });
          }}
        >
          Make toast Success
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.warning({
              title: "Warning",
              description: "Warning",
            });
          }}
        >
          Make toast Warning
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.info({
              title: "Info",
              description: "Info",
            });
          }}
        >
          Make toast Info
        </Button>
        <Button
          theme="default"
          onClick={() => {
            toast.error({
              title: "Error",
              description: "Error",
            });
          }}
        >
          Make toast Error
        </Button>
      </Stack>
    </Stack>
  );
};

export default NotificationDemo;
