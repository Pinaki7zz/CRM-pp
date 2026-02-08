import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateSalesOrder.css";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Trash2, Save, CircleX } from "lucide-react";
import { Country, State, City } from "country-state-city";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

const CreateSalesOrder = () => {
	const [formData, setFormData] = useState({
		orderOwnerId: "",
		orderId: "",
		name: "",
		opportunityId: "",
		accountId: "",
		primaryContactId: "",
		subject: "",
		amount: "",
		purchaseOrder: "",
		dueDate: "",
		status: "OPEN",
		commission: "",
		budget: "",
		billingCountry: "",
		billingState: "",
		billingCity: "",
		billingStreet: "",
		billingPostalCode: "",
		shippingCountry: "",
		shippingState: "",
		shippingCity: "",
		shippingStreet: "",
		shippingPostalCode: "",
		description: "",
	});
	const [items, setItems] = useState([
		{
			productId: "",
			quantity: "",
			unitPrice: "",
			discount: "",
			tax: "",
			totalPrice: "",
		},
	]);
	const [opportunities, setOpportunities] = useState([]);
	const [products, setProducts] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [availableContacts, setAvailableContacts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [billingCountries, setBillingCountries] = useState([]);
	const [billingStates, setBillingStates] = useState([]);
	const [billingCities, setBillingCities] = useState([]);
	const [shippingCountries, setShippingCountries] = useState([]);
	const [shippingStates, setShippingStates] = useState([]);
	const [shippingCities, setShippingCities] = useState([]);

	const navigate = useNavigate();
	const { user } = useAuth(); // if provider exposes loading

	useEffect(() => {
		// set default orderOwnerId to logged-in user if not already set
		if (user && !formData.orderOwnerId) {
			setFormData((prev) => ({ ...prev, orderOwnerId: user.id }));
		}
	}, [user]); // optionally include formData.orderOwnerId to avoid resetting later

	const getError = (field) => {
		const e = errors[field];
		if (!e) return null;
		// if array join, else return string
		return Array.isArray(e) ? e.join(", ") : e;
	};

	const handleChange = (e) => {
		const { id, value } = e.target;

		// ❗ Clear backend validation errors for the current field
		if (errors[id]) {
			setErrors((prev) => {
				const updated = { ...prev };
				delete updated[id];
				return updated;
			});
		}

		// When Opportunity Name is selected
		if (id === "opportunityId") {
			const selectedOpportunity = opportunities.find(
				(opp) => opp.id === value,
			);

			if (selectedOpportunity) {
				const relatedAccount = accounts.find(
					(acc) => acc.accountId === selectedOpportunity.accountId,
				);

				// ✅ Find contact with isPrimary = true
				const primaryContact = relatedAccount?.contacts?.find(
					(contact) => contact.isPrimary === true,
				);

				setFormData({
					...formData,
					opportunityId: value,
					accountId: relatedAccount?.accountId ?? "",
					primaryContactId: primaryContact?.contactId ?? "",
					amount: selectedOpportunity.amount ?? "",
				});

				setAvailableContacts(relatedAccount?.contacts || []);
				return;
			}
		}

		// Fallback for other inputs
		setFormData({
			...formData,
			[id]: value,
		});
	};

	const handleSave = async (type) => {
		try {
			setLoading(true);

			// Build orderData (parent record)
			const orderData = {
				orderOwnerId: formData.orderOwnerId,
				orderId: formData.orderId,
				name: formData.name,
				opportunityId: formData.opportunityId,
				accountId: formData.accountId,
				primaryContactId: formData.primaryContactId,
				subject: formData.subject,
				amount: parseFloat(formData.amount),
				purchaseOrder: formData.purchaseOrder
					? parseFloat(formData.purchaseOrder)
					: 0,
				dueDate: formData.dueDate
					? new Date(formData.dueDate).toISOString()
					: null,
				status: formData.status || "OPEN",
				commission: formData.commission
					? parseFloat(formData.commission)
					: 0,
				budget: formData.budget ? parseFloat(formData.budget) : 0,
				billingCountry: formData.billingCountry ?? "",
				billingState: formData.billingState ?? "",
				billingCity: formData.billingCity ?? "",
				billingStreet: formData.billingStreet ?? "",
				billingPostalCode: formData.billingPostalCode ?? "",
				shippingCountry: formData.shippingCountry ?? "",
				shippingState: formData.shippingState ?? "",
				shippingCity: formData.shippingCity ?? "",
				shippingStreet: formData.shippingStreet ?? "",
				shippingPostalCode: formData.shippingPostalCode ?? "",
				description: formData.description,
			};

			// Build items array
			const itemsPayload = items.map((item) => ({
				orderId: formData.orderId,
				productId: item.productId,
				productName:
					products.find((p) => p.productId === item.productId)
						?.name || "",
				quantity: parseFloat(item.quantity),
				unitPrice: parseFloat(item.unitPrice),
				discount: item.discount ? parseFloat(item.discount) : 0,
				tax: parseFloat(item.tax),
				totalPrice: parseFloat(item.totalPrice),
			}));

			// Single request containing both parent and children
			const response = await fetch(`${BASE_URL_SM}/sales-order`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					orderData,
					items: itemsPayload,
				}),
			});

			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				if (payload && Array.isArray(payload.errors)) {
					const map = {};

					payload.errors.forEach((err) => {
						let key = err.path;

						// 🔥 Normalize nested keys
						if (key.startsWith("orderData.")) {
							key = key.replace("orderData.", "");
						}

						// 🔥 Normalize items[i].field
						const itemMatch = key.match(/^items\[\d+\]\.(.+)$/);
						if (itemMatch) {
							key = itemMatch[1]; // e.g., items[0].productId → productId
						}

						if (!map[key]) map[key] = [];
						map[key].push(err.msg);
					});

					setErrors(map);
					toast.error("Validation failed");
					return;
				}

				toast.error("Failed to create sales order");
				return;
			}

			// Success
			toast.success("Sales order created successfully!");

			if (type === "save") {
				navigate("/sales/sales-order");
			} else if (type === "saveAndNew") {
				navigate("/sales/sales-order/create");
			}
		} catch (error) {
			console.error("Failed to save sales order:", error);
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const calculateTotalPrice = (
		quantity,
		price,
		discountPercent,
		taxPercent,
	) => {
		const qty = parseFloat(quantity) || 0;
		const p = parseFloat(price) || 0;
		const d = parseFloat(discountPercent) || 0;
		const t = parseFloat(taxPercent) || 0;

		const subtotal = qty * p;

		// ✅ Percentage discount
		const discountAmount = subtotal * (d / 100);
		const discounted = subtotal - discountAmount;

		// ✅ Percentage tax
		const taxAmount = discounted * (t / 100);
		const total = discounted + taxAmount;

		return Number(total.toFixed(2));
	};

	const calculateOrderAmount = (items) => {
		return items.reduce((sum, item) => {
			const value = parseFloat(item.totalPrice);
			return sum + (isNaN(value) ? 0 : value);
		}, 0);
	};

	useEffect(() => {
		const totalAmount = calculateOrderAmount(items);

		setFormData((prev) => ({
			...prev,
			amount: totalAmount > 0 ? totalAmount.toFixed(2) : "",
		}));
	}, [items]);

	const handleItemChange = (index, field, value) => {
		setItems((prevItems) => {
			const updated = [...prevItems];
			const item = { ...updated[index], [field]: value };

			// If you change productId, update unitPrice/tax off the product too
			if (field === "productId") {
				const prod = products.find((p) => p.productId === value);
				if (prod) {
					item.unitPrice = prod.unitPrice ?? 0;
					item.tax = prod.tax ?? 0;
				}
			}

			// ANY time quantity, unitPrice, discount, or tax changes, recalc totalPrice
			if (
				[
					"quantity",
					"unitPrice",
					"discount",
					"tax",
					"productId",
				].includes(field)
			) {
				item.totalPrice =
					calculateTotalPrice(
						item.quantity ?? 0,
						item.unitPrice ?? 0,
						item.discount ?? 0,
						item.tax ?? 0,
					) ?? 0;
			}

			updated[index] = item;
			return updated;
		});
	};

	const addItem = () => {
		setItems((items) => [
			...items,
			{
				productId: "",
				quantity: "",
				unitPrice: "",
				discount: "",
				tax: "",
				totalPrice: "",
			},
		]);
	};

	const removeItem = (index) => {
		setItems((items) => items.filter((_, i) => i !== index));
	};

	const fetchAllOpportunities = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/opportunity/ids-names`);
			if (!res.ok) {
				alert("Failed to fetch opportunities");
				return;
			}
			const data = await res.json();
			setOpportunities(data);
		} catch (err) {
			console.error("Error fetching opportunities:", err);
			alert("Error fetching opportunities");
		}
	};

	const fetchAllProducts = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/product`);
			if (!res.ok) {
				alert("Failed to fetch products");
				return;
			}
			const data = await res.json();
			setProducts(data);
		} catch (err) {
			console.error("Error fetching products:", err);
			alert("Error fetching products");
		}
	};

	const fetchAllAccounts = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/ids-names`);
			if (!res.ok) {
				alert("Failed to fetch accounts");
				return;
			}
			const data = await res.json();
			setAccounts(data);
		} catch (err) {
			console.error("Error fetching accounts:", err);
			alert("Error fetching accounts");
		}
	};

	const fetchNextOrderId = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/sales-order/next-orderid`);
			if (!res.ok) {
				toast.error("Failed to fetch Order ID");
				return;
			}
			const data = await res.json();
			setFormData((prev) => ({
				...prev,
				orderId: data.orderId,
			}));
		} catch (error) {
			console.error("Error fetching Order ID:", error);
			toast.error("Error fetching Order ID");
		}
	};

	useEffect(() => {
		if (!formData.accountId) return;

		const acc = accounts.find((a) => a.accountId === formData.accountId);
		if (!acc) return;

		setFormData((f) => ({
			...f,
			billingCountry: acc.billingCountry,
			billingState: acc.billingState,
			billingCity: acc.billingCity,
			billingStreet: acc.billingAddressLine1,
			billingPostalCode: acc.billingZipCode,
			shippingCountry: acc.shippingCountry,
			shippingState: acc.shippingState,
			shippingCity: acc.shippingCity,
			shippingStreet: acc.shippingAddressLine1,
			shippingPostalCode: acc.shippingZipCode,
		}));
	}, [formData.accountId, accounts]);

	useEffect(() => {
		fetchAllProducts();
		fetchAllAccounts();
		fetchAllOpportunities();
		fetchNextOrderId();
		setBillingCountries(Country.getAllCountries());
		setShippingCountries(Country.getAllCountries());
	}, []);

	const handleBillingCountryChange = (e) => {
		const selected = e.target.value;
		setFormData({
			...formData,
			billingCountry: selected,
			billingState: "",
			billingCity: "",
		});

		const countryObj = billingCountries.find((c) => c.name === selected);
		if (countryObj) {
			setBillingStates(State.getStatesOfCountry(countryObj.isoCode));
			setBillingCities([]);
		} else {
			setBillingStates([]);
			setBillingCities([]);
		}
	};

	const handleBillingStateChange = (e) => {
		const selectedState = e.target.value;
		setFormData({
			...formData,
			billingState: selectedState,
			billingCity: "",
		});

		const countryObj = billingCountries.find(
			(c) => c.name === formData.billingCountry,
		);
		const stateObj = billingStates.find((s) => s.name === selectedState);

		if (countryObj && stateObj) {
			const cityList = City.getCitiesOfState(
				countryObj.isoCode,
				stateObj.isoCode,
			);
			setBillingCities(cityList);
		} else {
			setBillingCities([]);
		}
	};

	useEffect(() => {
		if (
			formData.billingCountry === "India" &&
			(formData.billingPostalCode || "").length === 6
		) {
			validateIndianPinCode(formData.billingPostalCode).then((result) => {
				if (result.valid) {
					const stateMatch =
						result.state.toLowerCase() ===
						formData.billingState.toLowerCase();

					if (!stateMatch) {
						console.warn(
							`PIN code doesn't match selected State. Expected State: ${result.state}`,
						);
					}
				} else {
					console.error(result.message);
				}
			});
		}
	}, [formData.billingPostalCode, formData.billingCountry]);

	const handleShippingCountryChange = (e) => {
		const selected = e.target.value;
		setFormData({
			...formData,
			shippingCountry: selected,
			shippingState: "",
			shippingCity: "",
		});

		const countryObj = shippingCountries.find((c) => c.name === selected);
		if (countryObj) {
			setShippingStates(State.getStatesOfCountry(countryObj.isoCode));
			setShippingCities([]);
		} else {
			setShippingStates([]);
			setShippingCities([]);
		}
	};

	const handleShippingStateChange = (e) => {
		const selectedState = e.target.value;
		setFormData({
			...formData,
			shippingState: selectedState,
			shippingCity: "",
		});

		const countryObj = shippingCountries.find(
			(c) => c.name === formData.shippingCountry,
		);
		const stateObj = billingStates.find((s) => s.name === selectedState);

		if (countryObj && stateObj) {
			const cityList = City.getCitiesOfState(
				countryObj.isoCode,
				stateObj.isoCode,
			);
			setShippingCities(cityList);
		} else {
			setShippingCities([]);
		}
	};

	useEffect(() => {
		if (
			formData.shippingCountry === "India" &&
			(formData.shippingPostalCode || "").length === 6
		) {
			validateIndianPinCode(formData.shippingPostalCode).then(
				(result) => {
					if (result.valid) {
						const stateMatch =
							result.state.toLowerCase() ===
							formData.shippingState.toLowerCase();

						if (!stateMatch) {
							console.warn(
								`PIN code doesn't match selected State. Expected State: ${result.state}`,
							);
						}
					} else {
						console.error(result.message);
					}
				},
			);
		}
	}, [formData.shippingPostalCode, formData.shippingCountry]);

	const validateIndianPinCode = async (postalCode) => {
		try {
			const res = await fetch(
				`https://api.postalpincode.in/pincode/${postalCode}`,
			);
			const data = await res.json();

			if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
				const postOffice = data[0].PostOffice[0];
				return {
					valid: true,
					district: postOffice.District,
					state: postOffice.State,
					country: postOffice.Country,
				};
			} else {
				return {
					valid: false,
					message: "Invalid PIN Code. Please select correct State.",
				};
			}
		} catch (err) {
			return {
				valid: false,
				message: "API error while validating pincode.",
			};
		}
	};

	return (
		<div className="so-create-container">
			{/* Create Sales Order Page Header Section */}
			<div className="so-create-header-container">
				<h1 className="so-create-heading">New Sales Order</h1>
				<div className="so-create-header-container-buttons">
					<button
						className="so-create-save-button"
						onClick={() => handleSave("save")}
					>
						<Save size={17} strokeWidth={1} color="#dcf2f1" />
						{loading ? "Saving..." : "Save"}
					</button>
					<button
						className="so-create-save-and-new-button"
						onClick={() => handleSave("saveAndNew")}
					>
						<Save size={17} strokeWidth={1} color="#0f1035" />
						{loading ? "Saving..." : "Save and New"}
					</button>
					<button
						className="so-create-cancel-button"
						onClick={() => navigate("/sales/sales-quote")}
					>
						<CircleX size={17} strokeWidth={1} color="#0f1035" />
						Cancel
					</button>
				</div>
			</div>

			{/* Sales Order Information Container */}
			<div className="so-create-form-container">
				<h1 className="so-create-form-heading">
					Sales Order Information
				</h1>
				<div className="so-create-form">
					<form>
						<div className="so-create-form-row">
							<div className="so-create-form-group orderOwnerId">
								<label htmlFor="orderOwnerId">
									Order Owner *
								</label>
								<input
									type="text"
									id="orderOwnerId"
									placeholder="Enter Quote Owner"
									value={
										user
											? `${user.firstName} ${user.lastName} (You)`
											: "--"
									}
									disabled
								/>
								{getError("orderOwnerId") && (
									<div className="field-error">
										{getError("orderOwnerId")}
									</div>
								)}
							</div>
							<div className="so-create-form-group orderId">
								<label htmlFor="orderId">Order ID *</label>
								<input
									id="orderId"
									value={formData.orderId || ""}
									disabled
								/>
								{getError("orderId") && (
									<div className="field-error">
										{getError("orderId")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group name">
								<label htmlFor="name">Order Name *</label>
								<input
									type="text"
									id="name"
									value={formData.name}
									onChange={handleChange}
									placeholder="Enter Order Name"
								/>
								{getError("name") && (
									<div className="field-error">
										{getError("name")}
									</div>
								)}
							</div>
							<div className="so-create-form-group opportunityId">
								<label htmlFor="opportunityId">
									Opp. Name *
								</label>
								<select
									id="opportunityId"
									value={formData.opportunityId}
									onChange={handleChange}
								>
									<option value="">Select Opportunity</option>
									{opportunities.map((opp) => (
										<option key={opp.id} value={opp.id}>
											{opp.name}
										</option>
									))}
								</select>
								{getError("opportunityId") && (
									<div className="field-error">
										{getError("opportunityId")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group accountId">
								<label htmlFor="accountId">Account Name</label>
								<select
									id="accountId"
									value={formData.accountId}
									onChange={handleChange}
								>
									<option value="">Select Account</option>
									{accounts.map((account) => (
										<option
											key={account.accountId}
											value={account.accountId}
										>
											{account.name}
										</option>
									))}
								</select>
								{getError("accountId") && (
									<div className="field-error">
										{getError("accountId")}
									</div>
								)}
							</div>
							<div className="so-create-form-group primaryContactId">
								<label htmlFor="primaryContactId">
									Primary Contact
								</label>
								<select
									id="primaryContactId"
									value={formData.primaryContactId}
									onChange={handleChange}
								>
									<option value="">
										Select Primary Contact
									</option>
									{availableContacts.map((contact) => (
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
						<div className="so-create-form-row">
							<div className="so-create-form-group subject">
								<label htmlFor="subject">Subject</label>
								<input
									type="text"
									placeholder="Enter Subject"
									id="subject"
									value={formData.subject}
									onChange={handleChange}
								/>
								{getError("subject") && (
									<div className="field-error">
										{getError("subject")}
									</div>
								)}
							</div>
							<div className="so-create-form-group amount">
								<label htmlFor="amount">Amount *</label>
								<input
									type="number"
									placeholder="Enter Amount"
									id="amount"
									value={formData.amount}
									onChange={handleChange}
									disabled
								/>
								{getError("amount") && (
									<div className="field-error">
										{getError("amount")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group purchaseOrder">
								<label htmlFor="purchaseOrder">
									Purchase Order
								</label>
								<input
									type="text"
									placeholder="Enter Purchase Order"
									id="purchaseOrder"
									value={formData.purchaseOrder}
									onChange={handleChange}
								/>
								{getError("purchaseOrder") && (
									<div className="field-error">
										{getError("purchaseOrder")}
									</div>
								)}
							</div>
							<div className="so-create-form-group dueDate">
								<label htmlFor="dueDate">Due Date *</label>
								<input
									type="date"
									placeholder="Enter Due Date"
									id="dueDate"
									value={formData.dueDate}
									onChange={handleChange}
								/>
								{getError("dueDate") && (
									<div className="field-error">
										{getError("dueDate")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group status">
								<label htmlFor="status">Status</label>
								<select
									id="status"
									value={formData.status}
									onChange={handleChange}
								>
									<option value="">Select Status</option>
									<option value="PENDING">Pending</option>
									<option value="IN_PROGRESS">
										In Progress
									</option>
									<option value="CONFIRMED">Confirmed</option>
									<option value="SHIPPED">Shipped</option>
									<option value="DELIVERED">Delivered</option>
									<option value="CANCELLED">Cancelled</option>
								</select>
								{getError("status") && (
									<div className="field-error">
										{getError("status")}
									</div>
								)}
							</div>
							<div className="so-create-form-group commission">
								<label htmlFor="commission">Commission</label>
								<input
									type="number"
									placeholder="Enter Commission"
									id="commission"
									value={formData.commission}
									onChange={handleChange}
								/>
								{getError("commission") && (
									<div className="field-error">
										{getError("commission")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group budget">
								<label htmlFor="budget">Budget</label>
								<input
									type="number"
									placeholder="Enter Budget"
									id="budget"
									value={formData.budget}
									onChange={handleChange}
								/>
								{getError("budget") && (
									<div className="field-error">
										{getError("budget")}
									</div>
								)}
							</div>
							<div
								className="so-create-form-group status"
								style={{ visibility: "hidden" }}
							></div>
						</div>

						<span className="required-field-text">
							* Required Field
						</span>
					</form>
				</div>
			</div>

			{/* Address Information Container */}
			<div className="so-create-form-container">
				<h1 className="so-create-form-heading">Address Information</h1>
				<div className="so-create-form">
					<form>
						<div className="so-create-form-row">
							<div className="so-create-form-group billingCountry">
								<label htmlFor="billingCountry">
									Billing Country *
								</label>
								<select
									id="billingCountry"
									name="billingCountry"
									value={formData.billingCountry}
									onChange={handleBillingCountryChange}
								>
									<option value="">
										Select Billing Country
									</option>
									{billingCountries.map((country) => (
										<option
											key={country.isoCode}
											value={country.name}
										>
											{country.name}
										</option>
									))}
								</select>
								{getError("billingCountry") && (
									<div className="field-error">
										{getError("billingCountry")}
									</div>
								)}
							</div>
							<div className="so-create-form-group shippingCountry">
								<label htmlFor="shippingCountry">
									Shipping Country *
								</label>
								<select
									id="shippingCountry"
									name="shippingCountry"
									value={formData.shippingCountry}
									onChange={handleShippingCountryChange}
								>
									<option value="">
										Select Shipping Country
									</option>
									{shippingCountries.map((country) => (
										<option
											key={country.isoCode}
											value={country.name}
										>
											{country.name}
										</option>
									))}
								</select>
								{getError("shippingCountry") && (
									<div className="field-error">
										{getError("shippingCountry")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group billingState">
								<label htmlFor="billingState">
									Billing State *
								</label>
								<select
									id="billingState"
									name="billingState"
									value={formData.billingState}
									onChange={handleBillingStateChange}
									disabled={!billingStates.length}
								>
									<option value="">
										Select Billing State
									</option>
									{billingStates.map((state) => (
										<option
											key={state.isoCode}
											value={state.name}
										>
											{state.name}
										</option>
									))}
								</select>
								{getError("billingState") && (
									<div className="field-error">
										{getError("billingState")}
									</div>
								)}
							</div>
							<div className="so-create-form-group shippingState">
								<label htmlFor="shippingState">
									Shipping State *
								</label>
								<select
									id="shippingState"
									name="shippingState"
									value={formData.shippingState}
									onChange={handleShippingStateChange}
									disabled={!shippingStates.length}
								>
									<option value="">
										Select Shipping State
									</option>
									{shippingStates.map((state) => (
										<option
											key={state.isoCode}
											value={state.name}
										>
											{state.name}
										</option>
									))}
								</select>
								{getError("shippingState") && (
									<div className="field-error">
										{getError("shippingState")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group billingCity">
								<label htmlFor="billingCity">
									Billing City *
								</label>
								<select
									id="billingCity"
									name="billingCity"
									value={formData.billingCity}
									onChange={handleChange}
									disabled={!billingCities.length}
								>
									<option value="">
										Select Billing City
									</option>
									{billingCities.map((city) => (
										<option
											key={city.name}
											value={city.name}
										>
											{city.name}
										</option>
									))}
								</select>
								{getError("billingCity") && (
									<div className="field-error">
										{getError("billingCity")}
									</div>
								)}
							</div>
							<div className="so-create-form-group shippingCity">
								<label htmlFor="shippingCity">
									Shipping City *
								</label>
								<select
									id="shippingCity"
									name="shippingCity"
									value={formData.shippingCity}
									onChange={handleChange}
									disabled={!shippingCities.length}
								>
									<option value="">
										Select Shipping City
									</option>
									{shippingCities.map((city) => (
										<option
											key={city.name}
											value={city.name}
										>
											{city.name}
										</option>
									))}
								</select>
								{getError("shippingCity") && (
									<div className="field-error">
										{getError("shippingCity")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group billingStreet">
								<label htmlFor="billingStreet">
									Billing Street *
								</label>
								<input
									type="text"
									id="billingStreet"
									placeholder="Enter Billing Street"
									value={formData.billingStreet}
									onChange={handleChange}
								/>
								{getError("billingStreet") && (
									<div className="field-error">
										{getError("billingStreet")}
									</div>
								)}
							</div>
							<div className="so-create-form-group shippingStreet">
								<label htmlFor="shippingStreet">
									Shipping Street *
								</label>
								<input
									type="text"
									id="shippingStreet"
									placeholder="Enter Shipping Street"
									value={formData.shippingStreet}
									onChange={handleChange}
								/>
								{getError("shippingStreet") && (
									<div className="field-error">
										{getError("shippingStreet")}
									</div>
								)}
							</div>
						</div>
						<div className="so-create-form-row">
							<div className="so-create-form-group billingPostalCode">
								<label htmlFor="billingPostalCode">
									Billing Zip/Postal Code *
								</label>
								<input
									type="text"
									id="billingPostalCode"
									name="billingPostalCode"
									value={formData.billingPostalCode}
									onChange={handleChange}
									maxLength={10}
									placeholder="Enter Zip/Postal Code"
								/>
								{getError("billingPostalCode") && (
									<div className="field-error">
										{getError("billingPostalCode")}
									</div>
								)}
							</div>
							<div className="so-create-form-group shippingPostalCode">
								<label htmlFor="shippingPostalCode">
									Shipping Zip/Postal Code *
								</label>
								<input
									type="text"
									id="shippingPostalCode"
									name="shippingPostalCode"
									value={formData.shippingPostalCode}
									onChange={handleChange}
									maxLength={10}
									placeholder="Enter Zip/Postal Code"
								/>
								{getError("shippingPostalCode") && (
									<div className="field-error">
										{getError("shippingPostalCode")}
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

			{/* Product Information Container */}
			<div className="so-create-table-container">
				<h1 className="so-create-table-heading">Product Information</h1>
				<div className="so-create-table-area">
					<div className="so-create-table-box">
						<table className="so-create-table">
							<thead>
								<tr>
									<th>Sl. No.</th>
									<th>Product Name *</th>
									<th>Quantity *</th>
									<th>Billing Amount *</th>
									<th>Discount %</th>
									<th>Tax %</th>
									<th>Total Price *</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{items.map((item, idx) => (
									<tr key={idx}>
										<td>{idx + 1}.</td>
										<td>
											<div className="so-create-table-data">
												<select
													id="productId"
													value={item.productId}
													onChange={(e) =>
														handleItemChange(
															idx,
															"productId",
															e.target.value,
														)
													}
												>
													<option value="">
														Select Product
													</option>
													{products.map((p) => (
														<option
															key={p.productId}
															value={p.productId}
														>
															{p.name}
														</option>
													))}
												</select>
												{getError("productId") && (
													<div className="field-error">
														{getError("productId")}
													</div>
												)}
											</div>
										</td>
										<td>
											<div className="so-create-table-data">
												<input
													id="quantity"
													type="number"
													value={item.quantity}
													onChange={(e) =>
														handleItemChange(
															idx,
															"quantity",
															e.target.value,
														)
													}
													placeholder="Enter Quantity"
													min={0}
												/>
												{getError("quantity") && (
													<div className="field-error">
														{getError("quantity")}
													</div>
												)}
											</div>
										</td>
										<td>
											<div className="so-create-table-data">
												<input
													id="unitPrice"
													type="number"
													value={item.unitPrice ?? ""}
													onChange={(e) =>
														handleItemChange(
															idx,
															"unitPrice",
															e.target.value,
														)
													}
													placeholder="Billing Amount"
													disabled
												/>
												{getError("unitPrice") && (
													<div className="field-error">
														{getError("unitPrice")}
													</div>
												)}
											</div>
										</td>
										<td>
											<div className="so-create-table-data">
												<input
													id="discount"
													type="number"
													value={item.discount}
													onChange={(e) =>
														handleItemChange(
															idx,
															"discount",
															e.target.value,
														)
													}
													placeholder="Enter Discount"
													min={0}
													max={100}
												/>
												{getError("discount") && (
													<div className="field-error">
														{getError("discount")}
													</div>
												)}
											</div>
										</td>
										<td>
											<div className="so-create-table-data">
												<input
													id="tax"
													type="number"
													value={item.tax}
													onChange={(e) =>
														handleItemChange(
															idx,
															"tax",
															e.target.value,
														)
													}
													placeholder="Enter Tax"
													min={0}
													max={100}
												/>
												{getError("tax") && (
													<div className="field-error">
														{getError("tax")}
													</div>
												)}
											</div>
										</td>
										<td>
											<div className="so-create-table-data">
												<input
													id="totalPrice"
													type="number"
													value={
														item.totalPrice ?? ""
													}
													placeholder="Total Price"
													disabled
												/>
												{getError("totalPrice") && (
													<div className="field-error">
														{getError("totalPrice")}
													</div>
												)}
											</div>
										</td>
										<td>
											<button
												className="so-create-product-delete-btn"
												type="button"
												onClick={() => removeItem(idx)}
												title="Delete Product"
											>
												<Trash2
													color="#365486"
													size={25}
													strokeWidth={1}
												/>
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="so-create-table-bottom">
						<span>* Required Field</span>
						<button
							className="so-create-add-product-btn"
							type="button"
							onClick={addItem}
						>
							<Plus size={20} strokeWidth={1} color="#dcf2f1" />
							Add Product
						</button>
					</div>
				</div>
			</div>

			{/* Terms and Conditions Container */}
			<div className="so-create-misc-container">
				<h1 className="so-create-misc-heading">Terms and Conditions</h1>
				<div className="so-create-terms-content">
					<section>
						<h2>1. Introduction</h2>
						<p>
							Welcome to our website. These Terms and Conditions
							govern your use of our services.
						</p>
					</section>

					<section>
						<h2>2. Acceptance of Terms</h2>
						<p>
							By accessing or using our website, you agree to
							comply with and be bound by these Terms and
							Conditions.
						</p>
					</section>

					<section>
						<h2>3. User Rights</h2>
						<p>
							We respect your rights and strive to provide a fair
							and transparent service.
						</p>
					</section>

					<section>
						<h2>4. Limitations of Liability</h2>
						<p>
							Our liability is limited to the maximum extent
							permitted by applicable law.
						</p>
					</section>
				</div>
			</div>

			{/* Description Container */}
			<div className="so-create-form-container">
				<h1 className="so-create-form-heading">Description</h1>
				<div className="so-create-form">
					<form>
						<div className="so-create-form-group description">
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
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateSalesOrder;
