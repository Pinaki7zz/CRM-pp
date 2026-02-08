// import { useState, useContext, useEffect } from "react";
// import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
// import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
// import "../../../../components/Layout/Styles/BoxFormStyles.css";
// import { FaEdit, FaSave } from "react-icons/fa";
// import { useParams } from "react-router-dom";

// const API_BASE_URL = `${BASE_URL_AM}`;
// const SOURCING_TEAMS_URL = `${API_BASE_URL}/sourcing-teams`;

// export default function EditSourcingTeamForm() {
//   const { setGoBackUrl } = useContext(FormPageHeaderContext);
//   const { SourcingTeamId } = useParams();

//   const [formData, setFormData] = useState({
//     SourcingTeamId: "",
//     SourcingTeamName: "",
//     TeamType: "",
//     CountryCode: "",
//     PinCode: "",
//     PhoneNumber: "",
//     LandlineNumber: "",
//     Email: ""
//   });

//   const [errors, setErrors] = useState({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [originalData, setOriginalData] = useState({});
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const teamTypes = ["Individual", "Group"];

//   useEffect(() => {
//     setGoBackUrl("/displaySourcingTeam");
//     fetchSourcingTeamData();
//   }, [setGoBackUrl, SourcingTeamId]);

//   const fetchSourcingTeamData = async () => {
//     try {
//       setIsLoading(true);
//       const response = await fetch(`${SOURCING_TEAMS_URL}/${SourcingTeamId}`);

//       if (!response.ok) {
//         throw new Error('Failed to fetch sourcing team data');
//       }

//       const data = await response.json();

//       setFormData({
//         SourcingTeamId: data.SourcingTeamId,
//         SourcingTeamName: data.SourcingTeamName,
//         TeamType: data.TeamType,
//         CountryCode: data.CountryCode,
//         PinCode: data.PinCode,
//         PhoneNumber: data.PhoneNumber,
//         LandlineNumber: data.LandlineNumber,
//         Email: data.Email
//       });
//       setOriginalData(data);
//     } catch (error) {
//       console.error("Error fetching sourcing team:", error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const validateField = (name, value) => {
//     switch (name) {
//       case "SourcingTeamId":
//         if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
//           return "Team ID must be exactly 4 alphanumeric characters";
//         }
//         break;
//       case "SourcingTeamName":
//         if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
//           return "Team Name must be alphanumeric and up to 30 characters";
//         }
//         break;
//       case "TeamType":
//         if (!value) return "Team type is required";
//         break;
//       case "CountryCode":
//         if (value.length > 5 || !/^[0-9+\-() ]+$/.test(value)) {
//           return "Country code must be numeric with special characters (max 5 chars)";
//         }
//         break;
//       case "PinCode":
//         if (!/^\d{6}$/.test(value)) return "Pin code must be exactly 6 digits";
//         break;
//       case "PhoneNumber":
//         if (!/^\d{10,12}$/.test(value)) return "Phone number must be 10-12 digits";
//         break;
//       case "LandlineNumber":
//         if (value && !/^\d{10,12}$/.test(value)) {
//           return "Landline number must be 10-12 digits";
//         }
//         break;
//       case "Email":
//         if (value.length > 20 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
//           return "Email must be valid and up to 20 characters";
//         }
//         break;
//       default:
//         return "";
//     }
//     return "";
//   };

//   const handleChange = (e) => {
//     if (!isEditing) return;

//     const { name, value } = e.target;

//     const error = validateField(name, value);
//     setErrors((prev) => ({
//       ...prev,
//       [name]: error,
//     }));

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     let formValid = true;
//     const newErrors = {};

//     Object.keys(formData).forEach((key) => {
//       if (key !== "SourcingTeamId") { // Skip validation for SourcingTeamId
//         const error = validateField(key, formData[key]);
//         if (error) {
//           newErrors[key] = error;
//           formValid = false;
//         }
//       }
//     });

//     setErrors(newErrors);

//     if (!formValid) {
//       setIsSubmitting(false);
//       alert("Please fix the errors in the form before submitting.");
//       return;
//     }

//     try {
//       // Create payload without SourcingTeamId
//       const payload = {
//         SourcingTeamName: formData.SourcingTeamName,
//         TeamType: formData.TeamType,
//         CountryCode: formData.CountryCode,
//         PinCode: formData.PinCode,
//         PhoneNumber: formData.PhoneNumber,
//         LandlineNumber: formData.LandlineNumber,
//         Email: formData.Email
//       };

//       const response = await fetch(`${SOURCING_TEAMS_URL}/${SourcingTeamId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Failed to update sourcing team');
//       }

//       const updatedData = await response.json();
//       alert("Sourcing Team updated successfully!");
//       setOriginalData(updatedData);
//       setIsEditing(false);
//     } catch (error) {
//       console.error("Error updating sourcing team:", error);
//       alert(`Error: ${error.message}`);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   if (isLoading) {
//     return <div className="container">Loading...</div>;
//   }

