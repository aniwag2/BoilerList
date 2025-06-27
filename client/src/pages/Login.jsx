import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/user";
import { UserContext } from "../UserContext";
import PurdueLogo from "../assets/PurdueLogo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./Register.css"; 

const Login = () => {
	const navigate = useNavigate();
	const { setUser } = useContext(UserContext);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const res = await login({ username, password });

			if (res.error) {
				setError("Incorrect username or password.");
			} else {
				toast.success("Login successful!");
				setUser(res.username);
				navigate("/listings");
			}
		} catch (err) {
			setError("Something went wrong.");
		}
	};

	return (
		<div className="register-container">
			<img src={PurdueLogo} alt="Purdue Logo" className="purdue-logo" />

			<h2 className="form-title">Login</h2>

			{error && <div className="error-message">{error}</div>}

			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<input
						type="text"
						placeholder="USERNAME"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>

				<div className="form-group">
					<input
						type="password"
						placeholder="PASSWORD"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>

				<button type="submit">Login</button>
			</form>

			<ToastContainer position="top-center" autoClose={3000} />
		</div>
	);
};

export default Login;
