// Listings.jsx — Updated with immediate filtering on dropdown change

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid, Card, CardMedia, CardContent, Typography, Button, Modal, Box,
  IconButton, CardActions, ToggleButtonGroup, ToggleButton,
  FormControl, Select, MenuItem, Fade
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReportDialog from "../components/ReportDialog";
import Pagination from "@mui/material/Pagination";
import { UserContext } from "../UserContext";
import {
  getListings as apiGetListings,
  toggleFavorite as apiToggleFavorite
} from "../api/user";
import { CATEGORY_OPTIONS } from "../constants/categories";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Listings.css";

const Listings = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [selected, setSelected] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportListingId, setReportListingId] = useState(null);
    const [allListings, setAllListings] = useState([]); // Stores all fetched listings
	const [originalListings, setOriginalListings] = useState([]);
	const [displayedListings, setDisplayedListings] = useState([]); // Stores listings after filtering
	const [displayedFavorites, setDisplayedFavorites] = useState([]); // Stores favorites after filtering
    const [filteredListings, setFilteredListings] = useState([]); // Stores listings after filtering
    const [filter, setFilter] = useState('all'); // State for filter: 'all' or 'favorites'
    const [currentPage, setCurrentPage] = useState(1);
	const [favoritesPage, setFavoritesPage] = useState(1);
	const [selectedPriceRange, setSelectedPriceRange] = useState("");
  	const [selectedCategory, setSelectedCategory] = useState("");
    const listingsPerPage = 12;

	const priceRanges = [
		{ label: "Select Price", value: "" },
		{ label: "$0 - $10", value: "0-10" },
		{ label: "$10 - $20", value: "10-20" },
		{ label: "$20 - $40", value: "20-40" },
		{ label: "$40 - $80", value: "40-80" },
		{ label: "$80 - $120", value: "80-120" },
		{ label: "$120 - $200", value: "120-200" },
	  ];

    // Fetch listings on component mount or when user changes (e.g., login/logout)
    useEffect(() => {
        const fetchAndSetListings = async () => {
            const result = await apiGetListings(); // Use the API function from client/api/user.js
            if (result.success) {
                setAllListings(result.listings);
				setOriginalListings(result.listings);
                setDisplayedListings(result.listings.slice((currentPage - 1) * listingsPerPage, 
				result.listings.length < currentPage * listingsPerPage ? result.listings.length : listingsPerPage));
				const favorites = result.listings.filter(item => item.isFavorite);
				setDisplayedFavorites(favorites.slice(0, listingsPerPage));
            } else {
                console.error("Error fetching listings:", result.message);
                // Optionally, show a toast notification here
            }
        };
        fetchAndSetListings();
    }, [user]); // Depend on 'user' so listings re-fetch on login/logout to update favorite status

    // Effect to apply filtering whenever displayedListings, displayedFavorites, filter state, or user (for favorites) changes
    useEffect(() => {
        if (filter === 'favorites' && user) {
            // Filter by isFavorite property only if 'favorites' filter is selected AND user is logged in
            setFilteredListings(displayedFavorites);
        }
		else {
			setFilteredListings(displayedListings);
		}
    }, [displayedListings, filter, user, displayedFavorites]); // Re-run when these dependencies change

	const fetchFilteredListings = async (priceRange, category) => {
		try {
		  let url = "http://localhost:8080/api/filtering";
		  const params = new URLSearchParams();
	
		  if (priceRange) {
			const [minPrice, maxPrice] = priceRange.split("-");
			params.append("minPrice", minPrice);
			params.append("maxPrice", maxPrice);
		  }
		  if (category) {
			params.append("category", category);
		  }
		  if (params.toString()) {
			url += `?${params.toString()}`;
		  }
	
		  const res = await fetch(url);
		  const data = await res.json();
		  if (data.success) setAllListings(data.listings);
		} catch (err) {
		  console.error("Network error:", err);
		}
	  };

	  const handlePriceChange = (e) => {
		const newPrice = e.target.value;
		setSelectedPriceRange(newPrice);
		if (filter === "all") {
		  fetchFilteredListings(newPrice, selectedCategory);
		}
	  };

	  const handleCategoryChange = (e) => {
		const newCategory = e.target.value;
		setSelectedCategory(newCategory);
		if (filter === "all") {
		  fetchFilteredListings(selectedPriceRange, newCategory);
		}
	  };



	const handlePageChange = (event, value) => {
		if (filter === 'favorites') {
			setFavoritesPage(value);
			// This displays the correct number of favorites on the page
			setDisplayedFavorites(allListings.slice((value - 1) * listingsPerPage, 
			allListings.length < value * listingsPerPage ? allListings.length : value * listingsPerPage).filter(item => item.isFavorite));
		} else {
			setCurrentPage(value);
			// This displays the correct number of listings on the page
			//  For example, if the page is 2, it will display listings 12-23
			setDisplayedListings(allListings.slice((value - 1) * listingsPerPage, 
			allListings.length < value * listingsPerPage ? allListings.length : value * listingsPerPage));
		}
    };


  const handleFlagClick = (id) => {
    setReportListingId(id);
    setReportOpen(true);
  };

    const handleFavoriteClick = async (itemId) => {
        if (!user) {
            // If user is not logged in, prompt them to log in
            alert("Please log in to favorite items."); // Consider using a more styled notification (e.g., toast)
            navigate('/login'); // Redirect to login page
            return;
        }

        const result = await apiToggleFavorite(itemId); // Call the API function
        if (result.success) {
            // Optimistically update the local state to reflect the new favorite status
            setAllListings(prevListings =>
                prevListings.map(item =>
                    item._id === itemId ? { ...item, isFavorite: result.isFavorite } : item
                )
            );
			// Update displayed arrays immediately in order to display heart icon change
			setDisplayedListings(prev =>
				prev.map(item =>
					item._id === itemId ? { ...item, isFavorite: result.isFavorite } : item
				)
			);
			setDisplayedFavorites(prev =>
				prev.map(item =>
					item._id === itemId ? { ...item, isFavorite: result.isFavorite } : item
				)
			);
        } else {
            console.error("Failed to toggle favorite:", result.message);
            // Display error to the user if the API call failed
            alert(`Failed to update favorite status: ${result.message}`); // Example error display
        }
    };

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) { // ToggleButtonGroup can pass null if a button is unselected (though 'exclusive' usually prevents this)
            if (newFilter === 'favorites' && !user) {
                // If trying to filter by favorites but not logged in
                alert("Please log in to view your favorited items.");
                navigate('/login');
                // Don't change filter state if not logged in and trying to filter favorites
                return;
            }
			else if (newFilter === 'favorites') {
				setFavoritesPage(1);
				setDisplayedFavorites(allListings.filter(item => item.isFavorite).slice(0, listingsPerPage));
			}
			else if (newFilter === 'all') {
				setCurrentPage(1);
				setDisplayedListings(allListings.slice(0, listingsPerPage));
			}
            setFilter(newFilter); // Update filter state
        }
    };

	const handleResetFilters = () => {
		setSelectedPriceRange("");
		setSelectedCategory("");
		setAllListings(originalListings);
		toast.info("Filters cleared");
	  };


    return (
		<div style={{ padding: "2rem", fontFamily: "'Sora', sans-serif" }}>
		<Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
		  <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange}>
			<ToggleButton value="all">All Listings</ToggleButton>
			<ToggleButton value="favorites" disabled={!user}>My Favorites</ToggleButton>
		  </ToggleButtonGroup>
		</Box>
  
		{filter === "all" && (
		  <Box
			sx={{
			  my: 3,
			  display: "flex",
			  justifyContent: "center",
			  gap: 2,
			  flexWrap: "wrap",
			  alignItems: "center"
			}}
		  >
			<FormControl sx={{ minWidth: 180 }}>
			  <Select
				value={selectedPriceRange}
				onChange={handlePriceChange}
				displayEmpty
				sx={{
				  color: "white", backgroundColor: "#121212",
				  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
				  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
				  "& .MuiSvgIcon-root": { color: "#FFD700" }
				}}
			  >
				{priceRanges.map((range, idx) => (
				  <MenuItem key={idx} value={range.value}>{range.label}</MenuItem>
				))}
			  </Select>
			</FormControl>
  
			<FormControl sx={{ minWidth: 180 }}>
			  <Select
				value={selectedCategory}
				onChange={handleCategoryChange}
				displayEmpty
				sx={{
				  color: "white", backgroundColor: "#121212",
				  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
				  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
				  "& .MuiSvgIcon-root": { color: "#FFD700" }
				}}
			  >
				<MenuItem value="">Select Category</MenuItem>
				{CATEGORY_OPTIONS.map((cat, idx) => (
				  <MenuItem key={idx} value={cat}>{cat}</MenuItem>
				))}
			  </Select>
			</FormControl>
  
			<Button
			  onClick={handleResetFilters}
			  variant="outlined"
			  sx={{
				color: "#FFD700",
				borderColor: "#FFD700",
				height: "40px",
				fontWeight: "bold",
				textTransform: "none",
				"&:hover": { backgroundColor: "#1e1e1e", borderColor: "#FFD700" }
			  }}
			>
			  Reset Filters
			</Button>
		  </Box>
		)}

		<Grid container spacing={4} justifyContent="center">
			{filteredListings.length === 0 ? (
			<Typography sx={{ color: "#FFD700", mt: 4 }}>No Listings Found</Typography>
			) : (
			filteredListings.map((item, index) => (
				<Fade in={true} timeout={300 + index * 100} key={item._id}>
				<Grid item xs={12} sm={6} md={3}>
					<Card sx={{
					borderRadius: 3, bgcolor: "#1e1e1e", color: "white",
					transition: "transform 0.3s", "&:hover": { transform: "scale(1.02)" },
					boxShadow: "0 0 15px rgba(255,215,0,0.1)"
					}}>
					<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, pt: 1 }}>
						<IconButton color="error" size="small" onClick={() => handleFlagClick(item._id)}>
						<FlagIcon fontSize="small" />
						</IconButton>
						<Box
						sx={{
							background: "linear-gradient(45deg, #FFD700, #000000)", color: "white",
							fontWeight: "bold", fontSize: "0.75rem", px: 2, py: 0.3, borderRadius: "999px",
							textAlign: "center", minWidth: 70, mx: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.4)"
						}}
						>
						{item.category}
						</Box>
						<IconButton onClick={() => handleFavoriteClick(item._id)}>
						{item.isFavorite
							? <FavoriteIcon fontSize="small" sx={{ color: "red" }} />
							: <FavoriteBorderIcon fontSize="small" sx={{ color: "white" }} />}
						</IconButton>
					</Box>

					<Box sx={{ border: "2px solid gold", borderRadius: 2, overflow: "hidden", mx: 2, mt: 1 }}>
						<CardMedia
						component="img"
						height="200"
						image={item.image && item.image.data ? `data:${item.image.contentType};base64,${item.image.data}` : "/placeholder.png"}
						alt={item.name}
						sx={{ objectFit: "cover" }}
						/>
					</Box>

					<CardContent sx={{ textAlign: "center" }}>
						<Typography variant="h6" fontWeight="bold">{item.name}</Typography>
						<Typography variant="body2" sx={{ color: "#FFD700" }}>${item.price}</Typography>
						<Typography variant="body2" sx={{ mt: 1, color: "white" }}>
						<strong>Description:</strong> {item.description}
						</Typography>
					</CardContent>

					<CardActions sx={{ px: 2, pb: 2 }}>
						<Button fullWidth onClick={() => setSelected(item)} variant="outlined" sx={{ color: "#FFD700", borderColor: "#FFD700" }}>
						View Details
						</Button>
					</CardActions>
					</Card>
				</Grid>
				</Fade>
			))
			)}
		</Grid>

		<Modal open={!!selected} onClose={() => setSelected(null)} closeAfterTransition>
			<Fade in={!!selected}>
			<Box sx={{
				position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
				bgcolor: "#1e1e1e", color: "#fff", borderRadius: 3, boxShadow: 24, p: 4, width: "90%", maxWidth: 500, textAlign: "center"
			}}>
				{selected && (
				<>
					<Box mb={3}>
					{selected.image && selected.image.data ? (
						<img
						src={`data:${selected.image.contentType};base64,${selected.image.data}`}
						alt={selected.name}
						style={{
							width: "100%", maxHeight: 250, objectFit: "cover",
							borderRadius: "10px", border: "2px solid gold"
						}}
						/>
					) : (
						<Box sx={{
						height: 250, background: "#333", color: "#ccc",
						display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2
						}}>
						No Image Available
						</Box>
					)}
					</Box>

					<Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>{selected.name}</Typography>
					<Typography variant="h6" sx={{ color: "#FFD700", fontWeight: "medium", mb: 1 }}>${selected.price}</Typography>
					<Typography variant="body1" sx={{ mb: 3, color: "white" }}>Description: {selected.description}</Typography>

					<Box sx={{ width: "100%", height: "1px", backgroundColor: "#333", mb: 3 }} />

					<Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Details</Typography>
					<Typography variant="body2" sx={{ color: "white", display: "flex", justifyContent: "center", gap: 1 }}>
					🕓 {new Date(selected.createdAt).toLocaleString()}
					</Typography>
					<Typography variant="body2" sx={{ color: "white", display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
					📧 {selected.email}
					</Typography>

					<Button onClick={() => setSelected(null)} variant="contained" sx={{
					mt: 4, backgroundColor: "#FFD700", color: "#000", fontWeight: "bold",
					borderRadius: "6px", "&:hover": { backgroundColor: "#e6c200" }
					}}>
					CLOSE
					</Button>
				</>
				)}
			</Box>
			</Fade>
		</Modal>

            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                listingId={reportListingId}
            />
			<ToastContainer position="top-center" autoClose={3000} />
			<Pagination // Determine total pages based on filter
                count={filter === 'favorites'
					? Math.ceil(allListings.filter(item => item.isFavorite).length / listingsPerPage)
					: Math.ceil(allListings.length / listingsPerPage)}
                page={filter === 'favorites' ? favoritesPage : currentPage}
				onChange={handlePageChange}
				color="secondary"
                sx={{
					width: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					padding: 10,
					"& .MuiPaginationItem-textPrimary": {
						color: "gold",
					},
					"& .MuiPaginationItem-root": {
						color: "gold",
					},
					"& .MuiPaginationItem-root.Mui-selected": {
						backgroundColor: "gold",
						color: "black",
					},
				}}
            />
        </div>
    );
};

export default Listings;
