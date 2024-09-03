import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";

function Banner() {
    document.title = "Banner | Scrollit";
    const dispatch = useDispatch();

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);

            // Generate a preview URL for the selected image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle save button click (upload image)
    const handleSave = () => {
        if (selectedImage) {
            // You can add your image upload logic here
            // For example, using FormData to send the image to your server

            const formData = new FormData();
            formData.append("bannerImage", selectedImage);

            dispatch(setBannerImage(formData));

            // Example POST request using fetch
            fetch("/api/upload-banner", {
                method: "POST",
                body: formData,
            })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Success:", data);
                    alert("Image uploaded successfully!");
                })
                .catch((error) => {
                    console.error("Error:", error);
                    alert("Image upload failed.");
                });
        } else {
            alert("Please select an image first.");
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <h2>Upload Banner Image</h2>
                <Form>
                    <FormGroup>
                        <Label for="bannerImage">Select Image</Label>
                        <Input
                            type="file"
                            name="bannerImage"
                            id="bannerImage"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </FormGroup>
                    <Button color="primary" onClick={handleSave} style={{ marginTop: '20px', display: 'flex', justifyContent: 'end' }}>
                        Save
                    </Button>

                    {imagePreviewUrl && (
                        <div className="image-preview">
                            <img src={imagePreviewUrl} alt="Selected Banner" style={{ width: '100%', height: 'auto', marginTop: '20px' }} />
                        </div>
                    )}
                </Form>
            </div>
        </React.Fragment>
    );
}

export default Banner;
