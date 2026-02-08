// import React, { useState } from "react";
// import { Plus, RefreshCcw, Filter, Search, User, ChevronDown } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import "./Workflow.css";

// const Workflow = () => {
//     const [selectedRows, setSelectedRows] = useState([]);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//     const [showcontactDropdown, setShowcontactDropdown] = useState(false);
//     const [showFilters, setShowFilters] = useState(false);
//     const [showActionsModal, setShowActionsModal] = useState(false);
//     const navigate = useNavigate();

//     const transformedData = [
//         {
//             id: 1,
//             description: "Rick",
//             businessObject: "New",
//             type: "2025-03-27T12:00:00.000Z",
//             status: "active",
//             createdBy: "",
//             createdOn: "Company A",
//         },
//         {
//             id: 2,
//             description: "contact 2",
//             businessObject: "Open",
//             type: "2025-03-27T12:00:00.000Z",
//             status: "active",
//             createdBy: "",
//             createdOn: "Company B",
//         },
//         {
//             id: 3,
//             description: "contact 3",
//             businessObject: "Converted",
//             type: "2025-03-27T12:00:00.000Z",
//             status: "active",
//             createdBy: "",
//             createdOn: "Company C",
//         },
//     ];

//     const handleClick = () => {
//         console.log("Hi");
//     };

//     const toggleRowSelection = (id) => {
//         if (selectedRows.includes(id)) {
//             setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
//         } else {
//             setSelectedRows([...selectedRows, id]);
//         }
//     };

//     const handleDeleteConfirm = () => {
//         // Handle delete logic
//         setShowDeleteConfirm(false);
//         setSelectedRows([]);
//     };

//     const toggleContactsDropdown = () => {
//         setShowcontactDropdown(!showcontactDropdown);
//     };

//     const toggleFilters = () => {
//         setShowFilters(!showFilters);
//     };

//     return (
//         <div className="sales-quotes-management-container">
//             <div className="sales-quotes-section">
//                 {/* Product Stats */}
//                 <div className="sales-quotes-stats">
//                     <div className="stat-item">
//                         <div className="stat-label">TOTAL WORKFLOWS</div>
//                         <div className="stat-value">632</div>
//                     </div>
//                 </div>

