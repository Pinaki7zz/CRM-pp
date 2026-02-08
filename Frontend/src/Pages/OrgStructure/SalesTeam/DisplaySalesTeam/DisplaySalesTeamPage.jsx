import { useState, useEffect } from "react";
import "../../../../components/Layout/Styles/OrganizationalTable.css";
import { useNavigate } from "react-router-dom";
import "./DisplaySalesTeam.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function DisplaySalesTeamPage() {
	const [salesTeams, setSalesTeams] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchSalesTeams = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE_URL_MS}/sales-teams`);
			if (!response.ok) {
				alert("Unable to fetch sales teams");
				return;
			}
			const data = await response.json();
			setSalesTeams(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch sales teams");
			setSalesTeams([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSalesTeams();
	}, []);

	const handleCodeClick = (salesTeamCode) => {
		navigate(`/editSalesTeamForm/${salesTeamCode}`);
	};

	return (
		<div className="organizational-container-table">
			<div className="organizational__table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Sales Team - ST</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate("/business-structure/create-sales-team")
						}
					>
						Create
					</button>
				</div>
				<table className="organizational-table">
					<thead>
						<tr>
							<th className="organizational-table__header">
								Team Code
							</th>
							<th className="organizational-table__header">
								Team Name
							</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td
									colSpan="2"
									className="organizational__loading-message"
								>
									Loading...
								</td>
							</tr>
						) : error ? (
							<tr>
								<td
									colSpan="2"
									className="organizational__error-message"
								>
									Error: {error}
								</td>
							</tr>
						) : salesTeams.length > 0 ? (
							salesTeams.map((team) => (
								<tr
									key={team.salesTeamCode}
									className="organizational-table__row organizational-table__row--body"
								>
									<td className="organizational-table__cell">
										<span
											className="organizational-table__code-link"
											onClick={() =>
												handleCodeClick(
													team.salesTeamCode
												)
											}
										>
											{team.salesTeamCode}
										</span>
									</td>
									<td className="organizational-table__cell">
										{team.salesTeamName || "-"}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="2"
									className="organizational__no-data-message"
								>
									No sales teams found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplaySalesTeamPage;
