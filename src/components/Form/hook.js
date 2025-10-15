import { useForm as useReactHookForm } from "react-hook-form";

export function useForm(options = {}) {
  const methods = useReactHookForm(options);

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

    setFieldValue: (name, value) => {
      methods.setValue(name, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    },

    getFieldsValue: () => methods.getValues(),
    getFieldValue: (name) => methods.getValues(name),

    resetFields: (names) => {
      if (!names) return methods.reset();
      const currentValues = methods.getValues();
      names.forEach((name) => {
        methods.resetField(name, { defaultValue: currentValues[name] });
      });
    },

    validateFields: async (names) => {
      const isValid = await methods.trigger(names);
      if (isValid) {
        return {
          status: "valid",
          values: methods.getValues(names),
        };
      } else {
        const values = methods.getValues();
        const { errors } = methods.formState;
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

        return {
          status: "error",
          values: errorWithValues,
        };
      }
    },

    isFieldsTouched: (names, allTouched = false) => {
      const touched = methods.formState.touchedFields;

      if (!names) {
        return Object.keys(touched).length > 0;
      }

      const fields = Array.isArray(names) ? names : [names];

      if (allTouched) {
        return fields.every((name) => !!touched[name]);
      }

      return fields.some((name) => !!touched[name]);
    },

    scrollToField: (name) => {
      const el = document.querySelector(`[name="${name}"]`);
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },

    submit: () =>
      methods.handleSubmit(
        (data) => {
          instance.__internalOnFinish?.(data);
        },
        (errors) => {
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
