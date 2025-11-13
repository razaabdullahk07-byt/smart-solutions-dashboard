// import React, { useState, useEffect, useCallback, useContext } from 'react';
// import "./ChartofAccount.css";
// import { AuthContext } from "../AuthContext";

// /* ---------------------------
//  * API & Configuration
// ---------------------------- */
// const API_CONFIG = {
//     BASE_URL: 'http://192.168.100.113:8081/api',
//     TABLES: {
//         TRANSPORTER: 'comtransporter',
//         COUNTRY: 'Country',
//         CITY: 'cities',
//         ACCOUNT: 'acChartOfAccount',
//         BRANCH: 'comBranch'
//     },
//     PRIMARY_KEYS: {
//         TRANSPORTER: ['TransporterCode', 'offcode']
//     },
//     GET_URL: 'http://192.168.100.113:8081/api/get-table-data',
//     INSERT_URL: 'http://192.168.100.113:8081/api/insert-table-data',
//     UPDATE_URL: 'http://192.168.100.113:8081/api/update-table-data',
//     DELETE_URL: 'http://192.168.100.113:8081/api/delete-table-data',
// };

// /* ---------------------------
//  * Auth Hook
// ---------------------------- */
// const useAuth = () => useContext(AuthContext);

// /* ---------------------------
//  * Utilities & Icons
// ---------------------------- */
// const normalizeValue = (value) => {
//     if (value === null || value === undefined || value === 'null' || value === 'undefined') return '';
//     return String(value);
// };

// const Icon = {
//     Save: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>,
//     Plus: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
//     Edit: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
//     Trash: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6M1 6h22"></path></svg>,
//     Search: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
//     Refresh: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6" /><path d="M21.02 12.8C20.45 18.05 16.94 22 12 22A9 9 0 0 1 3 13m1.27-5.8C4.55 3.95 7.84 2 12 2h.1C16.94 2 20.45 5.95 21.02 11.2" /></svg>,
//     ChevronDown: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
//     Loader: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="loader"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>,
//     Truck: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
//     MapPin: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
//     DollarSign: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
//     CreditCard: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
//     CheckCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
//     XCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
// };

// /* ---------------------------
//  * Initial State
// ---------------------------- */
// const getInitialTransporterData = (offcode = '0101') => ({
//     offcode: offcode,
//     TransporterCode: '',
//     TransporterName: '',
//     isactive: 'true',
//     contact: '',
//     billaddress: '',
//     zipcode: '',
//     CountryID: '1',
//     country: 'Pakistan',
//     CityID: '1',
//     city: 'LAHORE',
//     phone1: '',
//     mobile: '0',
//     fax: '',
//     email: '',
//     paymentmethod: '1',
//     TransporterglCode: '',
//     defaultTypePerAmt: '01',
//     defaultAmount: '0',
//     createdby: '',
//     createdate: new Date().toISOString().split('T')[0] + 'T00:00:00+05:00',
//     editby: '',
//     editdate: new Date().toISOString().split('T')[0] + 'T00:00:00+05:00'
// });

// /* ---------------------------
//  * Data Service
// ---------------------------- */
// const useDataService = () => {
//     const { credentials } = useAuth();
//     const [data, setData] = useState([]);
//     const [lookupData, setLookupData] = useState({
//         countries: [],
//         cities: [],
//         glAccounts: [],
//         branchData: null
//     });
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');

//     const fetchTableData = async (tableName) => {
//         try {
//             const payload = { tableName };
//             const resp = await fetch(API_CONFIG.GET_URL, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });
//             if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
//             const data = await resp.json();
//             return data.success ? data.rows : [];
//         } catch (err) {
//             console.error(`Error fetching ${tableName}:`, err);
//             return [];
//         }
//     };

//     const loadAllData = useCallback(async () => {
//         setIsLoading(true);
//         setError('');

//         try {
//             const currentOffcode = credentials?.company?.offcode || '0101';

