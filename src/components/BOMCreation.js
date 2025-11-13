import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./ChartofAccount.css";
import { AuthContext } from "../AuthContext";

/* ---------------------------
 * API & Configuration
---------------------------- */
const API_CONFIG = {
    BASE_URL: 'http://192.168.100.113:8081/api',
    TABLES: {
        BOM: 'imfbom',
        BOM_HEAD: 'imfbomhead',
        BOM_FOH: 'imfbomfoh',
        OVERHEAD: 'comFOH',
        UOM: 'comuom',
        PROCESS: 'comProcess',
        ITEMS: 'imf'
    },
    PRIMARY_KEYS: {
        BOM: ['PK', 'offcode'],
        BOM_HEAD: ['HeadItemCode', 'offcode'],
        BOM_FOH: ['pk', 'offcode']
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
    ChevronDown: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
    Loader: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loader"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>,
    Package: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
    Layers: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
    CheckCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    XCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
    Settings: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
    DollarSign: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
    Cogs: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>,
    Info: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

/* ---------------------------
 * Initial State
---------------------------- */
const getInitialBOMData = (offcode = '0101') => ({
    offcode: offcode,
    HeadItemCode: '',
    HeadItemName: '',
    isActive: 'true',
    bomComponents: [],
    bomOverheads: []
});

const getInitialBOMComponent = () => ({
    BOMItemCode: '',
    uom: '1',
    NoOfQtyRequired: '1',
    ForNoOfPeices: '1',
    ProcessID: '1'
});

/* ---------------------------
 * Data Service
---------------------------- */
const useDataService = () => {
    const { credentials } = useAuth();
    const [data, setData] = useState([]);
    const [lookupData, setLookupData] = useState({
        bomHeads: [],
        overheads: [],
        uoms: [],
        processes: [],
        items: [],
        bomFOH: [] // Add this to store BOM overhead relationships
    });
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

            const [
                bomData,
                bomHeadData,
                bomFOHData,
                overheadData,
                uomData,
                processData,
                itemsData
            ] = await Promise.all([
                fetchTableData(API_CONFIG.TABLES.BOM),
                fetchTableData(API_CONFIG.TABLES.BOM_HEAD),
                fetchTableData(API_CONFIG.TABLES.BOM_FOH),
                fetchTableData(API_CONFIG.TABLES.OVERHEAD),
                fetchTableData(API_CONFIG.TABLES.UOM),
                fetchTableData(API_CONFIG.TABLES.PROCESS),
                fetchTableData(API_CONFIG.TABLES.ITEMS)
            ]);

            // Filter data by current offcode with safety checks
            const filteredBOMs = (bomData || []).filter(b =>
                b && normalizeValue(b.offcode) === currentOffcode
            );

            const filteredBOMHeads = (bomHeadData || []).filter(bh =>
                bh && normalizeValue(bh.offcode) === currentOffcode
            );

            const filteredBOMFOH = (bomFOHData || []).filter(bf =>
                bf && normalizeValue(bf.offcode) === currentOffcode
            );

            const filteredOverheads = (overheadData || []).filter(oh =>
                oh && normalizeValue(oh.offcode) === currentOffcode
            );

            const filteredUOMs = (uomData || []).filter(uom =>
                uom && normalizeValue(uom.offcode) === currentOffcode && normalizeValue(uom.Isactive) === 'true'
            );

            const filteredProcesses = (processData || []).filter(process =>
                process && normalizeValue(process.offcode) === currentOffcode && normalizeValue(process.isActive) === 'true'
            );

            const filteredItems = (itemsData || []).filter(item =>
                item && normalizeValue(item.offcode) === currentOffcode && normalizeValue(item.isActive) === 'true'
            ).map(item => ({
                code: normalizeValue(item.ItemCode),
                name: normalizeValue(item.ItemName),
                uom: normalizeValue(item.uom),
                costPrice: normalizeValue(item.CostPrice),
                salePrice: normalizeValue(item.SalePrice),
                isManufactur: normalizeValue(item.isManufactur),
                isPurchase: normalizeValue(item.isPurchase)
            }));

            setData(filteredBOMs);
            setLookupData({
                bomHeads: filteredBOMHeads,
                overheads: filteredOverheads,
                uoms: filteredUOMs.map(uom => ({
                    id: normalizeValue(uom.ccode),
                    name: normalizeValue(uom.cname),
                    short: normalizeValue(uom.cSHD)
                })),
                processes: filteredProcesses.map(process => ({
                    id: normalizeValue(process.ccode),
                    name: normalizeValue(process.cname)
                })),
                items: filteredItems,
                bomFOH: filteredBOMFOH // Store BOM overhead relationships
            });

        } catch (err) {
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [credentials]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    return { data, lookupData, isLoading, error, refetch: loadAllData };
};

/* ---------------------------
 * Modern Collapsible Section Component
---------------------------- */
const CollapsibleSection = ({ title, icon, children, defaultExpanded = true, badge }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    return (
        <div className={`modern-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="section-title">
                    <div className="section-icon">
                        {icon}
                    </div>
                    <h3>{title}</h3>
                    {badge && <span className="section-badge">{badge}</span>}
                </div>
                <Icon.ChevronDown className={`chevron ${isExpanded ? 'expanded' : ''}`} />
            </div>
            {isExpanded && (
                <div className="section-content">
                    {children}
                </div>
            )}
        </div>
    );
};

/* ---------------------------
 * Modern BOM Component Item
---------------------------- */
const BOMComponentItem = ({ item, index, onUpdate, onRemove, lookupData }) => {
    const { items, uoms, processes } = lookupData;

    const handleChange = (field, value) => {
        onUpdate(index, field, value);
    };

    const handleNumericInput = (field, value) => {
        onUpdate(index, field, value.replace(/[^0-9.]/g, ''));
    };

    const selectedItem = items.find(i => i.code === item.BOMItemCode);

    return (
        <div className="modern-component-item">
            <div className="component-header">
                <div className="component-info">
                    <span className="component-number">Component #{index + 1}</span>
                    {selectedItem && (
                        <span className="component-details">
                            {selectedItem.name} • Cost: ${selectedItem.costPrice} • Sale: ${selectedItem.salePrice}
                        </span>
                    )}
                </div>
                <button
                    className="btn btn-icon btn-danger"
                    onClick={() => onRemove(index)}
                    title="Remove component"
                >
                    <Icon.Trash />
                </button>
            </div>
            <div className="form-grid grid-4-col">
                <div className="form-group required">
                    <label>Item Code *</label>
                    <select
                        value={item.BOMItemCode}
                        onChange={e => handleChange('BOMItemCode', e.target.value)}
                        className="modern-select"
                    >
                        <option value="">Select Item</option>
                        {items.map(item => (
                            <option key={item.code} value={item.code}>
                                {item.code} - {item.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>UOM</label>
                    <select
                        value={item.uom}
                        onChange={e => handleChange('uom', e.target.value)}
                        className="modern-select"
                    >
                        {uoms.map(uom => (
                            <option key={uom.id} value={uom.id}>
                                {uom.name} ({uom.short})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group required">
                    <label>Quantity Required *</label>
                    <input
                        type="number"
                        step="0.001"
                        value={item.NoOfQtyRequired}
                        onChange={e => handleNumericInput('NoOfQtyRequired', e.target.value)}
                        placeholder="1.000"
                        className="modern-input"
                    />
                </div>
                <div className="form-group">
                    <label>For No. of Pieces</label>
                    <input
                        type="number"
                        step="1"
                        value={item.ForNoOfPeices}
                        onChange={e => handleNumericInput('ForNoOfPeices', e.target.value)}
                        placeholder="1"
                        className="modern-input"
                    />
                </div>
                <div className="form-group">
                    <label>Process</label>
                    <select
                        value={item.ProcessID}
                        onChange={e => handleChange('ProcessID', e.target.value)}
                        className="modern-select"
                    >
                        <option value="">Select Process</option>
                        {processes.map(process => (
                            <option key={process.id} value={process.id}>
                                {process.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

/* ---------------------------
 * Modern BOM Overhead Item with Checkboxes
---------------------------- */
const BOMOverheadItem = ({ overhead, isSelected, rate, onToggle, onRateChange, lookupData }) => {
    // Add safety check for undefined overhead
    if (!overhead) {
        return null;
    }

    const handleRateChange = (value) => {
        onRateChange(overhead.ccode, value.replace(/[^0-9.]/g, ''));
    };

    return (
        <div className="modern-overhead-checkbox-item">
            <div className="overhead-checkbox-content">
                <div className="checkbox-wrapper">
                    <input
                        type="checkbox"
                        id={`overhead-${overhead.ccode}`}
                        checked={isSelected}
                        onChange={() => onToggle(overhead.ccode)}
                        className="modern-checkbox-input"
                    />
                    <label htmlFor={`overhead-${overhead.ccode}`} className="overhead-checkbox-label">
                        <div className="overhead-name">{overhead.cname}</div>
                        <div className="overhead-description">
                            {overhead.cname} - Available for assignment
                        </div>
                    </label>
                </div>
                
                {isSelected && (
                    <div className="overhead-rate-section">
                        <div className="rate-input-group">
                            <label className="rate-label">Rate ($)</label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rate}
                                    onChange={e => handleRateChange(e.target.value)}
                                    placeholder="0.00"
                                    className="modern-input rate-input"
                                />
                                <span className="input-suffix">$</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ---------------------------
 * BOM Overheads Section with Checkboxes
---------------------------- */
/* ---------------------------
 * BOM Overheads Section with Checkboxes
---------------------------- */
const BOMOverheadsSection = ({ 
    bomOverheads, 
    onOverheadsChange, 
    lookupData,
    headItemCode,
    currentMode
}) => {
    const { overheads, bomFOH } = lookupData;

    // For edit mode, load existing overheads from bomFOH data
    useEffect(() => {
        if (currentMode === 'edit' && headItemCode && bomFOH.length > 0) {
            const existingOverheads = bomFOH
                .filter(foh => normalizeValue(foh.HeadItemCode) === headItemCode)
                .map(foh => ({
                    FOHid: normalizeValue(foh.FOHid),
                    Rate: normalizeValue(foh.Rate)
                }));
            
            if (existingOverheads.length > 0 && bomOverheads.length === 0) {
                onOverheadsChange(existingOverheads);
            }
        }
    }, [currentMode, headItemCode, bomFOH, bomOverheads.length, onOverheadsChange]);

    // Add safety check for undefined overheads
    if (!overheads || !Array.isArray(overheads)) {
        return (
            <CollapsibleSection 
                title="BOM Overheads" 
                icon={<Icon.DollarSign />} 
                defaultExpanded={true}
                badge="0"
            >
                <div className="modern-overheads-section">
                    <div className="modern-loading-state">
                        <Icon.Loader className="spin" />
                        <span>Loading overheads...</span>
                    </div>
                </div>
            </CollapsibleSection>
        );
    }

    // Convert bomOverheads array to a more manageable format
    const selectedOverheadsMap = (bomOverheads || []).reduce((acc, oh) => {
        if (oh && oh.FOHid) {
            acc[oh.FOHid] = oh.Rate || '0';
        }
        return acc;
    }, {});

    const handleToggleOverhead = (fohId) => {
        const newOverheads = { ...selectedOverheadsMap };
        
        if (newOverheads[fohId]) {
            // Remove if already selected
            delete newOverheads[fohId];
        } else {
            // Add with default rate 0
            newOverheads[fohId] = '0';
        }
        
        // Convert back to array format for parent component
        const overheadsArray = Object.entries(newOverheads).map(([FOHid, Rate]) => ({
            FOHid,
            Rate
        }));
        
        onOverheadsChange(overheadsArray);
    };

    const handleRateChange = (fohId, rate) => {
        const newOverheads = { ...selectedOverheadsMap };
        newOverheads[fohId] = rate;
        
        const overheadsArray = Object.entries(newOverheads).map(([FOHid, Rate]) => ({
            FOHid,
            Rate
        }));
        
        onOverheadsChange(overheadsArray);
    };

    const selectedCount = Object.keys(selectedOverheadsMap).length;

    return (
        <CollapsibleSection 
            title="BOM Overheads" 
            icon={<Icon.DollarSign />} 
            defaultExpanded={true}
            badge={selectedCount}
        >
            <div className="modern-overheads-section">
                <div className="section-header-actions">
                    <div className="section-info">
                        <h4>Overhead Costs</h4>
                        <span className="section-count">{selectedCount} selected</span>
                    </div>
                    <div className="overheads-summary">
                        Total Selected: {selectedCount} overhead(s)
                    </div>
                </div>

                <div className="overheads-description">
                    <p>Select one or more overheads to assign to this BOM. Each selected overhead will be applied with the specified rate.</p>
                    {currentMode === 'edit' && (
                        <p className="edit-mode-note">
                            <strong>Edit Mode:</strong> Existing overhead assignments are loaded automatically.
                        </p>
                    )}
                </div>

                {overheads.length === 0 ? (
                    <div className="modern-empty-state">
                        <Icon.DollarSign className="empty-icon" />
                        <div className="empty-title">No overheads available</div>
                        <div className="empty-subtitle">No overhead categories are configured in the system</div>
                    </div>
                ) : (
                    <div className="modern-overheads-checkbox-list">
                        {overheads.map(overhead => (
                            overhead ? (
                                <BOMOverheadItem
                                    key={overhead.ccode}
                                    overhead={overhead}
                                    isSelected={!!selectedOverheadsMap[overhead.ccode]}
                                    rate={selectedOverheadsMap[overhead.ccode] || '0'}
                                    onToggle={handleToggleOverhead}
                                    onRateChange={handleRateChange}
                                    lookupData={lookupData}
                                />
                            ) : null
                        ))}
                    </div>
                )}

                {selectedCount > 0 && (
                    <div className="selected-overheads-summary">
                        <h5>Selected Overheads:</h5>
                        <div className="selected-overheads-list">
                            {overheads
                                .filter(oh => oh && selectedOverheadsMap[oh.ccode])
                                .map(oh => (
                                    <div key={oh.ccode} className="selected-overhead-item">
                                        <span className="overhead-name">{oh.cname}</span>
                                        <span className="overhead-rate">${selectedOverheadsMap[oh.ccode]}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>
        </CollapsibleSection>
    );
};

/* ---------------------------
 * Modern BOM Creation Form Component
---------------------------- */
const BOMCreationForm = ({
    formData,
    onFormChange,
    onSave,
    onNewBOM,
    currentMode,
    isLoading,
    lookupData
}) => {
    const { credentials } = useAuth();
    const currentOffcode = credentials?.company?.offcode || '0101';

    const {
        offcode, HeadItemCode, HeadItemName, isActive, bomComponents = [], bomOverheads = []
    } = formData;

    const { bomHeads, items } = lookupData;

    const [components, setComponents] = useState([]);

    useEffect(() => {
        setComponents(bomComponents);
    }, [bomComponents]);

    const handleInput = (field, value) => onFormChange(field, value);

    const handleCheckbox = (field, e) => onFormChange(field, e.target.checked ? 'true' : 'false');

    const handleHeadItemChange = (itemCode) => {
        const selectedHead = bomHeads.find(bh => bh.HeadItemCode === itemCode);
        onFormChange('HeadItemCode', itemCode);
        onFormChange('HeadItemName', selectedHead ? selectedHead.HeadItemName : '');
    };

    // Component Management
    const handleAddComponent = () => {
        const newComponent = getInitialBOMComponent();
        const updatedComponents = [...components, newComponent];
        setComponents(updatedComponents);
        onFormChange('bomComponents', updatedComponents);
    };

    const handleUpdateComponent = (index, field, value) => {
        const updatedComponents = [...components];
        updatedComponents[index] = {
            ...updatedComponents[index],
            [field]: value
        };
        setComponents(updatedComponents);
        onFormChange('bomComponents', updatedComponents);
    };

    const handleRemoveComponent = (index) => {
        const updatedComponents = components.filter((_, i) => i !== index);
        setComponents(updatedComponents);
        onFormChange('bomComponents', updatedComponents);
    };

    // Overhead Management with Checkboxes
    const handleOverheadsChange = (newOverheads) => {
        onFormChange('bomOverheads', newOverheads);
    };

    const isNewMode = currentMode === 'new';
    const selectedHeadItem = bomHeads.find(bh => bh.HeadItemCode === HeadItemCode);

    return (
        <section className="modern-detail-panel">
            <div className="modern-detail-header">
                <div className="header-content">
                    <h1>{isNewMode ? 'Create New BOM' : `${HeadItemName || 'BOM'} Details`}</h1>
                    <div className="header-subtitle">
                        <span className={`mode-badge ${isNewMode ? 'new' : 'edit'}`}>
                            {isNewMode ? 'NEW' : 'EDIT'}
                        </span>
                        <span className="muted">• {HeadItemCode || 'No Item Code'}</span>
                        <span className="muted">• Office: {currentOffcode}</span>
                        {!(isActive === 'true') && <span className="inactive-badge">INACTIVE</span>}
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-outline modern-btn"
                        onClick={onNewBOM}
                    >
                        <Icon.Plus /> New BOM
                    </button>
                    <button
                        className={`btn btn-primary modern-btn ${isLoading ? 'loading' : ''}`}
                        onClick={onSave}
                        disabled={isLoading || !HeadItemCode}
                    >
                        {isLoading ? <Icon.Loader className="spin" /> : <Icon.Save />}
                        {isLoading ? 'Saving...' : 'Save BOM'}
                    </button>
                </div>
            </div>

            <div className="modern-detail-body">
                {/* Main Item Information */}
                <CollapsibleSection 
                    title="BOM Head Information" 
                    icon={<Icon.Package />} 
                    defaultExpanded={true}
                    badge="Required"
                >
                    <div className="form-grid grid-3-col">
                        <div className="form-group required">
                            <label>Head Item Code *</label>
                            <input
                                type="text"
                                value={HeadItemCode}
                                onChange={e => handleInput('HeadItemCode', e.target.value)}
                                placeholder="Auto-generated"
                                disabled={!isNewMode}
                                className="modern-input"
                            />
                            {isNewMode && (
                                <div className="field-hint">
                                    Code will be auto-generated based on existing BOMs
                                </div>
                            )}
                        </div>
                        <div className="form-group required">
                            <label>Head Item Name *</label>
                            <input
                                type="text"
                                value={HeadItemName}
                                onChange={e => handleInput('HeadItemName', e.target.value)}
                                placeholder="Enter BOM head item name"
                                className="modern-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Office Code</label>
                            <input type="text" value={currentOffcode} disabled className="modern-input" />
                        </div>
                        <div className="form-group checkbox-group modern-checkbox">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={isActive === 'true'}
                                onChange={e => handleCheckbox('isActive', e)}
                                className="modern-checkbox-input"
                            />
                            <label htmlFor="isActive" className="modern-checkbox-label">
                                BOM is Active
                            </label>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* BOM Components */}
                <CollapsibleSection 
                    title="BOM Components" 
                    icon={<Icon.Layers />} 
                    defaultExpanded={true}
                    badge={components.length}
                >
                    <div className="modern-components-section">
                        <div className="section-header-actions">
                            <div className="section-info">
                                <h4>Components List</h4>
                                <span className="section-count">{components.length} items</span>
                            </div>
                            <button
                                className="btn btn-outline btn-sm modern-btn"
                                onClick={handleAddComponent}
                            >
                                <Icon.Plus /> Add Component
                            </button>
                        </div>

                        {components.length === 0 ? (
                            <div className="modern-empty-state">
                                <Icon.Layers className="empty-icon" />
                                <div className="empty-title">No components added</div>
                                <div className="empty-subtitle">Click "Add Component" to start building your BOM</div>
                            </div>
                        ) : (
                            <div className="modern-components-list">
                                {components.map((item, index) => (
                                    <BOMComponentItem
                                        key={index}
                                        item={item}
                                        index={index}
                                        onUpdate={handleUpdateComponent}
                                        onRemove={handleRemoveComponent}
                                        lookupData={lookupData}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* Updated BOM Overheads with Checkboxes */}
                <BOMOverheadsSection
                    bomOverheads={bomOverheads}
                    onOverheadsChange={handleOverheadsChange}
                    lookupData={lookupData}
                    headItemCode={HeadItemCode}
                    currentMode={currentMode}
                />

                {/* Process Information */}
                <CollapsibleSection 
                    title="Process Information" 
                    icon={<Icon.Cogs />} 
                    defaultExpanded={false}
                    badge={lookupData.processes.length}
                >
                    <div className="modern-process-info">
                        <div className="process-description">
                            <p>Processes define the manufacturing steps required for this BOM. Each component can be assigned to a specific process.</p>
                        </div>
                        <div className="available-processes">
                            <h5>Available Processes:</h5>
                            <div className="modern-process-tags">
                                {lookupData.processes.map(process => (
                                    <span key={process.id} className="modern-process-tag">
                                        {process.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            </div>
        </section>
    );
};

/* ---------------------------
 * Modern BOM Creation Main Component
---------------------------- */
const BOMCreation = () => {
    const { credentials } = useAuth();
    const currentOffcode = credentials?.company?.offcode || '0101';
    const currentUser = credentials?.username || 'SYSTEM';

    const { data: boms, lookupData, isLoading: isDataLoading, error, refetch } = useDataService();

    const [selectedBOM, setSelectedBOM] = useState(null);
    const [formData, setFormData] = useState(() => getInitialBOMData(currentOffcode));
    const [currentMode, setCurrentMode] = useState('new');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Function to generate next Head Item Code
    const generateNextHeadItemCode = useCallback(() => {
        if (!lookupData.bomHeads || lookupData.bomHeads.length === 0) {
            return '0000000001';
        }

        // Get all existing HeadItemCodes and find the maximum
        const existingCodes = lookupData.bomHeads
            .map(head => {
                const code = parseInt(normalizeValue(head.HeadItemCode));
                return isNaN(code) ? 0 : code;
            })
            .filter(code => code > 0);

        const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
        const nextCode = maxCode + 1;

        // Format as 10-digit string with leading zeros
        return nextCode.toString().padStart(10, '0');
    }, [lookupData.bomHeads]);

    // Group BOM data by HeadItemCode
    const groupedBOMs = lookupData.bomHeads.map(head => {
        const components = boms.filter(bom => 
            normalizeValue(bom.ItemCode) === head.HeadItemCode
        );
        
        // Get overheads for this BOM from bomFOH data
        const overheads = lookupData.bomFOH
            .filter(foh => normalizeValue(foh.HeadItemCode) === head.HeadItemCode)
            .map(foh => ({
                FOHid: normalizeValue(foh.FOHid),
                Rate: normalizeValue(foh.Rate)
            }));

        return {
            ...head,
            components,
            overheads,
            componentCount: components.length
        };
    });

    // Initialize form data for new record
    useEffect(() => {
        if (currentMode === 'new') {
            const newHeadItemCode = generateNextHeadItemCode();
            setFormData(prev => ({
                ...getInitialBOMData(currentOffcode),
                HeadItemCode: newHeadItemCode,
                bomComponents: [getInitialBOMComponent()],
                bomOverheads: []
            }));
            setMessage(`Ready to create new BOM. Auto-generated code: ${newHeadItemCode}`);
        }
    }, [currentMode, currentOffcode, generateNextHeadItemCode]);

    // Load selected BOM data into form
    useEffect(() => {
        if (selectedBOM && currentMode === 'edit') {
            const componentsForItem = boms.filter(bom => 
                normalizeValue(bom.ItemCode) === selectedBOM.HeadItemCode
            );
            
            const normalizedBOM = {
                ...getInitialBOMData(currentOffcode),
                HeadItemCode: selectedBOM.HeadItemCode,
                HeadItemName: selectedBOM.HeadItemName,
                isActive: selectedBOM.isActive || 'true',
                bomComponents: componentsForItem.map(comp => ({
                    BOMItemCode: normalizeValue(comp.BOMItemCode),
                    uom: normalizeValue(comp.uom),
                    NoOfQtyRequired: normalizeValue(comp.NoOfQtyRequired),
                    ForNoOfPeices: normalizeValue(comp.ForNoOfPeices),
                    ProcessID: normalizeValue(comp.ProcessID)
                })),
                bomOverheads: selectedBOM.overheads || []
            };

            setFormData(normalizedBOM);
        }
    }, [selectedBOM, currentMode, boms, currentOffcode]);

    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSelectBOM = (bomGroup) => {
        setSelectedBOM(bomGroup);
        setCurrentMode('edit');
        setMessage(`Editing BOM for: ${bomGroup.HeadItemName}`);
    };

    const handleNewBOM = () => {
        setSelectedBOM(null);
        setCurrentMode('new');
    };

    const handleSave = async () => {
        if (!formData.HeadItemCode.trim()) {
            setMessage('❌ Head Item Code is required!');
            return;
        }

        if (!formData.HeadItemName.trim()) {
            setMessage('❌ Head Item Name is required!');
            return;
        }

        setIsSaving(true);
        setMessage('');

        try {
            // Save BOM Head
            const headPayload = {
                tableName: API_CONFIG.TABLES.BOM_HEAD,
                data: {
                    offcode: currentOffcode,
                    HeadItemCode: formData.HeadItemCode,
                    HeadItemName: formData.HeadItemName,
                    isActive: formData.isActive
                }
            };

            const headUrl = currentMode === 'new' ? API_CONFIG.INSERT_URL : API_CONFIG.UPDATE_URL;
            
            if (currentMode === 'edit') {
                headPayload.where = {
                    HeadItemCode: formData.HeadItemCode,
                    offcode: currentOffcode
                };
            }

            const headResp = await fetch(headUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(headPayload)
            });

            if (!headResp.ok) {
                throw new Error(`HTTP ${headResp.status} for BOM head`);
            }

            const headResult = await headResp.json();

            if (!headResult.success) {
                throw new Error('Failed to save BOM head');
            }

            // Save BOM Components
            const componentPromises = formData.bomComponents.map(async (component) => {
                const bomPayload = {
                    tableName: API_CONFIG.TABLES.BOM,
                    data: {
                        offcode: currentOffcode,
                        ItemCode: formData.HeadItemCode,
                        BOMItemCode: component.BOMItemCode,
                        uom: component.uom || '1',
                        NoOfQtyRequired: component.NoOfQtyRequired,
                        ForNoOfPeices: component.ForNoOfPeices || '1',
                        ProcessID: component.ProcessID || '1'
                    }
                };

                const resp = await fetch(API_CONFIG.INSERT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bomPayload)
                });

                if (!resp.ok) {
                    throw new Error(`HTTP ${resp.status} for component`);
                }

                return resp.json();
            });

            await Promise.all(componentPromises);

            // Save BOM Overheads (if any)
            if (formData.bomOverheads && formData.bomOverheads.length > 0) {
                const overheadPromises = formData.bomOverheads.map(async (overhead) => {
                    const fohPayload = {
                        tableName: API_CONFIG.TABLES.BOM_FOH,
                        data: {
                            offcode: currentOffcode,
                            HeadItemCode: formData.HeadItemCode,
                            FOHid: overhead.FOHid, // This maps to ccode in comFOH
                            Rate: overhead.Rate
                        }
                    };

                    const resp = await fetch(API_CONFIG.INSERT_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fohPayload)
                    });

                    if (!resp.ok) {
                        throw new Error(`HTTP ${resp.status} for overhead`);
                    }

                    return resp.json();
                });

                await Promise.all(overheadPromises);
            }

            setMessage(`✅ BOM ${currentMode === 'new' ? 'created' : 'updated'} successfully!`);
            await refetch();

            if (currentMode === 'new') {
                const newBOM = groupedBOMs.find(group => 
                    group.HeadItemCode === formData.HeadItemCode
                );
                if (newBOM) {
                    setSelectedBOM(newBOM);
                    setCurrentMode('edit');
                }
            }

        } catch (error) {
            console.error('Save error:', error);
            setMessage(`❌ Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Modern Sidebar Component
    const BOMSidebar = () => {
        const filteredBOMs = groupedBOMs.filter(bomGroup =>
            bomGroup.HeadItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bomGroup.HeadItemCode.includes(searchTerm)
        );

        return (
            <aside className="modern-sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-title">
                        <div className="sidebar-icon">
                            <Icon.Layers />
                        </div>
                        <div className="sidebar-title-content">
                            <div className="sidebar-main-title">BOM Definitions</div>
                            <div className="sidebar-subtitle">{groupedBOMs.length} BOMs • Office: {currentOffcode}</div>
                        </div>
                    </div>
                    <div className="sidebar-controls">
                        <div className="modern-search-wrap">
                            <Icon.Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search BOMs..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="modern-search-input"
                            />
                        </div>
                        <button
                            className="btn btn-icon modern-refresh-btn"
                            onClick={refetch}
                            disabled={isDataLoading}
                            title="Refresh data"
                        >
                            <Icon.Refresh className={isDataLoading ? 'spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="sidebar-body">
                    {isDataLoading && groupedBOMs.length === 0 ? (
                        <div className="modern-loading-state">
                            <Icon.Loader className="spin" />
                            <span>Loading BOMs...</span>
                        </div>
                    ) : filteredBOMs.length > 0 ? (
                        <div className="modern-bom-list">
                            {filteredBOMs.map(bomGroup => (
                                <div
                                    key={bomGroup.HeadItemCode}
                                    className={`modern-bom-item ${selectedBOM?.HeadItemCode === bomGroup.HeadItemCode && currentMode === 'edit' ? 'selected' : ''
                                        }`}
                                    onClick={() => handleSelectBOM(bomGroup)}
                                >
                                    <div className="bom-item-content">
                                        <div className="bom-main-info">
                                            <div className="bom-name">{bomGroup.HeadItemName}</div>
                                            <div className="bom-code">{bomGroup.HeadItemCode}</div>
                                        </div>
                                        <div className="bom-status">
                                            <span className={`status-badge ${bomGroup.isActive === 'true' ? 'active' : 'inactive'}`}>
                                                {bomGroup.isActive === 'true' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="modern-empty-sidebar">
                            <Icon.Layers className="empty-sidebar-icon" />
                            <div className="empty-sidebar-title">No BOMs found</div>
                            {searchTerm && (
                                <div className="empty-sidebar-subtitle">Try a different search term</div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        );
    };

    return (
        <div className="modern-page-container">
            <div className="modern-app-header">
                <div className="header-brand">
                    <div className="brand-icon">
                        <Icon.Layers />
                    </div>
                    <div className="brand-content">
                        <h1>BOM Management</h1>
                        <div className="brand-subtitle">Manage Bill of Materials</div>
                    </div>
                </div>
                <div className="header-user">
                    <div className="user-avatar">
                        <Icon.Package />
                    </div>
                    <span className="user-name">{currentUser}</span>
                </div>
            </div>

            {error && (
                <div className="modern-toast error">
                    <div className="toast-content">
                        <Icon.XCircle />
                        <span>{error}</span>
                    </div>
                    <button className="toast-close" onClick={() => { }}>×</button>
                </div>
            )}

            {message && (
                <div className={`modern-toast ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
                    <div className="toast-content">
                        {message.includes('✅') && <Icon.CheckCircle />}
                        {message.includes('❌') && <Icon.XCircle />}
                        <span>{message.replace(/[✅❌]/g, '')}</span>
                    </div>
                    <button className="toast-close" onClick={() => setMessage('')}>×</button>
                </div>
            )}

            <div className="modern-content-area">
                <BOMSidebar />

                <div className="modern-main-content">
                    <div className="content-tabs">
                        <button className="tab active modern-tab">
                            <Icon.Layers /> BOM Details
                        </button>
                    </div>

                    <div className="modern-content-panel">
                        <BOMCreationForm
                            formData={formData}
                            onFormChange={handleFormChange}
                            onSave={handleSave}
                            onNewBOM={handleNewBOM}
                            currentMode={currentMode}
                            isLoading={isSaving}
                            lookupData={lookupData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BOMCreation;