// import React, { useState, useEffect } from "react";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch } from "react-icons/fa";
// import "./HRMSDesignation.css";

// const LndPlotCategory = () => {
//     const [categories, setCategories] = useState([]);
//     const [filteredCategories, setFilteredCategories] = useState([]);
//     const [searchTerm, setSearchTerm] = useState("");
//     const [activeFilter, setActiveFilter] = useState("all");
//     const [error, setError] = useState(null);
//     const [loading, setLoading] = useState(true);

//     // Form state
//     const [isEditing, setIsEditing] = useState(false);
//     const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//     const [formData, setFormData] = useState({
//         CatCode: "",
//         CatDesc: "",
//         CatSHD: "",
//         IsActive: true,
//         offcode: "",
//     });

//     const tableName = "lndPlotCatagory";
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

//     // ✅ Fetch all categories
//     const fetchCategories = async () => {
//         try {
//             setLoading(true);
//             const data = await fetchJson(`${API_BASE}/get-table-data`, {
//                 method: "POST",
//                 body: JSON.stringify({ tableName, offcode: "" }),
//             });

//             if (data.success && (data.data || data.rows)) {
//                 const rows = data.data || data.rows;
//                 setCategories(rows);
//                 setFilteredCategories(rows);
//             } else {
//                 setError("Failed to load plot categories data");
//             }
//         } catch (err) {
//             setError(`Error: ${err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchCategories();
//     }, []);

//     // ✅ Filtering
//     useEffect(() => {
//         let filtered = categories;

//         if (searchTerm.trim() !== "") {
//             filtered = filtered.filter((cat) =>
//                 ["CatCode", "CatDesc", "CatSHD"].some(
//                     (key) =>
//                         cat[key] &&
//                         cat[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//                 )
//             );
//         }

//         if (activeFilter !== "all") {
//             const isActive = activeFilter === "active";
//             filtered = filtered.filter((cat) => {
//                 const activeValue =
//                     cat.IsActive ?? cat.isActive ?? cat.ISACTIVE ?? cat.Active ?? false;
//                 const itemActive =
//                     typeof activeValue === "boolean"
//                         ? activeValue
//                         : activeValue === "true" ||
//                         activeValue === "1" ||
//                         activeValue === 1;
//                 return itemActive === isActive;
//             });
//         }

//         setFilteredCategories(filtered);
//     }, [searchTerm, activeFilter, categories]);

//     // ✅ Input handler
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value,
//         }));
//     };

//     // ✅ Helper to get next available code
//     // ✅ Helper to get next available CatCode
//     const getNextCode = () => {
//         if (!categories || categories.length === 0) return "001";

//         const codes = categories
//             .map((c) => parseInt(c.CatCode || c.CATCODE || "0", 10))
//             .filter((n) => !isNaN(n));

//         if (codes.length === 0) return "001";

//         const maxCode = Math.max(...codes);
//         return (maxCode + 1).toString().padStart(3, "0");
//     };

//     // ✅ Open form for new
//     const handleNew = () => {
//         setFormData({
//             CatCode: getNextCode(),  // ✅ Auto-generate CatCode
//             CatDesc: "",
//             CatSHD: "",
//             IsActive: true,
//             offcode: "0101"
//         });
//         setEditMode("new");
//         setIsEditing(true);
//     };


//     // ✅ Open form for edit
//     const handleEdit = (cat) => {
//         setFormData({
//             CatCode: cat.CatCode || "",
//             CatDesc: cat.CatDesc || "",
//             CatSHD: cat.CatSHD || "",
//             IsActive:
//                 cat.IsActive === true ||
//                 cat.IsActive === "true" ||
//                 cat.IsActive === 1 ||
//                 cat.IsActive === "1",
//             offcode: cat.offcode,
//         });
//         setEditMode("edit");
//         setIsEditing(true);
//     };

