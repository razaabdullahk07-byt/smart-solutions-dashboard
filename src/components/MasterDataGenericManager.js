import React, { useState, useEffect, useCallback, useContext } from 'react';
import "./ChartofAccount.css";
import { AuthContext } from "../AuthContext";

/* ---------------------------
 * API & Configuration
---------------------------- */
const API_CONFIG = {
  BASE_URL: 'http://192.168.100.113:8081/api',
  GET_URL: 'http://192.168.100.113:8081/api/get-table-data',
  INSERT_URL: 'http://192.168.100.113:8081/api/insert-table-data',
  UPDATE_URL: 'http://192.168.100.113:8081/api/update-table-data',
  DELETE_URL: 'http://192.168.100.113:8081/api/delete-table-data',
};

/* ---------------------------
 * Screen Configuration
---------------------------- */
const SCREEN_CONFIGS = {
  CUSTOMER_SUPPLIER: {
    tableName: 'comcustomer',
    primaryKeys: ['CustomerCode', 'offcode'],
    title: 'Customer & Supplier Management',
    subtitle: 'Manage customer and supplier profiles',
    icon: 'User',
    sidebarTitle: 'Customer/Supplier Profiles',
    requiredFields: ['CustomerCode', 'CustomerName']
  },
  TRANSPORTER: {
    tableName: 'comtransporter',
    primaryKeys: ['TransporterCode', 'offcode'],
    title: 'Transport Management',
    subtitle: 'Manage transporter profiles',
    icon: 'Truck',
    sidebarTitle: 'Transport Profiles',
    requiredFields: ['TransporterCode', 'TransporterName']
  },
  CITY: {
    tableName: 'cities',
    primaryKeys: ['CityID', 'CountryID', 'offcode'],
    title: 'City Management',
    subtitle: 'Manage cities by country',
    icon: 'MapPin',
    sidebarTitle: 'City Management',
    requiredFields: ['CityName', 'CountryID']
  },
  SALESMAN: {
    tableName: 'comSalesMan',
    primaryKeys: ['SaleManCode', 'offcode'],
    title: 'Salesman Management',
    subtitle: 'Manage salesman profiles',
    icon: 'User',
    sidebarTitle: 'Salesman Profiles',
    requiredFields: ['SaleManCode', 'SaleManName']
  },
  ORG_CHART: {
    tableName: 'comorgchart',
    primaryKeys: ['code', 'offcode'],
    title: 'Organization Chart',
    subtitle: 'Manage organizational positions and hierarchy',
    icon: 'Hierarchy',
    sidebarTitle: 'Organization Chart',
    requiredFields: ['code', 'name']
  }
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
  Truck: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
  Globe: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>,
  Hierarchy: (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2h6"/><path d="M14 6h2"/><path d="M14 10h6"/><path d="M4 18h2"/><path d="M4 14h6"/><path d="M4 22h6"/><rect x="8" y="2" width="8" height="6" rx="1"/><rect x="4" y="12" width="8" height="6" rx="1"/><path d="M22 18h-6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>,
};

/* ---------------------------
 * Initial State Templates
---------------------------- */
const getInitialDataTemplates = {
  CUSTOMER_SUPPLIER: (offcode = '1010') => ({
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
  }),

  TRANSPORTER: (offcode = '0101') => ({
    offcode: offcode,
    TransporterCode: '',
    TransporterName: '',
    isactive: 'true',
    contact: '',
    billaddress: '',
    zipcode: '',
    CountryID: '1',
    country: 'Pakistan',
    CityID: '1',
    city: 'LAHORE',
    phone1: '',
    mobile: '0',
    fax: '',
    email: '',
    paymentmethod: '1',
    TransporterglCode: '',
    defaultTypePerAmt: '01',
    defaultAmount: '0',
    createdby: '',
    createdate: new Date().toISOString().split('T')[0] + 'T00:00:00+05:00',
    editby: '',
    editdate: new Date().toISOString().split('T')[0] + 'T00:00:00+05:00'
  }),

  CITY: (offcode = '0101') => ({
    CountryID: '',
    CityID: '',
    RegionID: '1',
    CityName: '',
    IsActive: 'true',
    offcode: offcode
  }),

  SALESMAN: (offcode = '0101') => ({
    offcode: offcode,
    SaleManCode: '',
    SaleManName: '',
    ManagerCode: '',
    glCode: '',
    isactive: 'true',
    contact: '',
    CountryID: '1',
    country: 'Pakistan',
    CityID: '1',
    city: 'LAHORE',
    phone1: '',
    mobile: '0',
    email: '',
    creditisactive: 'false',
    creditlimit1: '0.00',
    creditlimit2: '0.00',
    creditlimit3: '0.00',
    creditdays: '0',
    isDiscount: 'false',
    discountper: '0.00',
    paymentmethod: '0',
    CurrentBalance: '0.00',
    alternativeCode: '',
    defaultTypePerAmt: '01',
    defaultCommisionAmount: '0',
    SaleManNameAR: ''
  }),

  ORG_CHART: (offcode = '0101') => ({
    code: '',
    name: '',
    parent: '00',
    nlevel: '1',
    isActive: 'true',
    offcode: offcode
  })
};

/* ---------------------------
 * Data Service
---------------------------- */
const useDataService = (screenType) => {
  const { credentials } = useAuth();
  const [data, setData] = useState([]);
  const [lookupData, setLookupData] = useState({
    saleMen: [],
    countries: [],
    cities: [],
    glAccounts: [],
    branchData: null,
    salesmen: []
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
      const config = SCREEN_CONFIGS[screenType];

      // Base data fetch
      const baseData = await fetchTableData(config.tableName);
      const filteredData = baseData.filter(item =>
        normalizeValue(item.offcode) === currentOffcode
      );

      // Lookup data based on screen type
      let lookups = {
        saleMen: [],
        countries: [],
        cities: [],
        glAccounts: [],
        branchData: null,
        salesmen: []
      };
      
      // Common lookups for most screens
      if (['CUSTOMER_SUPPLIER', 'TRANSPORTER', 'SALESMAN', 'CITY'].includes(screenType)) {
        const [countries, cities, accounts, branch] = await Promise.all([
          fetchTableData('Country'),
          fetchTableData('cities'),
          fetchTableData('acChartOfAccount'),
          fetchTableData('comBranch')
        ]);

        lookups.countries = countries.map(c => ({ 
          id: normalizeValue(c.CountryID), 
          name: normalizeValue(c.CountryName) 
        }));
        
        lookups.cities = cities.map(c => ({ 
          id: normalizeValue(c.CityID), 
          name: normalizeValue(c.CityName), 
          countryId: normalizeValue(c.CountryID) 
        }));
        
        lookups.glAccounts = accounts
          .filter(acc => acc.code && acc.name && normalizeValue(acc.offcode) === currentOffcode)
          .map(acc => ({ 
            code: normalizeValue(acc.code), 
            name: normalizeValue(acc.name) 
          }));
        
        lookups.branchData = branch.find(b => normalizeValue(b.offcode) === currentOffcode);

        // Salesmen lookup for customer/supplier and salesman screens
        if (screenType === 'CUSTOMER_SUPPLIER' || screenType === 'SALESMAN') {
          const salesmen = await fetchTableData('comSalesMan');
          lookups.saleMen = salesmen
            .filter(s => normalizeValue(s.offcode) === currentOffcode)
            .map(s => ({ 
              code: normalizeValue(s.code), 
              name: normalizeValue(s.name) 
            }));
        }

        // Salesmen for manager dropdown
        if (screenType === 'SALESMAN') {
          lookups.salesmen = lookups.saleMen;
        }
      }

      // Special handling for city screen
      if (screenType === 'CITY') {
        const [cityCountries, cityData] = await Promise.all([
          fetchTableData('Country'),
          fetchTableData('cities')
        ]);
        lookups.countries = cityCountries
          .filter(c => normalizeValue(c.offcode) === currentOffcode)
          .map(c => ({
            CountryID: normalizeValue(c.CountryID),
            CountryName: normalizeValue(c.CountryName)
          }));
        lookups.cities = cityData.filter(c => normalizeValue(c.offcode) === currentOffcode);
      }

      setData(filteredData);
      setLookupData(lookups);

    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [credentials, screenType]);

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
 * Generic Form Component - Includes ALL Fields
---------------------------- */
const GenericForm = ({
  screenType,
  formData,
  onFormChange,
  onSave,
  onNewRecord,
  currentMode,
  isLoading,
  lookupData
}) => {
  const { credentials } = useAuth();
  const currentOffcode = credentials?.company?.offcode || '0101';
  const currentUser = credentials?.username || 'SYSTEM';
  const config = SCREEN_CONFIGS[screenType];
  const IconComponent = Icon[config.icon];

  const handleInput = (field, value) => onFormChange(field, value);
  const handleNumericInput = (field, value) => onFormChange(field, value.replace(/[^0-9.]/g, ''));
  const handleCheckbox = (field, e) => onFormChange(field, e.target.checked ? 'true' : 'false');

  const isNewMode = currentMode === 'new';
  const availableCities = lookupData.cities?.filter(c => c.countryId === formData.CountryID) || [];

  // Get control accounts from branch data
  const customerControlAccount = lookupData.branchData?.CustomerControlAccount || '';
  const supplierControlAccount = lookupData.branchData?.SupplierControlAccount || '';
  const transporterControlAccount = lookupData.branchData?.TransporterControlAccount || '';
  const salesmanControlAccount = lookupData.branchData?.SalesmanControlAccount || '';

  // Filter GL accounts based on control accounts
  const customerGLAccounts = lookupData.glAccounts?.filter(acc => 
    acc.code.startsWith(customerControlAccount) || customerControlAccount === ''
  ) || [];
  
  const supplierGLAccounts = lookupData.glAccounts?.filter(acc => 
    acc.code.startsWith(supplierControlAccount) || supplierControlAccount === ''
  ) || [];

  const transporterGLAccounts = lookupData.glAccounts?.filter(acc =>
    acc.code.startsWith(transporterControlAccount) || transporterControlAccount === ''
  ) || [];

  const salesmanGLAccounts = lookupData.glAccounts?.filter(acc =>
    acc.code.startsWith(salesmanControlAccount) || salesmanControlAccount === ''
  ) || [];

  // Payment Method Options
  const paymentMethods = [
    { code: '1', name: 'Advance Party' },
    { code: '2', name: 'Payment Against Delivery' },
    { code: '3', name: 'Credit' }
  ];

  // Default Type Options
  const defaultTypeOptions = [
    { code: '01', name: 'Fixed Amount' },
    { code: '02', name: 'Percentage' }
  ];

  // Get display name and code based on screen type
  const getDisplayFields = () => {
    switch (screenType) {
      case 'CUSTOMER_SUPPLIER':
        return { name: formData.CustomerName, code: formData.CustomerCode, nameField: 'CustomerName', codeField: 'CustomerCode' };
      case 'TRANSPORTER':
        return { name: formData.TransporterName, code: formData.TransporterCode, nameField: 'TransporterName', codeField: 'TransporterCode' };
      case 'CITY':
        return { name: formData.CityName, code: formData.CityID, nameField: 'CityName', codeField: 'CityID' };
      case 'SALESMAN':
        return { name: formData.SaleManName, code: formData.SaleManCode, nameField: 'SaleManName', codeField: 'SaleManCode' };
      case 'ORG_CHART':
        return { name: formData.name, code: formData.code, nameField: 'name', codeField: 'code' };
      default:
        return { name: '', code: '', nameField: '', codeField: '' };
    }
  };

  const { name, code, nameField, codeField } = getDisplayFields();

  // Render specific form sections based on screen type
  const renderCustomerSupplierForm = () => (
    <>
      {/* General Information */}
      <CollapsibleSection title="General Information" icon={<Icon.User />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group required">
            <label>Customer Code *</label>
            <input 
              type="text" 
              value={formData.CustomerCode} 
              onChange={e => handleInput('CustomerCode', e.target.value)} 
              disabled={!isNewMode}
              placeholder="Enter unique code"
            />
          </div>
          <div className="form-group required">
            <label>Name (English) *</label>
            <input 
              type="text" 
              value={formData.CustomerName} 
              onChange={e => handleInput('CustomerName', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <div className="form-group">
            <label>Short Hand (SHD)</label>
            <input 
              type="text" 
              value={formData.SHD} 
              onChange={e => handleInput('SHD', e.target.value)}
              placeholder="Short code"
            />
          </div>
          <div className="form-group">
            <label>Name (Arabic)</label>
            <input 
              type="text" 
              value={formData.CustomerNameAR} 
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
            <select value={formData.CustomerSupplierType} onChange={e => handleInput('CustomerSupplierType', e.target.value)}>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="SUPPLIER">SUPPLIER</option>
              <option value="CUSTOMER/SUPPLIER">CUSTOMER/SUPPLIER</option>
            </select>
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={formData.isactive === 'true'} 
              onChange={e => handleCheckbox('isactive', e)} 
            />
            <label htmlFor="isActive">Profile is Active</label>
          </div>
          <div className="form-group">
            <label>Type</label>
            <input 
              type="text" 
              value={formData.type} 
              onChange={e => handleInput('type', e.target.value)}
              placeholder="Type code"
            />
          </div>
          <div className="form-group">
            <label>Sector Code</label>
            <input 
              type="text" 
              value={formData.SectorCode} 
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
              value={formData.phone1} 
              onChange={e => handleInput('phone1', e.target.value)}
              placeholder="Primary phone"
            />
          </div>
          <div className="form-group">
            <label>Mobile</label>
            <input 
              type="text" 
              value={formData.mobile} 
              onChange={e => handleInput('mobile', e.target.value)}
              placeholder="Mobile number"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={e => handleInput('email', e.target.value)}
              placeholder="Email address"
            />
          </div>
          <div className="form-group">
            <label>Fax</label>
            <input 
              type="text" 
              value={formData.fax} 
              onChange={e => handleInput('fax', e.target.value)}
              placeholder="Fax number"
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input 
              type="text" 
              value={formData.zipcode} 
              onChange={e => handleInput('zipcode', e.target.value)}
              placeholder="Postal code"
            />
          </div>
          <div className="form-group">
            <label>State</label>
            <input 
              type="text" 
              value={formData.State} 
              onChange={e => handleInput('State', e.target.value)}
              placeholder="State/Province"
            />
          </div>
          <div className="form-group span-3-col">
            <label>Billing Address (English)</label>
            <input 
              type="text" 
              value={formData.billaddress} 
              onChange={e => handleInput('billaddress', e.target.value)}
              placeholder="Full billing address"
            />
          </div>
          <div className="form-group span-3-col">
            <label>Billing Address (Arabic)</label>
            <input 
              type="text" 
              value={formData.billaddressAR} 
              onChange={e => handleInput('billaddressAR', e.target.value)}
              placeholder="Arabic billing address"
            />
          </div>
          <div className="form-group">
            <label>Country</label>
            <select value={formData.CountryID} onChange={e => handleInput('CountryID', e.target.value)}>
              <option value="">Select Country</option>
              {lookupData.countries?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>City</label>
            <select value={formData.CityID} onChange={e => handleInput('CityID', e.target.value)}>
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
              value={formData.ProductDetail} 
              onChange={e => handleInput('ProductDetail', e.target.value)}
              placeholder="Product information"
            />
          </div>
          <div className="form-group">
            <label>Product Details (Arabic)</label>
            <input 
              type="text" 
              value={formData.ProductDetailAR} 
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
              checked={formData.IsSalesTax === 'true'} 
              onChange={e => handleCheckbox('IsSalesTax', e)} 
            />
            <label htmlFor="isSalesTax">Subject to Sales Tax (VAT/GST)</label>
          </div>
          <div className="form-group">
            <label>Sales Tax No</label>
            <input 
              type="text" 
              value={formData.SalesTaxNo} 
              onChange={e => handleInput('SalesTaxNo', e.target.value)}
              placeholder="Tax registration number"
            />
          </div>
          <div className="form-group">
            <label>Sales Tax No (Arabic)</label>
            <input 
              type="text" 
              value={formData.SalesTaxNoAR} 
              onChange={e => handleInput('SalesTaxNoAR', e.target.value)}
              placeholder="Arabic tax number"
            />
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="isNTN" 
              checked={formData.isNTN === 'true'} 
              onChange={e => handleCheckbox('isNTN', e)} 
            />
            <label htmlFor="isNTN">Has NTN</label>
          </div>
          <div className="form-group">
            <label>NTN</label>
            <input 
              type="text" 
              value={formData.NTN} 
              onChange={e => handleInput('NTN', e.target.value)}
              placeholder="National tax number"
            />
          </div>
          <div className="form-group">
            <label>CNIC</label>
            <input 
              type="text" 
              value={formData.CNIC} 
              onChange={e => handleInput('CNIC', e.target.value)}
              placeholder="National ID number"
            />
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="isTaxableInvoice" 
              checked={formData.isTaxableInvoice === 'true'} 
              onChange={e => handleCheckbox('isTaxableInvoice', e)} 
            />
            <label htmlFor="isTaxableInvoice">Taxable Invoice</label>
          </div>
          <div className="form-group">
            <label>Rate Type</label>
            <select value={formData.RateType} onChange={e => handleInput('RateType', e.target.value)}>
              <option value="1">Standard Rate</option>
              <option value="2">Zero Rate</option>
              <option value="3">Exempt</option>
            </select>
          </div>
          <div className="form-group">
            <label>Seller ID Type</label>
            <input 
              type="text" 
              value={formData.sellersidtype} 
              onChange={e => handleInput('sellersidtype', e.target.value)}
              placeholder="Seller identification type"
            />
          </div>
          <div className="form-group">
            <label>Seller ID</label>
            <input 
              type="text" 
              value={formData.sellersid} 
              onChange={e => handleInput('sellersid', e.target.value)}
              placeholder="Seller identification"
            />
          </div>
          <div className="form-group">
            <label>Scenario ID</label>
            <input 
              type="text" 
              value={formData.scenarioId} 
              onChange={e => handleInput('scenarioId', e.target.value)}
              placeholder="Scenario identifier"
            />
          </div>
          {/* Additional tax fields */}
          <div className="form-group">
            <label>ST1</label>
            <input type="text" value={formData.ST1} onChange={e => handleInput('ST1', e.target.value)} />
          </div>
          <div className="form-group">
            <label>ST2</label>
            <input type="text" value={formData.ST2} onChange={e => handleInput('ST2', e.target.value)} />
          </div>
          <div className="form-group">
            <label>ST3</label>
            <input type="text" value={formData.ST3} onChange={e => handleInput('ST3', e.target.value)} />
          </div>
          <div className="form-group">
            <label>ST4</label>
            <input type="text" value={formData.ST4} onChange={e => handleInput('ST4', e.target.value)} />
          </div>
          <div className="form-group">
            <label>ST5</label>
            <input type="text" value={formData.ST5} onChange={e => handleInput('ST5', e.target.value)} />
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
              checked={formData.isCustomer === 'true'} 
              onChange={e => handleCheckbox('isCustomer', e)} 
            />
            <label htmlFor="isCustomer">Is a Customer</label>
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="custCreditActive" 
              checked={formData.Customercreditisactive === 'true'} 
              onChange={e => handleCheckbox('Customercreditisactive', e)} 
              disabled={formData.isCustomer !== 'true'}
            />
            <label htmlFor="custCreditActive">Credit Active</label>
          </div>
          <div className="form-group">
            <label>Credit Days</label>
            <input 
              type="number" 
              value={formData.Customercreditdays} 
              onChange={e => handleNumericInput('Customercreditdays', e.target.value)} 
              disabled={formData.isCustomer !== 'true'}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Credit Limit</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.CustomerCreditLimit} 
              onChange={e => handleNumericInput('CustomerCreditLimit', e.target.value)} 
              disabled={formData.isCustomer !== 'true'}
              placeholder="0.00"
            />
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="custDiscount" 
              checked={formData.CustomerisDiscount === 'true'} 
              onChange={e => handleCheckbox('CustomerisDiscount', e)} 
              disabled={formData.isCustomer !== 'true'}
            />
            <label htmlFor="custDiscount">Discount Active</label>
          </div>
          <div className="form-group">
            <label>Discount %</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.Customerdiscountper} 
              onChange={e => handleNumericInput('Customerdiscountper', e.target.value)} 
              disabled={formData.isCustomer !== 'true'}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>GL Account Code *</label>
            <select 
              value={formData.CustomerglCode} 
              onChange={e => handleInput('CustomerglCode', e.target.value)} 
              disabled={formData.isCustomer !== 'true'}
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
              value={formData.SaleManCode} 
              onChange={e => handleInput('SaleManCode', e.target.value)} 
              disabled={formData.isCustomer !== 'true'}
            >
              <option value="">Select Salesman</option>
              {lookupData.saleMen.map(sm => (
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
              value={formData.CustomeralternativeCode} 
              onChange={e => handleInput('CustomeralternativeCode', e.target.value)}
              placeholder="Alternative customer code"
            />
          </div>
          <div className="form-group">
            <label>Party Customer Code</label>
            <input 
              type="text" 
              value={formData.PartyCustomerCode} 
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
              checked={formData.isSupplier === 'true'} 
              onChange={e => handleCheckbox('isSupplier', e)} 
            />
            <label htmlFor="isSupplier">Is a Supplier</label>
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="suppCreditActive" 
              checked={formData.Supplierrcreditisactive === 'true'} 
              onChange={e => handleCheckbox('Supplierrcreditisactive', e)} 
              disabled={formData.isSupplier !== 'true'}
            />
            <label htmlFor="suppCreditActive">Credit Active</label>
          </div>
          <div className="form-group">
            <label>Credit Days</label>
            <input 
              type="number" 
              value={formData.Suppliercreditdays} 
              onChange={e => handleNumericInput('Suppliercreditdays', e.target.value)} 
              disabled={formData.isSupplier !== 'true'}
              placeholder="0"
            />
          </div>
          <div className="form-group">
            <label>Credit Limit</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.SupplierCreditLimit} 
              onChange={e => handleNumericInput('SupplierCreditLimit', e.target.value)} 
              disabled={formData.isSupplier !== 'true'}
              placeholder="0.00"
            />
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="suppDiscount" 
              checked={formData.SupplierisDiscount === 'true'} 
              onChange={e => handleCheckbox('SupplierisDiscount', e)} 
              disabled={formData.isSupplier !== 'true'}
            />
            <label htmlFor="suppDiscount">Discount Active</label>
          </div>
          <div className="form-group">
            <label>Discount %</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.Supplierdiscountper} 
              onChange={e => handleNumericInput('Supplierdiscountper', e.target.value)} 
              disabled={formData.isSupplier !== 'true'}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>GL Account Code *</label>
            <select 
              value={formData.SupplierglCode} 
              onChange={e => handleInput('SupplierglCode', e.target.value)} 
              disabled={formData.isSupplier !== 'true'}
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
              value={formData.SupplieralternativeCode} 
              onChange={e => handleInput('SupplieralternativeCode', e.target.value)}
              placeholder="Alternative supplier code"
            />
          </div>
          <div className="form-group">
            <label>Party Vendor Code</label>
            <input 
              type="text" 
              value={formData.PartyVendorCode} 
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
              value={formData.PackageId} 
              onChange={e => handleInput('PackageId', e.target.value)}
              placeholder="Package identifier"
            />
          </div>
          <div className="form-group">
            <label>Per Month Fee</label>
            <input 
              type="number" 
              value={formData.PerMonthFee} 
              onChange={e => handleNumericInput('PerMonthFee', e.target.value)}
              placeholder="Monthly fee"
            />
          </div>
          <div className="form-group">
            <label>Package Date</label>
            <input 
              type="datetime-local" 
              value={formData.PackageDate} 
              onChange={e => handleInput('PackageDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Total Amount</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.PackageTotalAmount} 
              onChange={e => handleNumericInput('PackageTotalAmount', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Down Amount</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.PackageDownAmount} 
              onChange={e => handleNumericInput('PackageDownAmount', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Balance Amount</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.PackageBalanceAmount} 
              onChange={e => handleNumericInput('PackageBalanceAmount', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>No. of Installments</label>
            <input 
              type="number" 
              value={formData.PackageNoofInstallment} 
              onChange={e => handleNumericInput('PackageNoofInstallment', e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="isAcCreate" 
              checked={formData.isAcCreate === 'true'} 
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
              value={formData.buytypeId} 
              onChange={e => handleInput('buytypeId', e.target.value)}
              placeholder="TIN, CRN, etc."
            />
          </div>
          <div className="form-group">
            <label>Street Name</label>
            <input 
              type="text" 
              value={formData.buystreetname} 
              onChange={e => handleInput('buystreetname', e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="form-group">
            <label>Building Name</label>
            <input 
              type="text" 
              value={formData.buybuildingname} 
              onChange={e => handleInput('buybuildingname', e.target.value)}
              placeholder="Building name"
            />
          </div>
          <div className="form-group">
            <label>Building Number</label>
            <input 
              type="text" 
              value={formData.buybuildno} 
              onChange={e => handleInput('buybuildno', e.target.value)}
              placeholder="Building number"
            />
          </div>
          <div className="form-group">
            <label>Additional Building No</label>
            <input 
              type="text" 
              value={formData.buyadbuildno} 
              onChange={e => handleInput('buyadbuildno', e.target.value)}
              placeholder="Additional building number"
            />
          </div>
          <div className="form-group">
            <label>Plot ID</label>
            <input 
              type="text" 
              value={formData.buyplotid} 
              onChange={e => handleInput('buyplotid', e.target.value)}
              placeholder="Plot identifier"
            />
          </div>
          <div className="form-group">
            <label>Postal Zone</label>
            <input 
              type="text" 
              value={formData.buypostalzone} 
              onChange={e => handleInput('buypostalzone', e.target.value)}
              placeholder="Postal code zone"
            />
          </div>
          <div className="form-group">
            <label>Sub City/Sub Name</label>
            <input 
              type="text" 
              value={formData.buysubcitysubname} 
              onChange={e => handleInput('buysubcitysubname', e.target.value)}
              placeholder="Sub-city name"
            />
          </div>
          <div className="form-group">
            <label>Country Sub-Entity</label>
            <input 
              type="text" 
              value={formData.buycountrySubentity} 
              onChange={e => handleInput('buycountrySubentity', e.target.value)}
              placeholder="Region/Province"
            />
          </div>
          <div className="form-group">
            <label>Contract Amount</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.buyContractAmount} 
              onChange={e => handleNumericInput('buyContractAmount', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderTransporterForm = () => (
    <>
      {/* General Information */}
      <CollapsibleSection title="General Information" icon={<Icon.Truck />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group required">
            <label>Transporter Code *</label>
            <input
              type="text"
              value={formData.TransporterCode}
              onChange={e => handleInput('TransporterCode', e.target.value)}
              disabled
              placeholder="Auto-generated"
              className="mono"
            />
            {isNewMode && (
              <div className="hint">
                Code will be auto-generated as 0000000001, 0000000002, etc.
              </div>
            )}
          </div>

          <div className="form-group required">
            <label>Transporter Name *</label>
            <input
              type="text"
              value={formData.TransporterName}
              onChange={e => handleInput('TransporterName', e.target.value)}
              placeholder="Enter transporter name"
            />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              value={formData.contact}
              onChange={e => handleInput('contact', e.target.value)}
              placeholder="Contact person name"
            />
          </div>
          <div className="form-group">
            <label>Office Code</label>
            <input type="text" value={currentOffcode} disabled />
          </div>
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isactive === 'true'}
              onChange={e => handleCheckbox('isactive', e)}
            />
            <label htmlFor="isActive">Transporter is Active</label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Contact & Address */}
      <CollapsibleSection title="Contact & Address" icon={<Icon.MapPin />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={formData.phone1}
              onChange={e => handleInput('phone1', e.target.value)}
              placeholder="Primary phone"
            />
          </div>
          <div className="form-group">
            <label>Mobile</label>
            <input
              type="text"
              value={formData.mobile}
              onChange={e => handleInput('mobile', e.target.value)}
              placeholder="Mobile number"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleInput('email', e.target.value)}
              placeholder="Email address"
            />
          </div>
          <div className="form-group">
            <label>Fax</label>
            <input
              type="text"
              value={formData.fax}
              onChange={e => handleInput('fax', e.target.value)}
              placeholder="Fax number"
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              value={formData.zipcode}
              onChange={e => handleInput('zipcode', e.target.value)}
              placeholder="Postal code"
            />
          </div>
          <div className="form-group span-3-col">
            <label>Address</label>
            <input
              type="text"
              value={formData.billaddress}
              onChange={e => handleInput('billaddress', e.target.value)}
              placeholder="Full address"
            />
          </div>
          <div className="form-group">
            <label>Country</label>
            <select value={formData.CountryID} onChange={e => handleInput('CountryID', e.target.value)}>
              <option value="">Select Country</option>
              {lookupData.countries?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>City</label>
            <select value={formData.CityID} onChange={e => handleInput('CityID', e.target.value)}>
              <option value="">Select City</option>
              {availableCities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Financial Settings */}
      <CollapsibleSection title="Financial Settings" icon={<Icon.DollarSign />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group">
            <label>Payment Method</label>
            <select value={formData.paymentmethod} onChange={e => handleInput('paymentmethod', e.target.value)}>
              <option value="">Select Payment Method</option>
              {paymentMethods.map(pm => (
                <option key={pm.code} value={pm.code}>{pm.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Default Type</label>
            <select value={formData.defaultTypePerAmt} onChange={e => handleInput('defaultTypePerAmt', e.target.value)}>
              <option value="">Select Default Type</option>
              {defaultTypeOptions.map(dt => (
                <option key={dt.code} value={dt.code}>{dt.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Default Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.defaultAmount}
              onChange={e => handleNumericInput('defaultAmount', e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>GL Account Code</label>
            <select
              value={formData.TransporterglCode}
              onChange={e => handleInput('TransporterglCode', e.target.value)}
            >
              <option value="">Select GL Account</option>
              {transporterGLAccounts.map(acc => (
                <option key={acc.code} value={acc.code}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
            {transporterControlAccount && (
              <div className="field-info">
                Control Account: {transporterControlAccount}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderCityForm = () => (
    <>
      <div className="form-section expanded">
        <div className="section-header">
          <div className="section-title">
            <Icon.MapPin />
            <h3>City Information</h3>
          </div>
        </div>
        <div className="section-content">
          <div className="form-grid grid-3-col">
            <div className="form-group required">
              <label>Country *</label>
              <select
                value={formData.CountryID}
                onChange={e => handleInput('CountryID', e.target.value)}
              >
                <option value="">Select Country</option>
                {lookupData.countries?.map(country => (
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
                value={formData.CityName}
                onChange={e => handleInput('CityName', e.target.value)}
                placeholder="Enter city name"
              />
            </div>

            <div className="form-group">
              <label>City ID</label>
              <input
                type="text"
                value={formData.CityID}
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
                value={formData.RegionID}
                onChange={e => handleInput('RegionID', e.target.value)}
                placeholder="Region ID (e.g., 1)"
              />
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="IsActive"
                checked={formData.IsActive === 'true'}
                onChange={e => handleCheckbox('IsActive', e)}
              />
              <label htmlFor="IsActive">City is Active</label>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSalesmanForm = () => (
    <>
      {/* General Information */}
      <CollapsibleSection title="General Information" icon={<Icon.User />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group required">
            <label>Salesman Code *</label>
            <input
              type="text"
              value={formData.SaleManCode}
              onChange={e => handleInput('SaleManCode', e.target.value)}
              disabled
              placeholder="Auto-generated"
              className="mono"
            />
            {isNewMode && (
              <div className="hint">
                Code will be auto-generated as 00001, 00002, etc.
              </div>
            )}
          </div>

          <div className="form-group required">
            <label>Salesman Name *</label>
            <input
              type="text"
              value={formData.SaleManName}
              onChange={e => handleInput('SaleManName', e.target.value)}
              placeholder="Enter salesman name"
            />
          </div>

          <div className="form-group">
            <label>Salesman Name (Arabic)</label>
            <input
              type="text"
              value={formData.SaleManNameAR}
              onChange={e => handleInput('SaleManNameAR', e.target.value)}
              placeholder="Arabic name"
            />
          </div>

          <div className="form-group">
            <label>Manager Code</label>
            <select
              value={formData.ManagerCode}
              onChange={e => handleInput('ManagerCode', e.target.value)}
            >
              <option value="">Select Manager</option>
              {lookupData.salesmen
                ?.filter(s => currentMode !== 'edit' || s.code !== formData.SaleManCode)
                .map(sm => (
                   <option key={sm.code} value={sm.code}>
                    {sm.code} - {sm.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label>Office Code</label>
            <input type="text" value={currentOffcode} disabled />
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isactive === 'true'}
              onChange={e => handleCheckbox('isactive', e)}
            />
            <label htmlFor="isActive">Salesman is Active</label>
          </div>
        </div>
      </CollapsibleSection>

      {/* Contact Information */}
      <CollapsibleSection title="Contact Information" icon={<Icon.MapPin />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              value={formData.contact}
              onChange={e => handleInput('contact', e.target.value)}
              placeholder="Contact person name"
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={formData.phone1}
              onChange={e => handleInput('phone1', e.target.value)}
              placeholder="Primary phone"
            />
          </div>

          <div className="form-group">
            <label>Mobile</label>
            <input
              type="text"
              value={formData.mobile}
              onChange={e => handleInput('mobile', e.target.value)}
              placeholder="Mobile number"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => handleInput('email', e.target.value)}
              placeholder="Email address"
            />
          </div>

          <div className="form-group">
            <label>Country</label>
            <select value={formData.CountryID} onChange={e => handleInput('CountryID', e.target.value)}>
              <option value="">Select Country</option>
              {lookupData.countries?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>City</label>
            <select value={formData.CityID} onChange={e => handleInput('CityID', e.target.value)}>
              <option value="">Select City</option>
              {availableCities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* Financial Settings */}
      <CollapsibleSection title="Financial Settings" icon={<Icon.DollarSign />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group">
            <label>GL Account Code</label>
            <select
              value={formData.glCode}
              onChange={e => handleInput('glCode', e.target.value)}
            >
              <option value="">Select GL Account</option>
              {salesmanGLAccounts.map(acc => (
                <option key={acc.code} value={acc.code}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
            {salesmanControlAccount && (
              <div className="field-info">
                Control Account: {salesmanControlAccount}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <select value={formData.paymentmethod} onChange={e => handleInput('paymentmethod', e.target.value)}>
              <option value="">Select Payment Method</option>
              <option value="0">Not Specified</option>
              <option value="1">Cash</option>
              <option value="2">Credit</option>
              <option value="3">Bank Transfer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Current Balance</label>
            <input
              type="number"
              step="0.01"
              value={formData.CurrentBalance}
              onChange={e => handleNumericInput('CurrentBalance', e.target.value)}
              placeholder="0.00"
              disabled
            />
          </div>

          <div className="form-group">
            <label>Alternative Code</label>
            <input
              type="text"
              value={formData.alternativeCode}
              onChange={e => handleInput('alternativeCode', e.target.value)}
              placeholder="Alternative code"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Credit Settings */}
      <CollapsibleSection title="Credit Settings" icon={<Icon.CreditCard />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="creditisactive"
              checked={formData.creditisactive === 'true'}
              onChange={e => handleCheckbox('creditisactive', e)}
            />
            <label htmlFor="creditisactive">Credit Active</label>
          </div>

          <div className="form-group">
            <label>Credit Limit 1</label>
            <input
              type="number"
              step="0.01"
              value={formData.creditlimit1}
              onChange={e => handleNumericInput('creditlimit1', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Credit Limit 2</label>
            <input
              type="number"
              step="0.01"
              value={formData.creditlimit2}
              onChange={e => handleNumericInput('creditlimit2', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Credit Limit 3</label>
            <input
              type="number"
              step="0.01"
              value={formData.creditlimit3}
              onChange={e => handleNumericInput('creditlimit3', e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label>Credit Days</label>
            <input
              type="number"
              value={formData.creditdays}
              onChange={e => handleNumericInput('creditdays', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Commission & Discount Settings */}
      <CollapsibleSection title="Commission & Discount" icon={<Icon.DollarSign />} defaultExpanded={true}>
        <div className="form-grid grid-3-col">
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isDiscount"
              checked={formData.isDiscount === 'true'}
              onChange={e => handleCheckbox('isDiscount', e)}
            />
            <label htmlFor="isDiscount">Discount Active</label>
          </div>

          <div className="form-group">
            <label>Discount Percentage</label>
            <input
              type="number"
              step="0.01"
              value={formData.discountper}
              onChange={e => handleNumericInput('discountper', e.target.value)}
              placeholder = "0.00"
            />
          </div>

          <div className="form-group">
            <label>Default Commission Type</label>
            <select value={formData.defaultTypePerAmt} onChange={e => handleInput('defaultTypePerAmt', e.target.value)}>
              <option value="">Select Commission Type</option>
              {defaultTypeOptions.map(dt => (
                <option key={dt.code} value={dt.code}>{dt.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Default Commission Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.defaultCommisionAmount}
              onChange={e => handleNumericInput('defaultCommisionAmount', e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>
      </CollapsibleSection>
    </>
  );

  const renderOrgChartForm = () => (
    <>
      <div className="form-section expanded">
        <div className="section-header">
          <div className="section-title">
            <Icon.Hierarchy />
            <h3>Position Information</h3>
          </div>
        </div>
        <div className="section-content">
          <div className="form-grid grid-3-col">
            <div className="form-group required">
              <label>Position Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => handleInput('code', e.target.value)}
                placeholder="e.g., 001, 002"
                className="mono"
              />
              {isNewMode && (
                <div className="hint">
                  Enter a unique 3-digit code (001, 002, etc.)
                </div>
              )}
            </div>

            <div className="form-group required">
              <label>Position Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleInput('name', e.target.value)}
                placeholder="e.g., Manager, Supervisor"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive === 'true'}
                onChange={e => handleCheckbox('isActive', e)}
              />
              <label htmlFor="isActive">Position is Active</label>
            </div>
            
            <div className="form-group">
              <label>Parent Position</label>
              <input
                type="text"
                value="Root (No Parent)"
                disabled
              />
              <div className="hint">
                Parent is fixed at '00' for all positions.
              </div>
            </div>

            <div className="form-group">
              <label>Organization Level</label>
              <input
                type="text"
                value="Level 1 (Top Level)"
                disabled
              />
              <div className="hint">
                Level is fixed at '1' for all positions.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchy Preview */}
      <div className="form-section expanded">
        <div className="section-header">
          <div className="section-title">
            <Icon.Hierarchy />
            <h3>Hierarchy Information Preview</h3>
          </div>
        </div>
        <div className="section-content">
          <div className="hierarchy-preview">
            <div className="hierarchy-item">
              <div className="hierarchy-level">Level {formData.nlevel}</div>
              <div className="hierarchy-details">
                <strong>{formData.code} - {formData.name || 'New Position'}</strong>
                <div className="hierarchy-parent">
                  Reports to: Root ({formData.parent})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Main render function that selects the appropriate form based on screen type
  const renderFormContent = () => {
    switch (screenType) {
      case 'CUSTOMER_SUPPLIER':
        return renderCustomerSupplierForm();
      case 'TRANSPORTER':
        return renderTransporterForm();
      case 'CITY':
        return renderCityForm();
      case 'SALESMAN':
        return renderSalesmanForm();
      case 'ORG_CHART':
        return renderOrgChartForm();
      default:
        return <div>Unknown screen type</div>;
    }
  };

  return (
    <section className="detail-panel">
      <div className="detail-header">
        <div className="header-content">
          <h1>{isNewMode ? `Create New ${config.title.split(' ')[0]}` : `${name || 'Record'} Details`}</h1>
          <div className="header-subtitle">
            <span className="mode-badge">{isNewMode ? 'NEW' : 'EDIT'}</span>
            <span className="muted">• {code || 'No Code'}</span>
            <span className="muted">• Office: {currentOffcode}</span>
            {('isactive' in formData && formData.isactive !== 'true') && <span className="inactive-badge">INACTIVE</span>}
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-outline"
            onClick={onNewRecord}
          >
            <Icon.Plus /> New {config.title.split(' ')[0]}
          </button>
          <button
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            onClick={onSave}
            disabled={isLoading || !formData[config.requiredFields[0]] || !formData[config.requiredFields[1]]}
          >
            {isLoading ? <Icon.Loader className="spin" /> : <Icon.Save />}
            {isLoading ? 'Saving...' : `Save ${config.title.split(' ')[0]}`}
          </button>
        </div>
      </div>

      <div className="detail-body">
        {renderFormContent()}
      </div>
    </section>
  );
};

/* ---------------------------
 * Generic Management Screen
---------------------------- */
const GenericManagementScreen = ({ screenType }) => {
  const { credentials } = useAuth();
  const currentOffcode = credentials?.company?.offcode || '0101';
  const currentUser = credentials?.username || 'SYSTEM';
  const config = SCREEN_CONFIGS[screenType];

  const { data: records, lookupData, isLoading: isDataLoading, error, refetch } = useDataService(screenType);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState(() => getInitialDataTemplates[screenType](currentOffcode));
  const [currentMode, setCurrentMode] = useState('new');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const IconComponent = Icon[config.icon];

  // Code generation functions
  const generateCode = useCallback(() => {
    switch (screenType) {
      case 'TRANSPORTER':
        if (records.length === 0) return '0000000001';
        const transporterCodes = records.map(t => parseInt(normalizeValue(t.TransporterCode))).filter(code => !isNaN(code) && code > 0);
        const maxTransporterCode = transporterCodes.length > 0 ? Math.max(...transporterCodes) : 0;
        return (maxTransporterCode + 1).toString().padStart(10, '0');
      
      case 'SALESMAN':
        if (records.length === 0) return '00001';
        const salesmanCodes = records.map(s => parseInt(normalizeValue(s.SaleManCode))).filter(code => !isNaN(code) && code > 0);
        const maxSalesmanCode = salesmanCodes.length > 0 ? Math.max(...salesmanCodes) : 0;
        return (maxSalesmanCode + 1).toString().padStart(5, '0');
      
      case 'CITY':
        if (!formData.CountryID) return '';
        const countryCities = records.filter(c => c.CountryID === formData.CountryID);
        const maxCityId = countryCities.reduce((max, c) => {
          const id = parseInt(normalizeValue(c.CityID), 10);
          return (id > max) ? id : max;
        }, 0);
        return (maxCityId + 1).toString();
      
      case 'ORG_CHART':
        if (records.length === 0) return '001';
        const orgCodes = records.map(p => parseInt(normalizeValue(p.code))).filter(code => !isNaN(code) && code > 0);
        const maxOrgCode = orgCodes.length > 0 ? Math.max(...orgCodes) : 0;
        return (maxOrgCode + 1).toString().padStart(3, '0');
      
      default:
        return '';
    }
  }, [records, screenType, formData.CountryID]);

  // Initialize form data for new record
  useEffect(() => {
    if (currentMode === 'new') {
      const newCode = generateCode();
      const updatedFormData = { ...getInitialDataTemplates[screenType](currentOffcode) };

      // Set generated code
      switch (screenType) {
        case 'TRANSPORTER':
          updatedFormData.TransporterCode = newCode;
          break;
        case 'SALESMAN':
          updatedFormData.SaleManCode = newCode;
          break;
        case 'CITY':
          updatedFormData.CityID = newCode;
          break;
        case 'ORG_CHART':
          updatedFormData.code = newCode;
          break;
        default:
          break;
      }

      // Set default values for lookup fields
      if (lookupData.countries && lookupData.countries.length > 0) {
        const defaultCountryId = lookupData.countries[0]?.CountryID || lookupData.countries[0]?.id || '1';
        updatedFormData.CountryID = defaultCountryId;

        if (lookupData.cities) {
          const defaultCityId = lookupData.cities.find(c => c.countryId === defaultCountryId)?.id || '1';
          if (screenType !== 'CITY') { // Don't override CityID for city screen as it's auto-generated
            updatedFormData.CityID = defaultCityId;
          }
        }
      }

      // Set user fields
      updatedFormData.createdby = currentUser;
      updatedFormData.editby = currentUser;

      setFormData(updatedFormData);
      
      if (newCode) {
        setMessage(`Ready to create new record. Auto-generated code: ${newCode}`);
      }
    }
  }, [currentMode, currentOffcode, screenType, generateCode, lookupData, currentUser]);

  // Load selected record data into form
  useEffect(() => {
    if (selectedRecord && currentMode === 'edit') {
      const normalizedRecord = Object.keys(getInitialDataTemplates[screenType]()).reduce((acc, key) => {
        acc[key] = normalizeValue(selectedRecord[key] || getInitialDataTemplates[screenType]()[key]);
        return acc;
      }, {});
      setFormData(normalizedRecord);
    }
  }, [selectedRecord, currentMode, screenType]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectRecord = (record) => {
    setSelectedRecord(record);
    setCurrentMode('edit');
    
    // Set appropriate message based on screen type
    const displayName = getDisplayName(record);
    setMessage(`Editing: ${displayName}`);
  };

  const handleNewRecord = () => {
    setSelectedRecord(null);
    setCurrentMode('new');
    setMessage(`Creating new ${config.title.split(' ')[0].toLowerCase()}...`);
  };

  const getDisplayName = (record) => {
    switch (screenType) {
      case 'CUSTOMER_SUPPLIER': return normalizeValue(record.CustomerName);
      case 'TRANSPORTER': return normalizeValue(record.TransporterName);
      case 'CITY': return normalizeValue(record.CityName);
      case 'SALESMAN': return normalizeValue(record.SaleManName);
      case 'ORG_CHART': return normalizeValue(record.name);
      default: return 'Record';
    }
  };

  const getDisplayCode = (record) => {
    switch (screenType) {
      case 'CUSTOMER_SUPPLIER': return normalizeValue(record.CustomerCode);
      case 'TRANSPORTER': return normalizeValue(record.TransporterCode);
      case 'CITY': return normalizeValue(record.CityID);
      case 'SALESMAN': return normalizeValue(record.SaleManCode);
      case 'ORG_CHART': return normalizeValue(record.code);
      default: return '';
    }
  };

  const getRecordKey = (record) => {
    return config.primaryKeys.map(key => record[key]).join('-');
  };

  const handleSave = async () => {
    // Validation
    const [field1, field2] = config.requiredFields;
    if (!formData[field1]?.trim()) {
      setMessage(`❌ ${field1.replace(/([A-Z])/g, ' $1')} is required!`);
      return;
    }

    if (!formData[field2]?.trim()) {
      setMessage(`❌ ${field2.replace(/([A-Z])/g, ' $1')} is required!`);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const url = currentMode === 'new' ? API_CONFIG.INSERT_URL : API_CONFIG.UPDATE_URL;

    const payload = {
      tableName: config.tableName,
      data: {
        ...formData,
        offcode: currentOffcode,
        editby: currentUser,
        editdate: new Date().toISOString(),
        ...(currentMode === 'new' && {
          createdby: currentUser,
          createdate: new Date().toISOString()
        })
      }
    };

    if (currentMode === 'edit') {
      payload.where = config.primaryKeys.reduce((acc, key) => {
        acc[key] = formData[key];
        return acc;
      }, {});
    }

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const result = await resp.json();

      if (result.success) {
        setMessage('✅ Record saved successfully!');
        await refetch();

        if (currentMode === 'new') {
          const newRecord = records.find(r => 
            config.primaryKeys.every(key => r[key] === formData[key])
          ) || formData;
          setSelectedRecord(newRecord);
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
  const ManagementSidebar = () => {
    const filteredRecords = records.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      const name = getDisplayName(record).toLowerCase();
      const code = getDisplayCode(record).toLowerCase();
      return name.includes(searchLower) || code.includes(searchLower);
    });

    // Special filtering for cities based on selected country in form
    const finalRecords = screenType === 'CITY' && formData.CountryID 
      ? filteredRecords.filter(city => city.CountryID === formData.CountryID)
      : filteredRecords;

    return (
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="sidebar-title">
            <IconComponent className="big" />
            <div>
              <div className="h3">{config.sidebarTitle}</div>
              <div className="muted small">{records.length} records • Office: {currentOffcode}</div>
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
          {isDataLoading && records.length === 0 ? (
            <div className="loading-message">
              <Icon.Loader className="spin" /> Loading Records...
            </div>
          ) : finalRecords.length > 0 ? (
            <div className="profile-list">
              {finalRecords.map(record => (
                <div
                  key={getRecordKey(record)}
                  className={`profile-item ${
                    selectedRecord && config.primaryKeys.every(key => record[key] === selectedRecord[key]) && currentMode === 'edit' ? 'selected' : ''
                  }`}
                  onClick={() => handleSelectRecord(record)}
                >
                  <div className="profile-main">
                    <div className="code-name">
                      <span className="code">{getDisplayCode(record)}</span>
                      <span className="name">{getDisplayName(record)}</span>
                    </div>
                    <div className="profile-meta">
                      {(record.isactive === 'true' || record.IsActive === 'true' || record.isActive === 'true') ? (
                        <span className="status active">Active</span>
                      ) : (
                        <span className="status inactive">Inactive</span>
                      )}
                      {screenType === 'CUSTOMER_SUPPLIER' && record.CustomerSupplierType && (
                        <span className={`type-badge ${normalizeValue(record.CustomerSupplierType).toLowerCase().replace('/', '-')}`}>
                          {normalizeValue(record.CustomerSupplierType)}
                        </span>
                      )}
                      {screenType === 'SALESMAN' && record.ManagerCode && (
                        <span className="manager-badge">Manager: {record.ManagerCode}</span>
                      )}
                    </div>
                  </div>
                  {record.phone1 && (
                    <div className="profile-phone">{normalizeValue(record.phone1)}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <IconComponent className="big-muted" />
              <div className="muted">No records found</div>
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
          <IconComponent className="brand-icon" />
          <div>
            <h1>{config.title}</h1>
            <div className="muted">{config.subtitle}</div>
          </div>
        </div>
        <div className="header-user">
          <IconComponent className="icon-sm" />
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
        <ManagementSidebar />
        
        <div className="main-content">
          <div className="content-tabs">
            <button className="tab active">
              <IconComponent /> Details
            </button>
          </div>
          
          <div className="content-panel">
            <GenericForm
              screenType={screenType}
              formData={formData}
              onFormChange={handleFormChange}
              onSave={handleSave}
              onNewRecord={handleNewRecord}
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

export default GenericManagementScreen;