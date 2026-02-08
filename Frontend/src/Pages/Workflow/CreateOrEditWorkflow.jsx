// // // // import { useState } from "react";
// // // // import { Paperclip, Plus, ChevronDown } from "lucide-react";
// // // // import "./CreateOrEditWorkflow.css";

// // // // const CreateOrEditWorkflow = () => {
// // // // 	const [menuModal, setMenuModal] = useState(false);
// // // // 	const [isReadOnly, setIsReadOnly] = useState(true);

// // // // 	return (
// // // // 		<>
// // // // 			{/* Tasks Header Section */}
// // // // 			<div className="header-container">
// // // // 				<div className="header-container-heading">
// // // // 					<h1 className="tasks-heading">Workflow</h1>
// // // // 				</div>
// // // // 				<div className="header-container-buttons">
// // // // 					<button className="save-button">Save</button>
// // // // 					<button
// // // // 						className="edit-button"
// // // // 						onClick={() => setIsReadOnly(true)}
// // // // 					>
// // // // 						Edit
// // // // 					</button>
// // // // 					{/* <div className="more-options-container"> */}
// // // // 						{/* <button
// // // // 							className="more-options-button"
// // // // 							onClick={() => setMenuModal((prevState) => !prevState)}
// // // // 							>
// // // // 							⁞
// // // // 							</button> */}
// // // // 									{/* Menu Modal */}
// // // // 									{/* {menuModal && (
// // // // 							<div className="menu-modal-container">
// // // // 								<div className="menu-modal">
// // // // 								<ul className="menu-modal-list">
// // // // 									<li>Submit for Approval</li>
// // // // 									<li>Delete</li>
// // // // 									<li>Print Preview</li>
// // // // 									<li>Change Owner</li>
// // // // 								</ul>
// // // // 								</div>
// // // // 							</div>
// // // // 						)} */}
// // // // 					{/* </div> */}
// // // // 				</div>
// // // // 			</div>

// // // // 			{/* Business Object Container */}
// // // // 			<div className="business-object-container">
// // // // 				<div className="business-object-heading">
// // // // 					<h1>Business Object</h1>
// // // // 				</div>
// // // // 				<div className="business-object-form">
// // // // 					<form>
// // // // 						<div className="form-group from">
// // // // 							<label htmlFor="From">From</label>
// // // // 							{/* <input
// // // // 								type="text"
// // // // 								placeholder="From"
// // // // 								id="from"
// // // // 								readOnly={isReadOnly}
// // // // 							/> */}
// // // // 							<select name="" id="">
// // // // 								<option value="">Account</option>
// // // // 								<option value="">Activity Task</option>
// // // // 								<option value="">Appointment</option>
// // // // 								<option value="">Assignment</option>
// // // // 								<option value="">Campaign</option>
// // // // 								<option value="">Contact</option>
// // // // 								<option value="">Content Transfer</option>
// // // // 								<option value="">Deal Resignation</option>
// // // // 								<option value="">Email </option>
// // // // 								<option value="">incident</option>
// // // // 								<option value="">Individual Customer</option>
// // // // 							</select>
// // // // 						</div>

// // // // 						<div className="form-group To">
// // // // 							<label htmlFor="To">Name</label>
// // // // 							<input
// // // // 								type="text"
// // // // 								placeholder="To"
// // // // 								id="To"
// // // // 								readOnly={isReadOnly}
// // // // 							/>
// // // // 						</div>
// // // // 						<div className="form-group Description">
// // // // 							<label htmlFor="Description">Description</label>
// // // // 							<input
// // // // 								type="text"
// // // // 								placeholder="Description"
// // // // 								id="Description"
// // // // 								readOnly={isReadOnly}
// // // // 							/>
// // // // 						</div>
// // // // 						<div className="form-group Timing">
// // // // 							<label htmlFor="Timing">Timing</label>
// // // // 							<input
// // // // 								type="text"
// // // // 								placeholder="Timing"
// // // // 								id="Timing"
// // // // 								readOnly={isReadOnly}
// // // // 							/>
// // // // 						</div>
// // // // 					</form>
// // // // 				</div>
// // // // 			</div>

// // // // 			{/* Conditions Container */}

// // // // 			<div className="conditions-container">
// // // // 				<div className="conditions-heading">
// // // // 					<div className="left">
// // // // 						<h1>Conditions</h1>
// // // // 					</div>
// // // // 					<div className="right">
// // // // 						<h1>Execute if the following conditions met </h1>
// // // // 						<div>
// // // // 							<select name="" id="conditions">
// // // // 								<option value="">Condition are met</option>
// // // // 							</select>
// // // // 						</div>
// // // // 					</div>
// // // // 				</div>
// // // // 				<div className="conditions-form">
// // // // 					<form>
// // // // 						<div className="form-group fields">
// // // // 							<label htmlFor="fields">Fields</label>
// // // // 							<select name="" id="">
// // // // 								<option value=""></option>
// // // // 							</select>
// // // // 						</div>

// // // // 						<div className="form-group compareoperator">
// // // // 							<label htmlFor="compareoperator">
// // // // 								Compare Operator
// // // // 							</label>
// // // // 							<select id="compareoperator">
// // // // 								<option value=""></option>
// // // // 							</select>
// // // // 						</div>

// // // // 						<div className="form-group with">
// // // // 							<label htmlFor="with">With</label>
// // // // 							<select id="with">
// // // // 								<option value=""></option>
// // // // 							</select>
// // // // 						</div>
// // // // 					</form>
// // // // 				</div>
// // // // 			</div>

// // // // 			{/* Account Information Container */}
// // // // 			<div className="actions-container">
// // // // 				<div className="actions-heading">
// // // // 					<h1>Actions</h1>
// // // // 				</div>
// // // // 				<div className="actions-form">
// // // // 					<form>
// // // // 						<div className="form-group ruletype">
// // // // 							<label htmlFor="ruletype">Rule Type</label>
// // // // 							<select id="ruletype">
// // // // 								<option value="">Select Rule Type</option>
// // // // 							</select>
// // // // 						</div>
// // // // 						<div className="form-group cancel">
// // // // 							<label htmlFor="cancel">Cancel</label>
// // // // 							<select id="cancel">
// // // // 								<option value="">Select Cancel</option>
// // // // 							</select>
// // // // 						</div>
// // // // 						<div className="form-group userdetermination">
// // // // 							<label htmlFor="userdetermination">User Determination</label>
// // // // 							<select id="userdetermination">
// // // // 								<option value="">Select User Determination</option>
// // // // 							</select>
// // // // 						</div>
// // // // 						<div className="form-group businessroledetermination">
// // // // 							<label htmlFor="businessroledetermination">Business Role Determination</label>
// // // // 							<select id="businessroledetermination">
// // // // 								<option value="">Select Business Role Determination</option>
// // // // 							</select>
// // // // 						</div>
// // // // 					</form>
// // // // 				</div>
// // // // 			</div>
// // // // 		</>
// // // // 	);
// // // // };

// // // // export default CreateOrEditWorkflow;

// // // import { useState } from "react";
// // // import { Plus, ChevronDown, Trash2 } from "lucide-react";
// // // import "./CreateOrEditWorkflow.css";

// // // const CreateOrEditWorkflow = () => {
// // //   const [menuModal, setMenuModal] = useState(false);
// // //   const [isReadOnly, setIsReadOnly] = useState(true);
// // //   const [conditionGroups, setConditionGroups] = useState([
// // //     { id: 1, conditions: [{ id: 1, field: "", operator: "", value: "" }] },
// // //   ]);

// // //   const businessObjects = [
// // //     "Sales Quote",
// // //     "Ticket",
// // //     "Opportunity",
// // //     "Leads",
// // //     "Accounts",
// // //     "Activity Task",
// // //     "Customer",
// // //     "Appointment",
// // //     "Assignment",
// // //     "Campaign",
// // //     "Contact",
// // //     "Content Transfer",
// // //     "Deal Resignation",
// // //     "Email",
// // //     "Incident",
// // //     "Individual Customer",
// // //   ];

// // //   const timingOptions = ["On Create Only", "On Every Save", "Scheduled"];
// // //   const conditionLogicOptions = ["All conditions are met", "Any condition is met"];
// // //   const operatorOptions = [
// // //     "Equals",
// // //     "Not Equals",
// // //     "Greater Than",
// // //     "Less Than",
// // //     "Contains",
// // //     "Changed From",
// // //     "Changed To",
// // //   ];
// // //   const ruleTypeOptions = [
// // //     "Action",
// // //     "Activity Task",
// // //     "E-Mail",
// // //     "Field Update",
// // //     "Messaging",
// // //     "Notification",
// // //     "Social Media",
// // //   ];
// // //   const cancelOptions = ["Yes", "No"];
// // //   const userDeterminationOptions = ["Specific User", "Team", "Role-Based"];
// // //   const businessRoleDeterminationOptions = [
// // //     "Sales Manager",
// // //     "Support Agent",
// // //     "Team Lead",
// // //     "Custom Role",
// // //   ];

// // //   const addConditionGroup = () => {
// // //     setConditionGroups([
// // //       ...conditionGroups,
// // //       {
// // //         id: conditionGroups.length + 1,
// // //         conditions: [{ id: 1, field: "", operator: "", value: "" }],
// // //       },
// // //     ]);
// // //   };

// // //   const addCondition = (groupId) => {
// // //     setConditionGroups(
// // //       conditionGroups.map((group) =>
// // //         group.id === groupId
// // //           ? {
// // //               ...group,
// // //               conditions: [
// // //                 ...group.conditions,
// // //                 { id: group.conditions.length + 1, field: "", operator: "", value: "" },
// // //               ],
// // //             }
// // //           : group
// // //       )
// // //     );
// // //   };

// // //   const removeCondition = (groupId, conditionId) => {
// // //     setConditionGroups(
// // //       conditionGroups.map((group) =>
// // //         group.id === groupId
// // //           ? {
// // //               ...group,
// // //               conditions: group.conditions.filter((c) => c.id !== conditionId),
// // //             }
// // //           : group
// // //       )
// // //     );
// // //   };

// // //   const removeConditionGroup = (groupId) => {
// // //     setConditionGroups(conditionGroups.filter((group) => group.id !== groupId));
// // //   };

