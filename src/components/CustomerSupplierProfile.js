import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./ChartofAccount.css";
import { AuthContext } from "../AuthContext";

/* ---------------------------
 * API & Configuration
---------------------------- */
const API_CONFIG = {
  BASE_URL: 'http://192.168.100.113:8081/api',
  TABLES: {
    CUSTOMER_SUPPLIER: 'comcustomer',
    SALESMAN: 'comSaleman',
    COUNTRY: 'Country',
    CITY: 'cities',
    ACCOUNT: 'acChartOfAccount',
    BRANCH: 'comBranch'
  },
  PRIMARY_KEYS: {
    CUSTOMER_SUPPLIER: ['CustomerCode', 'offcode']
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
  User: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 5.74"></path></svg>,
  MapPin: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  DollarSign: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>,
  Tag: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 22.5L14 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 0 2 2h2v.5a2.5 2.5 0 0 1-2.5 2.5z"></path></svg>,
  CreditCard: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>,
  CheckCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  XCircle: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
};

/* ---------------------------
 * Initial State
---------------------------- */
const getInitialCustomerData = (offcode = '1010') => ({
  offcode: offcode,
  CustomerCode: '',
  CustomerName: '',
  CustomerNameAR: '',
  SHD: '',
  isactive: 'true',
  billaddress: '',
  billaddressAR: '',
  zipcode: '',
  CountryID: '1',
  country: 'Pakistan',
  CityID: '1',
  city: 'LAHORE',
  phone1: '',
  mobile: '0',
  fax: '',
  email: '',
  type: '1',
  IsSalesTax: 'false',
  SalesTaxNo: '----',
  SalesTaxNoAR: '',
  isCustomer: 'true',
  Customercreditisactive: 'false',
  Customercreditdays: '0',
  CustomerisDiscount: 'false',
  Customerdiscountper: '0.00',
  CustomerglCode: '',
  CustomerCreditLimit: '0.00',
  isSupplier: 'false',
  Supplierrcreditisactive: 'false',
  Suppliercreditdays: '0',
  SupplierisDiscount: 'false',
  Supplierdiscountper: '0.00',
  SupplierglCode: '',
  SupplierCreditLimit: '0.00',
  SaleManCode: '',
  isNTN: 'false',
  NTN: '-',
  CNIC: '0',
  // Additional fields from JSON
  ST1: '',
  ST2: '',
  ST3: '',
  ST4: '',
  ST5: '',
  CustomeralternativeCode: '',
  SupplieralternativeCode: '',
  PartyVendorCode: '',
  PartyCustomerCode: '',
  PackageId: '1',
  PerMonthFee: '700',
  PackageDate: new Date().toISOString().split('T')[0] + 'T00:00:00+05:00',
  SectorCode: '000001',
  isAcCreate: 'false',
  PackageTotalAmount: '0',
  PackageDownAmount: '0',
  PackageBalanceAmount: '0',
  PackageNoofInstallment: '0',
  ProductDetail: '',
  ProductDetailAR: '',
  State: '',
  isTaxableInvoice: 'true',
  RateType: '1',
  // ZATCA fields
  buytypeId: 'TIN',
  buystreetname: '',
  buybuildingname: '',
  buybuildno: '0',
  buyplotid: '',
  buyadbuildno: '',
  buypostalzone: '0',
  buysubcitysubname: '',
  buycountrySubentity: '',
  buyContractAmount: '0.00',
  sellersidtype: 'CRN',
  sellersid: '',
  scenarioId: 'SN001',
  CustomerSupplierType: 'CUSTOMER/SUPPLIER',
  createdby: '',
  createdate: new Date().toISOString().split('T')[0] + 'T00:00:00+05:00',
  editby: '',
  editdate: new Date().toISOString().split('T')[0] + 'T00:00:00+05:00'
});

/* ---------------------------
 * Data Service
---------------------------- */
const useDataService = () => {
  const { credentials } = useAuth();
  const [data, setData] = useState([]);
  const [lookupData, setLookupData] = useState({
    saleMen: [],
    countries: [],
    cities: [],
    glAccounts: [],
    branchData: null
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
        customerData,
        salesManData,
        countryData,
        cityData,
        glAccountData,
        branchData
      ] = await Promise.all([
        fetchTableData(API_CONFIG.TABLES.CUSTOMER_SUPPLIER),
        fetchTableData(API_CONFIG.TABLES.SALESMAN),
        fetchTableData(API_CONFIG.TABLES.COUNTRY),
        fetchTableData(API_CONFIG.TABLES.CITY),
        fetchTableData(API_CONFIG.TABLES.ACCOUNT),
        fetchTableData(API_CONFIG.TABLES.BRANCH)
      ]);

      // Filter data by current offcode
      const filteredCustomers = customerData.filter(c => 
        normalizeValue(c.offcode) === currentOffcode
      );
      
      const filteredSalesMen = salesManData.filter(s => 
        normalizeValue(s.offcode) === currentOffcode
      ).map(s => ({ 
        code: normalizeValue(s.code), 
        name: normalizeValue(s.name) 
      }));

      const filteredGLAccounts = glAccountData
        .filter(acc => acc.code && acc.name && normalizeValue(acc.offcode) === currentOffcode)
        .map(acc => ({ 
          code: normalizeValue(acc.code), 
          name: normalizeValue(acc.name) 
        }));

      // Get branch data for control accounts
      const currentBranch = branchData.find(b => 
        normalizeValue(b.offcode) === currentOffcode
      );

      setData(filteredCustomers);
      setLookupData({
        saleMen: filteredSalesMen,
        countries: countryData.map(c => ({ 
          id: normalizeValue(c.CountryID), 
          name: normalizeValue(c.CountryName) 
        })),
        cities: cityData.map(c => ({ 
          id: normalizeValue(c.CityID), 
          name: normalizeValue(c.CityName), 
          countryId: normalizeValue(c.CountryID) 
        })),
        glAccounts: filteredGLAccounts,
        branchData: currentBranch
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
 * Collapsible Section Component
---------------------------- */
const CollapsibleSection = ({ title, icon, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`form-section ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="section-title">
          {icon}
          <h3>{title}</h3>
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
 * Customer/Supplier Profile Form Component
---------------------------- */
const CustomerSupplierProfileForm = ({
  formData,
  onFormChange,
  onSave,
  onNewProfile,
  currentMode,
  isLoading,
  lookupData
}) => {
  const { credentials } = useAuth();
  const currentOffcode = credentials?.company?.offcode || '0101';
  
  const {
    offcode, CustomerCode, CustomerName, CustomerNameAR, SHD, isactive,
    billaddress, billaddressAR, zipcode, CountryID, CityID, phone1, mobile, fax,
    email, type, IsSalesTax, SalesTaxNo, SalesTaxNoAR, isCustomer,
    Customercreditisactive, Customercreditdays, CustomerisDiscount, Customerdiscountper,
    CustomerglCode, CustomerCreditLimit, isSupplier, Supplierrcreditisactive,
    Suppliercreditdays, SupplierisDiscount, Supplierdiscountper, SupplierglCode,
    SupplierCreditLimit, SaleManCode, isNTN, NTN, CNIC, CustomerSupplierType,
    // Additional fields
    ST1, ST2, ST3, ST4, ST5, CustomeralternativeCode, SupplieralternativeCode,
    PartyVendorCode, PartyCustomerCode, PackageId, PerMonthFee, PackageDate,
    SectorCode, isAcCreate, PackageTotalAmount, PackageDownAmount, PackageBalanceAmount,
    PackageNoofInstallment, ProductDetail, ProductDetailAR, State, isTaxableInvoice,
    RateType,
    // ZATCA fields
    buytypeId, buystreetname, buybuildingname, buybuildno, buyplotid, buyadbuildno,
    buypostalzone, buysubcitysubname, buycountrySubentity, buyContractAmount,
    sellersidtype, sellersid, scenarioId
  } = formData;

  const { saleMen, countries, cities, glAccounts, branchData } = lookupData;

  const handleInput = (field, value) => onFormChange(field, value);
  const handleNumericInput = (field, value) => onFormChange(field, value.replace(/[^0-9.]/g, ''));
  const handleCheckbox = (field, e) => onFormChange(field, e.target.checked ? 'true' : 'false');

  const isNewMode = currentMode === 'new';
  const availableCities = cities.filter(c => c.countryId === CountryID);

  // Get control accounts from branch data
  const customerControlAccount = branchData?.CustomerControlAccount || '';
  const supplierControlAccount = branchData?.SupplierControlAccount || '';

  // Filter GL accounts based on control accounts
  const customerGLAccounts = glAccounts.filter(acc => 
    acc.code.startsWith(customerControlAccount) || customerControlAccount === ''
  );
  
  const supplierGLAccounts = glAccounts.filter(acc => 
    acc.code.startsWith(supplierControlAccount) || supplierControlAccount === ''
  );

  return (
    <section className="detail-panel">
      <div className="detail-header">
        <div className="header-content">
          <h1>{isNewMode ? 'Create New Profile' : `${CustomerName || 'Profile'} Details`}</h1>
          <div className="header-subtitle">
            <span className="mode-badge">{isNewMode ? 'NEW' : 'EDIT'}</span>
            <span className="muted">• {CustomerCode || 'No Code'}</span>
            <span className="muted">• Office: {currentOffcode}</span>
            {!(isactive === 'true') && <span className="inactive-badge">INACTIVE</span>}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={onNewProfile}
          >
            <Icon.Plus /> New Profile
          </button>
          <button
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            onClick={onSave}
            disabled={isLoading || !CustomerName || !CustomerCode}
          >
            {isLoading ? <Icon.Loader className="spin" /> : <Icon.Save />}
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="detail-body">
        {/* General Information */}
        <CollapsibleSection title="General Information" icon={<Icon.User />} defaultExpanded={true}>
          <div className="form-grid grid-3-col">
            <div className="form-group required">
              <label>Customer Code *</label>
              <input 
                type="text" 
                value={CustomerCode} 
                onChange={e => handleInput('CustomerCode', e.target.value)} 
                disabled={!isNewMode}
                placeholder="Enter unique code"
              />
            </div>
            <div className="form-group required">
              <label>Name (English) *</label>
              <input 
                type="text" 
                value={CustomerName} 
                onChange={e => handleInput('CustomerName', e.target.value)}
                placeholder="Enter customer name"
              />
            </div>
            <div className="form-group">
              <label>Short Hand (SHD)</label>
              <input 
                type="text" 
                value={SHD} 
                onChange={e => handleInput('SHD', e.target.value)}
                placeholder="Short code"
              />
            </div>
            <div className="form-group">
              <label>Name (Arabic)</label>
              <input 
                type="text" 
                value={CustomerNameAR} 
                onChange={e => handleInput('CustomerNameAR', e.target.value)}
                placeholder="Arabic name"
              />
            </div>
            <div className="form-group">
              <label>Office Code</label>
              <input type="text" value={currentOffcode} disabled />
            </div>
            <div className="form-group">
              <label>Profile Type</label>
              <select value={CustomerSupplierType} onChange={e => handleInput('CustomerSupplierType', e.target.value)}>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="SUPPLIER">SUPPLIER</option>
                <option value="CUSTOMER/SUPPLIER">CUSTOMER/SUPPLIER</option>
              </select>
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="isActive" 
                checked={isactive === 'true'} 
                onChange={e => handleCheckbox('isactive', e)} 
              />
              <label htmlFor="isActive">Profile is Active</label>
            </div>
            <div className="form-group">
              <label>Type</label>
              <input 
                type="text" 
                value={type} 
                onChange={e => handleInput('type', e.target.value)}
                placeholder="Type code"
              />
            </div>
            <div className="form-group">
              <label>Sector Code</label>
              <input 
                type="text" 
                value={SectorCode} 
                onChange={e => handleInput('SectorCode', e.target.value)}
                placeholder="Sector code"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Contact & Address */}
        <CollapsibleSection title="Contact & Address" icon={<Icon.MapPin />} defaultExpanded={true}>
          <div className="form-grid grid-3-col">
            <div className="form-group">
              <label>Phone 1</label>
              <input 
                type="text" 
                value={phone1} 
                onChange={e => handleInput('phone1', e.target.value)}
                placeholder="Primary phone"
              />
            </div>
            <div className="form-group">
              <label>Mobile</label>
              <input 
                type="text" 
                value={mobile} 
                onChange={e => handleInput('mobile', e.target.value)}
                placeholder="Mobile number"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => handleInput('email', e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className="form-group">
              <label>Fax</label>
              <input 
                type="text" 
                value={fax} 
                onChange={e => handleInput('fax', e.target.value)}
                placeholder="Fax number"
              />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input 
                type="text" 
                value={zipcode} 
                onChange={e => handleInput('zipcode', e.target.value)}
                placeholder="Postal code"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input 
                type="text" 
                value={State} 
                onChange={e => handleInput('State', e.target.value)}
                placeholder="State/Province"
              />
            </div>
            <div className="form-group span-3-col">
              <label>Billing Address (English)</label>
              <input 
                type="text" 
                value={billaddress} 
                onChange={e => handleInput('billaddress', e.target.value)}
                placeholder="Full billing address"
              />
            </div>
            <div className="form-group span-3-col">
              <label>Billing Address (Arabic)</label>
              <input 
                type="text" 
                value={billaddressAR} 
                onChange={e => handleInput('billaddressAR', e.target.value)}
                placeholder="Arabic billing address"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <select value={CountryID} onChange={e => handleInput('CountryID', e.target.value)}>
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>City</label>
              <select value={CityID} onChange={e => handleInput('CityID', e.target.value)}>
                <option value="">Select City</option>
                {availableCities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Product Details</label>
              <input 
                type="text" 
                value={ProductDetail} 
                onChange={e => handleInput('ProductDetail', e.target.value)}
                placeholder="Product information"
              />
            </div>
            <div className="form-group">
              <label>Product Details (Arabic)</label>
              <input 
                type="text" 
                value={ProductDetailAR} 
                onChange={e => handleInput('ProductDetailAR', e.target.value)}
                placeholder="Arabic product information"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Tax & Identification */}
        <CollapsibleSection title="Tax & Identification" icon={<Icon.Tag />} defaultExpanded={true}>
          <div className="form-grid grid-3-col">
            <div className="form-group checkbox-group span-3-col">
              <input 
                type="checkbox" 
                id="isSalesTax" 
                checked={IsSalesTax === 'true'} 
                onChange={e => handleCheckbox('IsSalesTax', e)} 
              />
              <label htmlFor="isSalesTax">Subject to Sales Tax (VAT/GST)</label>
            </div>
            <div className="form-group">
              <label>Sales Tax No</label>
              <input 
                type="text" 
                value={SalesTaxNo} 
                onChange={e => handleInput('SalesTaxNo', e.target.value)}
                placeholder="Tax registration number"
              />
            </div>
            <div className="form-group">
              <label>Sales Tax No (Arabic)</label>
              <input 
                type="text" 
                value={SalesTaxNoAR} 
                onChange={e => handleInput('SalesTaxNoAR', e.target.value)}
                placeholder="Arabic tax number"
              />
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="isNTN" 
                checked={isNTN === 'true'} 
                onChange={e => handleCheckbox('isNTN', e)} 
              />
              <label htmlFor="isNTN">Has NTN</label>
            </div>
            <div className="form-group">
              <label>NTN</label>
              <input 
                type="text" 
                value={NTN} 
                onChange={e => handleInput('NTN', e.target.value)}
                placeholder="National tax number"
              />
            </div>
            <div className="form-group">
              <label>CNIC</label>
              <input 
                type="text" 
                value={CNIC} 
                onChange={e => handleInput('CNIC', e.target.value)}
                placeholder="National ID number"
              />
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="isTaxableInvoice" 
                checked={isTaxableInvoice === 'true'} 
                onChange={e => handleCheckbox('isTaxableInvoice', e)} 
              />
              <label htmlFor="isTaxableInvoice">Taxable Invoice</label>
            </div>
            <div className="form-group">
              <label>Rate Type</label>
              <select value={RateType} onChange={e => handleInput('RateType', e.target.value)}>
                <option value="1">Standard Rate</option>
                <option value="2">Zero Rate</option>
                <option value="3">Exempt</option>
              </select>
            </div>
            <div className="form-group">
              <label>Seller ID Type</label>
              <input 
                type="text" 
                value={sellersidtype} 
                onChange={e => handleInput('sellersidtype', e.target.value)}
                placeholder="Seller identification type"
              />
            </div>
            <div className="form-group">
              <label>Seller ID</label>
              <input 
                type="text" 
                value={sellersid} 
                onChange={e => handleInput('sellersid', e.target.value)}
                placeholder="Seller identification"
              />
            </div>
            <div className="form-group">
              <label>Scenario ID</label>
              <input 
                type="text" 
                value={scenarioId} 
                onChange={e => handleInput('scenarioId', e.target.value)}
                placeholder="Scenario identifier"
              />
            </div>
            {/* Additional tax fields */}
            <div className="form-group">
              <label>ST1</label>
              <input type="text" value={ST1} onChange={e => handleInput('ST1', e.target.value)} />
            </div>
            <div className="form-group">
              <label>ST2</label>
              <input type="text" value={ST2} onChange={e => handleInput('ST2', e.target.value)} />
            </div>
            <div className="form-group">
              <label>ST3</label>
              <input type="text" value={ST3} onChange={e => handleInput('ST3', e.target.value)} />
            </div>
            <div className="form-group">
              <label>ST4</label>
              <input type="text" value={ST4} onChange={e => handleInput('ST4', e.target.value)} />
            </div>
            <div className="form-group">
              <label>ST5</label>
              <input type="text" value={ST5} onChange={e => handleInput('ST5', e.target.value)} />
            </div>
          </div>
        </CollapsibleSection>

        {/* Customer Settings */}
        <CollapsibleSection title="Customer Settings" icon={<Icon.User />} defaultExpanded={true}>
          <div className="form-grid grid-3-col">
            <div className="form-group checkbox-group span-3-col">
              <input 
                type="checkbox" 
                id="isCustomer" 
                checked={isCustomer === 'true'} 
                onChange={e => handleCheckbox('isCustomer', e)} 
              />
              <label htmlFor="isCustomer">Is a Customer</label>
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="custCreditActive" 
                checked={Customercreditisactive === 'true'} 
                onChange={e => handleCheckbox('Customercreditisactive', e)} 
                disabled={isCustomer !== 'true'}
              />
              <label htmlFor="custCreditActive">Credit Active</label>
            </div>
            <div className="form-group">
              <label>Credit Days</label>
              <input 
                type="number" 
                value={Customercreditdays} 
                onChange={e => handleNumericInput('Customercreditdays', e.target.value)} 
                disabled={isCustomer !== 'true'}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Credit Limit</label>
              <input 
                type="number" 
                step="0.01"
                value={CustomerCreditLimit} 
                onChange={e => handleNumericInput('CustomerCreditLimit', e.target.value)} 
                disabled={isCustomer !== 'true'}
                placeholder="0.00"
              />
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="custDiscount" 
                checked={CustomerisDiscount === 'true'} 
                onChange={e => handleCheckbox('CustomerisDiscount', e)} 
                disabled={isCustomer !== 'true'}
              />
              <label htmlFor="custDiscount">Discount Active</label>
            </div>
            <div className="form-group">
              <label>Discount %</label>
              <input 
                type="number" 
                step="0.01" 
                value={Customerdiscountper} 
                onChange={e => handleNumericInput('Customerdiscountper', e.target.value)} 
                disabled={isCustomer !== 'true'}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>GL Account Code *</label>
              <select 
                value={CustomerglCode} 
                onChange={e => handleInput('CustomerglCode', e.target.value)} 
                disabled={isCustomer !== 'true'}
              >
                <option value="">Select GL Account</option>
                {customerGLAccounts.map(acc => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
              {customerControlAccount && (
                <div className="field-info">
                  Control Account: {customerControlAccount}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Sales Man Code</label>
              <select 
                value={SaleManCode} 
                onChange={e => handleInput('SaleManCode', e.target.value)} 
                disabled={isCustomer !== 'true'}
              >
                <option value="">Select Salesman</option>
                {saleMen.map(sm => (
                  <option key={sm.code} value={sm.code}>
                    {sm.code} - {sm.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Alternative Code</label>
              <input 
                type="text" 
                value={CustomeralternativeCode} 
                onChange={e => handleInput('CustomeralternativeCode', e.target.value)}
                placeholder="Alternative customer code"
              />
            </div>
            <div className="form-group">
              <label>Party Customer Code</label>
              <input 
                type="text" 
                value={PartyCustomerCode} 
                onChange={e => handleInput('PartyCustomerCode', e.target.value)}
                placeholder="Party customer code"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Supplier Settings */}
        <CollapsibleSection title="Supplier Settings" icon={<Icon.CreditCard />} defaultExpanded={true}>
          <div className="form-grid grid-3-col">
            <div className="form-group checkbox-group span-3-col">
              <input 
                type="checkbox" 
                id="isSupplier" 
                checked={isSupplier === 'true'} 
                onChange={e => handleCheckbox('isSupplier', e)} 
              />
              <label htmlFor="isSupplier">Is a Supplier</label>
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="suppCreditActive" 
                checked={Supplierrcreditisactive === 'true'} 
                onChange={e => handleCheckbox('Supplierrcreditisactive', e)} 
                disabled={isSupplier !== 'true'}
              />
              <label htmlFor="suppCreditActive">Credit Active</label>
            </div>
            <div className="form-group">
              <label>Credit Days</label>
              <input 
                type="number" 
                value={Suppliercreditdays} 
                onChange={e => handleNumericInput('Suppliercreditdays', e.target.value)} 
                disabled={isSupplier !== 'true'}
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label>Credit Limit</label>
              <input 
                type="number" 
                step="0.01"
                value={SupplierCreditLimit} 
                onChange={e => handleNumericInput('SupplierCreditLimit', e.target.value)} 
                disabled={isSupplier !== 'true'}
                placeholder="0.00"
              />
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="suppDiscount" 
                checked={SupplierisDiscount === 'true'} 
                onChange={e => handleCheckbox('SupplierisDiscount', e)} 
                disabled={isSupplier !== 'true'}
              />
              <label htmlFor="suppDiscount">Discount Active</label>
            </div>
            <div className="form-group">
              <label>Discount %</label>
              <input 
                type="number" 
                step="0.01" 
                value={Supplierdiscountper} 
                onChange={e => handleNumericInput('Supplierdiscountper', e.target.value)} 
                disabled={isSupplier !== 'true'}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>GL Account Code *</label>
              <select 
                value={SupplierglCode} 
                onChange={e => handleInput('SupplierglCode', e.target.value)} 
                disabled={isSupplier !== 'true'}
              >
                <option value="">Select GL Account</option>
                {supplierGLAccounts.map(acc => (
                  <option key={acc.code} value={acc.code}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
              {supplierControlAccount && (
                <div className="field-info">
                  Control Account: {supplierControlAccount}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>Alternative Code</label>
              <input 
                type="text" 
                value={SupplieralternativeCode} 
                onChange={e => handleInput('SupplieralternativeCode', e.target.value)}
                placeholder="Alternative supplier code"
              />
            </div>
            <div className="form-group">
              <label>Party Vendor Code</label>
              <input 
                type="text" 
                value={PartyVendorCode} 
                onChange={e => handleInput('PartyVendorCode', e.target.value)}
                placeholder="Party vendor code"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Package Information */}
        <CollapsibleSection title="Package Information" icon={<Icon.DollarSign />} defaultExpanded={false}>
          <div className="form-grid grid-3-col">
            <div className="form-group">
              <label>Package ID</label>
              <input 
                type="text" 
                value={PackageId} 
                onChange={e => handleInput('PackageId', e.target.value)}
                placeholder="Package identifier"
              />
            </div>
            <div className="form-group">
              <label>Per Month Fee</label>
              <input 
                type="number" 
                value={PerMonthFee} 
                onChange={e => handleNumericInput('PerMonthFee', e.target.value)}
                placeholder="Monthly fee"
              />
            </div>
            <div className="form-group">
              <label>Package Date</label>
              <input 
                type="datetime-local" 
                value={PackageDate} 
                onChange={e => handleInput('PackageDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Total Amount</label>
              <input 
                type="number" 
                step="0.01"
                value={PackageTotalAmount} 
                onChange={e => handleNumericInput('PackageTotalAmount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Down Amount</label>
              <input 
                type="number" 
                step="0.01"
                value={PackageDownAmount} 
                onChange={e => handleNumericInput('PackageDownAmount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Balance Amount</label>
              <input 
                type="number" 
                step="0.01"
                value={PackageBalanceAmount} 
                onChange={e => handleNumericInput('PackageBalanceAmount', e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>No. of Installments</label>
              <input 
                type="number" 
                value={PackageNoofInstallment} 
                onChange={e => handleNumericInput('PackageNoofInstallment', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="form-group checkbox-group">
              <input 
                type="checkbox" 
                id="isAcCreate" 
                checked={isAcCreate === 'true'} 
                onChange={e => handleCheckbox('isAcCreate', e)} 
              />
              <label htmlFor="isAcCreate">Account Created</label>
            </div>
          </div>
        </CollapsibleSection>

        {/* ZATCA/E-Invoicing Fields */}
        <CollapsibleSection title="ZATCA/E-Invoicing Fields" icon={<Icon.Tag />} defaultExpanded={false}>
          <div className="form-grid grid-3-col">
            <div className="form-group">
              <label>Buyer ID Type</label>
              <input 
                type="text" 
                value={buytypeId} 
                onChange={e => handleInput('buytypeId', e.target.value)}
                placeholder="TIN, CRN, etc."
              />
            </div>
            <div className="form-group">
              <label>Street Name</label>
              <input 
                type="text" 
                value={buystreetname} 
                onChange={e => handleInput('buystreetname', e.target.value)}
                placeholder="Street address"
              />
            </div>
            <div className="form-group">
              <label>Building Name</label>
              <input 
                type="text" 
                value={buybuildingname} 
                onChange={e => handleInput('buybuildingname', e.target.value)}
                placeholder="Building name"
              />
            </div>
            <div className="form-group">
              <label>Building Number</label>
              <input 
                type="text" 
                value={buybuildno} 
                onChange={e => handleInput('buybuildno', e.target.value)}
                placeholder="Building number"
              />
            </div>
            <div className="form-group">
              <label>Additional Building No</label>
              <input 
                type="text" 
                value={buyadbuildno} 
                onChange={e => handleInput('buyadbuildno', e.target.value)}
                placeholder="Additional building number"
              />
            </div>
            <div className="form-group">
              <label>Plot ID</label>
              <input 
                type="text" 
                value={buyplotid} 
                onChange={e => handleInput('buyplotid', e.target.value)}
                placeholder="Plot identifier"
              />
            </div>
            <div className="form-group">
              <label>Postal Zone</label>
              <input 
                type="text" 
                value={buypostalzone} 
                onChange={e => handleInput('buypostalzone', e.target.value)}
                placeholder="Postal code zone"
              />
            </div>
            <div className="form-group">
              <label>Sub City/Sub Name</label>
              <input 
                type="text" 
                value={buysubcitysubname} 
                onChange={e => handleInput('buysubcitysubname', e.target.value)}
                placeholder="Sub-city name"
              />
            </div>
            <div className="form-group">
              <label>Country Sub-Entity</label>
              <input 
                type="text" 
                value={buycountrySubentity} 
                onChange={e => handleInput('buycountrySubentity', e.target.value)}
                placeholder="Region/Province"
              />
            </div>
            <div className="form-group">
              <label>Contract Amount</label>
              <input 
                type="number" 
                step="0.01"
                value={buyContractAmount} 
                onChange={e => handleNumericInput('buyContractAmount', e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </section>
  );
};

/* ---------------------------
 * Customer/Supplier Profile Main Component
---------------------------- */
const CustomerSupplierProfile = () => {
  const { credentials } = useAuth();
  const currentOffcode = credentials?.company?.offcode || '0101';
  const currentUser = credentials?.username || 'SYSTEM';
  
  const { data: profiles, lookupData, isLoading: isDataLoading, error, refetch } = useDataService();

  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState(() => getInitialCustomerData(currentOffcode));
  const [currentMode, setCurrentMode] = useState('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Initialize form data for new record
  useEffect(() => {
    if (currentMode === 'new') {
      const defaultCountryId = lookupData.countries[0]?.id || '1';
      const defaultCityId = lookupData.cities.find(c => c.countryId === defaultCountryId)?.id || '1';
      
      setFormData(prev => ({
        ...getInitialCustomerData(currentOffcode),
        createdby: currentUser,
        editby: currentUser,
        CountryID: defaultCountryId,
        CityID: defaultCityId,
        CustomerglCode: lookupData.glAccounts[0]?.code || '',
        SupplierglCode: lookupData.glAccounts[0]?.code || '',
        SaleManCode: lookupData.saleMen[0]?.code || ''
      }));
    }
  }, [currentMode, currentOffcode, currentUser, lookupData]);

  // Load selected profile data into form
  useEffect(() => {
    if (selectedProfile && currentMode === 'edit') {
      const normalizedProfile = Object.keys(getInitialCustomerData()).reduce((acc, key) => {
        acc[key] = normalizeValue(selectedProfile[key] || getInitialCustomerData()[key]);
        return acc;
      }, {});
      
      setFormData(normalizedProfile);
    }
  }, [selectedProfile, currentMode]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setCurrentMode('edit');
    setMessage(`Editing: ${normalizeValue(profile.CustomerName)}`);
  };

  const handleNewProfile = () => {
    setSelectedProfile(null);
    setCurrentMode('new');
    setMessage('Creating new profile...');
  };

  const generateCustomerCode = () => {
    const existingCodes = profiles.map(p => parseInt(normalizeValue(p.CustomerCode))).filter(code => !isNaN(code));
    const maxCode = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    return (maxCode + 1).toString().padStart(10, '0');
  };

  const handleSave = async () => {
    if (!formData.CustomerName.trim()) {
      setMessage('❌ Customer Name is required!');
      return;
    }

    if (!formData.CustomerCode.trim()) {
      setMessage('❌ Customer Code is required!');
      return;
    }

    // Auto-generate code for new records if empty
    let finalCustomerCode = formData.CustomerCode;
    if (currentMode === 'new' && !finalCustomerCode.trim()) {
      finalCustomerCode = generateCustomerCode();
      handleFormChange('CustomerCode', finalCustomerCode);
    }

    setIsSaving(true);
    setMessage('');

    const url = currentMode === 'new' ? API_CONFIG.INSERT_URL : API_CONFIG.UPDATE_URL;
    
    const payload = {
      tableName: API_CONFIG.TABLES.CUSTOMER_SUPPLIER,
      data: {
        ...formData,
        CustomerCode: finalCustomerCode,
        offcode: currentOffcode,
        editby: currentUser,
        editdate: new Date().toISOString(),
        createdby: currentMode === 'new' ? currentUser : formData.createdby,
        createdate: currentMode === 'new' ? new Date().toISOString() : formData.createdate,
      }
    };

    if (currentMode === 'edit') {
      payload.where = {
        CustomerCode: formData.CustomerCode,
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
        setMessage('✅ Profile saved successfully!');
        await refetch();
        
        if (currentMode === 'new') {
          // Find the newly created record
          const newRecord = profiles.find(p => 
            p.CustomerCode === finalCustomerCode && p.offcode === currentOffcode
          ) || { ...formData, CustomerCode: finalCustomerCode };
          setSelectedProfile(newRecord);
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
  const CustomerProfileSidebar = () => {
    const filteredProfiles = profiles.filter(p =>
      normalizeValue(p.CustomerName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      normalizeValue(p.CustomerCode).includes(searchTerm)
    );

    return (
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-title">
            <Icon.User className="big" />
            <div>
              <div className="h3">Customer/Supplier Profiles</div>
              <div className="muted small">{profiles.length} profiles • Office: {currentOffcode}</div>
            </div>
          </div>
          <div className="search-wrap">
            <Icon.Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by code or name..."
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
          {isDataLoading && profiles.length === 0 ? (
            <div className="loading-message">
              <Icon.Loader className="spin" /> Loading Profiles...
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="profile-list">
              {filteredProfiles.map(profile => (
                <div
                  key={`${profile.CustomerCode}-${profile.offcode}`}
                  className={`profile-item ${
                    selectedProfile?.CustomerCode === profile.CustomerCode && currentMode === 'edit' ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectProfile(profile)}
                >
                  <div className="profile-main">
                    <div className="code-name">
                      <span className="code">{normalizeValue(profile.CustomerCode)}</span>
                      <span className="name">{normalizeValue(profile.CustomerName)}</span>
                    </div>
                    <div className="profile-meta">
                      <span className={`type-badge ${normalizeValue(profile.CustomerSupplierType).toLowerCase().replace('/', '-')}`}>
                        {normalizeValue(profile.CustomerSupplierType)}
                      </span>
                      {normalizeValue(profile.isactive) === 'true' ? (
                        <span className="status active">Active</span>
                      ) : (
                        <span className="status inactive">Inactive</span>
                      )}
                    </div>
                  </div>
                  {normalizeValue(profile.phone1) && (
                    <div className="profile-phone">{normalizeValue(profile.phone1)}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Icon.User className="big-muted" />
              <div className="muted">No profiles found</div>
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
          <Icon.User className="brand-icon" />
          <div>
            <h1>Customer & Supplier Management</h1>
            <div className="muted">Manage customer and supplier profiles</div>
          </div>
        </div>
        <div className="header-user">
          <Icon.User className="icon-sm" />
          <span>{currentUser}</span>
        </div>
      </div>

      {error && (
        <div className="toast error">
          <div className="toast-content">
            <Icon.XCircle />
            <span>{error}</span>
          </div>
          <button className="toast-close" onClick={() => {}}>×</button>
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
        <CustomerProfileSidebar />
        
        <div className="main-content">
          <div className="content-tabs">
            <button className="tab active">
              <Icon.User /> Profile Details
            </button>
          </div>
          
          <div className="content-panel">
            <CustomerSupplierProfileForm
              formData={formData}
              onFormChange={handleFormChange}
              onSave={handleSave}
              onNewProfile={handleNewProfile}
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

export default CustomerSupplierProfile;