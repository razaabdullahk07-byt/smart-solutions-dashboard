import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./ChartofAccount.css";
import { AuthContext } from "../AuthContext";

/* ---------------------------
 * API & Configuration
---------------------------- */
const API_CONFIG = {
    BASE_URL: 'http://192.168.100.113:8081/api',
    TABLES: {
        COUNTRY: 'Country',
        CITIES: 'cities'
    },
    GET_URL: 'http://192.168.100.113:8081/api/get-table-data',
    INSERT_URL: 'http://192.168.100.113:8081/api/insert-table-data',
    UPDATE_URL: 'http://192.168.100.113:8081/api/update-table-data',
    DELETE_URL: 'http://192.168.100.113:8081/api/delete-table-data',
};

/* ---------------------------
 * Auth Hook
---------------------------- */
const useAuth = () => useContext(AuthContext);

/* ---------------------------
 * Utilities & Icons
---------------------------- */
const normalizeValue = (value) => {
    if (value === null || value === undefined || value === 'null' || value === 'undefined') return '';
    return String(value);
};

const Icon = {
    Save: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
    Plus: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
    Edit: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    Trash: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6M1 6h22"></path></svg>,
    Search: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Refresh: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6" /><path d="M21.02 12.8C20.45 18.05 16.94 22 12 22A9 9 0 0 1 3 13m1.27-5.8C4.55 3.95 7.84 2 12 2h.1C16.94 2 20.45 5.95 21.02 11.2" /></svg>,
    MapPin: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Globe: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
    Loader: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loader"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>,
    CheckCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    XCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15 15"></line></svg>,
};

/* ---------------------------
 * Initial State
---------------------------- */
const getInitialCityData = (offcode = '0101') => ({
    CountryID: '',
    CityID: '',
    RegionID: '1',
    CityName: '',
    IsActive: 'true',
    offcode: offcode
});

