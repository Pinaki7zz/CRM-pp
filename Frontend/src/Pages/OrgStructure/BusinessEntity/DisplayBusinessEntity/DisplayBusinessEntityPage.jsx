import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DisplayBusinessEntity.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function BusinessEntityTable() {
	const [businessEntities, setBusinessEntities] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchBusinessEntities = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE_URL_MS}/business-entities`);

			if (!response.ok) {
				throw new Error("Failed to fetch business entities");
			}

			const data = await response.json();
			setBusinessEntities(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch business entities");
			setBusinessEntities([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchBusinessEntities();
	}, []);

	const handleCodeClick = (businessEntityCode) => {
		navigate(
			`/business-structure/edit-business-entity/${businessEntityCode}`
		);
	};

	return (
		<div className="business-entity-container">
			{/* Business Entity Table */}
			<div className="business-entity-table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Business Entity - BE</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate(
								"/business-structure/create-business-entity"
							)
						}
					>
						Create
					</button>
				</div>
				<table className="business-entity-table">
					<thead>
						<tr>
							<th className="business-entity-table__header">
								Business Entity Code
							</th>
							<th className="business-entity-table__header">
								Business Entity Name
							</th>
							<th className="business-entity-table__header">
								City
							</th>
							<th className="business-entity-table__header">
								Country
							</th>
							{/* <th className="business-entity-table__header">Actions</th> */}
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td
									colSpan="4"
									className="business-entity-table__loading"
								>
									Loading...
								</td>
							</tr>
						) : error ? (
							<tr>
								<td
									colSpan="4"
									className="business-entity-table__error"
								>
									Error: {error}
								</td>
							</tr>
						) : businessEntities.length > 0 ? (
							businessEntities.map((entity) => (
								<tr
									key={entity.businessEntityCode}
									className="business-entity-table__row"
								>
									<td className="business-entity-table__cell">
										<span
											className="business-entity-code-link"
											onClick={() =>
												handleCodeClick(
													entity.businessEntityCode
												)
											}
										>
											{entity.businessEntityCode}
										</span>
									</td>
									<td className="business-entity-table__cell">
										{entity.businessEntityName || "-"}
									</td>
									<td className="business-entity-table__cell">
										{entity.city || "-"}
									</td>
									<td className="business-entity-table__cell">
										{entity.country || "-"}
									</td>
									{/* <td className="business-entity-table__cell">
                    <button className="business-entity-table__button">
                      {" "}
                      <Eye strokeWidth={1} />
                    </button>
                    <button className="business-entity-table__button">
                      <SquarePen strokeWidth={1} />
                    </button>
                  </td> */}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="4"
									className="business-entity-table__no-data"
								>
									No business entities found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default BusinessEntityTable;
