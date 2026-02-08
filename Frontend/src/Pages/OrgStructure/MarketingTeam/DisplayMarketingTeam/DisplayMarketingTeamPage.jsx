import { useState, useEffect } from "react";
import "../../../../components/Layout/Styles/OrganizationalTable.css";
import { useNavigate } from "react-router-dom";
import "./DisplayMarketingTeam.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function DisplayMarketingTeamPage() {
	const [marketingTeams, setMarketingTeams] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchMarketingTeams = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE_URL_MS}/marketing-teams`);
			if (!response.ok) {
				alert("Unable to fetch marketing teams");
				return;
			}
			const data = await response.json();
			setMarketingTeams(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch marketing teams");
			setMarketingTeams([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchMarketingTeams();
	}, []);

	const handleCodeClick = (marketingTeamCode) => {
		navigate(`/editMarketingTeamForm/${marketingTeamCode}`);
	};

	return (
		<div className="organizational-container-table">
			<div className="organizational__table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Marketing Team - ST</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate(
								"/business-structure/create-marketing-team"
							)
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
						) : marketingTeams.length > 0 ? (
							marketingTeams.map((team) => (
								<tr
									key={team.marketingTeamCode}
									className="organizational-table__row organizational-table__row--body"
								>
									<td className="organizational-table__cell">
										<span
											className="organizational-table__code-link"
											onClick={() =>
												handleCodeClick(
													team.marketingTeamCode
												)
											}
										>
											{team.marketingTeamCode}
										</span>
									</td>
									<td className="organizational-table__cell">
										{team.marketingTeamName || "-"}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="2"
									className="organizational__no-data-message"
								>
									No marketing teams found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplayMarketingTeamPage;
