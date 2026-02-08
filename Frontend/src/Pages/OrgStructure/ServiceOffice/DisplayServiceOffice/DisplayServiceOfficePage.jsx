import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../components/Layout/Styles/OrganizationalTable.css";
import "./DisplayServiceOffice.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function DisplayServiceOfficePage() {
	const [serviceOffices, setServiceOffices] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchServiceOffices = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE_URL_MS}/service-offices`);
			const data = await response.json();
			setServiceOffices(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch service offices");
			setServiceOffices([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchServiceOffices();
	}, []);

	const handleCodeClick = (ServiceOfficeId) => {
		navigate(`/business-structure/edit-service-office/${ServiceOfficeId}`);
	};

	return (
		<div className="organizational-container-table">
			<div className="organizational__table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Service Office - SeO</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate(
								"/business-structure/create-service-office"
							)
						}
					>
						Create
					</button>
				</div>
				<table className="organizational-table">
					<thead>
						<tr>
							<th className="organizational-table__header">ID</th>
							<th className="organizational-table__header">
								Service Office Name
							</th>
							<th className="organizational-table__header">
								City
							</th>
							<th className="organizational-table__header">
								Country
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td
									colSpan="5"
									className="organizational__loading-message"
								>
									Loading...
								</td>
							</tr>
						) : error ? (
							<tr>
								<td
									colSpan="5"
									className="organizational__error-message"
								>
									Error: {error}
								</td>
							</tr>
						) : serviceOffices.length > 0 ? (
							serviceOffices.map((office) => (
								<tr
									key={office.serviceOfficeId}
									className="organizational-table__row organizational-table__row--body"
								>
									<td className="organizational-table__cell">
										<span
											className="organizational-table__code-link"
											onClick={() =>
												handleCodeClick(
													office.serviceOfficeId
												)
											}
										>
											{office.serviceOfficeId || "-"}
										</span>
									</td>
									<td className="organizational-table__cell">
										{office.organizationName || "-"}
									</td>
									<td className="organizational-table__cell">
										{office.city || "-"}
									</td>
									<td className="organizational-table__cell">
										{office.country || "-"}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="5"
									className="organizational__no-data-message"
								>
									No services offices found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplayServiceOfficePage;
