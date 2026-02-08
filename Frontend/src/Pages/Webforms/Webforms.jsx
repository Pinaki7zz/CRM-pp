import { useState, useEffect } from "react";
import { Filter, RefreshCw, ChevronDown, Search } from "lucide-react";
import SelectWebform from "./SelectWebform";
import LeadsForm from "./LeadsForm";
import ContactsForm from "./ContactsForm";
import CasesForm from "./CasesForm";
import "./Webforms.css";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const Webforms = () => {
	const [showSelectCreator, setShowSelectCreator] = useState(false);
	const [showLeadsForm, setShowLeadsForm] = useState(false);
	const [showContactsForm, setShowContactsForm] = useState(false);
	const [showCasesForm, setShowCasesForm] = useState(false);
	const [webforms, setWebforms] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedModule, setSelectedModule] = useState("Leads");
	const [editingWebform, setEditingWebform] = useState(null);
	const [newFormName, setNewFormName] = useState("");

	useEffect(() => {
		fetchWebforms();
	}, []);

	const fetchWebforms = async () => {
		try {
			const response = await fetch(`${BASE_URL_CM}/webforms`);
			const result = await response.json();
			if (result.success) {
				setWebforms(result.data);
			}
			setLoading(false);
		} catch (error) {
			console.error("Error fetching webforms:", error);
			setLoading(false);
		}
	};

	const handleCreateCustom = () => setShowSelectCreator(true);

	const handleCancel = () => {
		setShowSelectCreator(false);
		setShowLeadsForm(false);
		setShowContactsForm(false);
		setShowCasesForm(false);
		setEditingWebform(null);
		setNewFormName("");
		fetchWebforms(); // Refresh list
	};

	const handlePreBuilt = () => {
		alert("Pre-Built Webform clicked!");
	};

	const handleDisplay = (webform) => {
		setEditingWebform(webform);

		// Open the appropriate form based on module
		if (webform.module === "Leads") {
			setShowLeadsForm(true);
		} else if (webform.module === "Contacts") {
			setShowContactsForm(true);
		} else if (webform.module === "Cases") {
			setShowCasesForm(true);
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this webform?")) {
			try {
				const response = await fetch(`${BASE_URL_CM}/webforms/${id}`, {
					method: "DELETE",
				});

				const result = await response.json();
				if (result.success) {
					alert("Webform deleted successfully!");
					fetchWebforms(); // Refresh list
				} else {
					alert("Error: " + result.message);
				}
			} catch (error) {
				console.error("Error deleting webform:", error);
				alert("Failed to delete webform");
			}
		}
	};

	const toggleStatus = async (id, currentStatus) => {
		try {
			const response = await fetch(`${BASE_URL_CM}/webforms/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isActive: !currentStatus }),
			});

			const result = await response.json();
			if (result.success) {
				fetchWebforms(); // Refresh list
			}
		} catch (error) {
			console.error("Error toggling status:", error);
		}
	};

	const filteredWebforms = webforms.filter(
		(wf) => wf.module === selectedModule
	);

	// If any form is open, show only that
	if (showLeadsForm) {
		return (
			<LeadsForm
				onCancel={handleCancel}
				editData={editingWebform}
				initialFormName={newFormName}
			/>
		);
	}
	if (showContactsForm) {
		return (
			<ContactsForm
				onCancel={handleCancel}
				editData={editingWebform}
				initialFormName={newFormName}
			/>
		);
	}
	if (showCasesForm) {
		return (
			<CasesForm
				onCancel={handleCancel}
				editData={editingWebform}
				initialFormName={newFormName}
			/>
		);
	}

	return (
		<div style={{ position: "relative" }}>
			<div
				className={`webforms-container${
					showSelectCreator ? " webforms-blur" : ""
				}`}
			>
				{!showSelectCreator ? (
					<>
						<div className="webforms-header">
							<h1>Webforms</h1>
							<div className="dropdown">
								<select
									value={selectedModule}
									onChange={(e) =>
										setSelectedModule(e.target.value)
									}
									style={{
										padding: "8px 12px",
										borderRadius: "4px",
										border: "1px solid #ddd",
										fontSize: "14px",
									}}
								>
									<option value="Leads">Leads</option>
									<option value="Contacts">Contacts</option>
									<option value="Cases">Cases</option>
								</select>
							</div>
							<button
								onClick={handleCreateCustom}
								style={{
									padding: "10px 20px",
									background: "#4F46E5",
									color: "white",
									border: "none",
									borderRadius: "6px",
									cursor: "pointer",
									fontSize: "14px",
									fontWeight: "500",
								}}
							>
								New Form
							</button>
						</div>

						<div className="webforms-content">
							{/* Always show the Create Custom and Pre-Built boxes */}
							<div className="webforms-options">
								<div
									className="option-box create-custom"
									onClick={handleCreateCustom}
								>
									<h1>Create Custom Webform</h1>
									<p>
										Create custom web forms to capture lead
										data into your CRM system.
									</p>
									<div className="custom-webform-container">
										<div className="webform-icon">
											<span className="icon-wrapper">
												+
											</span>
										</div>
									</div>
								</div>

								<div
									className="option-box pre-built"
									onClick={handlePreBuilt}
								>
									<h1>Pre-Built Webform</h1>
									<p>
										Select any one of the pre-built web
										forms to seamlessly push data into your
										CRM system.
									</p>
									<div className="pre-built-container">
										<div className="webform-icon pre-built-icon">
											<span className="icon-wrapper">
												&#10003;
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Show table below if there are webforms */}
							{filteredWebforms.length > 0 && (
								<div className="webforms-table-container">
									<table className="webforms-table">
										<thead>
											<tr>
												<th>Forms</th>
												<th>Created By</th>
												<th>Status</th>
												<th>Actions</th>
											</tr>
										</thead>
										<tbody>
											{filteredWebforms.map((webform) => (
												<tr key={webform.id}>
													<td>
														<div>
															<div
																style={{
																	fontWeight:
																		"500",
																	marginBottom:
																		"4px",
																}}
															>
																{webform.name}
															</div>
															<div
																style={{
																	fontSize:
																		"12px",
																	color: "#666",
																	background:
																		"#f0f0f0",
																	padding:
																		"2px 8px",
																	borderRadius:
																		"4px",
																	display:
																		"inline-block",
																}}
															>
																Standard
															</div>
														</div>
													</td>
													<td>
														<div
															style={{
																display: "flex",
																alignItems:
																	"center",
																gap: "8px",
															}}
														>
															<div
																style={{
																	width: "32px",
																	height: "32px",
																	borderRadius:
																		"50%",
																	background:
																		"#e0e0e0",
																	display:
																		"flex",
																	alignItems:
																		"center",
																	justifyContent:
																		"center",
																}}
															>
																👤
															</div>
															<span>
																{new Date(
																	webform.createdAt
																).toLocaleDateString(
																	"en-US",
																	{
																		month: "short",
																		day: "numeric",
																		year: "numeric",
																	}
																)}
															</span>
														</div>
													</td>
													<td>
														<label className="toggle-switch">
															<input
																type="checkbox"
																checked={
																	webform.isActive
																}
																onChange={() =>
																	toggleStatus(
																		webform.id,
																		webform.isActive
																	)
																}
															/>
															<span className="toggle-slider"></span>
														</label>
													</td>
													<td>
														<div
															style={{
																display: "flex",
																gap: "8px",
															}}
														>
															<button
																onClick={() =>
																	handleDisplay(
																		webform
																	)
																}
																className="action-btn display-btn"
															>
																Display
															</button>
															<button
																onClick={() =>
																	handleDelete(
																		webform.id
																	)
																}
																className="action-btn delete-btn"
															>
																Delete
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</>
				) : null}
			</div>
			{showSelectCreator && (
				<SelectWebform
					onCancel={handleCancel}
					onShowLeadsForm={(formName) => {
						setShowSelectCreator(false);
						setNewFormName(formName);
						setShowLeadsForm(true);
					}}
					onShowContactsForm={(formName) => {
						setShowSelectCreator(false);
						setNewFormName(formName);
						setShowContactsForm(true);
					}}
					onShowCasesForm={(formName) => {
						setShowSelectCreator(false);
						setNewFormName(formName);
						setShowCasesForm(true);
					}}
				/>
			)}
		</div>
	);
};

export default Webforms;