//   return (
//     <>
//       <div className="container">
//         <div className="edit-controls">
//           {isEditing ? (
//             <button
//               type="submit"
//               form="sourcingTeamForm"
//               className="save-button-edit-page"
//               disabled={isSubmitting}
//             >
//               <FaSave /> {isSubmitting ? 'Saving...' : 'Save'}
//             </button>
//           ) : (
//             <button
//               type="button"
//               className="edit-button-edit-page"
//               onClick={handleEdit}
//             >
//               <FaEdit /> Edit
//             </button>
//           )}
//         </div>

//         <form id="sourcingTeamForm" onSubmit={handleSubmit}>
//           <div className="header-box">
//             <h2>Sourcing Team Details</h2>
//             <div className="data-container">
//               <div className="data">
//                 <label htmlFor="SourcingTeamId">Sourcing Team Code</label>
//                 <span className="info-icon-tooltip">
//                   <i className="fas fa-info-circle" />
//                   <span className="tooltip-text">
//                     Sourcing Team Code cannot be modified after creation
//                   </span>
//                 </span>
//                 <input
//                   type="text"
//                   id="SourcingTeamId"
//                   name="SourcingTeamId"
//                   value={formData.SourcingTeamId}
//                   readOnly
//                   className="read-only"
//                 />
//               </div>
//               <div className="data">
//                 <label htmlFor="SourcingTeamName">Sourcing Team Description*</label>
//                 <input
//                   type="text"
//                   id="SourcingTeamName"
//                   name="SourcingTeamName"
//                   value={formData.SourcingTeamName}
//                   onChange={handleChange}
//                   maxLength={30}
//                   required
//                   readOnly={!isEditing}
//                   className={!isEditing ? "read-only" : ""}
//                 />
//                 {errors.SourcingTeamName && (
//                   <span className="error">{errors.SourcingTeamName}</span>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="item-box">
//             <h2>Contact Details</h2>
//             <div className="data-container">
//               <div className="data">
//                 <label htmlFor="TeamType">Team Type*</label>
//                 <select
//                   id="TeamType"
//                   name="TeamType"
//                   value={formData.TeamType}
//                   onChange={handleChange}
//                   required
//                   disabled={!isEditing}
//                   className={!isEditing ? "read-only" : ""}
//                 >
//                   <option value="">Select type</option>
//                   {teamTypes.map(type => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//                 {errors.TeamType && <span className="error">{errors.TeamType}</span>}
//               </div>

//               <div className="data">
//                 <label htmlFor="PinCode">Postal code /Pin Code*</label>
//                 <input
//                   type="text"
//                   id="PinCode"
//                   name="PinCode"
//                   value={formData.PinCode}
//                   onChange={handleChange}
//                   maxLength={6}
//                   required
//                   readOnly={!isEditing}
//                   className={!isEditing ? "read-only" : ""}
//                 />
//                 {errors.PinCode && <span className="error">{errors.PinCode}</span>}
//               </div>

//               <div className="data">
//                 <label htmlFor="CountryCode">Country Code*</label>
//                 <input
//                   type="text"
//                   id="CountryCode"
//                   name="CountryCode"
//                   value={formData.CountryCode}
//                   onChange={handleChange}
//                   maxLength={5}
//                   required
//                   placeholder="+91"
//                   readOnly={!isEditing}
//                   className={!isEditing ? "read-only" : ""}
//                 />
//                 {errors.CountryCode && <span className="error">{errors.CountryCode}</span>}
//               </div>

//               <div className="data">
//                 <label htmlFor="PhoneNumber">Phone Number*</label>
//                 <input
//                   type="text"
//                   id="PhoneNumber"
//                   name="PhoneNumber"
//                   value={formData.PhoneNumber}
//                   onChange={handleChange}
//                   maxLength={12}
//                   required
//                   placeholder="10-12 digits"
//                   readOnly={!isEditing}
//                   className={!isEditing ? "read-only" : ""}
//                 />
//                 {errors.PhoneNumber && <span className="error">{errors.PhoneNumber}</span>}
//               </div>

//               <div className="data">
//                 <label htmlFor="LandlineNumber">Landline Number</label>
//                 <input
//                   type="text"
//                   id="LandlineNumber"
//                   name="LandlineNumber"
//                   value={formData.LandlineNumber}
//                   onChange={handleChange}
//                   maxLength={12}
//                   placeholder="10-12 digits"
//                   readOnly={!isEditing}
//                   className={!isEditing ? "read-only" : ""}
//                 />
//                 {errors.LandlineNumber && <span className="error">{errors.LandlineNumber}</span>}
//               </div>

