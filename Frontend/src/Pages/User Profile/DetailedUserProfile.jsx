import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";
import {
    X,
    RefreshCcw,
    SquarePen,
    Save,
    CircleX,
    Search,
    Filter,
} from "lucide-react";
import useOrgDepartments from "../../hooks/useOrgDepartments"; // adjust path
import "./DetailedUserProfile.css";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;
const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

const DetailedUserProfile = () => {
    const [menuModal, setMenuModal] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [errors, setErrors] = useState({});
    const [showSelectDepartmentModal, setShowSelectDepartmentModal] =
        useState(false);
    const [deptSearch, setDeptSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [businessRoles, setBusinessRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        phone: "",
        businessRole: "",
        timeZone: "",
        status: "",
        department: "",
        job: "",
        personalCountry: "",
        personalState: "",
        personalCity: "",
        personalStreet: "",
        personalPostalCode: "",
    });
    const [refreshSpin, setRefreshSpin] = useState(false);

    const { id } = useParams();
    const actionRef = useRef();
    const navigate = useNavigate();

    // Helper functions
    const getError = (field) => {
        const e = errors[field];
        if (!e) return null;
        return Array.isArray(e) ? e.join(", ") : e;
    };

    const handleCountryChange = (e) => {
        const selected = e.target.value;
        setFormData({
            ...formData,
            personalCountry: selected,
            personalState: "",
            personalCity: "",
        });

        const countryObj = countries.find((c) => c.name === selected);
        if (countryObj) {
            setStates(State.getStatesOfCountry(countryObj.isoCode));
            setCities([]);
        } else {
            setStates([]);
            setCities([]);
        }
    };

    const handleStateChange = (e) => {
        const selectedState = e.target.value;
        setFormData({
            ...formData,
            personalState: selectedState,
            personalCity: "",
        });

        const countryObj = countries.find(
            (c) => c.name === formData.personalCountry
        );
        const stateObj = states.find((s) => s.name === selectedState);

        if (countryObj && stateObj) {
            const cityList = City.getCitiesOfState(
                countryObj.isoCode,
                stateObj.isoCode
            );
            setCities(cityList);
        } else {
            setCities([]);
        }
    };

    const validateIndianPinCode = async (postalCode) => {
        try {
            const res = await fetch(
                `https://api.postalpincode.in/pincode/${postalCode}`
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

    const {
        departments,
        loading: deptLoading,
        error: deptError,
        refresh: refreshDepartments,
    } = useOrgDepartments({
        rootUrl: `${BASE_URL_MS}`,
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${BASE_URL_UM}/users/user-profile/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });
            if (!res.ok) {
                const payload = await res.json().catch(() => null);

                if (payload && Array.isArray(payload.errors)) {
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
                toast.error("Failed to update user details");
                return;
            }
            setErrors({});
            toast.success("User details updated successfully!");
            setIsReadOnly(true);
            fetchUser();
        } catch (err) {
            toast.error("Error updating user details");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (
            formData.personalCountry === "India" &&
            formData.personalPostalCode.length === 6
        ) {
            validateIndianPinCode(formData.personalPostalCode).then(
                (result) => {
                    if (result.valid) {
                        const stateMatch =
                            result.state.toLowerCase() ===
                            formData.personalState.toLowerCase();

                        if (!stateMatch) {
                            console.warn(
                                `PIN code doesn't match selected State. Expected State: ${result.state}`
                            );
                        }
                    } else {
                        console.error(result.message);
                    }
                }
            );
        }
    }, [formData.personalPostalCode, formData.personalCountry]);

    useEffect(() => {
        if (formData.personalCountry) {
            const countryObj = countries.find(
                (c) => c.name === formData.personalCountry
            );

            if (countryObj) {
                const stateList = State.getStatesOfCountry(countryObj.isoCode);
                setStates(stateList);

                if (formData.personalState) {
                    const stateObj = stateList.find(
                        (s) => s.name === formData.personalState
                    );
                    if (stateObj) {
                        const cityList = City.getCitiesOfState(
                            countryObj.isoCode,
                            stateObj.isoCode
                        );
                        setCities(cityList);
                    }
                }
            }
        }
    }, [formData.personalCountry, formData.personalState, countries]);

    const fetchUser = async () => {
        try {
            const res = await fetch(`${BASE_URL_UM}/users/${id}`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) {
                toast.error("Failed to fetch user");
                return;
            }
            const data = await res.json();
            const normalized = {
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                userId: data.userId || "",
                username: data.username || "",
                email: data.email || "",
                phone: data.phone || "",
                businessRole: data.businessRoleId || "",
                timeZone: data.timeZone || "",
                status: data.status || "",
                department: data.department || "",
                job: data.job || "",
                personalCountry: data.personalCountry || "",
                personalState: data.personalState || "",
                personalCity: data.personalCity || "",
                personalStreet: data.personalStreet || "",
                personalPostalCode: data.personalPostalCode || "",
            };
            setOriginalData(normalized);
            setFormData(normalized);
        } catch (err) {
            console.error("Error fetching user data:", err);
            toast.error("Error fetching user data");
        }
    };

    useEffect(() => {
        setCountries(Country.getAllCountries());
        fetchUser();
        fetchBusinessRoles();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (errors[id]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const closeDeptModal = () => {
        setShowSelectDepartmentModal(false);
        setSelectedDepartment(null);
    };

    const confirmDeptModal = () => {
        if (selectedDepartment) {
            setFormData((prev) => ({
                ...prev,
                department: selectedDepartment.id,
            }));
        }
        closeDeptModal();
    };

    const handleClearDepartment = () => {
        setFormData((prev) => ({
            ...prev,
            department: "",
        }));
        setSelectedDepartment(null);
        closeDeptModal();
    };

    const search = (deptSearch || "").trim().toLowerCase();

    const filteredDepartments = departments.filter((d = {}) => {
        const id = String(d.id ?? "").toLowerCase();
        const name = String(d.name ?? "").toLowerCase();
        return id.includes(search) || name.includes(search);
    });

    const fetchBusinessRoles = async () => {
        try {
            const res = await fetch(`${BASE_URL_UM}/business-role/s-info`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) {
                toast.error("Failed to fetch business roles");
                return;
            }
            const data = await res.json();
            setBusinessRoles(data);
        } catch (error) {
            console.error("Error fetching business roles", error);
            toast.error("Error fetching business roles");
        }
    };

    const extractNumericSuffix = (s) => {
        if (!s || typeof s !== "string") return null;
        const m = s.match(/(\d+)\s*$/);
        return m ? m[1] : null;
    };

    const padToWidth = (numStr, width = 3) => {
        if (!numStr) return "001".padStart(width, "0");
        return String(numStr).padStart(width, "0");
    };

    useEffect(() => {
        const f = (formData.firstName || "").trim();
        const l = (formData.lastName || "").trim();
        if (!f && !l) {
            setFormData((prev) => ({ ...prev, username: "" }));
            return;
        }

        const base = `${l}${f}`.replace(/\s+/g, "").toLowerCase();
        const numericSuffix = extractNumericSuffix(formData.userId) ?? "1";
        const width = (extractNumericSuffix(formData.userId) || "001").length || 3;
        const suffix = padToWidth(numericSuffix, width);
        const generated = `${base}${suffix}`;

        setErrors((prev) => {
            if (!prev.username) return prev;
            const updated = { ...prev };
            delete updated.username;
            return updated;
        });

        setFormData((prev) => ({ ...prev, username: generated }));
    }, [formData.firstName, formData.lastName, formData.userId]);

    useEffect(() => {
        function handleClickOutside(event) {
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

    const handleClose = () => {
        navigate("/admin/userprofiles");
    };

    return (
        <div className="userprof-edit-container">
            <div className="userprof-edit-header-container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    {/* ✅ Display User Name dynamically */}
                    <h1 className="userprof-edit-heading">
                        {formData.firstName && formData.lastName 
                            ? `${formData.firstName} ${formData.lastName}`
                            : "User Details"
                        }
                    </h1>
                    <button 
                        className="userprof-edit-close-button" 
                        onClick={handleClose}
                        title="Close"
                    >
                        <X size={15} strokeWidth={1} /> Close
                    </button>
                </div>
                
                <div className="userprof-edit-header-container-buttons">
                    {isReadOnly ? (
                        <>
                            {/* <button
                                className="userprof-edit-edit-button"
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
                            */}
                            <div
                                className="userprof-edit-options-button-container"
                                ref={actionRef}
                            >
                                <button
                                    className="userprof-edit-options-button"
                                    onClick={() =>
                                        setMenuModal((prevState) => !prevState)
                                    }
                                    title="More Options"
                                >
                                    ⁞
                                </button>
                                {menuModal && (
                                    <div className="userprof-edit-menu-modal-container">
                                        <ul className="userprof-edit-menu-modal-list">
                                            <li>Submit for Approval</li>
                                            <li>Delete</li>
                                            <li>Print Preview</li>
                                            <li>Change Owner</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                className="userprof-edit-save-button"
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
                                className="userprof-edit-cancel-button"
                                onClick={() => {
                                    setIsReadOnly(true);
                                    setErrors({});
                                    if (originalData) {
                                        setFormData(originalData);
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

            {/* Rest of the form remains unchanged */}
            <div className="userprof-edit-form-container">
                <h1 className="userprof-edit-form-heading">User Information</h1>
                <div className="userprof-edit-form">
                    <form>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group firstName">
                                <label htmlFor="firstName">First Name *</label>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    id="firstName"
                                    value={formData.firstName ?? ""}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                                {getError("firstName") && (
                                    <div className="field-error">
                                        {getError("firstName")}
                                    </div>
                                )}
                            </div>
                            <div className="userprof-edit-form-group lastName">
                                <label htmlFor="lastName">Last Name *</label>
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    id="lastName"
                                    value={formData.lastName ?? ""}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                                {getError("lastName") && (
                                    <div className="field-error">
                                        {getError("lastName")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group userId">
                                <label htmlFor="userId">User ID *</label>
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    id="userId"
                                    value={formData.userId ?? ""}
                                    disabled
                                />
                                {getError("userId") && (
                                    <div className="field-error">
                                        {getError("userId")}
                                    </div>
                                )}
                            </div>
                            <div className="userprof-edit-form-group username">
                                <label htmlFor="username">Username *</label>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    id="username"
                                    value={formData.username ?? ""}
                                    disabled
                                />
                                {getError("username") && (
                                    <div className="field-error">
                                        {getError("username")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group email">
                                <label htmlFor="email">Email *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. john.doe@example.com"
                                    id="email"
                                    value={formData.email ?? ""}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                                {getError("email") && (
                                    <div className="field-error">
                                        {getError("email")}
                                    </div>
                                )}
                            </div>
                            <div className="userprof-edit-form-group phone">
                                <label htmlFor="phone">Phone No.</label>
                                <input
                                    type="tel"
                                    placeholder="e.g. +0 12345 67890"
                                    id="phone"
                                    value={formData.phone ?? ""}
                                    maxLength={13}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                                {getError("phone") && (
                                    <div className="field-error">
                                        {getError("phone")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group businessRole">
                                <label htmlFor="businessRole">
                                    Business Role *
                                </label>
                                {isReadOnly ? (
                                    <input
                                        type="text"
                                        id="businessRole"
                                        value={
                                            businessRoles.find(
                                                (role) =>
                                                    role.id ===
                                                    formData.businessRole
                                            )?.businessRoleName ??
                                            "Not Assigned"
                                        }
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="businessRole"
                                        value={formData.businessRole ?? ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Business Role
                                        </option>
                                        {businessRoles.map((role) => (
                                            <option
                                                key={role.id}
                                                value={role.id}
                                            >
                                                {role.businessRoleName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {getError("businessRole") && (
                                    <div className="field-error">
                                        {getError("businessRole")}
                                    </div>
                                )}
                            </div>
                            <div className="userprof-edit-form-group timeZone">
                                <label htmlFor="timeZone">Time Zone</label>
                                {isReadOnly ? (
                                    <input
                                        type="text"
                                        id="timeZone"
                                        value={formData.timeZone ?? ""}
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="timeZone"
                                        value={formData.timeZone}
                                        onChange={handleChange}
                                    >
                                        <option value="">
                                            Select Time Zone
                                        </option>
                                        <option value="IST">
                                            IST (UTC+5:30)
                                        </option>
                                        <option value="JST">
                                            JST (UTC+9:00)
                                        </option>
                                        <option value="CET">
                                            CET (UTC+1:00)
                                        </option>
                                        <option value="PST">
                                            PST (UTC-8:00)
                                        </option>
                                    </select>
                                )}
                                {getError("timeZone") && (
                                    <div className="field-error">
                                        {getError("timeZone")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="userprof-create-form-row">
                            <div className="userprof-create-form-group status">
                                <label htmlFor="status">Status *</label>
                                {isReadOnly ? (
                                    <input
                                        type="text"
                                        id="status"
                                        value={
                                            formData.status === "ACTIVE"
                                                ? "Active"
                                                : formData.status === "INACTIVE"
                                                ? "Inactive"
                                                : ""
                                        }
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Status</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">
                                            Inactive
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
                                className="userprof-create-form-group"
                                style={{ visibility: "hidden" }}
                            ></div>
                        </div>

                        <span className="required-field-text">
                            * Required Field
                        </span>
                    </form>
                </div>
            </div>

            <div className="userprof-edit-form-container">
                <h1 className="userprof-edit-form-heading">
                    Organizational Data
                </h1>
                <div className="userprof-edit-form">
                    <form>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group department">
                                <label htmlFor="department">Department</label>
                                <div className="input-with-button">
                                    <input
                                        id="department"
                                        name="department"
                                        value={formData.department ?? ""}
                                        placeholder="Click Lookup to select Department"
                                        readOnly // Changed to readOnly so onClick works
                                        style={{ cursor: "pointer", backgroundColor: "#fff" }} // Indicate clickability
                                        onClick={() => setShowSelectDepartmentModal(true)} // Open modal on input click
                                    />
                                    <button
                                        type="button"
                                        className="userprof-edit-input-icon-btn"
                                        title="Lookup Department"
                                        onClick={() =>
                                            setShowSelectDepartmentModal(true)
                                        }
                                        disabled={false} // ✅ ENABLED: Always allow opening modal
                                    >
                                        <Search
                                            size={15}
                                            strokeWidth={1}
                                            color="#0f1035"
                                        />
                                    </button>
                                    {getError("department") && (
                                        <div className="field-error">
                                            {getError("department")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="userprof-edit-form-container">
                <h1 className="userprof-edit-form-heading">Mailing Address</h1>
                <div className="userprof-edit-form">
                    <form>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group personalCountry">
                                <label htmlFor="personalCountry">Country</label>
                                {isReadOnly ? (
                                    <input
                                        type="text"
                                        id="country"
                                        value={formData.personalCountry ?? ""}
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="personalCountry"
                                        name="personalCountry"
                                        value={formData.personalCountry ?? ""}
                                        onChange={handleCountryChange}
                                        required
                                        className={
                                            errors.personalCountry
                                                ? "error"
                                                : ""
                                        }
                                        disabled={isReadOnly}
                                    >
                                        <option value="">Select Country</option>
                                        {countries.map((country) => (
                                            <option
                                                key={country.isoCode}
                                                value={country.name}
                                            >
                                                {country.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {getError("personalCountry") && (
                                    <div className="field-error">
                                        {getError("personalCountry")}
                                    </div>
                                )}
                            </div>
                            <div className="userprof-edit-form-group personalState">
                                <label htmlFor="personalState">State</label>
                                {isReadOnly ? (
                                    <input
                                        type="text"
                                        id="country"
                                        value={formData.personalState ?? ""}
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="personalState"
                                        name="personalState"
                                        value={formData.personalState ?? ""}
                                        onChange={handleStateChange}
                                        required
                                        disabled={!states.length}
                                        className={
                                            errors.personalState ? "error" : ""
                                        }
                                    >
                                        <option value="">Select State</option>
                                        {states.map((state) => (
                                            <option
                                                key={state.isoCode}
                                                value={state.name}
                                            >
                                                {state.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {getError("personalState") && (
                                    <div className="field-error">
                                        {getError("personalState")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group personalCity">
                                <label htmlFor="personalCity">City</label>
                                {isReadOnly ? (
                                    <input
                                        type="text"
                                        id="country"
                                        value={formData.personalCity ?? ""}
                                        disabled
                                    />
                                ) : (
                                    <select
                                        id="personalCity"
                                        name="personalCity"
                                        value={formData.personalCity}
                                        onChange={handleChange}
                                        required
                                        disabled={!cities.length}
                                        className={
                                            errors.personalCity ? "error" : ""
                                        }
                                    >
                                        <option value="">Select City</option>
                                        {cities.map((city) => (
                                            <option
                                                key={city.name}
                                                value={city.name}
                                            >
                                                {city.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {getError("personalCity") && (
                                    <div className="field-error">
                                        {getError("personalCity")}
                                    </div>
                                )}
                            </div>
                            <div className="userprof-edit-form-group personalStreet">
                                <label htmlFor="personalStreet">Street</label>
                                <input
                                    placeholder="Enter Street Address"
                                    id="personalStreet"
                                    value={formData.personalStreet ?? ""}
                                    onChange={handleChange}
                                    disabled={isReadOnly}
                                />
                                {getError("personalStreet") && (
                                    <div className="field-error">
                                        {getError("personalStreet")}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="userprof-edit-form-row">
                            <div className="userprof-edit-form-group personalPostalCode">
                                <label htmlFor="personalPostalCode">
                                    Zip/Postal Code
                                </label>
                                <input
                                    type="text"
                                    id="personalPostalCode"
                                    name="personalPostalCode"
                                    value={formData.personalPostalCode ?? ""}
                                    onChange={handleChange}
                                    maxLength={6}
                                    required
                                    placeholder="Zip/Postal Code"
                                    className={
                                        errors.personalPostalCode ? "error" : ""
                                    }
                                    disabled={isReadOnly}
                                />
                                {getError("personalPostalCode") && (
                                    <div className="field-error">
                                        {getError("personalPostalCode")}
                                    </div>
                                )}
                            </div>
                            <div
                                className="userprof-edit-form-group"
                                style={{ visibility: "hidden" }}
                            ></div>
                        </div>
                    </form>
                </div>
            </div>

            {showSelectDepartmentModal && (
                <div
                    className="userprof-edit-org-modal-overlay"
                    onClick={closeDeptModal}
                >
                    <div
                        className="userprof-edit-org-modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="userprof-edit-org-modal-header">
                            <h3 className="userprof-edit-org-modal-title">
                                Organizational Units
                            </h3>
                            <button
                                className="userprof-edit-org-modal-close"
                                onClick={closeDeptModal}
                                title="Close Department Modal"
                            >
                                <X size={20} strokeWidth={1} />
                            </button>
                        </div>

                        <div className="userprof-edit-org-modal-toolbar">
                            <div className="org-toolbar-left">
                                <span className="org-filter-badge">
                                    All ({departments.length}) ▾
                                </span>
                            </div>

                            <div className="userprof-edit-org-toolbar-right">
                                <div className="userprof-edit-org-toolbar-search-container">
                                    <input
                                        className="userprof-edit-org-toolbar-search"
                                        placeholder="Search Org Units by ID or Name"
                                        value={deptSearch}
                                        onChange={(e) =>
                                            setDeptSearch(e.target.value)
                                        }
                                    />
                                    <Search
                                        className="userprof-edit-org-toolbar-search-icon"
                                        size={20}
                                        color="#0f1035"
                                        strokeWidth={1}
                                    />
                                </div>
                                <button
                                    className="userprof-edit-icon-btn"
                                    title="Refresh Org Units"
                                    onClick={() => {
                                        refreshDepartments();
                                        setRefreshSpin(true);
                                    }}
                                >
                                    <RefreshCcw
                                        className={
                                            refreshSpin ? "rotate-once" : ""
                                        }
                                        size={30}
                                        strokeWidth={1}
                                        color="#0f1035"
                                        onAnimationEnd={() =>
                                            setRefreshSpin(false)
                                        }
                                    />
                                </button>
                                <button
                                    className="userprof-edit-icon-btn"
                                    title="Filter Org Units"
                                >
                                    <Filter
                                        size={30}
                                        strokeWidth={1}
                                        color="#0f1035"
                                    />
                                </button>
                            </div>
                        </div>

                        <div className="userprof-edit-org-modal-body">
                            {deptLoading ? (
                                <div className="center">
                                    Loading departments...
                                </div>
                            ) : deptError ? (
                                <div className="center error">
                                    Failed to load departments
                                </div>
                            ) : (
                                <table
                                    className="userprof-edit-org-table"
                                    cellSpacing="0"
                                >
                                    <thead></thead>
                                    <tbody>
                                        {filteredDepartments.length === 0 ? (
                                            <tr className="no-results">
                                                <td colSpan="2">
                                                    No organizational units
                                                    found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredDepartments.map((d) => (
                                                <tr
                                                    key={d.id}
                                                    className={
                                                        "userprof-edit-org-row " +
                                                        (selectedDepartment?.id ===
                                                        d.id
                                                            ? "selected"
                                                            : "")
                                                    }
                                                    onClick={() =>
                                                        setSelectedDepartment(d)
                                                    }
                                                    onDoubleClick={() => {
                                                        setSelectedDepartment(
                                                            d
                                                        );
                                                        confirmDeptModal();
                                                    }}
                                                    tabIndex={0}
                                                    role="button"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            setSelectedDepartment(
                                                                d
                                                            );
                                                            confirmDeptModal();
                                                        } else if (
                                                            e.key === " " ||
                                                            e.key === "Spacebar"
                                                        ) {
                                                            e.preventDefault();
                                                            setSelectedDepartment(
                                                                d
                                                            );
                                                        }
                                                    }}
                                                    aria-pressed={
                                                        selectedDepartment?.id ===
                                                        d.id
                                                    }
                                                >
                                                    <td className="col-id">
                                                        {d.id}
                                                    </td>
                                                    <td className="col-name">
                                                        {d.name}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="userprof-edit-org-modal-footer">
                            <div className="userprof-edit-org-modal-footer-left">
                                <button
                                    className="userprof-edit-modal-btn userprof-edit-modal-clear-btn"
                                    onClick={handleClearDepartment}
                                    disabled={!formData.department}
                                >
                                    Clear Selection
                                </button>
                            </div>
                            <div className="userprof-edit-org-modal-footer-right">
                                <button
                                    className="userprof-edit-modal-btn userprof-edit-modal-confirm-btn"
                                    onClick={confirmDeptModal}
                                    disabled={!selectedDepartment}
                                >
                                    Confirm
                                </button>
                                <button
                                    className="userprof-edit-modal-btn userprof-edit-modal-cancel-btn"
                                    onClick={closeDeptModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailedUserProfile;