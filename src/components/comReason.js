// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSReason = () => {
//   const [reasons, setReasons] = useState([]);
//   const [filteredReasons, setFilteredReasons] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [codeTypeFilter, setCodeTypeFilter] = useState("all");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//   const [formData, setFormData] = useState({
//     ccode: "",
//     cname: "",
//     isActive: true,
//     codetype: "OTS",
//     offcode: "0101"
//   });

//   // Code type options
//   const codeTypeOptions = [
//     { value: "OTS", label: "OTS" },
//     { value: "RWR", label: "Rework Reason" },
//     { value: "RJR", label: "Reject Reason" }
//   ];

//   const tableName = "comReason";
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

//   // ✅ Fetch all reasons
//   const fetchReasons = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "0101" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setReasons(rows);
//         setFilteredReasons(rows);
//       } else {
//         setError("Failed to load reason data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReasons();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = reasons;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((reason) =>
//         ["ccode", "cname", "codetype"].some(
//           (key) =>
//             reason[key] &&
//             reason[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((reason) => {
//         const activeValue =
//           reason.isActive ??
//           reason.IsActive ??
//           reason.ISACTIVE ??
//           reason.Active ??
//           reason.ACTIVE ??
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

//     if (codeTypeFilter !== "all") {
//       filtered = filtered.filter((reason) => reason.codetype === codeTypeFilter);
//     }

//     setFilteredReasons(filtered);
//   }, [searchTerm, activeFilter, codeTypeFilter, reasons]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ✅ Helper to get next available code
//   // ✅ Helper to get next available reason code
//   const getNextCode = () => {
//     if (!reasons || reasons.length === 0) return "001";

//     const codes = reasons
//       .map((r) => parseInt(r.ccode || r.CCODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "001";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(3, "0");
//   };

//   // ✅ Open form for new
//   // ✅ Open form for new
//   const handleNew = () => {
//     setFormData({
//       ccode: getNextCode(),  // <-- AUTO-GENERATE ccode
//       cname: "",
//       isActive: true,        // default new records active
//       codetype: "OTS",
//       offcode: "0101"
//     });
//     setEditMode("new");
//     setIsEditing(true);
//   };


//   // ✅ Open form for edit
//   const handleEdit = (reason) => {
//     setFormData({
//       ccode: reason.ccode || "",
//       cname: reason.cname || "",
//       isActive:
//         reason.isActive === true ||
//         reason.isActive === "true" ||
//         reason.isActive === 1 ||
//         reason.isActive === "1" ||
//         reason.ACTIVE === true ||
//         reason.ACTIVE === 1,
//       codetype: reason.codetype || "OTS",
//       offcode: reason.offcode || "0101"
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       // Validate required fields
//       if (!formData.ccode || !formData.cname || !formData.codetype) {
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
//               codetype: formData.codetype,
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
//               codetype: formData.codetype,
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
//         await fetchReasons();
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
//       codetype: "OTS",
//       offcode: "0101"
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Reason Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading reasons...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Reason Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Reason" : "Add New Reason"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Reason Code *</label>
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
//               <label>Reason Name *</label>
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
//             <div className="form-group">
//               <label>Code Type *</label>
//               <select
//                 name="codetype"
//                 value={formData.codetype}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               >
//                 {codeTypeOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

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
//           </div>

//           <div className="form-row">
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
//                 placeholder="Search by Code, Name or Type..."
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

//             <div className="filter-buttons">
//               <span>Type:</span>
//               <select
//                 value={codeTypeFilter}
//                 onChange={(e) => setCodeTypeFilter(e.target.value)}
//                 className="modern-select"
//               >
//                 <option value="all">All Types</option>
//                 {codeTypeOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <button className="btn new" onClick={handleNew}>
//               <FaPlus /> New Reason
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Code</div>
//               <div className="header-cell">Name</div>
//               <div className="header-cell">Type</div>
//               <div className="header-cell center">Status</div>
//               {/* <div className="header-cell">Office Code</div> */}
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredReasons.length > 0 ? (
//                 filteredReasons.map((reason, idx) => {
//                   const activeValue =
//                     reason.isActive ??
//                     reason.IsActive ??
//                     reason.ISACTIVE ??
//                     reason.Active ??
//                     reason.ACTIVE ??
//                     false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" ||
//                       activeValue === "1" ||
//                       activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{reason.ccode}</div>
//                       <div className="list-cell">{reason.cname}</div>
//                       <div className="list-cell">{reason.codetype}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                           {isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                       {/* <div className="list-cell">{reason.offcode}</div> */}
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(reason)}
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
//                   {searchTerm || activeFilter !== "all" || codeTypeFilter !== "all"
//                     ? "No reasons match your search criteria"
//                     : "No reasons found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSReason;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSReason = (props) => (
  <HRMSGenericManager 
    moduleType="reason"
    {...props}
  />
);

export default HRMSReason;