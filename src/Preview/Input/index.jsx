import {
  DatePicker,
  DateRangePicker,
  Input,
  Select,
  Stack,
} from "../../components";

const InputDemo = () => {
  return (
    <Stack flexCol gap={8}>
      <Stack>Input</Stack>
      <Input />
      <Stack>Input number</Stack>
      <Input type="number" />
      <Stack>Color picker</Stack>
      <Input
        type="color"
        onChange={(v) => {
          console.log(v.target.value);
        }}
      />
      <Stack>Range picker</Stack>
      <Input
        type="range"
        onChange={(v) => {
          console.log(v.target.value);
        }}
      />
      <Stack>OTP</Stack>
      <Input.OTP
        onChange={(v) => {
          console.log(v);
        }}
      />
      <Stack>Date picker</Stack>
      <DatePicker />
      <Stack>Date picker with time picker</Stack>
      <DatePicker hasTimePicker />
      <Stack>Range Picker</Stack>
      <DateRangePicker layout="vertical" />
      <DateRangePicker />
      <Select
        hasSearch
        options={Array.from({ length: 20 }, (_, i) => {
          const val = `item ${i + 1}`.toString();
          return { label: val, value: i + 1 };
        })}
        placeholder="Select..."
      />
      <Select
        hasSearch
        options={Array.from({ length: 20 }, (_, i) => {
          const val = `item ${i + 1}`.toString();
          return { label: val, value: i + 1 };
        })}
        multiple
        placeholder="Select multiple..."
      />
    </Stack>
  );
};

export default InputDemo;
