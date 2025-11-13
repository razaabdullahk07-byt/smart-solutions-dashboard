// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch } from "react-icons/fa";

// const LndFloor = () => {
//   const [floors, setFloors] = useState([]);
//   const [filteredFloors, setFilteredFloors] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new");
//   const [formData, setFormData] = useState({
//     FloorCode: "",
//     FloorDesc: "",
//     FloorSHD: "",
//     IsActive: true,
//     offcode: "0101",
//   });

//   const tableName = "lndFloor";
//   const API_BASE = "http://192.168.100.113:8081/api";

//   // ✅ Helper for fetch
//   const fetchJson = async (url, options = {}) => {
//     const res = await fetch(url, {
//       headers: { "Content-Type": "application/json", ...options.headers },
//       ...options,
//     });
//     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
//     return await res.json();
//   };

//   // ✅ Fetch floors
//   const fetchFloors = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setFloors(rows);
//         setFilteredFloors(rows);
//       } else {
//         setFloors([]);
//         setFilteredFloors([]);
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFloors();
//   }, []);

//   // ✅ Filtering logic
//   useEffect(() => {
//     let filtered = floors;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((floor) =>
//         ["FloorCode", "FloorDesc", "FloorSHD"].some(
//           (key) =>
//             floor[key] &&
//             floor[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((floor) => {
//         const activeValue =
//           floor.IsActive ?? floor.isActive ?? floor.ACTIVE ?? false;
//         const itemActive =
//           typeof activeValue === "boolean"
//             ? activeValue
//             : activeValue === "true" || activeValue === "1" || activeValue === 1;
//         return itemActive === isActive;
//       });
//     }

//     setFilteredFloors(filtered);
//   }, [searchTerm, activeFilter, floors]);

//   // ✅ Input change
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ✅ Generate next available FloorCode
//   const getNextCode = () => {
//     if (!floors || floors.length === 0) return "001";

//     const codes = floors
//       .map((f) => parseInt(f.FloorCode || f.FLOORCODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "001";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(3, "0");
//   };

//   // ✅ New floor
//   const handleNew = () => {
//     setFormData({
//       FloorCode: getNextCode(), // ✅ Auto-generated FloorCode
//       FloorDesc: "",
//       FloorSHD: "",
//       IsActive: true,
//       offcode: "0101",
//     });
//     setEditMode("new");
//     setIsEditing(true);
//   };

//   // ✅ Edit floor
//   const handleEdit = (floor) => {
//     setFormData({
//       FloorCode: floor.FloorCode || "",
//       FloorDesc: floor.FloorDesc || "",
//       FloorSHD: floor.FloorSHD || "",
//       IsActive:
//         floor.IsActive === true ||
//         floor.IsActive === "true" ||
//         floor.IsActive === 1 ||
//         floor.IsActive === "1",
//       offcode: floor.offcode,
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or update
//   const handleSave = async () => {
//     try {
//       if (!formData.FloorCode || !formData.FloorDesc) {
//         setError("Please fill in Floor Code & Description");
//         return;
//       }

//       const payload =
//         editMode === "edit"
//           ? {
//               tableName,
//               data: {
//                 FloorDesc: formData.FloorDesc,
//                 FloorSHD: formData.FloorSHD,
//                 IsActive: formData.IsActive,
//                 offcode: formData.offcode,
//               },
//               where: { FloorCode: formData.FloorCode },
//             }
//           : {
//               tableName,
//               data: {
//                 FloorCode: formData.FloorCode,
//                 FloorDesc: formData.FloorDesc,
//                 FloorSHD: formData.FloorSHD,
//                 IsActive: formData.IsActive,
//                 offcode: formData.offcode,
//               },
//             };

//       const url =
//         editMode === "edit"
//           ? `${API_BASE}/update-table-data`
//           : `${API_BASE}/insert-table-data`;

//       const res = await fetchJson(url, {
//         method: "POST",
//         body: JSON.stringify(payload),
//       });

//       if (res.success) {
//         await fetchFloors();
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
//       FloorCode: "",
//       FloorDesc: "",
//       FloorSHD: "",
//       IsActive: true,
//       offcode: "0101",
//     });
//   };

//   // ✅ UI
//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Floor Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading floors...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Floor Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Floor" : "Add New Floor"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Floor Code *</label>
//               <input
//                 type="text"
//                 name="FloorCode"
//                 value={formData.FloorCode}
//                 onChange={handleInputChange}
//                 disabled
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Floor Description *</label>
//               <input
//                 type="text"
//                 name="FloorDesc"
//                 value={formData.FloorDesc}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Short Name</label>
//               <input
//                 type="text"
//                 name="FloorSHD"
//                 value={formData.FloorSHD}
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
//                 placeholder="Search by Code, Description or Short Name..."
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
//               <FaPlus /> New Floor
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Floor Code</div>
//               <div className="header-cell">Description</div>
//               <div className="header-cell">Short Name</div>
//               <div className="header-cell center">Status</div>
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredFloors.length > 0 ? (
//                 filteredFloors.map((floor, idx) => {
//                   const activeValue =
//                     floor.IsActive ?? floor.isActive ?? floor.ACTIVE ?? false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" || activeValue === "1" || activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{floor.FloorCode}</div>
//                       <div className="list-cell">{floor.FloorDesc}</div>
//                       <div className="list-cell">{floor.FloorSHD}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
//                           {isActive ? "Active" : "Inactive"}
//                         </span>
//                       </div>
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(floor)}
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
//                     ? "No floors match your search criteria"
//                     : "No floors found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default LndFloor;


import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const LndFloor = (props) => (
  <HRMSGenericManager 
    moduleType="floor"
    {...props}
  />
);

export default LndFloor;