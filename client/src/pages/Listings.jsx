// client/src/pages/Listings.jsx
// Listings.jsx with ReportDialog connected to flag icon
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Grid, Card, CardMedia, CardContent, Typography, Button, Modal, Box, IconButton, CardActions,
    ToggleButtonGroup, ToggleButton,
    Stack // Stack is imported but not used in this specific file, can be removed if not needed elsewhere
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite"; // Filled heart icon
import Pagination from "@mui/material/Pagination";
import ReportDialog from "../components/ReportDialog";
import { UserContext } from "../UserContext";
import { getListings as apiGetListings, toggleFavorite as apiToggleFavorite } from "../api/user";
import "./Listings.css";

const Listings = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [selected, setSelected] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportListingId, setReportListingId] = useState(null);
    const [allListings, setAllListings] = useState([]); // Stores all fetched listings
	const [displayedListings, setDisplayedListings] = useState([]); // Stores listings after filtering
	const [displayedFavorites, setDisplayedFavorites] = useState([]); // Stores favorites after filtering
    const [filteredListings, setFilteredListings] = useState([]); // Stores listings after filtering
    const [filter, setFilter] = useState('all'); // State for filter: 'all' or 'favorites'
    const [currentPage, setCurrentPage] = useState(1);
	const [favoritesPage, setFavoritesPage] = useState(1);
    const listingsPerPage = 12;

    // Fetch listings on component mount or when user changes (e.g., login/logout)
    useEffect(() => {
        const fetchAndSetListings = async () => {
            const result = await apiGetListings(); // Use the API function from client/api/user.js
            if (result.success) {
                setAllListings(result.listings);
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

    // Effect to apply filtering whenever allListings, filter state, or user (for favorites) changes
    useEffect(() => {
        if (filter === 'favorites' && user) {
            // Filter by isFavorite property only if 'favorites' filter is selected AND user is logged in
            setFilteredListings(displayedFavorites);
        }
		else {
			setFilteredListings(displayedListings);
		}
    }, [displayedListings, filter, user, displayedFavorites]); // Re-run when these dependencies change

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper", // Default MUI background color for modal
        boxShadow: 24,
        p: 4,
        maxWidth: 500,
        borderRadius: 2,
    };

    const handleFlagClick = (id) => {
        setReportListingId(id);
        setReportOpen(true);
    };

	const handlePageChange = (event, value) => {
		if (filter === 'favorites') {
			setFavoritesPage(value);
			setDisplayedFavorites(allListings.slice((value - 1) * listingsPerPage, 
			allListings.length < value * listingsPerPage ? allListings.length : value * listingsPerPage).filter(item => item.isFavorite));
		} else {
			setCurrentPage(value);
			setDisplayedListings(allListings.slice((value - 1) * listingsPerPage, 
			allListings.length < value * listingsPerPage ? allListings.length : value * listingsPerPage));
		}
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


    return (
        <div style={{ padding: "2rem" }}>
            {/* Filter buttons at the top of the listings page */}
            <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={filter}
                    exclusive // Only one button can be selected
                    onChange={handleFilterChange} // Handler for filter changes
                    aria-label="listings filter"
                >
                    <ToggleButton value="all" aria-label="show all">
                        All Listings
                    </ToggleButton>
                    <ToggleButton value="favorites" aria-label="show favorites" disabled={!user}> {/* Disable if not logged in */}
                        My Favorites
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {/* Use filteredListings for mapping */}
                {filteredListings.map((item) => (
                    // <--- CHANGED GRID BREAKPOINTS HERE FOR 4 ITEMS PER LINE (MD and up) ---
                    <Grid item xs={12} sm={6} md={3} key={item._id}>
                        <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, pt: 1 }}>
                                <IconButton color="error" size="small" onClick={() => handleFlagClick(item._id)}>
                                    <FlagIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => handleFavoriteClick(item._id)}
                                >
                                    {item.isFavorite ? (
                                        <FavoriteIcon fontSize="small" sx={{ color: 'red' }} />
                                    ) : (
                                        <FavoriteBorderIcon fontSize="small" />
                                    )}
                                </IconButton>
                            </Box>

                            <Box
                                sx={{
                                    border: "2px solid gold",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    mx: 2,
                                    mt: 1
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.image && item.image.data ? `data:${item.image.contentType};base64,${item.image.data}` : "/placeholder.png"}
                                    alt={item.name}
                                    sx={{ objectFit: "cover" }}
                                />
                            </Box>

                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    {item.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    ${item.price}
                                </Typography>
                                <Typography variant="body2" mt={1}>
                                    {item.description}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ px: 2, pb: 2 }}>
                                <Button
                                    fullWidth
                                    onClick={() => setSelected(item)}
                                    variant="outlined"
                                >
                                    View Details
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Modal open={!!selected} onClose={() => setSelected(null)}>
                <Box sx={modalStyle}>
                    {selected && (
                        <>
                            <Box mb={2}>
                                {selected.image && selected.image.data ? (
                                    <img
                                        src={`data:${selected.image.contentType};base64,${selected.image.data}`}
                                        alt={selected.name}
                                        style={{ width: "100%", maxHeight: 250, objectFit: "cover" }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            height: 250,
                                            background: "#eee",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        Photo
                                    </div>
                                )}
                            </Box>
                            <Typography variant="h6" fontWeight="bold">
                                {selected.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                ${selected.price}
                            </Typography>
                            <Typography variant="body2">{selected.description}</Typography>
                            <Typography variant="body2" mt={2}>
                                <strong>Details</strong>
                                <br /> Uploaded: {selected.createdAt}
                                <br /> Seller: {selected.email}
                            </Typography>
                            <Button onClick={() => setSelected(null)} variant="contained" sx={{ mt: 3 }}>
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>

            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                listingId={reportListingId}
            />
			<Pagination
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