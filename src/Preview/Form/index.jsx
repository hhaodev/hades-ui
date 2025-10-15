import {
  Button,
  Checkbox,
  DatePicker,
  DateRangePicker,
  Form,
  Input,
  Select,
  Stack,
  UploadFile,
} from "../../components";

const FormDemo = () => {
  const [form] = Form.useForm();
  return (
    <Stack>
      <Form
        form={form}
        onFinish={(values) => {
          console.log("onFinish:", values);
        }}
        onFinishFailed={(values) => {
          console.log("🚀 ~ onFinishFailed:", values);
        }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Email là bắt buộc" },
            { pattern: /^\S+@\S+\.\S+$/, message: "Email không hợp lệ" },
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>
        <Form.Item label="Color" name="color" rules={[{ required: true }]}>
          <Input type="color" />
        </Form.Item>
        <Form.Item label="Range" name="range" rules={[{ required: true }]}>
          <Input type="range" />
        </Form.Item>
        <Form.Item
          label="Age"
          name="age"
          rules={[
            { required: true, message: "Tuổi là bắt buộc" },
            {
              validate: {
                positive: (v) => {
                  if (v > 0) return true;
                  else return "Phải lớn hơn 0";
                }, // cách viết giống lessThan100 nhưng dễ hiểu hơn..
                lessThan100: (v) => v < 100 || "Phải nhỏ hơn 100",
              },
            },
          ]}
        >
          <Input placeholder="Input number ..." type="number" />
        </Form.Item>

        <Form.Item label="File" name="file">
          <UploadFile
            accept={[".jpg", ".png", "image/*", ".xls", ".xlsx"]}
            multiple
            maxSize={1 * 1024 * 1024}
          />
        </Form.Item>

        <Form.Item label="Chọn số" name="select" rules={[{ required: true }]}>
          <Select
            hasSearch
            options={Array.from({ length: 20 }, (_, i) => {
              const val = `item ${i + 1}`.toString();
              return { label: val, value: i + 1 };
            })}
            placeholder="Select..."
          />
        </Form.Item>
        <Form.Item
          label="Chọn số nhiều"
          name="selectmultiple"
          rules={[{ required: true }]}
        >
          <Select
            hasSearch
            options={Array.from({ length: 20 }, (_, i) => {
              const val = `item ${i + 1}`.toString();
              return { label: val, value: i + 1 };
            })}
            multiple
            placeholder="Select multiple..."
          />
        </Form.Item>

        <Form.Item
          label="Chọn ngày"
          name="daterange"
          rules={[{ required: true }]}
        >
          <DateRangePicker
            hasTimePicker
            format={"ddd, MMMM D, YYYY [at] hh:mm:ss A"}
          />
        </Form.Item>
        <Form.Item label="Chọn ngày" name="date" rules={[{ required: true }]}>
          <DatePicker />
        </Form.Item>
        <Form.Item label="Check" name="check" rules={[{ required: true }]}>
          <Checkbox />
        </Form.Item>
        <Form.Item label="OTP" name="otp" rules={[{ required: true }]}>
          <Input.OTP />
        </Form.Item>
        <Form.Item>
          <Button type="submit">Submit in from</Button>
        </Form.Item>
      </Form>
      <Stack flex gap={8} style={{ marginTop: 10 }}>
        <Button onClick={() => form.submit()}>Submit out from</Button>
        <Button
          onClick={() =>
            form.setFieldsValue({
              daterange: {
                start: "2025-07-22T17:00:00.000Z",
                end: "2025-07-26T17:00:00.000Z",
              },
              range: "10",
              date: "2025-07-22T17:00:00.000Z",
              email: "test@gmail.com",
              age: 54,
              select: 15,
              selectmultiple: [4, 2, 3],
              check: true,
              otp: "123123",
              color: "#ffffff",
            })
          }
        >
          Set form data
        </Button>
        <Button
          onClick={() =>
            form.setError("email", {
              type: "manual",
              message: "Nội dung email lỗi",
            })
          }
        >
          Set error email
        </Button>
        <Button onClick={() => form.clearErrors("email")}>
          Clear email error
        </Button>
        <Button onClick={() => form.clearErrors()}>Clear all error</Button>
        <Button
          onClick={async () => {
            const result = await form.validateFields();
            console.log("🚀 ~ result:", result);
          }}
        >
          Validate form
        </Button>
      </Stack>
    </Stack>
  );
};

export default FormDemo;