//             const [
//                 transporterData,
//                 countryData,
//                 cityData,
//                 glAccountData,
//                 branchData
//             ] = await Promise.all([
//                 fetchTableData(API_CONFIG.TABLES.TRANSPORTER),
//                 fetchTableData(API_CONFIG.TABLES.COUNTRY),
//                 fetchTableData(API_CONFIG.TABLES.CITY),
//                 fetchTableData(API_CONFIG.TABLES.ACCOUNT),
//                 fetchTableData(API_CONFIG.TABLES.BRANCH)
//             ]);

//             // Filter data by current offcode
//             const filteredTransporters = transporterData.filter(t =>
//                 normalizeValue(t.offcode) === currentOffcode
//             );

//             const filteredGLAccounts = glAccountData
//                 .filter(acc => acc.code && acc.name && normalizeValue(acc.offcode) === currentOffcode)
//                 .map(acc => ({
//                     code: normalizeValue(acc.code),
//                     name: normalizeValue(acc.name)
//                 }));

//             // Get branch data for control accounts
//             const currentBranch = branchData.find(b =>
//                 normalizeValue(b.offcode) === currentOffcode
//             );

//             setData(filteredTransporters);
//             setLookupData({
//                 countries: countryData.map(c => ({
//                     id: normalizeValue(c.CountryID),
//                     name: normalizeValue(c.CountryName)
//                 })),
//                 cities: cityData.map(c => ({
//                     id: normalizeValue(c.CityID),
//                     name: normalizeValue(c.CityName),
//                     countryId: normalizeValue(c.CountryID)
//                 })),
//                 glAccounts: filteredGLAccounts,
//                 branchData: currentBranch
//             });

//         } catch (err) {
//             setError(`Failed to load data: ${err.message}`);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [credentials]);

//     useEffect(() => {
//         loadAllData();
//     }, [loadAllData]);

//     return { data, lookupData, isLoading, error, refetch: loadAllData };
// };

// /* ---------------------------
//  * Collapsible Section Component
// ---------------------------- */
// const CollapsibleSection = ({ title, icon, children, defaultExpanded = true }) => {
//     const [isExpanded, setIsExpanded] = useState(defaultExpanded);

//     return (
//         <div className={`form-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
//             <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
//                 <div className="section-title">
//                     {icon}
//                     <h3>{title}</h3>
//                 </div>
//                 <Icon.ChevronDown className={`chevron ${isExpanded ? 'expanded' : ''}`} />
//             </div>
//             {isExpanded && (
//                 <div className="section-content">
//                     {children}
//                 </div>
//             )}
//         </div>
//     );
// };

// /* ---------------------------
//  * Transport Profile Form Component
// ---------------------------- */
// const TransportProfileForm = ({
//     formData,
//     onFormChange,
//     onSave,
//     onNewProfile,
//     currentMode,
//     isLoading,
//     lookupData
// }) => {
//     const { credentials } = useAuth();
//     const currentOffcode = credentials?.company?.offcode || '0101';

//     const {
//         offcode, TransporterCode, TransporterName, isactive, contact,
//         billaddress, zipcode, CountryID, CityID, phone1, mobile, fax,
//         email, paymentmethod, TransporterglCode, defaultTypePerAmt, defaultAmount
//     } = formData;

//     const { countries, cities, glAccounts, branchData } = lookupData;

//     const handleInput = (field, value) => onFormChange(field, value);
//     const handleNumericInput = (field, value) => onFormChange(field, value.replace(/[^0-9.]/g, ''));
//     const handleCheckbox = (field, e) => onFormChange(field, e.target.checked ? 'true' : 'false');

//     const isNewMode = currentMode === 'new';
//     const availableCities = cities.filter(c => c.countryId === CountryID);

//     // Payment Method Options
//     const paymentMethods = [
//         { code: '1', name: 'Advance Party' },
//         { code: '2', name: 'Payment Against Delivery' },
//         { code: '3', name: 'Credit' }
//     ];

//     // Default Type Options
//     const defaultTypeOptions = [
//         { code: '01', name: 'Fixed Amount' },
//         { code: '02', name: 'Percentage' }
//     ];

//     // Get transporter control account from branch data
//     const transporterControlAccount = branchData?.TransporterControlAccount || '';

//     // Filter GL accounts based on control account
//     const transporterGLAccounts = glAccounts.filter(acc =>
//         acc.code.startsWith(transporterControlAccount) || transporterControlAccount === ''
//     );

