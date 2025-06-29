import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Listings.css";

const Listings = () => {
	const navigate = useNavigate();
	const [selected, setSelected] = useState(null);
	const [listings, setListings] = useState([]);

	useEffect(() => {
		fetch('http://localhost:8080/api/listings/getListings')
			.then(response => response.json())
			.then(data => setListings(data))
			.catch(error => console.error('Error fetching listings:', error));
		
	}, []);

	console.log(listings);

	return (
		<div className="listings-root">
			<div className="listings-grid">
				{listings.map((item) => (
					<div className="listing-card" key={item._id}>
						<div className="photo-box">
							{item.image && item.image.data ? (
								<img
									src={`data:${item.image.contentType};base64,${item.image.data}`}
									alt={item.name}
								/>
							) : (
								"No Photo"
							)}
						</div>
						<div>
							<div style={{ fontWeight: "bold", fontSize: 18 }}>{item.name}</div>
							<div className="price-badge">${item.price}</div>
							<div className="listing-description">{item.description}</div>
						</div>
						{/* Shows the modal of only the selected item */}
						<button className="listing-btn" onClick={() => setSelected(item)}>
							View Details
						</button>
					</div>
				))}
			</div>

			{/* Popup Modal */}
			{selected && (
				// Sets the dark background when modal is open
				<div className="modal-overlay" onClick={() => setSelected(null)}>
					{/*Prevents the modal from closing when clicking on the modal content and prevents click from going to parent */}
					<div className="modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="modal-photo-box">
							{selected.image && selected.image.data ? (
								<img
									src={`data:${selected.image.contentType};base64,${selected.image.data}`}
									alt={selected.name}
								/>
							) : (
								"Photo"
							)}
						</div>
						<div style={{ fontWeight: "bold", fontSize: 20 }}>{selected.name}</div>
						<div className="price-badge">${selected.price}</div>
						<div className="details-section">{selected.description}</div>
						<div className="details-title">Details</div>
						<div className="details-section">
							Uploaded: {selected.createdAt}
							<br />
							Seller: {selected.email}
							<br />
						</div>
						<button className="close-btn" onClick={() => setSelected(null)}>
							Close
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Listings;
