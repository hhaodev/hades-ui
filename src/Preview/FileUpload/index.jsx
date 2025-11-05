import React, { useState } from "react";
import { Uploader } from "../../components";

const FileUploadDemo = () => {
  const [file, setFile] = useState([]);

  return <Uploader value={file} multiple onChange={setFile} />;
};

export default FileUploadDemo;
