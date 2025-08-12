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
      methods.handleSubmit(
        (data) => {
          instance.__internalOnFinish?.(data);
        },
        (errors) => {
          const values = methods.getValues();
          const allFields = Object.keys(values);
          const errorWithValues = allFields.reduce((acc, field) => {
            if (errors[field]) {
              acc[field] = { ...errors[field], value: values[field] };
            } else {
              acc[field] = values[field];
            }
            return acc;
          }, {});
          instance.__internalOnFinishFailed?.(errorWithValues);
        }
      )(),

    __internalSetSubmit: (onFinish, onFinishFailed) => {
      instance.__internalOnFinish = onFinish;
      instance.__internalOnFinishFailed = onFinishFailed;
    },
  };

  return [instance];
}
