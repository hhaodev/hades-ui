import React, { useRef } from "react";
import { Controller } from "react-hook-form";
import { useFormInstance } from ".";
import { debounce, isEmpty } from "../../utils";

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

function getFirstRuleError(value, rules = []) {
  for (const rule of rules) {
    if (rule.required && isEmpty(value)) {
      return rule.message || "This field is required";
    }

    if (
      rule.minLength &&
      typeof value === "string" &&
      value.length < rule.minLength
    ) {
      return rule.message || `Min length is ${rule.minLength}`;
    }

    if (
      rule.maxLength &&
      typeof value === "string" &&
      value.length > rule.maxLength
    ) {
      return rule.message || `Max length is ${rule.maxLength}`;
    }

    if (
      rule.pattern &&
      typeof value === "string" &&
      !rule.pattern.test(value)
    ) {
      return rule.message || "Invalid format";
    }

    if (rule.validate) {
      if (typeof rule.validate === "function") {
        const result = rule.validate(value);
        if (result !== true) return result || "Invalid value";
      } else if (typeof rule.validate === "object") {
        for (const key in rule.validate) {
          const validator = rule.validate[key];
          if (typeof validator === "function") {
            const result = validator(value);
            if (result !== true) return result || "Invalid value";
          } else {
            return validator;
          }
        }
      }
    }
  }

  return null;
}

export function FormItem({
  name,
  label,
  rules = [],
  children,
  validateTrigger = ["onBlur"],
  debounceValidate = 0,
}) {
  const { control, trigger, formState, setError, clearErrors } =
    useFormInstance();

  const error = formState.errors[name]?.message;
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

          const handleChange = (eOrValue) => {
            const isEvent = !!eOrValue?.target;
            const isInputFile = isEvent && eOrValue.target.files;

            const value = isInputFile
              ? Array.from(eOrValue.target.files)
              : eOrValue;

            const syntheticEvent =
              isEvent && !isInputFile
                ? eOrValue
                : {
                    target: {
                      name: field.name,
                      value,
                    },
                  };

            field.onChange(syntheticEvent);

            const message = getFirstRuleError(
              syntheticEvent.target.value,
              rules
            );

            if (!isEvent) {
              if (message) {
                setError(field.name, {
                  type: "manual",
                  message: message,
                });
              } else {
                clearErrors(field.name);
              }
            }

            if (triggers.includes("onChange")) {
              debouncedTrigger(field.name);
            }
          };

          const handleBlur = () => {
            field.onBlur();
            if (!isFileInput && triggers.includes("onBlur")) {
              trigger(field.name);
            }
          };

          return React.cloneElement(child, {
            name: field.name,
            onBlur: handleBlur,
            onChange: handleChange,
            ...(isFileInput ? {} : { value: field.value }),
            "data-border-red-error": !!error,
            error,
          });
        }}
      />
      {error && (
        <div style={{ color: "red", fontSize: 12, marginTop: 2 }}>{error}</div>
      )}
    </div>
  );
}