//     return (
//         <section className="detail-panel">
//             <div className="detail-header">
//                 <div className="header-content">
//                     <h1>{isNewMode ? 'Create New Transporter' : `${TransporterName || 'Transporter'} Details`}</h1>
//                     <div className="header-subtitle">
//                         <span className="mode-badge">{isNewMode ? 'NEW' : 'EDIT'}</span>
//                         <span className="muted">• {TransporterCode || 'No Code'}</span>
//                         <span className="muted">• Office: {currentOffcode}</span>
//                         {!(isactive === 'true') && <span className="inactive-badge">INACTIVE</span>}
//                     </div>
//                 </div>
//                 <div className="header-actions">
//                     <button
//                         className="btn btn-outline"
//                         onClick={onNewProfile}
//                     >
//                         <Icon.Plus /> New Transporter
//                     </button>
//                     <button
//                         className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
//                         onClick={onSave}
//                         disabled={isLoading || !TransporterName || !TransporterCode}
//                     >
//                         {isLoading ? <Icon.Loader className="spin" /> : <Icon.Save />}
//                         {isLoading ? 'Saving...' : 'Save Transporter'}
//                     </button>
//                 </div>
//             </div>

//             <div className="detail-body">
//                 {/* General Information */}
//                 <CollapsibleSection title="General Information" icon={<Icon.Truck />} defaultExpanded={true}>
//                     <div className="form-grid grid-3-col">
//                         <div className="form-group required">
//                             <label>Transporter Code *</label>
//                             <input
//                                 type="text"
//                                 value={TransporterCode}
//                                 onChange={e => handleInput('TransporterCode', e.target.value)}
//                                 disabled  // Disable when not in new mode
//                                 placeholder="Auto-generated"
//                                 className="mono"
//                             />
//                             {isNewMode && (
//                                 <div className="hint">
//                                     Code will be auto-generated as 0000000001, 0000000002, etc.
//                                 </div>
//                             )}
//                         </div>

//                         <div className="form-group required">
//                             <label>Transporter Name *</label>
//                             <input
//                                 type="text"
//                                 value={TransporterName}
//                                 onChange={e => handleInput('TransporterName', e.target.value)}
//                                 placeholder="Enter transporter name"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Contact Person</label>
//                             <input
//                                 type="text"
//                                 value={contact}
//                                 onChange={e => handleInput('contact', e.target.value)}
//                                 placeholder="Contact person name"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Office Code</label>
//                             <input type="text" value={currentOffcode} disabled />
//                         </div>
//                         <div className="form-group checkbox-group">
//                             <input
//                                 type="checkbo/x"
//                                 id="isActive"
//                                 checked={isactive === 'true'}
//                                 onChange={e => handleCheckbox('isactive', e)}
//                             />
//                             <label htmlFor="isActive">Transporter is Active</label>
//                         </div>
//                     </div>
//                 </CollapsibleSection>

//                 {/* Contact & Address */}
//                 <CollapsibleSection title="Contact & Address" icon={<Icon.MapPin />} defaultExpanded={true}>
//                     <div className="form-grid grid-3-col">
//                         <div className="form-group">
//                             <label>Phone</label>
//                             <input
//                                 type="text"
//                                 value={phone1}
//                                 onChange={e => handleInput('phone1', e.target.value)}
//                                 placeholder="Primary phone"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Mobile</label>
//                             <input
//                                 type="text"
//                                 value={mobile}
//                                 onChange={e => handleInput('mobile', e.target.value)}
//                                 placeholder="Mobile number"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Email</label>
//                             <input
//                                 type="email"
//                                 value={email}
//                                 onChange={e => handleInput('email', e.target.value)}
//                                 placeholder="Email address"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Fax</label>
//                             <input
//                                 type="text"
//                                 value={fax}
//                                 onChange={e => handleInput('fax', e.target.value)}
//                                 placeholder="Fax number"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Zip Code</label>
//                             <input
//                                 type="text"
//                                 value={zipcode}
//                                 onChange={e => handleInput('zipcode', e.target.value)}
//                                 placeholder="Postal code"
//                             />
//                         </div>
//                         <div className="form-group span-3-col">
//                             <label>Address</label>
//                             <input
//                                 type="text"
//                                 value={billaddress}
//                                 onChange={e => handleInput('billaddress', e.target.value)}
//                                 placeholder="Full address"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>Country</label>
//                             <select value={CountryID} onChange={e => handleInput('CountryID', e.target.value)}>
//                                 <option value="">Select Country</option>
//                                 {countries.map(c => (
//                                     <option key={c.id} value={c.id}>{c.name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="form-group">
//                             <label>City</label>
//                             <select value={CityID} onChange={e => handleInput('CityID', e.target.value)}>
//                                 <option value="">Select City</option>
//                                 {availableCities.map(c => (
//                                     <option key={c.id} value={c.id}>{c.name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>
//                 </CollapsibleSection>

