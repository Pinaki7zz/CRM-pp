import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DisplayBusinessUnit.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function BusinessUnitTable() {
	const [businessUnits, setBusinessUnits] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchBusinessUnits = async (searchTerm = "") => {
		setIsLoading(true);
		setError(null);

		try {
			const url = searchTerm
				? `${BASE_URL_MS}/business-units?search=${encodeURIComponent(
						searchTerm
				  )}`
				: `${BASE_URL_MS}/business-units`;

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error("Failed to fetch business units");
			}

			const data = await response.json();
			setBusinessUnits(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch business units");
			setBusinessUnits([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBusinessUnits();
	}, []);

	const handleCodeClick = (businessUnitCode) => {
		navigate(`/business-structure/edit-business-unit/${businessUnitCode}`);
	};

	return (
		<div className="business-unit-container-2345">
			<div className="business-unit-table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Business Unit - BU</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate("/business-structure/create-business-unit")
						}
					>
						Create
					</button>
				</div>
				<table className="business-unit-table">
					<thead>
						<tr>
							<th className="business-unit-table__header">
								Business Unit Code
							</th>
							<th className="business-unit-table__header">
								Business Unit Name
							</th>
							<th className="business-unit-table__header">
								City
							</th>
							<th className="business-unit-table__header">
								Country
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td
									colSpan="4"
									className="business-unit-table__loading"
								>
									Loading...
								</td>
							</tr>
						) : error ? (
							<tr>
								<td
									colSpan="4"
									className="business-unit-table__error"
								>
									Error: {error}
								</td>
							</tr>
						) : businessUnits.length > 0 ? (
							businessUnits.map((unit) => (
								<tr
									key={unit.businessUnitCode}
									className="business-unit-table__row"
								>
									<td className="business-unit-table__cell">
										<span
											className="business-unit-code-link"
											onClick={() =>
												handleCodeClick(
													unit.businessUnitCode
												)
											}
										>
											{unit.businessUnitCode}
										</span>
									</td>
									<td className="business-unit-table__cell">
										{unit.businessUnitDesc || "-"}
									</td>
									<td className="business-unit-table__cell">
										{unit.city || "-"}
									</td>
									<td className="business-unit-table__cell">
										{unit.country || "-"}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="4"
									className="business-unit-table__no-data"
								>
									No business units found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default BusinessUnitTable;
