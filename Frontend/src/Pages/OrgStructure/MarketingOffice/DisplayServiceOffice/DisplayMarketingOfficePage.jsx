import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../components/Layout/Styles/OrganizationalTable.css";
import "./DisplayMarketingOffice.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function DisplayMarketingOfficePage() {
	const [marketingOffices, setMarketingOffices] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchMarketingOffices = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE_URL_MS}/marketing-offices`);
			const data = await response.json();
			setMarketingOffices(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch marketing offices");
			setMarketingOffices([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchMarketingOffices();
	}, []);

	const handleCodeClick = (MarketingOfficeCode) => {
		navigate(
			`/business-structure/edit-marketing-office/${MarketingOfficeCode}`
		);
	};

	return (
		<div className="organizational-container-table">
			<div className="organizational__table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Marketing Office - MO</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate(
								"/business-structure/create-marketing-office"
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
								Marketing Office Name
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
						) : marketingOffices.length > 0 ? (
							marketingOffices.map((office) => (
								<tr
									key={office.marketingOfficeId}
									className="organizational-table__row organizational-table__row--body"
								>
									<td className="organizational-table__cell">
										<span
											className="organizational-table__code-link"
											onClick={() =>
												handleCodeClick(
													office.marketingOfficeId
												)
											}
										>
											{office.marketingOfficeId || "-"}
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
									No marketings offices found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplayMarketingOfficePage;