//                 {/* Search and Actions */}
//                 <div className="sales-quotes-actions">
//                     <div className="sales-quotes-actions-left">
//                         <div className="search-container">
//                             <input
//                                 type="text"
//                                 placeholder="Search ..."
//                                 className="search-input"
//                             />
//                             <Search
//                                 className="search-icon-small"
//                                 size={20}
//                                 color="#64748b"
//                                 strokeWidth={1}
//                             />
//                         </div>
//                         <div className="sales-quotes-dropdown-container">
//                             {/* <button
// 								className="sales-quotes-dropdown-button"
// 								onClick={toggleContactsDropdown}
// 							>
// 								<User size={20} color="#64748b" strokeWidth={2} />
// 								<span>All ORG</span>
// 								<ChevronDown size={20} color="#64748b" strokeWidth={2} />
// 							</button> */}
//                             {/* {showcontactDropdown && (
// 								<div className="sales-quotes-dropdown-menu">
// 									{contactCategories.map((category) => (
// 										<div
// 											key={category.id}
// 											className="sales-quotes-dropdown-item"
// 										>
// 											<span className="icon-category"></span>
// 											<span>{category.name}</span>
// 											{category.count && (
// 												<span className="count">{category.count}</span>
// 											)}
// 										</div>
// 									))}
// 								</div>
// 							)} */}
//                             <select
//                                 name=""
//                                 id=""
//                                 className="sales-quotes-dropdown-button"
//                             >
//                                 <option value="">Active</option>
//                             </select>
//                         </div>
//                     </div>
//                     <div className="action-icons">
//                         <button className="modern-button add-button">
//                             <Plus size={20} color="#fff" strokeWidth={2} />
//                             <span
//                                 onClick={() =>
//                                     navigate("/admin/workflows/create")
//                                 }
//                             >
//                                 Add Workflow
//                             </span>
//                         </button>
//                         <button className="icon-button-modern refresh-button">
//                             <RefreshCcw
//                                 size={20}
//                                 color="#64748b"
//                                 strokeWidth={2}
//                             />
//                         </button>
//                         <button
//                             className="icon-button-modern filter-button"
//                             onClick={toggleFilters}
//                         >
//                             <Filter size={20} color="#64748b" strokeWidth={2} />
//                         </button>
//                         <div className="action-button-container">
//                             {/* <button
// 								className="modern-button action-button"
// 								onClick={() => setShowActionsModal((prev) => !prev)}
// 							>
// 								Actions
// 								<ChevronDown size={20} color="#64748b" strokeWidth={2} />
// 							</button> */}
//                             {/* Actions Modal */}
//                             {/* {showActionsModal && (
// 								<div className="actions-modal-container">
// 									<div className="actions-modal">
// 										<ul className="actions-modal-list">
// 											<li>Export</li>
// 											<li>View All</li>
// 											<li>Delete</li>
// 										</ul>
// 										<select name="" id="">
// 											<option value="">Export</option>
// 											<option value="">View All</option>
// 											<option value="">Delete</option>
// 										</select>
// 									</div>
// 								</div>
// 							)} */}
//                             <select
//                                 name=""
//                                 id=""
//                                 className="modern-button action-button"
//                             >
//                                 <option value="">Actions</option>
//                                 <option value="">Mass Mail</option>
//                                 <option value="">Mass Delete</option>
//                                 <option value="">Export</option>
//                                 <option value="">Mass Update</option>
//                                 <option value="">Print View</option>
//                             </select>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Filters Section */}
//                 {showFilters && (
//                     <div className="filters-container">
//                         <div className="filters-header">
//                             <h3>Filter Sales Quotes</h3>
//                             <button
//                                 className="close-filters"
//                                 onClick={toggleFilters}
//                             >
//                                 ×
//                             </button>
//                         </div>
//                         <div className="filter-row">
//                             <div className="filter-col">
//                                 <label>Owner</label>
//                                 <select className="filter-select">
//                                     <option>Select Status</option>
//                                 </select>
//                             </div>
//                             <div className="filter-col">
//                                 <label>Manager</label>
//                                 <select className="filter-select">
//                                     <option>Select</option>
//                                 </select>
//                             </div>
//                             <div className="filter-col">
//                                 <label>location</label>
//                                 <select className="filter-select">
//                                     <option>Select</option>
//                                 </select>
//                             </div>
//                             <div className="filter-col">
//                                 <label>Owner</label>
//                                 <select className="filter-select">
//                                     <option>Select</option>
//                                 </select>
//                             </div>
//                             <div className="filter-col">
//                                 <label>Parent Unit Name</label>
//                                 <select className="filter-select">
//                                     <option>Select</option>
//                                 </select>
//                             </div>
//                         </div>
//                         <div className="filter-actions">
//                             <div className="filter-buttons">
//                                 <button className="reset-button">Reset</button>
//                                 <button className="apply-button">Apply</button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* Sales Quotes Table */}
//                 <div className="sales-quotes-table-container">
//                     <table className="contact-table">
//                         <thead>
//                             <tr>
//                                 <th className="checkbox-column">
//                                     <input
//                                         type="checkbox"
//                                         className="custom-checkbox"
//                                     />
//                                 </th>
//                                 <th>
//                                     Description{" "}
//                                     <span className="sort-icon">↓</span>
//                                 </th>
//                                 <th>
//                                     Business Object
//                                     <span className="sort-icon">↓</span>
//                                 </th>
//                                 <th>
//                                     Type<span className="sort-icon">↓</span>
//                                 </th>
//                                 <th>
//                                     Status<span className="sort-icon">↓</span>
//                                 </th>
//                                 <th>
//                                     Created By{" "}
//                                     <span className="sort-icon">↓</span>
//                                 </th>
//                                 <th>
//                                     Created On{" "}
//                                     <span className="sort-icon">↓</span>
//                                 </th>