//               <div className="data">
//                 <label htmlFor="Email">E-mail*</label>
//                 <input
//                   type="email"
//                   id="Email"
//                   name="Email"
//                   value={formData.Email}
//                   onChange={handleChange}
//                   maxLength={20}
//                   required
//                   placeholder="E-mail"
//                   readOnly={!isEditing}
//                   className={!isEditing ? "read-only" : ""}
//                 />
//                 {errors.Email && <span className="error">{errors.Email}</span>}
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>
//       <FormPageHeader
//         onCancel={() => {
//           if (isEditing) {
//             setFormData(originalData);
//             setErrors({});
//             setIsEditing(false);
//           }
//         }}
//       />
//     </>
//   );
// }

import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;
const SOURCING_TEAMS_URL = `${BASE_URL_AM}/sourcing-teams`;

export default function EditSourcingTeamForm() {
	const { setGoBackUrl } = useContext(FormPageHeaderContext);
	const { SourcingTeamId } = useParams();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		SourcingTeamId: "",
		SourcingTeamName: "",
		TeamType: "",
		CountryCode: "",
		PinCode: "",
		PhoneNumber: "",
		LandlineNumber: "",
		Email: "",
	});

	const [errors, setErrors] = useState({});
	const [isEditing, setIsEditing] = useState(false);
	const [originalData, setOriginalData] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const teamTypes = ["Individual", "Group"];

	useEffect(() => {
		setGoBackUrl("/displaySourcingTeam");
		fetchSourcingTeamData();
	}, [setGoBackUrl, SourcingTeamId]);

	const fetchSourcingTeamData = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(
				`${SOURCING_TEAMS_URL}/${SourcingTeamId}`
			);

			if (!response.ok) {
				throw new Error("Failed to fetch sourcing team data");
			}

			const data = await response.json();

			setFormData({
				SourcingTeamId: data.SourcingTeamId,
				SourcingTeamName: data.SourcingTeamName,
				TeamType: data.TeamType,
				CountryCode: data.CountryCode,
				PinCode: data.PinCode,
				PhoneNumber: data.PhoneNumber,
				LandlineNumber: data.LandlineNumber,
				Email: data.Email,
			});
			setOriginalData(data);
		} catch (error) {
			console.error("Error fetching sourcing team:", error);
			alert(`Error: ${error.message}`);
		} finally {
			setIsLoading(false);
		}
	};

	const validateField = (name, value) => {
		switch (name) {
			case "SourcingTeamId":
				if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
					return "Team ID must be exactly 4 alphanumeric characters";
				}
				break;
			case "SourcingTeamName":
				if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
					return "Team Name must be alphanumeric and up to 30 characters";
				}
				break;
			case "TeamType":
				if (!value) return "Team type is required";
				break;
			case "CountryCode":
				if (value.length > 5 || !/^[0-9+\-() ]+$/.test(value)) {
					return "Country code must be numeric with special characters (max 5 chars)";
				}
				break;
			case "PinCode":
				if (!/^\d{6}$/.test(value))
					return "Pin code must be exactly 6 digits";
				break;
			case "PhoneNumber":
				if (!/^\d{10,12}$/.test(value))
					return "Phone number must be 10-12 digits";
				break;
			case "LandlineNumber":
				if (value && !/^\d{10,12}$/.test(value)) {
					return "Landline number must be 10-12 digits";
				}
				break;
			case "Email":
				if (
					value.length > 20 ||
					!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
				) {
					return "Email must be valid and up to 20 characters";
				}
				break;
			default:
				return "";
		}
		return "";
	};

	const handleChange = (e) => {
		if (!isEditing) return;

		const { name, value } = e.target;

		const error = validateField(name, value);
		setErrors((prev) => ({
			...prev,
			[name]: error,
		}));

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const validateIndianPinCode = async (pinCode) => {
		try {
			const res = await fetch(
				`https://api.postalpincode.in/pincode/${pinCode}`
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

	useEffect(() => {
		if (formData.country === "India" && formData.pinCode.length === 6) {
			validateIndianPinCode(formData.pinCode).then((result) => {
				if (result.valid) {
					const stateMatch =
						result.state.toLowerCase() ===
						formData.state.toLowerCase();

					if (!stateMatch) {
						alert(
							`PIN code doesn't match selected State. Expected State: ${result.state}`
						);
					}
				} else {
					alert(result.message);
				}
			});
		}
	}, [formData.pinCode]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isEditing) return;

		setIsSubmitting(true);

		let formValid = true;
		const newErrors = {};

		Object.keys(formData).forEach((key) => {
			if (key !== "SourcingTeamId") {
				const error = validateField(key, formData[key]);
				if (error) {
					newErrors[key] = error;
					formValid = false;
				}
			}
		});

		setErrors(newErrors);

		if (!formValid) {
			setIsSubmitting(false);
			alert("Please fix the errors in the form before submitting.");
			return;
		}

		try {
			const payload = {
				SourcingTeamName: formData.SourcingTeamName,
				TeamType: formData.TeamType,
				CountryCode: formData.CountryCode,
				PinCode: formData.PinCode,
				PhoneNumber: formData.PhoneNumber,
				LandlineNumber: formData.LandlineNumber,
				Email: formData.Email,
			};

			const response = await fetch(
				`${SOURCING_TEAMS_URL}/${SourcingTeamId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Failed to update sourcing team"
				);
			}

			const updatedData = await response.json();
			alert("Sourcing Team updated successfully!");
			setOriginalData(updatedData);
			setIsEditing(false);
			navigate("/displaySourcingTeam");
		} catch (error) {
			console.error("Error updating sourcing team:", error);
			alert(`Error: ${error.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (e) => {
		e.preventDefault(); // Prevent form submission
		setIsEditing(true);
	};

	if (isLoading) {
		return <div className="container">Loading...</div>;
	}

	return (
		<>
			<div className="container">
				{/* Move edit controls outside the form */}
				<div className="edit-controls">
					{isEditing ? (
						<button
							type="submit"
							form="sourcingTeamForm"
							className="save-button-edit-page"
							disabled={isSubmitting}
						>
							<FaSave /> {isSubmitting ? "Saving..." : "Save"}
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

				<form id="sourcingTeamForm" onSubmit={handleSubmit}>
					<div className="header-box">
						<h2>Sourcing Team Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="SourcingTeamId">
									Sourcing Team Code
								</label>
								<span className="info-icon-tooltip">
									<i className="fas fa-info-circle" />
									<span className="tooltip-text">
										Sourcing Team Code cannot be modified
										after creation
									</span>
								</span>
								<input
									type="text"
									id="SourcingTeamId"
									name="SourcingTeamId"
									value={formData.SourcingTeamId}
									readOnly
									className="read-only"
								/>
							</div>
							<div className="data">
								<label htmlFor="SourcingTeamName">
									Sourcing Team Description*
								</label>
								<input
									type="text"
									id="SourcingTeamName"
									name="SourcingTeamName"
									value={formData.SourcingTeamName}
									onChange={handleChange}
									maxLength={30}
									required
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.SourcingTeamName && (
									<span className="error">
										{errors.SourcingTeamName}
									</span>
								)}
							</div>
						</div>
					</div>

					<div className="item-box">
						<h2>Contact Details</h2>
						<div className="data-container">
							<div className="data">
								<label htmlFor="TeamType">Team Type*</label>
								<select
									id="TeamType"
									name="TeamType"
									value={formData.TeamType}
									onChange={handleChange}
									required
									disabled={!isEditing}
									className={!isEditing ? "read-only" : ""}
								>
									<option value="">Select type</option>
									{teamTypes.map((type) => (
										<option key={type} value={type}>
											{type}
										</option>
									))}
								</select>
								{errors.TeamType && (
									<span className="error">
										{errors.TeamType}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="PinCode">
									Postal code /Pin Code*
								</label>
								<input
									type="text"
									id="PinCode"
									name="PinCode"
									value={formData.PinCode}
									onChange={handleChange}
									maxLength={6}
									required
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.PinCode && (
									<span className="error">
										{errors.PinCode}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="CountryCode">
									Country Code*
								</label>
								<input
									type="text"
									id="CountryCode"
									name="CountryCode"
									value={formData.CountryCode}
									onChange={handleChange}
									maxLength={5}
									required
									placeholder="+91"
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.CountryCode && (
									<span className="error">
										{errors.CountryCode}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="PhoneNumber">
									Phone Number*
								</label>
								<input
									type="text"
									id="PhoneNumber"
									name="PhoneNumber"
									value={formData.PhoneNumber}
									onChange={handleChange}
									maxLength={12}
									required
									placeholder="10-12 digits"
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.PhoneNumber && (
									<span className="error">
										{errors.PhoneNumber}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="LandlineNumber">
									Landline Number
								</label>
								<input
									type="text"
									id="LandlineNumber"
									name="LandlineNumber"
									value={formData.LandlineNumber}
									onChange={handleChange}
									maxLength={12}
									placeholder="10-12 digits"
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.LandlineNumber && (
									<span className="error">
										{errors.LandlineNumber}
									</span>
								)}
							</div>

							<div className="data">
								<label htmlFor="Email">E-mail*</label>
								<input
									type="email"
									id="Email"
									name="Email"
									value={formData.Email}
									onChange={handleChange}
									maxLength={20}
									required
									placeholder="E-mail"
									readOnly={!isEditing}
									className={!isEditing ? "read-only" : ""}
								/>
								{errors.Email && (
									<span className="error">
										{errors.Email}
									</span>
								)}
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