// // //   const updateCondition = (groupId, conditionId, field, value) => {
// // //     setConditionGroups(
// // //       conditionGroups.map((group) =>
// // //         group.id === groupId
// // //           ? {
// // //               ...group,
// // //               conditions: group.conditions.map((c) =>
// // //                 c.id === conditionId ? { ...c, [field]: value } : c
// // //               ),
// // //             }
// // //           : group
// // //       )
// // //     );
// // //   };

// // //   return (
// // //     <>
// // //       {/* Tasks Header Section */}
// // //       <div className="header-container">
// // //         <div className="header-container-heading">
// // //           <h1 className="tasks-heading">Workflow</h1>
// // //         </div>
// // //         <div className="header-container-buttons">
// // //           <button className="save-button">Save</button>
// // //           <button
// // //             className="edit-button"
// // //             onClick={() => setIsReadOnly(!isReadOnly)}
// // //           >
// // //             {isReadOnly ? "Edit" : "View"}
// // //           </button>
// // //           <div className="more-options-container">
// // //             <button
// // //               className="more-options-button"
// // //               onClick={() => setMenuModal((prevState) => !prevState)}
// // //             >
// // //               <ChevronDown size={20} />
// // //             </button>
// // //             {menuModal && (
// // //               <div className="menu-modal-container">
// // //                 <div className="menu-modal">
// // //                   <ul className="menu-modal-list">
// // //                     <li>Submit for Approval</li>
// // //                     <li>Delete</li>
// // //                     <li>Print Preview</li>
// // //                     <li>Change Owner</li>
// // //                   </ul>
// // //                 </div>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Business Object Container */}
// // //       <div className="business-object-container">
// // //         <div className="business-object-heading">
// // //           <h1>Business Object</h1>
// // //         </div>
// // //         <div className="business-object-form">
// // //           <form>
// // //             <div className="form-group from">
// // //               <label htmlFor="businessObject">Business Object</label>
// // //               <select id="businessObject" disabled={isReadOnly}>
// // //                 <option value="">Select Business Object</option>
// // //                 {businessObjects.map((obj) => (
// // //                   <option key={obj} value={obj}>
// // //                     {obj}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //             <div className="form-group name">
// // //               <label htmlFor="name">Name</label>
// // //               <input
// // //                 type="text"
// // //                 placeholder="Workflow Name"
// // //                 id="name"
// // //                 readOnly={isReadOnly}
// // //               />
// // //             </div>
// // //             <div className="form-group description">
// // //               <label htmlFor="description">Description</label>
// // //               <input
// // //                 type="text"
// // //                 placeholder="Workflow Description"
// // //                 id="description"
// // //                 readOnly={isReadOnly}
// // //               />
// // //             </div>
// // //             <div className="form-group timing">
// // //               <label htmlFor="timing">Timing</label>
// // //               <select id="timing" disabled={isReadOnly}>
// // //                 <option value="">Select Timing</option>
// // //                 {timingOptions.map((timing) => (
// // //                   <option key={timing} value={timing}>
// // //                     {timing}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //           </form>
// // //         </div>
// // //       </div>

// // //       {/* Conditions Container */}
// // //       <div className="conditions-container">
// // //         <div className="conditions-heading">
// // //           <div className="left">
// // //             <h1>Conditions</h1>
// // //           </div>
// // //           <div className="right">
// // //             <h1>Execute if the following conditions are met</h1>
// // //             <div>
// // //               <select id="conditionLogic" disabled={isReadOnly}>
// // //                 {conditionLogicOptions.map((logic) => (
// // //                   <option key={logic} value={logic}>
// // //                     {logic}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //           </div>
// // //         </div>
// // //         {conditionGroups.map((group) => (
// // //           <div key={group.id} className="condition-group">
// // //             <div className="condition-group-header">
// // //               <h2>Condition Group {group.id}</h2>
// // //               {!isReadOnly && conditionGroups.length > 1 && (
// // //                 <button
// // //                   className="delete-group-button"
// // //                   onClick={() => removeConditionGroup(group.id)}
// // //                 >
// // //                   <Trash2 size={16} />
// // //                 </button>
// // //               )}
// // //             </div>
// // //             <div className="conditions-form">
// // //               {group.conditions.map((condition) => (
// // //                 <div key={condition.id} className="condition-row">
// // //                   <div className="form-group fields">
// // //                     <label htmlFor={`field-${group.id}-${condition.id}`}>
// // //                       Fields
// // //                     </label>
// // //                     <select
// // //                       id={`field-${group.id}-${condition.id}`}
// // //                       disabled={isReadOnly}
// // //                       value={condition.field}
// // //                       onChange={(e) =>
// // //                         updateCondition(group.id, condition.id, "field", e.target.value)
// // //                       }
// // //                     >
// // //                       <option value="">Select Field</option>
// // //                       <option value="Lead Type">Lead Type</option>
// // //                       <option value="Lead Stage">Lead Stage</option>
// // //                       <option value="Amount">Amount</option>
// // //                       <option value="Status">Status</option>
// // //                       <option value="Priority">Priority</option>
// // //                       <option value="Customer Type">Customer Type</option>
// // //                     </select>
// // //                   </div>
// // //                   <div className="form-group compareoperator">
// // //                     <label htmlFor={`operator-${group.id}-${condition.id}`}>
// // //                       Compare Operator
// // //                     </label>
// // //                     <select
// // //                       id={`operator-${group.id}-${condition.id}`}
// // //                       disabled={isReadOnly}
// // //                       value={condition.operator}
// // //                       onChange={(e) =>
// // //                         updateCondition(group.id, condition.id, "operator", e.target.value)
// // //                       }
// // //                     >
// // //                       <option value="">Select Operator</option>
// // //                       {operatorOptions.map((op) => (
// // //                         <option key={op} value={op}>
// // //                           {op}
// // //                         </option>
// // //                       ))}
// // //                     </select>
// // //                   </div>
// // //                   <div className="form-group value">
// // //                     <label htmlFor={`value-${group.id}-${condition.id}`}>
// // //                       Value
// // //                     </label>
// // //                     <input
// // //                       type="text"
// // //                       id={`value-${group.id}-${condition.id}`}
// // //                       placeholder="Value"
// // //                       readOnly={isReadOnly}
// // //                       value={condition.value}
// // //                       onChange={(e) =>
// // //                         updateCondition(group.id, condition.id, "value", e.target.value)
// // //                       }
// // //                     />
// // //                   </div>
// // //                   {!isReadOnly && group.conditions.length > 1 && (
// // //                     <button
// // //                       className="delete-condition-button"
// // //                       onClick={() => removeCondition(group.id, condition.id)}
// // //                     >
// // //                       <Trash2 size={16} />
// // //                     </button>
// // //                   )}
// // //                 </div>
// // //               ))}
// // //               {!isReadOnly && (
// // //                 <button
// // //                   className="add-condition-button"
// // //                   onClick={() => addCondition(group.id)}
// // //                 >
// // //                   <Plus size={16} /> Add Condition
// // //                 </button>
// // //               )}
// // //             </div>
// // //           </div>
// // //         ))}
// // //         {!isReadOnly && (
// // //           <button className="add-group-button" onClick={addConditionGroup}>
// // //             <Plus size={16} /> Add Condition Group
// // //           </button>
// // //         )}
// // //       </div>

// // //       {/* Actions Container */}
// // //       <div className="actions-container">
// // //         <div className="actions-heading">
// // //           <h1>Actions</h1>
// // //         </div>
// // //         <div className="actions-form">
// // //           <form>
// // //             <div className="form-group ruletype">
// // //               <label htmlFor="ruletype">Rule Type</label>
// // //               <select id="ruletype" disabled={isReadOnly}>
// // //                 <option value="">Select Rule Type</option>
// // //                 {ruleTypeOptions.map((rule) => (
// // //                   <option key={rule} value={rule}>
// // //                     {rule}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //             <div className="form-group cancel">
// // //               <label htmlFor="cancel">Cancel</label>
// // //               <select id="cancel" disabled={isReadOnly}>
// // //                 <option value="">Select Cancel</option>
// // //                 {cancelOptions.map((cancel) => (
// // //                   <option key={cancel} value={cancel}>
// // //                     {cancel}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //             <div className="form-group userdetermination">
// // //               <label htmlFor="userdetermination">User Determination</label>
// // //               <select id="userdetermination" disabled={isReadOnly}>
// // //                 <option value="">Select User Determination</option>
// // //                 {userDeterminationOptions.map((user) => (
// // //                   <option key={user} value={user}>
// // //                     {user}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //             <div className="form-group businessroledetermination">
// // //               <label htmlFor="businessroledetermination">
// // //                 Business Role Determination
// // //               </label>
// // //               <select id="businessroledetermination" disabled={isReadOnly}>
// // //                 <option value="">Select Business Role Determination</option>
// // //                 {businessRoleDeterminationOptions.map((role) => (
// // //                   <option key={role} value={role}>
// // //                     {role}
// // //                   </option>
// // //                 ))}
// // //               </select>
// // //             </div>
// // //           </form>
// // //         </div>
// // //       </div>
// // //     </>
// // //   );
// // // };

// // // export default CreateOrEditWorkflow;

// // import { useState, useEffect } from "react";
// // import { Plus, ChevronDown, Trash2 } from "lucide-react";
// // import { useNavigate, useParams } from "react-router-dom";
// // import axios from "axios";
// // import "./CreateOrEditWorkflow.css";

// // const CreateOrEditWorkflow = () => {
// //     const { id } = useParams(); // Get workflow ID from URL for editing
// //     const navigate = useNavigate();
// //     const [menuModal, setMenuModal] = useState(false);
// //     const [isReadOnly, setIsReadOnly] = useState(!!id); // Read-only for edit mode initially
// //     const [workflow, setWorkflow] = useState({
// //         name: "",
// //         description: "",
// //         businessObject: "",
// //         timing: "",
// //         conditionLogic: "",
// //         conditionGroups: [{ id: 1, conditions: [{ id: 1, field: "", operator: "", value: "" }] }],
// //         action: { ruleType: "", cancel: "", userDetermination: "", businessRoleDetermination: "" },
// //     });
// //     const [loading, setLoading] = useState(false);
// //     const [error, setError] = useState(null);

