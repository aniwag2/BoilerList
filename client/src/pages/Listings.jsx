// Listings.jsx — Updated with new interest features
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Grid, Card, CardMedia, CardContent, Typography, Button, Modal, Box,
    IconButton, CardActions, ToggleButtonGroup, ToggleButton,
    FormControl, Select, MenuItem, Fade, InputAdornment, Chip,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    CircularProgress // Already here, but confirming
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ReportDialog from "../components/ReportDialog";
import Pagination from "@mui/material/Pagination";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { UserContext } from "../UserContext";
import {
    getListings as apiGetListings,
    toggleFavorite as apiToggleFavorite,
    deleteListing as apiDeleteListing,
    searchItems as apiSearchItems,
    expressInterest as apiExpressInterest, // NEW: Import expressInterest
    sendInterestedBuyersEmail as apiSendInterestedBuyersEmail // NEW: Import sendInterestedBuyersEmail
} from "../api/user";
import { CATEGORY_OPTIONS } from "../constants/categories";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Listings.css";
import Tooltip from '@mui/material/Tooltip';
import { Checkbox, FormControlLabel } from "@mui/material";


const Listings = () => {
    const navigate = useNavigate();
    const { user } = useContext(UserContext);
    const [selected, setSelected] = useState(null); // The currently selected item for the modal
    const [reportOpen, setReportOpen] = useState(false);
    const [reportListingId, setReportListingId] = useState(null);
    const [allListings, setAllListings] = useState([]);
    const [originalListings, setOriginalListings] = useState([]); // Kept for reset filters, so not unused
    const [displayedListings, setDisplayedListings] = useState([]);
    const [displayedFavorites, setDisplayedFavorites] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [favoritesPage, setFavoritesPage] = useState(1);
    const [selectedPriceRange, setSelectedPriceRange] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFilter, setSearchFilter] = useState(false);
    const [selectedAdditionalFilter, setSelectedAdditionalFilter] = useState("");
    const listingsPerPage = 12;
    const [showMyItemsOnly, setShowMyItemsOnly] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState(null);

    // NEW: State to track if "Send Buyer List" email is in progress
    const [isSendingBuyersEmail, setIsSendingBuyersEmail] = useState(false);


    const priceRanges = [
        { label: "Select Price", value: "" },
        { label: "$0 - $10", value: "0-10" },
        { label: "$10 - $20", value: "10-20" },
        { label: "$20 - $40", value: "20-40" },
        { label: "$40 - $80", value: "40-80" },
        { label: "$80 - $120", value: "80-120" },
        { label: "$120 - $200", value: "120-200" },
    ];

    const fetchAndSetListings = useCallback(async () => {
        const result = await apiGetListings();
        if (result.success) {
            setAllListings(result.listings);
            setOriginalListings(result.listings);
            setDisplayedListings(result.listings.slice((currentPage - 1) * listingsPerPage,
                currentPage * listingsPerPage));
            const favorites = result.listings.filter(item => item.isFavorite);
            setDisplayedFavorites(favorites.slice((favoritesPage - 1) * listingsPerPage,
                favoritesPage * listingsPerPage));
            // FIX: If the selected item in the modal was just updated/deleted, refresh its data
            // This ensures interestedBuyers count etc. is up-to-date when re-opening modal
            if (selected) {
                const updatedSelectedItem = result.listings.find(item => item._id === selected._id);
                if (updatedSelectedItem) {
                    setSelected(updatedSelectedItem);
                } else {
                    setSelected(null); // Item was deleted, close modal
                }
            }
        } else {
            console.error("Error fetching listings:", result.message);
            toast.error("Error fetching listings: " + result.message);
        }
    }, [currentPage, favoritesPage, listingsPerPage]); // Add selected as a dependency

    useEffect(() => {
        if (!searchFilter) { // Only fetch listings if not currently in a search filtered state
            fetchAndSetListings();
        }
    }, [user, currentPage, favoritesPage, filter, searchFilter, fetchAndSetListings]); // Add fetchAndSetListings to dependencies

    useEffect(() => {
        if (filter === 'favorites' && user) {
            setFilteredListings(displayedFavorites);
        } else {
            setFilteredListings(displayedListings);
        }
    }, [displayedListings, filter, user, displayedFavorites]);

    const fetchFilteredListings = useCallback(async (priceRange, category, additionalFilter, showMyItemsOnlyFlag) => {
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

            if (showMyItemsOnlyFlag && user?._id) {
                params.append("ownerId", user._id);
            }

            if (additionalFilter?.includes("isBestOffer")) {
                params.append("isBestOffer", "true");
            }
            if (additionalFilter?.includes("isUrgent")) {
                params.append("isUrgent", "true");
            }

            const paramString = params.toString();
            if (paramString) {
                url += `?${paramString}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setAllListings(data.listings);
                setCurrentPage(1);
                setDisplayedListings(data.listings.slice(0, listingsPerPage));
            }
        } catch (err) {
            console.error("Network error:", err);
            toast.error("Network error applying filters.");
        }
    }, [user, listingsPerPage]); // Add user and listingsPerPage to dependencies


    const handlePriceChange = (e) => {
        const newPrice = e.target.value;
        setSelectedPriceRange(newPrice);
        if (filter === "all") {
            fetchFilteredListings(newPrice, selectedCategory, selectedAdditionalFilter, showMyItemsOnly);
        }
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        if (filter === "all") {
            fetchFilteredListings(selectedPriceRange, newCategory, selectedAdditionalFilter, showMyItemsOnly);
        }
    };

    const handleAdditionalFilterChange = async (e) => {
        const newFilter = e.target.value;
        setSelectedAdditionalFilter(newFilter);

        if (filter === "all") {
            fetchFilteredListings(selectedPriceRange, selectedCategory, newFilter, showMyItemsOnly);
        }
    };


    const handlePageChange = (event, value) => {
        if (filter === 'favorites') {
            setFavoritesPage(value);
        } else {
            setCurrentPage(value);
        }
    };


    const handleFlagClick = (id) => {
        setReportListingId(id);
        setReportOpen(true);
    };

    const handleFavoriteClick = async (itemId) => {
        if (!user) {
            toast.info("Please log in to favorite items.");
            navigate('/login');
            return;
        }

        const result = await apiToggleFavorite(itemId);
        if (result.success) {
            setAllListings(prevListings =>
                prevListings.map(item =>
                    item._id === itemId ? { ...item, isFavorite: result.isFavorite } : item
                )
            );
            fetchAndSetListings();
        } else {
            console.error("Failed to toggle favorite:", result.message);
            toast.error(`Failed to update favorite status: ${result.message}`);
        }
    };

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            if (newFilter === 'favorites' && !user) {
                toast.info("Please log in to view your favorited items.");
                navigate('/login');
                return;
            }
            setCurrentPage(1);
            setFavoritesPage(1);
            setFilter(newFilter);
        }
    };

    const handleResetFilters = () => {
        setSelectedPriceRange("");
        setSelectedCategory("");
        setSelectedAdditionalFilter("");
        setSearchQuery("");
        setSearchFilter(false);
        setShowMyItemsOnly(false);
        setCurrentPage(1);
        setFilter("all");
        fetchAndSetListings();
        toast.info("Filters cleared");
    };

    const handleMarkAsSoldClick = (item) => {
        setListingToDelete(item);
        setConfirmDeleteOpen(true);
    };

    const confirmDeleteListing = async () => {
        if (!listingToDelete) return;

        setConfirmDeleteOpen(false);

        const result = await apiDeleteListing(listingToDelete._id);
        if (result.success) {
            toast.success(result.message);
            setAllListings(prevListings =>
                prevListings.filter(item => item._id !== listingToDelete._id)
            );
            fetchAndSetListings();
            setSelected(null);
        } else {
            toast.error(result.message);
            console.error("Error marking item as sold:", result.message);
        }
        setListingToDelete(null);
    };

    const handleEditListingClick = (item) => {
        setSelected(null);
        navigate(`/edit-item/${item._id}`);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const result = await apiSearchItems(searchQuery);
        if (result.success) {
            setSearchFilter(true);
            setAllListings(result.items);
            const searchListings = result.items;
            const favorites = result.items.filter(item => item.isFavorite);
            setCurrentPage(1);
            setFavoritesPage(1);
            setDisplayedListings(searchListings.slice(0, listingsPerPage));
            setDisplayedFavorites(favorites.slice(0, listingsPerPage));
        } else {
            console.error("Error searching for items:", result.message);
            fetchAndSetListings();
            toast.error("Error searching for items: " + result.message);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setSearchFilter(false);
        setCurrentPage(1);
        setFavoritesPage(1);
        if (selectedPriceRange || selectedCategory || selectedAdditionalFilter || showMyItemsOnly) {
            fetchFilteredListings(selectedPriceRange, selectedCategory, selectedAdditionalFilter, showMyItemsOnly);
        } else {
            fetchAndSetListings();
        }
    }

    // NEW: Handle "I'm Interested" button click
    const handleExpressInterest = async (itemId) => {
        if (!user) {
            toast.info("Please log in to express interest.");
            navigate('/login');
            return;
        }

        // These checks are already done on backend, but good to have client-side too for immediate feedback
        if (selected?.isOwner) {
            toast.error("You cannot express interest in your own listing.");
            return;
        }
        if (selected?.hasExpressedInterest) {
            toast.info("You have already expressed interest in this listing.");
            return;
        }

        const result = await apiExpressInterest(itemId);
        if (result.success) {
            toast.success(result.message);
            // Update the selected item's interestedBuyers count and status in the modal
            setSelected(prevSelected => ({
                ...prevSelected,
                // Ensure interestedBuyers is an array before spreading
                interestedBuyers: prevSelected.interestedBuyers ? [...prevSelected.interestedBuyers, { userId: user._id, username: user.username, email: user.email }] : [{ userId: user._id, username: user.username, email: user.email }],
                hasExpressedInterest: true
            }));
            // Also update the main allListings state to reflect the change globally
            setAllListings(prevListings =>
                prevListings.map(item =>
                    item._id === itemId
                        ? {
                            ...item,
                            // Ensure interestedBuyers is an array before spreading
                            interestedBuyers: item.interestedBuyers ? [...item.interestedBuyers, { userId: user._id, username: user.username, email: user.email }] : [{ userId: user._id, username: user.username, email: user.email }],
                            hasExpressedInterest: true
                        }
                        : item
                )
            );
            // Re-run fetchAndSetListings to ensure displayed lists are consistent with new data
            // This also ensures the interestedBuyers count is accurate if the modal is closed and re-opened
            fetchAndSetListings();
        } else {
            toast.error(result.message);
            console.error("Error expressing interest:", result.message);
        }
    };

    // NEW: Handle "Send Buyer List" button click
    const handleSendBuyersEmail = async (listingId) => {
        if (!user || !user.token) {
            toast.error("You must be logged in to send a buyer list.");
            navigate('/login');
            return;
        }
        // Check if user is actually the owner (redundant with backend, but good UX)
        if (!selected?.isOwner) {
            toast.error("You can only send buyer lists for your own listings.");
            return;
        }

        setIsSendingBuyersEmail(true); // Show loading spinner
        const result = await apiSendInterestedBuyersEmail(listingId);
        setIsSendingBuyersEmail(false); // Hide loading spinner

        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
            console.error("Error sending buyer list email:", result.message);
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "'Sora', sans-serif" }}>
            <form onSubmit={handleSearch}>
                <TextField
                    label="Search for items"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); }}
                    size="small"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleSearch(e);
                        }
                    }}
                    sx={{
                        "& label": { color: "gold" },
                        "& label.Mui-focused": { color: "gold" },
                        "& .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
                        "& .MuiInputBase-input": { color: "gold" },
                    }}
                    InputProps={{ // Corrected prop from slotProps.input to InputProps
                        endAdornment: (
                            <>
                                {searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="clear search"
                                            onClick={() => { handleClearSearch() }}
                                            edge="end"
                                            size="small"
                                        >
                                            <ClearIcon style={{ color: "gold" }} />
                                        </IconButton>
                                    </InputAdornment>
                                )}
                            </>
                        ),
                    }}
                />
                <IconButton type="submit" aria-label="search" >
                    <SearchIcon style={{ fill: "gold" }} />
                </IconButton>
            </form>
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
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                            checked={showMyItemsOnly}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setShowMyItemsOnly(checked);
                                if (filter === "all") {
                                    fetchFilteredListings(
                                        selectedPriceRange,
                                        selectedCategory,
                                        selectedAdditionalFilter,
                                        checked
                                    );
                                }
                            }}
                            sx={{ color: "#FFD700", '&.Mui-checked': { color: "#FFD700" } }}
                        />
                        <Tooltip title="Show only items you've listed" arrow>
                            <Typography sx={{ color: "#FFD700", fontSize: "0.9rem", cursor: "default" }}>
                                My Items
                            </Typography>
                        </Tooltip>
                    </Box>
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

                    <FormControl sx={{ minWidth: 180 }}>
                        <Select
                            value={selectedAdditionalFilter}
                            onChange={handleAdditionalFilterChange}
                            displayEmpty
                            sx={{
                                color: "white", backgroundColor: "#121212",
                                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
                                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#FFD700" },
                                "& .MuiSvgIcon-root": { color: "#FFD700" }
                            }}
                        >
                            <MenuItem value="">Additional Filters</MenuItem>
                            <MenuItem value="isBestOffer">Best Offer</MenuItem>
                            <MenuItem value="isUrgent">Urgent</MenuItem>
                            <MenuItem value="isBestOffer,isUrgent">Best Offer and Urgent</MenuItem>
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
                                        {item.isBestOffer && (
                                            <Chip label="Best Offer" color="primary" variant="outlined" sx={{ mt: 1, color: "white", borderColor: "#FFD700" }} />
                                        )}
                                        {item.isUrgent && (
                                            <Tooltip
                                                title="This item needs to be sold ASAP. Open to negotiate!"
                                                arrow
                                                placement="top"
                                            >
                                                <Chip
                                                    label="Urgent"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ mt: 1, color: "white", cursor: "pointer", borderColor: "orange" }}
                                                />
                                            </Tooltip>
                                        )}
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
                                <Box sx={{ position: 'relative', mb: 3 }}>
                                    {/* NEW: Number of buyers interested */}
                                    {selected.interestedBuyers && selected.interestedBuyers.length > 0 && (
                                        <Typography variant="caption"
                                            sx={{
                                                position: 'absolute', top: 8, right: 8,
                                                bgcolor: 'rgba(255,215,0,0.8)', color: 'black',
                                                borderRadius: '4px', px: 1, py: 0.5, fontWeight: 'bold'
                                            }}
                                        >
                                            Interested: {selected.interestedBuyers.length}
                                        </Typography>
                                    )}

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

                                {/* Buttons for owner */}
                                {user && selected.isOwner && (
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                        <Button
                                            onClick={() => handleMarkAsSoldClick(selected)}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "error.main",
                                                color: "white",
                                                fontWeight: "bold",
                                                borderRadius: "6px",
                                                "&:hover": { backgroundColor: "error.dark" },
                                                flexGrow: 1
                                            }}
                                        >
                                            Mark Item As Sold/Delete
                                        </Button>
                                        <Button
                                            onClick={() => handleEditListingClick(selected)}
                                            variant="contained"
                                            sx={{
                                                backgroundColor: "#2196F3",
                                                color: "white",
                                                fontWeight: "bold",
                                                borderRadius: "6px",
                                                "&:hover": { backgroundColor: "#1976D2" },
                                                flexGrow: 1
                                            }}
                                        >
                                            Edit Listing
                                        </Button>
                                    </Box>
                                )}

                                {/* NEW: "Send Buyer List" button for owner */}
                                {user && selected.isOwner && (
                                    <Button
                                        onClick={() => handleSendBuyersEmail(selected._id)}
                                        variant="outlined"
                                        disabled={isSendingBuyersEmail}
                                        sx={{
                                            mt: 4,
                                            color: "#FFD700",
                                            borderColor: "#FFD700",
                                            fontWeight: "bold",
                                            "&:hover": { backgroundColor: "#1e1e1e", borderColor: "#FFD700" }
                                        }}
                                    >
                                        {isSendingBuyersEmail ? <CircularProgress size={24} sx={{ color: 'gold' }} /> : "Send Buyer List"}
                                    </Button>
                                )}

                                {/* NEW: "I'm Interested" button for non-owner buyers */}
                                {user && !selected.isOwner && ( // Only show if logged in and NOT the owner
                                    <Button
                                        onClick={() => handleExpressInterest(selected._id)}
                                        variant="contained"
                                        disabled={selected.hasExpressedInterest} // Disable if already interested
                                        sx={{
                                            mt: 4,
                                            backgroundColor: selected.hasExpressedInterest ? "#888" : "#4CAF50", // Grey if disabled, Green if active
                                            color: "white",
                                            fontWeight: "bold",
                                            borderRadius: "6px",
                                            "&:hover": { backgroundColor: selected.hasExpressedInterest ? "#888" : "#388E3C" }
                                        }}
                                    >
                                        {selected.hasExpressedInterest ? "Interest Expressed" : "I'm Interested"}
                                    </Button>
                                )}

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

            <Dialog
                open={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                PaperProps={{
                    style: {
                        backgroundColor: "#1e1e1e",
                        color: "white",
                        borderRadius: "8px",
                        boxShadow: "0 0 15px rgba(255,215,0,0.2)"
                    },
                }}
            >
                <DialogTitle id="alert-dialog-title" sx={{ color: "#FFD700" }}>
                    {"Confirm Mark as Sold?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description" sx={{ color: "#ccc" }}>
                        Are you sure you want to mark "{listingToDelete?.name}" as sold? This action
                        cannot be undone and the listing will be permanently removed from BoilerList.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteOpen(false)} sx={{ color: "#FFD700" }}>
                        Cancel
                    </Button>
                    <Button onClick={confirmDeleteListing} autoFocus sx={{
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": { backgroundColor: "error.dark" }
                    }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>


            <ReportDialog
                open={reportOpen}
                onClose={() => setReportOpen(false)}
                listingId={reportListingId}
            />
            <ToastContainer position="top-center" autoClose={3000} />
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