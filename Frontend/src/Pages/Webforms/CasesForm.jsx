import { useState, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import "./LeadsForm.css";
import DetailsPopup from "./DetailsPopup";
import PreviewPopup from "./PreviewPopup";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const initialFields = [
	"Type",
	"Case Reason",
	"Reported By",
	"Email",
	"Phone",
	"Last Time Activity",
	"Description",
	"Internal Comments",
	"Solution",
	"Case Origin",
	"Subject",
];

const defaultFormFields = [
	{ label: "Priority", required: true },
	{ label: "Status", required: true },
];

const CasesForm = ({ onCancel, editData, initialFormName }) => {
	const [formName, setFormName] = useState(
		editData?.name || initialFormName || ""
	);
	const [availableFields, setAvailableFields] = useState(
		editData
			? initialFields.filter(
					(f) => !editData.fields.some((ef) => ef.label === f)
			  )
			: initialFields
	);
	const [formFields, setFormFields] = useState(
		editData?.fields || defaultFormFields
	);
	const [showDetailsPopup, setShowDetailsPopup] = useState(false);
	const [showPreviewPopup, setShowPreviewPopup] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");

	const dragItem = useRef();
	const dragOverItem = useRef();

	const handleDragStartLeft = (e, field) => {
		e.dataTransfer.setData("field", field);
	};

	const handleDropRight = (e) => {
		e.preventDefault();
		const field = e.dataTransfer.getData("field");
		if (field && availableFields.includes(field)) {
			setFormFields([...formFields, { label: field, required: false }]);
			setAvailableFields(availableFields.filter((f) => f !== field));
		}
	};

	const handleDragStartRight = (index) => {
		dragItem.current = index;
	};

	const handleDragEnterRight = (index) => {
		dragOverItem.current = index;
	};

	const handleDropReorder = () => {
		const copy = [...formFields];
		const dragField = copy[dragItem.current];
		copy.splice(dragItem.current, 1);
		copy.splice(dragOverItem.current, 0, dragField);
		setFormFields(copy);
		dragItem.current = null;
		dragOverItem.current = null;
	};

	const handleDeleteField = (index) => {
		const removed = formFields[index];
		setFormFields(formFields.filter((_, i) => i !== index));
		setAvailableFields([...availableFields, removed.label]);
	};

	const filteredFields = availableFields.filter((field) =>
		field.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleSaveForm = async (detailsData) => {
		const webformData = {
			name: formName,
			module: "Cases",
			fields: formFields,
			...detailsData,
		};

		try {
			const response = await fetch(`${BASE_URL_CM}/webforms`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(webformData),
			});

			const result = await response.json();

			if (result.success) {
				alert("Webform created successfully!");
				if (onCancel) onCancel();
			} else {
				alert("Error: " + result.message);
			}
		} catch (error) {
			console.error("Error saving webform:", error);
			alert("Failed to save webform");
		}
	};

	return (
		<div className="leads-form-container">
			<div className="leads-header">
				<input
					type="text"
					value={formName}
					onChange={(e) => setFormName(e.target.value)}
					placeholder="Enter form name"
					className="form-name-input"
					style={{
						fontSize: "24px",
						fontWeight: "bold",
						border: "none",
						borderBottom: "2px solid #ddd",
						padding: "4px",
						width: "200px",
					}}
				/>
				<span className="module-label">Cases</span>
				<div className="nav-buttons">
					<button onClick={onCancel}>Cancel</button>
					<button onClick={() => setShowPreviewPopup(true)}>
						Preview
					</button>
					<button
						className="next-btn"
						onClick={() => setShowDetailsPopup(true)}
					>
						Next
					</button>
				</div>
			</div>

			<div className="leads-body">
				<div className="left-panel">
					<h4>Layout</h4>
					<select>
						<option>Standard</option>
					</select>
					<input
						type="text"
						placeholder="Search Fields"
						className="search-input"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
					<div className="field-list">
						{filteredFields.map((field) => (
							<div
								className="field-item"
								key={field}
								draggable
								onDragStart={(e) =>
									handleDragStartLeft(e, field)
								}
							>
								{field}
							</div>
						))}
					</div>
				</div>

				<div className="right-panel">
					<div
						className="form-preview"
						onDrop={handleDropRight}
						onDragOver={(e) => e.preventDefault()}
					>
						{formFields.map((field, idx) => (
							<div
								className="form-row"
								key={field.label + idx}
								draggable
								onDragStart={() => handleDragStartRight(idx)}
								onDragEnter={() => handleDragEnterRight(idx)}
								onDragEnd={handleDropReorder}
								style={{ opacity: 0.95, cursor: "move" }}
							>
								<label>
									{field.label}
									{field.required && (
										<span style={{ color: "red" }}> *</span>
									)}
								</label>
								<div className="input-delete-wrapper">
									{field.label === "Email Opt Out" ? (
										<input type="checkbox" />
									) : (
										<input type="text" readOnly />
									)}
									<FaTrash
										className="delete-icon"
										onClick={() => handleDeleteField(idx)}
										title="Remove field"
									/>
								</div>
							</div>
						))}
						<div className="form-buttons">
							<button className="submit-btn">Submit</button>
							<button className="reset-btn">Reset</button>
						</div>
					</div>
				</div>
			</div>

			{showPreviewPopup && (
				<PreviewPopup
					formName={formName}
					formFields={formFields}
					onClose={() => setShowPreviewPopup(false)}
				/>
			)}

			{showDetailsPopup && (
				<DetailsPopup
					onClose={() => setShowDetailsPopup(false)}
					formName={formName}
					formFields={formFields}
					module="Cases"
					onSave={handleSaveForm}
				/>
			)}
		</div>
	);
};

export default CasesForm;