//     // ✅ Save or Update
//     const handleSave = async () => {
//         try {
//             if (!formData.CatCode || !formData.CatDesc || !formData.CatSHD) {
//                 setError("Please fill in all required fields");
//                 return;
//             }

//             const payload =
//                 editMode === "edit"
//                     ? {
//                         tableName,
//                         data: {
//                             CatDesc: formData.CatDesc,
//                             CatSHD: formData.CatSHD,
//                             IsActive: formData.IsActive,
//                             offcode: formData.offcode,
//                         },
//                         where: { CatCode: formData.CatCode },
//                     }
//                     : {
//                         tableName,
//                         data: {
//                             CatCode: formData.CatCode,
//                             CatDesc: formData.CatDesc,
//                             CatSHD: formData.CatSHD,
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
//                 await fetchCategories();
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
//                 <h2>Plot Category Management</h2>
//                 <div className="loading-spinner"></div>
//                 <p>Loading categories...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="category-container">
//             <div className="header-section">
//                 <h2>Plot Category Management</h2>
//                 <div className="accent-line"></div>
//             </div>

//             {error && <div className="error-message">{error}</div>}

//             {isEditing ? (
//                 <div className="category-form glassmorphism">
//                     <h3>{editMode === "edit" ? "Edit Category" : "Add New Category"}</h3>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Category Code *</label>
//                             <input
//                                 type="text"
//                                 name="CatCode"
//                                 value={formData.CatCode}
//                                 onChange={handleInputChange}
//                                 disabled={editMode === "edit"}
//                                 className="modern-input"
//                             />
//                         </div>

//                         <div className="form-group">
//                             <label>Category Description *</label>
//                             <input
//                                 type="text"
//                                 name="CatDesc"
//                                 value={formData.CatDesc}
//                                 onChange={handleInputChange}
//                                 className="modern-input"
//                             />
//                         </div>
//                     </div>

//                     <div className="form-row">
//                         <div className="form-group">
//                             <label>Category Short Description *</label>
//                             <input
//                                 type="text"
//                                 name="CatSHD"
//                                 value={formData.CatSHD}
//                                 onChange={handleInputChange}
//                                 className="modern-input"
//                             />
//                         </div>

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
//                                 placeholder="Search by Code, Description or Short Desc..."
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
//                             <FaPlus /> New Category
//                         </button>
//                     </div>

//                     {/* List */}
//                     <div className="category-list-container glassmorphism">
//                         <div className="category-list-header">
//                             <div className="header-cell">Code</div>
//                             <div className="header-cell">Description</div>
//                             <div className="header-cell">Short Desc</div>
//                             <div className="header-cell center">Status</div>
//                             <div className="header-cell center">Actions</div>
//                         </div>

//                         <div className="category-list">
//                             {filteredCategories.length > 0 ? (
//                                 filteredCategories.map((cat, idx) => {
//                                     const activeValue =
//                                         cat.IsActive ?? cat.isActive ?? cat.ISACTIVE ?? cat.Active ?? false;
//                                     const isActive =
//                                         typeof activeValue === "boolean"
//                                             ? activeValue
//                                             : activeValue === "true" ||
//                                             activeValue === "1" ||
//                                             activeValue === 1;

//                                     return (
//                                         <div key={idx} className="category-item">
//                                             <div className="list-cell">{cat.CatCode}</div>
//                                             <div className="list-cell">{cat.CatDesc}</div>
//                                             <div className="list-cell">{cat.CatSHD}</div>
//                                             <div className="list-cell center">
//                                                 <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
//                                                     {isActive ? "Active" : "Inactive"}
//                                                 </span>
//                                             </div>
//                                             <div className="list-cell center actions">
//                                                 <button
//                                                     className="btn-edit"
//                                                     onClick={() => handleEdit(cat)}
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
//                                         ? "No categories match your search criteria"
//                                         : "No categories found"}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default LndPlotCategory;


import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const LndPlotCategory = (props) => (
  <HRMSGenericManager 
    moduleType="plotcategory"
    {...props}
  />
);

export default LndPlotCategory;