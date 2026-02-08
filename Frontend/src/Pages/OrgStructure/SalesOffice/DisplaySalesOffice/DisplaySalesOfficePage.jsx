import { useState, useEffect, useContext } from "react";
import "../../../../components/Layout/Styles/OrganizationalTable.css";
import { useNavigate } from "react-router-dom";
import "./DisplaySalesOffice.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function SalesOfficeTable() {
	const [salesOffices, setSalesOffices] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchSalesOffices = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE_URL_MS}/sales-offices/`);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const data = await response.json();
			setSalesOffices(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch sales offices");
			setSalesOffices([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSalesOffices();
	}, []);

	const handleCodeClick = (salesOfficeCode) => {
		navigate(`/business-structure/edit-sales-office/${salesOfficeCode}`);
	};

	return (
		<div className="organizational-container-table">
			{/* Sales Office Table */}
			<div className="organizational__table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Sales Office - SO</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate("/business-structure/create-sales-office")
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
								Sales Office Name
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
						) : salesOffices.length > 0 ? (
							salesOffices.map((office) => (
								<tr
									key={office.salesOfficeId}
									className="organizational-table__row organizational-table__row--body"
								>
									<td className="organizational-table__cell">
										<span
											className="organizational-table__code-link"
											onClick={() =>
												handleCodeClick(
													office.salesOfficeId
												)
											}
										>
											{office.salesOfficeId || "-"}
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
									No sales offices found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default SalesOfficeTable;
