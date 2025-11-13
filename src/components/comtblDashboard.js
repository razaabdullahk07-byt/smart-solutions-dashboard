// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSDashboard = () => {
//   const [dashboards, setDashboards] = useState([]);
//   const [filteredDashboards, setFilteredDashboards] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [dbTypeFilter, setDbTypeFilter] = useState("all");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//   const [formData, setFormData] = useState({
//     offcode: "",
//     MenuSystem: "",
//     DBType: "TABLE",
//     DBCode: "",
//     DBDescription: "",
//     IsActive: true,
//     Remarks: "",
//     FeildToSum: "",
//     ImageURL: "",
//     BackColor: "#f0f0f0",
//     dbSort: "0",
//     dbxxLabel: "",
//     dbyxLabel: "",
//     dbWidth: "500",
//     dbHeight: "300",
//     dbxxField: "",
//     dbyxField: "",
//     numberSuffix: "",
//     DBParentCode: "00"
//   });

//   const tableName = "comtblDashboard";
//   const API_BASE = "http://192.168.100.113:8081/api";

//   // DB Type options
//   const dbTypeOptions = [
//     { value: "TABLE", label: "Table" },
//     { value: "TILE", label: "Tile" },
//     { value: "CHART", label: "Chart" },
//     { value: "GRAPH", label: "Graph" }
//   ];

//   // ✅ Helper to fetch JSON safely
//   const fetchJson = async (url, options = {}) => {
//     const res = await fetch(url, {
//       headers: { "Content-Type": "application/json", ...options.headers },
//       ...options,
//     });
//     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//     return await res.json();
//   };