// //     const businessObjects = [
// //         "Sales Quote",
// //         "Ticket",
// //         "Opportunity",
// //         "Leads",
// //         "Accounts",
// //         "Activity Task",
// //         "Customer",
// //         "Appointment",
// //         "Assignment",
// //         "Campaign",
// //         "Contact",
// //         "Content Transfer",
// //         "Deal Resignation",
// //         "Email",
// //         "Incident",
// //         "Individual Customer",
// //     ];
// //     const timingOptions = ["On Create Only", "On Every Save", "Scheduled"];
// //     const conditionLogicOptions = ["All conditions are met", "Any condition is met"];
// //     const operatorOptions = [
// //         "Equals",
// //         "Not Equals",
// //         "Greater Than",
// //         "Less Than",
// //         "Contains",
// //         "Changed From",
// //         "Changed To",
// //     ];
// //     const ruleTypeOptions = [
// //         "Action",
// //         "Activity Task",
// //         "E-Mail",
// //         "Field Update",
// //         "Messaging",
// //         "Notification",
// //         "Social Media",
// //     ];
// //     const cancelOptions = ["Yes", "No"];
// //     const userDeterminationOptions = ["Specific User", "Team", "Role-Based"];
// //     const businessRoleDeterminationOptions = [
// //         "Sales Manager",
// //         "Support Agent",
// //         "Team Lead",
// //         "Custom Role",
// //     ];

// //     // Fetch workflow for editing
// //     useEffect(() => {
// //         if (id) {
// //             const fetchWorkflow = async () => {
// //                 setLoading(true);
// //                 setError(null);
// //                 try {
// //                     const response = await axios.get(`http://localhost:1234/api/workflows/${id}`);
// //                     // Transform backend data to match frontend structure
// //                     const data = response.data;
// //                     data.conditionGroups = data.conditionGroups.map((group, index) => ({
// //                         id: index + 1,
// //                         conditions: group.conditions.map((condition, cIndex) => ({
// //                             id: cIndex + 1,
// //                             field: condition.field,
// //                             operator: condition.operator,
// //                             value: condition.value,
// //                         })),
// //                     }));
// //                     setWorkflow(data);
// //                 } catch (err) {
// //                     setError("Failed to fetch workflow: " + err.message);
// //                 } finally {
// //                     setLoading(false);
// //                 }
// //             };
// //             fetchWorkflow();
// //         }
// //     }, [id]);

// //     // Handle form input changes
// //     const handleInputChange = (e, field) => {
// //         setWorkflow({ ...workflow, [field]: e.target.value });
// //     };

// //     // Handle action input changes
// //     const handleActionChange = (e, field) => {
// //         setWorkflow({
// //             ...workflow,
// //             action: { ...workflow.action, [field]: e.target.value },
// //         });
// //     };

// //     // Add condition group
// //     // const addConditionGroup = () => {
// //     //     setWorkflow({
// //     //         ...workflow,
// //     //         conditionGroups: [
// //     //             ...workflow.conditionGroups,
// //     //             {
// //     //                 id: workflow.conditionGroups.length + 1,
// //     //                 conditions: [{ id: 1, field: "", operator: "", value: "" }],
// //     //             },
// //     //         ],
// //     //     });
// //     // };

// //     // Add condition to a group
// //     const addCondition = (groupId) => {
// //         setWorkflow({
// //             ...workflow,
// //             conditionGroups: workflow.conditionGroups.map((group) =>
// //                 group.id === groupId
// //                     ? {
// //                           ...group,
// //                           conditions: [
// //                               ...group.conditions,
// //                               { id: group.conditions.length + 1, field: "", operator: "", value: "" },
// //                           ],
// //                       }
// //                     : group
// //             ),
// //         });
// //     };

// //     // Remove condition
// //     const removeCondition = (groupId, conditionId) => {
// //         setWorkflow({
// //             ...workflow,
// //             conditionGroups: workflow.conditionGroups.map((group) =>
// //                 group.id === groupId
// //                     ? {
// //                           ...group,
// //                           conditions: group.conditions.filter((c) => c.id !== conditionId),
// //                       }
// //                     : group
// //             ),
// //         });
// //     };

// //     // Remove condition group
// //     const removeConditionGroup = (groupId) => {
// //         setWorkflow({
// //             ...workflow,
// //             conditionGroups: workflow.conditionGroups.filter((group) => group.id !== groupId),
// //         });
// //     };

// //     // Update condition
// //     const updateCondition = (groupId, conditionId, field, value) => {
// //         setWorkflow({
// //             ...workflow,
// //             conditionGroups: workflow.conditionGroups.map((group) =>
// //                 group.id === groupId
// //                     ? {
// //                           ...group,
// //                           conditions: group.conditions.map((c) =>
// //                               c.id === conditionId ? { ...c, [field]: value } : c
// //                           ),
// //                       }
// //                     : group
// //             ),
// //         });
// //     };

// //     // Save workflow (create or update)
// //     const handleSave = async () => {
// //         setLoading(true);
// //         setError(null);
// //         try {
// //             // Transform frontend data to match backend structure
// //             const payload = {
// //                 ...workflow,
// //                 conditionGroups: workflow.conditionGroups.map((group) => ({
// //                     conditions: group.conditions.map((condition) => ({
// //                         field: condition.field,
// //                         operator: condition.operator,
// //                         value: condition.value,
// //                     })),
// //                 })),
// //             };

// //             if (id) {
// //                 // Update existing workflow
// //                 await axios.put(`http://localhost:1234/api/workflows/${id}`, payload);
// //             } else {
// //                 // Create new workflow
// //                 await axios.post("http://localhost:1234/api/workflows", payload);
// //             }
// //             navigate("/admin/workflows"); // Redirect to workflow list
// //         } catch (err) {
// //             setError("Failed to save workflow: " + err.message);
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     // Delete workflow
// //     const handleDelete = async () => {
// //         if (id) {
// //             setLoading(true);
// //             setError(null);
// //             try {
// //                 await axios.delete(`http://localhost:1234/api/workflows/${id}`);
// //                 navigate("/admin/workflows");
// //             } catch (err) {
// //                 setError("Failed to delete workflow: " + err.message);
// //             } finally {
// //                 setLoading(false);
// //                 setMenuModal(false);
// //             }
// //         }
// //     };

// //     return (
// //         <>
// //             {/* Header Section */}
// //             <div className="header-container">
// //                 <div className="header-container-heading">
// //                     <h1 className="tasks-heading">{id ? "Edit Workflow" : "Create Workflow"}</h1>
// //                 </div>
// //                 <div className="header-container-buttons">
// //                     <button className="save-button" onClick={handleSave} disabled={loading}>
// //                         {loading ? "Saving..." : "Save"}
// //                     </button>
// //                     <button
// //                         className="edit-button"
// //                         onClick={() => setIsReadOnly(!isReadOnly)}
// //                         disabled={loading}
// //                     >
// //                         {isReadOnly ? "Edit" : "View"}
// //                     </button>
// //                     <div className="more-options-container">
// //                         <button
// //                             className="more-options-button"
// //                             onClick={() => setMenuModal((prev) => !prev)}
// //                         >
// //                             <ChevronDown size={20} />
// //                         </button>
// //                         {menuModal && (
// //                             <div className="menu-modal-container">
// //                                 <div className="menu-modal">
// //                                     <ul className="menu-modal-list">
// //                                         {id && (
// //                                             <li onClick={handleDelete}>Delete</li>
// //                                         )}
// //                                         <li>Print Preview</li>
// //                                         <li>Change Owner</li>
// //                                     </ul>
// //                                 </div>
// //                             </div>
// //                         )}
// //                     </div>
// //                 </div>
// //             </div>

// //             {loading && <p>Loading...</p>}
// //             {error && <p className="error">{error}</p>}

// //             {/* Business Object Container */}
// //             <div className="business-object-container">
// //                 <div className="business-object-heading">
// //                     <h1>Business Object</h1>
// //                 </div>
// //                 <div className="business-object-form">
// //                     <form>
// //                         <div className="form-group from">
// //                             <label htmlFor="businessObject">Business Object</label>
// //                             <select
// //                                 id="businessObject"
// //                                 disabled={isReadOnly}
// //                                 value={workflow.businessObject}
// //                                 onChange={(e) => handleInputChange(e, "businessObject")}
// //                             >
// //                                 <option value="">Select Business Object</option>
// //                                 {businessObjects.map((obj) => (
// //                                     <option key={obj} value={obj}>
// //                                         {obj}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                         <div className="form-group name">
// //                             <label htmlFor="name">Name</label>
// //                             <input
// //                                 type="text"
// //                                 placeholder="Workflow Name"
// //                                 id="name"
// //                                 readOnly={isReadOnly}
// //                                 value={workflow.name}
// //                                 onChange={(e) => handleInputChange(e, "name")}
// //                             />
// //                         </div>
// //                         <div className="form-group description">
// //                             <label htmlFor="description">Description</label>
// //                             <input
// //                                 type="text"
// //                                 placeholder="Workflow Description"
// //                                 id="description"
// //                                 readOnly={isReadOnly}
// //                                 value={workflow.description}
// //                                 onChange={(e) => handleInputChange(e, "description")}
// //                             />
// //                         </div>
// //                         <div className="form-group timing">
// //                             <label htmlFor="timing">Timing</label>
// //                             <select
// //                                 id="timing"
// //                                 disabled={isReadOnly}
// //                                 value={workflow.timing}
// //                                 onChange={(e) => handleInputChange(e, "timing")}
// //                             >
// //                                 <option value="">Select Timing</option>
// //                                 {timingOptions.map((timing) => (
// //                                     <option key={timing} value={timing}>
// //                                         {timing}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </form>
// //                 </div>
// //             </div>

