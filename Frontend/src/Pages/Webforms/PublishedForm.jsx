import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const PublishedForm = () => {
	const { url } = useParams();
	const [formDef, setFormDef] = useState(null);
	const [fields, setFields] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		fetch(`${BASE_URL_CM}/webforms/${url}`)
			.then((res) => {
				if (!res.ok) throw new Error("Form not found");
				return res.json();
			})
			.then((data) => {
				if (data.success) {
					setFormDef(data.data);
				} else {
					setError(data.message);
				}
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, [url]);

	const handleChange = (e) => {
		setFields({ ...fields, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(
				`${BASE_URL_CM}/lead-form-submissions`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						webformId: formDef.id,
						fields,
					}),
				}
			);

			const result = await response.json();

			if (result.success) {
				setSubmitted(true);

				// Handle post-submission action
				if (
					formDef.actionOnSubmission === "redirect" &&
					formDef.customRedirectUrl
				) {
					setTimeout(() => {
						window.location.href = formDef.customRedirectUrl;
					}, 2000);
				}
			} else {
				alert("Error submitting form: " + result.message);
			}
		} catch (error) {
			console.error("Submission error:", error);
			alert("Failed to submit form");
		}
	};

	if (loading)
		return (
			<div style={{ padding: "40px", textAlign: "center" }}>
				Loading...
			</div>
		);
	if (error)
		return (
			<div style={{ padding: "40px", textAlign: "center", color: "red" }}>
				Error: {error}
			</div>
		);
	if (!formDef)
		return (
			<div style={{ padding: "40px", textAlign: "center" }}>
				Form not found
			</div>
		);

	if (submitted) {
		return (
			<div
				style={{
					padding: "40px",
					textAlign: "center",
					maxWidth: "600px",
					margin: "0 auto",
					marginTop: "100px",
					border: "1px solid #ddd",
					borderRadius: "8px",
				}}
			>
				<h2 style={{ color: "#4CAF50", marginBottom: "20px" }}>
					{formDef.actionOnSubmission === "splash" ||
					formDef.actionOnSubmission === "thankyou"
						? formDef.thankYouMessage
						: "Form Submitted Successfully!"}
				</h2>
				{formDef.actionOnSubmission === "redirect" &&
					formDef.customRedirectUrl && <p>Redirecting...</p>}
			</div>
		);
	}

	return (
		<div
			style={{
				padding: "40px",
				maxWidth: "600px",
				margin: "0 auto",
				marginTop: "50px",
				border: "1px solid #ddd",
				borderRadius: "8px",
				boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
			}}
		>
			<form onSubmit={handleSubmit}>
				<h2 style={{ marginBottom: "30px", color: "#333" }}>
					{formDef.name}
				</h2>

				{formDef.fields &&
					formDef.fields.map((field, index) => (
						<div key={index} style={{ marginBottom: "20px" }}>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontWeight: "500",
									color: "#555",
								}}
							>
								{field.label}
								{field.required && (
									<span style={{ color: "red" }}> *</span>
								)}
							</label>

							{field.label === "Email Opt Out" ? (
								<input
									name={field.label}
									type="checkbox"
									onChange={(e) =>
										setFields({
											...fields,
											[field.label]: e.target.checked,
										})
									}
									style={{
										width: "20px",
										height: "20px",
									}}
								/>
							) : field.label === "Description" ? (
								<textarea
									name={field.label}
									onChange={handleChange}
									required={field.required}
									rows={4}
									style={{
										width: "100%",
										padding: "10px",
										border: "1px solid #ddd",
										borderRadius: "4px",
										fontSize: "14px",
									}}
								/>
							) : (
								<input
									name={field.label}
									type={field.type || "text"}
									onChange={handleChange}
									required={field.required}
									style={{
										width: "100%",
										padding: "10px",
										border: "1px solid #ddd",
										borderRadius: "4px",
										fontSize: "14px",
									}}
								/>
							)}
						</div>
					))}

				<button
					type="submit"
					style={{
						backgroundColor: "#4CAF50",
						color: "white",
						padding: "12px 30px",
						border: "none",
						borderRadius: "4px",
						fontSize: "16px",
						cursor: "pointer",
						marginTop: "10px",
					}}
				>
					Submit
				</button>
			</form>
		</div>
	);
};

export default PublishedForm;
