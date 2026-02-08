// import { useState, useContext, useEffect } from "react";
// import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
// import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
// import "../../../../components/Layout/Styles/BoxFormStyles.css";
// import { FaEdit, FaSave } from "react-icons/fa";
// import { useParams, useNavigate } from "react-router-dom";
// import { Country, State, City } from "country-state-city";

// export default function EditBusinessUnit() {
//     const { setGoBackUrl } = useContext(FormPageHeaderContext);
//     const { businessUnitCode } = useParams();
//     const navigate = useNavigate();
//     const [countries, setCountries] = useState([]);
//     const [states, setStates] = useState([]);
//     const [cities, setCities] = useState([]);
//     const [formData, setFormData] = useState({
//         businessUnitCode: "",
//         businessUnitDesc: "",
//         street1: "",
//         street2: "",
//         city: "",
//         state: "",
//         country: "",
//         pinCode: "",
//     });
//     const [errors, setErrors] = useState({});
//     const [isEditing, setIsEditing] = useState(false);
//     const [originalData, setOriginalData] = useState({});
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         setGoBackUrl("/displayBusinessUnit");
//         fetchBusinessUnit();
//         setCountries(Country.getAllCountries());
//     }, [setGoBackUrl, businessUnitCode]);

//     const fetchBusinessUnit = async () => {
//         try {
//             const response = await fetch(`http://localhost:3003/api/business-units/${businessUnitCode}`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch business unit');
//             }
//             const data = await response.json();
//             setFormData(data);
//             setOriginalData(data);
//             setLoading(false);

//             // Set states and cities based on fetched data
//             const countryObj = Country.getAllCountries().find(c => c.name === data.country);
//             if (countryObj) {
//                 const stateList = State.getStatesOfCountry(countryObj.isoCode);
//                 setStates(stateList);
//                 const stateObj = stateList.find(s => s.name === data.state);
//                 if (stateObj) {
//                     setCities(City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode));
//                 }
//             }
//         } catch (error) {
//             console.error("Error fetching business unit:", error);
//             alert("Failed to fetch business unit data");
//             navigate("/displayBusinessUnit");
//         }
//     };

//     const validateField = (name, value) => {
//         switch (name) {
//             case "businessUnitCode":
//                 if (!value) return "Business Unit Code is required";
//                 if (!/^BU[0-9]{2}$/.test(value)) {
//                     return "Business Unit Code must start with 'BU' followed by 2 digits (e.g., BU01)";
//                 }
//                 return "";
//             case "businessUnitDesc":
//                 if (!value) return "Business Unit Description is required";
//                 if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
//                     return "Business Unit Description must be alphanumeric and up to 30 characters";
//                 }
//                 return "";
//             case "street1":
//                 if (!value.trim()) return "Street 1 is required";
//                 if (value.length > 50) {
//                     return "Street address must be up to 50 characters";
//                 }
//                 return "";
//             case "street2":
//                 if (value && value.length > 50) {
//                     return "Street address must be up to 50 characters";
//                 }
//                 return "";
//             case "city":
//                 if (!value.trim()) return "City is required";
//                 return "";
//             case "state":
//                 if (!value.trim()) return "State is required";
//                 return "";
//             case "country":
//                 if (!value.trim()) return "Country is required";
//                 return "";
//             case "pinCode":
//                 if (!value.trim()) return "Pin Code is required";
//                 if (!/^\d{4,6}$/.test(value)) {
//                     return "Pin code must be 4-6 digits";
//                 }
//                 return "";
//             default:
//                 return "";
//         }
//     };

//     const handleCountryChange = (e) => {
//         if (!isEditing) return;

//         const selected = e.target.value;
//         setFormData({
//             ...formData,
//             country: selected,
//             state: "",
//             city: "",
//         });

//         const countryObj = countries.find((c) => c.name === selected);
//         if (countryObj) {
//             setStates(State.getStatesOfCountry(countryObj.isoCode));
//             setCities([]);
//         } else {
//             setStates([]);
//             setCities([]);
//         }

//         const error = validateField("country", selected);
//         setErrors((prev) => ({ ...prev, country: error }));
//     };

//     const handleStateChange = (e) => {
//         if (!isEditing) return;

//         const selectedState = e.target.value;
//         setFormData({ ...formData, state: selectedState, city: "" });

//         const countryObj = countries.find((c) => c.name === formData.country);
//         const stateObj = states.find((s) => s.name === selectedState);

//         if (countryObj && stateObj) {
//             const cityList = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
//             setCities(cityList);
//         } else {
//             setCities([]);
//         }

