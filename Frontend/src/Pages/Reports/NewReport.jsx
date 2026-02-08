import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
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

const NewReport = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { reportId } = useParams();

	const [isEditMode, setIsEditMode] = useState(false);
	const [module, setModule] = useState(location.state?.module || "Lead");

	const [activeTab, setActiveTab] = useState("outline");
	const [selectedGroups, setSelectedGroups] = useState([]);
	const [selectedColumns, setSelectedColumns] = useState([]);
	const [groupSearch, setGroupSearch] = useState("");
	const [columnSearch, setColumnSearch] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("");
	const [selectedDateFilter, setSelectedDateFilter] = useState();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isDateModalOpen, setIsDateModalOpen] = useState(false);
	const [selectedDateField, setSelectedDateField] = useState("Create Date");
	const [selectedRange, setSelectedRange] = useState("Custom");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [showGroupDropdown, setShowGroupDropdown] = useState(false);
	const [showColumnDropdown, setShowColumnDropdown] = useState(false);
	const [isSaveReportModalOpen, setIsSaveReportModalOpen] = useState(false);
	const [isSaveAndRun, setIsSaveAndRun] = useState(false);
	const [reportName, setReportName] = useState("");
	const [reportDescription, setReportDescription] = useState("");
	const [selectedFolder, setSelectedFolder] = useState("");
	const [showChartDropdown, setShowChartDropdown] = useState(false);

	// Chart states
	const [charts, setCharts] = useState([]);
	const [isChartConfigModalOpen, setIsChartConfigModalOpen] = useState(false);
	const [currentChartType, setCurrentChartType] = useState("");
	const [chartXAxis, setChartXAxis] = useState("");
	const [chartYAxis, setChartYAxis] = useState("");
	const [chartAggregation, setChartAggregation] = useState("count");

	const [folders, setFolders] = useState([]);
	const [foldersLoading, setFoldersLoading] = useState(false);

	const [reportData, setReportData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

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

	// Dynamic Groups and Columns based on module
	const moduleConfig = {
		Lead: {
			groups: [
				"Lead Owner",
				"Created By",
				"Lead Status",
				"Lead Source",
				"Interest Level",
			],
			columns: [
				"First Name",
				"Last Name",
				"Title",
				"Company/Account",
				"Email",
				"Phone",
				"Lead Source",
				"Status",
				"Created Date",
			],
			defaultColumns: [
				"First Name",
				"Last Name",
				"Title",
				"Company/Account",
			],
			filterOptions: ["My Leads", "All Leads"],
		},
		Account: {
			groups: [
				"Account Owner",
				"Account Type",
				"Industry",
				"Billing Country",
				"Billing City",
			],
			columns: [
				"Account ID",
				"Account Name",
				"Account Owner",
				"Account Type",
				"Industry",
				"Website",
				"Note",
				"Parent Account",
				"Billing Country",
				"Billing State",
				"Billing City",
				"Billing ZIP Code",
				"Billing Address Line 1",
				"Billing Address Line 2",
				"Shipping Country",
				"Shipping State",
				"Shipping City",
				"Shipping ZIP Code",
				"Shipping Address Line 1",
				"Shipping Address Line 2",
				"Created Date",
				"Last Modified Date",
			],
			defaultColumns: [
				"Account Name",
				"Account Owner",
				"Account Type",
				"Industry",
			],
			filterOptions: ["My Accounts", "All Accounts"],
		},
		Contact: {
			groups: [
				"Created By",
				"Last Modified by",
				"Account Name",
				"Department",
			],
			columns: [
				"Contact Name",
				"Contact ID",
				"First Name",
				"Last Name",
				"Email",
				"Phone",
				"Account Name",
				"Account Type",
				"Department",
				"Role",
				"Website",
				"Address Line 1",
				"Country",
				"Created At",
			],
			defaultColumns: [
				"Contact Name",
				"Contact ID",
				"Account Type",
				"Role",
			],
			filterOptions: ["My Contacts", "All Contacts"],
		},
		Opportunity: {
			groups: [
				"Created By",
				"Last Modified by",
				"Lead Sources",
				"Type",
				"Stage",
			],
			columns: [
				"Account Id",
				"Opportunities Name",
				"Opportunities Owner",
				"Account Type",
				"Status",
				"Probability",
				"Stage",
				"Amount",
				"Lead Sources",
				"Created At",
			],
			defaultColumns: [
				"Opportunities Name",
				"Opportunities Owner",
				"Account Type",
				"Status",
			],
			filterOptions: ["My Opportunities", "All Opportunities"],
		},
		"Sales Quotes": {
			groups: ["Created By", "Last Modified by", "Account Name"],
			columns: [
				"Sales Quotes Name",
				"Sales Quotes ID",
				"Sales Quotes Owner",
				"Opportunities Name",
				"Amount",
				"Success Rate",
				"Due Date",
				"Created At",
				"Status",
			],
			defaultColumns: [
				"Sales Quotes Name",
				"Sales Quotes ID",
				"Sales Quotes Owner",
				"Status",
			],
			filterOptions: ["My Sales Quotes", "All Sales Quotes"],
		},
		"Sales Order": {
			groups: ["Created By", "Last Modified by", "Account Name"],
			columns: [
				"Sales Order Name",
				"Sales Order ID",
				"Sales Order Owner",
				"Opportunities Name",
				"Amount",
				"Purchase Order",
				"Due Date",
				"Commission",
				"Budget",
				"Created At",
				"Status",
			],
			defaultColumns: [
				"Sales Order Name",
				"Sales Order ID",
				"Sales Order Owner",
				"Status",
			],
			filterOptions: ["My Sales Orders", "All Sales Orders"],
		},
	};

	const availableGroups = moduleConfig[module]?.groups || [];
	const availableColumns = moduleConfig[module]?.columns || [];
	const filterOptions = moduleConfig[module]?.filterOptions || [
		"My Items",
		"All Items",
	];

	// Set default columns and filter when module changes
	useEffect(() => {
		if (!isEditMode) {
			setSelectedColumns(moduleConfig[module]?.defaultColumns || []);
			setSelectedFilter(moduleConfig[module]?.filterOptions[0] || "");
		}
	}, [module, isEditMode]);

	// Load existing report if in edit mode
	useEffect(() => {
		if (reportId) {
			setIsEditMode(true);
			loadExistingReport();
		}
	}, [reportId]);

	const loadExistingReport = async () => {
		try {
			setIsLoading(true);
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

				setModule(report.module);
				setReportName(report.reportName);
				setReportDescription(report.description);
				setSelectedFolder(
					report.folderId ? report.folderId.toString() : ""
				);

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

					if (report.charts) {
						setCharts(JSON.parse(report.charts) || []);
					}
				} catch (e) {
					console.error("Error parsing report data:", e);
				}
			} else {
				alert("Failed to load report: " + result.message);
				navigate("/analytics/reports");
			}
		} catch (error) {
			console.error("Error loading report:", error);
			alert("Failed to load report for editing");
			navigate("/analytics/reports");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		const fetchFolders = async () => {
			try {
				setFoldersLoading(true);
				const response = await fetch(`${BASE_URL_ANM}/folders`, {
					headers: {
						"Content-Type": "application/json",
						"X-User-Id": "user123",
					},
				});
				const result = await response.json();
				if (result.success && Array.isArray(result.data)) {
					setFolders(result.data);
				} else {
					setFolders([]);
				}
			} catch (e) {
				console.error("Error fetching folders for report save:", e);
				setFolders([]);
			} finally {
				setFoldersLoading(false);
			}
		};

		fetchFolders();
	}, []);

	const executeReport = useCallback(async () => {
		if (!module) {
			console.log("No module set, skipping execution");
			return;
		}

		setIsLoading(true);
		setError(null);

		try {
			let showValue = "ALL";
			if (selectedFilter && selectedFilter.toLowerCase().includes("my")) {
				if (module === "Lead") {
					showValue = "MY_LEADS";
				} else if (module === "Account") {
					showValue = "MY_ACCOUNTS";
				} else if (module === "Opportunity") {
					showValue = "MY_OPPORTUNITIES";
				} else if (module === "Contact") {
					showValue = "MY_CONTACTS";
				} else if (module === "Sales Quotes") {
					showValue = "MY_QUOTES";
				} else if (module === "Sales Order") {
					showValue = "MY_ORDERS";
				}
			} else {
				if (module === "Lead") {
					showValue = "ALL_LEADS";
				} else if (module === "Account") {
					showValue = "ALL_ACCOUNTS";
				} else if (module === "Opportunity") {
					showValue = "ALL_OPPORTUNITIES";
				} else if (module === "Contact") {
					showValue = "ALL_CONTACTS";
				} else if (module === "Sales Quotes") {
					showValue = "ALL_QUOTES";
				} else if (module === "Sales Order") {
					showValue = "ALL_ORDERS";
				}
			}

			const filters = {
				show: showValue,
			};

			if (startDate && endDate) {
				filters.createdDateFrom = startDate;
				filters.createdDateTo = endDate;
			}

			const requestData = {
				module: module,
				columns: selectedColumns,
				groups: selectedGroups,
				filters: filters,
			};

			console.log("Executing report with data:", requestData);

			const response = await fetch(`${BASE_URL_ANM}/reports/execute`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-User-Id": "user123",
				},
				body: JSON.stringify(requestData),
			});

			const result = await response.json();

			if (result.success) {
				console.log("Report executed successfully:", result.data);
				setReportData(result.data?.rows || []);
			} else {
				setError(result.message || "Failed to execute report");
			}
		} catch (err) {
			console.error("Error executing report:", err);
			setError("Network error. Please ensure the backend is running.");
		} finally {
			setIsLoading(false);
		}
	}, [
		module,
		selectedColumns,
		selectedGroups,
		selectedFilter,
		startDate,
		endDate,
	]);

	useEffect(() => {
		if (selectedColumns.length > 0) {
			executeReport();
		}
	}, [
		selectedColumns,
		selectedGroups,
		selectedFilter,
		startDate,
		endDate,
		executeReport,
	]);

	const handleTabChange = (tab) => {
		setActiveTab(tab);
	};

	const handleGroupToggle = (group) => {
		setSelectedGroups((prev) =>
			prev.includes(group)
				? prev.filter((g) => g !== group)
				: [...prev, group]
		);
	};

	const handleColumnRemove = (column) => {
		setSelectedColumns((prev) => prev.filter((col) => col !== column));
	};

	const handleColumnAdd = (column) => {
		if (!selectedColumns.includes(column)) {
			setSelectedColumns((prev) => [...prev, column]);
		}
	};

	const handleSaveRun = () => {
		console.log("Save & Run clicked");
		setIsSaveAndRun(true);
		setIsSaveReportModalOpen(true);
	};

	const handleSave = () => {
		setIsSaveAndRun(false);
		setIsSaveReportModalOpen(true);
	};

	const handleClose = () => {
		console.log("Close clicked - Navigating to Reports page");
		navigate("/analytics/reports");
	};

	const handleRun = () => {
		console.log("Run clicked - Executing report");
		executeReport();
	};

	const handleAddChart = () => {
		setShowChartDropdown(!showChartDropdown);
	};

	const handleChartSelect = (chartType) => {
		setCurrentChartType(chartType);
		setShowChartDropdown(false);
		setIsChartConfigModalOpen(true);
		setChartXAxis(selectedGroups[0] || "");
		setChartYAxis("");
		setChartAggregation("count");
	};

	const handleSaveChart = () => {
		const newChart = {
			id: Date.now(),
			type: currentChartType,
			xAxis: chartXAxis,
			yAxis: chartYAxis,
			aggregation: chartAggregation,
		};

		setCharts([...charts, newChart]);
		setIsChartConfigModalOpen(false);
		setChartXAxis("");
		setChartYAxis("");
		setChartAggregation("count");
	};

	const handleRemoveChart = (chartId) => {
		setCharts(charts.filter((c) => c.id !== chartId));
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

	const handleOpenModal = () => setIsModalOpen(true);
	const handleCloseModal = () => setIsModalOpen(false);

	const handleFilterSelect = (filter) => {
		setSelectedFilter(filter);
		setIsModalOpen(false);
	};

	const handleOpenDateModal = () => setIsDateModalOpen(true);
	const handleCloseDateModal = () => setIsDateModalOpen(false);

	const handleApplyDateFilter = () => {
		setSelectedDateFilter(
			`${selectedDateField} - ${selectedRange}${
				selectedRange === "Custom"
					? ` (${startDate || "?"} → ${endDate || "?"})`
					: ""
			}`
		);
		setIsDateModalOpen(false);
	};

	const handleCloseSaveReportModal = () => {
		setIsSaveReportModalOpen(false);
		setIsSaveAndRun(false);
		if (!isEditMode) {
			setReportName("");
			setReportDescription("");
			setSelectedFolder("");
		}
	};

	const handleSaveReport = async () => {
		try {
			// Determine the correct show value based on module and selectedFilter
			let showValue = "ALL";
			if (selectedFilter && selectedFilter.toLowerCase().includes("my")) {
				if (module === "Lead") {
					showValue = "MY_LEADS";
				} else if (module === "Account") {
					showValue = "MY_ACCOUNTS";
				} else if (module === "Opportunity") {
					showValue = "MY_OPPORTUNITIES";
				} else if (module === "Contact") {
					showValue = "MY_CONTACTS";
				} else if (module === "Sales Quotes") {
					showValue = "MY_QUOTES";
				} else if (module === "Sales Order") {
					showValue = "MY_ORDERS";
				}
			} else {
				if (module === "Lead") {
					showValue = "ALL_LEADS";
				} else if (module === "Account") {
					showValue = "ALL_ACCOUNTS";
				} else if (module === "Opportunity") {
					showValue = "ALL_OPPORTUNITIES";
				} else if (module === "Contact") {
					showValue = "ALL_CONTACTS";
				} else if (module === "Sales Quotes") {
					showValue = "ALL_QUOTES";
				} else if (module === "Sales Order") {
					showValue = "ALL_ORDERS";
				}
			}

			const reportPayload = {
				reportName: reportName,
				description: reportDescription,
				module: module,
				folderId: selectedFolder ? parseInt(selectedFolder) : null,
				filters: JSON.stringify({
					show: showValue,
					createdDateFrom: startDate,
					createdDateTo: endDate,
				}),
				groups: JSON.stringify(selectedGroups),
				columns: JSON.stringify(selectedColumns),
				charts: JSON.stringify(charts),
			};

			let response;
			if (isEditMode && reportId) {
				response = await fetch(`${BASE_URL_ANM}/reports/${reportId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						"X-User-Id": "user123",
					},
					body: JSON.stringify(reportPayload),
				});
			} else {
				response = await fetch(`${BASE_URL_ANM}/reports`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-User-Id": "user123",
					},
					body: JSON.stringify(reportPayload),
				});
			}

			const result = await response.json();

			if (result.success) {
				console.log("Report saved successfully:", result.data);
				alert(
					isEditMode
						? "Report updated successfully!"
						: "Report saved successfully!"
				);

				if (isSaveAndRun) {
					executeReport();
				}

				setIsSaveReportModalOpen(false);
				setIsSaveAndRun(false);

				navigate("/analytics/reports");
			} else {
				alert("Failed to save report: " + result.message);
			}
		} catch (err) {
			console.error("Error saving report:", err);
			alert("Network error while saving report");
		}
	};

	const getCellData = (row, column) => {
		return row[column] || "N/A";
	};

	const getGroupData = (row, group) => {
		return row[group] || "N/A";
	};

	return (
		<div className="new-report-container">
			{/* Header */}
			<div className="new-report-header">
				<div className="header-left">
					<h1 className="report-title">Reports</h1>
					<div className="report-type">
						<span className="report-type-label">
							{isEditMode ? "Edit" : "New"} {module.toLowerCase()}{" "}
							Report
						</span>
						<span className="report-subtype">{module}</span>
					</div>
				</div>
				<div className="header-right">
					<button className="btn-secondary" onClick={handleSaveRun}>
						Save & Run
					</button>
					<button className="btn-secondary" onClick={handleSave}>
						Save
					</button>
					<button className="btn-secondary" onClick={handleClose}>
						Close
					</button>
					<button className="btn-primary" onClick={handleRun}>
						Run
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
							onClick={() => handleTabChange("outline")}
						>
							Outline
						</button>
						<button
							className={`tab-btn ${
								activeTab === "filter" ? "active" : ""
							}`}
							onClick={() => handleTabChange("filter")}
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
									<div className="section-subtitle">
										Group list
									</div>
									<div className="search-container">
										<input
											type="text"
											placeholder="All group"
											value={groupSearch}
											onChange={(e) =>
												setGroupSearch(e.target.value)
											}
											onFocus={() =>
												setShowGroupDropdown(true)
											}
											onBlur={() =>
												setTimeout(
													() =>
														setShowGroupDropdown(
															false
														),
													200
												)
											}
											className="search-input"
										/>
										<span className="search-icon">🔍</span>

										{showGroupDropdown && (
											<div className="group-dropdown">
												{availableGroups
													.filter((group) =>
														group
															.toLowerCase()
															.includes(
																groupSearch.toLowerCase()
															)
													)
													.map((group) => (
														<div
															key={group}
															className="group-dropdown-item"
															onClick={() =>
																handleGroupToggle(
																	group
																)
															}
														>
															{group}
														</div>
													))}
											</div>
										)}
									</div>

									{selectedGroups.length > 0 && (
										<div className="selected-groups">
											{selectedGroups.map((group) => (
												<div
													key={group}
													className="group-item-with-close"
												>
													<span>{group}</span>
													<button
														className="remove-btn"
														onClick={() =>
															handleGroupToggle(
																group
															)
														}
													>
														<X size={16} />
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Columns Section */}
								<div className="section">
									<h3 className="section-title">Columns</h3>
									<div className="search-container">
										<input
											type="text"
											placeholder="Add Columns"
											value={columnSearch}
											onChange={(e) =>
												setColumnSearch(e.target.value)
											}
											onFocus={() =>
												setShowColumnDropdown(true)
											}
											onBlur={() =>
												setTimeout(
													() =>
														setShowColumnDropdown(
															false
														),
													200
												)
											}
											className="search-input"
										/>
										<span className="search-icon">🔍</span>

										{showColumnDropdown && (
											<div className="column-dropdown">
												{availableColumns
													.filter(
														(column) =>
															column
																.toLowerCase()
																.includes(
																	columnSearch.toLowerCase()
																) &&
															!selectedColumns.includes(
																column
															)
													)
													.map((column) => (
														<div
															key={column}
															className="column-dropdown-item"
															onClick={() =>
																handleColumnAdd(
																	column
																)
															}
														>
															{column}
														</div>
													))}
											</div>
										)}
									</div>

									<div className="selected-columns">
										{selectedColumns.map(
											(column, index) => (
												<div
													key={index}
													className="column-tag"
												>
													<span>{column}</span>
													<button
														className="remove-btn"
														onClick={() =>
															handleColumnRemove(
																column
															)
														}
													>
														<X size={16} />
													</button>
												</div>
											)
										)}
									</div>
								</div>
							</div>
						)}

						{/* Filter Tab */}
						{activeTab === "filter" && (
							<div className="filter-tab">
								<div className="filter-header">Filter</div>

								<div className="filter-buttons">
									<button
										className="filter-btn"
										onClick={handleOpenModal}
									>
										<div className="filter-title">Show</div>
										<div className="filter-subtitle">
											{selectedFilter}
										</div>
									</button>

									<button
										className="filter-btn"
										onClick={handleOpenDateModal}
									>
										<div className="filter-title">
											Created Date
										</div>
										<div className="filter-subtitle">
											{selectedDateFilter}
										</div>
									</button>
								</div>
							</div>
						)}

						{/* Filter Modal */}
						{isModalOpen && (
							<div
								className="modal-overlay"
								role="dialog"
								aria-modal="true"
							>
								<div className="modal-content12345">
									<h2>Edit Filter</h2>
									<select
										className="modal-select"
										value={selectedFilter}
										onChange={(e) =>
											setSelectedFilter(e.target.value)
										}
									>
										{filterOptions.map((option, index) => (
											<option key={index} value={option}>
												{option}
											</option>
										))}
									</select>

									<div className="modal-actions">
										<button
											className="btn-primary"
											onClick={() =>
												handleFilterSelect(
													selectedFilter
												)
											}
										>
											Apply
										</button>
										<button
											className="btn-secondary"
											onClick={handleCloseModal}
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Date Filter Modal */}
						{isDateModalOpen && (
							<div className="modal-overlay">
								<div className="modal-content12345 wide">
									<h2>Filter by Create Date</h2>

									<div className="modal-row">
										<label>Date</label>
										<select
											className="modal-select"
											value={selectedDateField}
											onChange={(e) =>
												setSelectedDateField(
													e.target.value
												)
											}
										>
											<option value="Create Date">
												Create Date
											</option>
											<option value="Create Month">
												Create Month
											</option>
											<option value="Last Modified">
												Last Modified
											</option>
										</select>
									</div>

									<div className="modal-row">
										<label>Range</label>
										<select
											className="modal-select"
											value={selectedRange}
											onChange={(e) =>
												setSelectedRange(e.target.value)
											}
										>
											<option value="Today">Today</option>
											<option value="Yesterday">
												Yesterday
											</option>
											<option value="This Week">
												This Week
											</option>
											<option value="Last Week">
												Last Week
											</option>
											<option value="This Month">
												This Month
											</option>
											<option value="Last Month">
												Last Month
											</option>
											<option value="Custom">
												Custom
											</option>
										</select>
									</div>

									{selectedRange === "Custom" && (
										<>
											<div className="modal-row">
												<label>From</label>
												<input
													type="date"
													className="modal-input"
													value={startDate}
													onChange={(e) =>
														setStartDate(
															e.target.value
														)
													}
												/>
											</div>

											<div className="modal-row">
												<label>To</label>
												<input
													type="date"
													className="modal-input"
													value={endDate}
													onChange={(e) =>
														setEndDate(
															e.target.value
														)
													}
												/>
											</div>
										</>
									)}

									<div className="modal-actions">
										<button
											className="btn-primary"
											onClick={handleApplyDateFilter}
										>
											Apply
										</button>
										<button
											className="btn-secondary"
											onClick={handleCloseDateModal}
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right Panel - Data Table */}
				<div className="right-panel">
					{/* Add Chart Button */}
					<div className="chart-controls">
						<div className="chart-button-container">
							<button
								className="btn-add-chart"
								onClick={handleAddChart}
								disabled={selectedGroups.length === 0}
								title={
									selectedGroups.length === 0
										? "Please select at least one group to add charts"
										: "Add Chart"
								}
							>
								📊 Add Chart
							</button>
							{showChartDropdown && (
								<div className="chart-dropdown">
									<div
										className="chart-dropdown-item"
										onClick={() => handleChartSelect("Bar")}
									>
										📊 Bar Chart
									</div>
									<div
										className="chart-dropdown-item"
										onClick={() =>
											handleChartSelect("Line")
										}
									>
										📈 Line Chart
									</div>
									<div
										className="chart-dropdown-item"
										onClick={() => handleChartSelect("Pie")}
									>
										🥧 Pie Chart
									</div>
									<div
										className="chart-dropdown-item"
										onClick={() =>
											handleChartSelect("Donut")
										}
									>
										🍩 Donut Chart
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Charts Display */}
					{charts.length > 0 && (
						<div className="charts-container">
							{charts.map((chart) => (
								<div key={chart.id} className="chart-card">
									<div className="chart-card-header">
										<h3>
											{chart.type} Chart - {chart.xAxis}
										</h3>
										<button
											className="chart-remove-btn"
											onClick={() =>
												handleRemoveChart(chart.id)
											}
										>
											<X size={16} />
										</button>
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
								<p>Loading data...</p>
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
									onClick={executeReport}
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
												No data available. Try adjusting
												your filters.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						) : (
							<div className="no-columns-message">
								<p>
									No groups or columns selected. Please select
									groups or columns to display data.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Chart Configuration Modal */}
			{isChartConfigModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content12345">
						<h2>Configure {currentChartType} Chart</h2>

						<div className="modal-row">
							<label>X-Axis (Group By) *</label>
							<select
								className="modal-select"
								value={chartXAxis}
								onChange={(e) => setChartXAxis(e.target.value)}
							>
								<option value="">Select Group</option>
								{selectedGroups.map((group) => (
									<option key={group} value={group}>
										{group}
									</option>
								))}
							</select>
						</div>

						<div className="modal-row">
							<label>Y-Axis (Value)</label>
							<select
								className="modal-select"
								value={chartYAxis}
								onChange={(e) => setChartYAxis(e.target.value)}
							>
								<option value="">Count (default)</option>
								{selectedColumns.map((column) => (
									<option key={column} value={column}>
										{column}
									</option>
								))}
							</select>
						</div>

						{chartYAxis && (
							<div className="modal-row">
								<label>Aggregation</label>
								<select
									className="modal-select"
									value={chartAggregation}
									onChange={(e) =>
										setChartAggregation(e.target.value)
									}
								>
									<option value="count">Count</option>
									<option value="sum">Sum</option>
									<option value="average">Average</option>
									<option value="max">Maximum</option>
									<option value="min">Minimum</option>
								</select>
							</div>
						)}

						<div className="modal-actions">
							<button
								className="btn-primary"
								onClick={handleSaveChart}
								disabled={!chartXAxis}
							>
								Add Chart
							</button>
							<button
								className="btn-secondary"
								onClick={() => setIsChartConfigModalOpen(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Save Report Modal */}
			{isSaveReportModalOpen && (
				<div className="modal-overlay">
					<div className="modal-content12345 save-report-modal">
						<h2>{isEditMode ? "Update Report" : "Save Report"}</h2>

						<div className="modal-row">
							<label>Report Name *</label>
							<input
								type="text"
								className="modal-input"
								value={reportName}
								onChange={(e) => setReportName(e.target.value)}
								placeholder="Enter report name"
							/>
						</div>

						<div className="modal-row">
							<label>Description</label>
							<textarea
								className="modal-input"
								value={reportDescription}
								onChange={(e) =>
									setReportDescription(e.target.value)
								}
								placeholder="Enter report description"
								rows="3"
							/>
						</div>

						<div className="modal-row">
							<label>Folder</label>
							<select
								className="modal-select"
								value={selectedFolder}
								onChange={(e) =>
									setSelectedFolder(e.target.value)
								}
								disabled={foldersLoading}
							>
								<option value="">
									Select Folder (Optional)
								</option>
								{folders.map((folder) => (
									<option key={folder.id} value={folder.id}>
										{folder.name}
									</option>
								))}
							</select>
						</div>

						<div className="modal-actions">
							<button
								className="btn-primary"
								onClick={handleSaveReport}
								disabled={!reportName.trim()}
							>
								{isEditMode ? "Update" : "Save"}
							</button>
							<button
								className="btn-secondary"
								onClick={handleCloseSaveReportModal}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default NewReport;
