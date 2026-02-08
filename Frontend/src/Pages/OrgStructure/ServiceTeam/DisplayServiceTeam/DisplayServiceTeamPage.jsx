import { useState, useEffect } from "react";
import "../../../../components/Layout/Styles/OrganizationalTable.css";
import { useNavigate } from "react-router-dom";
import "./DisplayServiceTeam.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function DisplayServiceTeamPage() {
	const [serviceTeams, setServiceTeams] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchServiceTeams = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE}/api/service-teams`);
			if (!response.ok) {
				alert("Unable to fetch service teams");
				return;
			}
			const data = await response.json();
			setServiceTeams(data);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch service teams");
			setServiceTeams([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchServiceTeams();
	}, []);

	const handleCodeClick = (serviceTeamCode) => {
		navigate(`/editServiceTeamForm/${serviceTeamCode}`);
	};

	return (
		<div className="organizational-container-table">
			<div className="organizational__table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Service Team - ST</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate("/business-structure/create-service-team")
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
						) : serviceTeams.length > 0 ? (
							serviceTeams.map((team) => (
								<tr
									key={team.serviceTeamCode}
									className="organizational-table__row organizational-table__row--body"
								>
									<td className="organizational-table__cell">
										<span
											className="organizational-table__code-link"
											onClick={() =>
												handleCodeClick(
													team.serviceTeamCode
												)
											}
										>
											{team.serviceTeamCode}
										</span>
									</td>
									<td className="organizational-table__cell">
										{team.serviceTeamName || "-"}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="2"
									className="organizational__no-data-message"
								>
									No service teams found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplayServiceTeamPage;
