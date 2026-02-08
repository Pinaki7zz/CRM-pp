import { useState, useEffect } from "react";
import "../../../../components/Layout/Styles/OrganizationalTable.css";
import { useNavigate } from "react-router-dom";
import "./DisplaySalesChannel.css";

const BASE_URL_MS = import.meta.env.VITE_API_BASE_URL_MS;

function DisplaySalesChannelPage() {
	const [salesChannels, setSalesChannels] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const fetchSalesChannels = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${BASE_URL_MS}/sales-channels`);
			if (!response.ok) {
				throw new Error("Failed to fetch data");
			}

			const data = await response.json();

			// Transform data to match expected table format
			const transformed = data.map((item) => ({
				code: item.salesChannelCode,
				description: item.salesChannelName,
			}));

			setSalesChannels(transformed);
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Failed to fetch sales channels");
			setSalesChannels([]);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchSalesChannels();
	}, []);

	const handleCodeClick = (salesChannelCode) => {
		navigate(`/business-structure/edit-sales-channel/${salesChannelCode}`);
	};

	return (
		<div className="organizational-container-table">
			{/* Sales Channel Table */}
			<div className="organizational__table-wrapper">
				<div className="table-header">
					<h1 className="left-header">Sales Channel - SC</h1>
					<button
						className="right-button"
						onClick={() =>
							navigate("/business-structure/create-sales-channel")
						}
					>
						Create
					</button>
				</div>
				<table className="organizational-table">
					<thead>
						<tr>
							<th className="organizational-table__header">
								Channel Code
							</th>
							<th className="organizational-table__header">
								Channel Name
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
						) : salesChannels.length > 0 ? (
							salesChannels.map((channel) => (
								<tr
									key={channel.code}
									className="organizational-table__row organizational-table__row--body"
								>
									<td className="organizational-table__cell">
										<span
											className="organizational-table__code-link"
											onClick={() =>
												handleCodeClick(channel.code)
											}
										>
											{channel.code}
										</span>
									</td>
									<td className="organizational-table__cell">
										{channel.description || "-"}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan="2"
									className="organizational__no-data-message"
								>
									No sales channels found
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default DisplaySalesChannelPage;
