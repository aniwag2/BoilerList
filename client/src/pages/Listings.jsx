// client/src/pages/Listings.jsx with ReportDialog connected to flag icon
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Grid, Card, CardMedia, CardContent, Typography, Button, Modal, Box, IconButton, CardActions,
    ToggleButtonGroup, ToggleButton, // <--- NEW: For filter buttons
    Stack
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite"; // <--- NEW: Filled heart icon
import ReportDialog from "../components/ReportDialog";
import { UserContext } from "../UserContext"; // <--- NEW: Import UserContext
import { getListings as apiGetListings, toggleFavorite as apiToggleFavorite } from "../api/user"; // <--- NEW: Import API functions
import "./Listings.css";

const Listings = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext); // <--- NEW: Get user from context
    const [selected, setSelected] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportListingId, setReportListingId] = useState(null);
    const [allListings, setAllListings] = useState([]); // Stores all fetched listings
    const [filteredListings, setFilteredListings] = useState([]); // Stores listings after filtering
    const [filter, setFilter] = useState('all'); // State for filter: 'all' or 'favorites'

    // Fetch listings on component mount or when user/filter changes
    useEffect(() => {
        const fetchAndSetListings = async () => {
            const result = await apiGetListings(); // Use the API function
            if (result.success) {
                setAllListings(result.listings);
            } else {
                console.error("Error fetching listings:", result.message);
                // Handle error, e.g., show a toast notification
            }
        };
        fetchAndSetListings();
    }, [user]); // Re-fetch if user context changes (login/logout)

    // Effect to apply filtering whenever allListings or filter state changes
    useEffect(() => {
        if (filter === 'favorites' && user) {
            setFilteredListings(allListings.filter(item => item.isFavorite));
        } else {
            setFilteredListings(allListings);
        }
    }, [allListings, filter, user]);

    const modalStyle = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        maxWidth: 500,
        borderRadius: 2,
    };

    const handleFlagClick = (id) => {
        setReportListingId(id);
        setReportOpen(true);
    };

    // <--- NEW: Handle favorite toggle click
    const handleFavoriteClick = async (itemId) => {
        if (!user) {
            // User not logged in, maybe show a message or redirect to login
            alert("Please log in to favorite items."); // Or use a toast notification
            navigate('/login'); // Redirect to login
            return;
        }

        const result = await apiToggleFavorite(itemId);
        if (result.success) {
            // Update the local state to reflect the new favorite status
            setAllListings(prevListings =>
                prevListings.map(item =>
                    item._id === itemId ? { ...item, isFavorite: result.isFavorite } : item
                )
            );
        } else {
            console.error("Failed to toggle favorite:", result.message);
            // Show error to user
        }
    };

    // <--- NEW: Handle filter change
    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) { // MUI ToggleButtonGroup can pass null if unselected
            if (newFilter === 'favorites' && !user) {
                alert("Please log in to view your favorited items.");
                navigate('/login');
                return;
            }
            setFilter(newFilter);
        }
    };


    return (
        <div style={{ padding: "2rem" }}>
            <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                    value={filter}
                    exclusive
                    onChange={handleFilterChange}
                    aria-label="listings filter"
                >
                    <ToggleButton value="all" aria-label="show all">
                        All Listings
                    </ToggleButton>
                    <ToggleButton value="favorites" aria-label="show favorites">
                        My Favorites
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {filteredListings.map((item) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                        <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, pt: 1 }}>
                                <IconButton color="error" size="small" onClick={() => handleFlagClick(item._id)}>
                                    <FlagIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => handleFavoriteClick(item._id)} // <--- Attach handler
                                >
                                    {/* <--- Conditional rendering for heart icon */}
                                    {item.isFavorite ? (
                                        <FavoriteIcon fontSize="small" sx={{ color: 'red' }} /> // Filled heart if favorited
                                    ) : (
                                        <FavoriteBorderIcon fontSize="small" /> // Empty heart if not
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
        </div>
    );
};

export default Listings;