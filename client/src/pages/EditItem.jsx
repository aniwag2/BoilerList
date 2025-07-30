// client/src/pages/EditItem.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import PurdueLogo from "../assets/PurdueLogo.png";
import "./UploadItem.css"; // Reuse existing CSS
import { Select, FormControl, InputLabel, MenuItem, TextField, Button, FormGroup, FormControlLabel, Checkbox, Modal, Box, Typography } from "@mui/material"; // Added Modal, Box, Typography
import { UserContext } from "../UserContext";
import { useDropzone } from "react-dropzone";
import { getListings as apiGetListings, updateListing as apiUpdateListing } from "../api/user";
import { CATEGORY_OPTIONS } from "../constants/categories";
import Cropper from 'react-easy-crop'; // NEW: Import Cropper
import getCroppedImg from '../functions/cropImage'; // NEW: Import cropImage helper

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null); // The new cropped and compressed image file
    const [preview, setPreview] = useState(null); // URL for the final new image preview
    const [existingImage, setExistingImage] = useState(null); // To display current image from DB
    const [isBestOffer, setIsBestOffer] = useState(false);
    const [isUrgent, setIsUrgent] = useState(false);

    // NEW: States for cropping
    const [imageSrc, setImageSrc] = useState(null); // Stores the image URL for the cropper (from file reader)
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [cropModalOpen, setCropModalOpen] = useState(false); // To control the cropping modal

    // Fetch existing item data when the component mounts
    useEffect(() => {
        const fetchItem = async () => {
            if (!user) {
                toast.info("Please log in to edit items.");
                navigate('/login');
                return;
            }

            const result = await apiGetListings();
            if (result.success) {
                const itemToEdit = result.listings.find(item => item._id === id);

                if (itemToEdit) {
                    if (itemToEdit.owner._id !== user._id) {
                        toast.error("You do not have permission to edit this listing.");
                        navigate('/listings');
                        return;
                    }

                    setName(itemToEdit.name);
                    setDescription(itemToEdit.description);
                    setPrice(itemToEdit.price);
                    setCategory(itemToEdit.category);
                    setIsBestOffer(itemToEdit.isBestOffer); // Set checkbox state
                    setIsUrgent(itemToEdit.isUrgent);       // Set checkbox state

                    if (itemToEdit.image && itemToEdit.image.data) {
                        setExistingImage(`data:${itemToEdit.image.contentType};base64,${itemToEdit.image.data}`);
                    }
                } else {
                    toast.error("Listing not found.");
                    navigate('/listings');
                }
            } else {
                toast.error("Failed to load listing for editing: " + result.message);
                navigate('/listings');
            }
        };

        fetchItem();
    }, [id, user, navigate]);

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
            toast.error("Please select an image.");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        onDrop,
        multiple: false,
    });

    // NEW: Cropper handlers (identical to UploadItem.jsx)
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);

            const croppedFile = new File([croppedImageBlob], "cropped_image.jpeg", {
                type: "image/jpeg",
                lastModified: Date.now(),
            });

            setImage(croppedFile); // Set the new cropped image file
            setPreview(URL.createObjectURL(croppedFile)); // Set preview URL
            setExistingImage(null); // Clear existing image to show new preview
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
            toast.error("You must be logged in to update an item.");
            return;
        }

        try {
            const updatedData = {
                name,
                description,
                price: parseFloat(price),
                category,
                isBestOffer, // Include checkbox state
                isUrgent,    // Include checkbox state
            };

            // Pass 'image' (which is the new cropped file) to the update API.
            // If user didn't select a new image, 'image' will be null, and the API won't update the image.
            const result = await apiUpdateListing(id, updatedData, image);

            if (result.success) {
                toast.success(result.message);
                navigate('/listings');
            } else {
                toast.error("Error updating item: " + result.message);
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Error updating item: Network error or server unreachable.");
        }
    };

    return (
        <div className="upload-container">
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />
            <h1 className="upload-title">Edit Listing</h1>
            <form onSubmit={handleSubmit}>

                <div className="upload-image-container" {...getRootProps()}>
                    <input {...getInputProps()} />
                    {isDragActive ?
                        <p className="upload-image-text">Drop the new image here...</p> :
                        <p className="upload-image-text">Drag and drop a new image here, or click to select one (optional)</p>}
                    {preview && <img src={preview} alt="New Uploaded" className="uploaded-image" />}
                    {!preview && existingImage && <img src={existingImage} alt="Current" className="uploaded-image" />}
                    {!preview && !existingImage && !isDragActive && (
                        <p className="upload-image-text">No image selected</p>
                    )}
                </div>

                {/* Rest of your form fields */}
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
                            if (/^\d*\.?\d{0,2}$/.test(e.target.value) || e.target.value === "") {
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
                {/* Checkboxes */}
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
                    Update Listing
                </Button>
            </form>
            <ToastContainer />

            {/* NEW: Cropping Modal (identical to UploadItem.jsx) */}
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
                                aspect={16 / 9} // Consistent aspect ratio
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="rect"
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

export default EditItem;