import React, { useState } from "react";
import { Search } from "lucide-react";
import "./TelephoneConnect.css";

const TelephoneConnect = () => {
	const [activeProvider, setActiveProvider] = useState(null);

	const providers = [
		{ id: "airtel", name: "Airtel Connect" },
		{ id: "cloud", name: "Cloud Connect" },
		{ id: "sinch", name: "Sinch Connect" },
	];

	const actions = [
		{ id: "call", name: "Call 123" },
		{ id: "five9", name: "Five 9 call" },
		{ id: "recall", name: "Recall" },
	];

	const handleProviderClick = (providerId) => {
		setActiveProvider(providerId);
	};

	return (
		<div className="telephone-connect">
			<div className="connect-header">
				<div className="dropdown-container">
					<select className="provider-dropdown">
						<option>Telephone Connect</option>
					</select>
				</div>
				<div className="search-container">
					<input
						type="text"
						placeholder="Search telephone connection..."
						className="search-input"
					/>
					<Search className="search-icon-small" size={20} color="#64748b" strokeWidth={1} />
				</div>
			</div>

			<div className="provider-grid">
				{providers.map((provider) => (
					<div
						key={provider.id}
						className={`provider-card ${
							activeProvider === provider.id ? "active" : ""
						}`}
						onClick={() => handleProviderClick(provider.id)}
					>
						{provider.name}
					</div>
				))}
			</div>

			<div className="action-grid">
				{actions.map((action) => (
					<div key={action.id} className="action-card">
						{action.name}
					</div>
				))}
			</div>
		</div>
	);
};

export default TelephoneConnect;
