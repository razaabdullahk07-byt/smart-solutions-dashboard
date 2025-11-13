// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSVehicleType = () => {
//   const [categories, setCategories] = useState([]);
// const [filteredCategories, setFilteredCategories] = useState([]);

//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [filteredVehicleTypes, setFilteredVehicleTypes] = useState([]);
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
//     isActive: true
//   });

//   const tableName = "comVehicleType";
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

//   // ✅ Fetch all vehicle types
//   const fetchVehicleTypes = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setVehicleTypes(rows);
//         setFilteredVehicleTypes(rows);
//       } else {
//         setError("Failed to load vehicle type data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVehicleTypes();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = vehicleTypes;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((vehicleType) =>
//         ["ccode", "cname"].some(
//           (key) =>
//             vehicleType[key] &&
//             vehicleType[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((vehicleType) => {
//         const activeValue =
//           vehicleType.isActive ??
//           vehicleType.IsActive ??
//           vehicleType.ISACTIVE ??
//           vehicleType.Active ??
//           vehicleType.ACTIVE ??
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

//     setFilteredVehicleTypes(filtered);
//   }, [searchTerm, activeFilter, vehicleTypes]);

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
//   const handleEdit = (vehicleType) => {
//     setFormData({
//       ccode: vehicleType.ccode || "",
//       cname: vehicleType.cname || "",
//       isActive:
//         vehicleType.isActive === true ||
//         vehicleType.isActive === "true" ||
//         vehicleType.isActive === 1 ||
//         vehicleType.isActive === "1" ||
//         vehicleType.ACTIVE === true ||
//         vehicleType.ACTIVE === 1 ||
//         false
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
//               isActive: formData.isActive
//             },
//             where: { ccode: formData.ccode },
//           }
//           : {
//             tableName,
//             data: {
//               ccode: formData.ccode,
//               cname: formData.cname,
//               isActive: formData.isActive
//             },
//           };

//       const url =
//         editMode === "edit"
//           ? `${API_BASE}/Supdate-table-data`
//           : `${API_BASE}/Sinsert-table-data`;

//       const res = await fetchJson(url, {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       if (res.success) {
//         await fetchVehicleTypes();
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
//       isActive: true
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Vehicle Type Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading vehicle types...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Vehicle Type Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Vehicle Type" : "Add New Vehicle Type"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Vehicle Type Code *</label>
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
//               <label>Vehicle Type Name *</label>
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
//               <FaPlus /> New Vehicle Type
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Vehicle Type Code</div>
//               <div className="header-cell">Vehicle Type Name</div>
//               <div className="header-cell center">Status</div>
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredVehicleTypes.length > 0 ? (
//                 filteredVehicleTypes.map((vehicleType, idx) => {
//                   const activeValue =
//                     vehicleType.isActive ??
//                     vehicleType.IsActive ??
//                     vehicleType.ISACTIVE ??
//                     vehicleType.Active ??
//                     vehicleType.ACTIVE ??
//                     false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" ||
//                       activeValue === "1" ||
//                       activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{vehicleType.ccode}</div>
//                       <div className="list-cell">{vehicleType.cname}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                           {isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(vehicleType)}
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
//                     ? "No vehicle types match your search criteria"
//                     : "No vehicle types found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSVehicleType;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSVehicleType = (props) => (
  <HRMSGenericManager 
    moduleType="vehicletype"
    {...props}
  />
);

export default HRMSVehicleType;