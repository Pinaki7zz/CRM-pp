import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Paperclip, ChevronDown } from "lucide-react";
import "./DisplayMeeting.css";
import ParticipantPopup from "./ParticipantPopup";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;

const DisplayMeeting = () => {
	const { id } = useParams();

	const [meeting, setMeeting] = useState(null);
	const [allUsers, setAllUsers] = useState([]);
	const [allContacts, setAllContacts] = useState([]);
	const [allLeads, setAllLeads] = useState([]);
	const [contactInfo, setContactInfo] = useState(null);
	const [accountInfo, setAccountInfo] = useState(null);

	const [popupOpen, setPopupOpen] = useState(false);
	const [menuModal, setMenuModal] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(true);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [editData, setEditData] = useState({
		fromDate: "",
		toDate: "",
		participants: [],
		participantsInput: "",
		description: "",
	});

	const formatDateTime = (d) => (d ? new Date(d).toLocaleString() : "");
	const formatDateTimeLocal = (d) => {
		if (!d) return "";
		const dt = new Date(d);
		dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
		return dt.toISOString().slice(0, 16);
	};

	// Fix: Account Owner display by user name
	const resolveUserName = (ownerId) => {
		if (!ownerId) return "";
		const user = allUsers.find((u) => u.id === ownerId);
		return user ? user.name : ownerId;
	};

	const fetchReferenceData = async () => {
		try {
			const [usersRes, contactsRes, leadsRes] = await Promise.all([
				fetch(`${BASE_URL_UM}/users/s-info`, {
					method: "GET",
					credentials: "include",
				}),
				fetch(`${BASE_URL_AC}/contact`),
				fetch(`${BASE_URL_LM}/leads`),
			]);
			if (usersRes.ok) setAllUsers(await usersRes.json());
			if (contactsRes.ok) setAllContacts(await contactsRes.json());
			if (leadsRes.ok) {
				const leadsData = await leadsRes.json();
				setAllLeads(
					leadsData.map((l) => ({
						id: l.leadId,
						name: `${l.firstName || ""} ${l.lastName || ""}`,
						email: l.email || "",
					}))
				);
			}
		} catch (err) {
			console.error("Failed to fetch reference data:", err);
		}
	};

	const fetchAccountByAccountId = async (accountId) => {
		try {
			if (!accountId) return;
			const listRes = await fetch(`${BASE_URL_AC}/account`);
			if (!listRes.ok) return;
			const list = await listRes.json();
			const match = list.find((a) => a.accountId === accountId);
			if (!match) return;
			const detailRes = await fetch(`${BASE_URL_AC}/account/${match.id}`);
			if (detailRes.ok) setAccountInfo(await detailRes.json());
		} catch (err) {
			console.error("Failed to fetch account:", err);
		}
	};

	const fetchContactByContactId = async (contactId) => {
		try {
			if (!contactId || !allContacts.length) return;
			const match = allContacts.find((c) => c.contactId === contactId);
			if (!match) {
				setContactInfo(null);
				return;
			}
			const res = await fetch(`${BASE_URL_AC}/contact/${match.id}`);
			if (res.ok) {
				const data = await res.json();
				setContactInfo(data);
				if (data.accountId) fetchAccountByAccountId(data.accountId);
			}
		} catch (err) {
			console.error("Failed to fetch contact:", err);
			setContactInfo(null);
		}
	};

	const fetchMeeting = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`${BASE_URL_AM}/meetings/${id}`);
			if (!res.ok) throw new Error("Failed to fetch meeting");
			const data = await res.json();
			setMeeting(data);
			setEditData({
				fromDate: data.fromDate || "",
				toDate: data.toDate || "",
				participants: data.participants || [],
				participantsInput: "",
				description: data.description || "",
			});
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (id) {
			fetchReferenceData();
			fetchMeeting();
		}
	}, [id]);

	useEffect(() => {
		if (meeting?.primaryContactId && allContacts.length)
			fetchContactByContactId(meeting.primaryContactId);
	}, [meeting, allContacts]);

	// ----- Participants edit/save/cancel logic -----
	const handleEditChange = (field, value) =>
		setEditData((p) => ({ ...p, [field]: value }));

	const handleParticipantsKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleAddParticipant();
		}
	};

	const handleAddParticipant = () => {
		const v = editData.participantsInput.trim();
		if (v && !editData.participants.includes(v)) {
			setEditData((p) => ({
				...p,
				participants: [...p.participants, v],
				participantsInput: "",
			}));
		}
	};

	const handleRemoveParticipant = (i) =>
		setEditData((p) => ({
			...p,
			participants: p.participants.filter((_, idx) => idx !== i),
		}));

	const handleAddParticipantsFromPopup = (arr) =>
		setEditData((p) => ({
			...p,
			participants: Array.from(new Set([...p.participants, ...arr])),
		}));

	const handleEdit = () => setIsReadOnly(false);

	const handleCancel = () => {
		setEditData({
			fromDate: meeting.fromDate || "",
			toDate: meeting.toDate || "",
			participants: meeting.participants || [],
			participantsInput: "",
			description: meeting.description || "",
		});
		setIsReadOnly(true);
	};

	const handleSave = async () => {
		try {
			if (
				!editData.fromDate ||
				!editData.toDate ||
				new Date(editData.fromDate) >= new Date(editData.toDate)
			) {
				alert("Check From / To dates");
				return;
			}
			const payload = {
				fromDate: new Date(editData.fromDate).toISOString(),
				toDate: new Date(editData.toDate).toISOString(),
				participants: editData.participants,
				description: editData.description,
			};
			const res = await fetch(`${BASE_URL_AM}/meetings/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				const e = await res.json();
				alert(e.message || "Save failed");
				return;
			}
			const updated = await res.json();
			setMeeting(updated.meeting || updated);
			setIsReadOnly(true);
			alert("Meeting updated");
		} catch (err) {
			alert("Network error");
		}
	};

	if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
	if (error) return <div style={{ padding: 20, color: "red" }}>{error}</div>;
	if (!meeting) return <div style={{ padding: 20 }}>Meeting not found</div>;

	return (
		<>
			{/* -------- HEADER -------- */}
			<div className="header-container">
				<div className="header-container-heading">
					<h1 className="tasks-heading">{meeting.subject}</h1>
				</div>

				<div className="header-container-buttons">
					<button className="send-email-button">Send Email</button>
					{isReadOnly ? (
						<button className="edit-button" onClick={handleEdit}>
							Edit
						</button>
					) : (
						<>
							<button
								className="save-button"
								onClick={handleSave}
							>
								Save
							</button>
							<button
								className="cancel-button"
								onClick={handleCancel}
							>
								Cancel
							</button>
						</>
					)}
					<div className="more-options-container">
						<button
							className="more-options-button"
							onClick={() => setMenuModal((p) => !p)}
						>
							⁞
						</button>
						{menuModal && (
							<div className="menu-modal-container">
								<div className="menu-modal">
									<ul className="menu-modal-list">
										<li>Submit for Approval</li>
										<li>Delete</li>
										<li>Print Preview</li>
										<li>Change Owner</li>
									</ul>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
			{/* -------- OVERVIEW -------- */}
			<div className="overview-container">
				<div className="overview-heading">
					<h1>Overview</h1>
				</div>
				<div className="overview-form">
					<form>
						<div className="form-group from">
							<label>From</label>
							{isReadOnly ? (
								<input
									value={formatDateTime(meeting.fromDate)}
									readOnly
								/>
							) : (
								<input
									type="datetime-local"
									value={formatDateTimeLocal(
										editData.fromDate
									)}
									onChange={(e) =>
										handleEditChange(
											"fromDate",
											e.target.value
										)
									}
								/>
							)}
						</div>
						<div className="form-group To">
							<label>To</label>
							{isReadOnly ? (
								<input
									value={formatDateTime(meeting.toDate)}
									readOnly
								/>
							) : (
								<input
									type="datetime-local"
									value={formatDateTimeLocal(editData.toDate)}
									onChange={(e) =>
										handleEditChange(
											"toDate",
											e.target.value
										)
									}
								/>
							)}
						</div>
					</form>
				</div>
			</div>
			{/* -------- PARTICIPANTS -------- */}
			<div className="notes-container">
				<div className="notes-heading">
					<div className="left">
						<h1>Participants</h1>
					</div>
				</div>
				<div className="participant-form">
					<form>
						{isReadOnly ? (
							<div className="form-group notes">
								<textarea
									value={(meeting.participants || []).join(
										", "
									)}
									readOnly
									rows="3"
								/>
							</div>
						) : (
							<div className="form-group participants-field">
								<label>Participants</label>
								<div className="participants-input-wrapper">
									<div className="participants-input-container">
										<input
											value={editData.participantsInput}
											onChange={(e) =>
												handleEditChange(
													"participantsInput",
													e.target.value
												)
											}
											onKeyDown={
												handleParticipantsKeyDown
											}
											placeholder="Enter participant name or email"
											className="form-input"
										/>
										<button
											type="button"
											className="add-participant-btn"
											onClick={() => setPopupOpen(true)}
										>
											+ Add
										</button>
									</div>
									<div className="participants-display-area">
										{editData.participants.length ? (
											<div className="participants-list">
												{editData.participants.map(
													(p, i) => (
														<span
															key={p + i}
															className="participant-chip"
														>
															{p}
															<button
																type="button"
																className="remove-participant-btn"
																onClick={() =>
																	handleRemoveParticipant(
																		i
																	)
																}
															>
																×
															</button>
														</span>
													)
												)}
											</div>
										) : (
											<div className="no-participants">
												No participants added yet
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					</form>
				</div>
			</div>
			{/* -------- NOTES -------- */}
			<div className="notes-container">
				<div className="notes-heading">
					<div className="left">
						<h1>Notes</h1>
					</div>
				</div>
				<div className="notes-form">
					<form>
						<div className="form-group notes">
							<label>Notes</label>
							<textarea
								value={
									isReadOnly
										? meeting.description
										: editData.description
								}
								onChange={
									isReadOnly
										? undefined
										: (e) =>
												handleEditChange(
													"description",
													e.target.value
												)
								}
								readOnly={isReadOnly}
							/>
						</div>
					</form>
				</div>
			</div>
			{/* -------- ACCOUNT INFO (with owner name fix) -------- */}
			<div className="account-information-container">
				<div className="account-information-heading">
					<div className="left">
						<h1>Account Information</h1>
					</div>
				</div>
				<div className="account-information-form">
					<form>
						<div className="form-group accountid">
							<label>Account ID</label>
							<input
								value={accountInfo?.accountId || ""}
								readOnly
							/>
						</div>
						<div className="form-group accountname">
							<label>Account Name</label>
							<input
								value={
									accountInfo?.name ||
									accountInfo?.accountName ||
									""
								}
								readOnly
							/>
						</div>
						<div className="form-group website">
							<label>Website</label>
							<input
								value={accountInfo?.website || ""}
								readOnly
							/>
						</div>
						<div className="form-group accounttype">
							<label>Account Type</label>
							<input
								value={
									accountInfo?.type ||
									accountInfo?.accountType ||
									""
								}
								readOnly
							/>
						</div>
						<div className="form-group accountowner">
							<label>Account Owner</label>
							<input
								value={resolveUserName(accountInfo?.ownerId)}
								readOnly
							/>
						</div>
						<div className="form-group industry">
							<label>Industry</label>
							<input
								value={accountInfo?.industry || ""}
								readOnly
							/>
						</div>
						<div className="form-group parentaccount">
							<label>Parent Account</label>
							<input
								value={accountInfo?.parentAccountId || ""}
								readOnly
							/>
						</div>
						<div className="form-group role">
							<label>Role</label>
							<input value={accountInfo?.role || ""} readOnly />
						</div>
						<div className="form-group notes">
							<label>Notes</label>
							<textarea
								value={accountInfo?.note || ""}
								readOnly
							/>
						</div>
					</form>
				</div>
			</div>
			{/* -------- CONTACT INFO -------- */}
			<div className="contact-information-container">
				<div className="contact-information-heading">
					<div className="left">
						<h1>Contact Information</h1>
					</div>
				</div>
				<div className="contact3-information-form">
					<form>
						<div className="form-group emailid3">
							<label>Email ID</label>
							<input value={contactInfo?.email || ""} readOnly />
						</div>
						<div className="form-group secondaryemail3">
							<label>Secondary Email</label>
							<input
								value={contactInfo?.secondaryEmail || ""}
								readOnly
							/>
						</div>
						<div className="form-group phoneno3">
							<label>Phone No.</label>
							<input value={contactInfo?.phone || ""} readOnly />
						</div>
						<div className="form-group mobileno3">
							<label>Mobile No.</label>
							<input value={contactInfo?.mobile || ""} readOnly />
						</div>
						<div className="form-group fax3">
							<label>Fax</label>
							<input value={contactInfo?.fax || ""} readOnly />
						</div>
						<div className="form-group website3">
							<label>Website</label>
							<input
								value={contactInfo?.website || ""}
								readOnly
							/>
						</div>
						<div className="form-group addressline13">
							<label>Address Line 1</label>
							<input
								value={contactInfo?.billingAddressLine1 || ""}
								readOnly
							/>
						</div>
						<div className="form-group addressline23">
							<label>Address Line 2</label>
							<input
								value={contactInfo?.billingAddressLine2 || ""}
								readOnly
							/>
						</div>
						<div className="form-group city3">
							<label>City</label>
							<input
								value={contactInfo?.billingCity || ""}
								readOnly
							/>
						</div>
						<div className="form-group state3">
							<label>State</label>
							<input
								value={contactInfo?.billingState || ""}
								readOnly
							/>
						</div>
						<div className="form-group country3">
							<label>Country</label>
							<input
								value={contactInfo?.billingCountry || ""}
								readOnly
							/>
						</div>
						<div className="form-group zipcode3">
							<label>ZIP Code</label>
							<input
								value={
									contactInfo?.billingZipCode ||
									contactInfo?.zipCode ||
									""
								}
								readOnly
							/>
						</div>
					</form>
				</div>
			</div>
			{/* -------- ATTACHMENTS -------- */}
			<div className="attachment1-section-container">
				<div className="attachment1-section-heading">
					<h1>Attachments</h1>
					<button>
						Attach <Paperclip size={15} />
					</button>
				</div>
				<div className="attachment1-section-table">
					<div className="table-container">
						{[
							"File Name",
							"Attached By",
							"Date Added",
							"File Size",
						].map((h, i) => (
							<div className="table-column" key={h}>
								<h1>
									{h} <ChevronDown size={15} />
								</h1>
								<p>{i + 1}</p>
							</div>
						))}
					</div>
				</div>
			</div>
			{/* -------- PARTICIPANT POPUP -------- */}
			<ParticipantPopup
				open={popupOpen}
				contacts={allContacts}
				leads={allLeads}
				users={allUsers}
				selectedParticipants={editData.participants}
				onAddParticipants={handleAddParticipantsFromPopup}
				onClose={() => setPopupOpen(false)}
			/>
		</>
	);
};

export default DisplayMeeting;