//                 {/* Financial Settings */}
//                 <CollapsibleSection title="Financial Settings" icon={<Icon.DollarSign />} defaultExpanded={true}>
//                     <div className="form-grid grid-3-col">
//                         <div className="form-group">
//                             <label>Payment Method</label>
//                             <select value={paymentmethod} onChange={e => handleInput('paymentmethod', e.target.value)}>
//                                 <option value="">Select Payment Method</option>
//                                 {paymentMethods.map(pm => (
//                                     <option key={pm.code} value={pm.code}>{pm.name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="form-group">
//                             <label>Default Type</label>
//                             <select value={defaultTypePerAmt} onChange={e => handleInput('defaultTypePerAmt', e.target.value)}>
//                                 <option value="">Select Default Type</option>
//                                 {defaultTypeOptions.map(dt => (
//                                     <option key={dt.code} value={dt.code}>{dt.name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="form-group">
//                             <label>Default Amount</label>
//                             <input
//                                 type="number"
//                                 step="0.01"
//                                 value={defaultAmount}
//                                 onChange={e => handleNumericInput('defaultAmount', e.target.value)}
//                                 placeholder="0.00"
//                             />
//                         </div>
//                         <div className="form-group">
//                             <label>GL Account Code</label>
//                             <select
//                                 value={TransporterglCode}
//                                 onChange={e => handleInput('TransporterglCode', e.target.value)}
//                             >
//                                 <option value="">Select GL Account</option>
//                                 {transporterGLAccounts.map(acc => (
//                                     <option key={acc.code} value={acc.code}>
//                                         {acc.code} - {acc.name}
//                                     </option>
//                                 ))}
//                             </select>
//                             {transporterControlAccount && (
//                                 <div className="field-info">
//                                     Control Account: {transporterControlAccount}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </CollapsibleSection>
//             </div>
//         </section>
//     );
// };

// /* ---------------------------
//  * Transport Profile Main Component
// ---------------------------- */
// const TransportProfile = () => {
//     const { credentials } = useAuth();
//     const currentOffcode = credentials?.company?.offcode || '0101';
//     const currentUser = credentials?.username || 'SYSTEM';

//     const { data: transporters, lookupData, isLoading: isDataLoading, error, refetch } = useDataService();

//     const [selectedTransporter, setSelectedTransporter] = useState(null);
//     const [formData, setFormData] = useState(() => getInitialTransporterData(currentOffcode));
//     const [currentMode, setCurrentMode] = useState('new');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [isSaving, setIsSaving] = useState(false);
//     const [message, setMessage] = useState('');

//     // Generate transporter code starting from 0000000001
//     const generateTransporterCode = useCallback(() => {
//         if (transporters.length === 0) {
//             return '0000000001';
//         }

//         // Get all existing codes and find the maximum
//         const existingCodes = transporters
//             .map(t => parseInt(normalizeValue(t.TransporterCode)))
//             .filter(code => !isNaN(code) && code > 0);

//         const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
//         const nextCode = maxCode + 1;

//         // Format as 10-digit string with leading zeros
//         return nextCode.toString().padStart(10, '0');
//     }, [transporters]);

//     // Initialize form data for new record
//     useEffect(() => {
//         if (currentMode === 'new') {
//             const defaultCountryId = lookupData.countries[0]?.id || '1';
//             const defaultCityId = lookupData.cities.find(c => c.countryId === defaultCountryId)?.id || '1';
//             const newCode = generateTransporterCode();

