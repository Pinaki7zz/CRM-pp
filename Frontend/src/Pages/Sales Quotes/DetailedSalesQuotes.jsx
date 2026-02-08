import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Paperclip,
	Plus,
	Pencil,
	SquarePen,
	Mail,
	Repeat,
	CircleX,
	Save,
	Trash2,
	Phone,
	ListChecks,
	LaptopMinimal,
	X,
	User,
	ListTodo,
	Calendar,
} from "lucide-react";
import "./DetailedSalesQuotes.css";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import { Country, State, City } from "country-state-city";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;
const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;

const DetailedSalesQuotes = () => {
	const [menuModal, setMenuModal] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(true);
	const [originalData, setOriginalData] = useState(null);
	const [formData, setFormData] = useState({
		quoteOwnerId: "",
		name: "",
		opportunityId: "",
		accountId: "",
		primaryContactId: "",
		subject: "",
		amount: "",
		successRate: "",
		dueDate: "",
		status: "",
		billingStreet: "",
		billingCity: "",
		billingState: "",
		billingCountry: "",
		billingPostalCode: "",
		shippingStreet: "",
		shippingCity: "",
		shippingState: "",
		shippingCountry: "",
		shippingPostalCode: "",
		description: "",
		notes: "",
		items: [],
		opportunity: {},
	});
	const [users, setUsers] = useState([]);
	const [accounts, setAccounts] = useState([]);
	const [opportunities, setOpportunities] = useState([]);
	const [availableContacts, setAvailableContacts] = useState([]);
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
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({}); // { ownerId: "Owner ID is required", name: "..." }
	const [billingCountries, setBillingCountries] = useState([]);
	const [billingStates, setBillingStates] = useState([]);
	const [billingCities, setBillingCities] = useState([]);
	const [shippingCountries, setShippingCountries] = useState([]);
	const [shippingStates, setShippingStates] = useState([]);
	const [shippingCities, setShippingCities] = useState([]);
	const [activeTab, setActiveTab] = useState("overview");
	const [activities, setActivities] = useState([]);
	const [showConvertModal, setShowConvertModal] = useState(false);
	const [attachments, setAttachments] = useState([]);
	const [activeEmailTab, setActiveEmailTab] = useState("interactions");
	const [emailInteractions, setEmailInteractions] = useState([]);
	const [emailDrafts, setEmailDrafts] = useState([]);
	const [selectedEmailInteraction, setSelectedEmailInteraction] =
		useState(null);
	const [showComposeMail, setShowComposeMail] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [composeMailData, setComposeMailData] = useState({
		to: "",
		cc: "",
		bcc: "",
		subject: "",
		body: "",
		id: null,
	});
	const [composeMailAttachments, setComposeMailAttachments] = useState([]);
	const [notes, setNotes] = useState([]);
	const [showNoteModal, setShowNoteModal] = useState(false);
	const [newNote, setNewNote] = useState("");

	const { id } = useParams(); // ← quote ID from URL
	const actionRef = useRef();
	const { user } = useAuth();
	const navigate = useNavigate();
	const fileInputRef = useRef(null);
	const composeFileRef = useRef(null);

	useEffect(() => {
		// set default quoteOwnerId to logged-in user if not already set
		if (user && !formData.quoteOwnerId) {
			setFormData((prev) => ({ ...prev, quoteOwnerId: user.id }));
		}
	}, [user]); // optionally include formData.quoteOwnerId to avoid resetting later

	const getError = (field) => {
		const e = errors[field];
		if (!e) return null;
		// if array join, else return string
		return Array.isArray(e) ? e.join(", ") : e;
	};

	// 1️⃣ Fetch the quote on mount
	const fetchSalesQuote = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/sales-quote/${id}`);
			if (!res.ok) {
				toast.error("Failed to fetch sales quote");
				return;
			}
			const data = await res.json();
			console.log(data);
			const normalized = {
				quoteId: data.quoteId ?? "",
				quoteOwnerId: data.quoteOwnerId ?? "",
				name: data.name ?? "",
				opportunityId: data.opportunityId ?? "",
				accountId: data.accountId ?? "",
				primaryContactId: data.primaryContactId ?? "",
				subject: data.subject ?? "",
				amount: data.amount ?? "",
				successRate: data.successRate ?? "",
				dueDate: data.dueDate
					? new Date(data.dueDate).toISOString().slice(0, 10)
					: "",
				status: data.status ?? "",
				billingStreet: data.billingStreet ?? "",
				billingCity: data.billingCity ?? "",
				billingState: data.billingState ?? "",
				billingCountry: data.billingCountry ?? "",
				billingPostalCode: data.billingPostalCode ?? "",
				shippingStreet: data.shippingStreet ?? "",
				shippingCity: data.shippingCity ?? "",
				shippingState: data.shippingState ?? "",
				shippingCountry: data.shippingCountry ?? "",
				shippingPostalCode: data.shippingPostalCode ?? "",
				description: data.description ?? "",
				notes: data.notes ?? "",
				items: Array.isArray(data.items) ? data.items : [],
				opportunity: data?.opportunity ?? {},
			};
			// Save original snapshot
			setOriginalData(normalized);
			// Set into formData so UI displays it
			setFormData(normalized);
			const account = accounts.find(
				(acc) => acc.accountId === data.accountId,
			);
			setAvailableContacts(account?.contacts || []);
			setItems(
				data.items.map(
					({
						id,
						productId,
						quantity,
						unitPrice,
						discount,
						tax,
						totalPrice,
					}) => ({
						id,
						productId: productId ?? "",
						quantity: quantity ?? "",
						unitPrice: unitPrice ?? "",
						discount: discount ?? "",
						tax: tax ?? "",
						totalPrice: totalPrice ?? "",
					}),
				),
			);
			// ⬅️ ADD THIS
			setNotes(data.salesOrderNotes || []);
			setAttachments(data.salesQuoteAttachments || []);
		} catch (err) {
			console.error("Error fetching sales quote:", err);
			toast.error("Error fetching sales quote");
		}
	};

	const fetchUsers = async () => {
		try {
			const res = await fetch(`${BASE_URL_UM}/users/s-info`, {
				method: "GET",
				credentials: "include",
			});
			if (!res.ok) {
				toast.error("Failed to fetch users");
				return;
			}
			const data = await res.json();
			setUsers(data);
		} catch (err) {
			console.error("Error fetching users:", err);
			toast.error("Error fetching users");
		}
	};

	const fetchAccounts = async () => {
		try {
			const res = await fetch(`${BASE_URL_AC}/account/ids-names`);
			if (!res.ok) {
				toast.error("Failed to fetch accounts");
				return;
			}
			const data = await res.json();
			setAccounts(data);
		} catch (err) {
			console.error("Error fetching accounts:", err);
			toast.error("Error fetching accounts");
		}
	};

	const fetchOpportunities = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/opportunity`);
			if (!res.ok) {
				toast.error("Failed to fetch opportunities");
				return;
			}
			const data = await res.json();
			setOpportunities(data);
		} catch (err) {
			console.error("Error fetching opportunities:", err);
			toast.error("Error fetching opportunities");
		}
	};

	const fetchProducts = async () => {
		try {
			const res = await fetch(`${BASE_URL_SM}/product`);
			if (!res.ok) {
				toast.error("Failed to fetch products");
				return;
			}
			const data = await res.json();
			setProducts(data);
		} catch (err) {
			console.error("Error fetching products:", err);
			toast.error("Error fetching products");
		}
	};

	useEffect(() => {
		fetchProducts();
		fetchOpportunities();
		fetchUsers();
		setBillingCountries(Country.getAllCountries());
		setShippingCountries(Country.getAllCountries());
		async function load() {
			await fetchAccounts();
			await fetchSalesQuote(); // now accounts[] already has contacts
		}
		load();
	}, [id]);

	useEffect(() => {
		if (!accounts.length) return;
		if (!formData.accountId) return;

		const acc = accounts.find((a) => a.accountId === formData.accountId);
		if (!acc) return;

		setFormData((prev) => ({
			...prev,
			billingCountry: acc.billingCountry ?? "",
			billingState: acc.billingState ?? "",
			billingCity: acc.billingCity ?? "",
			billingStreet: acc.billingAddressLine1 ?? "",
			billingPostalCode: acc.billingZipCode ?? "",
			shippingCountry: acc.shippingCountry ?? "",
			shippingState: acc.shippingState ?? "",
			shippingCity: acc.shippingCity ?? "",
			shippingStreet: acc.shippingAddressLine1 ?? "",
			shippingPostalCode: acc.shippingZipCode ?? "",
		}));
	}, [accounts, formData.accountId]);

	// 2️⃣ Generic onChange for inputs
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

		/**
		 * ------------------------------------------
		 * 1️⃣ OPPORTUNITY SELECTED / UNSELECTED
		 * ------------------------------------------
		 */
		if (id === "opportunityId") {
			if (!value) {
				// User cleared opportunity → clear ALL dependent fields
				setFormData((prev) => ({
					...prev,
					opportunityId: "",
					accountId: "",
					primaryContactId: "",
					amount: "",
				}));
				setAvailableContacts([]);
				return;
			}

			// Fetch selected opportunity
			const selectedOpp = opportunities.find((o) => o.id === value);
			if (!selectedOpp) return;

			const relatedAccount = accounts.find(
				(acc) => acc.accountId === selectedOpp.accountId,
			);

			const primary =
				relatedAccount?.contacts?.find((c) => c.isPrimary) || null;

			setFormData((prev) => ({
				...prev,
				opportunityId: value,
				accountId: relatedAccount?.accountId ?? "",
				primaryContactId: primary?.contactId ?? "",
				amount: selectedOpp.amount ?? "",
			}));

			setAvailableContacts(relatedAccount?.contacts || []);
			return;
		}

		/**
		 * ------------------------------------------
		 * 2️⃣ ACCOUNT SELECTED / UNSELECTED
		 * ------------------------------------------
		 */
		if (id === "accountId") {
			if (!value) {
				// Clearing account should NOT clear opportunity
				setFormData((prev) => ({
					...prev,
					accountId: "",
					primaryContactId: "",
				}));
				setAvailableContacts([]);
				return;
			}

			const selectedAccount = accounts.find((a) => a.accountId === value);
			const primary =
				selectedAccount?.contacts?.find((c) => c.isPrimary) || null;

			setFormData((prev) => ({
				...prev,
				accountId: value,
				primaryContactId: primary?.contactId || "",
			}));

			setAvailableContacts(selectedAccount?.contacts || []);
			return;
		}

		/**
		 * ------------------------------------------
		 * 3️⃣ CONTACT SELECTED / UNSELECTED
		 * ------------------------------------------
		 */
		if (id === "primaryContactId") {
			setFormData((prev) => ({
				...prev,
				primaryContactId: value,
			}));
			return;
		}

		setFormData((f) => ({ ...f, [id]: value }));
	};

	// 3️⃣ Save updates
	const handleSave = async () => {
		try {
			setLoading(true);

			// Build quoteData (parent record)
			const quoteData = {
				quoteOwnerId: formData.quoteOwnerId,
				name: formData.name,
				opportunityId: formData.opportunityId,
				accountId: formData.accountId,
				primaryContactId: formData.primaryContactId,
				subject: formData.subject,
				amount: parseFloat(formData.amount),
				successRate: formData.successRate
					? parseFloat(formData.successRate)
					: 0,
				dueDate: formData.dueDate
					? new Date(formData.dueDate).toISOString()
					: null,
				status: formData.status || "OPEN",
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
				notes: formData.notes,
			};

			// Build items array
			const itemsPayload = items.map((item) => ({
				quoteId: formData.quoteId,
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
			const response = await fetch(`${BASE_URL_SM}/sales-quote/${id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					quoteData,
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
						if (key.startsWith("quoteData.")) {
							key = key.replace("quoteData.", "");
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

				toast.error("Failed to update sales quote");
				return;
			}

			// Success
			toast.success("Sales quote updated successfully!");

			setIsReadOnly(true);
		} catch (error) {
			console.error("Failed to update sales quote:", error);
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	const handleItemChange = (index, field, value) => {
		setItems((prevItems) => {
			const updated = [...prevItems];
			const item = { ...updated[index], [field]: value };

			// ---------------------------------------
			// 1️⃣ IF PRODUCT IS UNSELECTED → CLEAR FIELDS
			// ---------------------------------------
			if (field === "productId" && !value) {
				item.unitPrice = "";
				item.tax = "";
				item.totalPrice = "";
				updated[index] = item;
				return updated;
			}

			// ---------------------------------------
			// 2️⃣ IF PRODUCT IS SELECTED → AUTO-FILL PRICE + TAX
			// ---------------------------------------
			if (field === "productId") {
				const prod = products.find((p) => p.productId === value);
				if (prod) {
					item.unitPrice = prod.unitPrice ?? 0;
					item.tax = prod.tax ?? 0;
				}
			}

			// ---------------------------------------
			// 3️⃣ RECALCULATE TOTAL PRICE FOR ANY CHANGE
			// ---------------------------------------
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

	const primaryContact = accounts
		.flatMap((acc) => acc.contacts || [])
		.find((c) => c.contactId === formData.primaryContactId);

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

	const calculateQuoteAmount = (items) => {
		return items.reduce((sum, item) => {
			const value = parseFloat(item.totalPrice);
			return sum + (isNaN(value) ? 0 : value);
		}, 0);
	};

	useEffect(() => {
		const totalAmount = calculateQuoteAmount(items);

		setFormData((prev) => ({
			...prev,
			amount: totalAmount > 0 ? totalAmount.toFixed(2) : "",
		}));
	}, [items]);

	useEffect(() => {
		function handleClickOutside(event) {
			// If clicked outside the modal + button
			if (
				actionRef.current &&
				!actionRef.current.contains(event.target)
			) {
				setMenuModal(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleConfirmConvert = async () => {
		try {
			setLoading(true);

			const res = await fetch(
				`${BASE_URL_SM}/sales-quote/${id}/convert`,
				{
					method: "POST",
				},
			);

			const data = await res.json();

			if (!res.ok) {
				throw new Error("Failed to convert sales quote");
			}

			toast.success("Sales quote converted successfully to sales order!");
			setShowConvertModal(false);

			navigate("/sales/sales-quote");
		} catch (err) {
			console.error("Error converting sales quote", err);
			toast.error("Error converting sales quote");
		} finally {
			setLoading(false);
		}
	};

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

	useEffect(() => {
		// Preload billingStates when country is already set
		if (formData.billingCountry) {
			const countryObj = billingCountries.find(
				(c) => c.name === formData.billingCountry,
			);

			if (countryObj) {
				const stateList = State.getStatesOfCountry(countryObj.isoCode);
				setBillingStates(stateList);

				// Preload billingCities if state is already set
				if (formData.billingState) {
					const stateObj = stateList.find(
						(s) => s.name === formData.billingState,
					);
					if (stateObj) {
						const cityList = City.getCitiesOfState(
							countryObj.isoCode,
							stateObj.isoCode,
						);
						setBillingCities(cityList);
					}
				}
			}
		}
	}, [formData.billingCountry, formData.billingState, billingCountries]);

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
		const stateObj = shippingStates.find((s) => s.name === selectedState);

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

	useEffect(() => {
		// Preload shippingStates when country is already set
		if (formData.shippingCountry) {
			const countryObj = shippingCountries.find(
				(c) => c.name === formData.shippingCountry,
			);

			if (countryObj) {
				const stateList = State.getStatesOfCountry(countryObj.isoCode);
				setShippingStates(stateList);

				// Preload shippingCities if state is already set
				if (formData.shippingState) {
					const stateObj = stateList.find(
						(s) => s.name === formData.shippingState,
					);
					if (stateObj) {
						const cityList = City.getCitiesOfState(
							countryObj.isoCode,
							stateObj.isoCode,
						);
						setShippingCities(cityList);
					}
				}
			}
		}
	}, [formData.shippingCountry, formData.shippingState, shippingCountries]);

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

	const getOwnerDisplayName = () => {
		if (!formData.quoteOwnerId || users.length === 0) return "--";

		const owner = users.find(
			(u) => String(u.id) === String(formData.quoteOwnerId),
		);

		if (!owner) return "--";

		const isCurrentUser = user && String(user.id) === String(owner.id);

		return `${owner.firstName} ${owner.lastName}${
			isCurrentUser ? " (You)" : ""
		}`;
	};

	const handleAttachmentUpload = async (e) => {
		const files = Array.from(e.target.files);

		if (!files.length) return;

		// Allowed types
		const allowedTypes = [
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/jpg",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
		];

		const uploadData = new FormData();

		for (let file of files) {
			if (!allowedTypes.includes(file.type)) {
				toast.error(`Invalid file type: ${file.name}`);
				return;
			}

			if (file.size > 1024 * 1024) {
				toast.error(`File too large (max 1MB): ${file.name}`);
				return;
			}

			uploadData.append("files", file);
		}

		try {
			const res = await fetch(
				`${BASE_URL_SM}/sales-quote/${id}/attachments`,
				{
					method: "POST",
					body: uploadData,
				},
			);

			if (!res.ok) {
				toast.error("Failed to upload files");
				return;
			}

			toast.success("Files uploaded successfully");
			fetchSalesQuote(); // Reload sales quote including files
		} catch (err) {
			toast.error("Error uploading");
		}
	};

	const handleDeleteAttachment = async (attachmentId) => {
		try {
			const res = await fetch(
				`${BASE_URL_SM}/sales-quote/${id}/attachments/${attachmentId}`,
				{ method: "DELETE" },
			);

			if (!res.ok) {
				toast.error("Failed to delete file");
				return;
			}

			toast.success("File deleted successfully!");
			fetchSalesQuote(); // Reload sales quote including files
		} catch (err) {
			console.error("Error deleting file:", err);
			toast.error("Error deleting file");
		}
	};

	// ✅ INDEPENDENT NOTE HANDLER (Called from Modal)
	const handleAddNote = async (e) => {
		if (e) e.preventDefault();
		if (!newNote.trim()) return;
		try {
			const res = await fetch(`${BASE_URL_SM}/sales-quote/${id}/notes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text: newNote,
					author: user
						? `${user.firstName} ${user.lastName}`
						: "Unknown",
				}),
			});
			if (!res.ok) {
				toast.error("Failed to save note");
			}
			const savedNote = await res.json();
			setNotes([savedNote, ...notes]);
			setNewNote("");
			setShowNoteModal(false); // ✅ Close Modal
			toast.success("Note added successfully!");
		} catch (err) {
			console.error("Error saving note:", err);
			toast.error("Error saving note");
		}
	};

	const handleDeleteNote = async (noteId) => {
		try {
			const res = await fetch(
				`${BASE_URL_SM}/sales-quote/${id}/notes/${noteId}`,
				{
					method: "DELETE",
				},
			);

			if (!res.ok) {
				toast.error("Failed to delete note");
				return;
			}

			// Remove note from UI
			setNotes(notes.filter((n) => n.id !== noteId));
			toast.success("Note deleted successfully!");
		} catch (err) {
			console.error("Error deleting note:", err);
			toast.error("Error deleting note");
		}
	};

	const openComposeMail = (type, data = null) => {
		let newData = {
			to:
				type === "new"
					? selectedContact?.email || ""
					: type === "reply" && data
						? data.sender === "Current User" ||
							data.type === "outbound"
							? data.recipient
							: data.sender
						: "",
			cc: "",
			bcc: "",
			subject:
				type === "new"
					? `Re: ${ticketData.subject} [Ref:${ticketData.ticket_id}]`
					: data
						? type === "forward"
							? `Fwd: ${data.subject}`
							: data.subject.startsWith("Re:")
								? data.subject
								: `Re: ${data.subject}`
						: "",
			body: data
				? type === "forward"
					? `\n\n------------------\nForwarded message:\nFrom: ${
							data.sender
						}\nDate: ${data.created_at || data.date}\nSubject: ${
							data.subject
						}\n\n${data.body}`
					: `\n\n------------------\nOn ${
							data.created_at || data.date
						}, ${data.sender} wrote:\n${data.body}`
				: "",
			id: type === "draft" ? data.id : null,
		};
		setComposeMailData(newData);
		setComposeMailAttachments([]); // Reset attachments
		setShowComposeMail(true);
		setIsMinimized(false);
	};

	const handleComposeMailChange = (field, value) =>
		setComposeMailData((prev) => ({ ...prev, [field]: value }));

	const handleComposeMailFileSelect = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			const newFiles = Array.from(e.target.files);
			setComposeMailAttachments((prev) => [...prev, ...newFiles]);
		}
		if (composeFileRef.current) composeFileRef.current.value = "";
	};

	const removeComposeMailAttachment = (index) => {
		setComposeMailAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSendEmail = async () => {
		if (!composeMailData.to) return toast.warn("Recipient Required");
		try {
			let response;
			if (composeMailAttachments.length > 0) {
				const formData = new FormData();
				formData.append("subject", composeMailData.subject);
				formData.append("sender", "Current User");
				formData.append("recipient", composeMailData.to);
				formData.append("cc", composeMailData.cc);
				formData.append("bcc", composeMailData.bcc);
				formData.append("body", composeMailData.body);
				formData.append("type", "outbound");
				composeMailAttachments.forEach((file) => {
					formData.append("files", file);
				});
				response = await fetch(
					`${BASE_URL_SM}/tickets/${ticketId}/emails/with-attachments`,
					{
						method: "POST",
						body: formData,
					},
				);
			} else {
				response = await fetch(
					`${BASE_URL_SM}/tickets/${ticketId}/emails`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							subject: composeMailData.subject,
							sender: "Current User",
							recipient: composeMailData.to,
							cc: composeMailData.cc,
							bcc: composeMailData.bcc,
							body: composeMailData.body,
							type: "outbound",
						}),
					},
				);
			}
			if (response.ok) {
				const sentEmail = await response.json();
				setEmailInteractions([sentEmail, ...emailInteractions]);
				if (composeMailData.id) handleDeleteDraft(composeMailData.id);
				setShowComposeMail(false);
				setActiveEmailTab("interactions");
				setSelectedEmailInteraction(null);
				setComposeMailAttachments([]);
				toast.success("Email sent successfully");
			} else {
				const err = await response.json();
				toast.error(
					"Failed to send: " + (err.message || "Unknown error"),
				);
			}
		} catch (e) {
			console.error(e);
			toast.error("Failed to send email");
		}
	};

	const handleSaveDraft = () => {
		const draft = {
			...composeMailData,
			id: composeMailData.id || Date.now(),
			savedAt: new Date().toLocaleString(),
		};
		setEmailDrafts(
			composeMailData.id
				? emailDrafts.map((d) => (d.id === draft.id ? draft : d))
				: [draft, ...emailDrafts],
		);
		localStorage.setItem(
			`ticket_${ticketId}_drafts`,
			JSON.stringify(
				composeMailData.id
					? emailDrafts.map((d) => (d.id === draft.id ? draft : d))
					: [draft, ...emailDrafts],
			),
		);
		setShowComposeMail(false);
		setActiveEmailTab("drafts");
		setComposeMailAttachments([]);
		toast.info("Draft saved");
	};

	const handleDeleteDraft = (id) => {
		setEmailDrafts(emailDrafts.filter((d) => d.id !== id));
		localStorage.setItem(
			`ticket_${ticketId}_drafts`,
			JSON.stringify(emailDrafts.filter((d) => d.id !== id)),
		);
		toast.info("Draft deleted");
	};

	return (
		<div className="sq-edit-container">
			{/* Sales Quote Details Header Section */}
			<div className="sq-edit-header-container">
				<h1 className="sq-edit-heading">Sales Quote Details</h1>
				<div className="sq-edit-header-container-buttons">
					{isReadOnly ? (
						<>
							<button
								className="sq-edit-edit-button"
								onClick={() => {
									setIsReadOnly(false);
									setErrors({});
								}}
							>
								<SquarePen
									size={15}
									strokeWidth={1}
									color="#dcf2f1"
								/>
								Edit
							</button>
							<button
								className="sq-edit-convert-button"
								onClick={() => setShowConvertModal(true)}
							>
								<Repeat
									size={17}
									strokeWidth={1}
									color="#0f1035"
								/>
								Convert
							</button>
							<div
								className="sq-edit-options-button-container"
								ref={actionRef}
							>
								<button
									className="sq-edit-options-button"
									onClick={() =>
										setMenuModal((prevState) => !prevState)
									}
								>
									⁞
								</button>
								{/* Menu Modal */}
								{menuModal && (
									<div className="sq-edit-menu-modal-container">
										<ul className="sq-edit-menu-modal-list">
											<li>Submit for Approval</li>
											<li>Delete</li>
											<li
												onClick={() =>
													navigate(
														`/sales/sales-quote/${id}/preview`,
													)
												}
											>
												Print Preview
											</li>
											<li>Change Owner</li>
										</ul>
									</div>
								)}
							</div>
						</>
					) : (
						<>
							<button
								className="sq-edit-save-button"
								onClick={handleSave}
								disabled={loading}
							>
								<Save
									size={17}
									strokeWidth={1}
									color="#dcf2f1"
								/>
								{loading ? "Saving..." : "Save"}
							</button>
							<button
								className="sq-edit-cancel-button"
								onClick={() => {
									setIsReadOnly(true);
									setErrors({});
									// Reset formData + items
									if (originalData) {
										setFormData(originalData);
										setItems(originalData.items || []);
									}
								}}
							>
								<CircleX
									size={17}
									strokeWidth={1}
									color="#0f1035"
								/>
								Cancel
							</button>
						</>
					)}
				</div>
			</div>

			{/* Overview and Activity Tab Section */}
			<div className="sq-edit-tabs-container">
				<div className="sq-edit-tabs-container-left">
					<button
						className={`sq-edit-tab ${
							activeTab === "overview" ? "active" : ""
						}`}
						onClick={() => setActiveTab("overview")}
					>
						Overview
					</button>
					<button
						className={`sq-edit-tab ${
							activeTab === "interactions" ? "active" : ""
						}`}
						onClick={() => setActiveTab("interactions")}
					>
						Interactions
					</button>
					<button
						className={`sq-edit-tab ${
							activeTab === "notes" ? "active" : ""
						}`}
						onClick={() => setActiveTab("notes")}
					>
						Notes
					</button>
					<button
						className={`sq-edit-tab ${
							activeTab === "activities" ? "active" : ""
						}`}
						onClick={() => setActiveTab("activities")}
					>
						Activities
					</button>
					<button
						className={`opp-edit-tab ${
							activeTab === "attachments" ? "active" : ""
						}`}
						onClick={() => setActiveTab("attachments")}
					>
						Attachments
					</button>
				</div>

				{activeTab === "interactions" && (
					<div className="sq-edit-tabs-container-right">
						<button
							className="sq-edit-email-button"
							onClick={() => openComposeMail("new")}
						>
							<Mail size={17} strokeWidth={1} color="#0f1035" />
							Compose Mail
						</button>
					</div>
				)}

				{activeTab === "notes" && (
					<div className="sq-edit-tabs-container-right">
						<button
							className="sq-edit-add-note-button"
							onClick={() => setShowNoteModal(true)}
						>
							<Plus size={18} strokeWidth={1} color="#0f1035" />
							Add Note
						</button>
					</div>
				)}

				{activeTab === "activities" && (
					<div className="sq-edit-tabs-container-right">
						<button
							className="sq-edit-call-button"
							onClick={() =>
								navigate(
									"/activitymanagement/phonecalls/create",
								)
							}
						>
							<Phone size={17} strokeWidth={1} color="#0f1035" />
							Add Call
						</button>
						<button
							className="sq-edit-task-button"
							onClick={() =>
								navigate("/activitymanagement/tasks/create")
							}
						>
							<ListChecks
								size={17}
								strokeWidth={1}
								color="#0f1035"
							/>
							Add Task
						</button>
						<button
							className="sq-edit-meeting-button"
							onClick={() =>
								navigate("/activitymanagement/meetings/create")
							}
						>
							<LaptopMinimal
								size={17}
								strokeWidth={1}
								color="#0f1035"
							/>
							Plan Meeting
						</button>
					</div>
				)}

				{activeTab === "attachments" && (
					<div className="sq-edit-tabs-container-right">
						<button
							className="sq-edit-attach-button"
							type="button"
							onClick={() =>
								document
									.getElementById("attachments-input")
									.click()
							}
						>
							<Paperclip
								size={15}
								strokeWidth={1}
								color="#0f1035"
							/>
							Attach
						</button>
						<input
							id="attachments-input"
							type="file"
							multiple
							hidden
							onChange={handleAttachmentUpload}
						/>
					</div>
				)}
			</div>

			{activeTab === "overview" && (
				<>
					{/* Overview Container */}
					<div className="sq-edit-form-container">
						<h1 className="sq-edit-form-heading">Overview</h1>
						<div className="sq-edit-form">
							<form>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group quoteId">
										<label htmlFor="quoteId">
											Quote ID
										</label>
										<input
											id="quoteId"
											type="text"
											value={formData?.quoteId ?? ""}
											disabled
										/>
									</div>
									<div className="sq-edit-form-group successRate">
										<label htmlFor="successRate">
											Success Rate
										</label>
										<input
											id="successRate"
											type="text"
											value={formData.successRate ?? ""}
											disabled
										/>
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group status">
										<label htmlFor="status">Status</label>
										<input
											id="status"
											type="text"
											value={
												formData.status === "DRAFT"
													? "Draft"
													: formData.status === "SENT"
														? "Sent"
														: formData.status ===
															  "APPROVED"
															? "Approved"
															: formData.status ===
																  "ACCEPTED"
																? "Accepted"
																: formData.status ===
																	  "REJECTED"
																	? "Rejected"
																	: ""
											}
											disabled
										/>
									</div>
									<div className="sq-edit-form-group quoteOwnerId">
										<label htmlFor="quoteOwnerId">
											Owner
										</label>
										<input
											type="text"
											id="quoteOwnerId"
											value={(() => {
												const owner = users.find(
													(user) =>
														user.id ===
														formData.quoteOwnerId,
												);
												return owner
													? `${owner.firstName} ${owner.lastName}`
													: "--";
											})()}
											disabled
										/>
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group dueDate">
										<label htmlFor="dueDate">
											Due Date
										</label>
										<input
											type="date"
											id="dueDate"
											value={formData.dueDate ?? ""}
											disabled
										/>
									</div>
									<div
										className="sq-edit-form-group status"
										style={{ visibility: "hidden" }}
									></div>
								</div>
							</form>
						</div>
					</div>

					{/* Sales Quote Information Container */}
					<div className="sq-edit-form-container">
						<h1 className="sq-edit-form-heading">
							Sales Quote Information
						</h1>
						<div className="sq-edit-form">
							<form>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group quoteOwnerId">
										<label htmlFor="quoteOwnerId">
											Quote Owner *
										</label>
										<input
											type="text"
											placeholder="Select Quote Owner"
											value={getOwnerDisplayName()}
											disabled
										/>
										{getError("quoteOwnerId") && (
											<div className="field-error">
												{getError("quoteOwnerId")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group quoteId">
										<label htmlFor="quoteId">
											Quote ID *
										</label>
										<input
											id="quoteId"
											value={formData.quoteId ?? ""}
											disabled
										/>
										{getError("quoteId") && (
											<div className="field-error">
												{getError("quoteId")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group name">
										<label htmlFor="name">
											Quote Name *
										</label>
										<input
											type="text"
											id="name"
											value={formData.name ?? ""}
											onChange={handleChange}
											placeholder="Enter Quote Name"
											disabled={isReadOnly}
										/>
										{getError("name") && (
											<div className="field-error">
												{getError("name")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group opportunityId">
										<label htmlFor="opportunityId">
											Opp. Name *
										</label>
										{isReadOnly ? (
											<input
												type="text"
												placeholder="Select Opp. Name"
												id="opportunityId"
												value={
													formData.opportunity
														?.name ?? ""
												}
												disabled
											/>
										) : (
											<select
												id="opportunityId"
												value={
													formData.opportunityId ?? ""
												}
												onChange={handleChange}
											>
												<option value="">
													Select Opportunity
												</option>
												{opportunities.map((opp) => (
													<option
														key={opp.id}
														value={opp.id}
													>
														{opp.name}
													</option>
												))}
											</select>
										)}
										{getError("opportunityId") && (
											<div className="field-error">
												{getError("opportunityId")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group accountId">
										<label htmlFor="accountId">
											Account Name
										</label>
										{isReadOnly ? (
											<input
												type="text"
												placeholder="Select Account"
												id="accountId"
												value={
													accounts.find(
														(acc) =>
															formData.accountId ===
															acc.accountId,
													)?.name ?? ""
												}
												disabled
											/>
										) : (
											<select
												id="accountId"
												value={formData.accountId ?? ""}
												onChange={handleChange}
											>
												<option value="">
													Select Account
												</option>
												{accounts.map((account) => (
													<option
														key={account.accountId}
														value={
															account.accountId
														}
													>
														{account.name}
													</option>
												))}
											</select>
										)}
										{getError("accountId") && (
											<div className="field-error">
												{getError("accountId")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group primaryContactId">
										<label htmlFor="primaryContactId">
											Primary Contact
										</label>
										{isReadOnly ? (
											<input
												type="text"
												placeholder="Select Primary Contact"
												id="primaryContactId"
												value={
													primaryContact
														? `${primaryContact.firstName} ${primaryContact.lastName}`
														: ""
												}
												disabled
											/>
										) : (
											<select
												id="primaryContactId"
												value={
													formData.primaryContactId ??
													""
												}
												onChange={handleChange}
											>
												<option value="">
													Select Primary Contact
												</option>
												{availableContacts.map(
													(contact) => (
														<option
															key={
																contact.contactId
															}
															value={
																contact.contactId
															}
														>
															{contact.firstName}{" "}
															{contact.lastName}
															{contact.isPrimary
																? " (Primary)"
																: ""}
														</option>
													),
												)}
											</select>
										)}
										{getError("primaryContactId") && (
											<div className="field-error">
												{getError("primaryContactId")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group subject">
										<label htmlFor="subject">
											Subject *
										</label>
										<input
											type="text"
											placeholder="Enter Subject"
											id="subject"
											value={formData.subject ?? ""}
											onChange={handleChange}
											disabled={isReadOnly}
										/>
										{getError("subject") && (
											<div className="field-error">
												{getError("subject")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group amount">
										<label htmlFor="amount">Amount</label>
										<input
											type="text"
											placeholder="Enter Amount"
											id="amount"
											value={formData.amount ?? ""}
											onChange={handleChange}
											disabled={isReadOnly}
										/>
										{getError("amount") && (
											<div className="field-error">
												{getError("amount")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group successRate">
										<label htmlFor="successRate">
											Success Rate %
										</label>
										<input
											type="text"
											placeholder="Enter Success Rate %"
											id="successRate"
											value={formData.successRate ?? ""}
											onChange={handleChange}
											disabled={isReadOnly}
											min={0}
											max={100}
										/>
										{getError("successRate") && (
											<div className="field-error">
												{getError("successRate")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group dueDate">
										<label htmlFor="dueDate">
											Due Date *
										</label>
										<input
											type="date"
											placeholder="Select Due Date"
											id="dueDate"
											value={formData.dueDate ?? ""}
											onChange={handleChange}
											disabled={isReadOnly}
										/>
										{getError("dueDate") && (
											<div className="field-error">
												{getError("dueDate")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group status">
										<label htmlFor="status">Status</label>
										{isReadOnly ? (
											<input
												type="text"
												placeholder="Select Status"
												id="status"
												value={
													formData.status === "DRAFT"
														? "Draft"
														: formData.status ===
															  "SENT"
															? "Sent"
															: formData.status ===
																  "APPROVED"
																? "Approved"
																: formData.status ===
																	  "ACCEPTED"
																	? "Accepted"
																	: formData.status ===
																		  "REJECTED"
																		? "Rejected"
																		: ""
												}
												disabled
											/>
										) : (
											<select
												id="status"
												value={formData.status ?? ""}
												onChange={handleChange}
											>
												<option value="">
													Select Status
												</option>
												<option value="DRAFT">
													Draft
												</option>
												<option value="SENT">
													Sent
												</option>
												<option value="APPROVED">
													Approved
												</option>
												<option value="ACCEPTED">
													Accepted
												</option>
												<option value="REJECTED">
													Rejected
												</option>
											</select>
										)}
										{getError("status") && (
											<div className="field-error">
												{getError("status")}
											</div>
										)}
									</div>
									<div
										className="sq-edit-form-group status"
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
					<div className="sq-edit-form-container">
						<h1 className="sq-edit-form-heading">
							Address Information
						</h1>
						<div className="sq-edit-form">
							<form>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group billingCountry">
										<label htmlFor="billingCountry">
											Billing Country *
										</label>
										{isReadOnly ? (
											<input
												type="text"
												id="country"
												value={
													formData.billingCountry ??
													""
												}
												placeholder="Select Billing Country"
												disabled
											/>
										) : (
											<select
												id="billingCountry"
												name="billingCountry"
												value={
													formData.billingCountry ??
													""
												}
												onChange={
													handleBillingCountryChange
												}
												disabled={isReadOnly}
											>
												<option value="">
													Select Billing Country
												</option>
												{billingCountries.map(
													(country) => (
														<option
															key={
																country.isoCode
															}
															value={country.name}
														>
															{country.name}
														</option>
													),
												)}
											</select>
										)}
										{getError("billingCountry") && (
											<div className="field-error">
												{getError("billingCountry")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group shippingCountry">
										<label htmlFor="shippingCountry">
											Shipping Country *
										</label>
										{isReadOnly ? (
											<input
												type="text"
												id="country"
												value={
													formData.shippingCountry ??
													""
												}
												placeholder="Select Shipping Country"
												disabled
											/>
										) : (
											<select
												id="shippingCountry"
												name="shippingCountry"
												value={
													formData.shippingCountry ??
													""
												}
												onChange={
													handleShippingCountryChange
												}
												disabled={isReadOnly}
											>
												<option value="">
													Select Shipping Country
												</option>
												{shippingCountries.map(
													(country) => (
														<option
															key={
																country.isoCode
															}
															value={country.name}
														>
															{country.name}
														</option>
													),
												)}
											</select>
										)}
										{getError("shippingCountry") && (
											<div className="field-error">
												{getError("shippingCountry")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group billingState">
										<label htmlFor="billingState">
											Billing State *
										</label>
										{isReadOnly ? (
											<input
												type="text"
												id="country"
												value={
													formData.billingState ?? ""
												}
												placeholder="Select Billing State"
												disabled
											/>
										) : (
											<select
												id="billingState"
												name="billingState"
												value={
													formData.billingState ?? ""
												}
												onChange={
													handleBillingStateChange
												}
												disabled={!billingStates.length}
											>
												<option value="">
													Select State
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
										)}
										{getError("billingState") && (
											<div className="field-error">
												{getError("billingState")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group shippingState">
										<label htmlFor="shippingState">
											Shipping State *
										</label>
										{isReadOnly ? (
											<input
												type="text"
												id="country"
												value={
													formData.shippingState ?? ""
												}
												placeholder="Select Shipping State"
												disabled
											/>
										) : (
											<select
												id="shippingState"
												name="shippingState"
												value={
													formData.shippingState ?? ""
												}
												onChange={
													handleShippingStateChange
												}
												disabled={
													!shippingStates.length
												}
											>
												<option value="">
													Select State
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
										)}
										{getError("shippingState") && (
											<div className="field-error">
												{getError("shippingState")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group billingCity">
										<label htmlFor="billingCity">
											Billing City *
										</label>
										{isReadOnly ? (
											<input
												type="text"
												id="country"
												value={
													formData.billingCity ?? ""
												}
												placeholder="Select Billing City"
												disabled
											/>
										) : (
											<select
												id="billingCity"
												name="billingCity"
												value={
													formData.billingCity ?? ""
												}
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
										)}
										{getError("billingCity") && (
											<div className="field-error">
												{getError("billingCity")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group shippingCity">
										<label htmlFor="shippingCity">
											Shipping City *
										</label>
										{isReadOnly ? (
											<input
												type="text"
												id="country"
												value={
													formData.shippingCity ?? ""
												}
												placeholder="Select Shipping City"
												disabled
											/>
										) : (
											<select
												id="shippingCity"
												name="shippingCity"
												value={
													formData.shippingCity ?? ""
												}
												onChange={handleChange}
												disabled={
													!shippingCities.length
												}
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
										)}
										{getError("shippingCity") && (
											<div className="field-error">
												{getError("shippingCity")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group billingStreet">
										<label htmlFor="billingStreet">
											Billing Street *
										</label>
										<input
											placeholder="Enter Billing Street"
											id="billingStreet"
											value={formData.billingStreet ?? ""}
											onChange={handleChange}
											disabled={isReadOnly}
										/>
										{getError("billingStreet") && (
											<div className="field-error">
												{getError("billingStreet")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group shippingStreet">
										<label htmlFor="shippingStreet">
											Shipping Street *
										</label>
										<input
											placeholder="Enter Shipping Street"
											id="shippingStreet"
											value={
												formData.shippingStreet ?? ""
											}
											onChange={handleChange}
											disabled={isReadOnly}
										/>
										{getError("shippingStreet") && (
											<div className="field-error">
												{getError("shippingStreet")}
											</div>
										)}
									</div>
								</div>
								<div className="sq-edit-form-row">
									<div className="sq-edit-form-group billingPostalCode">
										<label htmlFor="billingPostalCode">
											Billing Zip/Postal Code *
										</label>
										<input
											type="text"
											id="billingPostalCode"
											value={
												formData.billingPostalCode ?? ""
											}
											onChange={handleChange}
											maxLength={10}
											placeholder="Enter Billing Zip/Postal Code"
											disabled={isReadOnly}
										/>
										{getError("billingPostalCode") && (
											<div className="field-error">
												{getError("billingPostalCode")}
											</div>
										)}
									</div>
									<div className="sq-edit-form-group shippingPostalCode">
										<label htmlFor="shippingPostalCode">
											Shipping Postal Code *
										</label>
										<input
											type="text"
											id="shippingPostalCode"
											value={
												formData.shippingPostalCode ??
												""
											}
											onChange={handleChange}
											maxLength={10}
											placeholder="Enter Shipping Zip/Postal Code"
											disabled={isReadOnly}
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

					{/* Product Information Section */}
					<div className="sq-edit-table-container">
						<h1 className="sq-edit-table-heading">
							Product Information
						</h1>
						<div className="sq-edit-table-area">
							<div className="sq-edit-table-box">
								<table className="sq-edit-table">
									<thead>
										<tr>
											<th>Sl. No.</th>
											<th>Product Name *</th>
											<th>Quantity *</th>
											<th>Unit Price *</th>
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
													<div className="sq-edit-table-data">
														{isReadOnly ? (
															(products.find(
																(p) =>
																	p.productId ===
																	item.productId,
															)?.name ?? "--")
														) : (
															<select
																id="productId"
																value={
																	item.productId ??
																	""
																}
																onChange={(e) =>
																	handleItemChange(
																		idx,
																		"productId",
																		e.target
																			.value,
																	)
																}
															>
																<option value="">
																	Select
																	Product
																</option>
																{products.map(
																	(p) => (
																		<option
																			key={
																				p.productId
																			}
																			value={
																				p.productId
																			}
																		>
																			{
																				p.name
																			}
																		</option>
																	),
																)}
															</select>
														)}
														{getError(
															"productId",
														) && (
															<div className="field-error">
																{getError(
																	"productId",
																)}
															</div>
														)}
													</div>
												</td>
												<td>
													<div className="sq-edit-table-data">
														{isReadOnly ? (
															item.quantity ||
															"--"
														) : (
															<input
																id="quantity"
																type="number"
																value={
																	item.quantity ||
																	""
																}
																onChange={(e) =>
																	handleItemChange(
																		idx,
																		"quantity",
																		e.target
																			.value,
																	)
																}
																placeholder="Enter Quantity"
																min={0}
															/>
														)}
														{getError(
															"quantity",
														) && (
															<div className="field-error">
																{getError(
																	"quantity",
																)}
															</div>
														)}
													</div>
												</td>
												<td>
													<div className="sq-edit-table-data">
														{isReadOnly ? (
															item.unitPrice ||
															"--"
														) : (
															<input
																id="unitPrice"
																type="number"
																value={
																	item.unitPrice ||
																	""
																}
																onChange={(e) =>
																	handleItemChange(
																		idx,
																		"unitPrice",
																		e.target
																			.value,
																	)
																}
																placeholder="Billing Amount"
																disabled
															/>
														)}
														{getError(
															"unitPrice",
														) && (
															<div className="field-error">
																{getError(
																	"unitPrice",
																)}
															</div>
														)}
													</div>
												</td>
												<td>
													<div className="sq-edit-table-data">
														{isReadOnly ? (
															item.discount ||
															"--"
														) : (
															<input
																id="discount"
																type="number"
																value={
																	item.discount ||
																	""
																}
																onChange={(e) =>
																	handleItemChange(
																		idx,
																		"discount",
																		e.target
																			.value,
																	)
																}
																placeholder="Enter Discount %"
																min={0}
																max={100}
															/>
														)}
														{getError(
															"discount",
														) && (
															<div className="field-error">
																{getError(
																	"discount",
																)}
															</div>
														)}
													</div>
												</td>
												<td>
													<div className="sq-edit-table-data">
														{isReadOnly ? (
															item.tax || "--"
														) : (
															<input
																id="tax"
																type="number"
																value={
																	item.tax ||
																	""
																}
																onChange={(e) =>
																	handleItemChange(
																		idx,
																		"tax",
																		e.target
																			.value,
																	)
																}
																placeholder="Enter Tax %"
																min={0}
																max={100}
															/>
														)}
														{getError("tax") && (
															<div className="field-error">
																{getError(
																	"tax",
																)}
															</div>
														)}
													</div>
												</td>
												<td>
													<div className="sq-edit-table-data">
														{isReadOnly ? (
															item.totalPrice ||
															"--"
														) : (
															<input
																id="totalPrice"
																type="number"
																value={
																	item.totalPrice ||
																	""
																}
																placeholder="Total Price"
																disabled
															/>
														)}
														{getError(
															"totalPrice",
														) && (
															<div className="field-error">
																{getError(
																	"totalPrice",
																)}
															</div>
														)}
													</div>
												</td>
												<td>
													<button
														className="sq-edit-product-delete-btn"
														type="button"
														onClick={() =>
															removeItem(idx)
														}
														title="Delete Product"
														style={{
															display: isReadOnly
																? "none"
																: "block",
														}}
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

							<div className="sq-edit-table-bottom">
								<span>* Required Field</span>
								<button
									className="sq-edit-add-product-btn"
									type="button"
									onClick={addItem}
									disabled={isReadOnly}
								>
									<Plus
										size={20}
										strokeWidth={1}
										color="#dcf2f1"
									/>
									Add Product
								</button>
							</div>
						</div>
					</div>

					{/* Sales Order Container */}
					<div className="sq-edit-misc-container">
						<h1 className="sq-edit-misc-heading">Sales Order</h1>
						<div className="sq-edit-misc-area">
							<button className="sq-edit-assign-new-button">
								<Plus
									size={20}
									strokeWidth={1}
									color="#dcf2f1"
								/>
								Assign/New
							</button>
						</div>
					</div>
				</>
			)}

			{activeTab === "notes" && (
				<>
					{/* Notes Container */}
					<div className="sq-edit-notes-container">
						<h1 className="sq-edit-notes-heading">Notes</h1>
						<div className="sq-edit-notes-form">
							{notes.length > 0 ? (
								<ul className="sq-edit-note-box-list">
									{notes.map((note) => (
										<li
											key={note.id}
											className="sq-edit-note-item"
										>
											<div className="sq-edit-note-text">
												{note.text}
											</div>
											<div className="sq-edit-note-footer">
												<div className="sq-edit-note-meta">
													<User size={12} />{" "}
													{note.author}
													<span
														style={{
															margin: "0 5px",
														}}
													>
														•
													</span>
													{new Date(
														note.createdAt,
													).toLocaleString("en-GB")}
												</div>
												<button
													className="sq-edit-note-delete-btn"
													onClick={() =>
														handleDeleteNote(
															note.id,
														)
													}
													title="Delete Note"
												>
													<Trash2
														size={14}
														strokeWidth={1}
													/>
												</button>
											</div>
										</li>
									))}
								</ul>
							) : (
								<div className="sq-edit-notes-empty">
									No Note Found
								</div>
							)}
						</div>
					</div>
				</>
			)}

			{activeTab === "interactions" && (
				<>
					<div className="sq-edit-form-container">
						<h1 className="sq-edit-form-heading">Email</h1>
						<div className="sq-edit-email-container">
							<div className="sq-edit-email-tabs-container">
								<div className="sq-edit-tabs-left">
									<button
										className={`sq-edit-email-tab-btn ${
											activeEmailTab === "interactions"
												? "active"
												: ""
										}`}
										onClick={() => {
											setActiveEmailTab("interactions");
											setSelectedEmailInteraction(null);
										}}
									>
										Email Interactions
									</button>
									<button
										className={`sq-edit-email-tab-btn ${
											activeEmailTab === "drafts"
												? "active"
												: ""
										}`}
										onClick={() => {
											setActiveEmailTab("drafts");
											setSelectedEmailInteraction(null);
										}}
									>
										Email Drafts ({emailDrafts.length})
									</button>
								</div>
							</div>

							<div className="sq-edit-email-list-container">
								{activeEmailTab === "interactions" &&
									!selectedEmailInteraction && (
										<div className="sq-edit-table-box">
											<table className="sq-edit-table">
												<thead>
													<tr>
														<th>Channel Name</th>
														<th>Subject</th>
														<th>Date & Time</th>
														<th>Sender Name</th>
														<th>
															Recipients Email
														</th>
													</tr>
												</thead>
												<tbody>
													{emailInteractions.length ===
													0 ? (
														<tr>
															<td
																colSpan="5"
																className="sq-edit-empty-state"
															>
																No Interactions
																Found
															</td>
														</tr>
													) : (
														emailInteractions.map(
															(email) => (
																<tr
																	key={
																		email.id
																	}
																	className="sq-edit-email-row"
																	onClick={() =>
																		setSelectedEmailInteraction(
																			email,
																		)
																	}
																>
																	<td>
																		<div
																			style={{
																				display:
																					"flex",
																				alignItems:
																					"center",
																				gap: "5px",
																			}}
																		>
																			{email.type ===
																			"inbound" ? (
																				<Mail
																					size={
																						16
																					}
																					color="#365486"
																				/>
																			) : (
																				<Reply
																					size={
																						16
																					}
																					color="#666"
																				/>
																			)}
																			{ticketData.channel ||
																				"Nordic Denmark"}
																		</div>
																	</td>
																	<td className="sq-edit-subject-text">
																		{
																			email.subject
																		}
																	</td>
																	<td>
																		{new Date(
																			email.created_at ||
																				email.receivedAt ||
																				Date.now(),
																		).toLocaleString()}
																	</td>
																	<td>
																		{
																			email.sender
																		}
																	</td>
																	<td>
																		{
																			email.recipient
																		}
																	</td>
																</tr>
															),
														)
													)}
												</tbody>
											</table>
										</div>
									)}
								{activeEmailTab === "interactions" &&
									selectedEmailInteraction && (
										<div className="sq-edit-email-detail-view">
											<div>
												<button
													onClick={() =>
														setSelectedEmailInteraction(
															null,
														)
													}
													className="email-back-btn"
												>
													<ArrowLeft size={16} /> Back
													to List
												</button>
											</div>
											<div className="email-detail-header-box">
												<div className="email-header-top">
													<div className="email-sender-group">
														<div className="email-avatar-circle">
															{selectedEmailInteraction.sender
																? selectedEmailInteraction.sender
																		.charAt(
																			0,
																		)
																		.toUpperCase()
																: "U"}
														</div>
														<div>
															<div className="email-sender-name">
																{
																	selectedEmailInteraction.sender
																}
															</div>
															<div className="email-meta-text">
																To:{" "}
																{
																	selectedEmailInteraction.recipient
																}
															</div>
															{selectedEmailInteraction.cc && (
																<div className="email-meta-text">
																	CC:{" "}
																	{
																		selectedEmailInteraction.cc
																	}
																</div>
															)}
														</div>
													</div>
													<div className="email-timestamp">
														{new Date(
															selectedEmailInteraction.created_at ||
																selectedEmailInteraction.receivedAt ||
																Date.now(),
														).toLocaleString()}
													</div>
												</div>
												<div className="email-subject-line">
													{
														selectedEmailInteraction.subject
													}
												</div>
											</div>
											<div className="email-body-content">
												{selectedEmailInteraction.body ||
													selectedEmailInteraction.content}
											</div>
											{selectedEmailInteraction.attachments &&
												selectedEmailInteraction
													.attachments.length > 0 && (
													<div className="email-attachments-section">
														<strong>
															Attachments:
														</strong>
														<ul className="email-attachments-list">
															{selectedEmailInteraction.attachments.map(
																(file, idx) => (
																	<li
																		key={
																			idx
																		}
																		className="email-attachment-item"
																	>
																		<Paperclip
																			size={
																				12
																			}
																		/>{" "}
																		{file.file_name ||
																			file.name ||
																			"Attachment"}
																	</li>
																),
															)}
														</ul>
													</div>
												)}
											<div className="email-actions-bar">
												<div className="email-action-btn-group">
													<button
														onClick={() =>
															openCompose(
																"reply",
																selectedEmailInteraction,
															)
														}
														className="email-reply-btn"
													>
														<Reply size={14} />{" "}
														Reply
													</button>
													<button
														onClick={() =>
															openCompose(
																"forward",
																selectedEmailInteraction,
															)
														}
														className="email-reply-btn"
													>
														<Forward size={14} />{" "}
														Forward
													</button>
												</div>
											</div>
										</div>
									)}
								{activeEmailTab === "drafts" && (
									<div className="sq-edit-table-box">
										<table className="sq-edit-table">
											<thead>
												<tr>
													<th>Subject</th>
													<th>To</th>
													<th>Saved At</th>
													<th>Actions</th>
												</tr>
											</thead>
											<tbody>
												{emailDrafts.map((draft) => (
													<tr
														key={draft.id}
														className="sq-email-row"
													>
														<td
															onClick={() =>
																openCompose(
																	"draft",
																	draft,
																)
															}
															className="sq-subject-text"
														>
															{draft.subject ||
																"(No Subject)"}
														</td>
														<td
															onClick={() =>
																openCompose(
																	"draft",
																	draft,
																)
															}
														>
															{draft.to}
														</td>
														<td
															onClick={() =>
																openCompose(
																	"draft",
																	draft,
																)
															}
														>
															{draft.savedAt}
														</td>
														<td className="cell-icon-action">
															<button
																className="icon-btn"
																onClick={(
																	e,
																) => {
																	e.stopPropagation();
																	handleDeleteDraft(
																		draft.id,
																	);
																}}
															>
																<Trash2
																	size={16}
																	strokeWidth={
																		1
																	}
																/>
															</button>
														</td>
													</tr>
												))}
												{emailDrafts.length === 0 && (
													<tr>
														<td
															colSpan="4"
															className="sq-edit-empty-state"
														>
															No Drafts Found
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</div>
					</div>
				</>
			)}

			{activeTab === "activities" && (
				<>
					{/* Activities Section */}
					<div className="sq-edit-activity-table-container">
						<table className="sq-edit-activity-table">
							<thead>
								<tr>
									<th>Activities</th>
									<th>Date & Time</th>
									<th>Type</th>
									<th>Last Interaction</th>
								</tr>
							</thead>
							<tbody>
								{activities.length === 0 ? (
									<tr>
										<td
											colSpan="9"
											className="sq-edit-activity-empty-state"
										>
											<p>No Activities Found</p>
										</td>
									</tr>
								) : (
									activities.map((activity) => (
										<tr>
											<td>1</td>
											<td>2</td>
											<td>3</td>
											<td>4</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</>
			)}

			{activeTab === "attachments" && (
				<>
					{/* Attachments Section */}
					<div className="sq-edit-table-container">
						<h1 className="sq-edit-table-heading">Attachments</h1>
						<div className="sq-edit-table-area">
							<div className="sq-edit-table-box">
								<table className="sq-edit-table">
									<thead>
										<tr>
											<th>File Name</th>
											<th>Date Added</th>
											<th>File Size</th>
											<th></th>
										</tr>
									</thead>
									<tbody>
										{attachments.length === 0 ? (
											<tr>
												<td
													colSpan="4"
													className="sq-edit-empty-state"
												>
													No Attachments Found
												</td>
											</tr>
										) : (
											attachments.map((file) => (
												<tr key={file.id}>
													<td>
														<a
															href={file.fileUrl}
															target="_blank"
														>
															{file.fileName}
														</a>
													</td>
													<td>
														{new Date(
															file.uploadedAt,
														).toLocaleDateString(
															"en-GB",
														)}
													</td>
													<td>
														{(
															file.fileSize / 1024
														).toFixed(1)}{" "}
														KB
													</td>
													<td>
														<button
															className="sq-edit-attachment-delete-btn"
															title="Delete"
															onClick={() =>
																handleDeleteAttachment(
																	file.id,
																)
															}
														>
															<Trash2
																size={18}
																strokeWidth={1}
															/>
														</button>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</>
			)}

			{/* Compose Mail Window */}
			{showComposeMail && (
				<div
					className={`sq-edit-compose-mail-window ${
						isMinimized ? "minimized" : ""
					}`}
				>
					<div
						className="sq-edit-compose-mail-header"
						onClick={() => setIsMinimized(!isMinimized)}
					>
						<h2 className="sq-edit-compose-title">Send Email</h2>
						<div className="sq-edit-compose-controls">
							<button
								onClick={(e) => {
									e.stopPropagation();
									setIsMinimized(!isMinimized);
								}}
								className="sq-edit-compose-control-btn"
							>
								<Minimize2 size={16} color="#666" />
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									setShowComposeMail(false);
								}}
								className="sq-edit-compose-control-btn"
							>
								<X size={16} color="#666" />
							</button>
						</div>
					</div>
					{!isMinimized && (
						<>
							<div className="sq-edit-compose-body">
								<div className="sq-edit-compose-field">
									<label>To</label>
									<input
										value={composeMailData.to}
										onChange={(e) =>
											handleComposeChange(
												"to",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="sq-edit-compose-field">
									<label>CC</label>
									<input
										value={composeMailData.cc}
										onChange={(e) =>
											handleComposeChange(
												"cc",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="sq-edit-compose-field">
									<label>BCC</label>
									<input
										value={composeMailData.bcc}
										onChange={(e) =>
											handleComposeChange(
												"bcc",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="sq-edit-compose-field">
									<label>Subject</label>
									<input
										value={composeMailData.subject}
										onChange={(e) =>
											handleComposeChange(
												"subject",
												e.target.value,
											)
										}
									/>
								</div>
								<div className="sq-edit-compose-editor">
									<textarea
										value={composeMailData.body}
										onChange={(e) =>
											handleComposeChange(
												"body",
												e.target.value,
											)
										}
									/>
								</div>
								{composeAttachments.length > 0 && (
									<div className="sq-edit-compose-attachments">
										{composeAttachments.map((file, idx) => (
											<div
												key={idx}
												className="sq-edit-compose-attachment-chip"
											>
												<Paperclip size={12} />
												<span className="sq-edit-compose-attachment-name">
													{file.name}
												</span>
												<button
													onClick={() =>
														removeComposeAttachment(
															idx,
														)
													}
													style={{
														background: "none",
														border: "none",
														cursor: "pointer",
														padding: 0,
														display: "flex",
													}}
												>
													<X size={12} color="#666" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>
							<div className="sq-edit-compose-footer">
								<div className="sq-edit-compose-tools">
									<input
										type="file"
										multiple
										ref={composeFileRef}
										style={{ display: "none" }}
										onChange={handleComposeFileSelect}
									/>
									<Paperclip
										size={24}
										className="sq-edit-compose-tool-icon"
										onClick={() =>
											composeFileRef.current.click()
										}
									/>
									<FileText
										size={24}
										className="sq-edit-compose-tool-icon"
										onClick={() => {
											setTemplateContext("emailCompose");
											setShowTemplateSelectModal(true);
										}}
									/>
									<Trash2
										size={24}
										className="sq-edit-compose-tool-icon"
										onClick={() => setShowCompose(false)}
									/>
								</div>
								<div className="sq-edit-compose-actions">
									<button
										onClick={handleSaveDraft}
										className="btn-draft"
									>
										Save Draft
									</button>
									<button
										onClick={handleSendEmail}
										className="btn-send"
									>
										Send
									</button>
								</div>
							</div>
						</>
					)}
				</div>
			)}

			{/* Add Note Modal */}
			{showNoteModal && (
				<div className="sq-edit-note-modal-overlay">
					<div className="sq-edit-note-modal-content medium">
						<div className="sq-edit-note-modal-header">
							<h3 className="sq-edit-note-modal-title">
								Add Note
							</h3>
							<button
								onClick={() => {
									setShowNoteModal(false);
									setNewNote("");
								}}
								className="sq-edit-note-modal-close-btn"
							>
								<X size={20} strokeWidth={1} color="#0f1035" />
							</button>
						</div>
						<div className="sq-edit-note-modal-body">
							<textarea
								placeholder="Enter your note here..."
								value={newNote}
								onChange={(e) => setNewNote(e.target.value)}
								className="sq-edit-note-textarea"
							/>
						</div>
						<div className="sq-edit-note-modal-footer">
							<button
								onClick={() => {
									setShowNoteModal(false);
									setNewNote("");
								}}
								className="sq-edit-note-btn-secondary"
							>
								Cancel
							</button>
							<button
								onClick={handleAddNote}
								className="sq-edit-note-btn-primary"
							>
								Save Note
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Convert Lead to Opportunity Modal */}
			{showConvertModal && (
				<div className="sq-edit-convert-modal-overlay">
					<div className="sq-edit-convert-modal">
						<h3 className="sq-edit-convert-modal-title">
							Convert Sales Quote to Sales Order?
						</h3>

						<div className="sq-edit-convert-modal-actions">
							<button
								className="sq-edit-convert-btn-primary"
								onClick={handleConfirmConvert}
							>
								Convert
							</button>
							<button
								className="sq-edit-convert-btn-secondary"
								onClick={() => setShowConvertModal(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DetailedSalesQuotes;