/* ---------------------------
 * Data Service Hook
---------------------------- */
const useCityDataService = () => {
    const { credentials } = useAuth();
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTableData = async (tableName) => {
        try {
            const payload = { tableName };
            const resp = await fetch(API_CONFIG.GET_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            return Array.isArray(data.rows) ? data.rows : [];
        } catch (err) {
            console.error(`Error fetching ${tableName}:`, err);
            return [];
        }
    };

    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const currentOffcode = normalizeValue(credentials?.company?.offcode) || '0101';

            const [countryData, cityData] = await Promise.all([
                fetchTableData(API_CONFIG.TABLES.COUNTRY),
                fetchTableData(API_CONFIG.TABLES.CITIES)
            ]);

            // Filter data by current offcode, ensuring offcode values are normalized for comparison
            const filteredCountries = countryData.filter(c =>
                normalizeValue(c.offcode) === currentOffcode
            );

            const filteredCities = cityData.filter(c =>
                normalizeValue(c.offcode) === currentOffcode
            );

            setCountries(filteredCountries);
            setCities(filteredCities);

        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [credentials]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    return { countries, cities, isLoading, error, refetch: loadAllData, setError };
};

/* ---------------------------
 * City Form Component
---------------------------- */
const CityForm = ({
    formData,
    onFormChange,
    onSave,
    onNewCity,
    currentMode,
    isLoading,
    countries
}) => {
    const { credentials } = useAuth();
    const currentOffcode = normalizeValue(credentials?.company?.offcode) || '0101';

    const {
        CountryID,
        CityID,
        RegionID,
        CityName,
        IsActive
    } = formData;

    const handleInput = (field, value) => onFormChange(field, value);
    const handleCheckbox = (field, e) => onFormChange(field, e.target.checked ? 'true' : 'false');

    const isNewMode = currentMode === 'new';
    const selectedCountry = countries.find(c => c.CountryID === CountryID);

    return (
        <section className="detail-panel">
            <div className="detail-header">
                <div className="header-content">
                    <h1>{isNewMode ? 'Add New City' : `Edit City: ${CityName || 'City'}`}</h1>
                    <div className="header-subtitle">
                        <span className="mode-badge">{isNewMode ? 'NEW' : 'EDIT'}</span>
                        <span className="muted">• {normalizeValue(CityID) || 'No ID'}</span>
                        <span className="muted">• Office: {currentOffcode}</span>
                        {selectedCountry && (
                            <span className="muted">• Country: {selectedCountry.CountryName}</span>
                        )}
                        {!(IsActive === 'true') && <span className="inactive-badge">INACTIVE</span>}
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={onNewCity}
                    >
                        <Icon.Plus /> New City
                    </button>
                    <button
                        className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                        onClick={onSave}
                        disabled={isLoading || !CityName?.trim() || !CountryID?.trim()}
                    >
                        {isLoading ? <Icon.Loader className="spin" /> : <Icon.Save />}
                        {isLoading ? 'Saving...' : 'Save City'}
                    </button>
                </div>
            </div>

            <div className="detail-body">
                <div className="form-section expanded">
                    <div className="section-header">
                        <div className="section-title">
                            <Icon.MapPin />
                            <h3>City Information</h3>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="form-grid grid-3-col">
                            {/* COUNTRY SELECT REMAINS HERE */}
                            <div className="form-group required">
                                <label>Country *</label>
                                <select
                                    value={CountryID}
                                    onChange={e => handleInput('CountryID', e.target.value)}
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(country => (
                                        <option key={country.CountryID} value={country.CountryID}>
                                            {country.CountryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group required">
                                <label>City Name *</label>
                                <input
                                    type="text"
                                    value={CityName}
                                    onChange={e => handleInput('CityName', e.target.value)}
                                    placeholder="Enter city name"
                                />
                            </div>

                            <div className="form-group">
                                <label>City ID</label>
                                <input
                                    type="text"
                                    value={CityID}
                                    onChange={e => handleInput('CityID', e.target.value)}
                                    placeholder={isNewMode ? "Auto-generated" : "City ID"}
                                    disabled={!isNewMode}
                                    className="mono"
                                />
                                {isNewMode && (
                                    <div className="hint">
                                        ID will be auto-generated based on selected country
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Region ID</label>
                                <input
                                    type="text"
                                    value={RegionID}
                                    onChange={e => handleInput('RegionID', e.target.value)}
                                    placeholder="Region ID (e.g., 1)"
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="IsActive"
                                    checked={IsActive === 'true'}
                                    onChange={e => handleCheckbox('IsActive', e)}
                                />
                                <label htmlFor="IsActive">City is Active</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ---------------------------
 * City Management Main Component (CityProfile)
---------------------------- */
const CityProfile = () => {
    const { credentials } = useAuth();
    const currentOffcode = normalizeValue(credentials?.company?.offcode) || '0101';
    const currentUser = credentials?.username || 'SYSTEM';

    const { countries, cities, isLoading: isDataLoading, error, refetch, setError } = useCityDataService();

    const [selectedCity, setSelectedCity] = useState(null);
    const [formData, setFormData] = useState(() => getInitialCityData(currentOffcode));
    const [currentMode, setCurrentMode] = useState('new');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // --- UPDATED LOGIC ---
    // The filter is now based on the CountryID in the formData, not a separate selectedCountry state.
    const selectedCountryIdForFilter = formData.CountryID; 

    // Filter cities based on selected country (from formData) and search term
    const filteredCities = cities.filter(city => {
        // Only show cities for the currently selected country in the form
        const matchesCountry = !selectedCountryIdForFilter || city.CountryID === selectedCountryIdForFilter;
        
        const normalizedSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = !normalizedSearchTerm || 
            normalizeValue(city.CityName).toLowerCase().includes(normalizedSearchTerm) ||
            normalizeValue(city.CityID).includes(normalizedSearchTerm);
        
        return matchesCountry && matchesSearch;
    });
    // --- END UPDATED LOGIC ---

    // Group cities by country for display (this will only contain one country or none based on the filter)
    const citiesByCountry = filteredCities.reduce((acc, city) => {
        const countryId = city.CountryID;
        if (!acc[countryId]) {
            acc[countryId] = {
                country: countries.find(c => c.CountryID === countryId),
                cities: []
            };
        }
        acc[countryId].cities.push(city);
        return acc;
    }, {});

    // Generate city ID for new record
    const generateCityId = useCallback((countryId) => {
        if (!countryId) return '';

        const countryCities = cities.filter(c => c.CountryID === countryId);
        
        const maxId = countryCities.reduce((max, c) => {
            const id = parseInt(normalizeValue(c.CityID), 10);
            return (id > max) ? id : max;
        }, 0);

        return (maxId + 1).toString();
    }, [cities]);

    // Initialize form data for new record when mode changes to 'new'
    useEffect(() => {
        if (currentMode === 'new') {
            // Default country can be the first in the list if no country is currently selected in the form
            const defaultCountryId = formData.CountryID || countries[0]?.CountryID || ''; 
            const newCityId = generateCityId(defaultCountryId);

            setFormData(prev => ({
                ...getInitialCityData(currentOffcode),
                CountryID: defaultCountryId,
                CityID: newCityId
            }));

            if (defaultCountryId) {
                const countryName = countries.find(c => c.CountryID === defaultCountryId)?.CountryName;
                setMessage(`Ready to add new city for ${countryName}. Auto-generated ID: ${newCityId}`);
            } else {
                setMessage('Ready to add new city. Please select a country.');
            }
        }
    // Note: Removed selectedCountry from dependencies here since we removed that state
    }, [currentMode, currentOffcode, countries, generateCityId]);

    // Update city ID when country changes in new mode, AND load cities for filtering
    const handleFormChange = (field, value) => {
        setFormData(prev => {
            let newState = { ...prev, [field]: value };

            // Logic for CountryID change
            if (field === 'CountryID' && currentMode === 'new') {
                const newCityId = generateCityId(value);
                newState.CityID = newCityId;
            }

            // If we are changing CountryID in edit mode, ensure CityID is preserved
            // but the sidebar list will automatically update due to the dependency below

            return newState;
        });
    };

    const handleSelectCity = (city) => {
        // When selecting a city, make sure the form is populated correctly
        const normalizedCity = Object.keys(getInitialCityData()).reduce((acc, key) => {
            acc[key] = normalizeValue(city[key] || getInitialCityData()[key]);
            return acc;
        }, {});
        
        setSelectedCity(city);
        setFormData(normalizedCity); // Load data to form
        setCurrentMode('edit');
        setMessage(`Editing: ${normalizeValue(city.CityName)}`);
    };

    const handleNewCity = () => {
        setSelectedCity(null);
        setCurrentMode('new');
        // The useEffect will reset formData based on the current CountryID in the old formData or the first country
    };

    const handleSave = async () => {
        // Validation... (same as before)
        if (!formData.CityName.trim()) {
            setMessage('❌ City Name is required!');
            return;
        }

        if (!formData.CountryID.trim()) {
            setMessage('❌ Country is required!');
            return;
        }

        if (!formData.CityID.trim()) {
            setMessage('❌ City ID is required!');
            return;
        }

        // Check for duplicate city name in the same country
        const duplicateCity = cities.find(c => 
            c.CountryID === formData.CountryID && 
            normalizeValue(c.CityName).toLowerCase() === formData.CityName.toLowerCase() &&
            (currentMode === 'new' || c.CityID !== formData.CityID)
        );

        if (duplicateCity) {
            setMessage('❌ A city with this name already exists in the selected country!');
            return;
        }

        setIsSaving(true);
        setMessage('');

        const url = currentMode === 'new' ? API_CONFIG.INSERT_URL : API_CONFIG.UPDATE_URL;

        const dataToSave = {
            ...formData,
            offcode: currentOffcode,
            IsActive: formData.IsActive === 'true' ? 'true' : 'false'
        };

        const payload = {
            tableName: API_CONFIG.TABLES.CITIES,
            data: dataToSave
        };

        if (currentMode === 'edit') {
            payload.where = {
                CityID: formData.CityID,
                CountryID: formData.CountryID,
                offcode: currentOffcode
            };
        }

        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const result = await resp.json();

            if (result.success) {
                setMessage('✅ City saved successfully!');
                await refetch();

                if (currentMode === 'new') {
                    setSelectedCity(dataToSave);
                    setCurrentMode('edit');
                } else {
                    setSelectedCity(dataToSave);
                }
            } else {
                setMessage(`❌ Save failed: ${result.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Save error:', error);
            setMessage(`❌ Error: Failed to communicate with server. ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCity = async (city) => {
        if (!window.confirm(`Are you sure you want to delete the city "${city.CityName}" (ID: ${city.CityID})? This action cannot be undone.`)) {
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            const payload = {
                tableName: API_CONFIG.TABLES.CITIES,
                where: {
                    CityID: city.CityID,
                    CountryID: city.CountryID,
                    offcode: currentOffcode
                }
            };

            const resp = await fetch(API_CONFIG.DELETE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const result = await resp.json();

            if (result.success) {
                setMessage('✅ City deleted successfully!');
                await refetch();
                
                if (selectedCity?.CityID === city.CityID && selectedCity?.CountryID === city.CountryID) {
                    handleNewCity();
                }
            } else {
                setMessage(`❌ Delete failed: ${result.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Delete error:', error);
            setMessage(`❌ Error: Failed to communicate with server. ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Sidebar Component
    const CityManagementSidebar = () => {
        // Use the country ID currently selected in the form for the sidebar header
        const countryInFocus = countries.find(c => c.CountryID === selectedCountryIdForFilter);
        const citiesForCountry = citiesByCountry[selectedCountryIdForFilter]?.cities || [];

        return (
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-title">
                        <Icon.MapPin className="big" />
                        <div>
                            <div className="h3">City Management</div>
                            <div className="muted small">
                                {cities.length} cities total • Office: {currentOffcode}
                            </div>
                        </div>
                    </div>
                    
                    <div className="search-and-filter-bar">
                        <div className="search-wrap full-width">
                            <Icon.Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search cities in current country..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <button
                            className="btn btn-icon refresh-button"
                            onClick={refetch}
                            disabled={isDataLoading || isSaving}
                            title="Refresh data"
                        >
                            <Icon.Refresh className={isDataLoading ? 'spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="sidebar-body">
                    {countryInFocus ? (
                        <div className="country-filter-display-header">
                            <Icon.Globe className="country-icon" />
                            <div className="country-name-in-filter-display">
                                {countryInFocus.CountryName} Cities
                                <span className="city-count-in-header"> ({citiesForCountry.length})</span>
                            </div>
                        </div>
                    ) : (
                        <div className="country-filter-display-header no-selection">
                            <Icon.Globe className="country-icon" />
                            <div className="country-name-in-filter-display">Select a Country in the Form to view cities</div>
                        </div>
                    )}
                    
                    {isDataLoading && cities.length === 0 ? (
                        <div className="loading-message">
                            <Icon.Loader className="spin" /> Loading Cities...
                        </div>
                    ) : citiesForCountry.length > 0 ? (
                        <div className="city-list">
                            {/* Iterate through the single country section (if it exists) */}
                            {Object.entries(citiesByCountry).map(([countryId, { cities: countryCities }]) => (
                                <div key={countryId} className="cities-container">
                                    {countryCities
                                        .sort((a, b) => normalizeValue(a.CityName).localeCompare(normalizeValue(b.CityName)))
                                        .map(city => (
                                            <div
                                                key={`${city.CountryID}-${city.CityID}`}
                                                className={`city-item ${selectedCity?.CityID === city.CityID && selectedCity?.CountryID === city.CountryID && currentMode === 'edit' ? 'selected' : ''
                                                    }`}
                                                onClick={() => handleSelectCity(city)}
                                            >
                                                <div className="city-main">
                                                    <div className="city-name-id">
                                                        <span className="city-name">{normalizeValue(city.CityName)}</span>
                                                        <span className="city-id">ID: {normalizeValue(city.CityID)}</span>
                                                    </div>
                                                    <div className="city-meta">
                                                        {normalizeValue(city.IsActive) === 'true' ? (
                                                            <span className="status active">Active</span>
                                                        ) : (
                                                            <span className="status inactive">Inactive</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="city-actions">
                                                    <button
                                                        className="btn btn-icon btn-danger btn-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCity(city);
                                                        }}
                                                        disabled={isSaving}
                                                        title="Delete city"
                                                    >
                                                        <Icon.Trash width="16" height="16" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Icon.MapPin className="big-muted" />
                            <div className="muted">{countryInFocus ? `No cities found for ${countryInFocus.CountryName}` : 'No country selected or no data found.'}</div>
                            {searchTerm && (
                                <div className="small muted">Try clearing the search term.</div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        );
    };

    return (
        <div className="page-container customer-supplier-page">
            <div className="app-header">
                <div className="header-brand">
                    <Icon.MapPin className="brand-icon" />
                    <div>
                        <h1>City Management</h1>
                        <div className="muted">Manage cities by country</div>
                    </div>
                </div>
                <div className="header-user">
                    <Icon.Globe className="icon-sm" />
                    <span>{currentUser}</span>
                </div>
            </div>

            {/* Global Error Toast from Data Fetching */}
            {error && (
                <div className="toast error">
                    <div className="toast-content">
                        <Icon.XCircle />
                        <span>{error}</span>
                    </div>
                    <button className="toast-close" onClick={() => { setError('') }}>×</button>
                </div>
            )}

            {/* Action Message Toast (Save/Delete/Validation) */}
            {message && (
                <div className={`toast ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
                    <div className="toast-content">
                        {message.includes('✅') && <Icon.CheckCircle />}
                        {message.includes('❌') && <Icon.XCircle />}
                        <span>{message.replace(/[✅❌]/g, '').trim()}</span> 
                    </div>
                    <button className="toast-close" onClick={() => setMessage('')}>×</button>
                </div>
            )}

            <div className="content-area">
                <CityManagementSidebar />

                <div className="main-content">
                    <div className="content-tabs">
                        <button className="tab active">
                            <Icon.MapPin /> City Details
                        </button>
                    </div>

                    <div className="content-panel">
                        <CityForm
                            formData={formData}
                            onFormChange={handleFormChange}
                            onSave={handleSave}
                            onNewCity={handleNewCity}
                            currentMode={currentMode}
                            isLoading={isSaving}
                            countries={countries}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CityProfile;