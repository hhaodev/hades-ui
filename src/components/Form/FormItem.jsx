import React, { useRef } from "react";
import { Controller } from "react-hook-form";
import { useFormInstance } from ".";

function mergeRules(rules = []) {
  const output = {};

  for (const rule of rules) {
    if (rule.required) {
      output.required = {
        value: true,
        message: rule.message || "This field is required",
      };
    }
    if (rule.maxLength) {
      output.maxLength = {
        value: rule.maxLength,
        message: rule.message || `Max length is ${rule.maxLength}`,
      };
    }
    if (rule.minLength) {
      output.minLength = {
        value: rule.minLength,
        message: rule.message || `Min length is ${rule.minLength}`,
      };
    }
    if (rule.pattern) {
      output.pattern = {
        value: rule.pattern,
        message: rule.message || "Invalid format",
      };
    }
    if (rule.validate) {
      output.validate = rule.validate;
    }
  }

  return output;
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export function FormItem({
  name,
  label,
  rules = [],
  children,
  validateTrigger = "onBlur",
  debounceValidate = 0,
}) {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormInstance();

  const error = errors[name]?.message;
  const mergedRules = mergeRules(rules);
  const triggers = Array.isArray(validateTrigger)
    ? validateTrigger
    : [validateTrigger];
  const debouncedTrigger = useRef(
    debounce(() => trigger(name), debounceValidate)
  ).current;

  const renderLabel = () => (
    <>
      {label && (
        <div
          data-color-red-error={!!error}
          style={{ marginBottom: 4, fontSize: 14 }}
        >
          {label}
          {rules.some((r) => r.required) && (
            <span style={{ color: "red", marginLeft: 2 }}>*</span>
          )}
        </div>
      )}
    </>
  );

  if (!name) {
    return (
      <div style={{ marginBottom: 8 }}>
        {renderLabel()}
        {children}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      {renderLabel()}
      <Controller
        name={name}
        control={control}
        rules={mergedRules}
        render={({ field }) => {
          const child = React.Children.only(children);

          const isFileInput =
            child.type === "input" && child.props.type === "file";
          const isCustomUploadFile = child.type?.displayName === "UploadFile";

          const handleChange = (eOrValue) => {
            const isEvent = eOrValue?.target !== undefined;

            const value = isEvent
              ? eOrValue.target.type === "file"
                ? eOrValue.target.multiple
                  ? Array.from(eOrValue.target.files)
                  : eOrValue.target.files[0]
                : eOrValue.target.value
              : eOrValue;

            const syntheticEvent = isEvent
              ? eOrValue
              : {
                  target: {
                    name: field.name,
                    value,
                  },
                };

            field.onChange(syntheticEvent);

            if (triggers.includes("onChange")) {
              debouncedTrigger(field.name);
            }
          };

          const handleBlur = () => {
            field.onBlur();
            if (
              !isFileInput &&
              !isCustomUploadFile &&
              triggers.includes("onBlur")
            ) {
              trigger(field.name);
            }
          };

          return React.cloneElement(child, {
            name: field.name,
            onBlur: handleBlur,
            onChange: handleChange,
            ...(isFileInput || isCustomUploadFile
              ? {}
              : { value: field.value }),
            "data-border-red-error": !!error,
          });
        }}
      />
      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 2 }}>{error}</div>
      )}
    </div>
  );
}
