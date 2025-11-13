// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch } from "react-icons/fa";

// const LndPaymentType = () => {
//   const [paymentTypes, setPaymentTypes] = useState([]);
//   const [filteredTypes, setFilteredTypes] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new");
//   const [formData, setFormData] = useState({
//     TypeCode: "",
//     TypeDesc: "",
//     TypeSHD: "",
//     TypeGLCode: "",
//     IsActive: true,
//     offcode: "0101",
//   });

//   const tableName = "lndPaymentType";
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

//   // ✅ Fetch all payment types
//   const fetchPaymentTypes = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setPaymentTypes(rows);
//         setFilteredTypes(rows);
//       } else {
//         setError("Failed to load Payment Types");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPaymentTypes();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = paymentTypes;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((t) =>
//         ["TypeCode", "TypeDesc", "TypeSHD", "TypeGLCode"].some(
//           (key) =>
//             t[key] &&
//             t[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((t) => {
//         const activeValue =
//           t.IsActive ?? t.isActive ?? t.ISACTIVE ?? t.Active ?? t.ACTIVE ?? false;
//         const itemActive =
//           typeof activeValue === "boolean"
//             ? activeValue
//             : activeValue === "true" || activeValue === "1" || activeValue === 1;
//         return itemActive === isActive;
//       });
//     }

//     setFilteredTypes(filtered);
//   }, [searchTerm, activeFilter, paymentTypes]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ✅ Helper to get next available TypeCode
//   const getNextCode = () => {
//     if (!paymentTypes || paymentTypes.length === 0) return "001";

//     const codes = paymentTypes
//       .map((t) => parseInt(t.TypeCode || t.TYPECODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "001";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(3, "0");
//   };

//   // ✅ Open form for new
//   const handleNew = () => {
//     setFormData({
//       TypeCode: getNextCode(),  // Auto-generated code
//       TypeDesc: "",
//       TypeSHD: "",
//       TypeGLCode: "",
//       IsActive: true,
//       offcode: "0101"
//     });
//     setEditMode("new");
//     setIsEditing(true);
//   };

//   // ✅ Open form for edit
//   const handleEdit = (row) => {
//     setFormData({
//       TypeCode: row.TypeCode || "",
//       TypeDesc: row.TypeDesc || "",
//       TypeSHD: row.TypeSHD || "",
//       TypeGLCode: row.TypeGLCode || "",
//       IsActive:
//         row.IsActive === true ||
//         row.IsActive === "true" ||
//         row.IsActive === 1 ||
//         row.IsActive === "1" ||
//         row.ACTIVE === true ||
//         row.ACTIVE === 1 ||
//         false,
//       offcode: row.offcode,
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       if (!formData.TypeCode || !formData.TypeDesc) {
//         setError("Please fill in required fields (Type Code, Type Desc)");
//         return;
//       }

//       const payload =
//         editMode === "edit"
//           ? {
//             tableName,
//             data: {
//               TypeDesc: formData.TypeDesc,
//               TypeSHD: formData.TypeSHD,
//               TypeGLCode: formData.TypeGLCode,
//               IsActive: formData.IsActive,
//               offcode: formData.offcode,
//             },
//             where: { TypeCode: formData.TypeCode },
//           }
//           : {
//             tableName,
//             data: { ...formData },
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
//         await fetchPaymentTypes();
//         setIsEditing(false);
//         setError(null);
//       } else {
//         setError("❌ Operation failed: " + (res.error || "Unknown error"));
//       }
//     } catch (err) {
//       setError("❌ Error: " + err.message);
//     }
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setFormData({
//       TypeCode: "",
//       TypeDesc: "",
//       TypeSHD: "",
//       TypeGLCode: "",
//       IsActive: true,
//       offcode: "0101",
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Payment Types</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Payment Type Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Payment Type" : "Add New Payment Type"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Type Code *</label>
//               <input
//                 type="text"
//                 name="TypeCode"
//                 value={formData.TypeCode}
//                 onChange={handleInputChange}
//                 disabled={editMode === "edit"}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Type Desc *</label>
//               <input
//                 type="text"
//                 name="TypeDesc"
//                 value={formData.TypeDesc}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Type SHD</label>
//               <input
//                 type="text"
//                 name="TypeSHD"
//                 value={formData.TypeSHD}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Type GL Code</label>
//               <input
//                 type="text"
//                 name="TypeGLCode"
//                 value={formData.TypeGLCode}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

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
//                 placeholder="Search by Code, Desc, SHD or GL Code..."
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
//               <FaPlus /> New Payment Type
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Type Code</div>
//               <div className="header-cell">Type Desc</div>
//               <div className="header-cell">Type SHD</div>
//               <div className="header-cell">Type GL Code</div>
//               <div className="header-cell center">Status</div>
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredTypes.length > 0 ? (
//                 filteredTypes.map((row, idx) => {
//                   const activeValue =
//                     row.IsActive ?? row.isActive ?? row.ISACTIVE ?? row.Active ?? row.ACTIVE ?? false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" || activeValue === "1" || activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{row.TypeCode}</div>
//                       <div className="list-cell">{row.TypeDesc}</div>
//                       <div className="list-cell">{row.TypeSHD}</div>
//                       <div className="list-cell">{row.TypeGLCode || "-"}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
//                           {isActive ? "Active" : "Inactive"}
//                         </span>
//                       </div>
//                       <div className="list-cell center actions">
//                         <button className="btn-edit" onClick={() => handleEdit(row)} title="Edit">
//                           <FaEdit />
//                         </button>
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="no-data">
//                   {searchTerm || activeFilter !== "all"
//                     ? "No payment types match your search criteria"
//                     : "No payment types found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default LndPaymentType;


import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const LndPaymentType = (props) => (
  <HRMSGenericManager 
    moduleType="paymenttype"
    {...props}
  />
);

export default LndPaymentType;