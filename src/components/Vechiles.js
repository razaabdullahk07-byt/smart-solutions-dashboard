import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./ChartofAccount.css";
import { AuthContext } from "../AuthContext";

/* ---------------------------
 * API & Configuration
---------------------------- */
const API_CONFIG = {
    BASE_URL: 'http://192.168.100.113:8081/api',
    TABLES: {
        VEHICLE: 'comvehicles'
    },
    GET_URL: 'http://192.168.100.113:8081/api/get-table-data',
    INSERT_URL: 'http://192.168.100.113:8081/api/insert-table-data',
    UPDATE_URL: 'http://192.168.100.113:8081/api/update-table-data',
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
    Search: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
    Refresh: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6" /><path d="M21.02 12.8C20.45 18.05 16.94 22 12 22A9 9 0 0 1 3 13m1.27-5.8C4.55 3.95 7.84 2 12 2h.1C16.94 2 20.45 5.95 21.02 11.2" /></svg>,
    Truck: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
    Loader: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loader"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>,
    CheckCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    XCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
};

/* ---------------------------
 * Initial State
---------------------------- */
const getInitialVehicleData = (offcode = '1010', defaultBranchCode = '010101') => ({
    offcode: offcode,
    vno: '',
    vtype: 'VCL',
    bcode: defaultBranchCode,
    status: '1'
});

/* ---------------------------
 * Data Service
---------------------------- */
const useVehicleDataService = () => {
    const { credentials } = useAuth();
    const [vehicleData, setVehicleData] = useState([]);
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
            return data.success ? data.rows : [];
        } catch (err) {
            console.error(`Error fetching ${tableName}:`, err);
            return [];
        }
    };

    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        setError('');

        try {
            const currentOffcode = credentials?.company?.offcode || '0101';
            console.log(currentOffcode);
            const vehicleData = await fetchTableData(API_CONFIG.TABLES.VEHICLE);

            // Filter data by current offcode
            const filteredData = vehicleData.filter(item =>
                normalizeValue(item.offcode) === currentOffcode
            );

            setVehicleData(filteredData);

        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [credentials]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    return { vehicleData, isLoading, error, refetch: loadAllData };
};

