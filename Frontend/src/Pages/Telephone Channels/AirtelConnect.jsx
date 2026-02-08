import React, { useState } from "react";
import { CheckCircle, Circle, Play } from "lucide-react";
import "./AirtelConnect.css";

const AirtelConnect = () => {
	const [step, setStep] = useState(1);

	return (
		<div className="airtel-connect">
			<div className="connect-header">
				<div className="dropdown-container">
					<select className="provider-dropdown">
						<option>Airtel Connect</option>
					</select>
				</div>
				<button className="install-button">Install</button>
			</div>

			<div className="connect-box">
				<div className="connect-title">Airtel Connect</div>
			</div>

			<div className="integration-box">
				<div className="integration-title">
					Integrate Airtel Connect With Galusus CRM
				</div>

				<div className="steps-container">
					<div className="steps">
						<div className={`step ${step >= 1 ? "active" : ""}`}>
							{step > 1 ? (
								<CheckCircle size={20} />
							) : (
								<Circle size={20} />
							)}
							<span>Click On Install</span>
						</div>

						<div className={`step ${step >= 2 ? "active" : ""}`}>
							{step > 2 ? (
								<CheckCircle size={20} />
							) : (
								<Circle size={20} />
							)}
							<span>
								Open Galusus CRM and Install Integration Click
								on Connect
							</span>
						</div>

						<div className={`step ${step >= 3 ? "active" : ""}`}>
							{step > 3 ? (
								<CheckCircle size={20} />
							) : (
								<Circle size={20} />
							)}
							<span>Test Connect</span>
						</div>
					</div>
				</div>

				<div className="instructions-box">
					<div className="instructions-title">
						Detailed Instructions: Integrating Airtel Connect With
						Galusus CRM
					</div>

					<div className="code-block">
						<pre>npm i23 catgufhdhsg.js</pre>
						<pre>STEP Two epqiufhgd fehfiuhweo</pre>
						<pre>THISISREQUIREDPLEASE READ SLOWLY</pre>
					</div>

					<div className="resources">
						<div className="resource-item">
							<div className="resource-icon"></div>
							<div className="resource-text">
								API Docs
								<br />
								Learn more about our APIs
							</div>
						</div>

						<div className="resource-item">
							<div className="resource-icon"></div>
							<div className="resource-text">
								Try these API
								<br />
								Endpoints
							</div>
						</div>

						<div className="resource-item">
							<div className="resource-icon"></div>
							<div className="resource-text">Support</div>
						</div>
					</div>
				</div>
			</div>

			<div className="action-footer">
				<button className="action-button">AI Installation</button>
			</div>
		</div>
	);
};

export default AirtelConnect;