//         const error = validateField("state", selectedState);
//         setErrors((prev) => ({ ...prev, state: error }));
//     };

//     const handleChange = (e) => {
//         if (!isEditing) return;

//         const { name, value } = e.target;

//         setFormData((prev) => ({ ...prev, [name]: value }));
//         const error = validateField(name, value);
//         setErrors((prev) => ({ ...prev, [name]: error }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!isEditing) return;

//         let formValid = true;
//         const newErrors = {};

//         Object.keys(formData).forEach((key) => {
//             if (key === "businessUnitCode") return;
//             const error = validateField(key, formData[key]);
//             if (error) {
//                 newErrors[key] = error;
//                 formValid = false;
//             }
//         });

//         setErrors(newErrors);

//         if (!formValid) {
//             alert("Please fix the errors in the form before submitting.");
//             return;
//         }

//         try {
//             const updatePayload = {
//                 businessUnitDesc: formData.businessUnitDesc,
//                 street1: formData.street1,
//                 street2: formData.street2,
//                 city: formData.city,
//                 state: formData.state,
//                 country: formData.country,
//                 pinCode: formData.pinCode,
//             };

//             const response = await fetch(`http://localhost:3003/api/business-units/${businessUnitCode}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(updatePayload),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || 'Failed to update business unit');
//             }

//             const updatedData = await response.json();
//             setOriginalData(updatedData);
//             setIsEditing(false);
//             alert("Business Unit updated successfully!");
//         } catch (error) {
//             console.error("Error updating business unit:", error);
//             alert(error.message || "Failed to update business unit");
//         }
//     };

//     const handleEdit = () => {
//         setIsEditing(true);
//     };

//     if (loading) {
//         return <div className="container">Loading...</div>;
//     }

