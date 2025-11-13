// import React, { useState, useEffect } from "react";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch } from "react-icons/fa";
// import "./HRMSDesignation.css";

// const IMFThickness = () => {
//     const [thicknessList, setThicknessList] = useState([]);
//     const [filteredThickness, setFilteredThickness] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [activeFilter, setActiveFilter] = useState("all");
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // Form state
//     const [isEditing, setIsEditing] = useState(false);
//     const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//     const [formData, setFormData] = useState({
//         cCode: "",
//         cName: "",
//         IsActive: true,
//         offcode: "",
//     });

//     const tableName = "IMFThickness";
//     const API_BASE = "http://192.168.100.113:8081/api";

//     // ✅ Helper to fetch JSON safely
//     const fetchJson = async (url, options = {}) => {
//         const res = await fetch(url, {
//             headers: { "Content-Type": "application/json", ...options.headers },
//             ...options,
//         });
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//         return await res.json();
//     };

//     // ✅ Fetch all thickness records
//     const fetchThickness = async () => {
//         try {
//             setLoading(true);
//             const data = await fetchJson(`${API_BASE}/get-table-data`, {
//                 method: "POST",
//                 body: JSON.stringify({ tableName, offcode: "" }),
//             });

//             if (data.success && (data.data || data.rows)) {
//                 const rows = data.data || data.rows;
//                 setThicknessList(rows);
//                 setFilteredThickness(rows);
//             } else {
//                 setError("Failed to load IMF Thickness data");
//             }
//         } catch (err) {
//             setError(`Error: ${err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchThickness();
//     }, []);

//     // ✅ Filtering
//     useEffect(() => {
//         let filtered = thicknessList;

//         if (searchTerm.trim() !== "") {
//             filtered = filtered.filter((item) =>
//                 ["cCode", "cName"].some(
//                     (key) =>
//                         item[key] &&
//                         item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//                 )
//             );
//         }

//         if (activeFilter !== "all") {
//             const isActive = activeFilter === "active";
//             filtered = filtered.filter((item) => {
//                 const activeValue =
//                     item.IsActive ?? item.isActive ?? item.ISACTIVE ?? item.Active ?? false;
//                 const itemActive =
//                     typeof activeValue === "boolean"
//                         ? activeValue
//                         : activeValue === "true" ||
//                         activeValue === "1" ||
//                         activeValue === 1;
//                 return itemActive === isActive;
//             });
//         }

//         setFilteredThickness(filtered);
//     }, [searchTerm, activeFilter, thicknessList]);

//     // ✅ Input handler
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value,
//         }));
//     };

//     // ✅ Helper to get next available cCode
//     const getNextCode = () => {
//         if (!thicknessList || thicknessList.length === 0) return "001";

//         const codes = thicknessList
//             .map((c) => parseInt(c.cCode || "0", 10))
//             .filter((n) => !isNaN(n));

//         if (codes.length === 0) return "001";

//         const maxCode = Math.max(...codes);
//         return (maxCode + 1).toString().padStart(3, "0");
//     };

//     // ✅ Open form for new
//     const handleNew = () => {
//         setFormData({
//             cCode: getNextCode(), // ✅ Auto-generate cCode
//             cName: "",
//             IsActive: true,
//             offcode: "0101",
//         });
//         setEditMode("new");
//         setIsEditing(true);
//     };

//     // ✅ Open form for edit
//     const handleEdit = (item) => {
//         setFormData({
//             cCode: item.cCode || "",
//             cName: item.cName || "",
//             IsActive:
//                 item.IsActive === true ||
//                 item.IsActive === "true" ||
//                 item.IsActive === 1 ||
//                 item.IsActive === "1",
//             offcode: item.offcode,
//         });
//         setEditMode("edit");
//         setIsEditing(true);
//     };

//     // ✅ Save or Update
//     const handleSave = async () => {
//         try {
//             if (!formData.cCode || !formData.cName) {
//                 setError("Please fill in all required fields");
//                 return;
//             }

//             const payload =
//                 editMode === "edit"
//                     ? {
//                         tableName,
//                         data: {
//                             cName: formData.cName,
//                             IsActive: formData.IsActive,
//                             offcode: formData.offcode,
//                         },
//                         where: { cCode: formData.cCode },
//                     }
//                     : {
//                         tableName,
//                         data: {
//                             cCode: formData.cCode,
//                             cName: formData.cName,
//                             IsActive: formData.IsActive,
//                             offcode: formData.offcode,
//                         },
//                     };

//             const url =
//                 editMode === "edit"
//                     ? `${API_BASE}/update-table-data`
//                     : `${API_BASE}/insert-table-data`;

//             const res = await fetchJson(url, {
//                 method: "POST",
//                 body: JSON.stringify(payload),
//             });