// //             {/* Conditions Container */}
// //             {/* <div className="conditions-container">
// //                 <div className="conditions-heading">
// //                     <div className="left">
// //                         <h1>Conditions</h1>
// //                     </div>
// //                     <div className="right">
// //                         <h1>Execute if the following conditions are met</h1>
// //                         <div>
// //                             <select
// //                                 id="conditionLogic"
// //                                 disabled={isReadOnly}
// //                                 value={workflow.conditionLogic}
// //                                 onChange={(e) => handleInputChange(e, "conditionLogic")}
// //                             >
// //                                 <option value="">Select Condition Logic</option>
// //                                 {conditionLogicOptions.map((logic) => (
// //                                     <option key={logic} value={logic}>
// //                                         {logic}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </div>
// //                 </div>
// //                 {workflow.conditionGroups.map((group) => (
// //                     <div key={group.id} className="condition-group">
// //                         <div className="condition-group-header">
// //                             <h2>Condition Group {group.id}</h2>
// //                             {!isReadOnly && workflow.conditionGroups.length > 1 && (
// //                                 <button
// //                                     className="delete-group-button"
// //                                     onClick={() => removeConditionGroup(group.id)}
// //                                 >
// //                                     <Trash2 size={16} />
// //                                 </button>
// //                             )}
// //                         </div>
// //                         <div className="conditions-form">
// //                             {group.conditions.map((condition) => (
// //                                 <div key={condition.id} className="condition-row">
// //                                     <div className="form-group fields">
// //                                         <label htmlFor={`field-${group.id}-${condition.id}`}>
// //                                             Fields
// //                                         </label>
// //                                         <select
// //                                             id={`field-${group.id}-${condition.id}`}
// //                                             disabled={isReadOnly}
// //                                             value={condition.field}
// //                                             onChange={(e) =>
// //                                                 updateCondition(group.id, condition.id, "field", e.target.value)
// //                                             }
// //                                         >
// //                                             <option value="">Select Field</option>
// //                                             <option value="Lead Type">Lead Type</option>
// //                                             <option value="Lead Stage">Lead Stage</option>
// //                                             <option value="Amount">Amount</option>
// //                                             <option value="Status">Status</option>
// //                                             <option value="Priority">Priority</option>
// //                                             <option value="Customer Type">Customer Type</option>
// //                                         </select>
// //                                     </div>
// //                                     <div className="form-group compareoperator">
// //                                         <label htmlFor={`operator-${group.id}-${condition.id}`}>
// //                                             Compare Operator
// //                                         </label>
// //                                         <select
// //                                             id={`operator-${group.id}-${condition.id}`}
// //                                             disabled={isReadOnly}
// //                                             value={condition.operator}
// //                                             onChange={(e) =>
// //                                                 updateCondition(group.id, condition.id, "operator", e.target.value)
// //                                             }
// //                                         >
// //                                             <option value="">Select Operator</option>
// //                                             {operatorOptions.map((op) => (
// //                                                 <option key={op} value={op}>
// //                                                     {op}
// //                                                 </option>
// //                                             ))}
// //                                         </select>
// //                                     </div>
// //                                     <div className="form-group value">
// //                                         <label htmlFor={`value-${group.id}-${condition.id}`}>
// //                                             Value
// //                                         </label>
// //                                         <input
// //                                             type="text"
// //                                             id={`value-${group.id}-${condition.id}`}
// //                                             placeholder="Value"
// //                                             readOnly={isReadOnly}
// //                                             value={condition.value}
// //                                             onChange={(e) =>
// //                                                 updateCondition(group.id, condition.id, "value", e.target.value)
// //                                             }
// //                                         />
// //                                     </div>
// //                                     {!isReadOnly && group.conditions.length > 1 && (
// //                                         <button
// //                                             className="delete-condition-button"
// //                                             onClick={() => removeCondition(group.id, condition.id)}
// //                                         >
// //                                             <Trash2 size={16} />
// //                                         </button>
// //                                     )}
// //                                 </div>
// //                             ))}
// //                             {!isReadOnly && (
// //                                 <button
// //                                     className="add-condition-button"
// //                                     onClick={() => addCondition(group.id)}
// //                                 >
// //                                     <Plus size={16} /> Add Condition
// //                                 </button>
// //                             )}
// //                         </div>
// //                     </div>
// //                 ))}
// //                 {!isReadOnly && (
// //                     <button className="add-group-button" onClick={addConditionGroup}>
// //                         <Plus size={16} /> Add Condition Group
// //                     </button>
// //                 )}
// //             </div> */}

// //             {/* Conditions Container */}
// // <div className="conditions-container">
// //   <div className="conditions-heading">
// //     <div className="left">
// //       <h1>Conditions</h1>
// //     </div>
// //     <div className="right">
// //       {/* <h1>Execute if the following conditions are met</h1> */}
// //       {/* <div>
// //         <select
// //           id="conditionLogic"
// //           disabled={isReadOnly}
// //           value={workflow.conditionLogic}
// //           onChange={(e) => handleInputChange(e, "conditionLogic")}
// //         >
// //           <option value="">Select Condition Logic</option>
// //           {conditionLogicOptions.map((logic) => (
// //             <option key={logic} value={logic}>
// //               {logic}
// //             </option>
// //           ))}
// //         </select>
// //       </div> */}
// //     </div>
// //   </div>

// //   {/* Loop through each condition group */}
// //   {workflow.conditionGroups.map((group) => (
// //     <div key={group.id} className="condition-group">
// //       <div className="condition-group-header">
// //         <h2>Execute if the following conditions are met</h2>
// //         {/* <h2>Condition Group {group.id}</h2> */}

// //           <div>
// //         <select
// //           id="conditionLogic"
// //           disabled={isReadOnly}
// //           value={workflow.conditionLogic}
// //           onChange={(e) => handleInputChange(e, "conditionLogic")}
// //         >
// //           <option value="">Select Condition Logic</option>
// //           {conditionLogicOptions.map((logic) => (
// //             <option key={logic} value={logic}>
// //               {logic}
// //             </option>
// //           ))}
// //         </select>
// //       </div>

// //        {!isReadOnly && (
// //           <button
// //             className="add-condition-button"
// //             onClick={() => addCondition(group.id)}
// //           >
// //             <Plus size={16} /> Add Condition
// //           </button>
// //         )}

// //         {!isReadOnly && workflow.conditionGroups.length > 1 && (
// //           <button
// //             className="delete-group-button"
// //             onClick={() => removeConditionGroup(group.id)}
// //           >
// //             <Trash2 size={16} />
// //           </button>
// //         )}
// //       </div>

// //       <div className="conditions-form">
// //         {/* Each Condition Row */}
// //         {group.conditions.map((condition) => (
// //           <div key={condition.id} className="condition-row">

// //             {/* Field */}
// //             <div className="form-group fields">
// //               <label htmlFor={`field-${group.id}-${condition.id}`}>Field</label>
// //               <select
// //                 id={`field-${group.id}-${condition.id}`}
// //                 disabled={isReadOnly}
// //                 value={condition.field}
// //                 onChange={(e) =>
// //                   updateCondition(group.id, condition.id, "field", e.target.value)
// //                 }
// //               >
// //                 <option value="">Select Field</option>
// //                 <option value="Lead Type">Lead Type</option>
// //                 <option value="Lead Stage">Lead Stage</option>
// //                 <option value="Amount">Amount</option>
// //                 <option value="Status">Status</option>
// //                 <option value="Priority">Priority</option>
// //                 <option value="Customer Type">Customer Type</option>
// //               </select>
// //             </div>

// //             {/* Compare Operator */}
// //             <div className="form-group compareoperator">
// //               <label htmlFor={`operator-${group.id}-${condition.id}`}>
// //                 Compare Operator
// //               </label>
// //               <select
// //                 id={`operator-${group.id}-${condition.id}`}
// //                 disabled={isReadOnly}
// //                 value={condition.operator}
// //                 onChange={(e) =>
// //                   updateCondition(group.id, condition.id, "operator", e.target.value)
// //                 }
// //               >
// //                 <option value="">Select Operator</option>
// //                 <option value="Equal to">Equal to</option>
// //                 <option value="Not equal to">Not equal to</option>
// //                 <option value="Greater than">Greater than</option>
// //                 <option value="Less than">Less than</option>
// //               </select>
// //             </div>

// //             {/* With (Value or Field) */}
// //             <div className="form-group with">
// //               <label htmlFor={`with-${group.id}-${condition.id}`}>With</label>
// //               <select
// //                 id={`with-${group.id}-${condition.id}`}
// //                 disabled={isReadOnly}
// //                 value={condition.withType || "Value"}
// //                 onChange={(e) =>
// //                   updateCondition(group.id, condition.id, "withType", e.target.value)
// //                 }
// //               >
// //                 <option value="Value">Value</option>
// //                 <option value="Field">Field</option>
// //               </select>
// //             </div>

// //             {/* Value */}
// //             <div className="form-group value">
// //               <label htmlFor={`value-${group.id}-${condition.id}`}>Value</label>
// //               <input
// //                 type="text"
// //                 id={`value-${group.id}-${condition.id}`}
// //                 placeholder="Enter value or field name"
// //                 readOnly={isReadOnly}
// //                 value={condition.value}
// //                 onChange={(e) =>
// //                   updateCondition(group.id, condition.id, "value", e.target.value)
// //                 }
// //               />
// //             </div>

// //             {/* Delete Condition Button */}
// //             {!isReadOnly && group.conditions.length > 1 && (
// //               <button
// //                 className="delete-condition-button"
// //                 onClick={() => removeCondition(group.id, condition.id)}
// //               >
// //                 <Trash2 size={16} />
// //               </button>
// //             )}
// //           </div>
// //         ))}

// //         {/* Add Condition Button */}
// //         {/* {!isReadOnly && (
// //           <button
// //             className="add-condition-button"
// //             onClick={() => addCondition(group.id)}
// //           >
// //             <Plus size={16} /> Add Condition
// //           </button>
// //         )} */}
// //       </div>
// //     </div>
// //   ))}

// //   {/* Add Group Button */}
// //   {/* {!isReadOnly && (
// //     <button className="add-group-button" onClick={addConditionGroup}>
// //       <Plus size={16} /> Add Condition Group
// //     </button>
// //   )} */}
// // </div>

