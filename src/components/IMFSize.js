// import React, { useState, useEffect } from "react";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch } from "react-icons/fa";
// import "./HRMSDesignation.css";

// const IMFSize = () => {
//     const [sizeList, setSizeList] = useState([]);
//     const [filteredSize, setFilteredSize] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [activeFilter, setActiveFilter] = useState("all");
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [isEditing, setIsEditing] = useState(false);
//     const [editMode, setEditMode] = useState("new");
//     const [formData, setFormData] = useState({
//         cCode: "",
//         cName: "",
//         qty: "",
//         IsActive: true,
//         offcode: "",
//     });

//     const tableName = "IMFSize";
//     const API_BASE = "http://192.168.100.113:8081/api";

//     // ✅ Helper for safe fetch
//     const fetchJson = async (url, options = {}) => {
//         const res = await fetch(url, {
//             headers: { "Content-Type": "application/json", ...options.headers },
//             ...options,
//         });
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//         return await res.json();
//     };

//     // ✅ Fetch sizes
//     const fetchSizes = async () => {
//         try {
//             setLoading(true);
//             const data = await fetchJson(`${API_BASE}/get-table-data`, {
//                 method: "POST",
//                 body: JSON.stringify({ tableName, offcode: "" }),
//             });

//             if (data.success && (data.data || data.rows)) {
//                 const rows = data.data || data.rows;
//                 setSizeList(rows);
//                 setFilteredSize(rows);
//             } else {
//                 setError("Failed to load IMF Size data");
//             }
//         } catch (err) {
//             setError(`Error: ${err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchSizes();
//     }, []);

//     // ✅ Filtering
//     useEffect(() => {
//         let filtered = sizeList;

//         if (searchTerm.trim() !== "") {
//             filtered = filtered.filter((item) =>
//                 ["cCode", "cName", "qty"].some(
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
//                           activeValue === "1" ||
//                           activeValue === 1;
//                 return itemActive === isActive;
//             });
//         }

//         setFilteredSize(filtered);
//     }, [searchTerm, activeFilter, sizeList]);

//     // ✅ Input change handler
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value,
//         }));
//     };

//     // ✅ Get next available cCode
//     const getNextCode = () => {
//         if (!sizeList || sizeList.length === 0) return "001";

//         const codes = sizeList
//             .map((c) => parseInt(c.cCode || "0", 10))
//             .filter((n) => !isNaN(n));

//         if (codes.length === 0) return "001";

//         const maxCode = Math.max(...codes);
//         return (maxCode + 1).toString().padStart(3, "0");
//     };

//     // ✅ Open new form
//     const handleNew = () => {
//         setFormData({
//             cCode: getNextCode(),
//             cName: "",
//             qty: "",
//             IsActive: true,
//             offcode: "0101",
//         });
//         setEditMode("new");
//         setIsEditing(true);
//     };

//     // ✅ Open edit form
//     const handleEdit = (item) => {
//         setFormData({
//             cCode: item.cCode || "",
//             cName: item.cName || "",
//             qty: item.qty || "",
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

//     // ✅ Save / Update
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
//                             qty: formData.qty,
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
//                             qty: formData.qty,
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
//                 await fetchSizes();
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
//                 <h2>IMF Size Management</h2>
//                 <div className="loading-spinner"></div>
//                 <p>Loading data...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="category-container">
//             <div className="header-section">
//                 <h2>IMF Size Management</h2>
//                 <div className="accent-line"></div>
//             </div>

//             {error && <div className="error-message">{error}</div>}

//             {isEditing ? (
//                 <div className="category-form glassmorphism">
//                     <h3>{editMode === "edit" ? "Edit Size" : "Add New Size"}</h3>

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

//                         <div className="form-group">
//                             <label>Quantity</label>
//                             <input
//                                 type="number"
//                                 name="qty"
//                                 value={formData.qty}
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
//                                 placeholder="Search by Code, Name, or Qty..."
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
//                             <FaPlus /> New Size
//                         </button>
//                     </div>

//                     {/* List */}
//                     <div className="category-list-container glassmorphism">
//                         <div className="category-list-header">
//                             <div className="header-cell">Code</div>
//                             <div className="header-cell">Name</div>
//                             <div className="header-cell">Qty</div>
//                             <div className="header-cell center">Status</div>
//                             <div className="header-cell center">Actions</div>
//                         </div>

//                         <div className="category-list">
//                             {filteredSize.length > 0 ? (
//                                 filteredSize.map((item, idx) => {
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
//                                             <div className="list-cell">{item.qty}</div>
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
//                                         ? "No size records match your search criteria"
//                                         : "No size records found"}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default IMFSize;


import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const IMFSize = (props) => (
  <HRMSGenericManager 
    moduleType="imfsize"
    {...props}
  />
);

export default IMFSize;