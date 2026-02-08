import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Save, FilePlus, CircleX, Camera, User } from "lucide-react";
import "./CreateNewAccount.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

// File size constants
const MIN_IMAGE_SIZE = 5 * 1024; // 5 KB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const initialFormData = {
	accountId: "",
	name: "",
	type: "",
	ownerId: "",
	industry: "",
	parentAccountId: "",
	website: "",
	note: "",
	accountStatus: "ACTIVE",
	billingAddressLine1: "",
	billingAddressLine2: "",
	billingCity: "",
	billingState: "",
	billingCountry: "",
	billingZipCode: "",
	shippingAddressLine1: "",
	shippingAddressLine2: "",
	shippingCity: "",
	shippingState: "",
	shippingCountry: "",
	shippingZipCode: "",
};

const CreateNewAccount = () => {
	const [formData, setFormData] = useState({ ...initialFormData });
	const [loading, setLoading] = useState(false);
	const [allAccounts, setAllAccounts] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	
	// Image Upload State
	const fileInputRef = useRef(null);
	const [profileImage, setProfileImage] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	const navigate = useNavigate();

	const fetchAccounts = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/ids-names`);
			if (!res.ok) throw new Error("Failed to fetch accounts");
			const data = await res.json();
			const sorted = (Array.isArray(data) ? data : [])
				.filter((a) => a.name)
				.sort((a, b) => a.name.localeCompare(b.name));
			setAllAccounts(sorted);
		} catch (err) {
			toast.error("Error fetching accounts");
		}
	};

	const formatName = (str) =>
		str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

	const fetchUsers = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/s-info`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to fetch users");
			const data = await res.json();
			const sorted = (Array.isArray(data) ? data : [])
				.filter((u) => u.firstName && u.lastName)
				.sort((a, b) => a.firstName.localeCompare(b.firstName));
			setAllUsers(sorted);
		} catch (err) {
			toast.error("Error fetching users");
		}
	};

	useEffect(() => {
		fetchAccounts();
		fetchUsers();
	}, []);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.id]: e.target.value });
	};

	// Handle Image Selection
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			if (file.size < MIN_IMAGE_SIZE || file.size > MAX_IMAGE_SIZE) {
				toast.warn("Image size must be between 5KB and 5MB.");
				e.target.value = ""; 
				return;
			}
			setProfileImage(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSave = async () => {
		await submitForm(() => navigate("/customers/accounts"));
	};

	const handleSaveAndNew = async () => {
		await submitForm(() => {
			setFormData({ ...initialFormData });
			setProfileImage(null);
			setPreviewUrl(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			fetchAccounts(); 
		});
	};

	const submitForm = async (onSuccess) => {
		if (!formData.name.trim()) {
			toast.warn("Account Name is required");
			return;
		}

		try {
			setLoading(true);
			// 1. Create Account
			const res = await fetch(`${BASE_URL_AC}/account`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					parentAccountId: formData.parentAccountId || null,
				}),
			});

			if (!res.ok) {
				const msg = await res.text();
				toast.error(msg || "Failed to create account");
				setLoading(false);
				return;
			}

			const createdAccount = await res.json();
			const accountId = createdAccount.accountId;

			// 2. Upload Image if exists
			if (profileImage && accountId) {
				const imageFormData = new FormData();
				imageFormData.append("file", profileImage);

				try {
					const imgRes = await fetch(`${BASE_URL_AC}/account/${accountId}/image`, {
						method: "POST",
						body: imageFormData,
					});
					if (!imgRes.ok) toast.warn("Account created, but image upload failed.");
				} catch (imgErr) {
					console.error("Image upload network error", imgErr);
				}
			}

			toast.success("Account created successfully!");
			onSuccess();
		} catch (err) {
			console.error(err);
			toast.error("Error creating account");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="cna-create-container">
			{/* Header */}
			<div className="cna-header-container">
				<h1 className="cna-heading">Create New Account</h1>
				<div className="cna-header-buttons">
					<button className="cna-save-button" onClick={handleSave} disabled={loading}>
						<Save size={18} /> {loading ? "Saving..." : "Save"}
					</button>
					<button className="cna-save-and-new-button" onClick={handleSaveAndNew} disabled={loading}>
						<FilePlus size={18} /> {loading ? "Saving..." : "Save and New"}
					</button>
					<button className="cna-cancel-button" onClick={() => navigate("/customers/accounts")} disabled={loading}>
						<CircleX size={18} /> Cancel
					</button>
				</div>
			</div>

			<div className="cna-main-layout">
				<div className="cna-forms-section" style={{ width: '100%' }}>
					
					{/* Account Information Form */}
					<div className="cna-form-container">
						<h1 className="cna-form-heading">Account Information</h1>
						<div className="cna-form-content">
							
							<div className="cna-form-group">
								<label htmlFor="accountId">Account ID</label>
								<input type="text" id="accountId" value={formData.accountId} onChange={handleChange} placeholder="Auto-generated" disabled className="cna-input-disabled"/>
							</div>

							<div className="cna-form-group">
								<label htmlFor="name">Account Name <span style={{color:'red'}}>*</span></label>
								<input type="text" id="name" value={formData.name} onChange={handleChange} />
							</div>

							<div className="cna-form-group">
								<label htmlFor="ownerId">Account Owner</label>
								<select id="ownerId" value={formData.ownerId} onChange={handleChange}>
									<option value="">Select Owner</option>
									{allUsers.map((user) => (
										<option key={user.id} value={user.id}>{`${formatName(user.firstName)} ${formatName(user.lastName)}`}</option>
									))}
								</select>
							</div>

							<div className="cna-form-group">
								<label htmlFor="type">Account Type</label>
								<select id="type" value={formData.type} onChange={handleChange}>
									<option value="">Select Type</option>
									<option value="CUSTOMER">Customer</option>
									<option value="PARTNER">Partner</option>
									<option value="OTHER">Other</option>
								</select>
							</div>

							<div className="cna-form-group">
								<label htmlFor="industry">Industry</label>
								<select id="industry" value={formData.industry} onChange={handleChange}>
									<option value="">Select Industry</option>
									<option value="TECH">Tech</option>
									<option value="FINANCE">Finance</option>
									<option value="HEALTHCARE">Healthcare</option>
								</select>
							</div>

							<div className="cna-form-group">
								<label htmlFor="parentAccountId">Parent Account</label>
								<select id="parentAccountId" value={formData.parentAccountId || ""} onChange={handleChange}>
									<option value="">Select Parent Account</option>
									{allAccounts.map((account) => (
										<option key={account.accountId} value={account.accountId}>{account.name}</option>
									))}
								</select>
							</div>

							<div className="cna-form-group">
								<label htmlFor="website">Website</label>
								<input type="text" id="website" value={formData.website} onChange={handleChange} />
							</div>

							<div className="cna-form-group">
								<label htmlFor="accountStatus">Status</label>
								<select id="accountStatus" value={formData.accountStatus} onChange={handleChange}>
									<option value="ACTIVE">Active</option>
									<option value="INACTIVE">Inactive</option>
								</select>
							</div>

							{/* Empty spacer div to keep grid alignment if needed, or allow float */}
							<div></div>

							<div className="cna-form-group cna-full-width">
								<label htmlFor="note">Notes</label>
								<textarea id="note" value={formData.note} onChange={handleChange} />
							</div>

							{/* Image Upload Section - Positioned at Bottom like Contact */}
							<div className="cna-form-group cna-full-width" style={{ marginTop: '10px' }}>
								<label>Account Logo (5KB - 5MB)</label>
								<div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
									<div 
										className="cna-image-upload-circle"
										onClick={() => fileInputRef.current.click()}
										title="Click to upload account logo"
									>
										{previewUrl ? (
											<img src={previewUrl} alt="Preview" className="cna-profile-preview" />
										) : (
											<div className="cna-image-placeholder">
												<User size={32} color="#ccc" />
												<div className="cna-camera-icon"><Camera size={14} color="white" /></div>
											</div>
										)}
									</div>
									<div style={{ display: 'flex', flexDirection: 'column' }}>
										<button 
											type="button" 
											onClick={() => fileInputRef.current.click()} 
											className="cna-upload-btn"
										>
											Choose Logo
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

					{/* Address Information Form */}
					<div className="cna-form-container">
						<h1 className="cna-form-heading">Address Information</h1>
						<div className="cna-form-content">
							
							{/* Billing */}
							<div className="cna-section-header cna-full-width">Billing Address</div>
							<div className="cna-form-group"><label>Address Line 1</label><input type="text" id="billingAddressLine1" value={formData.billingAddressLine1} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>Address Line 2</label><input type="text" id="billingAddressLine2" value={formData.billingAddressLine2} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>City</label><input type="text" id="billingCity" value={formData.billingCity} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>State</label><input type="text" id="billingState" value={formData.billingState} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>Country</label><input type="text" id="billingCountry" value={formData.billingCountry} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>Zip Code</label><input type="text" id="billingZipCode" value={formData.billingZipCode} onChange={handleChange} /></div>

							<div className="cna-divider cna-full-width"></div>

							{/* Shipping */}
							<div className="cna-section-header cna-full-width">Shipping Address</div>
							<div className="cna-form-group"><label>Address Line 1</label><input type="text" id="shippingAddressLine1" value={formData.shippingAddressLine1} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>Address Line 2</label><input type="text" id="shippingAddressLine2" value={formData.shippingAddressLine2} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>City</label><input type="text" id="shippingCity" value={formData.shippingCity} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>State</label><input type="text" id="shippingState" value={formData.shippingState} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>Country</label><input type="text" id="shippingCountry" value={formData.shippingCountry} onChange={handleChange} /></div>
							<div className="cna-form-group"><label>Zip Code</label><input type="text" id="shippingZipCode" value={formData.shippingZipCode} onChange={handleChange} /></div>
						
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CreateNewAccount;