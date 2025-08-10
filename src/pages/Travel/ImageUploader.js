import React from "react";
import { Input, Label } from "reactstrap";

const ImageUploader = ({ formik }) => {
  const { values, errors, touched, setFieldValue } = formik;

  const getFieldClass = (field) => {
    return touched[field] && errors[field] ? "is-invalid" : "";
  };

  return (
    <div className="mb-3">
      <Label>Images *</Label>
      <Input
        type="file"
        name="images"
        onChange={(e) => {
  const files = Array.from(e.target.files);
  setFieldValue("images", files);
}}

        multiple
      />
      {touched.images && errors.images && (
        <div className="text-danger">{errors.images}</div>
      )}
    </div>
  );
};

export default ImageUploader;
