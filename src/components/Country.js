// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSCountry = () => {
//   const [countries, setCountries] = useState([]);
//   const [filteredCountries, setFilteredCountries] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//   const [formData, setFormData] = useState({
//     CountryID: "",
//     CountryName: "",
//     IsActive: true,
//     offcode: "0101"
//   });

//   const tableName = "country";
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

//   // ✅ Fetch all countries
//   const fetchCountries = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "0101" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setCountries(rows);
//         setFilteredCountries(rows);
//       } else {
//         setError("Failed to load country data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCountries();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = countries;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((country) =>
//         ["CountryID", "CountryName"].some(
//           (key) =>
//             country[key] &&
//             country[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     if (activeFilter !== "all") {
//       const isActive = activeFilter === "active";
//       filtered = filtered.filter((country) => {
//         const activeValue =
//           country.IsActive ??
//           country.isActive ??
//           country.ISACTIVE ??
//           country.Active ??
//           country.ACTIVE ??
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

//     setFilteredCountries(filtered);
//   }, [searchTerm, activeFilter, countries]);

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
//     if (!countries || countries.length === 0) return "001";

//     const codes = countries
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
//   const handleEdit = (country) => {
//     setFormData({
//       CountryID: country.CountryID || "",
//       CountryName: country.CountryName || "",
//       IsActive:
//         country.IsActive === true ||
//         country.IsActive === "true" ||
//         country.IsActive === 1 ||
//         country.IsActive === "1" ||
//         country.ACTIVE === true ||
//         country.ACTIVE === 1,
//       offcode: country.offcode || "0101"
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       // Validate required fields
//       if (!formData.CountryID || !formData.CountryName) {
//         setError("Please fill in all required fields");
//         return;
//       }

//       const payload =
//         editMode === "edit"
//           ? {
//             tableName,
//             data: {
//               CountryName: formData.CountryName,
//               IsActive: formData.IsActive,
//               offcode: formData.offcode
//             },
//             where: { CountryID: formData.CountryID },
//           }
//           : {
//             tableName,
//             data: {
//               CountryID: formData.CountryID,
//               CountryName: formData.CountryName,
//               IsActive: formData.IsActive,
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
//         await fetchCountries();
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
//       CountryID: "",
//       CountryName: "",
//       IsActive: true,
//       offcode: "0101"
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Country Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading countries...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Country Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Country" : "Add New Country"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Country ID *</label>
//               <input
//                 type="text"
//                 name="CountryID"
//                 value={formData.CountryID}
//                 onChange={handleInputChange}
//                 disabled={editMode === "edit"}
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Country Name *</label>
//               <input
//                 type="text"
//                 name="CountryName"
//                 value={formData.CountryName}
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
//                 placeholder="Search by ID or Name..."
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
//               <FaPlus /> New Country
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Country ID</div>
//               <div className="header-cell">Country Name</div>
//               <div className="header-cell center">Status</div>
//               {/* <div className="header-cell">Office Code</div> */}
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredCountries.length > 0 ? (
//                 filteredCountries.map((country, idx) => {
//                   const activeValue =
//                     country.IsActive ??
//                     country.isActive ??
//                     country.ISACTIVE ??
//                     country.Active ??
//                     country.ACTIVE ??
//                     false;
//                   const isActive =
//                     typeof activeValue === "boolean"
//                       ? activeValue
//                       : activeValue === "true" ||
//                       activeValue === "1" ||
//                       activeValue === 1;

//                   return (
//                     <div key={idx} className="category-item">
//                       <div className="list-cell">{country.CountryID}</div>
//                       <div className="list-cell">{country.CountryName}</div>
//                       <div className="list-cell center">
//                         <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
//                           {isActive ? 'Active' : 'Inactive'}
//                         </span>
//                       </div>
//                       {/* <div className="list-cell">{country.offcode}</div> */}
//                       <div className="list-cell center actions">
//                         <button
//                           className="btn-edit"
//                           onClick={() => handleEdit(country)}
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
//                     ? "No countries match your search criteria"
//                     : "No countries found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSCountry;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSCountry = (props) => (
  <HRMSGenericManager 
    moduleType="country"
    {...props}
  />
);

export default HRMSCountry;