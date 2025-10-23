import React, { useEffect, useState } from "react";
import { Button, Checkbox, Form, Input, Stack, toast } from "../../components";

const NotificationDemo = () => {
  const [form] = Form.useForm({
    defaultValues: {
      limitToast: 5,
      duration: 5,
      pauseOnHover: true,
      showProgress: true,
    },
  });
  const [toastId, setToastId] = useState([]);

  const addToast = (id) => {
    setToastId((prev) => [id, ...prev]);
  };

  const removeToast = (id) => {
    setToastId((prev) => prev.filter((i) => i !== id));
  };

  return (
    <Stack flexCol gap={8}>
      <Form
        form={form}
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
        onFinishFailed={(v) => {
          console.log(v);
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
          rules={[
            { required: true },
            {
              validate: {
                positive: (v) => v >= 0 || "Phải lớn hơn hoặc bằng 0",
                lessThan100: (v) => v < 100 || "Phải nhỏ hơn 100",
              },
            },
          ]}
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
              onHide: removeToast, // callback after toast removed
            });
            addToast(toastId);
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
              onHide: removeToast,
            });
            addToast(toastId);
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
              onHide: removeToast,
            });
            addToast(toastId);
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
              onHide: removeToast,
            });
            addToast(toastId);
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
              onHide: removeToast,
            });
            addToast(toastId);
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
              onHide: removeToast,
            });
            addToast(toastId);
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
              onHide: removeToast,
            });
            addToast(toastId);
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
              onHide: removeToast,
            });
            addToast(toastId);
          }}
        >
          Make toast Error
        </Button>
      </Stack>
      <Stack flex gap={8}>
        <Button
          theme="default"
          onClick={() => {
            if (toastId.length === 0) return;
            const ele = document.querySelector(`#${toastId}`);
            ele?.method("hide"); // api DOM
            // toast.remove(toastId[0]); //api toast
          }}
        >
          Remove toast
        </Button>
        <Button
          theme="default"
          onClick={() => {
            const allToast = document.querySelectorAll("hadesui-toast");
            allToast?.forEach((el) => {
              el.method("hide");
            });
            // toast.clearAll();
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
      <p>onHide: callback return id of toast after toast removed</p>
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
      <p>
        querySelector(idToast): query element toast. include method hide.
        example: element.method( &quot;hide&quot;)
      </p>
    </Stack>
  );
};

export default NotificationDemo;
