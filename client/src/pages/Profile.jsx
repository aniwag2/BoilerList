// client/src/pages/Profile.jsx
import React, { useContext, useState } from 'react';
import { UserContext } from '../UserContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast, ToastContainer } from 'react-toastify';
import {
    Button, TextField, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Box
} from '@mui/material'; // Import Material-UI components
import { changePassword as apiChangePassword, deleteAccount as apiDeleteAccount } from '../api/user'; // Import new API functions
import './Profile.css';

function Profile() {
    const { user, logout } = useContext(UserContext); // Access logout from context
    const navigate = useNavigate();

    // State for Change Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordChangeOpen, setPasswordChangeOpen] = useState(false); // Modal for change password

    // State for Delete Account confirmation
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false); // Dialog for delete account

    // Handle Change Password submission
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            toast.error("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("New password and confirm new password do not match.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }

        const result = await apiChangePassword({ currentPassword, newPassword });

        if (result.success) {
            toast.success(result.message);
            setPasswordChangeOpen(false); // Close modal
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
            logout(); // Log out the user after password change for security
            navigate('/login'); // Redirect to login
        } else {
            toast.error(result.message);
        }
    };

    // Handle Delete Account confirmation
    const handleDeleteAccount = async () => {
        const result = await apiDeleteAccount();

        if (result.success) {
            toast.success(result.message);
            setDeleteAccountOpen(false); // Close dialog
            logout(); // Log out the user
            navigate('/'); // Redirect to home page
        } else {
            toast.error(result.message);
        }
    };

    if (!user) {
        return (
            <div className="profile-container">
                <p className="profile-not-logged-in">
                    Please log in to view your profile.
                </p>
                <ToastContainer />
            </div>
        );
    }

    return (
        <div className="profile-container">
            <h2 className="profile-title">User Profile</h2>

            <div className="profile-details">
                <p className="profile-item">
                    <span className="profile-label">Username:</span> {user.username}
                </p>
                <p className="profile-item">
                    <span className="profile-label">Email:</span> {user.email}
                </p>
            </div>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}>
                {/* Change Password Button */}
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#FFD700", // Purdue Gold
                        color: "#000", // Black text
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#e6c200" }
                    }}
                    onClick={() => setPasswordChangeOpen(true)}
                >
                    Change Password
                </Button>

                {/* Delete Account Button */}
                <Button
                    variant="contained"
                    color="error" // Red color for delete
                    sx={{ fontWeight: "bold" }}
                    onClick={() => setDeleteAccountOpen(true)}
                >
                    Delete Account
                </Button>
            </Box>

            {/* Change Password Modal/Dialog */}
            <Dialog open={passwordChangeOpen} onClose={() => setPasswordChangeOpen(false)} PaperProps={{
                style: {
                    backgroundColor: "#1e1e1e",
                    color: "white",
                    borderRadius: "8px",
                    boxShadow: "0 0 15px rgba(255,215,0,0.2)"
                },
            }}>
                <DialogTitle sx={{ color: "#FFD700" }}>Change Password</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: "#ccc", mb: 2 }}>
                        To change your password, please enter your current password and your new password.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="current-password"
                        label="Current Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        sx={{
                            mb: 2,
                            '& .MuiInputBase-input': { color: 'white' },
                            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } },
                            '& .MuiInputLabel-root': { color: '#FFD700' },
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="new-password"
                        label="New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        sx={{
                            mb: 2,
                            '& .MuiInputBase-input': { color: 'white' },
                            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } },
                            '& .MuiInputLabel-root': { color: '#FFD700' },
                        }}
                    />
                    <TextField
                        margin="dense"
                        id="confirm-new-password"
                        label="Confirm New Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        sx={{
                            '& .MuiInputBase-input': { color: 'white' },
                            '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' }, '&:hover fieldset': { borderColor: '#FFD700' }, '&.Mui-focused fieldset': { borderColor: '#FFD700' } },
                            '& .MuiInputLabel-root': { color: '#FFD700' },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPasswordChangeOpen(false)} sx={{ color: '#FFD700' }}>Cancel</Button>
                    <Button onClick={handleChangePassword} sx={{
                        backgroundColor: "#FFD700", color: "#000", fontWeight: "bold",
                        "&:hover": { backgroundColor: "#e6c200" }
                    }}>Change</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteAccountOpen}
                onClose={() => setDeleteAccountOpen(false)}
                aria-labelledby="delete-account-title"
                aria-describedby="delete-account-description"
                PaperProps={{
                    style: {
                        backgroundColor: "#1e1e1e",
                        color: "white",
                        borderRadius: "8px",
                        boxShadow: "0 0 15px rgba(255,215,0,0.2)"
                    },
                }}
            >
                <DialogTitle id="delete-account-title" sx={{ color: "error.main" }}>{"Delete Account?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-account-description" sx={{ color: "#ccc" }}>
                        Are you absolutely sure you want to delete your account? This action is irreversible.
                        All your listings will also be permanently removed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteAccountOpen(false)} sx={{ color: "#FFD700" }}>Cancel</Button>
                    <Button onClick={handleDeleteAccount} color="error" autoFocus sx={{ fontWeight: "bold" }}>
                        Delete My Account
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </div>
    );
}

export default Profile;