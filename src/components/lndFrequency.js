// import React, { useState, useEffect } from "react";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch } from "react-icons/fa";
// import "./HRMSDesignation.css";

// const LNDFrequency = () => {
//     const [frequencyList, setFrequencyList] = useState([]);
//     const [filteredFrequency, setFilteredFrequency] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [activeFilter, setActiveFilter] = useState("all");
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);

//     const [isEditing, setIsEditing] = useState(false);
//     const [editMode, setEditMode] = useState("new");
//     const [formData, setFormData] = useState({
//         ccode: "",
//         cname: "",
//         Qty: "",
//         isactive: true,
//         offcode: "",
//     });

//     const tableName = "lndFrequency";
//     const API_BASE = "http://192.168.100.113:8081/api";

//     const fetchJson = async (url, options = {}) => {
//         const res = await fetch(url, {
//             headers: { "Content-Type": "application/json", ...options.headers },
//             ...options,
//         });
//         if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//         return await res.json();
//     };

//     const fetchFrequency = async () => {
//         try {
//             setLoading(true);
//             const data = await fetchJson(`${API_BASE}/get-table-data`, {
//                 method: "POST",
//                 body: JSON.stringify({ tableName, offcode: "" }),
//             });

//             if (data.success && (data.data || data.rows)) {
//                 const rows = data.data || data.rows;
//                 setFrequencyList(rows);
//                 setFilteredFrequency(rows);
//             } else {
//                 setError("Failed to load Frequency data");
//             }
//         } catch (err) {
//             setError(`Error: ${err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchFrequency();
//     }, []);

//     useEffect(() => {
//         let filtered = frequencyList;

//         if (searchTerm.trim() !== "") {
//             filtered = filtered.filter((item) =>
//                 ["ccode", "cname"].some(
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
//                     item.isactive ?? item.IsActive ?? item.ISACTIVE ?? item.Active ?? false;
//                 const itemActive =
//                     typeof activeValue === "boolean"
//                         ? activeValue
//                         : activeValue === "true" ||
//                         activeValue === "1" ||
//                         activeValue === 1;
//                 return itemActive === isActive;
//             });
//         }

//         setFilteredFrequency(filtered);
//     }, [searchTerm, activeFilter, frequencyList]);

//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value,
//         }));
//     };

//     const getNextCode = () => {
//         if (!frequencyList || frequencyList.length === 0) return "1";

//         const codes = frequencyList
//             .map((c) => parseInt(c.ccode || "0", 10))
//             .filter((n) => !isNaN(n));

//         if (codes.length === 0) return "1";

//         const maxCode = Math.max(...codes);
//         return (maxCode + 1).toString();
//     };

//     const handleNew = () => {
//         setFormData({
//             ccode: getNextCode(),
//             cname: "",
//             Qty: "",
//             isactive: true,
//             offcode: "0101",
//         });
//         setEditMode("new");
//         setIsEditing(true);
//     };

//     const handleEdit = (item) => {
//         setFormData({
//             ccode: item.ccode || "",
//             cname: item.cname || "",
//             Qty: item.Qty || "",
//             isactive:
//                 item.isactive === true ||
//                 item.isactive === "true" ||
//                 item.isactive === 1 ||
//                 item.isactive === "1",
//             offcode: item.offcode,
//         });
//         setEditMode("edit");
//         setIsEditing(true);
//     };

//     const handleSave = async () => {
//         try {
//             if (!formData.ccode || !formData.cname || !formData.Qty) {
//                 setError("Please fill in all required fields");
//                 return;
//             }

//             const payload =
//                 editMode === "edit"
//                     ? {
//                         tableName,
//                         data: {
//                             cname: formData.cname,
//                             Qty: formData.Qty,
//                             isactive: formData.isactive,
//                             offcode: formData.offcode,
//                         },
//                         where: { ccode: formData.ccode },
//                     }
//                     : {
//                         tableName,
//                         data: {
//                             ccode: formData.ccode,
//                             cname: formData.cname,
//                             Qty: formData.Qty,
//                             isactive: formData.isactive,
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
//                 await fetchFrequency();
//                 setIsEditing(false);
//                 setError(null);
//             } else {
//                 setError("❌ Operation failed: " + (res.error || "Unknown error"));
//             }
//         } catch (err) {
//             setError("❌ Error: " + err.message);
//         }
//     };

//     const handleCancel = () => setIsEditing(false);

//     if (loading) {
//         return (
//             <div className="category-container">
//                 <h2>Frequency Management</h2>
//                 <div className="loading-spinner"></div>
//                 <p>Loading data...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="category-container">
//             <div className="header-section">
//                 <h2>Frequency Management</h2>
//                 <div className="accent-line"></div>
//             </div>

//             {error && <div className="error-message">{error}</div>}

//             {isEditing ? (
//                 <div className="category-form glassmorphism">
//                     <h3>{editMode === "edit" ? "Edit Frequency" : "Add New Frequency"}</h3>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Code *</label>
//                             <input
//                                 type="text"
//                                 name="ccode"
//                                 value={formData.ccode}
//                                 onChange={handleInputChange}
//                                 disabled={editMode === "edit"}
//                                 className="modern-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label>Name *</label>
//                             <input
//                                 type="text"
//                                 name="cname"
//                                 value={formData.cname}
//                                 onChange={handleInputChange}
//                                 className="modern-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label>Qty *</label>
//                             <input
//                                 type="number"
//                                 name="Qty"
//                                 value={formData.Qty}
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
//                                     name="isactive"
//                                     checked={formData.isactive}
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
//                             <FaPlus /> New Frequency
//                         </button>
//                     </div>

//                     <div className="category-list-container glassmorphism">
//                         <div className="category-list-header">
//                             <div className="header-cell">Code</div>
//                             <div className="header-cell">Name</div>
//                             <div className="header-cell">Qty</div>
//                             <div className="header-cell center">Status</div>
//                             <div className="header-cell center">Actions</div>
//                         </div>

//                         <div className="category-list">
//                             {filteredFrequency.length > 0 ? (
//                                 filteredFrequency.map((item, idx) => {
//                                     const activeValue =
//                                         item.isactive ?? item.IsActive ?? item.ISACTIVE ?? item.Active ?? false;
//                                     const isActive =
//                                         typeof activeValue === "boolean"
//                                             ? activeValue
//                                             : activeValue === "true" ||
//                                               activeValue === "1" ||
//                                               activeValue === 1;

//                                     return (
//                                         <div key={idx} className="category-item">
//                                             <div className="list-cell">{item.ccode}</div>
//                                             <div className="list-cell">{item.cname}</div>
//                                             <div className="list-cell">{item.Qty}</div>
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
//                                         ? "No frequency records match your search criteria"
//                                         : "No frequency records found"}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default LNDFrequency;


import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const LNDFrequency = (props) => (
  <HRMSGenericManager 
    moduleType="frequency"
    {...props}
  />
);

export default LNDFrequency;