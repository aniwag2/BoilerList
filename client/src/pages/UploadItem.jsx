import React, { useState, useContext, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import PurdueLogo from "../assets/PurdueLogo.png";
import "./UploadItem.css";
import { Select, FormControl, InputLabel, MenuItem, TextField, 
    FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { UserContext } from "../UserContext";
import { useDropzone } from "react-dropzone";
import { CATEGORY_OPTIONS } from "../constants/categories";

const UploadItem = () => {

    // Handles drag and drop events of image
    const onDrop = (acceptedFiles) => {

        if (acceptedFiles && acceptedFiles[0]) {
            setPreview(URL.createObjectURL(acceptedFiles[0]));
            setImage(acceptedFiles[0]);
        }
        else {
            toast.error("Please select an image");
        }

    }

    const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
        },
        onDrop,
        multiple: false,
    });

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);
    const { user } = useContext(UserContext); // Get the user object from context
    const [preview, setPreview] = useState(null);
    const [isBestOffer, setIsBestOffer] = useState(false);
    const [isUrgent, setIsUrgent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- NEW CHECK: Ensure user is logged in before attempting upload ---
        if (!user || !user.token) {
            toast.error("You must be logged in to upload an item.");
            // Optionally, redirect to login page
            // navigate('/login');
            return;
        }

        try {

            const email = user.email; // Use email from the user context
            // const ownerId = user._id; // This is the owner ID from the user context

            // Use formData to send the image and other data to the server
            const formData = new FormData();
            formData.append("image", image);
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("email", email);
            formData.append("isBestOffer", isBestOffer);
            formData.append("isUrgent", isUrgent);
            // formData.append("owner", ownerId); // You could also append the owner ID directly if your backend expects it this way

            const uploadRes = await fetch("http://localhost:8080/api/upload/uploadItem", {
                method: "POST",
                // --- IMPORTANT CHANGE: Add the Authorization header ---
                headers: {
                    "x-auth-token": user.token, // Send the JWT token
                    // For FormData, do NOT set 'Content-Type': 'multipart/form-data'.
                    // The browser sets it automatically with the correct boundary.
                },
                body: formData,
            });

            if (!uploadRes.ok) {
                // Parse the error message from the backend if available
                const errorData = await uploadRes.json();
                toast.error("Error uploading item: " + (errorData.message || uploadRes.statusText));
                return;
            }

            toast.success("Item uploaded successfully!");
            // Optionally clear the form or redirect
            setName("");
            setDescription("");
            setPrice(0);
            setCategory("");
            setImage(null);
            setPreview(null);
        } catch (err) {
            console.error("Upload error:", err); // Log the detailed error
            toast.error("Error uploading item: Network error or server unreachable.");
        }
    }

    const handleCheckboxChange = (e) => {
        setIsBestOffer(e.target.checked);
        setIsUrgent(e.target.checked);
    }

    return (
        <div className="upload-container">
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />
            <h1 className="upload-title">Upload Item</h1>
            <form onSubmit={handleSubmit}>

                        {/* Handles drag and drop events */}
                        <div className="upload-image-container" {...getRootProps()}>
                            {/* Handles file selection */}
                            <input {...getInputProps()} onChange={(e) => {
                                setImage(e.target.files[0]);
                                setPreview(URL.createObjectURL(e.target.files[0]));
                            }} />
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
                                }
                                }
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
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
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
                                            return <span style={
                                                {
                                                    color: "var(--purdue-gold)",
                                                    opacity: 0.7,
                                                    fontWeight: 'bold',
                                                    letterSpacing: '1px',

                                                }
                                            }>SELECT CATEGORY</span>;
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
                                    <MenuItem value={category}>
                                        <TextField
                                            onChange={(e) => setCategory(e.target.value)}
                                            fullWidth
                                            placeholder="Enter Category"
                                            margin="normal"
                                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                                        />
                                    </MenuItem>
                                </Select>
                            </FormControl>                                       
                        </div>
                        <FormGroup>
                            <FormControlLabel control={<Checkbox checked={isBestOffer} 
                                                        onChange={e => setIsBestOffer(e.target.checked)} 
                                                        color="primary" sx={{ color: 'var(--purdue-gold)' }} />} 
                                                        label="Best Offer" sx={{ color: 'var(--purdue-gold)' }} />
                            <FormControlLabel control={<Checkbox checked={isUrgent} 
                                                        onChange={e => setIsUrgent(e.target.checked)} 
                                                        color="primary" sx={{ color: 'var(--purdue-gold)' }}/>} 
                                                        label="Urgent" sx={{ color: 'var(--purdue-gold)' }} />
                        </FormGroup>
                <button type="submit">Upload</button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default UploadItem;