//             if (res.success) {
//                 await fetchThickness();
//                 setIsEditing(false);
//                 setError(null);
//             } else {
//                 setError("❌ Operation failed: " + (res.error || "Unknown error"));
//             }
//         } catch (err) {
//             setError("❌ Error: " + err.message);
//         }
//     };

//     const handleCancel = () => {
//         setIsEditing(false);
//     };

//     // ---------------------------------------------------
//     // UI
//     // ---------------------------------------------------

//     if (loading) {
//         return (
//             <div className="category-container">
//                 <h2>IMF Thickness Management</h2>
//                 <div className="loading-spinner"></div>
//                 <p>Loading data...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="category-container">
//             <div className="header-section">
//                 <h2>IMF Thickness Management</h2>
//                 <div className="accent-line"></div>
//             </div>

//             {error && <div className="error-message">{error}</div>}

//             {isEditing ? (
//                 <div className="category-form glassmorphism">
//                     <h3>{editMode === "edit" ? "Edit Thickness" : "Add New Thickness"}</h3>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Code *</label>
//                             <input
//                                 type="text"
//                                 name="cCode"
//                                 value={formData.cCode}
//                                 onChange={handleInputChange}
//                                 disabled={editMode === "edit"}
//                                 className="modern-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label>Name *</label>
//                             <input
//                                 type="text"
//                                 name="cName"
//                                 value={formData.cName}
//                                 onChange={handleInputChange}
//                                 className="modern-input"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group checkbox-container">
//                             <label className="checkbox-label">
//                                 <input
//                                     type="checkbox"
//                                     name="IsActive"
//                                     checked={formData.IsActive}
//                                     onChange={handleInputChange}
//                                     className="modern-checkbox"
//                                 />
//                                 <span className="checkmark"></span>
//                                 Active
//                             </label>
//                         </div>
//                     </div>

//                     <div className="form-actions">
//                         <button className="btn save" onClick={handleSave}>
//                             <FaSave /> {editMode === "edit" ? "Update" : "Save"}
//                         </button>
//                         <button className="btn cancel" onClick={handleCancel}>
//                             <FaTimes /> Cancel
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <>
//                     {/* Toolbar */}
//                     <div className="category-toolbar glassmorphism">
//                         <div className="search-box">
//                             <FaSearch className="search-icon" />
//                             <input
//                                 type="text"
//                                 placeholder="Search by Code or Name..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="modern-input"
//                             />
//                         </div>

//                         <div className="filter-buttons">
//                             <span>Status:</span>
//                             <button
//                                 className={activeFilter === "all" ? "btn-filter active" : "btn-filter"}
//                                 onClick={() => setActiveFilter("all")}
//                             >
//                                 All
//                             </button>
//                             <button
//                                 className={activeFilter === "active" ? "btn-filter active" : "btn-filter"}
//                                 onClick={() => setActiveFilter("active")}
//                             >
//                                 Active
//                             </button>
//                             <button
//                                 className={activeFilter === "inactive" ? "btn-filter active" : "btn-filter"}
//                                 onClick={() => setActiveFilter("inactive")}
//                             >
//                                 Inactive
//                             </button>
//                         </div>

//                         <button className="btn new" onClick={handleNew}>
//                             <FaPlus /> New Thickness
//                         </button>
//                     </div>

//                     {/* List */}
//                     <div className="category-list-container glassmorphism">
//                         <div className="category-list-header">
//                             <div className="header-cell">Code</div>
//                             <div className="header-cell">Name</div>
//                             <div className="header-cell center">Status</div>
//                             <div className="header-cell center">Actions</div>
//                         </div>

//                         <div className="category-list">
//                             {filteredThickness.length > 0 ? (
//                                 filteredThickness.map((item, idx) => {
//                                     const activeValue =
//                                         item.IsActive ?? item.isActive ?? item.ISACTIVE ?? item.Active ?? false;
//                                     const isActive =
//                                         typeof activeValue === "boolean"
//                                             ? activeValue
//                                             : activeValue === "true" ||
//                                               activeValue === "1" ||
//                                               activeValue === 1;

//                                     return (
//                                         <div key={idx} className="category-item">
//                                             <div className="list-cell">{item.cCode}</div>
//                                             <div className="list-cell">{item.cName}</div>
//                                             <div className="list-cell center">
//                                                 <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
//                                                     {isActive ? "Active" : "Inactive"}
//                                                 </span>
//                                             </div>
//                                             <div className="list-cell center actions">
//                                                 <button
//                                                     className="btn-edit"
//                                                     onClick={() => handleEdit(item)}
//                                                     title="Edit"
//                                                 >
//                                                     <FaEdit />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     );
//                                 })
//                             ) : (
//                                 <div className="no-data">
//                                     {searchTerm || activeFilter !== "all"
//                                         ? "No thickness records match your search criteria"
//                                         : "No thickness records found"}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default IMFThickness;


import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const IMFThickness = (props) => (
  <HRMSGenericManager 
    moduleType="imfthickness"
    {...props}
  />
);

export default IMFThickness;