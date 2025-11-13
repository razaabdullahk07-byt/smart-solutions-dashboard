// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSProcess = () => {
//   const [processes, setProcesses] = useState([]);
//   const [filteredProcesses, setFilteredProcesses] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//   const [formData, setFormData] = useState({
//     ccode: "",
//     cname: "",
//     isActive: true,
//     offcode: "0101"
//   });

//   const tableName = "comProcess";
//   const API_BASE = "http://192.168.100.113:8081/api";

//   // ✅ Helper to fetch JSON safely
//   const fetchJson = async (url, options = {}) => {
//     const res = await fetch(url, {
//       headers: { "Content-Type": "application/json", ...options.headers },
//       ...options,
//     });
//     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//     return await res.json();
//   };

//   // ✅ Fetch all processes
//   const fetchProcesses = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "0101" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setProcesses(rows);
//         setFilteredProcesses(rows);
//       } else {
//         setError("Failed to load process data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProcesses();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = processes;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((process) =>
//         ["ccode", "cname"].some(
//           (key) =>
//             process[key] &&
//             process[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((process) => {
//         const activeValue =
//           process.isActive ??
//           process.IsActive ??
//           process.ISACTIVE ??
//           process.Active ??
//           process.ACTIVE ??
//           false;
//         const itemActive =
//           typeof activeValue === "boolean"
//             ? activeValue
//             : activeValue === "true" ||
//             activeValue === "1" ||
//             activeValue === 1;
//         return itemActive === isActive;
//       });
//     }

//     setFilteredProcesses(filtered);
//   }, [searchTerm, activeFilter, processes]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ✅ Helper to get next available process code
//   const getNextCode = () => {
//     if (!processes || processes.length === 0) return "1";

//     const codes = processes
//       .map((r) => parseInt(r.ccode || r.CCODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "1";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(1, "0"); // 001, 002, 003...
//   };

//   // ✅ Open form for new
//   const handleNew = () => {
//     setFormData({
//       ccode: getNextCode(),  // ✅ Auto-generate ccode
//       cname: "",
//       isActive: true,        // ✅ Default active
//       offcode: "0101",
//     });
//     setEditMode("new");
//     setIsEditing(true);
//   };


//   // ✅ Open form for edit
//   const handleEdit = (process) => {
//     setFormData({
//       ccode: process.ccode || "",
//       cname: process.cname || "",
//       isActive:
//         process.isActive === true ||
//         process.isActive === "true" ||
//         process.isActive === 1 ||
//         process.isActive === "1" ||
//         process.ACTIVE === true ||
//         process.ACTIVE === 1 ||
//         false,
//       offcode: process.offcode || "0101"
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       // Validate required fields
//       if (!formData.ccode || !formData.cname) {
//         setError("Please fill in all required fields");
//         return;
//       }

//       const payload =
//         editMode === "edit"
//           ? {
//             tableName,
//             data: {
//               cname: formData.cname,
//               isActive: formData.isActive,
//               offcode: formData.offcode
//             },
//             where: { ccode: formData.ccode },
//           }
//           : {
//             tableName,
//             data: {
//               ccode: formData.ccode,
//               cname: formData.cname,
//               isActive: formData.isActive,
//               offcode: formData.offcode
//             },
//           };

//       const url =
//         editMode === "edit"
//           ? `${API_BASE}/update-table-data`
//           : `${API_BASE}/insert-table-data`;

//       const res = await fetchJson(url, {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       if (res.success) {
//         await fetchProcesses();
//         setIsEditing(false);
//         setError(null);
//       } else {
//         setError("❌ Operation failed: " + (res.error || "Unknown error"));
//       }
//     } catch (err) {
//       setError("❌ Error: " + err.message);
//     }
//   };

//   // ✅ Cancel editing
//   const handleCancel = () => {
//     setIsEditing(false);
//     setFormData({
//       ccode: "",
//       cname: "",
//       isActive: true,
//       offcode: "0101"
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Process Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading processes...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Process Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Process" : "Add New Process"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Process Code *</label>
//               <input
//                 type="text"
//                 name="ccode"
//                 value={formData.ccode}
//                 onChange={handleInputChange}
//                 disabled={editMode === "edit"}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Process Name *</label>
//               <input
//                 type="text"
//                 name="cname"
//                 value={formData.cname}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group checkbox-container">
//               <label className="checkbox-label">
//                 <input
//                   type="checkbox"
//                   name="isActive"
//                   checked={formData.isActive}
//                   onChange={handleInputChange}
//                   className="modern-checkbox"
//                 />
//                 <span className="checkmark"></span>
//                 Active
//               </label>
//             </div>

//             <div className="form-group">
//               <label>Office Code</label>
//               <input
//                 type="text"
//                 name="offcode"
//                 value={formData.offcode}
//                 onChange={handleInputChange}
//                 className="modern-input"
//                 disabled
//               />
//             </div>
//           </div>

//           <div className="form-actions">
//             <button className="btn save" onClick={handleSave}>
//               <FaSave /> {editMode === "edit" ? "Update" : "Save"}
//             </button>
//             <button className="btn cancel" onClick={handleCancel}>
//               <FaTimes /> Cancel
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Toolbar */}
//           <div className="category-toolbar glassmorphism">
//             <div className="search-box">
//               <FaSearch className="search-icon" />
//               <input
//                 type="text"
//                 placeholder="Search by Code or Name..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="modern-input"
//               />
//             </div>

//             <div className="filter-buttons">
//               <span>Status:</span>
//               <button
//                 className={activeFilter === "all" ? "btn-filter active" : "btn-filter"}
//                 onClick={() => setActiveFilter("all")}
//               >
//                 All
//               </button>
//               <button
//                 className={activeFilter === "active" ? "btn-filter active" : "btn-filter"}
//                 onClick={() => setActiveFilter("active")}
//               >
//                 Active
//               </button>
//               <button
//                 className={activeFilter === "inactive" ? "btn-filter active" : "btn-filter"}
//                 onClick={() => setActiveFilter("inactive")}
//               >
//                 Inactive
//               </button>
//             </div>

//             <button className="btn new" onClick={handleNew}>
//               <FaPlus /> New Process
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Process Code</div>
//               <div className="header-cell">Process Name</div>
//               <div className="header-cell center">Status</div>
//               {/* <div className="header-cell">Office Code</div> */}
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredProcesses.length > 0 ? (
//                 filteredProcesses.map((process, idx) => {
//                   const activeValue =
//                     process.isActive ??
//                     process.IsActive ??
//                     process.ISACTIVE ??
//                     process.Active ??
//                     process.ACTIVE ??
//                     false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" ||
//                       activeValue === "1" ||
//                       activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{process.ccode}</div>
//                       <div className="list-cell">{process.cname}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                           {isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                       {/* <div className="list-cell">{process.offcode}</div> */}
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(process)}
//                           title="Edit"
//                         >
//                           <FaEdit />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="no-data">
//                   {searchTerm || activeFilter !== "all"
//                     ? "No processes match your search criteria"
//                     : "No processes found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSProcess;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSProcess = (props) => (
  <HRMSGenericManager 
    moduleType="process"
    {...props}
  />
);

export default HRMSProcess;