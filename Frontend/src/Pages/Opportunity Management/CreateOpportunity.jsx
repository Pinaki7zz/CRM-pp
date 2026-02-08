import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Save, CircleX } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./CreateOpportunity.css";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

const CreateOpportunity = () => {
	const [formData, setFormData] = useState({
		opportunityOwnerId: "",
		accountId: "",
		primaryContactId: "",
		startDate: "",
		endDate: "",
		name: "",
		stage: "",
		amount: "",
		status: "OPEN",
		type: "",
		probability: "",
		leadSource: "",
		description: "",
		contactName: "",
	});
	const [accounts, setAccounts] = useState([]);
	const [availableContacts, setAvailableContacts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({}); // { opportunityOwnerId: "Owner ID is required", name: "..." }

	const navigate = useNavigate();
	const { user } = useAuth(); // if provider exposes loading

	const getError = (field) => {
		const e = errors[field];
		if (!e) return null;
		// if array join, else return string
		return Array.isArray(e) ? e.join(", ") : e;
	};

	const STAGE_PROBABILITY_MAP = {
		QUALIFICATION: 10,
		NEEDS_ANALYSIS: 30,
		VALUE_PROPORTION: 50,
		PRICE_QUOTE: 70,
		NEGOTIATION: 90,
		CLOSED_WON: 100,
		CLOSED_LOST: 0,
	};

	const fetchAllAccounts = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/ids-names`);
			if (!res.ok) {
				toast.error("Failed to fetch accounts");
				return;
			}
			const data = await res.json();
			// 🔠 Sort alphabetically by name
			const sortedAccounts = data.sort((a, b) =>
				a.name.localeCompare(b.name),
			);
			setAccounts(sortedAccounts);
		} catch (err) {
			console.error("Error fetching accounts:", err);
			toast.error("Error fetching accounts");
		}
	};

	useEffect(() => {
		fetchAllAccounts();
	}, []);

	useEffect(() => {
		if (user && user.id) {
			setFormData((prev) => ({
				...prev,
				opportunityOwnerId: user.id,
			}));
		}
	}, [user]);

	const handleChange = (e) => {
		const { id, value } = e.target;

		// 👇 If changing account, find contacts
		if (id === "accountId") {
			const selectedAccount = accounts.find(
				(acc) => acc.accountId === value,
			);

			if (selectedAccount) {
				setAvailableContacts(selectedAccount.contacts || []);

				// 👇 Auto-select primary contact if exists
				const primary = selectedAccount.contacts?.find(
					(c) => c.isPrimary,
				);
				setFormData((prev) => ({
					...prev,
					accountId: value,
					primaryContactId: primary?.contactId || "",
				}));
				return;
			}
		}

		if (id === "primaryContactId") {
			const selectedContact = availableContacts.find(
				(c) => c.contactId === value,
			);
			const fullName = selectedContact
				? `${selectedContact.firstName} ${selectedContact.lastName}`
				: "";

			setFormData((prev) => ({
				...prev,
				primaryContactId: value,
				contactName: fullName,
			}));
			return;
		}

		if (id === "stage") {
			const selectedProbability = STAGE_PROBABILITY_MAP[value] ?? "";
			setFormData((prev) => ({
				...prev,
				stage: value,
				probability: selectedProbability, // auto-populate
			}));
			return;
		}

		// clear a single field error as soon as user edits it
		setErrors((prev) => {
			if (!prev || !prev[id]) return prev;
			const copy = { ...prev };
			delete copy[id];
			return copy;
		});

		// Regular update
		setFormData((prev) => ({
			...prev,
			[id]: value,
		}));
	};

	const handleSave = async (type) => {
		try {
			setLoading(true);

			const payload = {
				...formData,
				amount: parseFloat(formData.amount || 0),
				probability: parseFloat(formData.probability || 0),
				startDate: formData.startDate
					? new Date(formData.startDate).toISOString()
					: null,
				endDate: formData.endDate
					? new Date(formData.endDate).toISOString()
					: null,
			};

			// ⬇️ normalize enums
			if (!payload.type) payload.type = null;
			if (!payload.leadSource) payload.leadSource = null;

			const response = await fetch(`${BASE_URL_SM}/opportunity`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				// try parse validation errors (400)
				const payload = await response.json().catch(() => null);

				if (payload && Array.isArray(payload.errors)) {
					// Build map: { path: [msg1, msg2] }
					const map = {};
					payload.errors.forEach((err) => {
						const key = err.path || "form";
						if (!map[key]) map[key] = [];
						map[key].push(err.msg || "Invalid value");
					});
					setErrors(map);
					toast.error("Validation failed");
					return;
				}

				// fallback generic error
				toast.error("Failed to save opportunity");
				return;
			}

			// success: clear errors & handle navigation
			setErrors({});

			toast.success("Opportunity created successfully!");

			if (type === "save") {
				navigate("/sales/opportunities");
			} else if (type === "saveAndNew") {
				setFormData({
					opportunityOwnerId: "",
					accountId: "",
					primaryContactId: "",
					startDate: "",
					endDate: "",
					name: "",
					stage: "",
					amount: "",
					status: "",
					type: "",
					probability: "",
					leadSource: "",
					description: "",
					contactName: "",
				});
				setAvailableContacts([]);
			}
		} catch (err) {
			console.error("Error saving opportunity", err);
			toast.error("Error saving opportunity");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="opp-create-container">
			{/* Create Sales Quotes Page Header Section */}
			<div className="opp-create-header-container">
				<h1 className="opp-create-heading">Create Opportunity</h1>
				<div className="opp-create-header-container-buttons">
					<button
						className="opp-create-save-button"
						onClick={() => handleSave("save")}
					>
						<Save size={17} strokeWidth={1} color="#dcf2f1" />
						{loading ? "Saving..." : "Save"}
					</button>
					<button
						className="opp-create-save-and-new-button"
						onClick={() => handleSave("saveAndNew")}
					>
						<Save size={17} strokeWidth={1} color="#0f1035" />
						{loading ? "Saving..." : "Save and New"}
					</button>
					<button
						className="opp-create-cancel-button"
						onClick={() => navigate("/sales/sales-quote")}
					>
						<CircleX size={17} strokeWidth={1} color="#0f1035" />
						Cancel
					</button>
				</div>
			</div>

			{/* Opportunity Information Container */}
			<div className="opp-create-form-container">
				<h1 className="opp-create-form-heading">
					Opportunity Information
				</h1>
				<div className="opp-create-form">
					<form>
						<div className="opp-create-form-row">
							<div className="opp-create-form-group opportunityOwnerId">
								<label htmlFor="opportunityOwnerId">
									Opportunity Owner *
								</label>
								<input
									type="text"
									id="opportunityOwnerId"
									placeholder="Enter Opportunity Owner"
									value={
										user
											? `${user.firstName} ${user.lastName} (You)`
											: "--"
									}
									disabled
								/>
								{getError("opportunityOwnerId") && (
									<div className="field-error">
										{getError("opportunityOwnerId")}
									</div>
								)}
							</div>
							<div className="opp-create-form-group name">
								<label htmlFor="name">Opportunity Name *</label>
								<input
									type="text"
									placeholder="Opportunity Name"
									id="name"
									value={formData.name}
									onChange={handleChange}
								/>
								{getError("name") && (
									<div className="field-error">
										{getError("name")}
									</div>
								)}
							</div>
						</div>
						<div className="opp-create-form-row">
							<div className="opp-create-form-group accountId">
								<label htmlFor="accountId">
									Account Name *
								</label>
								<select
									id="accountId"
									value={formData.accountId}
									onChange={handleChange}
								>
									<option value="">Select Account</option>
									{accounts.map((acc) => (
										<option
											key={acc.accountId}
											value={acc.accountId}
										>
											{acc.name}
										</option>
									))}
								</select>
								{getError("accountId") && (
									<div className="field-error">
										{getError("accountId")}
									</div>
								)}
							</div>
							<div className="opp-create-form-group primaryContactId">
								<label htmlFor="primaryContactId">
									Primary Contact *
								</label>
								<select
									id="primaryContactId"
									value={formData.primaryContactId}
									onChange={handleChange}
								>
									<option value="">Select Contact</option>
									{availableContacts
										.sort((a, b) =>
											`${a.firstName} ${a.lastName}`.localeCompare(
												`${b.firstName} ${b.lastName}`,
											),
										)
										.map((contact) => (
											<option
												key={contact.contactId}
												value={contact.contactId}
											>
												{contact.firstName}{" "}
												{contact.lastName}
												{contact.isPrimary
													? " (Primary)"
													: ""}
											</option>
										))}
								</select>
								{getError("primaryContactId") && (
									<div className="field-error">
										{getError("primaryContactId")}
									</div>
								)}
							</div>
						</div>
						<div className="opp-create-form-row">
							<div className="opp-create-form-group startDate">
								<label htmlFor="startDate">Start Date *</label>
								<input
									type="date"
									placeholder="Start Date"
									id="startDate"
									value={formData.startDate}
									onChange={handleChange}
								/>
								{getError("startDate") && (
									<div className="field-error">
										{getError("startDate")}
									</div>
								)}
							</div>
							<div className="opp-create-form-group endDate">
								<label htmlFor="endDate">End Date *</label>
								<input
									type="date"
									placeholder="End Date"
									id="endDate"
									value={formData.endDate}
									min={formData.startDate || ""}
									onChange={handleChange}
								/>
								{getError("endDate") && (
									<div className="field-error">
										{getError("endDate")}
									</div>
								)}
							</div>
						</div>
						<div className="opp-create-form-row">
							<div className="opp-create-form-group stage">
								<label htmlFor="stage">Stage *</label>
								<select
									id="stage"
									value={formData.stage}
									onChange={handleChange}
								>
									<option value="">Select Stage</option>
									<option value="QUALIFICATION">
										Qualification
									</option>
									<option value="NEEDS_ANALYSIS">
										Needs Analysis
									</option>
									<option value="VALUE_PROPORTION">
										Value Proportion
									</option>
									<option value="PRICE_QUOTE">
										Price Quote
									</option>
									<option value="NEGOTIATION">
										Negotiation
									</option>
									<option value="CLOSED_WON">
										Closed Won
									</option>
									<option value="CLOSED_LOST">
										Closed Lost
									</option>
								</select>
								{getError("stage") && (
									<div className="field-error">
										{getError("stage")}
									</div>
								)}
							</div>
							<div className="opp-create-form-group amount">
								<label htmlFor="amount">Amount</label>
								<input
									type="text"
									placeholder="Amount"
									id="amount"
									value={formData.amount}
									onChange={handleChange}
								/>
								{getError("amount") && (
									<div className="field-error">
										{getError("amount")}
									</div>
								)}
							</div>
						</div>
						<div className="opp-create-form-row">
							<div className="opp-create-form-group status">
								<label htmlFor="status">Status *</label>
								<select
									id="status"
									value={formData.status}
									onChange={handleChange}
								>
									<option value="">Select Status</option>
									<option value="OPEN">Open</option>
									<option value="IN_PROGRESS">
										In Progress
									</option>
									<option value="COMPLETED">Completed</option>
									<option value="CANCELLED">Cancelled</option>
								</select>
								{getError("status") && (
									<div className="field-error">
										{getError("status")}
									</div>
								)}
							</div>
							<div className="opp-create-form-group leadSource">
								<label htmlFor="leadSource">Lead Source</label>
								<select
									id="leadSource"
									value={formData.leadSource}
									onChange={handleChange}
								>
									<option value="">Select Lead Source</option>
									<option value="EMAIL">Email</option>
									<option value="WEB">Web</option>
									<option value="CALL">Call</option>
									<option value="REFERRAL">Referral</option>
									<option value="SOCIAL_MEDIA">
										Social Media
									</option>
								</select>
								{getError("leadSource") && (
									<div className="field-error">
										{getError("leadSource")}
									</div>
								)}
							</div>
						</div>
						<div className="opp-create-form-row">
							<div className="opp-create-form-group probability">
								<label htmlFor="probability">
									Probability %
								</label>
								<input
									type="text"
									placeholder="Probability"
									id="probability"
									value={formData.probability}
									onChange={handleChange}
									min={0}
									max={100}
								/>
								{getError("probability") && (
									<div className="field-error">
										{getError("probability")}
									</div>
								)}
							</div>
							<div className="opp-create-form-group type">
								<label htmlFor="type">Type</label>
								<select
									id="type"
									value={formData.type}
									onChange={handleChange}
								>
									<option value="">Select Type</option>
									<option value="NEW_BUSINESS">
										New Business
									</option>
									<option value="EXISTING_BUSINESS">
										Existing Business
									</option>
								</select>
								{getError("type") && (
									<div className="field-error">
										{getError("type")}
									</div>
								)}
							</div>
						</div>
						<div className="opp-create-form-row">
							<div className="opp-create-form-group description">
								<label htmlFor="description">Description</label>
								<textarea
									placeholder="Add description here..."
									id="description"
									value={formData.description}
									onChange={handleChange}
								/>
								{getError("description") && (
									<div className="field-error">
										{getError("description")}
									</div>
								)}
							</div>
						</div>

						<span className="required-field-text">
							* Required Field
						</span>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateOpportunity;
