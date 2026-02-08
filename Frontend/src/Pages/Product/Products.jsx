import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
	Plus, RefreshCcw, RotateCcw, Filter, Search, ChevronDown, CircleUserRound,
	SquarePen, Trash2, X, CircleArrowLeft, CircleArrowRight,
	ChevronsLeft, ChevronsRight, Eye, Settings, MoreVertical,
	ArrowUp, ArrowDown, ArrowUpDown, CheckCircle2, Ban, Copy,
	ChevronRight, ChevronLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Products.css";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import { useAuth } from "../../contexts/AuthContext"; // Ensure this path is correct

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;

// --- CONSTANTS ---

const INITIAL_ADVANCED_STATE = {
	productId: { value: "", operator: "include" },
	name: { value: "", operator: "include" },
	status: { value: "", operator: "include" },
	productCategory: { value: "", operator: "include" },
	productOwnerId: { value: "", operator: "include" },
	createdAt: { value: "", operator: "include" },
};

const DEFAULT_VISIBLE_COLUMNS = {
	productId: true,
	name: true,
	category: true,
	status: true,
	owner: true,
	price: true,
	stock: true,
	createdAt: true,
	actions: true
};

const Products = () => {
	const navigate = useNavigate();
	const actionRef = useRef(null);
	const popupRef = useRef(null);
	const [pageInput, setPageInput] = useState(1);
	const { user } = useAuth();

	// --- Data State ---
	const [products, setProducts] = useState([]);
	const [originalProducts, setOriginalProducts] = useState([]); 
	const [productCategories, setProductCategories] = useState([]);
	const [userProfiles, setUserProfiles] = useState([]); // Store list of users/owners
	
	// --- Selection & Modals ---
	const [selectedRows, setSelectedRows] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deleteProductId, setDeleteProductId] = useState(null);
	const [showActionsModal, setShowActionsModal] = useState(false);
	
	// --- Feature Modals ---
	const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
	const [showColumnControl, setShowColumnControl] = useState(false);
	const [showSortModal, setShowSortModal] = useState(false);
	const [showOrganizeModal, setShowOrganizeModal] = useState(false);

	// --- Loading States ---
	const [refreshSpin, setRefreshSpin] = useState(false);
	const [resetSpin, setResetSpin] = useState(false);
	const [loading, setLoading] = useState(false);

	// --- Columns & Sorting ---
	const allColumns = useMemo(() => [
		{ key: 'productId', label: 'Product ID' },
		{ key: 'name', label: 'Product Name' },
		{ key: 'category', label: 'Category' },
		{ key: 'status', label: 'Status' },
		{ key: 'owner', label: 'Product Owner' },
		{ key: 'price', label: 'Unit Price' },
		{ key: 'stock', label: 'Qty in Stock' },
		{ key: 'createdAt', label: 'Created At' },
		{ key: 'vendor', label: 'Vendor Name' },
		{ key: 'manufacturer', label: 'Manufacturer' },
		{ key: 'salesStartDate', label: 'Sales Start Date' }, 
		{ key: 'salesEndDate', label: 'Sales End Date' }, 
		{ key: 'supportStartDate', label: 'Support Start Date' }, 
		{ key: 'supportEndDate', label: 'Support End Date' }, 
		{ key: 'isActiveStock', label: 'Active Stock' }, 
		{ key: 'taxable', label: 'Taxable' }, 
		{ key: 'usageUnit', label: 'Usage Unit' }, 
		{ key: 'reorderLevel', label: 'Reorder Level' }, 
		{ key: 'handler', label: 'Handler' }, 
		{ key: 'quantityInDemand', label: 'Qty in Demand' }, 
		{ key: 'commissionRate', label: 'Commission Rate' }, 
		{ key: 'tax', label: 'Tax' }, 
		{ key: 'description', label: 'Description' }
	], []);

	const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
	const [tempVisibleKeys, setTempVisibleKeys] = useState([]);
	const [tempAvailableKeys, setTempAvailableKeys] = useState([]);
	const [selectedAvailable, setSelectedAvailable] = useState([]);
	const [selectedVisible, setSelectedVisible] = useState([]);
	const [activePopupColumn, setActivePopupColumn] = useState(null);

	// --- Filtering & Searching ---
	const [searchTerm, setSearchTerm] = useState("");
	const [columnSearch, setColumnSearch] = useState({}); 
	const [debouncedSearch] = useDebounce(searchTerm, 400);

	const [advancedFilters, setAdvancedFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
	const [tempFilters, setTempFilters] = useState(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
	
	const [savedViews, setSavedViews] = useState([]);
	const [quickFilter, setQuickFilter] = useState("all_products");
	
	const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
	const [tempSortConfig, setTempSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

	// --- Pagination ---
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);

	// --- Fetch Data ---
	const fetchProducts = useCallback(async () => {
		try {
			setLoading(true);
			const query = new URLSearchParams({
				page,
				limit,
				search: debouncedSearch.trim(),
				productCategoryId: advancedFilters.productCategory?.value || "",
				status: advancedFilters.status?.value || "",
				productOwnerId: advancedFilters.productOwnerId?.value || "",
				createdAt: advancedFilters.createdAt?.value || "",
				viewType: quickFilter === "active_products" ? "Active" : 
						  quickFilter === "inactive_products" ? "Inactive" : ""
			});

			const res = await fetch(`${BASE_URL_SM}/product/paginate?${query}`);
			if (!res.ok) throw new Error("Failed to fetch products");
			
			const data = await res.json();
			setProducts(data.items || []);
			setOriginalProducts(data.items || []);
			setTotalPages(data.totalPages || 1);
			setTotal(data.total);
			setPageInput(page);

		} catch (err) {
			console.error("Error fetching products:", err);
			toast.error("Error fetching products");
		} finally {
			setLoading(false);
			setRefreshSpin(false); 
		}
	}, [page, limit, debouncedSearch, advancedFilters, quickFilter]);

	const fetchProductCategories = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/product-category`);
			if (res.ok) {
				const data = await res.json();
				setProductCategories(data);
			}
		} catch (err) {
			console.error("Error fetching categories:", err);
		}
	};

	// New: Fetch User Profiles to map ID to Name
	const fetchUserProfiles = async () => {
		try {
			// Adjust endpoint if your user list is elsewhere (e.g. /user or /user/all)
			const res = await fetch(`${BASE_URL_SM}/user-profile`);
			if (res.ok) {
				const data = await res.json();
				setUserProfiles(data);
			}
		} catch (err) {
			console.error("Error fetching users:", err);
		}
	};

	useEffect(() => {
		fetchProducts();
	}, [fetchProducts]);

	useEffect(() => {
		fetchProductCategories();
		fetchUserProfiles(); // Fetch users on mount
		const saved = localStorage.getItem("productViews");
		if (saved) setSavedViews(JSON.parse(saved));
	}, []);

	// --- Helpers ---
	const getCellValue = (product, key) => {
		switch(key) {
			case 'productId': return product.productId;
			case 'name': return product.name;
			case 'category': return product.productCategory?.name || '-';
			case 'status': return product.status;
			
			case 'owner': {
				// 1. Try to find the user in the fetched list
				// Check against userId first (common pattern), or id if that's how it's stored
				const owner = userProfiles.find(u => u.userId === product.productOwnerId || u.id === product.productOwnerId);
				if (owner) {
					// Combine first/last if available, or use name/username
					if (owner.firstName || owner.lastName) return `${owner.firstName} ${owner.lastName}`;
					return owner.name || owner.userName || product.productOwnerId;
				}
				
				// 2. Fallback: If it matches current logged in user
				if (user && (product.productOwnerId === user.id || product.productOwnerId === user.userId)) {
					 return `${user.firstName} ${user.lastName}`;
				}

				// 3. Last Resort: Show ID
				return product.productOwnerId || '-';
			}

			case 'price': return product.unitPrice;
			case 'stock': return product.quantityInStock;
			case 'createdAt': return new Date(product.createdAt).toLocaleDateString();
			case 'vendor': return product.vendorName || '-';
			case 'manufacturer': return product.manufacturer || '-';
			
			// New Date Fields
			case 'salesStartDate':
			case 'salesEndDate':
			case 'supportStartDate':
			case 'supportEndDate':
				return product[key] ? new Date(product[key]).toLocaleDateString() : '-';
			// New Boolean Fields
			case 'isActiveStock':
			case 'taxable':
				return product[key] ? 'Yes' : 'No';
			// Default text/number fields
			default: return product[key] || '';
		}
	};

	// Client-side filtering for Column Search
	useEffect(() => {
		if (Object.keys(columnSearch).length === 0) {
			setProducts(originalProducts);
			return;
		}
		
		const filtered = originalProducts.filter(item => {
			return Object.entries(columnSearch).every(([key, value]) => {
				if (!value) return true;
				const cellValue = String(getCellValue(item, key)).toLowerCase();
				return cellValue.includes(value.toLowerCase());
			});
		});
		setProducts(filtered);
	}, [columnSearch, originalProducts, userProfiles]); // Re-run when userProfiles load


	const productCounts = useMemo(() => {
		return {
			all: total,
			active: products.filter(p => p.status === 'Active').length,
			inactive: products.filter(p => p.status === 'Inactive').length,
		};
	}, [products, total]);

	// --- ACTIONS: EXPORT & PRINT ---

	const handleExport = () => {
		const dataToExport = selectedRows.length > 0 
			? products.filter(p => selectedRows.includes(p.id)) 
			: products;

		if (dataToExport.length === 0) {
			toast.warn("No data available to export");
			return;
		}

		const safeString = (str) => (str === null || str === undefined ? "" : str.toString()).replace(/"/g, '""');
		const headers = ["Product ID", "Name", "Category", "Status", "Owner", "Price", "Stock", "Created At"];
		
		const csvRows = [
			headers.join(","),
			...dataToExport.map(p => [
				safeString(p.productId),
				`"${safeString(p.name)}"`,
				`"${safeString(p.productCategory?.name)}"`,
				safeString(p.status),
				`"${safeString(getCellValue(p, 'owner'))}"`, // Use helper to get name
				safeString(p.unitPrice),
				safeString(p.quantityInStock),
				new Date(p.createdAt).toLocaleDateString()
			].join(","))
		];

		const csvString = csvRows.join("\n");
		const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute("download", "products_export.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		setShowActionsModal(false);
		toast.success("Products exported successfully");
	};

	const handlePrintView = async () => {
		const itemsToPrint = selectedRows.length > 0 
			? selectedRows 
			: products.map(p => p.id); 

		if (itemsToPrint.length === 0) {
			toast.warn("No products to print.");
			return;
		}

		setShowActionsModal(false);
		const toastId = toast.loading("Preparing print view...");

		try {
			const fullDetails = await Promise.all(
				itemsToPrint.map(id => 
					fetch(`${BASE_URL_SM}/product/${id}`).then(res => res.json())
				)
			);

			const printWindow = window.open('', '_blank');
			if (!printWindow) {
				toast.error("Popup blocked. Please allow popups to print.");
				return;
			}

			const styles = `
				<style>
					body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0f1035; padding: 20px; }
					.page-break { page-break-after: always; display: block; border-bottom: 2px dashed #ccc; margin: 30px 0; padding-bottom: 30px; }
					.print-container { max-width: 900px; margin: 0 auto; }
					.header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #365486; padding-bottom: 10px; margin-bottom: 20px; }
					.header h1 { margin: 0; color: #365486; font-size: 24px; }
					.header span { font-size: 14px; color: #666; }
					.section { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; overflow: hidden; }
					.section-header { background: #f0f4f8; padding: 8px 15px; font-weight: bold; color: #365486; border-bottom: 1px solid #ddd; font-size: 16px; }
					.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; padding: 15px; }
					.field { display: flex; flex-direction: column; }
					.label { font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 600; }
					.value { font-size: 14px; color: #0f1035; min-height: 20px; }
					.full-width { grid-column: span 2; }
					.checkbox-field { flex-direction: row; align-items: center; gap: 8px; }
					input[type="checkbox"] { accent-color: #365486; }
					@media print {
						.page-break { border-bottom: none; height: 0; margin: 0; padding: 0; }
						body { padding: 0; }
						.section { break-inside: avoid; }
					}
				</style>
			`;

			let content = `<html><head><title>Print Products</title>${styles}</head><body><div class="print-container">`;

			fullDetails.forEach((item, index) => {
				const categoryName = item.productCategory?.name || "-";
				// Reuse logic to find owner name
				let ownerName = item.productOwnerId;
				const owner = userProfiles.find(u => u.userId === item.productOwnerId || u.id === item.productOwnerId);
				if (owner) {
					 if (owner.firstName || owner.lastName) ownerName = `${owner.firstName} ${owner.lastName}`;
					 else ownerName = owner.name;
				} else if(user && item.productOwnerId === user.id) {
					ownerName = `${user.firstName} ${user.lastName}`;
				}

				content += `
					<div class="${index < fullDetails.length - 1 ? 'page-break' : ''}">
						<div class="header">
							<h1>${item.name || "Product Details"}</h1>
							<span>${item.productId || ""}</span>
						</div>
						<div class="section">
							<div class="section-header">Overview</div>
							<div class="grid">
								<div class="field"><span class="label">Category</span><span class="value">${categoryName}</span></div>
								<div class="field"><span class="label">Unit Price</span><span class="value">${item.unitPrice || ""}</span></div>
								<div class="field"><span class="label">Vendor</span><span class="value">${item.vendorName || ""}</span></div>
								<div class="field"><span class="label">Qty Ordered</span><span class="value">${item.quantityOrdered || "0"}</span></div>
								<div class="field"><span class="label">Qty In Stock</span><span class="value">${item.quantityInStock || "0"}</span></div>
							</div>
						</div>
						<div class="section">
							<div class="section-header">Product Information</div>
							<div class="grid">
								<div class="field"><span class="label">Product Owner</span><span class="value">${ownerName || "-"}</span></div>
								<div class="field"><span class="label">Manufacturer</span><span class="value">${item.manufacturer || "-"}</span></div>
								<div class="field"><span class="label">Sales Start Date</span><span class="value">${item.salesStartDate ? new Date(item.salesStartDate).toLocaleDateString() : "-"}</span></div>
								<div class="field"><span class="label">Sales End Date</span><span class="value">${item.salesEndDate ? new Date(item.salesEndDate).toLocaleDateString() : "-"}</span></div>
								<div class="field"><span class="label">Support Start Date</span><span class="value">${item.supportStartDate ? new Date(item.supportStartDate).toLocaleDateString() : "-"}</span></div>
								<div class="field"><span class="label">Support End Date</span><span class="value">${item.supportEndDate ? new Date(item.supportEndDate).toLocaleDateString() : "-"}</span></div>
								<div class="field checkbox-field full-width">
									<input type="checkbox" ${item.isActiveStock ? "checked" : ""} disabled /> 
									<span class="label" style="margin:0">Product Active</span>
								</div>
							</div>
						</div>
					</div>
				`;
			});

			content += `</div><script>window.onload = function() { window.print(); window.close(); }</script></body></html>`;

			printWindow.document.write(content);
			printWindow.document.close();
			toast.dismiss(toastId);

		} catch (err) {
			console.error(err);
			toast.error("Failed to generate print view");
			toast.dismiss(toastId);
		}
	};

	// --- Navigation Handlers ---
	const handleViewClick = (e, id) => {
		e.stopPropagation();
		navigate(`/products/products/details/${id}`, { state: { mode: "view" } });
	};

	const handleEditClick = (e, id) => {
		e.stopPropagation();
		navigate(`/products/products/details/${id}`, { state: { mode: "edit" } });
	};

	const handlePageInputCommit = () => {
		const val = parseInt(pageInput);
		if (!isNaN(val) && val >= 1 && val <= totalPages) {
			setPage(val);
		} else {
			setPageInput(page);
		}
	};

	const handleGlobalReset = () => {
		setResetSpin(true);
		setSearchTerm("");
		setColumnSearch({}); // Reset column search
		setAdvancedFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
		setTempFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
		setQuickFilter("all_products");
		setSortConfig({ key: 'createdAt', direction: 'desc' });
		setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
		setPage(1);
		setTimeout(() => {
			fetchProducts();
			setResetSpin(false);
			toast.info("View reset to default");
		}, 500);
	};

	const openColumnControl = () => {
		const currentVisible = allColumns.filter(col => visibleColumns[col.key]).map(col => col.key);
		const currentAvailable = allColumns.filter(col => !visibleColumns[col.key]).map(col => col.key);
		setTempVisibleKeys(currentVisible);
		setTempAvailableKeys(currentAvailable);
		setSelectedAvailable([]);
		setSelectedVisible([]);
		setShowColumnControl(true);
	};

	const handleMoveToVisible = () => {
		setTempVisibleKeys([...tempVisibleKeys, ...selectedAvailable]);
		setTempAvailableKeys(tempAvailableKeys.filter(k => !selectedAvailable.includes(k)));
		setSelectedAvailable([]);
	};

	const handleMoveToAvailable = () => {
		setTempAvailableKeys([...tempAvailableKeys, ...selectedVisible]);
		setTempVisibleKeys(tempVisibleKeys.filter(k => !selectedVisible.includes(k)));
		setSelectedVisible([]);
	};

	const handleSaveColumns = () => {
		const newVisibleState = { actions: true };
		allColumns.forEach(col => newVisibleState[col.key] = false);
		tempVisibleKeys.forEach(key => newVisibleState[key] = true);
		setVisibleColumns(newVisibleState);
		setShowColumnControl(false);
		toast.success("Columns updated!");
	};

	const handleSort = (key, direction) => {
		setSortConfig({ key, direction });
		const sorted = [...products].sort((a, b) => {
			const valA = getCellValue(a, key);
			const valB = getCellValue(b, key);
			if (valA < valB) return direction === 'asc' ? -1 : 1;
			if (valA > valB) return direction === 'asc' ? 1 : -1;
			return 0;
		});
		setProducts(sorted);
		setActivePopupColumn(null);
	};

	const handleToggleAdvancedFilter = () => {
		if (!showAdvancedFilter) setTempFilters(advancedFilters);
		setShowAdvancedFilter(!showAdvancedFilter);
	};

	const updateAdvancedFilter = (field, key, value) => {
		setTempFilters(prev => ({ ...prev, [field]: { ...prev[field], [key]: value } }));
	};

	const toggleOperator = (field) => {
		setTempFilters(prev => ({ 
			...prev, 
			[field]: { ...prev[field], operator: prev[field].operator === 'include' ? 'exclude' : 'include' } 
		}));
	};

	const handleApplyAdvancedFilter = () => {
		setAdvancedFilters(tempFilters);
		setPage(1);
		toast.success("Filters applied");
	};

	const handleRestoreAdvancedFilter = () => {
		setTempFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
	};

	const handleSaveQuery = () => {
		const name = prompt("Enter view name:", "New Custom View");
		if (name) {
			const newView = { id: Date.now().toString(), name, filters: tempFilters };
			const updated = [...savedViews, newView];
			setSavedViews(updated);
			localStorage.setItem("productViews", JSON.stringify(updated));
			setQuickFilter(newView.id);
			setAdvancedFilters(tempFilters);
			toast.success("View saved");
		}
	};

	const handleDeleteView = (id) => {
		if(window.confirm("Delete this view?")) {
			const updated = savedViews.filter(v => v.id !== id);
			setSavedViews(updated);
			localStorage.setItem("productViews", JSON.stringify(updated));
			if(quickFilter === id) handleGlobalReset();
		}
	};

	const handleViewChange = (val) => {
		setQuickFilter(val);
		setPage(1);
		const saved = savedViews.find(v => v.id === val);
		if (saved) {
			setAdvancedFilters(saved.filters);
			setTempFilters(saved.filters);
			setShowAdvancedFilter(true);
		} else {
			if (!["active_products", "inactive_products", "all_products"].includes(val)) {
				setAdvancedFilters(JSON.parse(JSON.stringify(INITIAL_ADVANCED_STATE)));
			}
		}
	};

	const handleSelectAll = () => {
		if (selectedRows.length === products.length) setSelectedRows([]);
		else setSelectedRows(products.map(p => p.id));
	};

	const toggleRowSelection = (id) => {
		setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
	};

	const handleDeleteClick = (id) => {
		setDeleteProductId(id);
		setShowDeleteConfirm(true);
	};

	const handleDeleteConfirm = async () => {
		const idsToDelete = deleteProductId ? [deleteProductId] : selectedRows;
		try {
			await Promise.all(idsToDelete.map(id => 
				fetch(`${BASE_URL_SM}/product/${id}`, { method: "DELETE" })
			));
			toast.success("Deleted successfully");
			setProducts(prev => prev.filter(p => !idsToDelete.includes(p.id)));
			setSelectedRows([]);
			setDeleteProductId(null);
		} catch (err) {
			toast.error("Delete failed");
		} finally {
			setShowDeleteConfirm(false);
		}
	};

	const handleMassDelete = () => {
		if (!selectedRows.length) return toast.warn("Select products first");
		setShowActionsModal(false);
		setShowDeleteConfirm(true);
	};

	const renderHeaderCell = (col) => {
		if (!visibleColumns[col.key]) return null;
		const isPopupOpen = activePopupColumn === col.key;
		return (
			<th key={col.key} style={{ position: 'relative' }}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<div onClick={() => handleSort(col.key, sortConfig.direction === 'asc' ? 'desc' : 'asc')} style={{ cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>
						{col.label} 
						{sortConfig.key === col.key && (
							sortConfig.direction === 'asc' ? <ArrowUp size={14} className="sort-icon-active"/> : <ArrowDown size={14} className="sort-icon-active"/>
						)}
					</div>
					<button onClick={(e) => { e.stopPropagation(); setActivePopupColumn(isPopupOpen ? null : col.key); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
						<MoreVertical size={16} color="#666" />
					</button>
				</div>
				{isPopupOpen && (
					<div ref={popupRef} className="prod-header-popup-menu" onClick={e => e.stopPropagation()}>
						<button onClick={() => handleSort(col.key, 'asc')}><ArrowUp size={14} /> Ascending</button>
						<button onClick={() => handleSort(col.key, 'desc')}><ArrowDown size={14} /> Descending</button>
						<div className="popup-search">
							<input 
								type="text" 
								placeholder={`Search ${col.label}...`}
								autoFocus
								value={columnSearch[col.key] || ""}
								onChange={(e) => setColumnSearch({...columnSearch, [col.key]: e.target.value})}
							/>
						</div>
					</div>
				)}
			</th>
		);
	};

	useEffect(() => {
		function handleClickOutside(event) {
			if (actionRef.current && !actionRef.current.contains(event.target)) setShowActionsModal(false);
			if (popupRef.current && !popupRef.current.contains(event.target)) setActivePopupColumn(null);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="prod-management-container">
			{/* Stats */}
			<div className="prod-stats">
				<div className="prod-stat-item prod-stat-card--with-badge">
					<div className="prod-stat-badge"><div className="prod-stat-badge__inner">{total}</div></div>
					<div className="prod-stat-content"><div className="prod-stat-value">Total Products</div></div>
				</div>
			</div>

			{/* Actions Header */}
			<div className="prod-actions">
				<div className="prod-dropdown-container">
					<CircleUserRound size={20} className="user-round-icon" strokeWidth={1} />
					<ChevronDown size={16} className="dropdown-arrow-icon" />
					<select className="prod-dropdown-button" value={quickFilter} onChange={(e) => handleViewChange(e.target.value)}>
						<optgroup label="System Views">
							<option value="all_products">All Products ({productCounts.all})</option>
							<option value="active_products">Active Products</option>
							<option value="inactive_products">Inactive Products</option>
						</optgroup>
						{savedViews.length > 0 && (
							<optgroup label="Custom Views">
								{savedViews.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
							</optgroup>
						)}
					</select>
				</div>

				<div className="prod-search-container">
					<input type="text" placeholder="Search Product..." className="prod-search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
					<Search className="search-icon-small" size={20} color="#0f1035" strokeWidth={1} />
				</div>

				<div className="prod-action-icons">
					<button className="prod-create-btn" onClick={() => navigate("/products/products/create")}>
						<Plus size={15} strokeWidth={1} /> New
					</button>

					<button className="prod-icon-button-modern" title="Refresh" onClick={() => { setRefreshSpin(true); fetchProducts(); setTimeout(() => setRefreshSpin(false), 500); }}>
						<RefreshCcw className={refreshSpin ? "rotate-once" : ""} size={30} color="#0f1035" strokeWidth={1} />
					</button>

					<button className="prod-icon-button-modern" title="Sort" onClick={() => setShowSortModal(true)}>
						<ArrowUpDown size={30} color="#0f1035" strokeWidth={1} />
					</button>

					<button className={`prod-icon-button-modern ${showAdvancedFilter ? 'active-filter' : ''}`} title="Filters" onClick={handleToggleAdvancedFilter} style={{ backgroundColor: showAdvancedFilter ? '#dcf2f1' : 'transparent' }}>
						<Filter size={30} color="#0f1035" strokeWidth={1} />
					</button>

					<button className="prod-icon-button-modern" title="Columns" onClick={openColumnControl}>
						<Settings size={30} color="#0f1035" strokeWidth={1} />
					</button>

					<button className="prod-icon-button-modern" title="Reset" onClick={handleGlobalReset}>
						<RotateCcw className={resetSpin ? "rotate-once" : ""} size={30} color="#0f1035" strokeWidth={1} />
					</button>

					<div className="prod-action-button-container" ref={actionRef}>
						<button className="prod-action-button" onClick={() => setShowActionsModal(!showActionsModal)}>
							Actions <ChevronDown size={20} color="#dcf2f1" strokeWidth={2} />
						</button>
						{showActionsModal && (
							<div className="prod-action-modal-container">
								<ul className="prod-action-modal-list">
									<li onClick={handleMassDelete}>Mass Delete</li>
									<li onClick={handleExport}>Export</li>
									<li onClick={handlePrintView}>Print View</li>
								</ul>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Advanced Filters */}
			{showAdvancedFilter && (
				<div className="prod-filters-container">
					<div className="prod-filters-header">
						<h3><Filter size={18} style={{ marginRight: '8px' }}/> Filter</h3>
						<button className="prod-close-filters" onClick={() => setShowAdvancedFilter(false)}><X size={24}/></button>
					</div>
					<div className="advanced-filter-grid">
						{Object.keys(tempFilters).map((key) => {
							let label = allColumns.find(c => c.key === key)?.label || key;
							if (key === 'productCategory') label = 'Product Category';
							if (key === 'productOwnerId') label = 'Product Owner';
							
							const rule = tempFilters[key];
							return (
								<div key={key} className="advanced-filter-item">
									<label>{label}</label>
									<div className="advanced-input-group">
										<input 
											type={key === 'createdAt' ? 'date' : 'text'} 
											value={rule.value} 
											onChange={(e) => updateAdvancedFilter(key, 'value', e.target.value)} 
										/>
										<button 
											className={`operator-toggle ${rule.operator}`} 
											onClick={() => toggleOperator(key)}
											style={{ color: rule.operator === 'include' ? 'green' : 'red' }}
										>
											{rule.operator === 'include' ? <CheckCircle2 size={18}/> : <Ban size={18}/>}
										</button>
									</div>
								</div>
							);
						})}
					</div>
					<div className="advanced-filter-footer">
						<div style={{ display: 'flex', gap: '10px' }}>
							 <button className="prod-reset-btn-text" onClick={handleRestoreAdvancedFilter}><RotateCcw size={14}/> Restore</button>
							 <button className="prod-apply-btn" onClick={handleApplyAdvancedFilter}>Apply</button>
						</div>
						<div style={{ display: 'flex', gap: '10px' }}>
							<button className="prod-reset-btn-text" onClick={handleSaveQuery}><Copy size={14}/> Save Query</button>
							<button className="prod-reset-btn-text" onClick={() => setShowOrganizeModal(true)}><Settings size={14}/> Organize</button>
						</div>
					</div>
				</div>
			)}

			{/* Modals (Column Control, Sort, Organize Views) */}
			
			{showColumnControl && (
				<div className="prod-delete-confirm-overlay">
					<div className="prod-column-control-dialog">
						<div className="dialog-header">
							<h3>Manage Columns</h3>
							<button onClick={() => setShowColumnControl(false)}><X size={20}/></button>
						</div>
						<div className="column-control-body">
							<div className="column-list">
								<label>Available</label>
								<div className="list-box">
									{tempAvailableKeys.map(key => (
										<div key={key} onClick={() => setSelectedAvailable(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev, key])} className={selectedAvailable.includes(key) ? 'selected' : ''}>
											{allColumns.find(c=>c.key===key)?.label}
										</div>
									))}
								</div>
							</div>
							<div className="column-actions">
								<button onClick={handleMoveToVisible} disabled={!selectedAvailable.length}><ChevronRight/></button>
								<button onClick={handleMoveToAvailable} disabled={!selectedVisible.length}><ChevronLeft/></button>
							</div>
							<div className="column-list">
								<label>Visible</label>
								<div className="list-box">
									{tempVisibleKeys.map(key => (
										<div key={key} onClick={() => setSelectedVisible(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev, key])} className={selectedVisible.includes(key) ? 'selected' : ''}>
											{allColumns.find(c=>c.key===key)?.label}
										</div>
									))}
								</div>
							</div>
						</div>
						<div className="prod-dialog-buttons">
							<button className="prod-no-button" onClick={() => setShowColumnControl(false)}>Cancel</button>
							<button className="prod-yes-button" onClick={handleSaveColumns}>Save</button>
						</div>
					</div>
				</div>
			)}

			{showSortModal && (
				<div className="prod-delete-confirm-overlay">
					<div className="prod-delete-confirm-dialog" style={{ width: '300px' }}>
						<div className="dialog-header"><h3>Sort</h3></div>
						<div className="sort-modal-body">
							<h4>Sort Order</h4>
							<div className="radio-group">
								<label><input type="radio" checked={tempSortConfig.direction === 'asc'} onChange={() => setTempSortConfig(p => ({...p, direction: 'asc'}))} /> Ascending</label>
								<label><input type="radio" checked={tempSortConfig.direction === 'desc'} onChange={() => setTempSortConfig(p => ({...p, direction: 'desc'}))} /> Descending</label>
							</div>
							<h4>Sort By</h4>
							<div className="radio-group scrollable">
								{allColumns.map(col => (
									<label key={col.key}>
										<input type="radio" checked={tempSortConfig.key === col.key} onChange={() => setTempSortConfig(p => ({...p, key: col.key}))} /> {col.label}
									</label>
								))}
							</div>
						</div>
						<div className="prod-dialog-buttons">
							<button className="prod-no-button" onClick={() => setShowSortModal(false)}>Cancel</button>
							<button className="prod-yes-button" onClick={() => { setSortConfig(tempSortConfig); setShowSortModal(false); }}>OK</button>
						</div>
					</div>
				</div>
			)}
			
			{showOrganizeModal && (
				<div className="prod-delete-confirm-overlay">
					 <div className="prod-delete-confirm-dialog" style={{width: '400px'}}>
						 <div className="dialog-header"><h3>Organize Views</h3><button onClick={() => setShowOrganizeModal(false)}><X size={20}/></button></div>
						 <div style={{maxHeight:'300px', overflowY:'auto', margin:'15px 0'}}>
							 {savedViews.map(v => (
								 <div key={v.id} style={{display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee'}}>
									 <span>{v.name}</span>
									 <button onClick={() => handleDeleteView(v.id)} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}><Trash2 size={16}/></button>
								 </div>
							 ))}
							 {savedViews.length === 0 && <p style={{textAlign:'center', color:'#666'}}>No custom views.</p>}
						 </div>
					 </div>
				</div>
			)}

			{/* Table */}
			<div className="prod-table-container">
				<table className="prod-table">
					<thead>
						<tr>
							<th className="checkbox-column">
								<input type="checkbox" className="prod-custom-checkbox" checked={products.length > 0 && selectedRows.length === products.length} onChange={handleSelectAll} />
							</th>
							{allColumns.map(col => renderHeaderCell(col))}
							{visibleColumns.actions && <th>Actions</th>}
						</tr>
					</thead>
					<tbody>
						{products.length === 0 ? (
							<tr><td colSpan="100%" className="prod-empty-state">No Products Found</td></tr>
						) : (
							products.map(product => (
								<tr key={product.id} className={selectedRows.includes(product.id) ? "selected-row" : ""}>
									<td className="checkbox-column">
										<input type="checkbox" className="prod-custom-checkbox" checked={selectedRows.includes(product.id)} onChange={() => toggleRowSelection(product.id)} />
									</td>
									{allColumns.map(col => visibleColumns[col.key] && (
										<td key={col.key}>{getCellValue(product, col.key)}</td>
									))}
									{visibleColumns.actions && (
										<td>
											<div className="prod-table-action-buttons">
												<button className="prod-view-btn" onClick={(e) => handleViewClick(e, product.id)} title="View Details"><Eye size={18} strokeWidth={1}/></button>
												<button className="prod-edit-btn" onClick={(e) => handleEditClick(e, product.id)} title="Edit"><SquarePen size={18} strokeWidth={1}/></button>
												<button className="prod-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteClick(product.id); }} title="Delete"><Trash2 size={18} strokeWidth={1}/></button>
											</div>
										</td>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="prod-pagination">
				<div className="prod-pagination-left">
					<span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}>{selectedRows.length} Selected</span>
				</div>
				<div className="prod-pagination-right">
					<span style={{ fontSize: '14px', fontWeight: '500', color: '#365486' }}> Item Per Page </span>
					<select className="prod-items-per-page" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
						<option value={5}>5</option>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>

					<button className="prod-page-btn" onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft size={24} color="#dcf2f1"/></button>
					<button className="prod-page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}><CircleArrowLeft size={28} color="#dcf2f1"/></button>

					<div className="prod-page-input-container">
						<input 
							type="number" 
							className="prod-page-input" 
							value={pageInput} 
							min={1} max={totalPages}
							onChange={(e) => setPageInput(e.target.value)}
							onBlur={handlePageInputCommit}
							onKeyDown={(e) => e.key === 'Enter' && handlePageInputCommit()}
						/>
						<span className="prod-page-numbers">of {totalPages}</span>
					</div>

					<button className="prod-page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}><CircleArrowRight size={28} color="#dcf2f1"/></button>
					<button className="prod-page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={24} color="#dcf2f1"/></button>
				</div>
			</div>

			{/* Delete Modal */}
			{showDeleteConfirm && (
				<div className="prod-delete-confirm-overlay">
					<div className="prod-delete-confirm-dialog">
						<div className="prod-dialog-header"><h3>Confirm Delete?</h3></div>
						<div className="prod-dialog-buttons">
							<button className="prod-yes-button" onClick={handleDeleteConfirm}>Yes</button>
							<button className="prod-no-button" onClick={() => setShowDeleteConfirm(false)}>No</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Products;