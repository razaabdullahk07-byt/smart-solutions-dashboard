// import React, { useState, useEffect } from "react";
// import "./HRMSDesignation.css";
// import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

// const HRMSCurrency = () => {
//   const [currencies, setCurrencies] = useState([]);
//   const [filteredCurrencies, setFilteredCurrencies] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Form state
//   const [isEditing, setIsEditing] = useState(false);
//   const [editMode, setEditMode] = useState("new"); // "new" | "edit"
//   const [formData, setFormData] = useState({
//     currencyCode: "",
//     currencyName: "",
//     currencyLable: "",
//     offcode: "0101"
//   });

//   const tableName = "comCurrency";
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

//   // ✅ Fetch all currencies
//   const fetchCurrencies = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchJson(`${API_BASE}/get-table-data`, {
//         method: "POST",
//         body: JSON.stringify({ tableName, offcode: "0101" }),
//       });

//       if (data.success && (data.data || data.rows)) {
//         const rows = data.data || data.rows;
//         setCurrencies(rows);
//         setFilteredCurrencies(rows);
//       } else {
//         setError("Failed to load currency data");
//       }
//     } catch (err) {
//       setError(`Error: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCurrencies();
//   }, []);

//   // ✅ Filtering
//   useEffect(() => {
//     let filtered = currencies;

//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((currency) =>
//         ["currencyCode", "currencyName", "currencyLable"].some(
//           (key) =>
//             currency[key] &&
//             currency[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
//         )
//       );
//     }

//     setFilteredCurrencies(filtered);
//   }, [searchTerm, currencies]);

//   // ✅ Input handler
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // ✅ Helper to get next available currency code
//   const getNextCode = () => {
//     if (!currencies || currencies.length === 0) return "1";

//     const codes = currencies
//       .map((r) => parseInt(r.currencyCode || r.CURRENCYCODE || "0", 10))
//       .filter((n) => !isNaN(n));

//     if (codes.length === 0) return "1";

//     const maxCode = Math.max(...codes);
//     return (maxCode + 1).toString().padStart(1, "0"); // 001, 002, 003...
//   };

//   // ✅ Open form for new
//   const handleNew = () => {
//     setFormData({
//       currencyCode: getNextCode(), // ✅ Auto-generate code
//       currencyName: "",
//       currencyLable: "",
//       offcode: "0101",
//     });
//     setEditMode("new");
//     setIsEditing(true);
//   };


//   // ✅ Open form for edit
//   const handleEdit = (currency) => {
//     setFormData({
//       currencyCode: currency.currencyCode || "",
//       currencyName: currency.currencyName || "",
//       currencyLable: currency.currencyLable || "",
//       offcode: currency.offcode || "0101"
//     });
//     setEditMode("edit");
//     setIsEditing(true);
//   };

//   // ✅ Save or Update
//   const handleSave = async () => {
//     try {
//       // Validate required fields
//       if (!formData.currencyCode || !formData.currencyName || !formData.currencyLable) {
//         setError("Please fill in all required fields");
//         return;
//       }

//       const payload =
//         editMode === "edit"
//           ? {
//             tableName,
//             data: {
//               currencyName: formData.currencyName,
//               currencyLable: formData.currencyLable,
//               offcode: formData.offcode
//             },
//             where: { currencyCode: formData.currencyCode },
//           }
//           : {
//             tableName,
//             data: {
//               currencyCode: formData.currencyCode,
//               currencyName: formData.currencyName,
//               currencyLable: formData.currencyLable,
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
//         await fetchCurrencies();
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
//       currencyCode: "",
//       currencyName: "",
//       currencyLable: "",
//       offcode: "0101"
//     });
//   };

//   // ---------------------------------------------------
//   // UI
//   // ---------------------------------------------------

//   if (loading) {
//     return (
//       <div className="category-container">
//         <h2>Currency Management</h2>
//         <div className="loading-spinner"></div>
//         <p>Loading currencies...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="category-container">
//       <div className="header-section">
//         <h2>Currency Management</h2>
//         <div className="accent-line"></div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {isEditing ? (
//         <div className="category-form glassmorphism">
//           <h3>{editMode === "edit" ? "Edit Currency" : "Add New Currency"}</h3>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Currency Code *</label>
//               <input
//                 type="text"
//                 name="currencyCode"
//                 value={formData.currencyCode}
//                 onChange={handleInputChange}
//                 disabled
//                 className="modern-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Currency Name *</label>
//               <input
//                 type="text"
//                 name="currencyName"
//                 value={formData.currencyName}
//                 onChange={handleInputChange}
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Currency Label *</label>
//               <input
//                 type="text"
//                 name="currencyLable"
//                 value={formData.currencyLable}
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
//                 placeholder="Search by Code, Name or Label..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="modern-input"
//               />
//             </div>

//             <button className="btn new" onClick={handleNew}>
//               <FaPlus /> New Currency
//             </button>
//           </div>

//           {/* List */}
//           <div className="category-list-container glassmorphism">
//             <div className="category-list-header">
//               <div className="header-cell">Currency Code</div>
//               <div className="header-cell">Currency Name</div>
//               <div className="header-cell">Currency Label</div>
//               <div className="header-cell">Office Code</div>
//               <div className="header-cell center">Actions</div>
//             </div>

//             <div className="category-list">
//               {filteredCurrencies.length > 0 ? (
//                 filteredCurrencies.map((currency, idx) => (
//                   <div key={idx} className="category-item">
//                     <div className="list-cell">{currency.currencyCode}</div>
//                     <div className="list-cell">{currency.currencyName}</div>
//                     <div className="list-cell">{currency.currencyLable}</div>
//                     <div className="list-cell">{currency.offcode}</div>
//                     <div className="list-cell center actions">
//                       <button
//                         className="btn-edit"
//                         onClick={() => handleEdit(currency)}
//                         title="Edit"
//                       >
//                         <FaEdit />
//                       </button>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="no-data">
//                   {searchTerm
//                     ? "No currencies match your search criteria"
//                     : "No currencies found"}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default HRMSCurrency;

import React from 'react';
import HRMSGenericManager from './HRMSGenericManager';

const HRMSCurrency = (props) => (
  <HRMSGenericManager 
    moduleType="currency"
    {...props}
  />
);

export default HRMSCurrency;