/* ---------------------------
 * Vehicle Form Component
---------------------------- */
const VehicleForm = ({
    formData,
    onFormChange,
    onSave,
    onNewVehicle,
    currentMode,
    isLoading
}) => {
    const { credentials } = useAuth();
    const currentOffcode = credentials?.company?.offcode || '0101';
    const defaultBranchCode = credentials?.branches?.[0]?.code || '010101';

    const {
        vno,
        vtype,
        status
    } = formData;

    const handleInput = (field, value) => onFormChange(field, value);
    const handleCheckbox = (field, e) => onFormChange(field, e.target.checked ? '1' : '0');

    const isNewMode = currentMode === 'new';

    // Vehicle Type Options
    const vehicleTypeOptions = [
        { value: 'VCL', label: 'Vehicle' }
    ];

    return (
        <section className="detail-panel">
            <div className="detail-header">
                <div className="header-content">
                    <h1>{isNewMode ? 'Add New Vehicle' : `Edit Vehicle: ${vno || 'Vehicle'}`}</h1>
                    <div className="header-subtitle">
                        <span className="mode-badge">{isNewMode ? 'NEW' : 'EDIT'}</span>
                        <span className="muted">• Vehicle No: {vno || 'No Number'}</span>
                        <span className="muted">• Office: {currentOffcode}</span>
                        {!(status === '1') && <span className="inactive-badge">INACTIVE</span>}
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={onNewVehicle}
                    >
                        <Icon.Plus /> New Vehicle
                    </button>
                    <button
                        className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                        onClick={onSave}
                        disabled={isLoading || !vno}
                    >
                        {isLoading ? <Icon.Loader className="spin" /> : <Icon.Save />}
                        {isLoading ? 'Saving...' : 'Save Vehicle'}
                    </button>
                </div>
            </div>

            <div className="detail-body">
                <div className="form-section expanded">
                    <div className="section-header">
                        <div className="section-title">
                            <Icon.Truck />
                            <h3>Vehicle Information</h3>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="form-grid grid-3-col">
                            <div className="form-group required">
                                <label>Vehicle Number *</label>
                                <input
                                    type="text"
                                    value={vno}
                                    onChange={e => handleInput('vno', e.target.value)}
                                    placeholder="e.g., LRG-2604, LRG-9292"
                                    className="mono"
                                />
                                <div className="hint">
                                    Enter vehicle registration number
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Vehicle Type</label>
                                <select
                                    value={vtype}
                                    onChange={e => handleInput('vtype', e.target.value)}
                                >
                                    {vehicleTypeOptions.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group checkbox-group">
                                <input
                                    type="checkbox"
                                    id="status"
                                    checked={status === '1'}
                                    onChange={e => handleCheckbox('status', e)}
                                />
                                <label htmlFor="status">Vehicle is Active</label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vehicle Summary */}
                <div className="form-section expanded">
                    <div className="section-header">
                        <div className="section-title">
                            <Icon.Truck />
                            <h3>Vehicle Summary</h3>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="summary-grid">
                            <div className="summary-item">
                                <div className="summary-label">Vehicle Number</div>
                                <div className="summary-value">{vno || 'Not Set'}</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Vehicle Type</div>
                                <div className="summary-value">
                                    {vehicleTypeOptions.find(t => t.value === vtype)?.label || 'Not Set'}
                                </div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Office Code</div>
                                <div className="summary-value">{currentOffcode}</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Branch Code</div>
                                <div className="summary-value">{defaultBranchCode}</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Status</div>
                                <div className="summary-value">
                                    <span className={`status ${status === '1' ? 'active' : 'inactive'}`}>
                                        {status === '1' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

/* ---------------------------
 * Vehicle Management Main Component
---------------------------- */
const VehicleManagement = () => {
    const { credentials } = useAuth();
    const currentOffcode = credentials?.company?.offcode || '0101';
    const defaultBranchCode = credentials?.branches?.[0]?.code || '010101';
    const currentUser = credentials?.username || 'SYSTEM';

    const { vehicleData, isLoading: isDataLoading, error, refetch } = useVehicleDataService();

    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [formData, setFormData] = useState(() => getInitialVehicleData(currentOffcode, defaultBranchCode));
    const [currentMode, setCurrentMode] = useState('new');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Filter vehicles based on search term
    const filteredVehicles = vehicleData.filter(vehicle => {
        return !searchTerm ||
            normalizeValue(vehicle.vno).toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Initialize form data for new record
    useEffect(() => {
        if (currentMode === 'new') {
            setFormData(prev => ({
                ...getInitialVehicleData(currentOffcode, defaultBranchCode)
            }));

            setMessage('Ready to add new vehicle. Enter vehicle details.');
        }
    }, [currentMode, currentOffcode, defaultBranchCode]);

    // Load selected vehicle data into form
    useEffect(() => {
        if (selectedVehicle && currentMode === 'edit') {
            const normalizedVehicle = Object.keys(getInitialVehicleData()).reduce((acc, key) => {
                acc[key] = normalizeValue(selectedVehicle[key] || getInitialVehicleData()[key]);
                return acc;
            }, {});

            setFormData(normalizedVehicle);
        }
    }, [selectedVehicle, currentMode]);

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setCurrentMode('edit');
        setMessage(`Editing: ${normalizeValue(vehicle.vno)}`);
    };

    const handleNewVehicle = () => {
        setSelectedVehicle(null);
        setCurrentMode('new');
    };

    const handleSave = async () => {
        if (!formData.vno.trim()) {
            setMessage('❌ Vehicle Number is required!');
            return;
        }

        // Check for duplicate vehicle number
        const duplicateVehicle = vehicleData.find(v =>
            v.vno === formData.vno &&
            (currentMode === 'new' || v.vno !== selectedVehicle?.vno)
        );

        if (duplicateVehicle) {
            setMessage('❌ A vehicle with this number already exists!');
            return;
        }

        setIsSaving(true);
        setMessage('');

        const url = currentMode === 'new' ? API_CONFIG.INSERT_URL : API_CONFIG.UPDATE_URL;

        // Prepare data with dynamic offcode and bcode
        const saveData = {
            ...formData,
            offcode: currentOffcode,
            bcode: defaultBranchCode
        };

        const payload = {
            tableName: API_CONFIG.TABLES.VEHICLE,
            data: saveData
        };

        if (currentMode === 'edit') {
            payload.where = {
                vno: formData.vno,
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
                setMessage('✅ Vehicle saved successfully!');
                await refetch();

                if (currentMode === 'new') {
                    // Find the newly created record
                    const newRecord = vehicleData.find(v =>
                        v.vno === formData.vno && v.offcode === currentOffcode
                    ) || saveData;
                    setSelectedVehicle(newRecord);
                    setCurrentMode('edit');
                }
            } else {
                setMessage(`❌ Save failed: ${result.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Save error:', error);
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Sidebar Component
    const VehicleManagementSidebar = () => {
        return (
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-title">
                        <Icon.Truck className="big" />
                        <div>
                            <div className="h3">Vehicle Management</div>
                            <div className="muted small">{vehicleData.length} vehicles • Office: {currentOffcode}</div>
                        </div>
                    </div>

                    <div className="search-wrap">
                        <Icon.Search className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by vehicle number..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn btn-icon"
                        onClick={refetch}
                        disabled={isDataLoading}
                        title="Refresh data"
                    >
                        <Icon.Refresh className={isDataLoading ? 'spin' : ''} />
                    </button>
                </div>

                <div className="sidebar-body">
                    {isDataLoading && vehicleData.length === 0 ? (
                        <div className="loading-message">
                            <Icon.Loader className="spin" /> Loading Vehicles...
                        </div>
                    ) : filteredVehicles.length > 0 ? (
                        <div className="vehicle-list">
                            {filteredVehicles.map(vehicle => (
                                <div
                                    key={vehicle.vno}
                                    className={`vehicle-item ${selectedVehicle?.vno === vehicle.vno && currentMode === 'edit' ? 'selected' : ''
                                        }`}
                                    onClick={() => handleSelectVehicle(vehicle)}
                                >
                                    <div className="vehicle-main">
                                        <div className="vehicle-number">
                                            <span className="vehicle-no">{normalizeValue(vehicle.vno)}</span>
                                        </div>
                                        <div className="vehicle-meta">
                                            {normalizeValue(vehicle.status) === '1' ? (
                                                <span className="status active">Active</span>
                                            ) : (
                                                <span className="status inactive">Inactive</span>
                                            )}
                                            <span className="vehicle-type">
                                                {vehicle.vtype === 'VCL' && 'Vehicle'}
                                                {vehicle.vtype === 'TRK' && 'Truck'}
                                                {vehicle.vtype === 'VAN' && 'Van'}
                                                {vehicle.vtype === 'CRN' && 'Crane'}
                                                {vehicle.vtype === 'FLT' && 'Forklift'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="vehicle-details">
                                        <div className="branch-code">Branch: {vehicle.bcode}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <Icon.Truck className="big-muted" />
                            <div className="muted">No vehicles found</div>
                            {searchTerm && (
                                <div className="small muted">Try a different search term</div>
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
                    <Icon.Truck className="brand-icon" />
                    <div>
                        <h1>Vehicle Management</h1>
                        <div className="muted">Manage company vehicles</div>
                    </div>
                </div>
                <div className="header-user">
                    <Icon.Truck className="icon-sm" />
                    <span>{currentUser}</span>
                </div>
            </div>

            {error && (
                <div className="toast error">
                    <div className="toast-content">
                        <Icon.XCircle />
                        <span>{error}</span>
                    </div>
                    <button className="toast-close" onClick={() => { }}>×</button>
                </div>
            )}

            {message && (
                <div className={`toast ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
                    <div className="toast-content">
                        {message.includes('✅') && <Icon.CheckCircle />}
                        {message.includes('❌') && <Icon.XCircle />}
                        <span>{message.replace(/[✅❌]/g, '')}</span>
                    </div>
                    <button className="toast-close" onClick={() => setMessage('')}>×</button>
                </div>
            )}

            <div className="content-area">
                <VehicleManagementSidebar />

                <div className="main-content">
                    <div className="content-tabs">
                        <button className="tab active">
                            <Icon.Truck /> Vehicle Details
                        </button>
                    </div>

                    <div className="content-panel">
                        <VehicleForm
                            formData={formData}
                            onFormChange={handleFormChange}
                            onSave={handleSave}
                            onNewVehicle={handleNewVehicle}
                            currentMode={currentMode}
                            isLoading={isSaving}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleManagement;