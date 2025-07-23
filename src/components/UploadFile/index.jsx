import { forwardRef } from "react";

const UploadFile = forwardRef(
  ({ error, multiple = false, onChange, name, ...rest }, ref) => {
    const handleChange = (e) => {
      const files = e.target.files;
      if (multiple) {
        onChange?.(files);
      } else {
        onChange?.(files?.[0] ?? null);
      }
    };

    return (
      <input
        type="file"
        name={name}
        ref={ref}
        multiple={multiple}
        data-border-red-error={!!error}
        onChange={handleChange}
        {...rest}
      />
    );
  }
);

UploadFile.displayName = "UploadFile";
export default UploadFile;
