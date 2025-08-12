import React, { useState } from "react";
import { UploadFile } from "../../components";

const FileUploadDemo = () => {
  const [file, setFile] = useState([]);

  return <UploadFile value={file} multiple onChange={setFile} />;
};

export default FileUploadDemo;
