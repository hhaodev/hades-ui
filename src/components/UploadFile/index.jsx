import { forwardRef, useEffect, useRef, useState } from "react";
import Button from "../Button";
import Ellipsis from "../Ellipsis";
import {
  AudioIcon,
  ExcelIcon,
  FileUpload,
  GenericFileIcon,
  ImageIcon,
  PdfIcon,
  TrashIcon,
  VideoIcon,
  WordIcon,
} from "../Icon";

const UploadFile = forwardRef(
  (
    { value, error, multiple, onChange, name, accept = [], maxSize, ...rest },
    ref
  ) => {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState([]);
    const [internalError, setInternalError] = useState([]);
    const inputRef = useRef();
    const dragCounter = useRef(0);
    const timeoutError = useRef();

    const isValidFile = (file) => {
      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      const fileSize = file.size;

      const matchAccept =
        accept.length === 0 ||
        accept.some((type) => {
          if (type.startsWith(".")) {
            return fileName.endsWith(type.toLowerCase());
          }
          if (type.includes("/")) {
            return (
              fileType === type || fileType.startsWith(type.replace("/*", ""))
            );
          }
          return false;
        });

      if (!matchAccept) {
        return { valid: false, message: "File type not allowed!" };
      }

      if (maxSize && fileSize > maxSize) {
        return {
          valid: false,
          message: "File size exceeds the maximum allowed!",
        };
      }

      return { valid: true, message: "" };
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);

      const validFiles = [];
      const errors = [];

      for (const file of droppedFiles) {
        const { valid, message } = isValidFile(file);
        if (valid) {
          validFiles.push(file);
        } else {
          errors.push({ file, message });
        }
      }

      if (validFiles.length > 0) {
        if (multiple) {
          const newFiles = [...file, ...validFiles];
          setFile(newFiles);
          onChange?.(newFiles);
        } else {
          setFile([validFiles[0]]);
          onChange?.(validFiles[0] ?? null);
        }
      }

      if (errors.length > 0) {
        const msg = errors.map((e) => `${e.file.name}: ${e.message}`);
        setInternalError?.([...internalError, ...msg]);
      }

      e.target.value = "";
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleChange = (e) => {
      const selectedFiles = Array.from(e.target.files);

      const validFiles = [];
      const errors = [];

      for (const file of selectedFiles) {
        const { valid, message } = isValidFile(file);
        if (valid) {
          validFiles.push(file);
        } else {
          errors.push({ file, message });
        }
      }

      if (validFiles.length > 0) {
        if (multiple) {
          const newFiles = [...file, ...validFiles];
          setFile(newFiles);
          onChange?.(newFiles);
        } else {
          setFile([validFiles[0]]);
          onChange?.(validFiles[0] ?? null);
        }
      }

      if (errors.length > 0) {
        const msg = errors.map((e) => `${e.file.name}: ${e.message}`);
        setInternalError?.([...internalError, ...msg]);
      }
      e.target.value = "";
    };

    const handleRemove = (indexToRemove) => {
      const newFiles = [...file];
      newFiles.splice(indexToRemove, 1);
      setFile(newFiles);

      if (multiple) {
        onChange?.(newFiles);
      } else {
        onChange?.(null);
      }
    };

    const handleClick = () => {
      inputRef.current?.click();
    };

    useEffect(() => {
      if (value != null && value !== "") {
        const fileArray = Array.isArray(value) ? value : [value];
        setFile(fileArray);
      }
    }, [value]);

    useEffect(() => {
      if (internalError.length > 0) {
        clearInterval(timeoutError.current);
        timeoutError.current = setTimeout(() => {
          setInternalError([]);
        }, 5000);

        return () => clearTimeout(timeoutError.current);
      }
    }, [internalError]);

    return (
      <div>
        <div
          data-border-red-error={rest["data-border-red-error"]}
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "#007BFF" : "#444"}`,
            backgroundColor: isDragging
              ? "var(--hadesui-bg2-color)"
              : "var(--hadesui-bg-color)",
            padding: "24px",
            borderRadius: "12px",
            textAlign: "center",
            cursor: "pointer",
            color: "#ccc",
            transition: "all 0.2s ease-in-out",
          }}
        >
          <FileUpload size={40} />

          <div
            style={{
              fontWeight: 500,
              color: "var(--hadesui-text-color)",
              marginBottom: "6px",
            }}
          >
            Click or drag file to this area to upload
          </div>
          <div
            style={{
              color: "var(--hadesui-text2-color)",
              fontSize: "14px",
              margin: 0,
            }}
          >
            {`Support for a single ${multiple ? "or bulk" : ""} upload. ${
              accept.length > 0 ? `(${accept.join(", ")})` : ""
            } ${maxSize ? `(maximum ${formatSize(maxSize)} per file)` : ""}`}
          </div>

          <input
            type="file"
            accept={accept.join(",")}
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) ref.current = el;
            }}
            name={name}
            multiple={multiple}
            onChange={handleChange}
            {...rest}
            style={{ display: "none" }}
          />
        </div>
        {internalError?.length > 0 && (
          <div>
            {internalError.map((i, index) => (
              <div
                key={index}
                style={{ color: "red", fontSize: 12, marginTop: 2 }}
              >
                {i}
              </div>
            ))}
          </div>
        )}
        {file?.length > 0 && (
          <div>
            {file?.map((item, index) => (
              <FileCard
                key={index}
                file={item}
                onRemove={() => handleRemove(index)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

UploadFile.displayName = "UploadFile";
export default UploadFile;

const formatSize = (size) => {
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const getFileIcon = (file) => {
  const type = file?.type || "";
  const name = file?.name?.toLowerCase?.() || "";

  if (type.startsWith("image/")) return <ImageIcon size={24} />;
  if (type === "application/pdf" || name.endsWith(".pdf"))
    return <PdfIcon size={24} />;

  if (
    type === "application/msword" ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    name.endsWith(".doc") ||
    name.endsWith(".docx")
  ) {
    return <WordIcon size={24} />;
  }

  if (
    type === "application/vnd.ms-excel" ||
    type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx")
  ) {
    return <ExcelIcon size={24} />;
  }

  if (type.startsWith("audio/")) return <AudioIcon size={24} />;
  if (type.startsWith("video/")) return <VideoIcon size={24} />;

  return <GenericFileIcon size={24} />;
};

const FileCard = ({ file, onRemove }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 12px",
        backgroundColor: "var(--hadesui-bg-card-file-color, #1e1e1e)",
        borderRadius: "8px",
        marginBottom: "8px",
        marginTop: "8px",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontSize: "24px",
        }}
      >
        {getFileIcon(file)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "14px",
              width: "100%",
              color: "var(--hadesui-text-color)",
            }}
          >
            <Ellipsis row={2}>{file?.name}</Ellipsis>
            <div
              style={{ fontSize: "12px", color: "var(--hadesui-text2-color)" }}
            >
              {formatSize(file?.size)}
            </div>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            theme="icon"
          >
            <TrashIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};
