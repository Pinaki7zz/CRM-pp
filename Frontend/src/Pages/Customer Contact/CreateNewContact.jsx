import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Save, FilePlus, CircleX, Camera, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./CreateNewContact.css";

const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

// File size constants
const MIN_IMAGE_SIZE = 250 * 1024; // 250 KB
const MAX_IMAGE_SIZE = 600 * 1024; // 600 KB

const initialFormData = {
	accountId: "",
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	department: "",
	contactStatus: "Active",
	role: "", // Mapped to Job Title
	note: "",
	// Billing
	billingAddressLine1: "",
	billingAddressLine2: "",
	billingCity: "",
	billingState: "",
	billingCountry: "",
	billingZipCode: "",
	// Shipping
	shippingAddressLine1: "",
	shippingAddressLine2: "",
	shippingCity: "",
	shippingState: "",
	shippingCountry: "",
	shippingZipCode: "",
	isPrimary: false,
};

const CreateNewContact = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	
	// Refs and State for Image Upload
	const fileInputRef = useRef(null);
	const [profileImage, setProfileImage] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false); 

	const [formData, setFormData] = useState(initialFormData);
	const [allAccounts, setAllAccounts] = useState([]);
	const [accountMap, setAccountMap] = useState({});
	const [contactOwnerName, setContactOwnerName] = useState("");

	// 1. Set Contact Owner
	useEffect(() => {
		if (user) {
			const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || user.username || "Current User";
			setContactOwnerName(fullName);
		}
	}, [user]);

	// 2. Fetch Accounts
	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				const res = await fetch(`${BASE_URL_AC}/account`);
				if (!res.ok) throw new Error("Failed to fetch accounts");
				const data = await res.json();
				setAllAccounts(data);
				const map = {};
				data.forEach((a) => (map[a.accountId] = a));
				setAccountMap(map);
			} catch (err) {
				console.error(err);
				toast.error("Error fetching accounts");
			}
		};
		fetchAccounts();
	}, []);

	// Handle Image Selection with Range Validation
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validation: Must be between 250KB and 600KB
			if (file.size < MIN_IMAGE_SIZE || file.size > MAX_IMAGE_SIZE) {
				toast.warn("Image size must be between 250KB and 600KB.");
				e.target.value = ""; // Reset input
				return;
			}
			
			setProfileImage(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleChange = (e) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));

		// Auto-populate addresses from Account
		if (id === "accountId") {
			const acc = accountMap[value];
			if (acc) {
				setFormData((prev) => ({
					...prev,
					accountId: value,
					// Billing
					billingAddressLine1: acc.billingAddressLine1 || "",
					billingAddressLine2: acc.billingAddressLine2 || "",
					billingCity: acc.billingCity || "",
					billingState: acc.billingState || "",
					billingCountry: acc.billingCountry || "",
					billingZipCode: acc.billingZipCode || "",
					// Shipping (Fallback to billing if empty)
					shippingAddressLine1: acc.shippingAddressLine1 || acc.billingAddressLine1 || "",
					shippingAddressLine2: acc.shippingAddressLine2 || acc.billingAddressLine2 || "",
					shippingCity: acc.shippingCity || acc.billingCity || "",
					shippingState: acc.shippingState || acc.billingState || "",
					shippingCountry: acc.shippingCountry || acc.billingCountry || "",
					shippingZipCode: acc.shippingZipCode || acc.billingZipCode || "",
				}));
			}
		}
	};

	const validateForm = () => {
		if (!formData.firstName.trim()) { toast.warn("First Name is required"); return false; }
		if (!formData.lastName.trim()) { toast.warn("Last Name is required"); return false; }
		if (!formData.email.trim()) { toast.warn("Email is required"); return false; }
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { toast.warn("Invalid email format"); return false; }
		return true;
	};

	const handleSubmit = async (shouldRedirect = false) => {
		if (!validateForm()) return;
		if (isSubmitting) return; // Prevent double submit

		setIsSubmitting(true);

		// Sanitize Payload
		const payload = {
			...formData,
			department: formData.department === "" ? null : formData.department,
			role: formData.role === "" ? null : formData.role,
			accountId: formData.accountId === "" ? null : formData.accountId
		};

		try {
			// Step 1: Create Contact (JSON)
			const res = await fetch(`${BASE_URL_AC}/contact`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!res.ok) {
				const errorText = await res.text();
				try {
					const errorJson = JSON.parse(errorText);
					if(errorJson.message && errorJson.message.includes("duplicate key")) {
						 toast.error("A contact with this email already exists.");
					} else {
						 toast.error(errorJson.message || "Failed to create contact");
					}
				} catch(e) {
					 if (errorText.includes("duplicate key")) {
						toast.error("A contact with this email already exists.");
					 } else {
						toast.error("Failed to create contact. Please check your inputs.");
					 }
				}
				setIsSubmitting(false);
				return;
			}

			const createdContact = await res.json();
			
			// Step 2: Upload Image (If selected)
			if (profileImage && createdContact.contactId) {
				const imageFormData = new FormData();
				imageFormData.append("file", profileImage);

				try {
					const imgRes = await fetch(`${BASE_URL_AC}/contact/${createdContact.contactId}/image`, {
						method: "POST",
						body: imageFormData,
					});

					if (!imgRes.ok) {
						if (imgRes.status === 413) {
							 toast.warn("Contact created, but image was too large to upload.");
						} else {
							 toast.warn("Contact created, but image upload failed.");
						}
					}
				} catch (imgErr) {
					 console.error("Image upload network error", imgErr);
					 toast.warn("Contact created, but image upload failed due to a network error.");
				}
			}

			toast.success("Contact created successfully!");
			if (shouldRedirect) navigate("/customers/contacts");
			else {
				setFormData(initialFormData);
				setProfileImage(null);
				setPreviewUrl(null);
				if (fileInputRef.current) fileInputRef.current.value = "";
			}
		} catch (err) {
			console.error(err);
			toast.error("Network error creating contact");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="cnc-create-container">
			{/* Header */}
			<div className="cnc-header-container">
				<h1 className="cnc-heading">Create New Contact</h1>
				<div className="cnc-header-buttons">
					<button className="cnc-save-button" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
						<Save size={18} /> {isSubmitting ? "Saving..." : "Save"}
					</button>
					<button className="cnc-save-and-new-button" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
						<FilePlus size={18} /> {isSubmitting ? "Saving..." : "Save and New"}
					</button>
					<button className="cnc-cancel-button" onClick={() => navigate("/customers/contacts")} disabled={isSubmitting}>
						<CircleX size={18} /> Cancel
					</button>
				</div>
			</div>

			<div className="cnc-main-layout">
				{/* Combined Form Section (Image moved inside) */}
				<div className="cnc-forms-section" style={{ width: '100%' }}>
					{/* Contact Info Form */}
					<div className="cnc-form-container">
						<h1 className="cnc-form-heading">Contact Information</h1>
						<div className="cnc-form-content">
							{/* Contact Owner */}
							<div className="cnc-form-group">
								<label>Contact Owner</label>
								<input type="text" value={contactOwnerName} readOnly className="cnc-input-readonly" />
							</div>

							{/* Account Link */}
							<div className="cnc-form-group">
								<label htmlFor="accountId">Associated Account</label>
								<select id="accountId" value={formData.accountId} onChange={handleChange}>
									<option value="">Select Account</option>
									{allAccounts.map((a) => (
										<option key={a.accountId} value={a.accountId}>{a.name || a.accountId}</option>
									))}
								</select>
							</div>

							{/* Name Fields */}
							<div className="cnc-form-group">
								<label htmlFor="firstName">First Name <span className="required-star">*</span></label>
								<input type="text" id="firstName" value={formData.firstName} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label htmlFor="lastName">Last Name <span className="required-star">*</span></label>
								<input type="text" id="lastName" value={formData.lastName} onChange={handleChange} />
							</div>

							{/* Contact Details */}
							<div className="cnc-form-group">
								<label htmlFor="email">Email <span className="required-star">*</span></label>
								<input type="email" id="email" value={formData.email} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label htmlFor="phone">Phone Number</label>
								<input type="tel" id="phone" value={formData.phone} onChange={handleChange} />
							</div>

							{/* Job Details */}
							<div className="cnc-form-group">
								<label htmlFor="role">Job Title</label>
								<select id="role" value={formData.role} onChange={handleChange}>
									<option value="">Select Job Title</option>
									<option value="MANAGER">Manager</option>
									<option value="DECISION_MAKER">Decision Maker</option>
									<option value="STAKE_HOLDER">Stake Holder</option>
									<option value="TECHNICAL_EVALUATOR">Technical Evaluator</option>
									<option value="EXECUTIVE">Executive</option>
									<option value="END_USER">End User</option>
									<option value="OTHERS">Others</option>
								</select>
							</div>
							<div className="cnc-form-group">
								<label htmlFor="department">Department</label>
								<select id="department" value={formData.department} onChange={handleChange}>
									<option value="">Select Department</option>
									<option value="IT">IT</option>
									<option value="HR">HR</option>
									<option value="SALES">Sales</option>
									<option value="MARKETING">Marketing</option>
									<option value="FINANCE">Finance</option>
									<option value="ENGINEERING">Engineering</option>
								</select>
							</div>

							{/* Notes */}
							<div className="cnc-form-group cnc-full-width">
								<label htmlFor="note">Notes (Max 500 chars)</label>
								<textarea id="note" maxLength={500} value={formData.note} onChange={handleChange} />
							</div>

							{/* Image Upload Section - Moved Here */}
							<div className="cnc-form-group cnc-full-width" style={{ marginTop: '10px' }}>
								<label>Profile Image (250KB - 600KB)</label>
								<div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
									<div 
										className="cnc-image-upload-circle"
										onClick={() => fileInputRef.current.click()}
										title="Click to upload profile picture"
										style={{ width: '80px', height: '80px' }} // Slightly smaller for inline form
									>
										{previewUrl ? (
											<img src={previewUrl} alt="Profile Preview" className="cnc-profile-preview" />
										) : (
											<div className="cnc-image-placeholder">
												<User size={32} color="#ccc" />
												<div className="cnc-camera-icon">
													<Camera size={14} color="white" />
												</div>
											</div>
										)}
									</div>
									<div style={{ display: 'flex', flexDirection: 'column' }}>
										<button 
											type="button" 
											onClick={() => fileInputRef.current.click()} 
											className="cnc-icon-button-modern"
											style={{ width: 'auto', padding: '5px 10px', fontSize: '12px', height: 'auto', borderRadius: '4px', border:'1px solid #ccc' }}
										>
											Choose File
										</button>
										<span style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
											Supported: JPG, PNG
										</span>
									</div>
								</div>
								<input 
									type="file" 
									ref={fileInputRef} 
									style={{ display: 'none' }} 
									accept="image/*"
									onChange={handleImageChange}
								/>
							</div>
						</div>
					</div>

					{/* Address Information */}
					<div className="cnc-form-container">
						<h1 className="cnc-form-heading">Address Information</h1>
						<div className="cnc-form-content address-grid">
							
							{/* Billing Section */}
							<div className="cnc-section-header cnc-full-width">Billing Address</div>
							<div className="cnc-form-group">
								<label>Address Line 1</label>
								<input type="text" id="billingAddressLine1" value={formData.billingAddressLine1} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>Address Line 2</label>
								<input type="text" id="billingAddressLine2" value={formData.billingAddressLine2} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>City</label>
								<input type="text" id="billingCity" value={formData.billingCity} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>State</label>
								<input type="text" id="billingState" value={formData.billingState} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>Country</label>
								<input type="text" id="billingCountry" value={formData.billingCountry} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>Zip Code</label>
								<input type="text" id="billingZipCode" value={formData.billingZipCode} onChange={handleChange} />
							</div>

							<div className="cnc-divider cnc-full-width"></div>

							{/* Shipping Section */}
							<div className="cnc-section-header cnc-full-width">Shipping Address</div>
							<div className="cnc-form-group">
								<label>Address Line 1</label>
								<input type="text" id="shippingAddressLine1" value={formData.shippingAddressLine1} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>Address Line 2</label>
								<input type="text" id="shippingAddressLine2" value={formData.shippingAddressLine2} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>City</label>
								<input type="text" id="shippingCity" value={formData.shippingCity} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>State</label>
								<input type="text" id="shippingState" value={formData.shippingState} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>Country</label>
								<input type="text" id="shippingCountry" value={formData.shippingCountry} onChange={handleChange} />
							</div>
							<div className="cnc-form-group">
								<label>Zip Code</label>
								<input type="text" id="shippingZipCode" value={formData.shippingZipCode} onChange={handleChange} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateNewContact;