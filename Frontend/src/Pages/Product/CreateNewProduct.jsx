import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Save, FilePlus, CircleX } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import "./CreateNewProduct.css";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;

const CreateNewProduct = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth(); // Get user from Auth Context
	
	const [loading, setLoading] = useState(false);
	const [categories, setCategories] = useState([]);
	const [errors, setErrors] = useState({});

	// Helper: Generate Product ID
	const generateProductId = () => {
		return `PROD-${Math.floor(100000 + Math.random() * 900000)}`;
	};

	// Initial form state
	const initialState = {
		productId: "", 
		name: "",
		productOwnerId: "", // Will store user.id
		vendorName: "",
		status: "ACTIVE",
		productCategoryId: "",
		manufacturer: "",
		salesStartDate: "",
		salesEndDate: "",
		supportStartDate: "",
		supportEndDate: "",
		unitPrice: "",
		commissionRate: "",
		tax: "",
		taxable: false,
		usageUnit: "",
		quantityOrdered: "",
		quantityInStock: "",
		reorderLevel: "",
		handler: "",
		quantityInDemand: "",
		isActiveStock: true,
		unitOfMeasurement: "",
		description: "",
	};

	const [formData, setFormData] = useState(initialState);

	// 1. Initialize Form (ID & Clone Data)
	useEffect(() => {
		const clonedData = location.state?.clonedData;

		if (clonedData) {
			const { id, productId, createdAt, updatedAt, productCategory, ...rest } = clonedData;
			
			setFormData(prev => ({
				...prev,
				...rest,
				productId: generateProductId(),
				taxable: !!rest.taxable,
				isActiveStock: rest.isActiveStock !== undefined ? !!rest.isActiveStock : true
			}));
			toast.info("Cloned product details loaded.");
		} else {
			setFormData(prev => ({
				...prev,
				productId: generateProductId(),
			}));
		}
	}, [location.state]);

	// 2. Set Product Owner based on Logged-in User
	useEffect(() => {
		if (user && !formData.productOwnerId) {
			setFormData((prev) => ({ ...prev, productOwnerId: user.id }));
		}
	}, [user, formData.productOwnerId]);

	const fetchCategories = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/product-category`);
			if (!res.ok) {
				toast.error("Failed to fetch categories");
				return;
			}
			const data = await res.json();
			setCategories(data);
		} catch (err) {
			console.error("Error fetching categories:", err);
			toast.error("Error fetching categories");
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleChange = (e) => {
		const { id, value, type, checked } = e.target;
		
		if (errors[id]) {
			setErrors(prev => {
				const updated = { ...prev };
				delete updated[id];
				return updated;
			});
		}

		setFormData((prev) => ({
			...prev,
			[id]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
		}));
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.productId) newErrors.productId = "Product ID is required";
		if (!formData.name) newErrors.name = "Product Name is required";
		if (!formData.productOwnerId && !user) newErrors.productOwnerId = "Product Owner is required"; 
		if (!formData.productCategoryId) newErrors.productCategoryId = "Category is required";
		if (!formData.salesStartDate) newErrors.salesStartDate = "Sales Start Date is required";
		if (!formData.salesEndDate) newErrors.salesEndDate = "Sales End Date is required";
		if (!formData.unitPrice) newErrors.unitPrice = "Unit Price is required";
		
		// --- NEW VALIDATION FOR ENUMS ---
		if (!formData.unitOfMeasurement) newErrors.unitOfMeasurement = "Unit of Measurement is required";
		if (!formData.usageUnit) newErrors.usageUnit = "Usage Unit is required";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = async (mode) => {
		if (!validateForm()) {
			toast.error("Please fill in all required fields.");
			return;
		}

		try {
			setLoading(true);
			const res = await fetch(`${BASE_URL_SM}/product`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			
			const result = await res.json().catch(() => null);

			if (!res.ok) {
				if(result?.errors) {
					const backendErrors = {};
					result.errors.forEach(err => backendErrors[err.path] = err.msg);
					setErrors(backendErrors);
					toast.error("Validation failed");
				} else {
					toast.error(result?.message || "Failed to save product");
				}
				return;
			}

			toast.success("Product created successfully!");

			if (mode === "save") {
				navigate("/products/products");
			} else {
				setFormData({
					...initialState,
					productId: generateProductId(),
					productOwnerId: user ? user.id : ""
				});
				setErrors({});
			}
		} catch (err) {
			console.error("Error saving product:", err);
			toast.error("Error saving product");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="product-create-container">
			{/* Header */}
			<div className="product-create-header-container">
				<h1 className="product-create-heading">New Product</h1>
				<div className="product-create-header-container-buttons">
					<button className="product-create-save-button" onClick={() => handleSave("save")} disabled={loading}>
						<Save size={18} /> {loading ? "Saving..." : "Save"}
					</button>
					<button className="product-create-save-and-new-button" onClick={() => handleSave("saveAndNew")} disabled={loading}>
						<FilePlus size={18} /> Save and New
					</button>
					<button className="product-create-cancel-button" onClick={() => navigate("/products/products")}>
						<CircleX size={18} /> Cancel
					</button>
				</div>
			</div>

			{/* Section 1: Product Information */}
			<div className="product-create-form-container">
				<h1 className="product-create-form-heading">Product Information</h1>
				<div className="product-create-form">
					<form>
						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="productId">Product ID <span className="required-star">*</span></label>
								<input 
									type="text" 
									id="productId" 
									value={formData.productId} 
									readOnly 
									disabled 
									style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
								/>
							</div>
							<div className="product-create-form-group">
								<label htmlFor="productOwnerId">Product Owner <span className="required-star">*</span></label>
								<input 
									type="text" 
									id="productOwnerId" 
									value={user ? `${user.firstName} ${user.lastName}` : "--"} 
									readOnly 
									disabled 
									style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
								/>
							</div>
						</div>

						<div className="product-create-form-row">
							 <div className="product-create-form-group">
								<label htmlFor="name">Product Name <span className="required-star">*</span></label>
								<input 
									type="text" 
									id="name" 
									value={formData.name} 
									onChange={handleChange} 
									placeholder="Product Name" 
									className={errors.name ? "input-error" : ""}
								/>
								{errors.name && <span className="error-text">{errors.name}</span>}
							</div>
							<div className="product-create-form-group">
								<label htmlFor="productCategoryId">Product Category <span className="required-star">*</span></label>
								<select 
									id="productCategoryId" 
									value={formData.productCategoryId} 
									onChange={handleChange}
									className={errors.productCategoryId ? "input-error" : ""}
								>
									<option value="">Select Category</option>
									{categories.map((cat) => (
										<optgroup key={cat.categoryId} label={cat.name}>
											<option value={cat.categoryId}>{cat.name}</option>
											{cat.subcategories && cat.subcategories.map((sub) => (
												<option key={sub.categoryId} value={sub.categoryId}>-- {sub.name}</option>
											))}
										</optgroup>
									))}
								</select>
								{errors.productCategoryId && <span className="error-text">{errors.productCategoryId}</span>}
							</div>
						</div>

						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="vendorName">Vendor Name</label>
								<input type="text" id="vendorName" value={formData.vendorName} onChange={handleChange} placeholder="Vendor Name" />
							</div>
							<div className="product-create-form-group">
								<label htmlFor="manufacturer">Manufacturer</label>
								<input type="text" id="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="Manufacturer" />
							</div>
						</div>

						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="salesStartDate">Sales Start Date <span className="required-star">*</span></label>
								<input 
									type="date" 
									id="salesStartDate" 
									value={formData.salesStartDate} 
									onChange={handleChange} 
									className={errors.salesStartDate ? "input-error" : ""}
								/>
								{errors.salesStartDate && <span className="error-text">{errors.salesStartDate}</span>}
							</div>
							<div className="product-create-form-group">
								<label htmlFor="salesEndDate">Sales End Date <span className="required-star">*</span></label>
								<input 
									type="date" 
									id="salesEndDate" 
									value={formData.salesEndDate} 
									onChange={handleChange} 
									className={errors.salesEndDate ? "input-error" : ""}
								/>
								{errors.salesEndDate && <span className="error-text">{errors.salesEndDate}</span>}
							</div>
						</div>

						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="supportStartDate">Support Start Date</label>
								<input type="date" id="supportStartDate" value={formData.supportStartDate} onChange={handleChange} />
							</div>
							<div className="product-create-form-group">
								<label htmlFor="supportEndDate">Support End Date</label>
								<input type="date" id="supportEndDate" value={formData.supportEndDate} onChange={handleChange} />
							</div>
						</div>

						 <div className="product-create-form-row">
							 <div className="product-create-form-group">
								<label htmlFor="status">Status</label>
								<select id="status" value={formData.status} onChange={handleChange}>
									<option value="ACTIVE">Active</option>
									<option value="INACTIVE">Inactive</option>
									<option value="DISCONTINUED">Discontinued</option>
								</select>
							</div>
						</div>
					</form>
				</div>
			</div>

			{/* Section 2: Price Information */}
			<div className="product-create-form-container">
				<h1 className="product-create-form-heading">Price Information</h1>
				<div className="product-create-form">
					<form>
						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="unitPrice">Unit Price <span className="required-star">*</span></label>
								<input 
									type="text" 
									id="unitPrice" 
									value={formData.unitPrice} 
									onChange={handleChange} 
									placeholder="Unit Price" 
									className={errors.unitPrice ? "input-error" : ""}
								/>
								{errors.unitPrice && <span className="error-text">{errors.unitPrice}</span>}
							</div>
							<div className="product-create-form-group">
								<label htmlFor="commissionRate">Commission Rate</label>
								<input type="text" id="commissionRate" value={formData.commissionRate} onChange={handleChange} placeholder="Commission Rate" />
							</div>
						</div>
						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="tax">Tax</label>
								<input type="text" id="tax" value={formData.tax} onChange={handleChange} placeholder="Tax" />
							</div>
							<div className="product-create-form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginTop: '25px' }}>
								<input type="checkbox" id="taxable" checked={formData.taxable} onChange={handleChange} style={{ width: "20px", height: "20px" }} />
								<label htmlFor="taxable" style={{ marginBottom: 0 }}>Taxable</label>
							</div>
						</div>
					</form>
				</div>
			</div>

			{/* Section 3: Stock Information */}
			<div className="product-create-form-container">
				<h1 className="product-create-form-heading">Stock Information</h1>
				<div className="product-create-form">
					<form>
						<div className="product-create-form-row">
							<div className="product-create-form-group">
								{/* Added Required Star and Error Logic */}
								<label htmlFor="unitOfMeasurement">Unit of Measurement <span className="required-star">*</span></label>
								<select 
									id="unitOfMeasurement" 
									value={formData.unitOfMeasurement} 
									onChange={handleChange}
									className={errors.unitOfMeasurement ? "input-error" : ""}
								>
									<option value="">Select Unit of Measurement</option>
									<option value="PIECE">Piece</option>
									<option value="KG">KG</option>
									<option value="LITER">Liter</option>
									<option value="METER">Meter</option>
									<option value="BOX">Box</option>
									<option value="PACK">Pack</option>
									<option value="CUSTOM">Custom</option>
								</select>
								{errors.unitOfMeasurement && <span className="error-text">{errors.unitOfMeasurement}</span>}
							</div>
							<div className="product-create-form-group">
								{/* Added Required Star and Error Logic */}
								<label htmlFor="usageUnit">Select Usage Unit <span className="required-star">*</span></label>
								<select 
									id="usageUnit" 
									value={formData.usageUnit} 
									onChange={handleChange}
									className={errors.usageUnit ? "input-error" : ""}
								>
									<option value="">Select Usage Unit</option>
									<option value="BOX">Box</option>
									<option value="CARTON">Carton</option>
									<option value="DOZEN">Dozen</option>
									<option value="EACH">Each</option>
									<option value="HOUR">Hour(s)</option>
									<option value="IMPRESSIONS">Impressions</option>
									<option value="LB">Lb</option>
									<option value="M">M</option>
									<option value="PACK">Pack</option>
									<option value="PAGES">Pages</option>
									<option value="PIECES">Pieces</option>
									<option value="QUANTITY">Quantity</option>
									<option value="REAMS">Reams</option>
									<option value="SHEET">Sheet</option>
									<option value="SPIRAL_BINDER">Spiral Binder</option>
									<option value="SQUARE_FEET">Square Feet</option>
								</select>
								{errors.usageUnit && <span className="error-text">{errors.usageUnit}</span>}
							</div>
						</div>
						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="quantityOrdered">Qty Ordered</label>
								<input type="text" id="quantityOrdered" value={formData.quantityOrdered} onChange={handleChange} placeholder="Qty Ordered" />
							</div>
							<div className="product-create-form-group">
								<label htmlFor="quantityInStock">Qty in Stock</label>
								<input type="text" id="quantityInStock" value={formData.quantityInStock} onChange={handleChange} placeholder="Qty in Stock" />
							</div>
						</div>
						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="reorderLevel">Reorder Level</label>
								<input type="text" id="reorderLevel" value={formData.reorderLevel} onChange={handleChange} placeholder="Reorder Level" />
							</div>
							<div className="product-create-form-group">
								<label htmlFor="handler">Handler</label>
								<input type="text" id="handler" value={formData.handler} onChange={handleChange} placeholder="Handler" />
							</div>
						</div>
						<div className="product-create-form-row">
							<div className="product-create-form-group">
								<label htmlFor="quantityInDemand">Qty in Demand</label>
								<input type="text" id="quantityInDemand" value={formData.quantityInDemand} onChange={handleChange} placeholder="Qty in Demand" />
							</div>
							<div className="product-create-form-group" style={{ flexDirection: "row", alignItems: "center", gap: "10px", marginTop:'25px' }}>
								<input type="checkbox" id="isActiveStock" checked={formData.isActiveStock} onChange={handleChange} style={{ width: "20px", height: "20px" }} />
								<label htmlFor="isActiveStock" style={{ marginBottom: 0 }}>Active Stock?</label>
							</div>
						</div>
					</form>
				</div>
			</div>

			{/* Section 4: Description */}
			<div className="product-create-form-container">
				<h1 className="product-create-form-heading">Product Description</h1>
				<div className="product-create-form">
					<form>
						<div className="product-create-form-row">
							<div className="product-create-form-group full-width">
								<label htmlFor="description">Description</label>
								<textarea 
									id="description" 
									rows="4" 
									value={formData.description} 
									onChange={handleChange} 
									placeholder="Enter product description..." 
									className="product-description-textarea"
								/>
							</div>
						</div>
					</form>
				</div>
			</div>

			<div style={{ marginTop: "15px", marginBottom: "30px", marginLeft: "30px" }}>
				<span className="required-field-text" style={{ color: "#365486" }}>* Required Field</span>
			</div>
		</div>
	);
};

export default CreateNewProduct;