//             setFormData(prev => ({
//                 ...getInitialTransporterData(currentOffcode),
//                 TransporterCode: newCode,
//                 createdby: currentUser,
//                 editby: currentUser,
//                 CountryID: defaultCountryId,
//                 CityID: defaultCityId,
//                 TransporterglCode: lookupData.glAccounts[0]?.code || ''
//             }));

//             setMessage(`Ready to create new transporter. Auto-generated code: ${newCode}`);
//         }
//     }, [currentMode, currentOffcode, currentUser, lookupData, generateTransporterCode]);

//     // Load selected transporter data into form
//     useEffect(() => {
//         if (selectedTransporter && currentMode === 'edit') {
//             const normalizedTransporter = Object.keys(getInitialTransporterData()).reduce((acc, key) => {
//                 acc[key] = normalizeValue(selectedTransporter[key] || getInitialTransporterData()[key]);
//                 return acc;
//             }, {});

//             setFormData(normalizedTransporter);
//         }
//     }, [selectedTransporter, currentMode]);

//     const handleFormChange = (field, value) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));
//     };

//     const handleSelectTransporter = (transporter) => {
//         setSelectedTransporter(transporter);
//         setCurrentMode('edit');
//         setMessage(`Editing: ${normalizeValue(transporter.TransporterName)}`);
//     };

//     const handleNewTransporter = () => {
//         setSelectedTransporter(null);
//         setCurrentMode('new');
//     };

//     const handleSave = async () => {
//         if (!formData.TransporterName.trim()) {
//             setMessage('❌ Transporter Name is required!');
//             return;
//         }

//         if (!formData.TransporterCode.trim()) {
//             setMessage('❌ Transporter Code is required!');
//             return;
//         }

//         setIsSaving(true);
//         setMessage('');

//         const url = currentMode === 'new' ? API_CONFIG.INSERT_URL : API_CONFIG.UPDATE_URL;

//         const payload = {
//             tableName: API_CONFIG.TABLES.TRANSPORTER,
//             data: {
//                 ...formData,
//                 TransporterCode: formData.TransporterCode,
//                 offcode: currentOffcode,
//                 editby: currentUser,
//                 editdate: new Date().toISOString(),
//                 createdby: currentMode === 'new' ? currentUser : formData.createdby,
//                 createdate: currentMode === 'new' ? new Date().toISOString() : formData.createdate,
//             }
//         };

//         if (currentMode === 'edit') {
//             payload.where = {
//                 TransporterCode: formData.TransporterCode,
//                 offcode: currentOffcode
//             };
//         }

//         try {
//             const resp = await fetch(url, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload)
//             });

//             if (!resp.ok) {
//                 throw new Error(`HTTP ${resp.status}`);
//             }

//             const result = await resp.json();

//             if (result.success) {
//                 setMessage('✅ Transporter saved successfully!');
//                 await refetch();

//                 if (currentMode === 'new') {
//                     // Find the newly created record
//                     const newRecord = transporters.find(t =>
//                         t.TransporterCode === formData.TransporterCode && t.offcode === currentOffcode
//                     ) || formData;
//                     setSelectedTransporter(newRecord);
//                     setCurrentMode('edit');
//                 }
//             } else {
//                 setMessage(`❌ Save failed: ${result.message || 'Unknown error'}`);
//             }

//         } catch (error) {
//             console.error('Save error:', error);
//             setMessage(`❌ Error: ${error.message}`);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     // Sidebar Component
//     const TransportProfileSidebar = () => {
//         const filteredTransporters = transporters.filter(t =>
//             normalizeValue(t.TransporterName).toLowerCase().includes(searchTerm.toLowerCase()) ||
//             normalizeValue(t.TransporterCode).includes(searchTerm)
//         );