// //             {/* Actions Container */}
// //             <div className="actions-container">
// //                 <div className="actions-heading">
// //                     <h1>Actions</h1>
// //                 </div>
// //                 <div className="actions-form">
// //                     <form>
// //                         <div className="form-group ruletype">
// //                             <label htmlFor="ruletype">Rule Type</label>
// //                             <select
// //                                 id="ruletype"
// //                                 disabled={isReadOnly}
// //                                 value={workflow.action.ruleType}
// //                                 onChange={(e) => handleActionChange(e, "ruleType")}
// //                             >
// //                                 <option value="">Select Rule Type</option>
// //                                 {ruleTypeOptions.map((rule) => (
// //                                     <option key={rule} value={rule}>
// //                                         {rule}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                         <div className="form-group cancel">
// //                             <label htmlFor="cancel">Cancel</label>
// //                             <select
// //                                 id="cancel"
// //                                 disabled={isReadOnly}
// //                                 value={workflow.action.cancel}
// //                                 onChange={(e) => handleActionChange(e, "cancel")}
// //                             >
// //                                 <option value="">Select Cancel</option>
// //                                 {cancelOptions.map((cancel) => (
// //                                     <option key={cancel} value={cancel}>
// //                                         {cancel}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                         <div className="form-group userdetermination">
// //                             <label htmlFor="userdetermination">User Determination</label>
// //                             <select
// //                                 id="userdetermination"
// //                                 disabled={isReadOnly}
// //                                 value={workflow.action.userDetermination}
// //                                 onChange={(e) => handleActionChange(e, "userDetermination")}
// //                             >
// //                                 <option value="">Select User Determination</option>
// //                                 {userDeterminationOptions.map((user) => (
// //                                     <option key={user} value={user}>
// //                                         {user}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                         <div className="form-group businessroledetermination">
// //                             <label htmlFor="businessroledetermination">
// //                                 Business Role Determination
// //                             </label>
// //                             <select
// //                                 id="businessroledetermination"
// //                                 disabled={isReadOnly}
// //                                 value={workflow.action.businessRoleDetermination}
// //                                 onChange={(e) => handleActionChange(e, "businessRoleDetermination")}
// //                             >
// //                                 <option value="">Select Business Role Determination</option>
// //                                 {businessRoleDeterminationOptions.map((role) => (
// //                                     <option key={role} value={role}>
// //                                         {role}
// //                                     </option>
// //                                 ))}
// //                             </select>
// //                         </div>
// //                     </form>
// //                 </div>
// //             </div>
// //         </>
// //     );
// // };

// // export default CreateOrEditWorkflow;

// import { useState, useEffect } from "react";
// import { Plus, ChevronDown, Trash2 } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";
// import axios from "axios";
// import "./CreateOrEditWorkflow.css";

// const CreateOrEditWorkflow = () => {
//     const { id } = useParams();
//     const navigate = useNavigate();
//     const [menuModal, setMenuModal] = useState(false);
//     const [isReadOnly, setIsReadOnly] = useState(!!id);
//     const [fieldOptions, setFieldOptions] = useState([]); // Dynamic fields
//     const [fieldLoading, setFieldLoading] = useState(false);

//     const [workflow, setWorkflow] = useState({
//         name: "",
//         description: "",
//         businessObject: "",
//         timing: "",
//         conditionLogic: "",
//         conditionGroups: [{ id: 1, conditions: [{ id: 1, field: "", operator: "", value: "", withType: "Value" }] }],
//         action: { ruleType: "", cancel: "" },
//     });

//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     // Updated Business Objects
//     const businessObjects = [
//         "Account",
//         "Activity Task",
//         "Appointment",
//         "Assignment",
//         "Campaign",
//         "Contact",
//         "Content Transfer",
//         "Deal Registration",
//         "E-mail",
//         "Incident",
//         "Individual Customer",
//         "Leads",
//         "Opportunity",
//         "Phone Call",
//         "Sales Data",
//         "Sales Lead",
//         "Sales Order",
//         "Sales Quote",
//         "Service E-mail",
//         "Social Media Message Import Run",
//         "Ticket",
//         "Time Report",
//         "Transparent Request",
//         "Visit",
//     ];

//     const timingOptions = ["On Create Only", "On Every Save", "Scheduled"];
//     const conditionLogicOptions = ["All conditions are met", "Any condition is met"];
//     const operatorOptions = ["Equal to", "Not equal to", "Greater than", "Less than", "Contains"];
//     const ruleTypeOptions = ["Email", "Notification", "Field Update"];
//     const businessRoleDeterminationOptions = [
//          "Sales Manager",
//          "Support Agent",
//          "Team Lead",
//          "Custom Role",
//      ];
//     const cancelOptions = ["Yes", "No"];

//     // API Mapping for Business Objects
//     const apiMap = {
//         "Contact": `${BASE_URL_AC}/contact/`,
//         "Account": `${BASE_URL_AC}/account/`,
//         "Ticket": `${BASE_URL_SER}/tickets`,
//         "E-mail": `${BASE_URL_AM}/emails`,
//         "Activity Task": `${BASE_URL_AM}/tasks`,
//         "Leads": `${BASE_URL_LM}/leads`,
//         // Add more mappings as needed
//     };

//     // Fetch workflow on edit
//     useEffect(() => {
//         if (id) {
//             const fetchWorkflow = async () => {
//                 setLoading(true);
//                 try {
//                     const response = await axios.get(`http://localhost:1234/api/workflows/${id}`);
//                     const data = response.data;

//                     // Transform conditionGroups
//                     data.conditionGroups = data.conditionGroups.map((group, gIdx) => ({
//                         id: gIdx + 1,
//                         conditions: group.conditions.map((cond, cIdx) => ({
//                             id: cIdx + 1,
//                             field: cond.field || "",
//                             operator: cond.operator || "",
//                             value: cond.value || "",
//                             withType: cond.withType || "Value",
//                         })),
//                     }));

//                     setWorkflow(data);
//                     // Load fields if businessObject exists
//                     if (data.businessObject && apiMap[data.businessObject]) {
//                         fetchFields(data.businessObject);
//                     }
//                 } catch (err) {
//                     setError("Failed to fetch workflow: " + err.message);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             fetchWorkflow();
//         }
//     }, [id]);

//     // Fetch fields when businessObject changes
//     const fetchFields = async (businessObject) => {
//         const apiUrl = apiMap[businessObject];
//         if (!apiUrl) {
//             setFieldOptions([]);
//             return;
//         }

//         setFieldLoading(true);
//         try {
//             const response = await axios.get(apiUrl);
//             const data = Array.isArray(response.data) ? response.data[0] : response.data;
//             if (data && typeof data === "object") {
//                 const fields = Object.keys(data).filter(key => key !== "id" && key !== "_id");
//                 setFieldOptions(fields);
//             } else {
//                 setFieldOptions([]);
//             }
//         } catch (err) {
//             console.error("Failed to fetch fields:", err);
//             setFieldOptions([]);
//         } finally {
//             setFieldLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (workflow.businessObject) {
//             fetchFields(workflow.businessObject);
//         } else {
//             setFieldOptions([]);
//         }
//     }, [workflow.businessObject]);

//     // Handlers
//     const handleInputChange = (e, field) => {
//         const value = e.target.value;
//         setWorkflow(prev => ({ ...prev, [field]: value }));
//         if (field === "businessObject") {
//             // Reset conditions when BO changes
//             setWorkflow(prev => ({
//                 ...prev,
//                 conditionGroups: [{
//                     id: 1,
//                     conditions: [{ id: 1, field: "", operator: "", value: "", withType: "Value" }]
//                 }]
//             }));
//         }
//     };

//     const handleActionChange = (e, field) => {
//         setWorkflow(prev => ({
//             ...prev,
//             action: { ...prev.action, [field]: e.target.value }
//         }));
//     };

//     // Add Condition Group
//     // const addConditionGroup = () => {
//     //     setWorkflow(prev => ({
//     //         ...prev,
//     //         conditionGroups: [
//     //             ...prev.conditionGroups,
//     //             {
//     //                 id: prev.conditionGroups.length + 1,
//     //                 conditions: [{ id: 1, field: "", operator: "", value: "", withType: "Value" }]
//     //             }
//     //         ]
//     //     }));
//     // };

//     // Add Condition
//     const addCondition = (groupId) => {
//         setWorkflow(prev => ({
//             ...prev,
//             conditionGroups: prev.conditionGroups.map(group =>
//                 group.id === groupId
//                     ? {
//                           ...group,
//                           conditions: [
//                               ...group.conditions,
//                               {
//                                   id: group.conditions.length + 1,
//                                   field: "",
//                                   operator: "",
//                                   value: "",
//                                   withType: "Value"
//                               }
//                           ]
//                       }
//                     : group
//             )
//         }));
//     };

//     // Remove Condition
//     const removeCondition = (groupId, conditionId) => {
//         setWorkflow(prev => ({
//             ...prev,
//             conditionGroups: prev.conditionGroups.map(group =>
//                 group.id === groupId
//                     ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
//                     : group
//             ).filter(g => g.conditions.length > 0)
//         }));
//     };

//     // Remove Group
//     const removeConditionGroup = (groupId) => {
//         setWorkflow(prev => ({
//             ...prev,
//             conditionGroups: prev.conditionGroups.filter(g => g.id !== groupId)
//         }));
//     };

//     // Update Condition
//     const updateCondition = (groupId, conditionId, field, value) => {
//         setWorkflow(prev => ({
//             ...prev,
//             conditionGroups: prev.conditionGroups.map(group =>
//                 group.id === groupId
//                     ? {
//                           ...group,
//                           conditions: group.conditions.map(c =>
//                               c.id === conditionId ? { ...c, [field]: value } : c
//                           )
//                       }
//                     : group
//             )
//         }));
//     };

//     // Save
//     const handleSave = async () => {
//         setLoading(true);
//         setError(null);
//         try {
//             const payload = {
//                 ...workflow,
//                 conditionGroups: workflow.conditionGroups.map(group => ({
//                     conditions: group.conditions.map(c => ({
//                         field: c.field,
//                         operator: c.operator,
//                         value: c.value,
//                         withType: c.withType
//                     }))
//                 }))
//             };

//             if (id) {
//                 await axios.put(`http://localhost:1234/api/workflows/${id}`, payload);
//             } else {
//                 await axios.post("http://localhost:1234/api/workflows", payload);
//             }
//             navigate("/admin/workflows");
//         } catch (err) {
//             setError("Failed to save: " + err.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Delete
//     const handleDelete = async () => {
//         if (!id) return;
//         setLoading(true);
//         try {
//             await axios.delete(`http://localhost:1234/api/workflows/${id}`);
//             navigate("/admin/workflows");
//         } catch (err) {
//             setError("Failed to delete: " + err.message);
//         } finally {
//             setLoading(false);
//             setMenuModal(false);
//         }
//     };

