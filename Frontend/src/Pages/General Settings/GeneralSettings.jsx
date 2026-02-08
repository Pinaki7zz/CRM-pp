import "./GeneralSettings.css";
import { Link } from "react-router-dom";

const GeneralSettings = () => {
	return (
		<div className="gs-container">
			<h1 className="gs-header">General Settings</h1>

			<div className="gs-grid">
				{/* LEFT SECTION */}
				<div className="gs-column">
					{/* USER */}
					<div className="gs-section">
						<h2 className="gs-title">User</h2>
						<ul className="gs-list">
							<li>
								<Link to="/admin/accessmanagement">
									Business Role
								</Link>
							</li>
							<li>
								<Link to="/admin/employees">Employee</Link>
							</li>
							<li>
								<Link to="/admin/userprofiles">
									Business User
								</Link>
							</li>
						</ul>
					</div>

					{/* SYSTEM ADMIN */}
					<div className="gs-section">
						<h2 className="gs-title">System Administration</h2>
						<ul className="gs-list">
							<li>
								<span>Web Service Message Monitoring</span>
							</li>
							<li>
								<span>Cases</span>
							</li>
						</ul>
					</div>

					{/* INTEGRATION */}
					<div className="gs-section">
						<h2 className="gs-title">Integration</h2>
						<ul className="gs-list">
							<li>
								<span>Communication System</span>
							</li>
							<li>
								<span>
									Adapt Integration Content for New Tenant
								</span>
							</li>
						</ul>
					</div>
				</div>

				{/* RIGHT SECTION */}
				<div className="gs-column">
					{/* WORK DISTRIBUTION */}
					<div className="gs-section">
						<h2 className="gs-title">Work Distribution</h2>
						<ul className="gs-list">
							<li>
								<span>Organizational Work Distribution</span>
							</li>
						</ul>
					</div>

					{/* ADAPTATION CHANGES */}
					<div className="gs-section">
						<h2 className="gs-title">Adaptation Changes</h2>
						<ul className="gs-list">
							<li>
								<span>Layout Change History</span>
							</li>
						</ul>
					</div>

					{/* CODE LIST */}
					<div className="gs-section">
						<h2 className="gs-title">Code List</h2>
						<ul className="gs-list">
							<li>
								<span>Code List Restriction</span>
							</li>
						</ul>
					</div>

					{/* SLA SETUP LIST */}
					<div className="gs-section">
						<h2 className="gs-title">SLA Setup</h2>
						<ul className="gs-list">
							<li>
								<span>Service Level Agreement</span>
							</li>
							<li>
								<span>Service Categories</span>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GeneralSettings;
