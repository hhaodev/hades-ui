import { useForm as useReactHookForm } from "react-hook-form";

export function useForm() {
  const methods = useReactHookForm();

  const instance = {
    ...methods,
    internalHook: methods,
    setFieldsValue: (values) => {
      Object.entries(values).forEach(([key, val]) => {
        methods.setValue(key, val, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      });
    },
    getFieldsValue: () => methods.getValues(),
    resetFields: () => methods.reset(),
    submit: () =>
      methods.handleSubmit((data) => {
        instance.__internalSubmit?.(data);
      })(),
    __internalSetSubmit: (fn) => {
      instance.__internalSubmit = fn;
    },
  };

  return [instance];
}
