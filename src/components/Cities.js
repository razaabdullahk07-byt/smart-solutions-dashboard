import React, { useState, useEffect } from "react";
import "./HRMSDesignation.css";
import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter } from "react-icons/fa";

const HRMSCity = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("all");
    const [activeFilter, setActiveFilter] = useState("all");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingCountries, setLoadingCountries] = useState(true);

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [editMode, setEditMode] = useState("new"); // "new" | "edit"
    const [formData, setFormData] = useState({
        CityID: "",
        CityName: "",
        CountryID: "",
        RegionID: "",
        IsActive: true,
        offcode: "0101"
    });

    const tableName = "cities";
    const countryTableName = "country";
    const API_BASE = "http://192.168.100.113:8081/api";

    // ✅ Helper to fetch JSON safely
    const fetchJson = async (url, options = {}) => {
        const res = await fetch(url, {
            headers: { "Content-Type": "application/json", ...options.headers },
            ...options,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    };

    // ✅ Fetch all countries for dropdown
    const fetchCountries = async () => {
        try {
            setLoadingCountries(true);
            const data = await fetchJson(`${API_BASE}/get-table-data`, {
                method: "POST",
                body: JSON.stringify({ tableName: countryTableName, offcode: "0101" }),
            });

            if (data.success && (data.data || data.rows)) {
                const rows = data.data || data.rows;
                setCountries(rows);
            } else {
                setError("Failed to load country data");
            }
        } catch (err) {
            setError(`Error loading countries: ${err.message}`);
        } finally {
            setLoadingCountries(false);
        }
    };

    // ✅ Fetch all cities
    const fetchCities = async () => {
        try {
            setLoading(true);
            const data = await fetchJson(`${API_BASE}/get-table-data`, {
                method: "POST",
                body: JSON.stringify({ tableName, offcode: "0101" }),
            });

            if (data.success && (data.data || data.rows)) {
                const rows = data.data || data.rows;
                setCities(rows);
                setFilteredCities(rows);
            } else {
                setError("Failed to load city data");
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCountries();
        fetchCities();
    }, []);

    // ✅ Filtering
    useEffect(() => {
        let filtered = cities;

        if (searchTerm.trim() !== "") {
            filtered = filtered.filter((city) =>
                ["CityID", "CityName", "RegionID"].some(
                    (key) =>
                        city[key] &&
                        city[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (countryFilter !== "all") {
            filtered = filtered.filter((city) => city.CountryID === countryFilter);
        }

        if (activeFilter !== "all") {
            const isActive = activeFilter === "active";
            filtered = filtered.filter((city) => {
                const activeValue =
                    city.IsActive ??
                    city.isActive ??
                    city.ISACTIVE ??
                    city.Active ??
                    city.ACTIVE ??
                    false;
                const itemActive =
                    typeof activeValue === "boolean"
                        ? activeValue
                        : activeValue === "true" ||
                        activeValue === "1" ||
                        activeValue === 1;
                return itemActive === isActive;
            });
        }

        setFilteredCities(filtered);
    }, [searchTerm, countryFilter, activeFilter, cities]);

    // ✅ Input handler
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ✅ Helper to get next available code
    const getNextCode = () => {
        if (!categories || categories.length === 0) return "001";

        const codes = categories
            .map((c) => parseInt(c.Code || c.CODE || "0", 10))
            .filter((n) => !isNaN(n));

        if (codes.length === 0) return "001";

        const maxCode = Math.max(...codes);
        return (maxCode + 1).toString().padStart(3, "0");
    };
    // ✅ Open form for new
    const handleNew = () => {
        setFormData({
            Code: getNextCode(),  // <-- AUTO-GENERATED HERE
            Name: "",
            IsActive: true,       // default new records as active
            IsOverTimeAllow: false,
        });
        setEditMode("new");
        setIsEditing(true);
    };

    // ✅ Open form for edit
    const handleEdit = (city) => {
        setFormData({
            CityID: city.CityID || "",
            CityName: city.CityName || "",
            CountryID: city.CountryID || "",
            RegionID: city.RegionID || "",
            IsActive:
                city.IsActive === true ||
                city.IsActive === "true" ||
                city.IsActive === 1 ||
                city.IsActive === "1" ||
                city.ACTIVE === true ||
                city.ACTIVE === 1,
            offcode: city.offcode || "0101"
        });
        setEditMode("edit");
        setIsEditing(true);
    };

    // ✅ Save or Update
    const handleSave = async () => {
        try {
            // Validate required fields
            if (!formData.CityID || !formData.CityName || !formData.CountryID) {
                setError("Please fill in all required fields");
                return;
            }

            const payload =
                editMode === "edit"
                    ? {
                        tableName,
                        data: {
                            CityName: formData.CityName,
                            CountryID: formData.CountryID,
                            RegionID: formData.RegionID,
                            IsActive: formData.IsActive,
                            offcode: formData.offcode
                        },
                        where: { CityID: formData.CityID },
                    }
                    : {
                        tableName,
                        data: {
                            CityID: formData.CityID,
                            CityName: formData.CityName,
                            CountryID: formData.CountryID,
                            RegionID: formData.RegionID,
                            IsActive: formData.IsActive,
                            offcode: formData.offcode
                        },
                    };

            const url =
                editMode === "edit"
                    ? `${API_BASE}/update-table-data`
                    : `${API_BASE}/insert-table-data`;

            const res = await fetchJson(url, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (res.success) {
                await fetchCities();
                setIsEditing(false);
                setError(null);
            } else {
                setError("❌ Operation failed: " + (res.error || "Unknown error"));
            }
        } catch (err) {
            setError("❌ Error: " + err.message);
        }
    };

    // ✅ Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            CityID: "",
            CityName: "",
            CountryID: "",
            RegionID: "",
            IsActive: true,
            offcode: "0101"
        });
    };

    // ✅ Get country name by ID
    const getCountryName = (countryId) => {
        const country = countries.find(c => c.CountryID === countryId);
        return country ? country.CountryName : "Unknown";
    };

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------

    if (loading || loadingCountries) {
        return (
            <div className="category-container">
                <h2>City Management</h2>
                <div className="loading-spinner"></div>
                <p>Loading data...</p>
            </div>
        );
    }

    return (
        <div className="category-container">
            <div className="header-section">
                <h2>City Management</h2>
                <div className="accent-line"></div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {isEditing ? (
                <div className="category-form glassmorphism">
                    <h3>{editMode === "edit" ? "Edit City" : "Add New City"}</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>City ID *</label>
                            <input
                                type="text"
                                name="CityID"
                                value={formData.CityID}
                                onChange={handleInputChange}
                                disabled={editMode === "edit"}
                                className="modern-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>City Name *</label>
                            <input
                                type="text"
                                name="CityName"
                                value={formData.CityName}
                                onChange={handleInputChange}
                                className="modern-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Country *</label>
                            <select
                                name="CountryID"
                                value={formData.CountryID}
                                onChange={handleInputChange}
                                className="modern-input"
                                required
                            >
                                <option value="">Select Country</option>
                                {countries.map(country => (
                                    <option key={country.CountryID} value={country.CountryID}>
                                        {country.CountryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Region ID</label>
                            <input
                                type="text"
                                name="RegionID"
                                value={formData.RegionID}
                                onChange={handleInputChange}
                                className="modern-input"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group checkbox-container">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="IsActive"
                                    checked={formData.IsActive}
                                    onChange={handleInputChange}
                                    className="modern-checkbox"
                                />
                                <span className="checkmark"></span>
                                Active
                            </label>
                        </div>

                        <div className="form-group">
                            <label>Office Code</label>
                            <input
                                type="text"
                                name="offcode"
                                value={formData.offcode}
                                onChange={handleInputChange}
                                className="modern-input"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn save" onClick={handleSave}>
                            <FaSave /> {editMode === "edit" ? "Update" : "Save"}
                        </button>
                        <button className="btn cancel" onClick={handleCancel}>
                            <FaTimes /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="category-toolbar glassmorphism">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by ID, Name or Region..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="modern-input"
                            />
                        </div>


                        <div className="filter-buttons">
                            <span>Status:</span>
                            <button
                                className={activeFilter === "all" ? "btn-filter active" : "btn-filter"}
                                onClick={() => setActiveFilter("all")}
                            >
                                All
                            </button>
                            <button
                                className={activeFilter === "active" ? "btn-filter active" : "btn-filter"}
                                onClick={() => setActiveFilter("active")}
                            >
                                Active
                            </button>
                            <button
                                className={activeFilter === "inactive" ? "btn-filter active" : "btn-filter"}
                                onClick={() => setActiveFilter("inactive")}
                            >
                                Inactive
                            </button>
                        </div>
                        <div className="filter-buttons">
                            <span>Country:</span>
                            <select
                                value={countryFilter}
                                onChange={(e) => setCountryFilter(e.target.value)}
                                className="modern-select"
                            >
                                <option value="all">All Countries</option>
                                {countries.map(country => (
                                    <option key={country.CountryID} value={country.CountryID}>
                                        {country.CountryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button className="btn new" onClick={handleNew}>
                            <FaPlus /> New City
                        </button>
                    </div>

                    {/* List */}
                    <div className="category-list-container glassmorphism">
                        <div className="category-list-header">
                            <div className="header-cell">City ID</div>
                            <div className="header-cell">City Name</div>
                            {/* <div className="header-cell">Country</div> */}
                            <div className="header-cell">Region ID</div>
                            <div className="header-cell center">Status</div>
                            <div className="header-cell center">Actions</div>
                        </div>

                        <div className="category-list">
                            {filteredCities.length > 0 ? (
                                filteredCities.map((city, idx) => {
                                    const activeValue =
                                        city.IsActive ??
                                        city.isActive ??
                                        city.ISACTIVE ??
                                        city.Active ??
                                        city.ACTIVE ??
                                        false;
                                    const isActive =
                                        typeof activeValue === "boolean"
                                            ? activeValue
                                            : activeValue === "true" ||
                                            activeValue === "1" ||
                                            activeValue === 1;

                                    return (
                                        <div key={idx} className="category-item">
                                            <div className="list-cell">{city.CityID}</div>
                                            <div className="list-cell">{city.CityName}</div>
                                            {/* <div className="list-cell">{getCountryName(city.CountryID)}</div> */}
                                            <div className="list-cell">{city.RegionID || "-"}</div>
                                            <div className="list-cell center">
                                                <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="list-cell center actions">
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(city)}
                                                    title="Edit"
                                                >
                                                    <FaEdit />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-data">
                                    {searchTerm || countryFilter !== "all" || activeFilter !== "all"
                                        ? "No cities match your search criteria"
                                        : "No cities found"}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HRMSCity;