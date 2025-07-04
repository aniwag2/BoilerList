// Listings.jsx — Toast top-center, price/category filters, reset button

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
import { UserContext } from "../UserContext";
import {
  getListings as apiGetListings,
  toggleFavorite as apiToggleFavorite
} from "../api/user";
import { CATEGORY_OPTIONS } from "../constants/categories";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Listings.css";

// (rest of your component remains unchanged...)

const Listings = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [selected, setSelected] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportListingId, setReportListingId] = useState(null);
  const [allListings, setAllListings] = useState([]);
  const [originalListings, setOriginalListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const priceRanges = [
    { label: "Select Price", value: "" },
    { label: "$0 - $10", value: "0-10" },
    { label: "$10 - $20", value: "10-20" },
    { label: "$20 - $40", value: "20-40" },
    { label: "$40 - $80", value: "40-80" },
    { label: "$80 - $120", value: "80-120" },
    { label: "$120 - $200", value: "120-200" },
  ];

  useEffect(() => {
    const fetchAndSetListings = async () => {
      const result = await apiGetListings();
      if (result.success) {
        setAllListings(result.listings);
        setOriginalListings(result.listings);
      }
    };
    fetchAndSetListings();
  }, [user]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        let url = "http://localhost:8080/api/filtering";
        const params = new URLSearchParams();
        if (selectedPriceRange) {
          const [minPrice, maxPrice] = selectedPriceRange.split("-");
          params.append("minPrice", minPrice);
          params.append("maxPrice", maxPrice);
        }
        if (selectedCategory) {
          params.append("category", selectedCategory);
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

    if (filter === "all") fetchListings();
  }, [selectedPriceRange, selectedCategory, filter]);

  useEffect(() => {
    if (filter === "favorites" && user) {
      setFilteredListings(allListings.filter(item => item.isFavorite));
    } else {
      setFilteredListings(allListings);
    }
  }, [allListings, filter, user]);

  const handleFavoriteClick = async (itemId) => {
    if (!user) return navigate("/login");
    const result = await apiToggleFavorite(itemId);
    if (result.success) {
      setAllListings(prev =>
        prev.map(item =>
          item._id === itemId ? { ...item, isFavorite: result.isFavorite } : item
        )
      );
    }
  };

  const handleFlagClick = (id) => {
    setReportListingId(id);
    setReportOpen(true);
  };

  const handleFilterChange = (_, newFilter) => {
    if (newFilter !== null) {
      if (newFilter === "favorites" && !user) return navigate("/login");
      setFilter(newFilter);
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
      {/* Toggle Group */}
      <Box sx={{ my: 3, display: "flex", justifyContent: "center" }}>
        <ToggleButtonGroup value={filter} exclusive onChange={handleFilterChange}>
          <ToggleButton value="all">All Listings</ToggleButton>
          <ToggleButton value="favorites" disabled={!user}>My Favorites</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
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
          {/* Price Dropdown */}
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
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

          {/* Category Dropdown */}
          <FormControl sx={{ minWidth: 180 }}>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
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

          {/* Reset Button */}
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

      {/* Listings Grid */}
      <Grid container spacing={4} justifyContent="center">
        {filteredListings.length === 0 ? (
          <Typography sx={{ color: "#FFD700", mt: 4 }}>No Listings Found</Typography>
        ) : (
          filteredListings.map((item, index) => (
            <Fade in={true} timeout={300 + index * 100} key={item._id}>
              <Grid item xs={12} sm={6} md={3}>
                {/* Card */}
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

      <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} listingId={reportListingId} />
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Listings;