//     return (
//         <>
//             {/* Header */}
//             <div className="header-container">
//                 <div className="header-container-heading">
//                     <h1 className="tasks-heading">{id ? "Edit Workflow" : "Create Workflow"}</h1>
//                 </div>
//                 <div className="header-container-buttons">
//                     <button className="save-button" onClick={handleSave} disabled={loading}>
//                         {loading ? "Saving..." : "Save"}
//                     </button>
//                     <button className="edit-button" onClick={() => setIsReadOnly(!isReadOnly)} disabled={loading}>
//                         {isReadOnly ? "Edit" : "View"}
//                     </button>
//                     <div className="more-options-container">
//                         <button className="more-options-button" onClick={() => setMenuModal(prev => !prev)}>
//                             <ChevronDown size={20} />
//                         </button>
//                         {menuModal && (
//                             <div className="menu-modal-container">
//                                 <div className="menu-modal">
//                                     <ul className="menu-modal-list">
//                                         {id && <li onClick={handleDelete}>Delete</li>}
//                                         <li>Print Preview</li>
//                                         <li>Change Owner</li>
//                                     </ul>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {loading && <p>Loading...</p>}
//             {error && <p className="error">{error}</p>}

//             {/* Business Object */}
//             <div className="business-object-container">
//                 <div className="business-object-heading"><h1>Business Object</h1></div>
//                 <div className="business-object-form">
//                     <form>
//                         <div className="form-group from">
//                             <label htmlFor="businessObject">Business Object</label>
//                             <select
//                                 id="businessObject"
//                                 disabled={isReadOnly}
//                                 value={workflow.businessObject}
//                                 onChange={(e) => handleInputChange(e, "businessObject")}
//                             >
//                                 <option value="">Select Business Object</option>
//                                 {businessObjects.map(obj => (
//                                     <option key={obj} value={obj}>{obj}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="form-group name">
//                             <label htmlFor="name">Name</label>
//                             <input
//                                 type="text"
//                                 id="name"
//                                 placeholder="Workflow Name"
//                                 readOnly={isReadOnly}
//                                 value={workflow.name}
//                                 onChange={(e) => handleInputChange(e, "name")}
//                             />
//                         </div>
//                         <div className="form-group description">
//                             <label htmlFor="description">Description</label>
//                             <input
//                                 type="text"
//                                 id="description"
//                                 placeholder="Workflow Description"
//                                 readOnly={isReadOnly}
//                                 value={workflow.description}
//                                 onChange={(e) => handleInputChange(e, "description")}
//                             />
//                         </div>
//                         <div className="form-group timing">
//                             <label htmlFor="timing">Timing</label>
//                             <select
//                                 id="timing"
//                                 disabled={isReadOnly}
//                                 value={workflow.timing}
//                                 onChange={(e) => handleInputChange(e, "timing")}
//                             >
//                                 <option value="">Select Timing</option>
//                                 {timingOptions.map(t => <option key={t} value={t}>{t}</option>)}
//                             </select>
//                         </div>
//                     </form>
//                 </div>
//             </div>

//             {/* Conditions */}
//             <div className="conditions-container">
//                 <div className="conditions-heading">
//                     <div className="left"><h1>Conditions</h1></div>
//                 </div>

//                 {workflow.conditionGroups.map((group) => (
//                     <div key={group.id} className="condition-group">
//                         <div className="condition-group-header">
//                             <h2>Execute if the following conditions are met</h2>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                 <select
//                                     disabled={isReadOnly}
//                                     value={workflow.conditionLogic}
//                                     onChange={(e) => handleInputChange(e, "conditionLogic")}
//                                 >
//                                     <option value="">Select Logic</option>
//                                     {conditionLogicOptions.map(l => <option key={l} value={l}>{l}</option>)}
//                                 </select>

//                                 {!isReadOnly && (
//                                     <button className="add-condition-button" onClick={() => addCondition(group.id)}>
//                                         <Plus size={16} /> Add Condition
//                                     </button>
//                                 )}

//                                 {!isReadOnly && workflow.conditionGroups.length > 1 && (
//                                     <button className="delete-group-button" onClick={() => removeConditionGroup(group.id)}>
//                                         <Trash2 size={16} />
//                                     </button>
//                                 )}
//                             </div>
//                         </div>

//                         <div className="conditions-form">
//                             {group.conditions.map((condition) => (
//                                 <div key={condition.id} className="condition-row">
//                                     {/* Field */}
//                                     <div className="form-group fields">
//                                         <label>Field</label>
//                                         <select
//                                             disabled={isReadOnly || fieldLoading}
//                                             value={condition.field}
//                                             onChange={(e) => updateCondition(group.id, condition.id, "field", e.target.value)}
//                                         >
//                                             <option value="">
//                                                 {fieldLoading ? "Loading fields..." : "Select Field"}
//                                             </option>
//                                             {fieldOptions.map(f => <option key={f} value={f}>{f}</option>)}
//                                         </select>
//                                     </div>

//                                     {/* Operator */}
//                                     <div className="form-group compareoperator">
//                                         <label>Operator</label>
//                                         <select
//                                             disabled={isReadOnly}
//                                             value={condition.operator}
//                                             onChange={(e) => updateCondition(group.id, condition.id, "operator", e.target.value)}
//                                         >
//                                             <option value="">Select</option>
//                                             {operatorOptions.map(op => <option key={op} value={op}>{op}</option>)}
//                                         </select>
//                                     </div>

//                                     {/* With Type */}
//                                     <div className="form-group with">
//                                         <label>With</label>
//                                         <select
//                                             disabled={isReadOnly}
//                                             value={condition.withType || "Value"}
//                                             onChange={(e) => updateCondition(group.id, condition.id, "withType", e.target.value)}
//                                         >
//                                             <option value="Value">Value</option>
//                                             <option value="Field">Field</option>
//                                         </select>
//                                     </div>

//                                     {/* Value */}
//                                     <div className="form-group value">
//                                         <label>{condition.withType === "Field" ? "Field" : "Value"}</label>
//                                         <input
//                                             type="text"
//                                             placeholder={condition.withType === "Field" ? "Enter field name" : "Enter value"}
//                                             readOnly={isReadOnly}
//                                             value={condition.value}
//                                             onChange={(e) => updateCondition(group.id, condition.id, "value", e.target.value)}
//                                         />
//                                     </div>

//                                     {/* Delete */}
//                                     {!isReadOnly && group.conditions.length > 1 && (
//                                         <button className="delete-condition-button" onClick={() => removeCondition(group.id, condition.id)}>
//                                             <Trash2 size={16} />
//                                         </button>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 ))}

//                 {/* Add Group */}
//                 {/* {!isReadOnly && (
//                     <button className="add-group-button" onClick={addConditionGroup}>
//                         <Plus size={16} /> Add Condition Group
//                     </button>
//                 )} */}
//             </div>

//             {/* Actions */}
//             <div className="actions-container">
//                 <div className="actions-heading"><h1>Actions</h1></div>
//                 <div className="actions-form">
//                     <form>
//                         <div className="form-group ruletype">
//                             <label htmlFor="ruletype">Rule Type</label>
//                             <select
//                                 id="ruletype"
//                                 disabled={isReadOnly}
//                                 value={workflow.action.ruleType}
//                                 onChange={(e) => handleActionChange(e, "ruleType")}
//                             >
//                                 <option value="">Select Rule Type</option>
//                                 {ruleTypeOptions.map(r => <option key={r} value={r}>{r}</option>)}
//                             </select>
//                         </div>
//                         <div className="form-group cancel">
//                             <label htmlFor="cancel">Cancel</label>
//                             <select
//                                 id="cancel"
//                                 disabled={isReadOnly}
//                                 value={workflow.action.cancel}
//                                 onChange={(e) => handleActionChange(e, "cancel")}
//                             >
//                                 <option value="">Select</option>
//                                 {cancelOptions.map(c => <option key={c} value={c}>{c}</option>)}
//                             </select>
//                         </div>

//                         {/* <div className="form-group businessroledetermination">
//                             <label htmlFor="businessroledetermination">
//                                 Business Role Determination
//                             </label>
//                             <select
//                                 id="businessroledetermination"
//                                 disabled={isReadOnly}
//                                 value={workflow.action.businessRoleDetermination}
//                                 onChange={(e) => handleActionChange(e, "businessRoleDetermination")}
//                             >
//                                 <input value="">Select Business Role Determination</input>
//                                 {businessRoleDeterminationOptions.map((role) => (
//                                     <option key={role} value={role}>
//                                         {role}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div> */}

//                         <div className="form-group businessroledetermination">
//   <label htmlFor="businessroledetermination">
//     Business Role Determination
//   </label>
//   <input
//     type="text"
//     id="businessroledetermination"
//     disabled={isReadOnly}
//     value={workflow.action.businessRoleDetermination || ''}
//     onChange={(e) => handleActionChange(e, "businessRoleDetermination")}
//     placeholder="Enter Business Role Determination"
//   />
// </div>

//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default CreateOrEditWorkflow;

