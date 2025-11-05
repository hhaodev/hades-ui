import { createContext, useContext, useEffect } from "react";
import { FormProvider, useForm as useReactHookForm } from "react-hook-form";
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

export function Form({ form, children, onFinish, onFinishFailed }) {
  const fallbackMethods = useReactHookForm();
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

    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const el = document.querySelector(`[name="${firstErrorField}"]`);
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        el.focus?.();
      }
    }

    const errorWithValues = allFields.reduce((acc, field) => {
      if (errors[field]) {
        acc[field] = { ...errors[field], value: values[field] };
      } else {
        acc[field] = values[field];
      }
      return acc;
    }, {});
    onFinishFailed?.(errorWithValues);
  };

  return (
    <FormContext.Provider value={methods}>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit, handleError)}
          noValidate
        >
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
