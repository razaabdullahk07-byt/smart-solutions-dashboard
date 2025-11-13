import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import LogoutConfirm from "../components/LogoutConfirm";
import HRMSDepartment from "../components/HRMSDepartment";
import HRMSDesignation from "../components/HRMSDesignation";
import HRMSBank from "../components/HRMSBank";
import HRMSBenifit from "../components/HRMSBenifit";
import Department from "../components/Department";
import CashPaymentVoucher from "../components/CashPaymentVoucher";
import HRMSEmployeeType from "../components/HRMSEmployeeType";
import HRMSAllowanceType from "../components/HRMSAllowanceType";
import HRMSDeductionType from "../components/HRMSDeductionType";
import ShiftAndShiftTiming from "../components/ShiftAndShiftTiming";
import comReason from "../components/comReason";
import country from "../components/Country";
import cities from "../components/Cities";
import comVehicleType from "../components/comVehicleType";
import comTypeofCharges from "../components/comTypeofCharges";
import HRMSLocation from "../components/HRMSLocation";
import comCurrency from "../components/comCurrency";
import comUOM from "../components/comUOM";
import comProcess from "../components/comProcess";
import comProjects from "../components/comProjects";
import HRMSLoanType from "../components/HRMSLoanType";
import comtblDashboard from "../components/comtblDashboard";
import lndFloor from "../components/lndFloor";
import lndPaymentType from "../components/lndPaymentType";
import lndPlotCatagory from "../components/lndPlotCatagory";
import lndRelation from "../components/lndRelation";
import IMFThickness from "../components/IMFThickness";
import IMFColor from "../components/IMFColor";
import IMFSize from "../components/IMFSize";
import acGroup from "../components/acGroup";
import lndFrequency from "../components/lndFrequency";
import HRMSEmployeeFile from "../components/HRMSEmployee";
import GoodsReceiptNote from "../components/GoodsReceiptNote";
import ChartofAccount from "../components/ChartofAccount";
import IMF from "../components/IMF";
import CustomerSupplierProfile from "../components/CustomerSupplierProfile";
import TransporterProfile from "../components/TransporterProfile";
import SalesManProfile from "../components/SalesManProfile";
import CityProfile from "../components/CityProfile";
import OrganizationalChart from "../components/OrganizationalChart";
import LabourProfile from "../components/LabourProfile";
import Vechiles from "../components/Vechiles";
import AttendanceMachines from "../components/AttendanceMachines";
import BOMCreation from "../components/BOMCreation";
import EInvoice from "../components/EInvioce";
import { FiX, FiMenu, FiChevronDown, FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import {
  FaHome, FaChartLine, FaMoneyBillWave, FaUsers, FaCog, FaFileInvoiceDollar,
  FaBalanceScale, FaCashRegister, FaBook, FaShieldAlt, FaUserCog,
  FaDollarSign, FaShoppingCart, FaWarehouse, FaCogs, FaDatabase,
  FaUserShield, FaBuilding, FaUserCircle, FaSignOutAlt
} from "react-icons/fa";

import "./Dashboard.css";

const menuIcons = {
  "Dashboard": <FaHome />,
  "Reports": <FaChartLine />,
  "Finance Management": <FaMoneyBillWave />,
  "User Management": <FaUsers />,
  "Settings": <FaCog />,
  "Invoices": <FaFileInvoiceDollar />,
  "Payments": <FaBalanceScale />,
  "Expenses": <FaCashRegister />,
  "Ledger": <FaBook />,
  "Security": <FaShieldAlt />,
  "User Roles": <FaUserCog />,
  "Department": <FaUsers />,
  "Setup Data": <FaCog />,
  "HRMSDepartment": <FaBook />,
  "HRMSDesignation": <FaBook />,
  "HRMSBank": <FaBook />,
  "HRMSBenifit": <FaBook />,
  "CashPaymentVoucher": <FaBook />,
  "HRMSEmployeeType": <FaBook />,
  "HRMSAllowanceType": <FaBook />,
  "HRMSDeductionType": <FaBook />,
  "ShiftAndShiftTiming": <FaBook />,
  "comCurrency": <FaBook />,
  "comReason": <FaBook />,
  "country": <FaBook />,
  "cities": <FaBook />,
  "HRMSLocation": <FaBook />,
  "comVehicleType": <FaBook />,
  "comTypeofCharges": <FaBook />,
  "comUOM": <FaBook />,
  "comProcess": <FaBook />,
  "comProjects": <FaBook />,
  "HRMSLoanType": <FaBook />,
  "comtblDashboard": <FaBook />,
  "lndFloor": <FaBook />,
  "lndPaymentType": <FaBook />,
  "lndPlotCatagory": <FaBook />,
  "lndRelation": <FaBook />,
  "IMFThickness": <FaBook />,
  "IMFColor": <FaBook />,
  "acGroup": <FaBook />,
  "IMFSize": <FaBook />,
  "lndFrequency": <FaBook />,
  "HRMSEmployeeFile": <FaBook />,
  "GoodsReceiptNote": <FaBook />,
  "ChartofAccount": <FaBook />,
  "IMF": <FaBook />,
  "CustomerSupplierProfile": <FaBook />,
  "TransporterProfile": <FaBook />,
  "SalesManProfile": <FaBook />,
  "CityProfile": <FaBook />,
  "OrganizationalChart": <FaBook />,
  "AttendanceMachines": <FaBook />,
  "BOMCreation": <FaBook />,
  "LabourProfile": <FaBook />,
  "Vechiles": <FaBook />,
  "E-Invoice": <FaFileInvoiceDollar />
};

function Dashboard() {
  const [data, setData] = useState({
    company: {},
    branches: [],
    menu: [],
    loading: true,
    error: null
  });
  const [selectedBranch, setSelectedBranch] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeMainMenu, setActiveMainMenu] = useState("");
  const [modalStack, setModalStack] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { credentials, logout: authLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const horizontalMenuRef = useRef(null);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  const handleOverlayClick = () => {
    setMobileMenuOpen(false);
  };

  // Effect hooks
  useEffect(() => {
    const handleBackButton = () => navigate("/login", { replace: true });
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackButton);
    return () => window.removeEventListener("popstate", handleBackButton);
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem("appData"));
        if (storedData) {
          setData({
            company: storedData.company,
            branches: storedData.branches,
            menu: storedData.menu,
            loading: false,
            error: null
          });
          if (storedData.branches.length) setSelectedBranch(storedData.branches[0].branch);
          return;
        }

        if (credentials?.username && credentials?.password) {
          const res = await fetch("http://192.168.100.113:8081/api/get-full-menu", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              userpassword: credentials.password,
              Menuid: "01",
              nooftables: "3"
            })
          });

          const result = await res.json();
          if (!res.ok || !result.success) throw new Error(result.error || "Failed to fetch data");

          const newData = {
            company: result.data.company,
            branches: result.data.branches,
            menu: result.data.menu,
            loading: false,
            error: null
          };
          localStorage.setItem("appData", JSON.stringify(newData));
          setData(newData);
          if (result.data.branches.length) setSelectedBranch(result.data.branches[0].branch);
        }
      } catch (err) {
        setData({
          company: {},
          branches: [],
          menu: [],
          loading: false,
          error: err.message
        });
      }
    };
    loadData();
  }, [credentials]);

  // Menu filtering
  const mainMenuItems = [
    { name: "Finance Management", icon: <FaDollarSign /> },
    { name: "Sale", icon: <FaChartLine /> },
    { name: "Purchase System", icon: <FaShoppingCart /> },
    { name: "Inventory", icon: <FaWarehouse /> },
    { name: "Production", icon: <FaCogs /> },
    { name: "MRP", icon: <FaBook /> },
    { name: "Setup Data", icon: <FaCog /> },
    { name: "Master Data", icon: <FaDatabase /> },
    { name: "Business Administration", icon: <FaUserShield /> },
    { name: "E-Invoice", icon: <FaFileInvoiceDollar /> }
  ].filter(item => {
    if (item.name === "E-Invoice") return true;
    const match = data.menu.find(menu =>
      menu.title.trim().toLowerCase() === item.name.trim().toLowerCase() &&
      menu.parentId === "00"
    );
    return !!match;
  });

  // Auth functions
  const showLogoutConfirmation = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => {
    localStorage.removeItem("appData");
    authLogout();
    navigate("/login", { replace: true });
  };
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  // Modal management
  const openHRMSDepartmentModal = () => {
    setModalStack([{
      type: "HRMSDepartment",
      props: {
        onClose: () => closeAllModals(),
        onDepartmentAction: openDepartmentModal
      }
    }]);
  };
  const openHRMSDesignationModal = () => {
    setModalStack([{
      type: "HRMSDesignation",
      props: {
        onClose: () => closeAllModals(),
        onDepartmentAction: openDepartmentModal
      }
    }]);
  };
  const openHRMSBankModal = () => {
    setModalStack([{
      type: "HRMSBank",
      props: {
        onClose: () => closeAllModals(),
        onDepartmentAction: openDepartmentModal
      }
    }]);
  };
  const openHRMSBenifitModal = () => {
    setModalStack([{
      type: "HRMSBenifit",
      props: {
        onClose: () => closeAllModals(),
        onDepartmentAction: openDepartmentModal
      }
    }]);
  };
  const openDepartmentModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "department",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openCashPaymentVoucherModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "CashPaymentVoucher",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };

  const openHRMSEmployeeTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "HRMSEmployeeType",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openHRMSAllowanceTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "HRMSAllowanceType",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openHRMSDeductionTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "HRMSDeductionType",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openShiftAndShiftTimingTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "ShiftAndShiftTiming",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomCurrencyTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comCurrency",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomReasonTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comReason",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencountryTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "country",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencitiesTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "cities",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomVehicleTypeTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comVehicleType",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomProcessTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comProcess",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomTypeofChargesTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comTypeofCharges",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openHRMSLocationTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "HRMSLocation",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomUOMTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comUOM",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomProjectsTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comProjects",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openHRMSLoanTypeTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "HRMSLoanType",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const opencomtblDashboardTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "comtblDashboard",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openlndFloorTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "lndFloor",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openlndPaymentTypeTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "lndPaymentType",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openlndPlotCatagoryTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "lndPlotCatagory",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openlndRelationTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "lndRelation",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openIMFColorTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "IMFColor",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openacGroupTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "acGroup",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openlndFrequencyTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "lndFrequency",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openHRMSEmployeeFileTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "HRMSEmployeeFile",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openIMFSizeTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "IMFSize",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openIMFThicknessTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "IMFThickness",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openGoodsReceiptNoteTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "GoodsReceiptNote",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openChartofAccountTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "ChartofAccount",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openCustomerSupplierProfileTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "CustomerSupplierProfile",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openIMFTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "IMF",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openTransporterProfileTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "TransporterProfile",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openSalesManProfileTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "SalesManProfile",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openCityProfileTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "CityProfile",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openOrganizationalChartTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "OrganizationalChart",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openLabourProfileTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "LabourProfile",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openVechilesTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "Vechiles",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openAttendanceMachinesTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "AttendanceMachines",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
   const openBOMCreationTypeModal = (action) => {
    setModalStack(prev => [...prev, {
      type: "BOMCreation",
      props: {
        mode: action,
        onClose: () => closeCurrentModal(),
        onBack: () => closeCurrentModal()
      }
    }]);
  };
  const openEInvoiceModal = () => {
    setModalStack([{
      type: "einvoice",
      props: {
        onClose: () => closeAllModals(),
        branch: selectedBranch,
        username: credentials?.username
      }
    }]);
  };

  const closeCurrentModal = () => {
    setModalStack(prev => prev.slice(0, -1));
  };

  const closeAllModals = () => {
    setModalStack([]);
  };

  // Menu functions
  const toggleMenu = (menuId) => {
    const clickedItem = data.menu.find(item => item.id === menuId);
    if (!clickedItem) return;

    if (clickedItem.title === "Department") {
      openHRMSDepartmentModal();
      return;
    }
    if (clickedItem.title === "Designation") {
      openHRMSDesignationModal();
      return;
    }
    if (clickedItem.title === "Bank") {
      openHRMSBankModal();
      return;
    }
    if (clickedItem.title === "Benifit Type") {
      openHRMSBenifitModal();
      return;
    }
    if (clickedItem.title === "Cash Payment Voucher") {
      openCashPaymentVoucherModal();
      return;
    }
    if (clickedItem.title === "Employee Type") {
      openHRMSEmployeeTypeModal();
      return;
    }
    if (clickedItem.title === "Allowance Type") {
      openHRMSAllowanceTypeModal();
      return;
    }
    if (clickedItem.title === "Deduction Type") {
      openHRMSDeductionTypeModal();
      return;
    }
    if (clickedItem.title === "Shift & Shift Timing") {
      openShiftAndShiftTimingTypeModal();
      return;
    }
    if (clickedItem.title === "Currency Code") {
      opencomCurrencyTypeModal();
      return;
    }
    if (clickedItem.title === "Rejection Reason Codes") {
      opencomReasonTypeModal();
      return;
    }
    if (clickedItem.title === "Countries") {
      opencountryTypeModal();
      return;
    }
    if (clickedItem.title === "Country wise Cities") {
      opencitiesTypeModal();
      return;
    }
    if (clickedItem.title === "Vehicle Types") {
      opencomVehicleTypeTypeModal();
      return;
    }
    if (clickedItem.title === "Type of Charges") {
      opencomTypeofChargesTypeModal();
      return;
    }
    if (clickedItem.title === "Locations") {
      openHRMSLocationTypeModal();
      return;
    }
    if (clickedItem.title === "Unit of Measurement") {
      opencomUOMTypeModal();
      return;
    }
    if (clickedItem.title === "Process") {
      opencomProcessTypeModal();
      return;
    }
    if (clickedItem.title === "Projects") {
      opencomProjectsTypeModal();
      return;
    }
    if (clickedItem.title === "Loan Type") {
      openHRMSLoanTypeTypeModal();
      return;
    }
    if (clickedItem.title === "DashBoard Creation") {
      opencomtblDashboardTypeModal();
      return;
    }
    if (clickedItem.title === "Payment Types") {
      openlndPaymentTypeTypeModal();
      return;
    }
    if (clickedItem.title === "Floor Codes") {
      openlndFloorTypeModal();
      return;
    }
    if (clickedItem.title === "Plot Categories") {
      openlndPlotCatagoryTypeModal();
      return;
    }
    if (clickedItem.title === "Relationship Types") {
      openlndRelationTypeModal();
      return;
    }
    if (clickedItem.title === "ThickNess") {
      openIMFThicknessTypeModal();
      return;
    }
    if (clickedItem.title === "Color") {
      openIMFColorTypeModal();
      return;
    }
    if (clickedItem.title === "Account Group .") {
      openacGroupTypeModal();
      return;
    }
    if (clickedItem.title === "Land Frequency") {
      openlndFrequencyTypeModal();
      return;
    }
    if (clickedItem.title === "Employee Master File") {
      openHRMSEmployeeFileTypeModal();
      return;
    }
    if (clickedItem.title === "Goods Receipt Note") {
      openGoodsReceiptNoteTypeModal();
      return;
    }
    if (clickedItem.title === "Chart Of Accounts") {
      openChartofAccountTypeModal();
      return;
    }
    if (clickedItem.title === "Item Profile") {
      openIMFTypeModal();
      return;
    }
    if (clickedItem.title === "Customer/Supplier Profile") {
      openCustomerSupplierProfileTypeModal();
      return;
    }
    if (clickedItem.title === "Transporter Profile") {
      openTransporterProfileTypeModal();
      return;
    }
    if (clickedItem.title === "SalesMan Profile") {
      openSalesManProfileTypeModal();
      return;
    }
    if (clickedItem.title === "City Profile") {
      openCityProfileTypeModal();
      return;
    }
    if (clickedItem.title === "Organizational Chart") {
      openOrganizationalChartTypeModal();
      return;
    }
    if (clickedItem.title === "Labour Profile") {
      openLabourProfileTypeModal();
      return;
    }
    if (clickedItem.title === "Vechiles") {
      openVechilesTypeModal();
      return;
    }
    if (clickedItem.title === "Attendance Machines") {
      openAttendanceMachinesTypeModal();
      return;
    }
    if (clickedItem.title === "BOM Creation") {
      openBOMCreationTypeModal();
      return;
    }
    if (clickedItem.title === "Size") {
      openIMFSizeTypeModal();
      return;
    }
    const parentId = clickedItem?.parentId;
    setExpandedMenus(prev => {
      const updated = { ...prev };
      data.menu.forEach(item => {
        if (item.parentId === parentId && item.id !== menuId) {
          updated[item.id] = false;
        }
      });
      updated[menuId] = !prev[menuId];
      return updated;
    });
  };

  const getIconForMenu = (title) => menuIcons[title] || <FaFileInvoiceDollar />;

  const renderMenuTree = (parentId, level = 0) => {
    return data.menu
      .filter(item => item.parentId === parentId)
      .map(item => {
        const children = data.menu.filter(child => child.parentId === item.id);
        const isExpanded = expandedMenus[item.id];
        return (
          <div key={item.id} className={`menu-parent level-${level}`}>
            <div
              className={`menu-item ${isExpanded ? "active" : ""}`}
              onClick={() => toggleMenu(item.id)}
            >
              <span className="menu-icon">{getIconForMenu(item.title)}</span>
              {!sidebarCollapsed && (
                <>
                  <span className="menu-title">{item.title}</span>
                  {children.length > 0 && (
                    <span className="dropdown-arrow">
                      {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                  )}
                </>
              )}
            </div>
            {children.length > 0 && isExpanded && !sidebarCollapsed && (
              <div className={`submenu level-${level}`}>
                {renderMenuTree(item.id, level + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  const getRootId = () => {
    if (!activeMainMenu) return null;
    const match = data.menu.find(item =>
      item.title.trim().toLowerCase() === activeMainMenu.trim().toLowerCase() &&
      item.parentId === "00"
    );
    return match ? match.id : null;
  };

  // Modal rendering
  const renderModal = () => {
    if (modalStack.length === 0) return null;

    const currentModal = modalStack[modalStack.length - 1];
    let ModalComponent;

    switch (currentModal.type) {
      case "HRMSDepartment":
        ModalComponent = HRMSDepartment;
        break;
      case "HRMSDesignation":
        ModalComponent = HRMSDesignation;
        break;
      case "HRMSBank":
        ModalComponent = HRMSBank;
        break;
      case "HRMSBenifit":
        ModalComponent = HRMSBenifit;
        break;
      case "department":
        ModalComponent = Department;
        break;
      case "CashPaymentVoucher":
        ModalComponent = CashPaymentVoucher;
        break;
      case "HRMSEmployeeType":
        ModalComponent = HRMSEmployeeType;
        break;
      case "HRMSAllowanceType":
        ModalComponent = HRMSAllowanceType;
        break;
      case "HRMSDeductionType":
        ModalComponent = HRMSDeductionType;
        break;
      case "ShiftAndShiftTiming":
        ModalComponent = ShiftAndShiftTiming;
        break;
      case "comCurrency":
        ModalComponent = comCurrency;
        break;
      case "comReason":
        ModalComponent = comReason;
        break;
      case "country":
        ModalComponent = country;
        break;
      case "cities":
        ModalComponent = cities;
        break;
      case "HRMSLocation":
        ModalComponent = HRMSLocation;
        break;
      case "comVehicleType":
        ModalComponent = comVehicleType;
        break;
      case "comTypeofCharges":
        ModalComponent = comTypeofCharges;
        break;
      case "comUOM":
        ModalComponent = comUOM;
        break;
      case "comProcess":
        ModalComponent = comProcess;
        break;
      case "comProjects":
        ModalComponent = comProjects;
        break;
      case "HRMSLoanType":
        ModalComponent = HRMSLoanType;
        break;
      case "comtblDashboard":
        ModalComponent = comtblDashboard;
        break;
      case "lndFloor":
        ModalComponent = lndFloor;
        break;
      case "lndPaymentType":
        ModalComponent = lndPaymentType;
        break;
      case "lndPlotCatagory":
        ModalComponent = lndPlotCatagory;
        break;
      case "lndRelation":
        ModalComponent = lndRelation;
        break;
      case "IMFThickness":
        ModalComponent = IMFThickness;
        break;
      case "IMFColor":
        ModalComponent = IMFColor;
        break;
      case "acGroup":
        ModalComponent = acGroup;
        break;
      case "lndFrequency":
        ModalComponent = lndFrequency;
        break;
      case "HRMSEmployeeFile":
        ModalComponent = HRMSEmployeeFile;
        break;
      case "GoodsReceiptNote":
        ModalComponent = GoodsReceiptNote;
        break;
      case "IMFSize":
        ModalComponent = IMFSize;
        break;
      case "ChartofAccount":
        ModalComponent = ChartofAccount;
        break;
      case "IMF":
        ModalComponent = IMF;
        break;
      case "TransporterProfile":
        ModalComponent = TransporterProfile;
        break;
      case "SalesManProfile":
        ModalComponent = SalesManProfile;
        break;
      case "CityProfile":
        ModalComponent = CityProfile;
        break;
      case "OrganizationalChart":
        ModalComponent = OrganizationalChart;
        break;
      case "LabourProfile":
        ModalComponent = LabourProfile;
        break;
      case "Vechiles":
        ModalComponent = Vechiles;
        break;
      case "AttendanceMachines":
        ModalComponent = AttendanceMachines;
        break;
      case "BOMCreation":
        ModalComponent = BOMCreation;
        break;
      case "CustomerSupplierProfile":
        ModalComponent = CustomerSupplierProfile;
        break
      case "einvoice":
        ModalComponent = EInvoice;
        break;
      default:
        return null;
    }

    return (
      <div className="modal-overlay active">
        <div className="modal-content">
          <button
            className="modal-close-btn"
            onClick={() => {
              if (currentModal.type === "department") {
                closeCurrentModal();
              } else {
                closeAllModals();
              }
            }}
            aria-label="Close modal"
          >
            <FiX className="close-icon" />
          </button>
          <ModalComponent {...currentModal.props} />
        </div>
      </div>
    );
  };

  // Handle main menu click
  const handleMainMenuClick = (menuName) => {
    if (menuName === "E-Invoice") {
      openEInvoiceModal();
      setActiveMainMenu("E-Invoice"); // Keep E-Invoice as active menu
    } else {
      setActiveMainMenu(menuName);
      closeAllModals();
    }
    setMobileMenuOpen(false);
  };

  // Scroll horizontal menu
  const scrollMenu = (direction) => {
    if (horizontalMenuRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      horizontalMenuRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Main render
  return (
    <div className={`dashboard-container ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${mobileMenuOpen ? "mobile-sidebar-open" : ""}`}>
      {showLogoutConfirm && (
        <LogoutConfirm
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}

      {renderModal()}

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={handleOverlayClick}
        />
      )}

      <div className={`sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">{data.company.name?.[0]}</div>
          {!sidebarCollapsed && <h3>{data.company.name}</h3>}
          <button
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        <div className="sidebar-menu">
          {getRootId() ? renderMenuTree(getRootId()) : (
            <div className="menu-placeholder">
              {!sidebarCollapsed && <p>Select a menu from above</p>}
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="sidebar-footer">
            <button onClick={showLogoutConfirmation} className="logout-btn">
              <FaSignOutAlt className="logout-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      <div className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button
              className="mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <FiMenu />
            </button>
            <h2>Welcome to {data.company.name}</h2>
          </div>
          <div className="header-right">
            {data.branches.length > 0 && (
              <div className="branch-selector">
                <FaBuilding className="branch-icon" />
                <select
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  value={selectedBranch}
                  className="branch-select"
                >
                  {data.branches.map((b, i) => (
                    <option key={i} value={b.branch}>{b.branch}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="user-profile">
              <FaUserCircle className="user-icon" />
              <span>{credentials?.username || "User"}</span>
            </div>
          </div>
        </header>

        <div className="horizontal-menu-container">
          <button
            className="scroll-button left"
            onClick={() => scrollMenu('left')}
            aria-label="Scroll menu left"
          >
            <FiChevronLeft />
          </button>
          <div className="horizontal-menu-scrollable" ref={horizontalMenuRef}>
            <div className="horizontal-menu-bar">
              {mainMenuItems.map((item, index) => (
                <div
                  key={index}
                  className={`horizontal-menu-item ${activeMainMenu === item.name ? 'active' : ''}`}
                  onClick={() => handleMainMenuClick(item.name)}
                >
                  <span className="horizontal-menu-icon">{item.icon}</span>
                  <span className="horizontal-menu-text">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="scroll-button right"
            onClick={() => scrollMenu('right')}
            aria-label="Scroll menu right"
          >
            <FiChevronRight />
          </button>
        </div>

        <div className="content-area">
          {data.loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading dashboard data...</p>
            </div>
          ) : data.error ? (
            <div className="error-container">
              <div className="error-icon">!</div>
              <p className="error-message">{data.error}</p>
              <button onClick={() => window.location.reload()} className="retry-btn">
                Retry
              </button>
            </div>
          ) : (
            <>
              {modalStack.length === 0 && (
                <div className="dashboard-content">
                  <div className="welcome-section">
                    <h3>Dashboard Overview</h3>
                    <p>You have selected branch: <strong>{selectedBranch}</strong></p>
                    <p>Logged in as: <strong>{credentials?.username}</strong></p>
                  </div>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon blue">
                        <FaChartLine />
                      </div>
                      <div className="stat-info">
                        <h4>Total Sales</h4>
                        <p>$24,560</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon green">
                        <FaUsers />
                      </div>
                      <div className="stat-info">
                        <h4>Active Users</h4>
                        <p>142</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon purple">
                        <FaFileInvoiceDollar />
                      </div>
                      <div className="stat-info">
                        <h4>Pending Invoices</h4>
                        <p>28</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon orange">
                        <FaShoppingCart />
                      </div>
                      <div className="stat-info">
                        <h4>New Orders</h4>
                        <p>56</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;