//     return (
//         <>
//             <div className="container">
//                 <div className="edit-controls">
//                     {isEditing ? (
//                         <button
//                             type="submit"
//                             form="businessUnitForm"
//                             className="save-button-edit-page"
//                         >
//                             <FaSave /> Save
//                         </button>
//                     ) : (
//                         <button
//                             type="button"
//                             className="edit-button-edit-page"
//                             onClick={handleEdit}
//                         >
//                             <FaEdit /> Edit
//                         </button>
//                     )}
//                 </div>
//                 <form id="businessUnitForm" onSubmit={handleSubmit}>
//                     <div className="header-box">
//                         <h2>Business Unit Details</h2>
//                         <div className="data-container">
//                             <div className="data">
//                                 <label htmlFor="businessUnitCode">Business Unit Code*</label>
//                                 <span className="info-icon-tooltip">
//                                     <i className="fas fa-info-circle" />
//                                     <span className="tooltip-text">
//                                         1- Must start with 'BU' followed by 2 digits<br />
//                                         2- Must be unique<br />
//                                         3- No special characters or spaces<br />
//                                         4- Cannot be changed after creation
//                                     </span>
//                                 </span>
//                                 <input
//                                     type="text"
//                                     id="businessUnitCode"
//                                     name="businessUnitCode"
//                                     value={formData.businessUnitCode}
//                                     readOnly
//                                     className="read-only"
//                                 />
//                                 {errors.businessUnitCode && (
//                                     <span className="error">{errors.businessUnitCode}</span>
//                                 )}
//                             </div>
//                             <div className="data">
//                                 <label htmlFor="businessUnitDesc">Business Unit Description*</label>
//                                 <span className="info-icon-tooltip">
//                                     <i className="fas fa-info-circle" />
//                                     <span className="tooltip-text">
//                                         Business Unit Description must be alphanumeric and up to 30 characters
//                                     </span>
//                                 </span>
//                                 <input
//                                     type="text"
//                                     id="businessUnitDesc"
//                                     name="businessUnitDesc"
//                                     value={formData.businessUnitDesc}
//                                     onChange={handleChange}
//                                     maxLength={30}
//                                     required
//                                     readOnly={!isEditing}
//                                     className={`${!isEditing ? "read-only" : ""} ${errors.businessUnitDesc ? "error" : ""}`}
//                                 />
//                                 {errors.businessUnitDesc && (
//                                     <span className="error">{errors.businessUnitDesc}</span>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                     <div className="item-box">
//                         <h2>Address Details</h2>
//                         <div className="data-container">
//                             <div className="data">
//                                 <label htmlFor="street1">Street 1*</label>
//                                 <div className="input-container">
//                                     <textarea
//                                         id="street1"
//                                         name="street1"
//                                         value={formData.street1}
//                                         onChange={handleChange}
//                                         maxLength={50}
//                                         required
//                                         readOnly={!isEditing}
//                                         placeholder="Enter street address"
//                                         className={`resizable-input ${!isEditing ? "read-only" : ""} ${errors.street1 ? "error" : ""}`}
//                                     />
//                                     {errors.street1 && (
//                                         <span className="error">{errors.street1}</span>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="data">
//                                 <label htmlFor="street2">Street 2</label>
//                                 <div className="input-container">
//                                     <textarea
//                                         id="street2"
//                                         name="street2"
//                                         value={formData.street2}
//                                         onChange={handleChange}
//                                         maxLength={50}
//                                         readOnly={!isEditing}
//                                         placeholder="Additional address info"
//                                         className={`resizable-input ${!isEditing ? "read-only" : ""} ${errors.street2 ? "error" : ""}`}
//                                     />
//                                     {errors.street2 && (
//                                         <span className="error">{errors.street2}</span>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="data">
//                                 <label htmlFor="country">Country*</label>
//                                 <div className="input-container">
//                                     <select
//                                         id="country"
//                                         name="country"
//                                         value={formData.country}
//                                         onChange={handleCountryChange}
//                                         required
//                                         disabled={!isEditing}
//                                         className={`${!isEditing ? "read-only" : ""} ${errors.country ? "error" : ""}`}
//                                     >
//                                         <option value="">Select a country</option>
//                                         {countries.map((country) => (
//                                             <option key={country.isoCode} value={country.name}>
//                                                 {country.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.country && (
//                                         <span className="error">{errors.country}</span>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="data">
//                                 <label htmlFor="state">State*</label>
//                                 <div className="input-container">
//                                     <select
//                                         id="state"
//                                         name="state"
//                                         value={formData.state}
//                                         onChange={handleStateChange}
//                                         required
//                                         disabled={!isEditing || !states.length}
//                                         className={`${!isEditing ? "read-only" : ""} ${errors.state ? "error" : ""}`}
//                                     >
//                                         <option value="">Select State</option>
//                                         {states.map((state) => (
//                                             <option key={state.isoCode} value={state.name}>
//                                                 {state.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.state && (
//                                         <span className="error">{errors.state}</span>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="data">
//                                 <label htmlFor="city">City*</label>
//                                 <div className="input-container">
//                                     <select
//                                         id="city"
//                                         name="city"
//                                         value={formData.city}
//                                         onChange={handleChange}
//                                         required
//                                         disabled={!isEditing || !cities.length}
//                                         className={`${!isEditing ? "read-only" : ""} ${errors.city ? "error" : ""}`}
//                                     >
//                                         <option value="">Select a city</option>
//                                         {cities.map((city) => (
//                                             <option key={city.name} value={city.name}>
//                                                 {city.name}
//                                             </option>
//                                         ))}
//                                     </select>
//                                     {errors.city && (
//                                         <span className="error">{errors.city}</span>
//                                     )}
//                                 </div>
//                             </div>
//                             <div className="data">
//                                 <label htmlFor="pinCode">Postal code /Postal code /Pin Code*</label>
//                                 <div className="input-container">
//                                     <input
//                                         type="text"
//                                         id="pinCode"
//                                         name="pinCode"
//                                         value={formData.pinCode}
//                                         onChange={handleChange}
//                                         maxLength={6}
//                                         required
//                                         readOnly={!isEditing}
//                                         placeholder="Enter pin code"
//                                         className={`${!isEditing ? "read-only" : ""} ${errors.pinCode ? "error" : ""}`}
//                                     />
//                                     {errors.pinCode && (
//                                         <span className="error">{errors.pinCode}</span>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </form>
//             </div>
//             <FormPageHeader
//                 onCancel={() => {
//                     if (isEditing) {
//                         setFormData(originalData);
//                         setErrors({});
//                         setIsEditing(false);
//                     }
//                 }}
//             />
//         </>
//     );
// }

import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";

