import { Navigate, useNavigate, useLocation } from "react-router-dom";
import "./ReportResults.css";


const ReportResults = ({ reportData, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const module = location.state?.module || "Lead";
    const columns = location.state?.columns || [];
    const groups = location.state?.groups || [];
    
    // Sample data for different modules
    const sampleReportData = {
        "Lead": [
            {
                slNo: 1,
                firstName: "John",
                lastName: "Doe",
                title: "Manager",
                companyAccount: "Tech Corp",
                email: "john.doe@techcorp.com",
                leadSources: "Website",
                rating: "Hot",
                leadOwner: "Sales Rep 1"
            },
            {
                slNo: 2,
                firstName: "Jane",
                lastName: "Smith",
                title: "Director",
                companyAccount: "Innovate Ltd",
                email: "jane.smith@innovate.com",
                leadSources: "Referral",
                rating: "Warm",
                leadOwner: "Sales Rep 2"
            },
            {
                slNo: 3,
                firstName: "Mike",
                lastName: "Johnson",
                title: "CEO",
                companyAccount: "StartUp Inc",
                email: "mike.johnson@startup.com",
                leadSources: "Cold Call",
                rating: "Cold",
                leadOwner: "Sales Rep 3"
            },
        ],
        "Account": [
            {
                slNo: 1,
                accountId: "ACC-001",
                accountName: "Tech Solutions Ltd",
                accountOwner: "Sarah Wilson",
                accountType: "Customer",
                industry: "Technology",
                createdBy: "Admin User",
                createdAt: "2024-09-15",
                parentAccount: "Global Tech Corp"
            },
            {
                slNo: 2,
                accountId: "ACC-002",
                accountName: "Innovate Systems",
                accountOwner: "John Smith",
                accountType: "Prospect",
                industry: "Software",
                createdBy: "Sales Manager",
                createdAt: "2024-09-20",
                parentAccount: "N/A"
            },
            {
                slNo: 3,
                accountId: "ACC-003",
                accountName: "Digital Ventures Inc",
                accountOwner: "Mike Davis",
                accountType: "Partner",
                industry: "Consulting",
                createdBy: "Admin User",
                createdAt: "2024-10-01",
                parentAccount: "Enterprise Holdings"
            },
        ]
    };

    const currentData = sampleReportData[module] || sampleReportData["Lead"];

    // Column headers configuration for each module
    const columnHeaders = {
        "Lead": [
            { key: "firstName", label: "First Name" },
            { key: "lastName", label: "Last Name" },
            { key: "title", label: "Title" },
            { key: "companyAccount", label: "Company / Account" },
            { key: "email", label: "Email" },
            { key: "leadSources", label: "Lead Sources" },
            { key: "rating", label: "Rating" },
            { key: "leadOwner", label: "Lead Owner" }
        ],
        "Account": [
            { key: "accountId", label: "Account Id" },
            { key: "accountName", label: "Account Name" },
            { key: "accountOwner", label: "Account Owner" },
            { key: "accountType", label: "Account Type" },
            { key: "industry", label: "Industry" },
            { key: "createdBy", label: "Created By" },
            { key: "createdAt", label: "Created At" },
            { key: "parentAccount", label: "Parent Account" }
        ]
    };

    const currentHeaders = columnHeaders[module] || columnHeaders["Lead"];


    const handleEdit = () => {
        console.log("Edit button clicked - Going back to report builder");
        navigate("/analytics/reports/new-report", { state: { module: module } });
    };


    const handleRefresh = () => {
        console.log("Refresh button clicked");
        // Add refresh logic here
    };


    const handleDelete = () => {
        console.log("Delete button clicked");
        const confirmDelete = window.confirm("Are you sure you want to delete this report?");
        if (confirmDelete) {
            console.log("Report deleted");
            // Add API call to delete report
        }
    };


    const handleExport = () => {
        console.log("Export button clicked");
        // Add export logic here (CSV, PDF, etc.)
    };


    const handleShowChart = () => {
        console.log("Show Chart button clicked");
        // Add chart display logic here
    };


    return (
        <div className="report-results-wrapper">
            {/* Top Header Bar */}
            <div className="top-header">
                {/* Record Inputs */}
                <div className="record-inputs">
                    <div className="input-box">
                        <label>Report Name</label>
                        <input type="text" value="Standard" readOnly />
                    </div>
                    <div className="input-box">
                        <label>Report type</label>
                        <input type="text" value={module} readOnly />
                    </div>
                    <div className="input-box">
                        <label>Total records</label>
                        <input type="text" value={`0${currentData.length}`} readOnly />
                    </div>
                </div>


                {/* Show Chart Button */}
                <button className="chart-button" onClick={handleShowChart}>
                    📊 Show Chart
                </button>


                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="btn-refresh" onClick={handleRefresh} title="Refresh">
                        🔄
                    </button>
                    <button className="btn-edit" onClick={handleEdit}>
                        Edit
                    </button>
                    <button className="btn-delete" onClick={handleDelete}>
                        Delete
                    </button>
                    <button className="btn-export" onClick={handleExport}>
                        Export
                    </button>
                </div>
            </div>


            {/* Data Table */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SL NO.</th>
                            {currentHeaders.map((header, index) => (
                                <th key={index}>{header.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.slNo}</td>
                                {currentHeaders.map((header, colIndex) => (
                                    <td key={colIndex}>{row[header.key]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export default ReportResults;
