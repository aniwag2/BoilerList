// client/src/pages/UploadItem.jsx
import React, { useState, useContext, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import PurdueLogo from "../assets/PurdueLogo.png";
import "./UploadItem.css"; // Reuse existing CSS
import { Select, FormControl, InputLabel, MenuItem, TextField,
         Button, Modal, Box, Typography, // Added Modal, Box, Typography
         FormGroup, FormControlLabel, Checkbox // Re-added for checkboxes
} from "@mui/material";
import { UserContext } from "../UserContext";
import { useDropzone } from "react-dropzone";
import Cropper from 'react-easy-crop';
import getCroppedImg from '../functions/cropImage'; // Helper function for cropping
import { CATEGORY_OPTIONS } from "../constants/categories"; // Keep CATEGORY_OPTIONS

const UploadItem = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null); // The final cropped and compressed image file
    const { user } = useContext(UserContext);
    const [preview, setPreview] = useState(null); // URL for the final image preview

    // Re-added states for the checkboxes
    const [isBestOffer, setIsBestOffer] = useState(false);
    const [isUrgent, setIsUrgent] = useState(false);

    // States for cropping
    const [imageSrc, setImageSrc] = useState(null); // Stores the image URL for the cropper
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [cropModalOpen, setCropModalOpen] = useState(false); // To control the cropping modal

    // Handles drag and drop events of image
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles[0]) {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result); // Set image source for cropper
                setCropModalOpen(true); // Open crop modal
            });
            reader.readAsDataURL(file);
        } else {
            toast.error("Please select an image");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        onDrop,
        multiple: false,
    });

    // Cropper handlers
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            // Convert blob to File object (for FormData)
            const croppedFile = new File([croppedImageBlob], "cropped_image.jpeg", {
                type: "image/jpeg", // Assuming JPEG for output
                lastModified: Date.now(),
            });

            setImage(croppedFile); // Set the final cropped image file
            setPreview(URL.createObjectURL(croppedFile)); // Set preview URL
            setCropModalOpen(false); // Close crop modal
            setImageSrc(null); // Clear image source for cropper
            toast.success("Image cropped and compressed!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to crop image.");
        }
    }, [imageSrc, croppedAreaPixels]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user || !user.token) {
            toast.error("You must be logged in to upload an item.");
            return;
        }
        if (!image) { // Ensure an image is selected/cropped
            toast.error("Please upload and crop an image for your listing.");
            return;
        }

        try {
            const email = user.email;

            const formData = new FormData();
            formData.append("image", image); // The cropped and compressed image
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("email", email);
            formData.append("isBestOffer", isBestOffer); // Include checkbox state
            formData.append("isUrgent", isUrgent);       // Include checkbox state

            const uploadRes = await fetch("http://localhost:8080/api/upload/uploadItem", {
                method: "POST",
                headers: {
                    "x-auth-token": user.token,
                },
                body: formData,
            });

            if (!uploadRes.ok) {
                const errorData = await uploadRes.json();
                toast.error("Error uploading item: " + (errorData.message || uploadRes.statusText));
                return;
            }

            toast.success("Item uploaded successfully!");
            setName("");
            setDescription("");
            setPrice(0);
            setCategory("");
            setImage(null);
            setPreview(null);
            setIsBestOffer(false); // Reset checkbox state
            setIsUrgent(false);     // Reset checkbox state
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Error uploading item: Network error or server unreachable.");
        }
    }

    return (
        <div className="upload-container">
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />
            <h1 className="upload-title">Upload Item</h1>
            <form onSubmit={handleSubmit}>

                <div className="upload-image-container" {...getRootProps()}>
                    <input {...getInputProps()} />
                    {isDragActive ?
                        <p className="upload-image-text">Drop the image here...</p> :
                        <p className="upload-image-text">Drag and drop an image here, or click to select one</p>}
                    {preview && <img src={preview} alt="Uploaded" className="uploaded-image" />}
                </div>

                <div className="form-group">
                    <h3 className="form-group-title">Item Name</h3>
                    <input
                        type="text"
                        placeholder="Enter Item Name"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        required
                    />
                </div>
                <div className="form-group">
                    <h3 className="form-group-title">Description</h3>
                    <input
                        type="text"
                        placeholder="Describe your item's conditions, features, etc."
                        onChange={(e) => setDescription(e.target.value)}
                        value={description}
                        required
                    />
                </div>
                <div className="form-group">
                    <h3 className="form-group-title">Price ($)</h3>
                    <input
                        type="text"
                        placeholder="0.00"
                        onChange={(e) => {
                            if (/^\d*\.?\d{0,2}$/.test(e.target.value)) {
                                setPrice(e.target.value);
                            }
                        }}
                        value={price}
                        required
                    />
                </div>
                <div className="form-group">
                    <h3 className="form-group-title">Item Category</h3>
                    <FormControl fullWidth >
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="category-dropdown"
                            displayEmpty
                            sx={{
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                width: '100%',
                                height: '60px',
                                padding: '18px 20px',
                                backgroundColor: 'var(--purdue-black)',
                                color: 'var(--purdue-gold)',
                                border: '2px solid var(--purdue-gold)',
                                borderRadius: '10px',
                                fontSize: '1.2em',
                                letterSpacing: '1px',
                            }}
                            renderValue={(selected) => {
                                if (!selected) {
                                    return <span style={{ color: "var(--purdue-gold)", opacity: 0.7, fontWeight: 'bold', letterSpacing: '1px' }}>SELECT CATEGORY</span>;
                                }
                                return selected;
                            }}
                            required
                        >
                            {CATEGORY_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
                {/* Checkboxes for isBestOffer and isUrgent */}
                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={isBestOffer}
                                                    onChange={e => setIsBestOffer(e.target.checked)}
                                                    color="primary" sx={{ color: "var(--purdue-gold)", '&.Mui-checked': { color: "var(--purdue-gold)" } }} />}
                                                    label="Best Offer" sx={{ color: 'var(--purdue-gold)' }} />
                    <FormControlLabel control={<Checkbox checked={isUrgent}
                                                    onChange={e => setIsUrgent(e.target.checked)}
                                                    color="primary" sx={{ color: "var(--purdue-gold)", '&.Mui-checked': { color: "var(--purdue-gold)" } }}/>}
                                                    label="Urgent" sx={{ color: 'var(--purdue-gold)' }} />
                </FormGroup>

                <Button type="submit" variant="contained" sx={{
                    mt: 3,
                    backgroundColor: "#FFD700",
                    color: "#000",
                    fontWeight: "bold",
                    borderRadius: "6px",
                    "&:hover": { backgroundColor: "#e6c200" }
                }}>
                    Upload
                </Button>
            </form>
            <ToastContainer />

            {/* Cropping Modal */}
            <Modal
                open={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Box sx={{
                    width: '90%', maxWidth: 700, bgcolor: 'background.paper', border: '2px solid #FFD700',
                    boxShadow: 24, p: 4, position: 'relative', height: '80vh', display: 'flex', flexDirection: 'column'
                }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 2, color: '#FFD700' }}>
                        Crop Image
                    </Typography>
                    <Box sx={{ flexGrow: 1, position: 'relative' }}>
                        {imageSrc && (
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9} // Desired aspect ratio (e.g., 16:9 for wider images, 4:3 for common photos)
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="rect" // Can be 'rect' or 'round'
                                showGrid={true}
                                style={{
                                    containerStyle: {
                                        borderRadius: '8px',
                                        background: '#333',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                    }
                                }}
                            />
                        )}
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: 'white' }}>Zoom:</Typography>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            style={{ width: '60%', accentColor: '#FFD700' }}
                        />
                        <Button
                            onClick={showCroppedImage}
                            variant="contained"
                            sx={{
                                ml: 2, backgroundColor: "#FFD700", color: "#000", fontWeight: "bold",
                                "&:hover": { backgroundColor: "#e6c200" }
                            }}
                        >
                            Done
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default UploadItem;