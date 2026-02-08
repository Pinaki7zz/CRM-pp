import { useState, useEffect } from "react";
import "./NewDashboard.css";
import axios from "axios";
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

const BASE_URL_ANM = import.meta.env.VITE_API_BASE_URL_ANM;
const API_BASE_URL = `${BASE_URL_ANM}`;
const USER_ID = "user123";

const chartTypes = [
	{ id: "bar", label: "Bar Chart", icon: "📊" },
	{ id: "line", label: "Line Chart", icon: "📈" },
	{ id: "pie", label: "Pie Chart", icon: "🥧" },
	{ id: "donut", label: "Donut Chart", icon: "🍩" },
];

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

const NewDashboard = ({ dashboard, onSave, onCancel }) => {
	const [tiles, setTiles] = useState(
		Array.from({ length: 6 }, (_, i) => ({
			id: i + 1,
			reportId: null,
			folderId: null,
			widget: null,
			chartData: null, // Store chart data for display
		}))
	);

	// API data states
	const [reports, setReports] = useState([]);
	const [folders, setFolders] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [showPicker, setShowPicker] = useState(false);
	const [activeTileId, setActiveTileId] = useState(null);
	const [pickerTab, setPickerTab] = useState("reports");
	const [selectedReportId, setSelectedReportId] = useState(null);
	const [selectedFolderId, setSelectedFolderId] = useState(null);

	// Widget modal state
	const [showWidgetModal, setShowWidgetModal] = useState(false);
	const [widgetTileId, setWidgetTileId] = useState(null);
	const [widgetChartType, setWidgetChartType] = useState("bar");
	const [widgetYAxis, setWidgetYAxis] = useState("");
	const [widgetXAxis, setWidgetXAxis] = useState("");
	const [xRangeMode, setXRangeMode] = useState("automatic");
	const [xMin, setXMin] = useState("");
	const [xMax, setXMax] = useState("");

	// Report-specific states
	const [selectedReport, setSelectedReport] = useState(null);
	const [reportGroups, setReportGroups] = useState([]);
	const [reportColumns, setReportColumns] = useState([]);
	const [reportData, setReportData] = useState([]);
	const [chartPreviewData, setChartPreviewData] = useState([]);

	// Load reports and folders on mount
	useEffect(() => {
		loadReportsAndFolders();
	}, []);

	// Load existing dashboard if editing
	useEffect(() => {
		if (dashboard?.id) {
			loadExistingDashboard(dashboard.id);
		}
	}, [dashboard]);

	const loadReportsAndFolders = async () => {
		try {
			setLoading(true);

			const reportsResponse = await axios.get(`${API_BASE_URL}/reports`, {
				headers: { "X-User-Id": USER_ID },
			});

			const foldersResponse = await axios.get(`${API_BASE_URL}/folders`, {
				headers: { "X-User-Id": USER_ID },
			});

			if (reportsResponse.data.success) {
				setReports(reportsResponse.data.data || []);
			}
			if (foldersResponse.data.success) {
				setFolders(foldersResponse.data.data || []);
			}
		} catch (err) {
			console.error("Error loading data:", err);
			setError("Failed to load reports and folders");
		} finally {
			setLoading(false);
		}
	};

	const loadExistingDashboard = async (dashboardId) => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${API_BASE_URL}/dashboards/${dashboardId}`,
				{
					headers: { "X-User-Id": USER_ID },
				}
			);

			if (response.data.success && response.data.data.tiles) {
				const loadedTiles = response.data.data.tiles.map(
					(tile, index) => ({
						id: index + 1,
						reportId: tile.reportId,
						folderId: tile.folderId,
						widget: {
							chartType: tile.chartType,
							yAxis: tile.yAxis,
							xAxis: tile.xAxis,
							xRangeMode: tile.xRangeMode,
							xMin: tile.xMin,
							xMax: tile.xMax,
						},
						chartData: null,
					})
				);

				setTiles(loadedTiles);

				// Load chart data for each tile with a report
				for (let i = 0; i < loadedTiles.length; i++) {
					const tile = loadedTiles[i];
					if (tile.reportId && tile.widget) {
						await loadTileChartData(
							tile.id,
							tile.reportId,
							tile.widget
						);
					}
				}
			}
		} catch (err) {
			console.error("Error loading dashboard:", err);
			setError("Failed to load dashboard");
		} finally {
			setLoading(false);
		}
	};

	const loadTileChartData = async (tileId, reportId, widget) => {
		try {
			const reportResponse = await axios.get(
				`${API_BASE_URL}/reports/${reportId}`,
				{
					headers: { "X-User-Id": USER_ID },
				}
			);

			if (reportResponse.data.success) {
				const report = reportResponse.data.data;

				const filters = report.filters
					? JSON.parse(report.filters)
					: { show: "ALL" };
				const columns = JSON.parse(report.columns || "[]");
				const groups = JSON.parse(report.groups || "[]");

				const executionPayload = {
					module: report.module,
					columns: columns,
					groups: groups,
					filters: filters,
				};

				const executeResponse = await axios.post(
					`${API_BASE_URL}/reports/execute`,
					executionPayload,
					{
						headers: {
							"X-User-Id": USER_ID,
							"Content-Type": "application/json",
						},
					}
				);

				if (executeResponse.data.success) {
					const reportData = executeResponse.data.data?.rows || [];
					const chartData = prepareChartDataForTile(
						reportData,
						widget
					);

					setTiles((prev) =>
						prev.map((t) =>
							t.id === tileId ? { ...t, chartData: chartData } : t
						)
					);
				}
			}
		} catch (err) {
			console.error("Error loading tile chart data:", err);
		}
	};

	const prepareChartDataForTile = (reportData, widget) => {
		if (!reportData || reportData.length === 0) return [];

		const groupedData = {};

		reportData.forEach((row) => {
			const xValue = row[widget.xAxis] || "Unknown";

			if (!groupedData[xValue]) {
				groupedData[xValue] = {
					name: xValue,
					count: 0,
					values: [],
				};
			}

			groupedData[xValue].count += 1;

			if (
				widget.yAxis &&
				widget.yAxis !== "Count (default)" &&
				row[widget.yAxis]
			) {
				const numValue = parseFloat(row[widget.yAxis]);
				if (!isNaN(numValue)) {
					groupedData[xValue].values.push(numValue);
				}
			}
		});

		return Object.values(groupedData).map((item) => {
			let value = item.count;

			if (
				widget.yAxis &&
				widget.yAxis !== "Count (default)" &&
				item.values.length > 0
			) {
				value = item.values.reduce((a, b) => a + b, 0);
			}

			return {
				name: item.name,
				value: Math.round(value * 100) / 100,
			};
		});
	};

	const addTile = () => {
		setTiles((prev) => [
			...prev,
			{
				id: prev.length === 0 ? 1 : prev[prev.length - 1].id + 1,
				reportId: null,
				folderId: null,
				widget: null,
				chartData: null,
			},
		]);
	};

	const handleSave = async () => {
		try {
			setLoading(true);
			setError(null);

			const tilesData = tiles
				.filter((tile) => tile.reportId || tile.folderId)
				.map((tile, index) => ({
					reportId: tile.reportId,
					folderId: tile.folderId,
					chartType: tile.widget?.chartType || null,
					yAxis: tile.widget?.yAxis || null,
					xAxis: tile.widget?.xAxis || null,
					xRangeMode: tile.widget?.xRangeMode || "automatic",
					xMin: tile.widget?.xMin || null,
					xMax: tile.widget?.xMax || null,
					tileOrder: index,
				}));

			const dashboardData = {
				name: dashboard?.name || "New Dashboard",
				description: dashboard?.description || "",
				folderId: dashboard?.folderId || null,
				tiles: tilesData,
			};

			let response;
			if (dashboard?.id) {
				response = await axios.put(
					`${API_BASE_URL}/dashboards/${dashboard.id}`,
					dashboardData,
					{
						headers: {
							"X-User-Id": USER_ID,
							"Content-Type": "application/json",
						},
					}
				);
			} else {
				response = await axios.post(
					`${API_BASE_URL}/dashboards`,
					dashboardData,
					{
						headers: {
							"X-User-Id": USER_ID,
							"Content-Type": "application/json",
						},
					}
				);
			}

			if (response.data.success) {
				alert(response.data.message);
				onSave?.(response.data.data);
			} else {
				setError(response.data.message || "Failed to save dashboard");
			}
		} catch (err) {
			console.error("Error saving dashboard:", err);
			setError(err.response?.data?.message || "Failed to save dashboard");
		} finally {
			setLoading(false);
		}
	};

	const openPicker = (tileId) => {
		setActiveTileId(tileId);
		setShowPicker(true);
		setPickerTab("reports");
		setSelectedReportId(null);
		setSelectedFolderId(null);
	};

	const closePicker = () => {
		setShowPicker(false);
		setActiveTileId(null);
		setSelectedReportId(null);
		setSelectedFolderId(null);
	};

	const confirmSelection = () => {
		if (!activeTileId) {
			closePicker();
			return;
		}

		const updatedTiles = tiles.map((t) =>
			t.id === activeTileId
				? {
						...t,
						reportId:
							pickerTab === "reports" ? selectedReportId : null,
						folderId:
							pickerTab === "folders" ? selectedFolderId : null,
				  }
				: t
		);

		setTiles(updatedTiles);
		closePicker();

		if (pickerTab === "reports" && selectedReportId) {
			openWidgetModal(activeTileId, selectedReportId);
		}
	};

	const openWidgetModal = async (tileId, reportId = null) => {
		const tile = tiles.find((t) => t.id === tileId);
		const existing = tile?.widget;

		setWidgetTileId(tileId);
		setWidgetChartType(existing?.chartType || "bar");
		setWidgetYAxis(existing?.yAxis || "");
		setWidgetXAxis(existing?.xAxis || "");
		setXRangeMode(existing?.xRangeMode || "automatic");
		setXMin(existing?.xMin || "");
		setXMax(existing?.xMax || "");

		// Load report details
		const currentReportId = reportId || tile?.reportId;
		if (currentReportId) {
			await loadReportDetails(currentReportId);
		}

		setShowWidgetModal(true);
	};

	const loadReportDetails = async (reportId) => {
		try {
			setLoading(true);

			// Fetch report metadata
			const response = await axios.get(
				`${API_BASE_URL}/reports/${reportId}`,
				{
					headers: { "X-User-Id": USER_ID },
				}
			);

			if (response.data.success) {
				const report = response.data.data;
				setSelectedReport(report);

				// Parse groups and columns
				const groups = report.groups ? JSON.parse(report.groups) : [];
				const columns = report.columns
					? JSON.parse(report.columns)
					: [];

				setReportGroups(groups);
				setReportColumns(columns);

				// Set default X and Y axis
				if (!widgetXAxis && groups.length > 0) {
					setWidgetXAxis(groups[0]);
				}
				if (!widgetYAxis) {
					setWidgetYAxis("Count (default)");
				}

				// Execute report to get data
				await executeReportForPreview(report);
			}
		} catch (err) {
			console.error("Error loading report details:", err);
			setError("Failed to load report details");
		} finally {
			setLoading(false);
		}
	};

	const executeReportForPreview = async (report) => {
		try {
			const filters = report.filters
				? JSON.parse(report.filters)
				: { show: "ALL" };
			const columns = JSON.parse(report.columns || "[]");
			const groups = JSON.parse(report.groups || "[]");

			const executionPayload = {
				module: report.module,
				columns: columns,
				groups: groups,
				filters: filters,
			};

			const response = await axios.post(
				`${API_BASE_URL}/reports/execute`,
				executionPayload,
				{
					headers: {
						"X-User-Id": USER_ID,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.success) {
				setReportData(response.data.data?.rows || []);
			}
		} catch (err) {
			console.error("Error executing report:", err);
		}
	};

	// Update chart preview when X/Y axis changes
	useEffect(() => {
		if (reportData.length > 0 && widgetXAxis) {
			const chartData = prepareChartData();
			setChartPreviewData(chartData);
		}
	}, [widgetXAxis, widgetYAxis, reportData, widgetChartType]);

	const prepareChartData = () => {
		if (!reportData || reportData.length === 0) return [];

		const groupedData = {};

		reportData.forEach((row) => {
			const xValue = row[widgetXAxis] || "Unknown";

			if (!groupedData[xValue]) {
				groupedData[xValue] = {
					name: xValue,
					count: 0,
					values: [],
				};
			}

			groupedData[xValue].count += 1;

			if (
				widgetYAxis &&
				widgetYAxis !== "Count (default)" &&
				row[widgetYAxis]
			) {
				const numValue = parseFloat(row[widgetYAxis]);
				if (!isNaN(numValue)) {
					groupedData[xValue].values.push(numValue);
				}
			}
		});

		return Object.values(groupedData).map((item) => {
			let value = item.count;

			if (
				widgetYAxis &&
				widgetYAxis !== "Count (default)" &&
				item.values.length > 0
			) {
				value = item.values.reduce((a, b) => a + b, 0);
			}

			return {
				name: item.name,
				value: Math.round(value * 100) / 100,
			};
		});
	};

	const renderChart = (chartData, widget, size = "large") => {
		if (!chartData || chartData.length === 0) {
			return (
				<div className="nd-chart-empty">
					<span>No data</span>
				</div>
			);
		}

		const height = size === "large" ? 250 : 180;

		// Apply custom X-axis range if set
		const xAxisProps = {};
		if (widget?.xRangeMode === "custom") {
			if (widget.xMin)
				xAxisProps.domain = [parseFloat(widget.xMin), "auto"];
			if (widget.xMax)
				xAxisProps.domain = xAxisProps.domain
					? [xAxisProps.domain[0], parseFloat(widget.xMax)]
					: ["auto", parseFloat(widget.xMax)];
		}

		const yAxisProps = {};
		if (widget?.xRangeMode === "custom") {
			if (widget.xMin)
				yAxisProps.domain = [parseFloat(widget.xMin), "auto"];
			if (widget.xMax)
				yAxisProps.domain = yAxisProps.domain
					? [yAxisProps.domain[0], parseFloat(widget.xMax)]
					: ["auto", parseFloat(widget.xMax)];
		}

		switch (widget?.chartType || "bar") {
			case "bar":
				return (
					<ResponsiveContainer width="100%" height={height}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" {...xAxisProps} />
							<YAxis {...yAxisProps} />
							<Tooltip />
							{size === "large" && <Legend />}
							<Bar dataKey="value" fill="#4a90e2" />
						</BarChart>
					</ResponsiveContainer>
				);

			case "line":
				return (
					<ResponsiveContainer width="100%" height={height}>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" {...xAxisProps} />
							<YAxis {...yAxisProps} />
							<Tooltip />
							{size === "large" && <Legend />}
							<Line
								type="monotone"
								dataKey="value"
								stroke="#4a90e2"
							/>
						</LineChart>
					</ResponsiveContainer>
				);

			case "pie":
			case "donut":
				return (
					<ResponsiveContainer width="100%" height={height}>
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								labelLine={false}
								label={
									size === "large"
										? (entry) =>
												`${entry.name}: ${entry.value}`
										: false
								}
								outerRadius={size === "large" ? 80 : 60}
								innerRadius={
									widget?.chartType === "donut"
										? size === "large"
											? 40
											: 30
										: 0
								}
								fill="#8884d8"
								dataKey="value"
							>
								{chartData.map((entry, index) => (
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
				return (
					<div className="nd-chart-empty">
						<span>No chart</span>
					</div>
				);
		}
	};

	const renderChartPreview = () => {
		if (chartPreviewData.length === 0) {
			return (
				<div className="nd-widget-preview-box">
					<span>No data available</span>
				</div>
			);
		}

		const widget = {
			chartType: widgetChartType,
			xRangeMode: xRangeMode,
			xMin: xMin,
			xMax: xMax,
		};

		return renderChart(chartPreviewData, widget, "large");
	};

	const closeWidgetModal = () => {
		setShowWidgetModal(false);
		setWidgetTileId(null);
		setXMin("");
		setXMax("");
		setSelectedReport(null);
		setReportGroups([]);
		setReportColumns([]);
		setReportData([]);
		setChartPreviewData([]);
	};

	const saveWidget = () => {
		if (!widgetTileId) {
			closeWidgetModal();
			return;
		}

		const widgetConfig = {
			chartType: widgetChartType,
			yAxis: widgetYAxis,
			xAxis: widgetXAxis,
			xRangeMode,
			xMin,
			xMax,
		};

		// Save chart data with the tile
		setTiles((prev) =>
			prev.map((t) =>
				t.id === widgetTileId
					? {
							...t,
							widget: widgetConfig,
							chartData: chartPreviewData,
					  }
					: t
			)
		);

		closeWidgetModal();
	};

	const getTileLabel = (tile) => {
		if (tile.reportId) {
			const r = reports.find((x) => x.id === tile.reportId);
			return r ? r.reportName : "Report";
		}
		if (tile.folderId) {
			const f = folders.find((x) => x.id === tile.folderId);
			return f ? f.name : "Folder";
		}
		return "+";
	};

	const isSelectDisabled =
		pickerTab === "reports"
			? selectedReportId === null
			: selectedFolderId === null;

	const getSelectedReportName = () => {
		if (pickerTab === "reports" && selectedReportId) {
			return (
				reports.find((r) => r.id === selectedReportId)?.reportName || ""
			);
		}
		const tile = tiles.find((t) => t.id === widgetTileId);
		if (tile?.reportId) {
			return (
				reports.find((r) => r.id === tile.reportId)?.reportName || ""
			);
		}
		return "";
	};

	return (
		<div className="nd-wrapper">
			<div className="nd-header">
				<div className="nd-title">
					{dashboard?.name || "New Dashboard"}
				</div>
				<div className="nd-subtitle">
					Configure tiles for this dashboard.
				</div>
			</div>

			{error && <div className="nd-error">{error}</div>}

			{loading && <div className="nd-loading">Loading...</div>}

			<div className="nd-body">
				<div className="nd-tiles-grid">
					{tiles.map((tile) => (
						<div
							key={tile.id}
							className={`nd-tile ${
								tile.widget && tile.chartData
									? "nd-tile-with-chart"
									: ""
							}`}
							onClick={() =>
								tile.reportId
									? openWidgetModal(tile.id)
									: openPicker(tile.id)
							}
						>
							<button
								type="button"
								className="nd-tile-close"
								onClick={(e) => {
									e.stopPropagation();
									setTiles((prev) =>
										prev.map((t) =>
											t.id === tile.id
												? {
														...t,
														reportId: null,
														folderId: null,
														widget: null,
														chartData: null,
												  }
												: t
										)
									);
								}}
							>
								×
							</button>

							{tile.widget && tile.chartData ? (
								<div className="nd-tile-chart-container">
									<div className="nd-tile-chart-title">
										{getTileLabel(tile)}
									</div>
									{renderChart(
										tile.chartData,
										tile.widget,
										"small"
									)}
								</div>
							) : (
								<span className="nd-tile-plus">
									{getTileLabel(tile)}
								</span>
							)}
						</div>
					))}

					<button
						type="button"
						className="nd-add-tile-btn"
						onClick={addTile}
					>
						+ Add Tile
					</button>
				</div>
			</div>

			<div className="nd-footer">
				<button className="nd-btn-secondary" onClick={onCancel}>
					Cancel
				</button>
				<button
					className="nd-btn-primary"
					onClick={handleSave}
					disabled={loading}
				>
					{loading ? "Saving..." : "Save & Close"}
				</button>
			</div>

			{/* Picker modal */}
			{showPicker && (
				<div className="nd-picker-overlay" onClick={closePicker}>
					<div
						className="nd-picker-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="nd-picker-header">
							<h3>Select Report / Folder</h3>
						</div>

						<div className="nd-picker-body">
							<div className="nd-picker-left nd-picker-left-full">
								<div className="nd-picker-tabs">
									<button
										className={
											"nd-picker-tab " +
											(pickerTab === "reports"
												? "nd-picker-tab-active"
												: "")
										}
										onClick={() => {
											setPickerTab("reports");
											setSelectedReportId(null);
										}}
									>
										Reports
									</button>
									<button
										className={
											"nd-picker-tab " +
											(pickerTab === "folders"
												? "nd-picker-tab-active"
												: "")
										}
										onClick={() => {
											setPickerTab("folders");
											setSelectedFolderId(null);
										}}
									>
										Folders
									</button>
								</div>

								<div className="nd-picker-list">
									{pickerTab === "reports"
										? reports.map((r) => (
												<button
													key={r.id}
													className={
														"nd-picker-item " +
														(selectedReportId ===
														r.id
															? "nd-picker-item-selected"
															: "")
													}
													onClick={() =>
														setSelectedReportId(
															r.id
														)
													}
												>
													<div className="nd-picker-item-name">
														{r.reportName}
													</div>
													<div className="nd-picker-item-folder">
														{r.folderName ||
															"No folder"}
													</div>
												</button>
										  ))
										: folders.map((f) => (
												<button
													key={f.id}
													className={
														"nd-picker-item " +
														(selectedFolderId ===
														f.id
															? "nd-picker-item-selected"
															: "")
													}
													onClick={() =>
														setSelectedFolderId(
															f.id
														)
													}
												>
													<div className="nd-picker-item-name">
														{f.name}
													</div>
												</button>
										  ))}
								</div>
							</div>
						</div>

						<div className="nd-picker-footer">
							<button
								className="nd-btn-secondary"
								onClick={closePicker}
							>
								Close
							</button>
							<button
								className="nd-btn-primary"
								onClick={confirmSelection}
								disabled={isSelectDisabled}
							>
								Select
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Widget configuration modal */}
			{showWidgetModal && (
				<div className="nd-widget-overlay" onClick={closeWidgetModal}>
					<div
						className="nd-widget-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="nd-widget-header">
							<h3>Widget</h3>
						</div>

						<div className="nd-widget-body">
							<div className="nd-widget-left">
								<div className="nd-widget-field">
									<label>Report</label>
									<input
										type="text"
										value={getSelectedReportName()}
										readOnly
									/>
								</div>

								<div className="nd-widget-field">
									<label>Display chart as</label>
									<div className="nd-chart-type-row">
										{chartTypes.map((type) => (
											<button
												key={type.id}
												type="button"
												className={
													"nd-chart-type-btn " +
													(widgetChartType === type.id
														? "nd-chart-type-btn-active"
														: "")
												}
												onClick={() =>
													setWidgetChartType(type.id)
												}
											>
												<span className="nd-chart-icon">
													{type.icon}
												</span>
												<span>{type.label}</span>
											</button>
										))}
									</div>
								</div>

								<div className="nd-widget-field">
									<label>X-axis (Group By)</label>
									<select
										value={widgetXAxis}
										onChange={(e) =>
											setWidgetXAxis(e.target.value)
										}
										className="nd-widget-select"
									>
										<option value="">Select X-axis</option>
										{reportGroups.map((group, index) => (
											<option key={index} value={group}>
												{group}
											</option>
										))}
									</select>
								</div>

								<div className="nd-widget-field">
									<label>Y-axis (Value)</label>
									<select
										value={widgetYAxis}
										onChange={(e) =>
											setWidgetYAxis(e.target.value)
										}
										className="nd-widget-select"
									>
										<option value="Count (default)">
											Count (default)
										</option>
										{reportColumns.map((column, index) => (
											<option key={index} value={column}>
												{column}
											</option>
										))}
									</select>
								</div>

								<div className="nd-widget-field">
									<label>X-axis Ranges</label>
									<div className="nd-xrange-options">
										<label>
											<input
												type="radio"
												name="xrange"
												value="automatic"
												checked={
													xRangeMode === "automatic"
												}
												onChange={(e) =>
													setXRangeMode(
														e.target.value
													)
												}
											/>
											Automatic
										</label>
										<label>
											<input
												type="radio"
												name="xrange"
												value="custom"
												checked={
													xRangeMode === "custom"
												}
												onChange={(e) =>
													setXRangeMode(
														e.target.value
													)
												}
											/>
											Custom
										</label>
									</div>

									{xRangeMode === "custom" && (
										<div className="nd-xrange-custom">
											<div className="nd-xrange-input">
												<span>Min</span>
												<input
													type="number"
													value={xMin}
													onChange={(e) =>
														setXMin(e.target.value)
													}
													placeholder="0"
												/>
											</div>
											<div className="nd-xrange-input">
												<span>Max</span>
												<input
													type="number"
													value={xMax}
													onChange={(e) =>
														setXMax(e.target.value)
													}
													placeholder="100"
												/>
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="nd-widget-right">
								<div className="nd-widget-preview-title">
									Preview
								</div>
								<div className="nd-widget-preview-container">
									{renderChartPreview()}
								</div>
							</div>
						</div>

						<div className="nd-widget-footer">
							<button
								className="nd-btn-secondary"
								onClick={closeWidgetModal}
							>
								Cancel
							</button>
							<button
								className="nd-btn-primary"
								onClick={saveWidget}
							>
								Add
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default NewDashboard;
