import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PurdueLogo from "../assets/PurdueLogo.png";
import "./Register.css";
import { UserContext } from "../UserContext";

const UploadItem = () => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);
    const { user } = useContext(UserContext);

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

            const uploadRes = await fetch("http://localhost:8080/api/upload/uploadItem", {
                method: "POST",
                body: formData,
            });
            

            if (uploadRes.error) {
                toast.error("Error uploading item");
                return;
            }

            toast.success("Item uploaded successfully!");
        } catch (err) {
            toast.error("Error uploading item");
        }
    }

    return (
        <div className="register-container">
            <img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />
            <h1>Upload Item</h1>
            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    
                        <input
                            type="file"
                            placeholder="Item Image"
                            onChange={(e) => setImage(e.target.files[0])}
                            required
                        />
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
        </div>
    );
};

export default UploadItem;