export default function EditBusinessUnit() {
  const { setGoBackUrl } = useContext(FormPageHeaderContext);
  const { businessUnitCode } = useParams();
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    businessUnitCode: "",
    businessUnitDesc: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setGoBackUrl("/displayBusinessUnit");
    fetchBusinessUnit();
    setCountries(Country.getAllCountries());
  }, [setGoBackUrl, businessUnitCode]);

  const fetchBusinessUnit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3003/api/business-units/${businessUnitCode}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch business unit");
      }
      const data = await response.json();
      setFormData(data);
      setOriginalData(data);
      setLoading(false);

      // Set states and cities based on fetched data
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === data.country
      );
      if (countryObj) {
        const stateList = State.getStatesOfCountry(countryObj.isoCode);
        setStates(stateList);
        const stateObj = stateList.find((s) => s.name === data.state);
        if (stateObj) {
          setCities(
            City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching business unit:", error);
      alert("Failed to fetch business unit data");
      navigate("/displayBusinessUnit");
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "businessUnitCode":
        if (!value) return "Business Unit Code is required";
        if (!/^BU[0-9]{2}$/.test(value)) {
          return "Business Unit Code must start with 'BU' followed by 2 digits (e.g., BU01)";
        }
        return "";
      case "businessUnitDesc":
        if (!value) return "Business Unit Description is required";
        if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
          return "Business Unit Description must be alphanumeric and up to 30 characters";
        }
        return "";
      case "street1":
        if (!value.trim()) return "Street 1 is required";
        if (value.length > 50) {
          return "Street address must be up to 50 characters";
        }
        return "";
      case "street2":
        if (value && value.length > 50) {
          return "Street address must be up to 50 characters";
        }
        return "";
      case "city":
        if (!value.trim()) return "City is required";
        return "";
      case "state":
        if (!value.trim()) return "State is required";
        return "";
      case "country":
        if (!value.trim()) return "Country is required";
        return "";
      case "pinCode":
        if (!value.trim()) return "Pin Code is required";
        if (!/^\d{4,6}$/.test(value)) {
          return "Pin code must be 4-6 digits";
        }
        return "";
      default:
        return "";
    }
  };

  const handleCountryChange = (e) => {
    if (!isEditing) return;

    const selected = e.target.value;
    setFormData({
      ...formData,
      country: selected,
      state: "",
      city: "",
    });

    const countryObj = countries.find((c) => c.name === selected);
    if (countryObj) {
      setStates(State.getStatesOfCountry(countryObj.isoCode));
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }

    const error = validateField("country", selected);
    setErrors((prev) => ({ ...prev, country: error }));
  };

  const handleStateChange = (e) => {
    if (!isEditing) return;

    const selectedState = e.target.value;
    setFormData({ ...formData, state: selectedState, city: "" });

    const countryObj = countries.find((c) => c.name === formData.country);
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

    const error = validateField("state", selectedState);
    setErrors((prev) => ({ ...prev, state: error }));
  };

  const handleChange = (e) => {
    if (!isEditing) return;

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("FORM SUBMITTED");
    if (!isEditing) return;

    let formValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      if (key === "businessUnitCode") return;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        formValid = false;
      }
    });

    setErrors(newErrors);

    if (!formValid) {
      alert("Please fix the errors in the form before submitting.");
      return;
    }

    try {
      const updatePayload = {
        businessUnitDesc: formData.businessUnitDesc,
        street1: formData.street1,
        street2: formData.street2,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        pinCode: formData.pinCode,
      };

      const response = await fetch(
        `http://localhost:3003/api/business-units/${businessUnitCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update business unit");
      }

      const updatedData = await response.json();
      setOriginalData(updatedData);
      setIsEditing(false);
      alert("Business Unit updated successfully!");
      navigate("/displayBusinessUnit");
    } catch (error) {
      console.error("Error updating business unit:", error);
      alert(error.message || "Failed to update business unit");
    }
  };

  const handleEdit = () => {
    setTimeout(() => {
      setIsEditing(true);
    }, 0);
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  console.log("=============================>", isEditing);

  return (
    <>
      <div className="container">
        <div className="edit-controls">
          {isEditing ? (
            <button
              type="button"
              onClick={() =>
                document.getElementById("businessUnitForm").requestSubmit()
              }
              className="save-button-edit-page"
            >
              <FaSave /> Save
            </button>
          ) : (
            <button
              type="button"
              className="edit-button-edit-page"
              onClick={handleEdit}
            >
              <FaEdit /> Edit
            </button>
          )}
        </div>
        <form id="businessUnitForm" onSubmit={handleSubmit}>
          {/* <div className="edit-controls">
            {isEditing ? (
              <button type="submit" className="save-button-edit-page">
                <FaSave /> Save
              </button>
            ) : (
              <button
                type="button"
                className="edit-button-edit-page"
                onClick={handleEdit}
              >
                <FaEdit /> Edit
              </button>
            )}
          </div> */}
          <div className="header-box">
            <h2>Business Unit Details</h2>
            <div className="data-container">
              <div className="data">
                <label htmlFor="businessUnitCode">Business Unit Code*</label>
                <span className="info-icon-tooltip">
                  <i className="fas fa-info-circle" />
                  <span className="tooltip-text">
                    1- Must start with 'BU' followed by 2 digits
                    <br />
                    2- Must be unique
                    <br />
                    3- No special characters or spaces
                    <br />
                    4- Cannot be changed after creation
                  </span>
                </span>
                <input
                  type="text"
                  id="businessUnitCode"
                  name="businessUnitCode"
                  value={formData.businessUnitCode}
                  readOnly
                  className="read-only"
                />
                {errors.businessUnitCode && (
                  <span className="error">{errors.businessUnitCode}</span>
                )}
              </div>
              <div className="data">
                <label htmlFor="businessUnitDesc">
                  Business Unit Description*
                </label>
                <span className="info-icon-tooltip">
                  <i className="fas fa-info-circle" />
                  <span className="tooltip-text">
                    Business Unit Description must be alphanumeric and up to 30
                    characters
                  </span>
                </span>
                <input
                  type="text"
                  id="businessUnitDesc"
                  name="businessUnitDesc"
                  value={formData.businessUnitDesc}
                  onChange={handleChange}
                  maxLength={30}
                  required
                  readOnly={!isEditing}
                  className={`${!isEditing ? "read-only" : ""} ${
                    errors.businessUnitDesc ? "error" : ""
                  }`}
                />
                {errors.businessUnitDesc && (
                  <span className="error">{errors.businessUnitDesc}</span>
                )}
              </div>
            </div>
          </div>
          <div className="item-box">
            <h2>Address Details</h2>
            <div className="data-container">
              <div className="data">
                <label htmlFor="street1">Street 1*</label>
                <div className="input-container">
                  <textarea
                    id="street1"
                    name="street1"
                    value={formData.street1}
                    onChange={handleChange}
                    maxLength={50}
                    required
                    readOnly={!isEditing}
                    placeholder="Enter street address"
                    className={`resizable-input ${
                      !isEditing ? "read-only" : ""
                    } ${errors.street1 ? "error" : ""}`}
                  />
                  {errors.street1 && (
                    <span className="error">{errors.street1}</span>
                  )}
                </div>
              </div>
              <div className="data">
                <label htmlFor="street2">Street 2</label>
                <div className="input-container">
                  <textarea
                    id="street2"
                    name="street2"
                    value={formData.street2}
                    onChange={handleChange}
                    maxLength={50}
                    readOnly={!isEditing}
                    placeholder="Additional address info"
                    className={`resizable-input ${
                      !isEditing ? "read-only" : ""
                    } ${errors.street2 ? "error" : ""}`}
                  />
                  {errors.street2 && (
                    <span className="error">{errors.street2}</span>
                  )}
                </div>
              </div>
              <div className="data">
                <label htmlFor="country">Country*</label>
                <div className="input-container">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleCountryChange}
                    required
                    disabled={!isEditing}
                    className={`${!isEditing ? "read-only" : ""} ${
                      errors.country ? "error" : ""
                    }`}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <span className="error">{errors.country}</span>
                  )}
                </div>
              </div>
              <div className="data">
                <label htmlFor="state">State*</label>
                <div className="input-container">
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    required
                    disabled={!isEditing || !states.length}
                    className={`${!isEditing ? "read-only" : ""} ${
                      errors.state ? "error" : ""
                    }`}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <span className="error">{errors.state}</span>
                  )}
                </div>
              </div>
              <div className="data">
                <label htmlFor="city">City*</label>
                <div className="input-container">
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    disabled={!isEditing || !cities.length}
                    className={`${!isEditing ? "read-only" : ""} ${
                      errors.city ? "error" : ""
                    }`}
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && <span className="error">{errors.city}</span>}
                </div>
              </div>
              <div className="data">
                <label htmlFor="pinCode">Postal code /Pin Code*</label>
                <div className="input-container">
                  <input
                    type="text"
                    id="pinCode"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                    maxLength={6}
                    required
                    readOnly={!isEditing}
                    placeholder="Enter pin code"
                    className={`${!isEditing ? "read-only" : ""} ${
                      errors.pinCode ? "error" : ""
                    }`}
                  />
                  {errors.pinCode && (
                    <span className="error">{errors.pinCode}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      <FormPageHeader
        onCancel={() => {
          if (isEditing) {
            setFormData(originalData);
            setErrors({});
            setIsEditing(false);
          }
        }}
      />
    </>
  );
}