//   // ✅ Fetch all dashboards
//   const fetchDashboards = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setDashboards(rows);
//         setFilteredDashboards(rows);
//       } else {
//         setError("Failed to load dashboard data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboards();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = dashboards;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((dashboard) =>
//         ["DBCode", "DBDescription", "DBType", "Remarks"].some(
//           (key) =>
//             dashboard[key] &&
//             dashboard[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (dbTypeFilter !== "all") {
//       filtered = filtered.filter((dashboard) => dashboard.DBType === dbTypeFilter);
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((dashboard) => {
//         const activeValue =
//           dashboard.IsActive ??
//           dashboard.isActive ??
//           dashboard.ISACTIVE ??
//           dashboard.Active ??
//           dashboard.ACTIVE ??
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

//     setFilteredDashboards(filtered);
//   }, [searchTerm, dbTypeFilter, activeFilter, dashboards]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ✅ Open form for new
//   // ✅ Open form for new
//   const handleNew = () => {
//     // Find highest DBCode in dashboards
//     const maxCode = dashboards.length
//       ? Math.max(
//         ...dashboards.map((d) =>
//           parseInt((d.DBCode || "0").toString().replace(/\D/g, "")) || 0
//         )
//       )
//       : 0;

//     // Generate next code, padded with zeros (e.g. 001, 002, 003)
//     const nextCode = (maxCode + 1).toString().padStart(3, "0");

//     setFormData({
//       offcode: "",
//       MenuSystem: "",
//       DBType: "TABLE",
//       DBCode: nextCode, // ✅ Auto-generated code
//       DBDescription: "",
//       IsActive: true,
//       Remarks: "",
//       FeildToSum: "",
//       ImageURL: "",
//       BackColor: "#f0f0f0",
//       dbSort: "0",
//       dbxxLabel: "",
//       dbyxLabel: "",
//       dbWidth: "500",
//       dbHeight: "300",
//       dbxxField: "",
//       dbyxField: "",
//       numberSuffix: "",
//       DBParentCode: "00"
//     });

//     setEditMode("new");
//     setIsEditing(true);
//   };


//   // ✅ Open form for edit
//   const handleEdit = (dashboard) => {
//     setFormData({
//       offcode: dashboard.offcode || "",
//       MenuSystem: dashboard.MenuSystem || "",
//       DBType: dashboard.DBType || "TABLE",
//       DBCode: dashboard.DBCode || "",
//       DBDescription: dashboard.DBDescription || "",
//       IsActive:
//         dashboard.IsActive === true ||
//         dashboard.IsActive === "true" ||
//         dashboard.IsActive === 1 ||
//         dashboard.IsActive === "1" ||
//         dashboard.ACTIVE === true ||
//         dashboard.ACTIVE === 1 ||
//         false,
//       Remarks: dashboard.Remarks || "",
//       FeildToSum: dashboard.FeildToSum || "",
//       ImageURL: dashboard.ImageURL || "",
//       BackColor: dashboard.BackColor || "#f0f0f0",
//       dbSort: dashboard.dbSort || "0",
//       dbxxLabel: dashboard.dbxxLabel || "",
//       dbyxLabel: dashboard.dbyxLabel || "",
//       dbWidth: dashboard.dbWidth || "500",
//       dbHeight: dashboard.dbHeight || "300",
//       dbxxField: dashboard.dbxxField || "",
//       dbyxField: dashboard.dbyxField || "",
//       numberSuffix: dashboard.numberSuffix || "",
//       DBParentCode: dashboard.DBParentCode || "00"
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       // Validate required fields
//       if (!formData.DBCode || !formData.DBDescription || !formData.DBType) {
//         setError("Please fill in all required fields");
//         return;
//       }

//       const payload =
//         editMode === "edit"
//           ? {
//             tableName,
//             data: {
//               MenuSystem: formData.MenuSystem,
//               DBType: formData.DBType,
//               DBDescription: formData.DBDescription,
//               IsActive: formData.IsActive,
//               Remarks: formData.Remarks,
//               FeildToSum: formData.FeildToSum,
//               ImageURL: formData.ImageURL,
//               BackColor: formData.BackColor,
//               dbSort: formData.dbSort,
//               dbxxLabel: formData.dbxxLabel,
//               dbyxLabel: formData.dbyxLabel,
//               dbWidth: formData.dbWidth,
//               dbHeight: formData.dbHeight,
//               dbxxField: formData.dbxxField,
//               dbyxField: formData.dbyxField,
//               numberSuffix: formData.numberSuffix,
//               DBParentCode: formData.DBParentCode,
//               offcode: formData.offcode
//             },
//             where: { DBCode: formData.DBCode },
//           }
//           : {
//             tableName,
//             data: {
//               DBCode: formData.DBCode,
//               MenuSystem: formData.MenuSystem,
//               DBType: formData.DBType,
//               DBDescription: formData.DBDescription,
//               IsActive: formData.IsActive,
//               Remarks: formData.Remarks,
//               FeildToSum: formData.FeildToSum,
//               ImageURL: formData.ImageURL,
//               BackColor: formData.BackColor,
//               dbSort: formData.dbSort,
//               dbxxLabel: formData.dbxxLabel,
//               dbyxLabel: formData.dbyxLabel,
//               dbWidth: formData.dbWidth,
//               dbHeight: formData.dbHeight,
//               dbxxField: formData.dbxxField,
//               dbyxField: formData.dbyxField,
//               numberSuffix: formData.numberSuffix,
//               DBParentCode: formData.DBParentCode,
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
//         await fetchDashboards();
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
//       offcode: "",
//       MenuSystem: "",
//       DBType: "TABLE",
//       DBCode: "",
//       DBDescription: "",
//       IsActive: true,
//       Remarks: "",
//       FeildToSum: "",
//       ImageURL: "",
//       BackColor: "#f0f0f0",
//       dbSort: "0",
//       dbxxLabel: "",
//       dbyxLabel: "",
//       dbWidth: "500",
//       dbHeight: "300",
//       dbxxField: "",
//       dbyxField: "",
//       numberSuffix: "",
//       DBParentCode: "00"
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Dashboard Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading dashboards...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Dashboard Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Dashboard Item" : "Add New Dashboard Item"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Dashboard Code *</label>
//               <input
//                 type="text"
//                 name="DBCode"
//                 value={formData.DBCode}
//                 onChange={handleInputChange}
//                 disabled={editMode === "edit"}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Menu System</label>
//               <input
//                 type="text"
//                 name="MenuSystem"
//                 value={formData.MenuSystem}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Dashboard Type *</label>
//               <select
//                 name="DBType"
//                 value={formData.DBType}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               >
//                 {dbTypeOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="form-group">
//               <label>Description *</label>
//               <input
//                 type="text"
//                 name="DBDescription"
//                 value={formData.DBDescription}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Remarks</label>
//               <input
//                 type="text"
//                 name="Remarks"
//                 value={formData.Remarks}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Field to Sum</label>
//               <input
//                 type="text"
//                 name="FeildToSum"
//                 value={formData.FeildToSum}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Image URL</label>
//               <input
//                 type="text"
//                 name="ImageURL"
//                 value={formData.ImageURL}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Background Color</label>
//               <input
//                 type="color"
//                 name="BackColor"
//                 value={formData.BackColor}
//                 onChange={handleInputChange}
//                 className="modern-input"
//                 style={{ height: '38px' }}
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Sort Order</label>
//               <input
//                 type="number"
//                 name="dbSort"
//                 value={formData.dbSort}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>X-Axis Label</label>
//               <input
//                 type="text"
//                 name="dbxxLabel"
//                 value={formData.dbxxLabel}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Y-Axis Label</label>
//               <input
//                 type="text"
//                 name="dbyxLabel"
//                 value={formData.dbyxLabel}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Width</label>
//               <input
//                 type="number"
//                 name="dbWidth"
//                 value={formData.dbWidth}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Height</label>
//               <input
//                 type="number"
//                 name="dbHeight"
//                 value={formData.dbHeight}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>X-Axis Field</label>
//               <input
//                 type="text"
//                 name="dbxxField"
//                 value={formData.dbxxField}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Y-Axis Field</label>
//               <input
//                 type="text"
//                 name="dbyxField"
//                 value={formData.dbyxField}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Number Suffix</label>
//               <input
//                 type="text"
//                 name="numberSuffix"
//                 value={formData.numberSuffix}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Parent Code</label>
//               <input
//                 type="text"
//                 name="DBParentCode"
//                 value={formData.DBParentCode}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Office Code</label>
//               <input
//                 type="text"
//                 name="offcode"
//                 value={formData.offcode}
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
//                 placeholder="Search by Code, Description or Type..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="modern-input"
//               />
//             </div>

//             <div className="filter-buttons">
//               <span>Type:</span>
//               <select
//                 value={dbTypeFilter}
//                 onChange={(e) => setDbTypeFilter(e.target.value)}
//                 className="modern-select"
//               >
//                 <option value="all">All Types</option>
//                 {dbTypeOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
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
//               <FaPlus /> New Dashboard Item
//             </button>
//           </div>

//           {/* Horizontal Scrollable List */}
//           <div className="dashboard-list-container glassmorphism">
//             <div className="dashboard-scroll-container">
//               <div className="dashboard-list-header">
//                 <div className="header-cell">Code</div>
//                 <div className="header-cell">Type</div>
//                 <div className="header-cell">Description</div>
//                 <div className="header-cell">Remarks</div>
//                 <div className="header-cell">Dimensions</div>
//                 <div className="header-cell center">Status</div>
//                 <div className="header-cell">Office Code</div>
//                 <div className="header-cell center">Actions</div>
//               </div>

//               <div className="dashboard-list">
//                 {filteredDashboards.length > 0 ? (
//                   filteredDashboards.map((dashboard, idx) => {
//                     const activeValue =
//                       dashboard.IsActive ??
//                       dashboard.isActive ??
//                       dashboard.ISACTIVE ??
//                       dashboard.Active ??
//                       dashboard.ACTIVE ??
//                       false;
//                     const isActive =
//                       typeof activeValue === "boolean"
//                         ? activeValue
//                         : activeValue === "true" ||
//                         activeValue === "1" ||
//                         activeValue === 1;

//                     return (
//                       <div key={idx} className="dashboard-item">
//                         <div className="list-cell">{dashboard.DBCode}</div>
//                         <div className="list-cell">
//                           <span className="type-badge">{dashboard.DBType}</span>
//                         </div>
//                         <div className="list-cell">{dashboard.DBDescription}</div>
//                         <div className="list-cell">{dashboard.Remarks || "-"}</div>
//                         <div className="list-cell">
//                           {dashboard.dbWidth}x{dashboard.dbHeight}
//                         </div>
//                         <div className="list-cell center">
//                           <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                             {isActive ? 'Active' : 'Inactive'}
//                           </span>
//                         </div>
//                         <div className="list-cell">{dashboard.offcode}</div>
//                         <div className="list-cell center actions">
//                           <button
//                             className="btn-edit"
//                             onClick={() => handleEdit(dashboard)}
//                             title="Edit"
//                           >
//                             <FaEdit />
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="no-data">
//                     {searchTerm || dbTypeFilter !== "all" || activeFilter !== "all"
//                       ? "No dashboard items match your search criteria"
//                       : "No dashboard items found"}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSDashboard;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSDashboard = (props) => (
  <HRMSGenericManager 
    moduleType="dashboard"
    {...props}
  />
);

export default HRMSDashboard;