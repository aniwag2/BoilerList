// client/src/pages/EditItem.jsx
import React, { useState, useContext, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom"; // NEW: useParams and useNavigate
import PurdueLogo from "../assets/PurdueLogo.png";
import "./UploadItem.css"; // Reuse existing CSS
import { Select, FormControl, InputLabel, MenuItem, TextField, Button } from "@mui/material";
import { UserContext } from "../UserContext";
import { useDropzone } from "react-dropzone";
import { getListings as apiGetListings, updateListing as apiUpdateListing } from "../api/user"; // NEW: Import API functions

const EditItem = () => {
    const { id } = useParams(); // Get the listing ID from the URL
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null); // Will store the new image file
    const [preview, setPreview] = useState(null); // For local image preview
    const [existingImage, setExistingImage] = useState(null); // To display current image

    // Fetch existing item data when the component mounts
    useEffect(() => {
        const fetchItem = async () => {
            if (!user) {
                toast.info("Please log in to edit items.");
                navigate('/login');
                return;
            }

            const result = await apiGetListings(); // Fetch all listings to find the specific one
            if (result.success) {
                const itemToEdit = result.listings.find(item => item._id === id);

                if (itemToEdit) {
                    // Check if the logged-in user is the owner
                    if (itemToEdit.owner._id !== user._id) {
                        toast.error("You do not have permission to edit this listing.");
                        navigate('/listings'); // Redirect if not owner
                        return;
                    }

                    setName(itemToEdit.name);
                    setDescription(itemToEdit.description);
                    setPrice(itemToEdit.price);
                    setCategory(itemToEdit.category);
                    // Set existing image for display
                    if (itemToEdit.image && itemToEdit.image.data) {
                        setExistingImage(`data:${itemToEdit.image.contentType};base64,${itemToEdit.image.data}`);
                    }
                    // Do NOT set `setImage` here, as it would re-upload the same image unless changed
                } else {
                    toast.error("Listing not found.");
                    navigate('/listings'); // Redirect if listing not found
                }
            } else {
                toast.error("Failed to load listing for editing: " + result.message);
                navigate('/listings');
            }
        };

        fetchItem();
    }, [id, user, navigate]); // Rerun if ID or user changes

    // Handles drag and drop events of image
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles[0]) {
            setPreview(URL.createObjectURL(acceptedFiles[0])); // For new preview
            setImage(acceptedFiles[0]); // Store the new image file
            setExistingImage(null); // Clear existing image preview
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
                price: parseFloat(price), // Ensure price is a number
                category,
                // email: user.email, // Email should not be updated via this form if it's tied to user
            };

            // Call the update API function
            const result = await apiUpdateListing(id, updatedData, image); // Pass image if a new one was selected

            if (result.success) {
                toast.success(result.message);
                navigate('/listings'); // Go back to listings page after successful update
            } else {
                toast.error("Error updating item: " + result.message);
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Error updating item: Network error or server unreachable.");
        }
    };

    return (
        <div className="upload-container"> {/* Reusing upload-container CSS */}
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />
            <h1 className="upload-title">Edit Listing</h1>
            <form onSubmit={handleSubmit}>

                <div className="upload-image-container" {...getRootProps()}>
                    <input {...getInputProps()} />
                    {isDragActive ?
                        <p className="upload-image-text">Drop the new image here...</p> :
                        <p className="upload-image-text">Drag and drop a new image here, or click to select one</p>}
                    {preview && <img src={preview} alt="New Uploaded" className="uploaded-image" />}
                    {!preview && existingImage && <img src={existingImage} alt="Current" className="uploaded-image" />}
                    {!preview && !existingImage && !isDragActive && (
                        <p className="upload-image-text">No image selected</p>
                    )}
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
                            if (/^\d*\.?\d{0,2}$/.test(e.target.value) || e.target.value === "") { // Allow empty for clearing
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
                            <MenuItem value="Electronics">Electronics</MenuItem>
                            <MenuItem value="Books">Books</MenuItem>
                            <MenuItem value="Furniture">Furniture</MenuItem>
                            <MenuItem value="">Other (enter below)</MenuItem> {/* Option for custom category input */}
                        </Select>
                        {category && !["Electronics", "Books", "Furniture"].includes(category) && (
                            <TextField
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                fullWidth
                                placeholder="Enter custom category"
                                margin="normal"
                                sx={{
                                    mt: 1,
                                    '& .MuiInputBase-input': {
                                        color: 'var(--purdue-gold)',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: 'var(--purdue-gold)' },
                                        '&:hover fieldset': { borderColor: 'var(--purdue-gold)' },
                                        '&.Mui-focused fieldset': { borderColor: 'var(--purdue-gold)' },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'var(--purdue-gold)',
                                    },
                                }}
                            />
                        )}
                    </FormControl>
                </div>
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
        </div>
    );
};

export default EditItem;