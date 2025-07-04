// client/src/pages/Listings.jsx
// Listings.jsx with ReportDialog connected to flag icon
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
    Grid, Card, CardMedia, CardContent, Typography, Button, Modal, Box, IconButton, CardActions,
    ToggleButtonGroup, ToggleButton,
    Stack // Stack is imported but not used in this specific file, can be removed if not needed elsewhere
} from "@mui/material";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material"; 
import FlagIcon from "@mui/icons-material/Flag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite"; // Filled heart icon
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
    const [filteredListings, setFilteredListings] = useState([]); // Stores listings after filtering
    const [filter, setFilter] = useState('all'); // State for filter: 'all' or 'favorites'
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    
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
            } else {
                console.error("Error fetching listings:", result.message);
                // Optionally, show a toast notification here
            }
        };
        fetchAndSetListings();
    }, [user]); // Depend on 'user' so listings re-fetch on login/logout to update favorite status

        useEffect(() => {
    const fetchListings = async () => {
        try {
        let url = "http://localhost:8080/api/filtering";

        if (selectedPriceRange) {
            const [minPrice, maxPrice] = selectedPriceRange.split("-");
            url += `?minPrice=${minPrice}&maxPrice=${maxPrice}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            setAllListings(data.listings);
        } else {
            console.error("Error fetching listings:", data.message);
        }
        } catch (err) {
        console.error("Network error fetching listings:", err);
        }
    };

    fetchListings();
    }, [selectedPriceRange]);

    // Effect to apply filtering whenever allListings, filter state, or user (for favorites) changes
    useEffect(() => {
        if (filter === 'favorites' && user) {
            // Filter by isFavorite property only if 'favorites' filter is selected AND user is logged in
            setFilteredListings(allListings.filter(item => item.isFavorite));
        } else {
            // Otherwise, show all listings
            setFilteredListings(allListings);
        }
    }, [allListings, filter, user]); // Re-run when these dependencies change

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

 <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  <Typography
    variant="subtitle1"
    sx={{ color: "#FFD700", fontWeight: "bold", mb: 1 }}
  >
    Price Range
  </Typography>

  <FormControl sx={{ minWidth: 220 }}>
    <Select
      value={selectedPriceRange}
      onChange={(e) => setSelectedPriceRange(e.target.value)}
      displayEmpty
      inputProps={{ 'aria-label': 'Price Range' }}
      sx={{
        color: "white",
        borderColor: "#FFD700",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#FFD700",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#FFD700",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#FFD700",
        },
        "& .MuiSvgIcon-root": {
          color: "#FFD700",
        },
        backgroundColor: "#121212", // Optional: match your dark theme
      }}
    >
      {priceRanges.map((range, idx) => (
        <MenuItem key={idx} value={range.value}>
          {range.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
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
                                        src={`data:${selected.image.contentType};base66,${selected.image.data}`}
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