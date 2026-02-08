import { useState } from "react";
import { Link } from "react-router-dom";
import "./OrganizationPage.css";

const OrganizationUnitsPage = () => {
	const [selectedDefineUnit, setSelectedDefineUnit] = useState();
	const [selectedAssignUnit, setSelectedAssignUnit] = useState(null);

	const organizationalUnits = [
		{
			id: "BE",
			name: "Business Entity - BE",
			icon: "🏢",
			path: "/business-structure/display-business-entity",
		},
		{
			id: "BU",
			name: "Business Unit - BU",
			icon: "🏗️",
			path: "/business-structure/display-business-unit",
		},
		{
			id: "SC",
			name: "Sales Channel - SC",
			icon: "📊",
			path: "/business-structure/display-sales-channel",
		},
		{
			id: "SO",
			name: "Sales Office - SO",
			icon: "🏪",
			path: "/business-structure/display-sales-office",
		},
		{
			id: "ST",
			name: "Sales Team - ST",
			icon: "👥",
			path: "/business-structure/display-sales-team",
		},
		{
			id: "MC",
			name: "Marketing Channel - MC",
			icon: "🚚",
			path: "/business-structure/display-marketing-channel",
		},
		{
			id: "MO",
			name: "Marketing Office - MO",
			icon: "🏭",
			path: "/business-structure/display-marketing-office",
		},
		{
			id: "MT",
			name: "Marketing Team - MT",
			icon: "🔍",
			path: "/business-structure/display-marketing-team",
		},
		{
			id: "SeC",
			name: "Service Channel - SeC",
			icon: "🏭",
			path: "/business-structure/display-service-channel",
		},
		{
			id: "SeO",
			name: "Service Office - SeO",
			icon: "👨‍💼",
			path: "/business-structure/display-service-office",
		},
		{
			id: "SeT",
			name: "Service Team - SeT",
			icon: "📦",
			path: "/business-structure/display-service-team",
		},
	];

	const assignments = [
		{ id: "bu-mfu-be", name: "BU - MFU - BE", path: "/BUMFUBE" },
		{ id: "so-sc-bu", name: "SO - SC - BU", path: "/SoScBu" },
		{ id: "sp-st-so", name: "SP - ST - SO", path: "/SoStSp" },
		{ id: "su-sut-mfu", name: "SU - SUT - MFU", path: "/MfuSuSct" },
		{ id: "ib-iu-mfu", name: "IB - IU - MFU", path: "/MfuIuIb" },
		{ id: "mfu-dl", name: "DL - MFU", path: "/MfuDl" },
	];

	const handleDefineUnitClick = (unitId) => {
		setSelectedDefineUnit(unitId);
	};

	const handleAssignUnitClick = (assignmentName) => {
		setSelectedAssignUnit(assignmentName);
	};

	return (
		<div className="org-structure-container">
			<div className="org-structure-main-content">
				<h1 className="org-structure-title">Organization Structure</h1>

				<div className="org-structure-section">
					<h2 className="org-structure-section-title">
						Define Organizational Unit
					</h2>
					<div className="org-structure-units-grid">
						{organizationalUnits.map((unit) => (
							<Link
								key={unit.id}
								to={unit.path}
								className={`org-structure-unit-card ${
									selectedDefineUnit === unit.id
										? "org-structure-unit-card-selected"
										: ""
								}`}
								onClick={() => handleDefineUnitClick(unit.id)}
							>
								<div className="org-structure-unit-icon">
									{unit.icon}
								</div>
								<div className="org-structure-unit-name">
									{unit.name}
								</div>
							</Link>
						))}
					</div>
				</div>

				<div className="assignOrg-structure-section">
					<h2 className="org-structure-section-title">
						Assign Organizational Unit
					</h2>
					<div className="org-structure-assignments-container">
						{assignments.map((assignment) => (
							<Link
								key={assignment.id}
								to={assignment.path}
								className={`org-structure-assignment-pill ${
									selectedAssignUnit === assignment.name
										? "org-structure-assignment-pill-selected"
										: ""
								}`}
								onClick={() =>
									handleAssignUnitClick(assignment.name)
								}
							>
								{assignment.name}
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrganizationUnitsPage;
