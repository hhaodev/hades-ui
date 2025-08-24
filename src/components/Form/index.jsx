import React, { createContext, useContext, useEffect } from "react";
import { useForm as useReactHookForm, FormProvider } from "react-hook-form";
import { FormItem } from "./FormItem";
import { useForm } from "./hook";

const FormContext = createContext(null);

export function useFormInstance() {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error("<Form.Item> must be used within a <Form>");
  }
  return ctx;
}

export function Form({
  form,
  children,
  onFinish,
  onFinishFailed,
  defaultValues,
}) {
  const fallbackMethods = useReactHookForm({ defaultValues });
  const methods = form?.internalHook ?? fallbackMethods;

  useEffect(() => {
    if (form) {
      form.__internalSetSubmit?.(onFinish, onFinishFailed);
    }
  }, [form, onFinish, onFinishFailed]);

  const handleSubmit = (data) => {
    if (onFinish) onFinish(data);
  };

  const handleError = (errors) => {
    const values = methods.getValues();

    const allFields = Object.keys(values);
    const errorWithValues = allFields.reduce((acc, field) => {
      if (errors[field]) {
        acc[field] = {
          ...errors[field],
          value: values[field],
        };
      } else {
        acc[field] = values[field];
      }
      return acc;
    }, {});
    if (onFinishFailed) onFinishFailed(errorWithValues);
  };

  return (
    <FormContext.Provider value={methods}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit, handleError)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              gap: 8,
            }}
          >
            {children}
          </div>
        </form>
      </FormProvider>
    </FormContext.Provider>
  );
}

Form.Item = FormItem;
Form.useForm = useForm;
