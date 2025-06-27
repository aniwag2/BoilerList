import React, { useState, useContext } from "react";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { login } from "../api/user";
import { UserContext } from "../UserContext";
import PurdueLogo from "../assets/PurdueLogo.png";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//renders the UI, calls the login API, updates the user context 
const Login = () => {
	const navigate = useNavigate();
	const { setUser } = useContext(UserContext);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const res = await login({ username, password });

			if (res.error) {
				toast.error("Incorrect username or password.");
			} else {
				toast.success("Login successful!");
				setUser(res.username);
				navigate("/listings");
			}
		} catch (err) {
			toast.error("Something went wrong.");
		}
	};

	return (
		<Box
			sx={{
				minHeight: "100vh",
				backgroundColor: "black",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				color: "#CEB888",
			}}
		>
			<Paper
				elevation={10}
				sx={{
					padding: 4,
					width: 350,
					backgroundColor: "black",
					color: "#CEB888",
					textAlign: "center",
				}}
			>
				<img
					src={PurdueLogo}
					alt="Purdue Logo"
					style={{ width: 80, marginBottom: 20 }}
				/>

				<Typography variant="h5" fontWeight="bold" gutterBottom>
					LOGIN
				</Typography>

				<form onSubmit={handleSubmit}>
					<TextField
						fullWidth
						placeholder="USERNAME"
						variant="outlined"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						margin="normal"
						sx={{
							input: { color: "#CEB888" },
							"& .MuiOutlinedInput-root": {
								"& fieldset": { borderColor: "#CEB888" },
								"&:hover fieldset": { borderColor: "#CEB888" },
								"&.Mui-focused fieldset": { borderColor: "#CEB888" },
							},
						}}
						InputProps={{
							style: { color: "#CEB888" },
						}}
					/>

					<TextField
						fullWidth
						placeholder="PASSWORD"
						type="password"
						variant="outlined"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						margin="normal"
						sx={{
							input: { color: "#CEB888" },
							"& .MuiOutlinedInput-root": {
								"& fieldset": { borderColor: "#CEB888" },
								"&:hover fieldset": { borderColor: "#CEB888" },
								"&.Mui-focused fieldset": { borderColor: "#CEB888" },
							},
						}}
						InputProps={{
							style: { color: "#CEB888" },
						}}
					/>

					<Button
						type="submit"
						variant="outlined"
						fullWidth
						sx={{
							marginTop: 2,
							color: "#CEB888",
							borderColor: "#CEB888",
							fontWeight: "bold",
							"&:hover": {
								backgroundColor: "#CEB888",
								color: "black",
							},
						}}
					>
						LOGIN
					</Button>
				</form>

				<ToastContainer position="top-center" autoClose={3000} />
			</Paper>
		</Box>
	);
};

export default Login;