//                                 <th>
//                                     Action <span className="sort-icon">↓</span>
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {transformedData.map((contact) => (
//                                 <tr
//                                     key={contact.id}
//                                     className={
//                                         selectedRows.includes(contact.id)
//                                             ? "selected-row"
//                                             : ""
//                                     }
//                                 >
//                                     <td className="checkbox-column">
//                                         <input
//                                             type="checkbox"
//                                             className="custom-checkbox"
//                                             checked={selectedRows.includes(
//                                                 contact.id
//                                             )}
//                                             onChange={() =>
//                                                 toggleRowSelection(contact.id)
//                                             }
//                                         />
//                                     </td>
//                                     <td>{contact.description}</td>
//                                     <td>{contact.businessObject}</td>
//                                     <td>{contact.type}</td>
//                                     <td>{contact.status}</td>
//                                     <td>{contact.createdBy}</td>
//                                     <td>{contact.createdOn}</td>

//                                     <td>
//                                         <div className="action-buttons">
//                                             <button
//                                                 className="display-btn"
//                                                 onClick={() =>
//                                                     navigate(
//                                                         "/activitymanagement/meetings/display"
//                                                     )
//                                                 }
//                                             >
//                                                 Display
//                                             </button>
//                                             <button
//                                                 className="delete-btn"
//                                                 onClick={setShowDeleteConfirm}
//                                             >
//                                                 Delete
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Pagination */}
//                 <div className="pagination">
//                     <button className="pagination-button">Previous</button>
//                     <div className="page-numbers">
//                         <button className="page-number active">1</button>
//                         <button className="page-number">2</button>
//                         <button className="page-number">3</button>
//                     </div>
//                     <button className="pagination-button">Next</button>
//                 </div>

//                 {/* Delete Confirmation Dialog */}
//                 {showDeleteConfirm && (
//                     <div className="delete-confirm-overlay">
//                         <div className="delete-confirm-dialog">
//                             <div className="dialog-header">
//                                 <h3>Confirm Delete</h3>
//                                 <p>
//                                     Are you sure you want to delete this quote?
//                                 </p>
//                             </div>
//                             <div className="dialog-buttons">
//                                 <button
//                                     className="confirm-cancel-button"
//                                     onClick={() => setShowDeleteConfirm(false)}
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     className="confirm-delete-button"
//                                     onClick={handleDeleteConfirm}
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Workflow;


import React, { useState, useEffect } from "react";
import { Plus, RefreshCcw, Filter, Search, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Workflow.css";

const Workflow = () => {
    const [workflows, setWorkflows] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("Active");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const pageSize = 10; // Adjust as needed

    // Fetch workflows from backend
    const fetchWorkflows = async (page = 1, query = "", status = "Active") => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("http://localhost:1234/api/workflows", {
                params: {
                    page: page - 1, // Spring Boot uses 0-based indexing
                    size: pageSize,
                    search: query,
                    status: status.toLowerCase(),
                },
            });
            setWorkflows(response.data.content || response.data); // Adjust based on whether pagination is implemented
            setTotalPages(response.data.totalPages || 1);
        } catch (err) {
            setError("Failed to fetch workflows: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and refresh
    useEffect(() => {
        fetchWorkflows(currentPage, searchQuery, statusFilter);
    }, [currentPage, searchQuery, statusFilter]);

    // Handle row selection
    const toggleRowSelection = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    // Handle delete
    const handleDeleteConfirm = async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all(
                selectedRows.map((id) =>
                    axios.delete(`http://localhost:1234/api/workflows/${id}`)
                )
            );
            setSelectedRows([]);
            fetchWorkflows(currentPage, searchQuery, statusFilter); // Refresh list
        } catch (err) {
            setError("Failed to delete workflows: " + err.message);
        } finally {
            setShowDeleteConfirm(false);
            setLoading(false);
        }
    };

    // Handle search input
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Handle status filter change
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    // Handle pagination
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Toggle filters
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <div className="sales-quotes-management-container">
            <div className="sales-quotes-section">
                {/* Stats */}
                <div className="sales-quotes-stats">
                    <div className="stat-item">
                        <div className="stat-label">TOTAL WORKFLOWS</div>
                        <div className="stat-value">{workflows.length}</div>
                    </div>
                </div>

                {/* Search and Actions */}
                <div className="sales-quotes-actions">
                    <div className="sales-quotes-actions-left">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search ..."
                                className="search-input"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <Search className="search-icon-small" size={20} color="#64748b" strokeWidth={1} />
                        </div>
                        <select
                            className="sales-quotes-dropdown-button"
                            value={statusFilter}
                            onChange={handleStatusChange}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="action-icons">
                        <button
                            className="modern-button add-button"
                            onClick={() => navigate("/admin/workflows/create")}
                        >
                            <Plus size={20} color="#fff" strokeWidth={2} />
                            <span>Add Workflow</span>
                        </button>
                        <button
                            className="icon-button-modern refresh-button"
                            onClick={() => fetchWorkflows(currentPage, searchQuery, statusFilter)}
                        >
                            <RefreshCcw size={20} color="#64748b" strokeWidth={2} />
                        </button>
                        <button
                            className="icon-button-modern filter-button"
                            onClick={toggleFilters}
                        >
                            <Filter size={20} color="#64748b" strokeWidth={2} />
                        </button>
                        <select className="modern-button action-button">
                            <option value="">Actions</option>
                            <option value="Mass Delete" onClick={() => setShowDeleteConfirm(true)}>
                                Mass Delete
                            </option>
                            <option value="Export">Export</option>
                        </select>
                    </div>
                </div>

                {/* Filters Section (Placeholder) */}
                {showFilters && (
                    <div className="filters-container">
                        <div className="filters-header">
                            <h3>Filter Workflows</h3>
                            <button className="close-filters" onClick={toggleFilters}>
                                ×
                            </button>
                        </div>
                        <div className="filter-row">
                            <div className="filter-col">
                                <label>Status</label>
                                <select
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={handleStatusChange}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="reset-button" onClick={() => setStatusFilter("Active")}>
                                Reset
                            </button>
                            <button className="apply-button" onClick={toggleFilters}>
                                Apply
                            </button>
                        </div>
                    </div>
                )}

                {/* Workflows Table */}
                <div className="sales-quotes-table-container">
                    {loading && <p>Loading...</p>}
                    {error && <p className="error">{error}</p>}
                    <table className="contact-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        className="custom-checkbox"
                                        checked={selectedRows.length === workflows.length && workflows.length > 0}
                                        onChange={() =>
                                            setSelectedRows(
                                                selectedRows.length === workflows.length
                                                    ? []
                                                    : workflows.map((w) => w.id)
                                            )
                                        }
                                    />
                                </th>
                                <th>Description <span className="sort-icon">↓</span></th>
                                <th>Business Object <span className="sort-icon">↓</span></th>
                                <th>Timing <span className="sort-icon">↓</span></th>
                                <th>Status <span className="sort-icon">↓</span></th>
                                <th>Created By <span className="sort-icon">↓</span></th>
                                <th>Created On <span className="sort-icon">↓</span></th>
                                <th>Action <span className="sort-icon">↓</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {workflows.map((workflow) => (
                                <tr
                                    key={workflow.id}
                                    className={selectedRows.includes(workflow.id) ? "selected-row" : ""}
                                >
                                    <td className="checkbox-column">
                                        <input
                                            type="checkbox"
                                            className="custom-checkbox"
                                            checked={selectedRows.includes(workflow.id)}
                                            onChange={() => toggleRowSelection(workflow.id)}
                                        />
                                    </td>
                                    <td>{workflow.description}</td>
                                    <td>{workflow.businessObject}</td>
                                    <td>{workflow.timing}</td>
                                    <td>{workflow.status || "Active"}</td>
                                    <td>{workflow.createdBy || "Unknown"}</td>
                                    <td>{new Date(workflow.createdOn || Date.now()).toLocaleDateString()}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="display-btn"
                                                onClick={() => navigate(`edit/${workflow.id}`)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => {
                                                    setSelectedRows([workflow.id]);
                                                    setShowDeleteConfirm(true);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        className="pagination-button"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        Previous
                    </button>
                    <div className="page-numbers">
                        {[...Array(totalPages).keys()].map((page) => (
                            <button
                                key={page + 1}
                                className={`page-number ${currentPage === page + 1 ? "active" : ""}`}
                                onClick={() => handlePageChange(page + 1)}
                            >
                                {page + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        className="pagination-button"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>

                {/* Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="delete-confirm-overlay">
                        <div className="delete-confirm-dialog">
                            <div className="dialog-header">
                                <h3>Confirm Delete</h3>
                                <p>Are you sure you want to delete {selectedRows.length} workflow(s)?</p>
                            </div>
                            <div className="dialog-buttons">
                                <button
                                    className="confirm-cancel-button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button className="confirm-delete-button" onClick={handleDeleteConfirm}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Workflow;
