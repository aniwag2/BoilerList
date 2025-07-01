// Listings.jsx with ReportDialog connected to flag icon
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Modal,
  Box,
  IconButton,
  CardActions,
  Stack
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ReportDialog from "../components/ReportDialog";
import "./Listings.css";

const Listings = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportListingId, setReportListingId] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/listings/getListings")
      .then((response) => response.json())
      .then((data) => setListings(data))
      .catch((error) => console.error("Error fetching listings:", error));
  }, []);

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

  return (
    <div style={{ padding: "2rem" }}>
      <Grid container spacing={4} justifyContent="center">
        {listings.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
            <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 1, pt: 1 }}>
                <IconButton color="error" size="small" onClick={() => handleFlagClick(item._id)}>
                  <FlagIcon fontSize="small" />
                </IconButton>
                <IconButton color="primary" size="small">
                  <FavoriteBorderIcon fontSize="small" />
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