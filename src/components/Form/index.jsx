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

export function Form({ form, children, onFinish, defaultValues }) {
  const fallbackMethods = useReactHookForm({ defaultValues });
  const methods = form?.internalHook ?? fallbackMethods;

  useEffect(() => {
    if (form) {
      form.__internalSetSubmit?.(onFinish);
    }
  }, [form, onFinish]);

  const handleSubmit = (data) => {
    if (onFinish) onFinish(data);
  };

  return (
    <FormContext.Provider value={methods}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)}>{children}</form>
      </FormProvider>
    </FormContext.Provider>
  );
}

Form.Item = FormItem;
Form.useForm = useForm;
