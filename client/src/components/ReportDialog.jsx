import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ReportDialog = ({ open, onClose, listingId }) => {
  const [message, setMessage] = useState("");
  const [snackOpen, setSnackOpen] = useState(false);

  const handleSubmit = async () => {
    if (!message) return;

    try {
      await fetch("http://localhost:8080/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, message }),
      });

      setMessage("");
      setSnackOpen(true);
      onClose();
    } catch (error) {
      console.error("Failed to report item", error);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#111",
            border: "2px solid #f1c40f",
            borderRadius: "10px",
            p: 3,
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "#fff",
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogTitle
          sx={{
            color: "#fff",
            fontWeight: "bold",
            textAlign: "left",
            pr: 6,
          }}
        >
          Report Item
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 1,
            pb: 2,
            px: 3,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <TextField
            placeholder="Reason for reporting this item"
            fullWidth
            multiline
            minRows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            InputProps={{
              style: {
                color: "#fff",
                backgroundColor: "#111",
              },
            }}
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                "& fieldset": {
                  borderColor: "#f1c40f",
                },
                "&:hover fieldset": {
                  borderColor: "#f1c40f",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#f1c40f",
                },
              },
              "& textarea": {
                resize: "none",
                overflow: "hidden", // ✅ disables scroll
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: "flex-end", pr: 3, pb: 2 }}>
          <Button
            onClick={handleSubmit}
            variant="outlined"
            sx={{
              color: "#f1c40f",
              borderColor: "#f1c40f",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#f1c40f",
                color: "#000",
              },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity="info" variant="filled">
          Item reported
        </Alert>
      </Snackbar>
    </>
  );
};

export default ReportDialog;
