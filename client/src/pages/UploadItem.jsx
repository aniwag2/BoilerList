import React, { useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import PurdueLogo from "../assets/PurdueLogo.png";
import "./UploadItem.css";
import { UserContext } from "../UserContext";
import { useDropzone } from "react-dropzone";

const UploadItem = () => {

    // Handles drag and drop events of image
    const onDrop = (acceptedFiles) => {

        if (acceptedFiles && acceptedFiles[0]) {
            setPreview(URL.createObjectURL(acceptedFiles[0]));
            setImage(acceptedFiles[0]);
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
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);
    const { user } = useContext(UserContext);
    const [preview, setPreview] = useState(null);


    const handleSubmit = async (e) => {
        //prevents reload of page
        e.preventDefault();
        try {
            console.log(user);
            
            const email = user.email;

            // Use formData to send the image to the server
            const formData = new FormData();
            formData.append("image", image);
            formData.append("name", name);
            formData.append("description", description);
            formData.append("price", price);
            formData.append("category", category);
            formData.append("email", email);

            console.log(name, description, price, category, email, image);

            const uploadRes = await fetch("http://localhost:8080/api/upload/uploadItem", {
                method: "POST",
                body: formData,
            });
            

            if (!uploadRes.ok) {
                toast.error("Error uploading item" + uploadRes.statusText);
                return;
            }

            toast.success("Item uploaded successfully!");
        } catch (err) {
            toast.error("Error uploading item");
        }
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
                        <input
                            type="text"
                            placeholder="Item Name"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Item Description"
                            onChange={(e) => setDescription(e.target.value)}
                            value={description}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Item Price"
                            onChange={(e) => setPrice(e.target.value)}
                            value={price}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Item Category"
                            onChange={(e) => setCategory(e.target.value)}
                            value={category}
                            required
                        />
                    </div>
                <button type="submit">Upload</button>
            </form>
            <ToastContainer />
        </div>
    );
};

export default UploadItem;