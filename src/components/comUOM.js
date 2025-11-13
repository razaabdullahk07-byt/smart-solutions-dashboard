// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSUOM = () => {
//   const [uoms, setUoms] = useState([]);
//   const [filteredUoms, setFilteredUoms] = useState([]);
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
//     cSHD: "",
//     Isactive: true,
//     offcode: "0101"
//   });

//   const tableName = "comUOM";
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

//   // ✅ Fetch all UOMs
//   const fetchUOMs = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setUoms(rows);
//         setFilteredUoms(rows);
//       } else {
//         setError("Failed to load UOM data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUOMs();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = uoms;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((uom) =>
//         ["ccode", "cname", "cSHD"].some(
//           (key) =>
//             uom[key] &&
//             uom[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((uom) => {
//         const activeValue =
//           uom.Isactive ??
//           uom.isActive ??
//           uom.ISACTIVE ??
//           uom.Active ??
//           uom.ACTIVE ??
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

//     setFilteredUoms(filtered);
//   }, [searchTerm, activeFilter, uoms]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   // ✅ Helper to get next available reason code
//   const getNextCode = () => {
//     if (!uoms || uoms.length === 0) return "1";

//     const codes = uoms
//       .map((r) => parseInt(r.ccode || r.CCODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "1";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(1, "0");
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
//   const handleEdit = (uom) => {
//     setFormData({
//       ccode: uom.ccode || "",
//       cname: uom.cname || "",
//       cSHD: uom.cSHD || "",
//       Isactive:
//         uom.Isactive === true ||
//         uom.Isactive === "true" ||
//         uom.Isactive === 1 ||
//         uom.Isactive === "1" ||
//         uom.ACTIVE === true ||
//         uom.ACTIVE === 1 ||
//         false,
//       offcode: uom.offcode || "0101"
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       // Validate required fields
//       if (!formData.ccode || !formData.cname || !formData.cSHD) {
//         setError("Please fill in all required fields");
//         return;
//       }

//       const payload =
//         editMode === "edit"
//           ? {
//             tableName,
//             data: {
//               cname: formData.cname,
//               cSHD: formData.cSHD,
//               Isactive: formData.Isactive,
//               offcode: formData.offcode
//             },
//             where: { ccode: formData.ccode },
//           }
//           : {
//             tableName,
//             data: {
//               ccode: formData.ccode,
//               cname: formData.cname,
//               cSHD: formData.cSHD,
//               Isactive: formData.Isactive,
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
//         await fetchUOMs();
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
//       cSHD: "",
//       Isactive: true,
//       offcode: "0101"
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>UOM (Unit of Measure) Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading UOMs...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>UOM (Unit of Measure) Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit UOM" : "Add New UOM"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>UOM Code *</label>
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
//               <label>UOM Name *</label>
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
//               <label>Short Code *</label>
//               <input
//                 type="text"
//                 name="cSHD"
//                 value={formData.cSHD}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group checkbox-container">
//               <label className="checkbox-label">
//                 <input
//                   type="checkbox"
//                   name="Isactive"
//                   checked={formData.Isactive}
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
//                 placeholder="Search by Code, Name or Short Code..."
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
//               <FaPlus /> New UOM
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">UOM Code</div>
//               <div className="header-cell">UOM Name</div>
//               <div className="header-cell">Short Code</div>
//               <div className="header-cell center">Status</div>
//               {/* <div className="header-cell">Office Code</div> */}
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredUoms.length > 0 ? (
//                 filteredUoms.map((uom, idx) => {
//                   const activeValue =
//                     uom.Isactive ??
//                     uom.isActive ??
//                     uom.ISACTIVE ??
//                     uom.Active ??
//                     uom.ACTIVE ??
//                     false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" ||
//                       activeValue === "1" ||
//                       activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{uom.ccode}</div>
//                       <div className="list-cell">{uom.cname}</div>
//                       <div className="list-cell">{uom.cSHD}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                           {isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                       {/* <div className="list-cell">{uom.offcode}</div> */}
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(uom)}
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
//                     ? "No UOMs match your search criteria"
//                     : "No UOMs found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSUOM;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSUOM = (props) => (
  <HRMSGenericManager 
    moduleType="uom"
    {...props}
  />
);

export default HRMSUOM;