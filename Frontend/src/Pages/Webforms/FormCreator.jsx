import React, { useState } from "react";
import { Save, X } from "lucide-react";
import "./FormCreator.css";

const FormCreator = ({ onCancel }) => {
	const [formName, setFormName] = useState("");
	const [activeModule, setActiveModule] = useState("");
	const [moduleOptions, setModuleOptions] = useState([
		"Accounts",
		"Leads",
		"Contacts",
		"Cases",
	]);

	return (
		<div className="form-creator-container">
			<div className="form-creator-header">
				<h2>Form Name</h2>
				<div className="form-actions">
					<button className="save-button">
						<Save size={16} />
						<span>Save</span>
					</button>
					<button className="cancel-button" onClick={onCancel}>
						<span>Cancel</span>
					</button>
				</div>
			</div>

			<div className="form-input-container">
				<input
					type="text"
					value={formName}
					onChange={(e) => setFormName(e.target.value)}
					placeholder="Enter form name"
					className="form-name-input"
				/>
			</div>

			<div className="modules-section">
				<div className="modules-header">
					<h3>Modules</h3>
					<div className="dropdown">
						<button className="dropdown-button">
							<span>{activeModule || "Select Module"}</span>
							<span className="dropdown-arrow">▼</span>
						</button>
					</div>
				</div>

				<div className="module-options">
					{moduleOptions.map((module, index) => (
						<div
							key={index}
							className={`module-option ${
								activeModule === module ? "active" : ""
							}`}
							onClick={() => setActiveModule(module)}
						>
							<div className="module-icon">
								{module.charAt(0)}
							</div>
							<span>{module}</span>
						</div>
					))}
				</div>
			</div>

			<div className="form-preview">
				<div className="form-preview-header">
					<h3>Form Preview</h3>
					<div className="view-toggle">
						<button className="standard-view-button">
							Standard View
						</button>
						<div className="search-fields">
							<input type="text" placeholder="Search Fields" />
						</div>
					</div>
				</div>

				<div className="form-fields-container">
					<div className="fields-column">
						<h4>Fields</h4>
						<div className="field-item">First Name</div>
						<div className="field-item">Last Name</div>
						<div className="field-item">Email</div>
						<div className="field-item">Phone</div>
						<div className="field-item">Lead Source</div>
						<div className="field-item">Status</div>
						<div className="field-item">Company</div>
						<div className="field-item">Website</div>
						<div className="field-item">Descriptions</div>
						<div className="field-item">State</div>
						<div className="field-item">City</div>
						<div className="field-item">Rating</div>
					</div>

					<div className="form-preview-column">
						<div className="form-field-box">
							<div className="field-label">First Name</div>
							<input
								type="text"
								className="field-input"
								disabled
							/>
						</div>
						<div className="form-field-box">
							<div className="field-label">Last Name</div>
							<input
								type="text"
								className="field-input"
								disabled
							/>
						</div>
						<div className="form-field-box">
							<div className="field-label">Email</div>
							<input
								type="email"
								className="field-input"
								disabled
							/>
						</div>
						<div className="form-field-box">
							<div className="field-label">Phone</div>
							<input
								type="tel"
								className="field-input"
								disabled
							/>
						</div>
					</div>

					<div className="lead-source-column">
						<div className="form-field-box">
							<div className="field-label">Lead Source</div>
							<input
								type="text"
								className="field-input"
								disabled
							/>
						</div>
						<div className="form-field-box">
							<div className="field-label">Last Name</div>
							<input
								type="text"
								className="field-input"
								disabled
							/>
						</div>
						<div className="form-field-box">
							<div className="field-label">State</div>
							<input
								type="text"
								className="field-input"
								disabled
							/>
						</div>
						<div className="form-field-box">
							<div className="field-label">File Upload</div>
							<button className="file-upload-button">
								File Upload
							</button>
						</div>
						<div className="form-field-box">
							<div className="field-label">Privacy Policy</div>
							<div className="privacy-policy-text">
								Privacy policy text here
							</div>
						</div>
						<div className="form-field-box">
							<button className="submit-button">Submit</button>
							<button className="cancel-form-button">
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FormCreator;
