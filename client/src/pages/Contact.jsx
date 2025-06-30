import React, { useState } from "react";
import {
	TextField,
	Button,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Typography,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Contact.css";

// Inline version of ExpandMoreIcon (MUI SVG)
const ExpandMoreIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24"
		viewBox="0 0 24 24"
		width="24"
		fill="currentColor"
	>
		<path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
	</svg>
);

const Contact = () => {
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!email || !message) return;

		try {
			const res = await fetch("http://localhost:8080/api/feedback", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, message }),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success("Message submitted successfully!");
				setEmail("");
				setMessage("");
			} else {
				toast.error(data.error || "Submission failed.");
			}
		} catch (err) {
			toast.error("Server error.");
		}
	};

	const isFormValid = email.trim() !== "" && message.trim() !== "";

	return (
		<div className="contact-wrapper">
			<div className="contact-form-section">
				<h1 className="contact-title">Contact Us</h1>
				<p className="contact-subtitle">
					Have feedback or questions? We'd love to hear from you!
				</p>

				<form onSubmit={handleSubmit} className="contact-form">
					<TextField
						placeholder="Email"
						type="email"
						fullWidth
						variant="outlined"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						InputProps={{ className: "contact-input" }}
					/>

					<TextField
						placeholder="Let us know your thoughts!"
						multiline
						rows={5}
						fullWidth
						variant="outlined"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						InputProps={{ className: "contact-input" }}
					/>

					<Button
						type="submit"
						variant="contained"
						className={`contact-button ${!isFormValid ? "disabled" : ""}`}
						disabled={!isFormValid}
					>
						Send Message
					</Button>
				</form>

				<div className="contact-footer">
					<h4>Other Ways to Reach Us</h4>
					<p>Email: support@boilerlist.com</p>
				</div>
			</div>

			<div className="faq-section">
				<h2 className="faq-title">FAQs</h2>

				<Accordion>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>How do I upload a listing?</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							Click "Upload Item" in the navbar and fill out the form to post your item.
						</Typography>
					</AccordionDetails>
				</Accordion>

				<Accordion>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>How do I contact a seller?</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							You can message the seller directly from the item's listing page.
						</Typography>
					</AccordionDetails>
				</Accordion>

				<Accordion>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography>What if I see an inappropriate listing?</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<Typography>
							Click the flag icon on the listing to report it to our moderation team.
						</Typography>
					</AccordionDetails>
				</Accordion>
			</div>

			<ToastContainer />
		</div>
	);
};

export default Contact;