//         return (
//             <aside className="sidebar">
//                 <div className="sidebar-top">
//                     <div className="sidebar-title">
//                         <Icon.Truck className="big" />
//                         <div>
//                             <div className="h3">Transport Profiles</div>
//                             <div className="muted small">{transporters.length} transporters • Office: {currentOffcode}</div>
//                         </div>
//                     </div>
//                     <div className="search-wrap">
//                         <Icon.Search className="search-icon" />
//                         <input
//                             type="text"
//                             placeholder="Search by code or name..."
//                             value={searchTerm}
//                             onChange={e => setSearchTerm(e.target.value)}
//                         />
//                     </div>
//                     <button
//                         className="btn btn-icon"
//                         onClick={refetch}
//                         disabled={isDataLoading}
//                         title="Refresh data"
//                     >
//                         <Icon.Refresh className={isDataLoading ? 'spin' : ''} />
//                     </button>
//                 </div>

//                 <div className="sidebar-body">
//                     {isDataLoading && transporters.length === 0 ? (
//                         <div className="loading-message">
//                             <Icon.Loader className="spin" /> Loading Transporters...
//                         </div>
//                     ) : filteredTransporters.length > 0 ? (
//                         <div className="profile-list">
//                             {filteredTransporters.map(transporter => (
//                                 <div
//                                     key={`${transporter.TransporterCode}-${transporter.offcode}`}
//                                     className={`profile-item ${selectedTransporter?.TransporterCode === transporter.TransporterCode && currentMode === 'edit' ? 'selected' : ''
//                                         }`}
//                                     onClick={() => handleSelectTransporter(transporter)}
//                                 >
//                                     <div className="profile-main">
//                                         <div className="code-name">
//                                             <span className="code">{normalizeValue(transporter.TransporterCode)}</span>
//                                             <span className="name">{normalizeValue(transporter.TransporterName)}</span>
//                                         </div>
//                                         <div className="profile-meta">
//                                             {normalizeValue(transporter.isactive) === 'true' ? (
//                                                 <span className="status active">Active</span>
//                                             ) : (
//                                                 <span className="status inactive">Inactive</span>
//                                             )}
//                                         </div>
//                                     </div>
//                                     {normalizeValue(transporter.phone1) && (
//                                         <div className="profile-phone">{normalizeValue(transporter.phone1)}</div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="empty-state">
//                             <Icon.Truck className="big-muted" />
//                             <div className="muted">No transporters found</div>
//                             {searchTerm && (
//                                 <div className="small muted">Try a different search term</div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </aside>
//         );
//     };

//     return (
//         <div className="page-container customer-supplier-page">
//             <div className="app-header">
//                 <div className="header-brand">
//                     <Icon.Truck className="brand-icon" />
//                     <div>
//                         <h1>Transport Management</h1>
//                         <div className="muted">Manage transporter profiles</div>
//                     </div>
//                 </div>
//                 <div className="header-user">
//                     <Icon.Truck className="icon-sm" />
//                     <span>{currentUser}</span>
//                 </div>
//             </div>

//             {error && (
//                 <div className="toast error">
//                     <div className="toast-content">
//                         <Icon.XCircle />
//                         <span>{error}</span>
//                     </div>
//                     <button className="toast-close" onClick={() => { }}>×</button>
//                 </div>
//             )}

//             {message && (
//                 <div className={`toast ${message.includes('❌') ? 'error' : message.includes('✅') ? 'success' : 'info'}`}>
//                     <div className="toast-content">
//                         {message.includes('✅') && <Icon.CheckCircle />}
//                         {message.includes('❌') && <Icon.XCircle />}
//                         <span>{message.replace(/[✅❌]/g, '')}</span>
//                     </div>
//                     <button className="toast-close" onClick={() => setMessage('')}>×</button>
//                 </div>
//             )}

//             <div className="content-area">
//                 <TransportProfileSidebar />

//                 <div className="main-content">
//                     <div className="content-tabs">
//                         <button className="tab active">
//                             <Icon.Truck /> Profile Details
//                         </button>
//                     </div>

//                     <div className="content-panel">
//                         <TransportProfileForm
//                             formData={formData}
//                             onFormChange={handleFormChange}
//                             onSave={handleSave}
//                             onNewProfile={handleNewTransporter}
//                             currentMode={currentMode}
//                             isLoading={isSaving}
//                             lookupData={lookupData}
//                         />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default TransportProfile;

import GenericManagementScreen from './MasterDataGenericManager';
const TransportProfile = () => {
  return <GenericManagementScreen screenType="TRANSPORTER" />;
};
export default TransportProfile;