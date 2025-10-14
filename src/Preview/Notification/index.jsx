import React, { useEffect, useState } from "react";
import { Button, Checkbox, Form, Input, Stack, toast } from "../../components";

const NotificationDemo = () => {
  const [toastId, setToastId] = useState("");

  return (
    <Stack flexCol gap={8}>
      <Form
        defaultValues={{
          limitToast: 5,
          duration: 5,
          pauseOnHover: true,
          showProgress: true,
        }}
        onFinish={(values) => {
          toast.config({
            limitToast: values.limitToast,
            defaultDuration: values.duration * 1000,
            pauseOnHover: values.pauseOnHover,
            showProgress: values.showProgress,
          });
          toast.success({
            title: "Configure",
            description: "Configure successfully!",
          });
        }}
      >
        <Form.Item
          span={1}
          row
          rules={[{ required: true }]}
          label="Limit toast"
          name="limitToast"
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          span={1}
          row
          rules={[{ required: true }]}
          label="Duration"
          name="duration"
        >
          <Input type="number" suffix={"s"} />
        </Form.Item>
        <Form.Item name="pauseOnHover">
          <Checkbox label="Pause on hover" />
        </Form.Item>
        <Form.Item name="showProgress">
          <Checkbox label="Show progress" />
        </Form.Item>
        <Button type="submit">Save</Button>
      </Form>
      <Stack flex gap={8}>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.success({
              title: "topRight",
              description: "topRight",
              placement: "topRight", // default
            });
            setToastId(toastId);
          }}
        >
          Make toast top right
        </Button>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.success({
              title: "topLeft",
              description: "topLeft",
              placement: "topLeft",
            });
            setToastId(toastId);
          }}
        >
          Make toast top left
        </Button>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.success({
              title: "bottomLeft",
              description: "bottomLeft",
              placement: "bottomLeft",
            });
            setToastId(toastId);
          }}
        >
          Make toast bottom left
        </Button>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.success({
              title: "bottomRight",
              description: "bottomRight",
              placement: "bottomRight",
            });
            setToastId(toastId);
          }}
        >
          Make toast bottom right
        </Button>
      </Stack>
      <Stack flex gap={8}>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.success({
              title: "Success",
              description: "Success",
            });
            setToastId(toastId);
          }}
        >
          Make toast Success
        </Button>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.warning({
              title: "Warning",
              description: "Warning",
            });
            setToastId(toastId);
          }}
        >
          Make toast Warning
        </Button>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.info({
              title: "Info",
              description: "Info",
            });
            setToastId(toastId);
          }}
        >
          Make toast Info
        </Button>
        <Button
          theme="default"
          onClick={() => {
            const toastId = toast.error({
              title: "Error",
              description: "Error",
            });
            setToastId(toastId);
          }}
        >
          Make toast Error
        </Button>
      </Stack>
      <Stack flex gap={8}>
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
      </Stack>
      <p>icon (node): icon of notification</p>
      <p>title (node): title of notification</p>
      <p>description (node): body content of notification</p>
      <p>pauseOnHover (boolean): don&apos;t close notification when hover</p>
      <p>showProgress (boolean): show progress bar</p>
      <p>duration (number): 0 is don&apos;t auto closeable </p>
      <p>
        type (string): &quot;success&quot;, &quot;error&quot;,
        &quot;warning&quot;, &quot;info&quot;
      </p>
      <p>
        placement (string): &quot;topLeft&quot;, &quot;topRight&quot;,
        &quot;bottomLeft&quot;, &quot;bottomRight&quot;
      </p>
      <p>
        func: toast.remove(id): id return when use like this: const id =
        toast.success(...args)
      </p>
      <p>func: toast.clearAll(): clear all notification</p>
      <p>
        func: toast.config(
        {
          "{limitToast: number, duration: number, pauseOnHover: boolean, showProgress: boolean}"
        }
        ): limit of box toast, duration of toast item
      </p>
    </Stack>
  );
};

export default NotificationDemo;
