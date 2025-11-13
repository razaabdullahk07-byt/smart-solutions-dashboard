// import React, { useState, useEffect } from "react";
// import "./HRMSDepartment.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSDepartment = () => {
//   const [categories, setCategories] = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
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
//     PayrollGrossPayAccount: "",
//     PayrollNetPayAccount: "",
//   });

//   const tableName = "HRMSDepartment";
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

//   // ✅ Fetch all departments
//   const fetchDepartments = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "0101" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setCategories(rows);
//         setFilteredCategories(rows);
//       } else {
//         setError("Failed to load department data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDepartments();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = categories;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((d) =>
//         ["Code", "Name", "CODE", "NAME"].some(
//           (key) =>
//             d[key] &&
//             d[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((d) => {
//         const activeValue =
//           d.IsActive ??
//           d.isActive ??
//           d.ISACTIVE ??
//           d.Active ??
//           d.ACTIVE ??
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

//     setFilteredCategories(filtered);
//   }, [searchTerm, activeFilter, categories]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };
//   // ✅ Helper to get next available code
//   const getNextCode = () => {
//     if (!categories || categories.length === 0) return "001";

//     const codes = categories
//       .map((c) => parseInt(c.Code || c.CODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "001";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(3, "0");
//   };

//   // ✅ Open form for new
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
//   const handleEdit = (dept) => {
//     setFormData({
//       Code: dept.Code || dept.CODE || "",
//       Name: dept.Name || dept.NAME || "",
//       IsActive:
//         dept.IsActive === true ||
//         dept.IsActive === "true" ||
//         dept.IsActive === 1 ||
//         dept.IsActive === "1" ||
//         dept.ACTIVE === true ||
//         dept.ACTIVE === 1,
//       PayrollGrossPayAccount:
//         dept.PayrollGrossPayAccount ||
//         dept.PAYROLLGROSSPAYACCOUNT ||
//         dept.PayrollGrossAccount ||
//         "",
//       PayrollNetPayAccount:
//         dept.PayrollNetPayAccount ||
//         dept.PAYROLLNETPAYACCOUNT ||
//         dept.PayrollNetAccount ||
//         "",
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
//               IsActive: formData.IsActive, // ✅ stays boolean
//               PayrollGrossPayAccount: parseInt(formData.PayrollGrossPayAccount || "0", 10),
//               PayrollNetPayAccount: parseInt(formData.PayrollNetPayAccount || "0", 10),
//             },
//             where: { Code: formData.Code },
//           }
//           : {
//             tableName,
//             data: {
//               Code: formData.Code,
//               Name: formData.Name,
//               IsActive: formData.IsActive, // ✅ stays boolean
//               PayrollGrossPayAccount: parseInt(formData.PayrollGrossPayAccount || "0", 10),
//               PayrollNetPayAccount: parseInt(formData.PayrollNetPayAccount || "0", 10),
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
//         await fetchDepartments();
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
//       PayrollGrossPayAccount: "",
//       PayrollNetPayAccount: "",
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="HRMSDepartment-container">
//         <h2>Department Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading departments...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="HRMSDepartment-container">
//       <div className="header-section">
//         <h2>Department Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="HRMSDepartment-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Department" : "Add New Department"}</h3>

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

//           <div className="form-row">
//             <div className="form-group">
//               <label>Payroll Gross Pay Account</label>
//               <input
//                 type="number"
//                 name="PayrollGrossPayAccount"
//                 value={formData.PayrollGrossPayAccount}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Payroll Net Pay Account</label>
//               <input
//                 type="number"
//                 name="PayrollNetPayAccount"
//                 value={formData.PayrollNetPayAccount}
//                 onChange={handleInputChange}
//                 className="modern-input"
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
//           <div className="HRMSDepartment-toolbar glassmorphism">
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
//               <FaPlus /> New Department
//             </button>
//           </div>

//           {/* List */}
//           <div className="HRMSDepartment-list-container glassmorphism">
//             <div className="HRMSDepartment-list-header">
//               <div className="header-cell">Code</div>
//               <div className="header-cell">Name</div>
//               <div className="header-cell center">Status</div>
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="HRMSDepartment-list">
//               {filteredCategories.length > 0 ? (
//                 filteredCategories.map((d, idx) => {
//                   const activeValue =
//                     d.IsActive ??
//                     d.isActive ??
//                     d.ISACTIVE ??
//                     d.Active ??
//                     d.ACTIVE ??
//                     false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" ||
//                       activeValue === "1" ||
//                       activeValue === 1;

//                   return (
//                     <div key={idx} className="HRMSDepartment-item">
//                       <div className="list-cell">{d.Code || d.CODE}</div>
//                       <div className="list-cell">{d.Name || d.NAME}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                           {isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(d)}
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
//                     ? "No departments match your search criteria"
//                     : "No departments found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSDepartment;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSDepartment = (props) => (
  <HRMSGenericManager 
    moduleType="department"
    {...props}
  />
);

export default HRMSDepartment;