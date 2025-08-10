import React from "react";
import { Input, Label, Button } from "reactstrap";

const EditImageUploader = ({ images, errors, touched, setFieldValue }) => {
  const isInvalid = touched?.images && errors?.images;

  // Separate existing images (with URL) and new images (File)
  const existingImages = images?.filter((img) => !(img instanceof File)) || [];
  const newImages = images?.filter((img) => img instanceof File) || [];

  // 🧹 Delete specific existing image
  const handleDeleteExistingImage = (indexToRemove) => {
    const updatedImages = images.filter((img, idx) => idx !== indexToRemove);
    setFieldValue("images", updatedImages);
  };

  // 🧹 Delete specific new image
  const handleDeleteNewImage = (indexToRemove) => {
    const updatedImages = images.filter((img, idx) => idx !== indexToRemove);
    setFieldValue("images", updatedImages);
  };

  return (
    <div className="mb-3">
      <Label>Images *</Label>

      {existingImages.length > 0 &&
        existingImages.map((img, index) => (
          <div key={index} className="mb-2">
            <img
              src={img.url}
              alt={img.altText || "Existing Image"}
              style={{ width: "150px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <div className="mt-1">
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDeleteExistingImage(index)}
              >
                Delete Image
              </Button>
            </div>
          </div>
        ))}

      {newImages.length > 0 &&
        newImages.map((file, index) => (
          <div key={index} className="mb-2">
            <img
              src={URL.createObjectURL(file)}
              alt={`preview-${index}`}
              style={{ width: "150px", borderRadius: "8px", border: "1px solid #ccc" }}
            />
            <div className="mt-1">
              <Button
                color="danger"
                size="sm"
                onClick={() => handleDeleteNewImage(index)}
              >
                Delete Image
              </Button>
            </div>
          </div>
        ))}

      {/* 📤 File input */}
      <Input
        type="file"
        name="images"
        accept="image/*"
        multiple
        className={isInvalid ? "is-invalid" : ""}
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files);
          setFieldValue("images", [...images, ...selectedFiles]);
        }}
      />

      {isInvalid && <div className="text-danger">{errors.images}</div>}
    </div>
  );
};

export default EditImageUploader;
