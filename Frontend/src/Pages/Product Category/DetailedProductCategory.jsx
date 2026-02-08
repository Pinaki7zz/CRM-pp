import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Save, CircleX, MoreVertical, SquarePen, Printer } from "lucide-react";
import "./DetailedProductCategory.css";
import { toast } from "react-toastify";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;

const DetailedProductCategory = () => {
	const { id } = useParams();
	const actionRef = useRef();
	const navigate = useNavigate();
	const location = useLocation();

	// Mode Logic (View vs Edit) - Default to View if not specified
	const initialMode = location.state?.mode || "view"; 
	const [isEditMode, setIsEditMode] = useState(initialMode === "edit");

	const [menuModal, setMenuModal] = useState(false);
	const [subCategoryCountInput, setSubCategoryCountInput] = useState("");
	
	// Helper to generate IDs
	const generateId = () => {
		return `CAT-${Math.floor(100000 + Math.random() * 900000)}`;
	};

	const [formData, setFormData] = useState({
		productCategoryId: "",
		productCategoryName: "",
		productAssignmentAllowed: false,
		status: "",
		numberOfSubCategories: 0,
		subCategories: [],
	});
	
	const [loading, setLoading] = useState(true);
	const [errors, setErrors] = useState({});
	const MAX_SUBCATEGORIES = 50;

	const getError = (field, index = null) => {
		if (index !== null) {
			const key = `subCategories.${index}.${field}`;
			return errors[key] ? errors[key].join(", ") : null;
		}
		return errors[field] ? errors[field].join(", ") : null;
	};

	const FIELD_MAP = {
		"parent.categoryId": "productCategoryId",
		"parent.name": "productCategoryName",
		"parent.status": "status",
		"categoryId": "subCategoryId",
		"name": "subCategoryName",
		"status": "subCategoryStatus",
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await fetch(`${BASE_URL_SM}/product-category/${id}`);
				if (!res.ok) throw new Error("Failed to fetch product category");
				
				const data = await res.json();
				
				const formatted = {
					productCategoryId: data.categoryId || "",
					productCategoryName: data.name || "",
					productAssignmentAllowed: data.productAssignmentAllowed ?? false,
					status: data.status || "",
					
					numberOfSubCategories: data.subcategories ? data.subcategories.length : 0,
					
					subCategories: data.subcategories ? data.subcategories.map((sub) => ({
						id: sub.id, // Database Primary Key (UUID)
						subCategoryId: sub.categoryId || "",
						subCategoryName: sub.name || "",
						subCategoryAssignmentAllowed: sub.productAssignmentAllowed ?? false,
						subCategoryStatus: sub.status || "",
					})) : [],
				};

				setFormData(formatted);
				setSubCategoryCountInput(String(formatted.numberOfSubCategories));
				setLoading(false);

			} catch (err) {
				console.error("Error fetching product category:", err);
				toast.error("Error fetching product category");
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	const handlePrint = () => {
		setMenuModal(false);
		const printWindow = window.open('', '_blank');
		if (!printWindow) {
			toast.error("Popup blocked. Please allow popups to print.");
			return;
		}

		const styles = `
			<style>
				body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f1035; padding: 40px; }
				.header { border-bottom: 2px solid #365486; padding-bottom: 10px; margin-bottom: 30px; }
				.header h1 { margin: 0; color: #365486; font-size: 28px; }
				.section { margin-bottom: 30px; }
				.section-title { font-size: 18px; font-weight: bold; color: #365486; margin-bottom: 15px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
				.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
				.field { margin-bottom: 10px; }
				.label { font-weight: bold; color: #555; font-size: 13px; display: block; margin-bottom: 4px; }
				.value { font-size: 15px; }
				.sub-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
				.sub-table th, .sub-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 14px; }
				.sub-table th { background-color: #f0f4f8; color: #365486; }
				@media print {
					body { padding: 0; }
					.section { break-inside: avoid; }
				}
			</style>
		`;

		const subCategoriesRows = formData.subCategories.map(sub => `
			<tr>
				<td>${sub.subCategoryId}</td>
				<td>${sub.subCategoryName}</td>
				<td>${sub.subCategoryStatus}</td>
				<td>${sub.subCategoryAssignmentAllowed ? "Yes" : "No"}</td>
			</tr>
		`).join('');

		const content = `
			<html>
				<head><title>Print Category - ${formData.productCategoryName}</title>${styles}</head>
				<body>
					<div class="header">
						<h1>${formData.productCategoryName}</h1>
						<div style="font-size: 14px; color: #666; margin-top: 5px;">ID: ${formData.productCategoryId}</div>
					</div>

					<div class="section">
						<div class="section-title">General Information</div>
						<div class="grid">
							<div class="field"><span class="label">Status</span><span class="value">${formData.status}</span></div>
							<div class="field"><span class="label">Product Assignment Allowed</span><span class="value">${formData.productAssignmentAllowed ? "Yes" : "No"}</span></div>
							<div class="field"><span class="label">Number of Sub-Categories</span><span class="value">${formData.numberOfSubCategories}</span></div>
						</div>
					</div>

					${formData.numberOfSubCategories > 0 ? `
						<div class="section">
							<div class="section-title">Sub-Categories</div>
							<table class="sub-table">
								<thead>
									<tr>
										<th>ID</th>
										<th>Name</th>
										<th>Status</th>
										<th>Assignment Allowed</th>
									</tr>
								</thead>
								<tbody>
									${subCategoriesRows}
								</tbody>
							</table>
						</div>
					` : ''}

					<script>window.onload = function() { window.print(); window.close(); }</script>
				</body>
			</html>
		`;

		printWindow.document.write(content);
		printWindow.document.close();
	};

	const handleChange = (e) => {
		const { id, type, checked, value } = e.target;
		if (errors[id]) {
			setErrors((prev) => {
				const updated = { ...prev };
				delete updated[id];
				return updated;
			});
		}
		setFormData((prev) => ({
			...prev,
			[id]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSave = async () => {
		try {
			setLoading(true);
			setErrors({});

			// 1. Prepare Main Payload
			const parentPayload = {
				categoryId: formData.productCategoryId || "",
				name: formData.productCategoryName || "",
				status: formData.status || "",
				productAssignmentAllowed: formData.productAssignmentAllowed,
				parentCategoryId: null,
				type: "MAIN",
			};

			// 2. Prepare Sub Payload
			const subPayloads = formData.subCategories.map((sub) => ({
				id: sub.id || null, // Pass ID if it exists (update), else null (create)
				categoryId: sub.subCategoryId || "",
				name: sub.subCategoryName || "",
				status: sub.subCategoryStatus || "",
				productAssignmentAllowed: sub.subCategoryAssignmentAllowed,
				type: "SUB",
			}));

			const response = await fetch(`${BASE_URL_SM}/product-category/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					parent: parentPayload,
					subCategories: subPayloads,
				}),
			});

			const result = await response.json().catch(() => null);

			if (!response.ok) {
				if (result?.errors) {
					const map = {};
					result.errors.forEach((err) => {
						let key = err.path;
						if (FIELD_MAP[key]) key = FIELD_MAP[key];
						const match = key.match(/^subCategories\[(\d+)\]\.(.+)$/);
						if (match) {
							const index = match[1];
							let field = match[2];
							if (FIELD_MAP[field]) field = FIELD_MAP[field];
							key = `subCategories.${index}.${field}`;
						}
						if (!map[key]) map[key] = [];
						map[key].push(err.msg);
					});
					setErrors(map);
					toast.error("Validation error");
					return;
				}
				toast.error("Failed to update product category");
				return;
			}

			toast.success("Product category updated successfully!");
			navigate("/products/productcategories"); 

		} catch (error) {
			console.error("Error saving product category:", error);
			toast.error("Unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleNumberChange = (e) => {
		const value = e.target.value;
		setSubCategoryCountInput(value);
		setErrors((prev) => {
			const updated = { ...prev };
			delete updated.numberOfSubCategories;
			return updated;
		});

		if (value === "") return;
		let newCount = parseInt(value, 10);
		if (isNaN(newCount) || newCount < 0) return;

		if (newCount > MAX_SUBCATEGORIES) {
			newCount = MAX_SUBCATEGORIES;
			setSubCategoryCountInput(String(MAX_SUBCATEGORIES));
			setErrors((prev) => ({
				...prev,
				numberOfSubCategories: [`Maximum ${MAX_SUBCATEGORIES} sub-categories allowed`],
			}));
			return;
		}

		setFormData((prev) => {
			const current = [...prev.subCategories];
			const oldCount = current.length;
			
			if (newCount > oldCount) {
				// Add NEW items with generated IDs
				const blanks = Array.from({ length: newCount - oldCount }, () => ({
					id: null, // No DB ID yet
					subCategoryId: generateId(), // Auto-generate string ID
					subCategoryName: "",
					subCategoryStatus: "",
					subCategoryAssignmentAllowed: false,
				}));
				return { ...prev, numberOfSubCategories: newCount, subCategories: [...current, ...blanks] };
			}
			
			if (newCount < oldCount) {
				// Remove items from the end
				return { ...prev, numberOfSubCategories: newCount, subCategories: current.slice(0, newCount) };
			}
			
			return prev;
		});
	};

	const handleSubCategoryChange = (index, field, value) => {
		setFormData((prev) => {
			const updated = [...prev.subCategories];
			updated[index] = { ...updated[index], [field]: value };
			return { ...prev, subCategories: updated };
		});
	};

	const clearSubError = (field, index) => {
		const key = `subCategories.${index}.${field}`;
		if (errors[key]) {
			setErrors((prev) => {
				const updated = { ...prev };
				delete updated[key];
				return updated;
			});
		}
	};

	// Close menu on click outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (actionRef.current && !actionRef.current.contains(event.target)) {
				setMenuModal(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading...</div>;

	return (
		<div className="prodcat-edit-container">
			{/* Header */}
			<div className="prodcat-edit-header-container">
				<h1 className="prodcat-edit-heading">{formData.productCategoryName || "Category Details"}</h1>
				<div className="prodcat-edit-header-container-buttons">
					
					{!isEditMode ? (
						<>
							<button 
								className="prodcat-edit-close-button" 
								onClick={() => navigate("/products/productcategories")}
							>
								<CircleX size={17} strokeWidth={1} color="#0f1035" /> Close
							</button>
							
							<button 
								className="prodcat-edit-edit-button" 
								onClick={() => setIsEditMode(true)}
							>
								<SquarePen size={15} strokeWidth={1} color="#dcf2f1" /> Edit
							</button>
						</>
					) : (
						<>
							<button className="prodcat-edit-save-button" onClick={handleSave} disabled={loading}>
								<Save size={17} strokeWidth={1} color="#dcf2f1" />
								{loading ? "Saving..." : "Save"}
							</button>
							
							<button
								className="prodcat-edit-cancel-button"
								onClick={() => navigate("/products/productcategories")} 
								disabled={loading}
							>
								<CircleX size={17} strokeWidth={1} color="#0f1035" /> Cancel
							</button>
						</>
					)}

					<div className="prodcat-edit-options-button-container" ref={actionRef}>
						<button className="prodcat-edit-options-button" onClick={() => setMenuModal((p) => !p)}>
							<MoreVertical size={20} />
						</button>
						{menuModal && (
							<div className="prodcat-edit-menu-modal-container">
								<ul className="prodcat-edit-menu-modal-list">
									<li>Delete</li>
									<li onClick={handlePrint}><Printer size={14} style={{marginRight: '8px'}}/> Print View</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Form */}
			<div className="prodcat-edit-form-container">
				<h1 className="prodcat-edit-form-heading">Product Category Information</h1>
				<div className="prodcat-edit-form">
					<form>
						{/* Row 1 */}
						<div className="prodcat-edit-form-row">
							<div className="prodcat-edit-form-group productCategoryId">
								<label htmlFor="productCategoryId">Product Category ID *</label>
								<input
									type="text"
									id="productCategoryId"
									value={formData.productCategoryId}
									disabled={true} 
									style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
								/>
								{getError("productCategoryId") && <div className="field-error">{getError("productCategoryId")}</div>}
							</div>
							<div className="prodcat-edit-form-group productCategoryName">
								<label htmlFor="productCategoryName">Product Category Name *</label>
								<input
									type="text"
									id="productCategoryName"
									value={formData.productCategoryName}
									onChange={handleChange}
									disabled={!isEditMode}
									placeholder="Enter Category Name"
								/>
								{getError("productCategoryName") && <div className="field-error">{getError("productCategoryName")}</div>}
							</div>
						</div>

						{/* Row 2 */}
						<div className="prodcat-edit-form-row">
							<div className="prodcat-edit-form-group status">
								<label htmlFor="status">Status *</label>
								{!isEditMode ? (
									<input
										type="text"
										value={
											formData.status === "ACTIVE" ? "Active" : 
											formData.status === "INACTIVE" ? "Inactive" : 
											formData.status === "CLOSED" ? "Closed" : ""
										}
										disabled
									/>
								) : (
									<select id="status" value={formData.status} onChange={handleChange}>
										<option value="">Select Status</option>
										<option value="ACTIVE">Active</option>
										<option value="INACTIVE">Inactive</option>
										<option value="CLOSED">Closed</option>
									</select>
								)}
								{getError("status") && <div className="field-error">{getError("status")}</div>}
							</div>
							<div className="prodcat-edit-form-group productAssignmentAllowed">
								<input
									type="checkbox"
									id="productAssignmentAllowed"
									checked={formData.productAssignmentAllowed}
									onChange={handleChange}
									disabled={!isEditMode}
								/>
								<label htmlFor="productAssignmentAllowed">Product Assignment Allowed</label>
							</div>
						</div>

						{/* Row 3 - Sub Categories Count */}
						<div className="prodcat-edit-form-row">
							<div className="prodcat-edit-form-group numberOfSubCategories">
								<label htmlFor="numberOfSubCategories">Number of Sub-Category</label>
								<input
									type="number"
									id="numberOfSubCategories"
									min={0} max={50}
									value={subCategoryCountInput}
									onChange={handleNumberChange}
									disabled={!isEditMode}
								/>
								{getError("numberOfSubCategories") && <div className="field-error">{getError("numberOfSubCategories")}</div>}
							</div>
						</div>

						{/* Sub Categories Render */}
						{formData.numberOfSubCategories > 0 && formData.subCategories.map((subCat, index) => (
							<div className="prodcat-edit-sub-category-block" key={index}>
								<div className="prodcat-edit-form-row">
									<div className={`prodcat-edit-form-group subCategoryId-${index}`}>
										<label>Sub-Category ID *</label>
										<input
											type="text"
											value={subCat.subCategoryId}
											disabled={true} 
											style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
										/>
										{getError("subCategoryId", index) && <div className="field-error">{getError("subCategoryId", index)}</div>}
									</div>
									<div className={`prodcat-edit-form-group subCategoryName-${index}`}>
										<label>Sub-Category Name *</label>
										<input
											type="text"
											value={subCat.subCategoryName}
											onChange={(e) => {
												handleSubCategoryChange(index, "subCategoryName", e.target.value);
												clearSubError("subCategoryName", index);
											}}
											disabled={!isEditMode}
										/>
										{getError("subCategoryName", index) && <div className="field-error">{getError("subCategoryName", index)}</div>}
									</div>
								</div>
								<div className="prodcat-edit-form-row">
									<div className={`prodcat-edit-form-group subCategoryStatus-${index}`}>
										<label>Status *</label>
										{!isEditMode ? (
											<input
												type="text"
												value={
													subCat.subCategoryStatus === "ACTIVE" ? "Active" : 
													subCat.subCategoryStatus === "INACTIVE" ? "Inactive" : 
													subCat.subCategoryStatus === "CLOSED" ? "Closed" : ""
												}
												disabled
											/>
										) : (
											<select
												value={subCat.subCategoryStatus}
												onChange={(e) => {
													handleSubCategoryChange(index, "subCategoryStatus", e.target.value);
													clearSubError("subCategoryStatus", index);
												}}
											>
												<option value="">Select Status</option>
												<option value="ACTIVE">Active</option>
												<option value="INACTIVE">Inactive</option>
												<option value="CLOSED">Closed</option>
											</select>
										)}
										{getError("subCategoryStatus", index) && <div className="field-error">{getError("subCategoryStatus", index)}</div>}
									</div>
									<div className={`prodcat-edit-form-group subCategoryAssignmentAllowed-${index}`}>
										<input
											type="checkbox"
											checked={subCat.subCategoryAssignmentAllowed}
											onChange={(e) => {
												handleSubCategoryChange(index, "subCategoryAssignmentAllowed", e.target.checked);
												clearSubError("subCategoryAssignmentAllowed", index);
											}}
											disabled={!isEditMode}
										/>
										<label>Sub-Category Assignment Allowed</label>
									</div>
								</div>
							</div>
						))}

						<span className="prodcat-edit-required-field-text">* Required Field</span>
					</form>
				</div>
			</div>
		</div>
	);
};

export default DetailedProductCategory;