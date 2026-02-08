import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	BarChart,
	Bar,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import "./NewReport.css";

const BASE_URL_ANM = import.meta.env.VITE_API_BASE_URL_ANM;

const ViewReport = () => {
	const navigate = useNavigate();
	const { reportId } = useParams();

	const [activeTab, setActiveTab] = useState("outline");
	const [reportData, setReportData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// Report metadata
	const [reportName, setReportName] = useState("");
	const [reportDescription, setReportDescription] = useState("");
	const [module, setModule] = useState("");
	const [selectedGroups, setSelectedGroups] = useState([]);
	const [selectedColumns, setSelectedColumns] = useState([]);
	const [selectedFilter, setSelectedFilter] = useState("");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [charts, setCharts] = useState([]);

	const COLORS = [
		"#4a90e2",
		"#50c878",
		"#ff6b6b",
		"#ffd93d",
		"#a855f7",
		"#ec4899",
		"#14b8a6",
		"#f97316",
	];

	// Load report details on mount
	useEffect(() => {
		if (reportId) {
			loadReport();
		}
	}, [reportId]);

	const loadReport = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Fetch report metadata
			const response = await fetch(
				`${BASE_URL_ANM}/reports/${reportId}`,
				{
					headers: {
						"Content-Type": "application/json",
						"X-User-Id": "user123",
					},
				}
			);

			const result = await response.json();

			if (result.success) {
				const report = result.data;
				setReportName(report.reportName);
				setReportDescription(report.description);
				setModule(report.module);

				// Parse JSON fields
				try {
					setSelectedGroups(
						report.groups ? JSON.parse(report.groups) : []
					);
					setSelectedColumns(
						report.columns ? JSON.parse(report.columns) : []
					);

					if (report.filters) {
						const filters = JSON.parse(report.filters);
						setSelectedFilter(filters.show || "");
						setStartDate(filters.createdDateFrom || "");
						setEndDate(filters.createdDateTo || "");
					}

					// Load charts
					if (report.charts) {
						setCharts(JSON.parse(report.charts) || []);
					}
				} catch (e) {
					console.error("Error parsing report fields:", e);
				}

				// Auto-execute the report
				executeReport(report);
			} else {
				setError(result.message || "Failed to load report");
			}
		} catch (err) {
			console.error("Error loading report:", err);
			setError("Failed to load report");
		} finally {
			setIsLoading(false);
		}
	};

	const executeReport = async (report) => {
		try {
			setIsLoading(true);
			setError(null);

			// Parse filters
			let filters = { show: "ALL" };
			if (report.filters) {
				try {
					filters = JSON.parse(report.filters);
				} catch (e) {
					console.error("Error parsing filters:", e);
				}
			}

			// Prepare execution payload
			const executionPayload = {
				module: report.module,
				columns: JSON.parse(report.columns || "[]"),
				groups: JSON.parse(report.groups || "[]"),
				filters: filters,
			};

			const response = await fetch(`${BASE_URL_ANM}/reports/execute`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-User-Id": "user123",
				},
				body: JSON.stringify(executionPayload),
			});

			const result = await response.json();

			if (result.success) {
				setReportData(result.data?.rows || []);
			} else {
				setError(result.message || "Failed to execute report");
			}
		} catch (err) {
			console.error("Error executing report:", err);
			setError("Network error while executing report");
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = () => {
		// Navigate to edit page (NewReport in edit mode)
		navigate(`/analytics/reports/${reportId}/edit`);
	};

	const handleClose = () => {
		navigate("/analytics/reports");
	};

	const getCellData = (row, column) => {
		return row[column] || "N/A";
	};

	const getGroupData = (row, group) => {
		return row[group] || "N/A";
	};

	const prepareChartData = (chart) => {
		if (!reportData || reportData.length === 0) return [];

		const groupedData = {};

		reportData.forEach((row) => {
			const xValue = row[chart.xAxis] || "Unknown";

			if (!groupedData[xValue]) {
				groupedData[xValue] = {
					name: xValue,
					count: 0,
					values: [],
				};
			}

			groupedData[xValue].count += 1;

			if (chart.yAxis && row[chart.yAxis]) {
				const numValue = parseFloat(row[chart.yAxis]);
				if (!isNaN(numValue)) {
					groupedData[xValue].values.push(numValue);
				}
			}
		});

		return Object.values(groupedData).map((item) => {
			let value = item.count;

			if (chart.yAxis && item.values.length > 0) {
				if (chart.aggregation === "sum") {
					value = item.values.reduce((a, b) => a + b, 0);
				} else if (chart.aggregation === "average") {
					value =
						item.values.reduce((a, b) => a + b, 0) /
						item.values.length;
				} else if (chart.aggregation === "max") {
					value = Math.max(...item.values);
				} else if (chart.aggregation === "min") {
					value = Math.min(...item.values);
				}
			}

			return {
				name: item.name,
				value: Math.round(value * 100) / 100,
			};
		});
	};

	const renderChart = (chart) => {
		const data = prepareChartData(chart);

		if (data.length === 0) {
			return (
				<div className="chart-empty">
					<p>No data available for this chart</p>
				</div>
			);
		}

		switch (chart.type) {
			case "Bar":
				return (
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar
								dataKey="value"
								fill="#4a90e2"
								name={chart.yAxis || "Count"}
							/>
						</BarChart>
					</ResponsiveContainer>
				);

			case "Line":
				return (
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={data}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line
								type="monotone"
								dataKey="value"
								stroke="#4a90e2"
								name={chart.yAxis || "Count"}
							/>
						</LineChart>
					</ResponsiveContainer>
				);

			case "Pie":
			case "Donut":
				return (
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={data}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={(entry) =>
									`${entry.name}: ${entry.value}`
								}
								outerRadius={80}
								innerRadius={chart.type === "Donut" ? 40 : 0}
								fill="#8884d8"
								dataKey="value"
							>
								{data.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				);

			default:
				return null;
		}
	};

	return (
		<div className="new-report-container">
			{/* Header */}
			<div className="new-report-header">
				<div className="header-left">
					<h1 className="report-title">{reportName || "Report"}</h1>
					<div className="report-type">
						<span className="report-type-label">
							{reportDescription}
						</span>
						<span className="report-subtype">{module}</span>
					</div>
				</div>
				<div className="header-right">
					<button className="btn-secondary" onClick={handleClose}>
						Close
					</button>
					<button className="btn-primary" onClick={handleEdit}>
						Edit
					</button>
				</div>
			</div>

			<div className="new-report-content">
				{/* Left Panel */}
				<div className="left-panel">
					{/* Tab Navigation */}
					<div className="tab-navigation">
						<button
							className={`tab-btn ${
								activeTab === "outline" ? "active" : ""
							}`}
							onClick={() => setActiveTab("outline")}
						>
							Outline
						</button>
						<button
							className={`tab-btn ${
								activeTab === "filter" ? "active" : ""
							}`}
							onClick={() => setActiveTab("filter")}
						>
							Filter
						</button>
					</div>

					{/* Tab Content */}
					<div className="tab-content">
						{activeTab === "outline" && (
							<div className="outline-tab">
								{/* Groups Section */}
								<div className="section">
									<h3 className="section-title">Groups</h3>
									{selectedGroups.length > 0 ? (
										<div className="selected-groups">
											{selectedGroups.map((group) => (
												<div
													key={group}
													className="group-item-view"
												>
													<span>{group}</span>
												</div>
											))}
										</div>
									) : (
										<p className="no-data">
											No groups selected
										</p>
									)}
								</div>

								{/* Columns Section */}
								<div className="section">
									<h3 className="section-title">Columns</h3>
									<div className="selected-columns">
										{selectedColumns.map(
											(column, index) => (
												<div
													key={index}
													className="column-tag-view"
												>
													<span>{column}</span>
												</div>
											)
										)}
									</div>
								</div>

								{/* Charts Section */}
								{charts.length > 0 && (
									<div className="section">
										<h3 className="section-title">
											Charts ({charts.length})
										</h3>
										<div className="charts-list">
											{charts.map((chart, index) => (
												<div
													key={index}
													className="chart-list-item"
												>
													<span className="chart-icon">
														{chart.type === "Bar" &&
															"📊"}
														{chart.type ===
															"Line" && "📈"}
														{chart.type === "Pie" &&
															"🥧"}
														{chart.type ===
															"Donut" && "🍩"}
													</span>
													<span>
														{chart.type} -{" "}
														{chart.xAxis}
													</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Filter Tab */}
						{activeTab === "filter" && (
							<div className="filter-tab">
								<div className="filter-header">
									Filters Applied
								</div>

								<div className="filter-info">
									<div className="filter-item">
										<div className="filter-title">Show</div>
										<div className="filter-value">
											{selectedFilter || "All"}
										</div>
									</div>

									{startDate && endDate && (
										<div className="filter-item">
											<div className="filter-title">
												Created Date
											</div>
											<div className="filter-value">
												{startDate} to {endDate}
											</div>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right Panel - Charts and Data Table */}
				<div className="right-panel">
					{/* Charts Display */}
					{charts.length > 0 && (
						<div className="charts-container">
							{charts.map((chart, index) => (
								<div key={index} className="chart-card">
									<div className="chart-card-header">
										<h3>
											{chart.type} Chart - {chart.xAxis}
										</h3>
									</div>
									<div className="chart-card-body">
										{renderChart(chart)}
									</div>
								</div>
							))}
						</div>
					)}

					{/* Data Table */}
					<div className="data-table-container">
						{isLoading && (
							<div className="loading-message">
								<p>Loading report...</p>
							</div>
						)}

						{error && (
							<div
								className="error-message"
								style={{
									color: "red",
									padding: "20px",
									textAlign: "center",
								}}
							>
								<p>Error: {error}</p>
								<button
									onClick={loadReport}
									className="btn-primary"
								>
									Retry
								</button>
							</div>
						)}

						{!isLoading &&
						!error &&
						(selectedGroups.length > 0 ||
							selectedColumns.length > 0) ? (
							<table className="data-table">
								<thead>
									<tr>
										{selectedGroups.map((group, index) => (
											<th
												key={`group-${index}`}
												className="group-header"
											>
												{group}
											</th>
										))}
										{selectedColumns.map(
											(column, index) => (
												<th
													key={`column-${index}`}
													className="column-header"
												>
													{column}
												</th>
											)
										)}
									</tr>
								</thead>
								<tbody>
									{reportData.length > 0 ? (
										reportData.map((row, index) => (
											<tr key={index}>
												{selectedGroups.map(
													(group, colIndex) => (
														<td
															key={`group-data-${colIndex}`}
														>
															{getGroupData(
																row,
																group
															)}
														</td>
													)
												)}
												{selectedColumns.map(
													(column, colIndex) => (
														<td
															key={`column-data-${colIndex}`}
														>
															{getCellData(
																row,
																column
															)}
														</td>
													)
												)}
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={
													selectedGroups.length +
													selectedColumns.length
												}
												style={{
													textAlign: "center",
													padding: "20px",
												}}
											>
												No data available for this
												report.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						) : (
							<div className="no-columns-message">
								<p>No report configuration found.</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewReport;