// src/components/CreateOrEditWorkflow.jsx
import { useState, useEffect } from "react";
import { Plus, ChevronDown, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./CreateOrEditWorkflow.css";

const BASE_URL_AC = import.meta.env.VITE_API_BASE_URL_AC;
const BASE_URL_LM = import.meta.env.VITE_API_BASE_URL_LM;
const BASE_URL_AM = import.meta.env.VITE_API_BASE_URL_AM;
const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;

const CreateOrEditWorkflow = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [menuModal, setMenuModal] = useState(false);
	const [isReadOnly, setIsReadOnly] = useState(!!id);
	const [fieldOptions, setFieldOptions] = useState([]);
	const [fieldLoading, setFieldLoading] = useState(false);

	const [workflow, setWorkflow] = useState({
		name: "",
		description: "",
		businessObject: "",
		timing: "",
		conditionLogic: "",
		conditionGroups: [
			{
				id: 1,
				conditions: [
					{
						id: 1,
						field: "",
						operator: "",
						value: "",
						withType: "Value",
					},
				],
			},
		],
		action: {
			ruleType: "",
			cancel: "",
			// Notification fields
			subject: "",
			sendOn: "Day",
			businessObjectRef: "",
			expireAfter: "",
			status: "",
			businessRole: "",
			afterOnBefore: "",
			// Email fields
			senderName: "",
			senderDomain: "",
			emailAddress: "",
			// Field Update fields
			conditionNotMet: "",
			businessRoleDetermination: "",
		},
	});

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const businessObjects = [
		"Account",
		"Activity Task",
		"Appointment",
		"Assignment",
		"Campaign",
		"Contact",
		"Content Transfer",
		"Deal Registration",
		"E-mail",
		"Incident",
		"Individual Customer",
		"Leads",
		"Opportunity",
		"Phone Call",
		"Sales Data",
		"Sales Lead",
		"Sales Order",
		"Sales Quote",
		"Service E-mail",
		"Social Media Message Import Run",
		"Ticket",
		"Time Report",
		"Transparent Request",
		"Visit",
	];

	const timingOptions = ["On Create Only", "On Every Save", "Scheduled"];
	const conditionLogicOptions = [
		"All conditions are met",
		"Any condition is met",
	];
	const operatorOptions = [
		"Equal to",
		"Not equal to",
		"Greater than",
		"Less than",
		"Contains",
	];
	const ruleTypeOptions = ["Email", "Notification", "Field Update"];
	const cancelOptions = ["Yes", "No"];

	const apiMap = {
		Contact: `${BASE_URL_AC}/contact/`,
		Account: `${BASE_URL_AC}/account/`,
		Ticket: `${BASE_URL_SER}/tickets`,
		"E-mail": `${BASE_URL_AM}/emails`,
		"Activity Task": `${BASE_URL_AM}/tasks`,
		Leads: `${BASE_URL_LM}/leads`,
	};

	// Fetch workflow on edit
	useEffect(() => {
		if (id) {
			const fetchWorkflow = async () => {
				setLoading(true);
				try {
					const response = await axios.get(
						`http://localhost:1234/api/workflows/${id}`
					);
					const data = response.data;

					data.conditionGroups = data.conditionGroups.map(
						(group, gIdx) => ({
							id: gIdx + 1,
							conditions: group.conditions.map((cond, cIdx) => ({
								id: cIdx + 1,
								field: cond.field || "",
								operator: cond.operator || "",
								value: cond.value || "",
								withType: cond.withType || "Value",
							})),
						})
					);

					setWorkflow((prev) => ({ ...prev, ...data }));
					if (data.businessObject && apiMap[data.businessObject]) {
						fetchFields(data.businessObject);
					}
				} catch (err) {
					setError("Failed to fetch workflow: " + err.message);
				} finally {
					setLoading(false);
				}
			};
			fetchWorkflow();
		}
	}, [id]);

	const fetchFields = async (businessObject) => {
		const apiUrl = apiMap[businessObject];
		if (!apiUrl) {
			setFieldOptions([]);
			return;
		}

		setFieldLoading(true);
		try {
			const response = await axios.get(apiUrl);
			const data = Array.isArray(response.data)
				? response.data[0]
				: response.data;
			if (data && typeof data === "object") {
				const fields = Object.keys(data).filter(
					(key) => key !== "id" && key !== "_id"
				);
				setFieldOptions(fields);
			} else {
				setFieldOptions([]);
			}
		} catch (err) {
			Console.error("Failed to fetch fields:", err);
			setFieldOptions([]);
		} finally {
			setFieldLoading(false);
		}
	};

	useEffect(() => {
		if (workflow.businessObject) {
			fetchFields(workflow.businessObject);
		} else {
			setFieldOptions([]);
		}
	}, [workflow.businessObject]);

	const handleInputChange = (e, field) => {
		const value = e.target.value;
		setWorkflow((prev) => ({ ...prev, [field]: value }));
		if (field === "businessObject") {
			setWorkflow((prev) => ({
				...prev,
				conditionGroups: [
					{
						id: 1,
						conditions: [
							{
								id: 1,
								field: "",
								operator: "",
								value: "",
								withType: "Value",
							},
						],
					},
				],
			}));
		}
	};

	const handleActionChange = (e, field) => {
		const value = e.target.value;
		setWorkflow((prev) => ({
			...prev,
			action: { ...prev.action, [field]: value },
		}));
	};

	const addCondition = (groupId) => {
		setWorkflow((prev) => ({
			...prev,
			conditionGroups: prev.conditionGroups.map((group) =>
				group.id === groupId
					? {
							...group,
							conditions: [
								...group.conditions,
								{
									id: group.conditions.length + 1,
									field: "",
									operator: "",
									value: "",
									withType: "Value",
								},
							],
					  }
					: group
			),
		}));
	};

	const removeCondition = (groupId, conditionId) => {
		setWorkflow((prev) => ({
			...prev,
			conditionGroups: prev.conditionGroups
				.map((group) =>
					group.id === groupId
						? {
								...group,
								conditions: group.conditions.filter(
									(c) => c.id !== conditionId
								),
						  }
						: group
				)
				.filter((g) => g.conditions.length > 0),
		}));
	};

	const removeConditionGroup = (groupId) => {
		setWorkflow((prev) => ({
			...prev,
			conditionGroups: prev.conditionGroups.filter(
				(g) => g.id !== groupId
			),
		}));
	};

	const updateCondition = (groupId, conditionId, field, value) => {
		setWorkflow((prev) => ({
			...prev,
			conditionGroups: prev.conditionGroups.map((group) =>
				group.id === groupId
					? {
							...group,
							conditions: group.conditions.map((c) =>
								c.id === conditionId
									? { ...c, [field]: value }
									: c
							),
					  }
					: group
			),
		}));
	};

	const handleSave = async () => {
		setLoading(true);
		setError(null);
		try {
			const payload = {
				...workflow,
				conditionGroups: workflow.conditionGroups.map((group) => ({
					conditions: group.conditions.map((c) => ({
						field: c.field,
						operator: c.operator,
						value: c.value,
						withType: c.withType,
					})),
				})),
			};

			if (id) {
				await axios.put(
					`http://localhost:1234/api/workflows/${id}`,
					payload
				);
			} else {
				await axios.post(
					"http://localhost:1234/api/workflows",
					payload
				);
			}
			navigate("/admin/workflows");
		} catch (err) {
			setError("Failed to save: " + err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!id) return;
		setLoading(true);
		try {
			await axios.delete(`http://localhost:1234/api/workflows/${id}`);
			navigate("/admin/workflows");
		} catch (err) {
			setError("Failed to delete: " + err.message);
		} finally {
			setLoading(false);
			setMenuModal(false);
		}
	};

	return (
		<>
			{/* Header */}
			<div className="header-container">
				<div className="header-container-heading">
					<h1 className="tasks-heading">
						{id ? "Edit Workflow" : "Create Workflow"}
					</h1>
				</div>
				<div className="header-container-buttons">
					<button
						className="save-button"
						onClick={handleSave}
						disabled={loading}
					>
						{loading ? "Saving..." : "Save"}
					</button>
					<button
						className="edit-button"
						onClick={() => setIsReadOnly(!isReadOnly)}
						disabled={loading}
					>
						{isReadOnly ? "Edit" : "View"}
					</button>
					<div className="more-options-container">
						<button
							className="more-options-button"
							onClick={() => setMenuModal((prev) => !prev)}
						>
							<ChevronDown size={20} />
						</button>
						{menuModal && (
							<div className="menu-modal-container">
								<div className="menu-modal">
									<ul className="menu-modal-list">
										{id && (
											<li onClick={handleDelete}>
												Delete
											</li>
										)}
										<li>Print Preview</li>
										<li>Change Owner</li>
									</ul>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{loading && <p className="loading-text">Loading...</p>}
			{error && <p className="error-text">{error}</p>}

			{/* Business Object */}
			<div className="business-object-container">
				<div className="section-heading">
					<h2>Business Object</h2>
				</div>
				<form className="business-object-form">
					<div className="form-group">
						<label htmlFor="businessObject">Business Object</label>
						<select
							id="businessObject"
							disabled={isReadOnly}
							value={workflow.businessObject}
							onChange={(e) =>
								handleInputChange(e, "businessObject")
							}
						>
							<option value="">Select Business Object</option>
							{businessObjects.map((obj) => (
								<option key={obj} value={obj}>
									{obj}
								</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="name">Name</label>
						<input
							type="text"
							id="name"
							placeholder="Workflow Name"
							readOnly={isReadOnly}
							value={workflow.name}
							onChange={(e) => handleInputChange(e, "name")}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="description">Description</label>
						<input
							type="text"
							id="description"
							placeholder="Workflow Description"
							readOnly={isReadOnly}
							value={workflow.description}
							onChange={(e) =>
								handleInputChange(e, "description")
							}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="timing">Timing</label>
						<select
							id="timing"
							disabled={isReadOnly}
							value={workflow.timing}
							onChange={(e) => handleInputChange(e, "timing")}
						>
							<option value="">Select Timing</option>
							{timingOptions.map((t) => (
								<option key={t} value={t}>
									{t}
								</option>
							))}
						</select>
					</div>
				</form>
			</div>

			{/* Conditions */}
			<div className="conditions-container">
				<div className="section-heading">
					<h2>Conditions</h2>
				</div>

				{workflow.conditionGroups.map((group) => (
					<div key={group.id} className="condition-group">
						<div className="condition-group-header">
							<h3>Execute if the following conditions are met</h3>
							<div className="header-controls">
								<select
									disabled={isReadOnly}
									value={workflow.conditionLogic}
									onChange={(e) =>
										handleInputChange(e, "conditionLogic")
									}
								>
									<option value="">Select Logic</option>
									{conditionLogicOptions.map((l) => (
										<option key={l} value={l}>
											{l}
										</option>
									))}
								</select>

								{!isReadOnly && (
									<button
										className="add-btn"
										onClick={() => addCondition(group.id)}
									>
										<Plus size={16} /> Add Condition
									</button>
								)}

								{!isReadOnly &&
									workflow.conditionGroups.length > 1 && (
										<button
											className="delete-btn"
											onClick={() =>
												removeConditionGroup(group.id)
											}
										>
											<Trash2 size={16} />
										</button>
									)}
							</div>
						</div>

						<div className="conditions-list">
							{group.conditions.map((condition) => (
								<div
									key={condition.id}
									className="condition-row"
								>
									<div className="form-group">
										<label>Field</label>
										<select
											disabled={
												isReadOnly || fieldLoading
											}
											value={condition.field}
											onChange={(e) =>
												updateCondition(
													group.id,
													condition.id,
													"field",
													e.target.value
												)
											}
										>
											<option value="">
												{fieldLoading
													? "Loading..."
													: "Select Field"}
											</option>
											{fieldOptions.map((f) => (
												<option key={f} value={f}>
													{f}
												</option>
											))}
										</select>
									</div>

									<div className="form-group">
										<label>Operator</label>
										<select
											disabled={isReadOnly}
											value={condition.operator}
											onChange={(e) =>
												updateCondition(
													group.id,
													condition.id,
													"operator",
													e.target.value
												)
											}
										>
											<option value="">Select</option>
											{operatorOptions.map((op) => (
												<option key={op} value={op}>
													{op}
												</option>
											))}
										</select>
									</div>

									<div className="form-group">
										<label>With</label>
										<select
											disabled={isReadOnly}
											value={
												condition.withType || "Value"
											}
											onChange={(e) =>
												updateCondition(
													group.id,
													condition.id,
													"withType",
													e.target.value
												)
											}
										>
											<option value="Value">Value</option>
											<option value="Field">Field</option>
										</select>
									</div>

									<div className="form-group">
										<label>
											{condition.withType === "Field"
												? "Field"
												: "Value"}
										</label>
										<input
											type="text"
											placeholder={
												condition.withType === "Field"
													? "Enter field"
													: "Enter value"
											}
											readOnly={isReadOnly}
											value={condition.value}
											onChange={(e) =>
												updateCondition(
													group.id,
													condition.id,
													"value",
													e.target.value
												)
											}
										/>
									</div>

									{!isReadOnly &&
										group.conditions.length > 1 && (
											<button
												className="delete-btn"
												onClick={() =>
													removeCondition(
														group.id,
														condition.id
													)
												}
											>
												<Trash2 size={16} />
											</button>
										)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* Actions */}
			<div className="actions-container">
				<div className="section-heading">
					<h2>Actions</h2>
				</div>
				<form className="actions-form">
					<div className="form-group">
						<label htmlFor="ruletype">Rule Type</label>
						<select
							id="ruletype"
							disabled={isReadOnly}
							value={workflow.action.ruleType}
							onChange={(e) => handleActionChange(e, "ruleType")}
						>
							<option value="">Select Rule Type</option>
							{ruleTypeOptions.map((r) => (
								<option key={r} value={r}>
									{r}
								</option>
							))}
						</select>
					</div>

					{/* === NOTIFICATION === */}
					{workflow.action.ruleType === "Notification" && (
						<div className="action-panel notification-panel">
							<div className="form-row">
								<div className="form-group">
									<label>Subject</label>
									<input
										type="text"
										placeholder="Enter subject"
										readOnly={isReadOnly}
										value={workflow.action.subject || ""}
										onChange={(e) =>
											handleActionChange(e, "subject")
										}
									/>
								</div>
								<div className="form-group">
									<label>Template file</label>
									<div className="file-input-group">
										<input
											type="text"
											readOnly
											placeholder="No file chosen"
										/>
										<button
											type="button"
											disabled={isReadOnly}
										>
											Browse
										</button>
									</div>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Send Notification</label>
									<div className="radio-group">
										<label>
											<input
												type="radio"
												name="sendOn"
												value="Day"
												checked={
													workflow.action.sendOn ===
													"Day"
												}
												onChange={(e) =>
													handleActionChange(
														e,
														"sendOn"
													)
												}
												disabled={isReadOnly}
											/>{" "}
											Day
										</label>
										<label>
											<input
												type="radio"
												name="sendOn"
												value="on"
												checked={
													workflow.action.sendOn ===
													"on"
												}
												onChange={(e) =>
													handleActionChange(
														e,
														"sendOn"
													)
												}
												disabled={isReadOnly}
											/>{" "}
											on
										</label>
										<input
											type="text"
											placeholder="Business object"
											readOnly={isReadOnly}
											value={
												workflow.action
													.businessObjectRef || ""
											}
											onChange={(e) =>
												handleActionChange(
													e,
													"businessObjectRef"
												)
											}
											style={{ width: "140px" }}
										/>
									</div>
								</div>
								<div className="form-group">
									<label>Expire After</label>
									<select
										disabled={isReadOnly}
										value={
											workflow.action.expireAfter || ""
										}
										onChange={(e) =>
											handleActionChange(e, "expireAfter")
										}
									>
										<option value="">Select</option>
										<option value="1 day">1 day</option>
										<option value="7 days">7 days</option>
										<option value="30 days">30 days</option>
									</select>
								</div>
							</div>

							<div className="form-group">
								<label>Status</label>
								<select
									disabled={isReadOnly}
									value={workflow.action.status || ""}
									onChange={(e) =>
										handleActionChange(e, "status")
									}
								>
									<option value="">Select</option>
									<option value="Open">Open</option>
									<option value="Closed">Closed</option>
									<option value="In-progress">
										In-progress
									</option>
								</select>
							</div>

							<div className="form-group">
								<label>Recipient determination</label>
								<div className="add-determination">
									<button type="button" disabled={isReadOnly}>
										+ Add Determination
									</button>
									<span className="hint">
										Click Add Determination to have the
										system determine one or more recipients
										based on the business object.
									</span>
								</div>
								<select
									disabled={isReadOnly}
									value={workflow.action.businessRole || ""}
									onChange={(e) =>
										handleActionChange(e, "businessRole")
									}
									className="role-select"
								>
									<option value="">Business roles</option>
									<option value="Internal sales">
										Internal sales
									</option>
									<option value="Approver">Approver</option>
									<option value="STD Sales">STD Sales</option>
									<option value="STD CS">STD CS</option>
								</select>
							</div>

							<div className="form-group">
								<label>After On Before</label>
								<input
									type="text"
									readOnly={isReadOnly}
									value={workflow.action.afterOnBefore || ""}
									onChange={(e) =>
										handleActionChange(e, "afterOnBefore")
									}
								/>
							</div>
						</div>
					)}

					{/* === EMAIL === */}
					{workflow.action.ruleType === "Email" && (
						<div className="action-panel email-panel">
							<div className="form-row">
								<div className="form-group">
									<label>Subject</label>
									<input
										type="text"
										placeholder="Enter subject"
										readOnly={isReadOnly}
										value={workflow.action.subject || ""}
										onChange={(e) =>
											handleActionChange(e, "subject")
										}
									/>
								</div>
								<div className="form-group">
									<label>Sender name</label>
									<input
										type="text"
										placeholder="Enter sender name"
										readOnly={isReadOnly}
										value={workflow.action.senderName || ""}
										onChange={(e) =>
											handleActionChange(e, "senderName")
										}
									/>
								</div>
							</div>

							<div className="form-row">
								<div className="form-group">
									<label>Template file</label>
									<div className="file-input-group">
										<input
											type="text"
											readOnly
											placeholder="No file chosen"
										/>
										<button
											type="button"
											disabled={isReadOnly}
										>
											Browse
										</button>
									</div>
								</div>
								<div className="form-group">
									<label>Sender Domain (email)</label>
									<input
										type="email"
										placeholder="sender@domain.com"
										readOnly={isReadOnly}
										value={
											workflow.action.senderDomain || ""
										}
										onChange={(e) =>
											handleActionChange(
												e,
												"senderDomain"
											)
										}
									/>
								</div>
							</div>

							<div className="form-group">
								<label>Status</label>
								<select
									disabled={isReadOnly}
									value={workflow.action.status || ""}
									onChange={(e) =>
										handleActionChange(e, "status")
									}
								>
									<option value="">Select</option>
									<option value="Open">Open</option>
									<option value="Closed">Closed</option>
									<option value="In-progress">
										In-progress
									</option>
								</select>
							</div>

							<div className="form-group">
								<label>Add E-Mail address</label>
								<div className="email-add-group">
									<input
										type="email"
										placeholder="xyz@gmail.com"
										readOnly={isReadOnly}
										value={
											workflow.action.emailAddress || ""
										}
										onChange={(e) =>
											handleActionChange(
												e,
												"emailAddress"
											)
										}
									/>
									<button type="button" disabled={isReadOnly}>
										+ Add E-Mail address
									</button>
								</div>
							</div>

							<div className="form-group">
								<label>Recipient determination</label>
								<div className="add-determination">
									<button type="button" disabled={isReadOnly}>
										+ Add Determination
									</button>
									<span className="hint">
										Click Add Determination to have the
										system determine one or more recipients.
									</span>
								</div>
								<select
									disabled={isReadOnly}
									value={workflow.action.businessRole || ""}
									onChange={(e) =>
										handleActionChange(e, "businessRole")
									}
									className="role-select"
								>
									<option value="">Business roles</option>
									<option value="Internal sales">
										Internal sales
									</option>
									<option value="Approver">Approver</option>
									<option value="STD Sales">STD Sales</option>
									<option value="STD CS">STD CS</option>
								</select>
							</div>
						</div>
					)}

					{/* === FIELD UPDATE === */}
					{workflow.action.ruleType === "Field Update" && (
						<div className="action-panel field-update-panel">
							<div className="form-group">
								<label>Condition not met</label>
								<select
									disabled={isReadOnly}
									value={
										workflow.action.conditionNotMet || ""
									}
									onChange={(e) =>
										handleActionChange(e, "conditionNotMet")
									}
								>
									<option value="">Select</option>
									<option value="NEVER">NEVER</option>
								</select>
							</div>

							<div className="form-group">
								<label>Cancellation of task</label>
								<select
									disabled={isReadOnly}
									value={workflow.action.cancel || ""}
									onChange={(e) =>
										handleActionChange(e, "cancel")
									}
								>
									<option value="">Select</option>
									{cancelOptions.map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label>Business Role Determination</label>
								<input
									type="text"
									placeholder="..."
									readOnly={isReadOnly}
									value={
										workflow.action
											.businessRoleDetermination || ""
									}
									onChange={(e) =>
										handleActionChange(
											e,
											"businessRoleDetermination"
										)
									}
								/>
							</div>
						</div>
					)}
				</form>
			</div>
		</>
	);
};

export default CreateOrEditWorkflow;
