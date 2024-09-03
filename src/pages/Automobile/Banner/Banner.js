import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, FormGroup, Label, Input } from "reactstrap";
import { addNewCarBanner } from "store/automobiles/carBanners/action";

function Banner() {
    document.title = "Banner | Scrollit";
    const dispatch = useDispatch();

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [bannerName, setBannerName] = useState("");
    const [description, setDescription] = useState("");

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
        if (selectedImage && bannerName && description) {
            const formData = new FormData();
            formData.append("bannerImage", selectedImage);
            formData.append("bannerName", bannerName);
            formData.append("description", description);

            // Dispatch the action to add a new car banner
            dispatch(addNewCarBanner(formData));
        } else {
            alert("Please fill in all fields and select an image.");
        }
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <h2>Upload Banner Image</h2>
                <Form>
                    <FormGroup>
                        <Label for="bannerName">Banner Name</Label>
                        <Input
                            type="text"
                            name="bannerName"
                            id="bannerName"
                            value={bannerName}
                            onChange={(e) => setBannerName(e.target.value)}
                            placeholder="Enter banner name"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="description">Description</Label>
                        <Input
                            type="textarea"
                            name="description"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter description"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <Label for="bannerImage">Select Image</Label>
                        <Input
                            type="file"
                            name="bannerImage"
                            id="bannerImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            required
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
