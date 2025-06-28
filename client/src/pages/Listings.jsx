import React from "react";
import { useNavigate } from "react-router-dom";

const Listings = () => {
	const navigate = useNavigate();
	
	return (
		<div style={{ padding: "20px" }}>
			<h1>Welcome to Listings Page</h1>
			<p>This is where listings will be displayed.</p>
		</div>
	);
};

export default Listings;
