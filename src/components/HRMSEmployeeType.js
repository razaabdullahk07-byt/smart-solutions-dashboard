// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSEmployeeType = () => {
//   const [employeeTypes, setEmployeeTypes] = useState([]);
//   const [filteredEmployeeTypes, setFilteredEmployeeTypes] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//   const [formData, setFormData] = useState({
//     Code: "",
//     Name: "",
//     IsActive: false,
//   });

//   const tableName = "HRMSEmployeeType";
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

//   // ✅ Fetch all employee types
//   const fetchEmployeeTypes = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "0101" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setEmployeeTypes(rows);
//         setFilteredEmployeeTypes(rows);
//       } else {
//         setError("Failed to load employee type data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmployeeTypes();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = employeeTypes;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((et) =>
//         ["Code", "Name", "CODE", "NAME"].some(
//           (key) =>
//             et[key] &&
//             et[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((et) => {
//         const activeValue =
//           et.IsActive ??
//           et.isActive ??
//           et.ISACTIVE ??
//           et.Active ??
//           et.ACTIVE ??
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

//     setFilteredEmployeeTypes(filtered);
//   }, [searchTerm, activeFilter, employeeTypes]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ✅ Open form for new
//   // ✅ Helper to get next available code
//   const getNextCode = () => {
//     if (!employeeTypes || employeeTypes.length === 0) return "001";

//     const codes = employeeTypes
//       .map((c) => parseInt(c.Code || c.CODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "001";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(3, "0");
//   };
//   // ✅ Open form for new
//   const handleNew = () => {
//     setFormData({
//       Code: getNextCode(),  // <-- AUTO-GENERATED HERE
//       Name: "",
//       IsActive: true,       // default new records as active
//       IsOverTimeAllow: false,
//     });
//     setEditMode("new");
//     setIsEditing(true);
//   };
//   // ✅ Open form for edit
//   const handleEdit = (employeeType) => {
//     setFormData({
//       Code: employeeType.Code || employeeType.CODE || "",
//       Name: employeeType.Name || employeeType.NAME || "",
//       IsActive:
//         employeeType.IsActive === true ||
//         employeeType.IsActive === "true" ||
//         employeeType.IsActive === 1 ||
//         employeeType.IsActive === "1" ||
//         employeeType.ACTIVE === true ||
//         employeeType.ACTIVE === 1,
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       const payload =
//         editMode === "edit"
//           ? {
//             tableName,
//             data: {
//               Name: formData.Name,
//               IsActive: formData.IsActive,
//             },
//             where: { Code: formData.Code },
//           }
//           : {
//             tableName,
//             data: {
//               Code: formData.Code,
//               Name: formData.Name,
//               IsActive: formData.IsActive,
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
//         await fetchEmployeeTypes();
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
//       Code: "",
//       Name: "",
//       IsActive: false,
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Employee Type Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading employee types...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Employee Type Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Employee Type" : "Add New Employee Type"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Code *</label>
//               <input
//                 type="text"
//                 name="Code"
//                 value={formData.Code}
//                 onChange={handleInputChange}
//                 disabled={editMode === "edit"}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Name *</label>
//               <input
//                 type="text"
//                 name="Name"
//                 value={formData.Name}
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
//                   name="IsActive"
//                   checked={formData.IsActive}
//                   onChange={handleInputChange}
//                   className="modern-checkbox"
//                 />
//                 <span className="checkmark"></span>
//                 Active
//               </label>
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
//               <FaPlus /> New Employee Type
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Code</div>
//               <div className="header-cell">Name</div>
//               <div className="header-cell center">Status</div>
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredEmployeeTypes.length > 0 ? (
//                 filteredEmployeeTypes.map((et, idx) => {
//                   const activeValue =
//                     et.IsActive ??
//                     et.isActive ??
//                     et.ISACTIVE ??
//                     et.Active ??
//                     et.ACTIVE ??
//                     false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" ||
//                       activeValue === "1" ||
//                       activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{et.Code || et.CODE}</div>
//                       <div className="list-cell">{et.Name || et.NAME}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                           {isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(et)}
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
//                     ? "No employee types match your search criteria"
//                     : "No employee types found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSEmployeeType;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSEmployeeType = (props) => (
  <HRMSGenericManager 
    moduleType="employeetype"
    {...props}
  />
);

export default HRMSEmployeeType;