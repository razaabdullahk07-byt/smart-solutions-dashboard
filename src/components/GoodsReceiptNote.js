
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import {
  FaSave, FaSync, FaEdit, FaPlus, FaTrash,
  FaCalendarAlt, FaReceipt, FaMoneyBillWave,
  FaCodeBranch, FaProjectDiagram, FaFileAlt,
  FaSearchDollar, FaBalanceScale, FaCheckCircle,
  FaTimesCircle, FaDollarSign, FaCalculator,
  FaTruck, FaWarehouse, FaUser, FaBox,
  FaSearch, FaFilter, FaExclamationTriangle,
  FaDownload, FaList, FaShoppingCart,
  FaArrowLeft, FaArrowRight, FaCheckSquare,
  FaFileInvoiceDollar, FaBarcode, FaClipboardList,
  FaShippingFast, FaMoneyCheckAlt, FaPercent,
  FaHashtag, FaSignature, FaStickyNote,
  FaCheck, FaTimes, FaExpandAlt, FaCompressAlt,
  FaFilePdf
} from "react-icons/fa";
import "./GRN.css";

const GRNScreen = () => {
  const { credentials } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [godowns, setGodowns] = useState([]);
  const [items, setItems] = useState([]);
  const [grnList, setGrnList] = useState([]);
  const [filteredGrnList, setFilteredGrnList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState("new");
  const [showPOs, setShowPOs] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPOs, setSelectedPOs] = useState([]);
  const [selectedPODetails, setSelectedPODetails] = useState([]);
  const [salesTaxPercentage, setSalesTaxPercentage] = useState(17);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const [uomList, setUomList] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const itemsPerPage = 10;

  // State for GRN header
  const [grnHeader, setGrnHeader] = useState({
    grnNo: "",
    grnDate: new Date().toISOString().split('T')[0],
    supplierCode: "",
    supplierName: "",
    supplierCountry: "",
    supplierCity: "",
    godownID: "",
    godownName: "",
    remarks: "",
    manualRefNo: "",
    status: "Unposted",
    createdby: credentials?.username || "",
    compcode: "01",
    offcode: "0101",
    vtype: "GRN",
    IGPNo: "",
    IGPDate: new Date().toISOString().split('T')[0],
    MTransportCode: "0000000001",
    MLabourCode: "0000000001"
  });

  // State for GRN details
  const [grnDetails, setGrnDetails] = useState([
    {
      itemCode: "",
      itemName: "",
      quantity: 0,
      unit: "PCS",
      rate: 0,
      amount: 0,
      salesTaxPercentage: 17,
      salesTaxAmount: 0,
      netAmount: 0,
      batchNo: "",
      expiryDate: "",
      remarks: "",
      poNo: "",
      poDate: "",
      alterCode: "",
      saleOrder: "",
      poQty: 0,
      grnQty: 0,
      thisQty: 0,
      value: 0,
      transporter: "",
      freightAmount: 0,
      netValue: 0,
      note: "",
      slipLcNo: "",
      POpk: 1,
      ROpk: 5417
    }
  ]);

  const API_BASE = "http://192.168.100.113:8081/api";

  // Helper to fetch JSON safely with better error handling
  const fetchJson = async (url, options = {}) => {
    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`API call failed to ${url}:`, error);
      throw error;
    }
  };

  // Load customers, godowns, items, UOMs and GRN list
  useEffect(() => {
    if (credentials?.username) {
      setGrnHeader(prev => ({ ...prev, createdby: credentials.username }));
    }

    loadCustomers();
    loadGodowns();
    loadItems();
    loadUomList();
    loadGrnList();
  }, [credentials]);

  // Load UOMs from comUOM table
  const loadUomList = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/get-GRNtable-data`, {
        method: "POST",
        body: JSON.stringify({ tableName: "comUOM" }),
      });

      if (data.success && (data.data || data.rows)) {
        const rows = data.data || data.rows;
        setUomList(rows);
      } else {
        setUomList([
          { uomID: "1", uomName: "PCS" },
          { uomID: "2", uomName: "BOX" },
          { uomID: "3", uomName: "KG" },
          { uomID: "4", uomName: "M" },
        ]);
      }
    } catch (err) {
      setUomList([
        { uomID: "1", uomName: "PCS" },
        { uomID: "2", uomName: "BOX" },
        { uomID: "3", uomName: "KG" },
        { uomID: "4", uomName: "M" },
      ]);
    }
  };

  // Load customers from comCustomer table with fallback
  const loadCustomers = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/get-GRNtable-data`, {
        method: "POST",
        body: JSON.stringify({ tableName: "comCustomer", offcode: "0101" }),
      });

      if (data.success && (data.data || data.rows)) {
        const rows = data.data || data.rows;
        setCustomers(rows.filter(c =>
          c.type === "2" ||
          c.isSupplier === true ||
          c.isSupplier === "true" ||
          c.ISSUPPLIER === true ||
          c.ISSUPPLIER === "true"
        ));
      } else {
        setCustomers([
          { CustomerCode: "0000001000", CustomerName: "DG Cement Company", type: "2", country: "Pakistan", city: "Lahore" },
          { CustomerCode: "0000001001", CustomerName: "Best Suppliers", type: "2", country: "Pakistan", city: "Karachi" },
        ]);
      }
    } catch (err) {
      setCustomers([
        { CustomerCode: "0000001000", CustomerName: "DG Cement Company", type: "2", country: "Pakistan", city: "Lahore" },
        { CustomerCode: "0000001001", CustomerName: "Best Suppliers", type: "2", country: "Pakistan", city: "Karachi" },
      ]);
    }
  };

  // Load godowns from comGodown table with fallback
  const loadGodowns = async () => {
    try {
      const data = await fetchJson(`${API_BASE}/get-GRNtable-data`, {
        method: "POST",
        body: JSON.stringify({ tableName: "comGodown" }),
      });

      if (data.success && (data.data || data.rows)) {
        const rows = data.data || data.rows;
        setGodowns(rows);
      } else {
        setGodowns([
          { godownID: "1", description: "Main Godown" },
          { godownID: "2", description: "Raw Matrial" },
        ]);
      }
    } catch (err) {
      setGodowns([
        { godownID: "1", description: "Main Godown" },
        { godownID: "2", description: "Raw Matrial" },
      ]);
    }
  };

  // Load items with improved error handling
  const loadItems = async () => {
    try {
      const tableNames = ["comItem", "comItems", "item", "items", "Inventory"];
      for (const tableName of tableNames) {
        try {
          const data = await fetchJson(`${API_BASE}/get-table-data`, {
            method: "POST",
            body: JSON.stringify({ tableName, offcode: "0101" }),
          });

          if (data.success && (data.data || data.rows)) {
            const rows = data.data || data.rows;
            const formattedItems = rows.map(item => {
              return {
                code: item.Itemcode || item.code || item.ItemCode || item.ITEMCODE,
                name: item.Itemname || item.name || item.ItemName || item.ITEMNAME,
                uom: item.uom || item.unit || item.UOM
              };
            });
            setItems(formattedItems.filter(item => item.code && item.name));
            return;
          }
        } catch (e) {
          continue;
        }
      }
      setItems([
        { code: "0101001", name: "P.G New abc", unit: "PCS" },
        { code: "0101002", name: "Cement Bag", unit: "BAG" },
      ]);
    } catch (err) {
      setItems([
        { code: "0101001", name: "P.G New abc", unit: "PCS" },
        { code: "0101002", name: "Cement Bag", unit: "BAG" },
      ]);
    }
  };

  // Load GRN list
  const loadGrnList = async () => {
    try {
      setLoading(true);
      const data = await fetchJson(`${API_BASE}/get-table-data`, {
        method: "POST",
        body: JSON.stringify({
          tableName: "invgrnhead",
          offcode: "0101",
          limit: 100
        }),
      });

      if (data.success && (data.data || data.rows)) {
        const rows = data.data || data.rows;
        setGrnList(rows);
        setFilteredGrnList(rows);
      } else {
        setGrnList([]);
        setFilteredGrnList([]);
      }
    } catch (err) {
      setError("Failed to load GRN list: " + err.message);
      setGrnList([]);
      setFilteredGrnList([]);
    } finally {
      setLoading(false);
    }
  };

  // Load purchase orders for selected supplier
  const loadPurchaseOrders = async (supplierCode) => {
    try {
      setLoading(true);
      const data = await fetchJson(`${API_BASE}/insert-PurchaseOrders`, {
        method: "POST",
        body: JSON.stringify({
          supplierCode,
          offcode: "0101"
        }),
      });

      if (data.success && data.data) {
        setPurchaseOrders(data.data);
        setShowPOs(true);
        setSelectedPOs([]);
        setSelectedPODetails([]);
      } else {
        setError("No purchase orders found for this supplier");
        setPurchaseOrders([]);
      }
    } catch (err) {
      setError("Failed to load purchase orders: " + err.message);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle PO selection
  const togglePOSelection = (po, detail) => {
    const poKey = `${po.vno}-${detail.Itemcode}`;

    if (selectedPODetails.some(p => `${p.poNo}-${p.itemCode}` === poKey)) {
      setSelectedPODetails(selectedPODetails.filter(p => `${p.poNo}-${p.itemCode}` !== poKey));
    } else {
      const newDetail = {
        poNo: po.vno,
        poDate: po.vdate,
        itemCode: detail.Itemcode,
        itemName: detail.Itemname,
        alterCode: detail.Altercode || "",
        unit: detail.uom || "PCS",
        poQty: parseFloat(detail.qty || 0),
        grnQty: parseFloat(detail.Recivedqty || 0),
        thisQty: parseFloat(detail.qty || 0) - parseFloat(detail.Recivedqty || 0),
        rate: parseFloat(detail.rate || 0),
        saleOrder: "",
        transporter: "",
        freightAmount: 0,
        note: "",
        slipLcNo: ""
      };

      setSelectedPODetails([...selectedPODetails, newDetail]);
    }
  };

  // Delete selected PO detail
  const deletePODetail = (index) => {
    const updatedDetails = [...selectedPODetails];
    updatedDetails.splice(index, 1);
    setSelectedPODetails(updatedDetails);
  };

  // Add selected PO items to GRN details
  const addPOItemsToGRN = () => {
    if (selectedPODetails.length === 0) {
      setError("Please select at least one item from purchase orders");
      return;
    }

    const newDetails = selectedPODetails.map(item => {
      const amount = item.thisQty * item.rate;
      const salesTaxAmount = amount * (salesTaxPercentage / 100);
      const netAmount = amount + salesTaxAmount + (item.freightAmount || 0);

      return {
        itemCode: item.itemCode,
        itemName: item.itemName,
        quantity: item.thisQty,
        unit: item.unit,
        rate: item.rate,
        amount: amount,
        salesTaxPercentage: salesTaxPercentage,
        salesTaxAmount: salesTaxAmount,
        netAmount: netAmount,
        batchNo: "",
        expiryDate: "",
        remarks: "",
        poNo: item.poNo,
        poDate: item.poDate,
        alterCode: item.alterCode,
        saleOrder: item.saleOrder,
        poQty: item.poQty,
        grnQty: item.grnQty,
        thisQty: item.thisQty,
        value: amount,
        transporter: item.transporter,
        freightAmount: item.freightAmount,
        netValue: netAmount,
        note: item.note,
        slipLcNo: item.slipLcNo,
        POpk: 1,
        ROpk: 5417
      };
    });

    setGrnDetails(newDetails);
    setShowPOs(false);
    setSelectedPOs([]);
    setSelectedPODetails([]);
  };

  // Update PO detail field
  const updatePODetail = (index, field, value) => {
    const updatedDetails = [...selectedPODetails];
    updatedDetails[index][field] = value;

    if (field === 'poQty' || field === 'grnQty') {
      updatedDetails[index].thisQty = updatedDetails[index].poQty - updatedDetails[index].grnQty;
    }

    setSelectedPODetails(updatedDetails);
  };

  // Toggle row expansion
  const toggleRowExpansion = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Filtering
  useEffect(() => {
    let filtered = grnList;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((d) =>
        ["vno", "suppliername", "manualrefno", "supplierName", "manualRefNo"].some(
          (key) =>
            d[key] &&
            d[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (activeFilter !== "all") {
      const isActive = activeFilter === "posted";
      filtered = filtered.filter((d) => {
        const statusValue = d.status || 2;
        return statusValue === 1 === isActive;
      });
    }

    setFilteredGrnList(filtered);
  }, [searchTerm, activeFilter, grnList]);

  // Handle GRN header field change
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;

    if (name === "supplierCode") {
      const selectedCustomer = customers.find(c => c.CustomerCode === value);
      setGrnHeader({
        ...grnHeader,
        [name]: value,
        supplierName: selectedCustomer ? selectedCustomer.CustomerName : "",
        supplierCountry: selectedCustomer ? selectedCustomer.country : "",
        supplierCity: selectedCustomer ? selectedCustomer.city : ""
      });
    } else if (name === "godownID") {
      const selectedGodown = godowns.find(g => g.godownID === value);
      setGrnHeader({
        ...grnHeader,
        [name]: value,
        godownName: selectedGodown ? selectedGodown.description : ""
      });
    } else {
      setGrnHeader({ ...grnHeader, [name]: value });
    }
  };

  // Handle GRN detail field change
  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...grnDetails];

    if (name === "itemCode") {
      const selectedItem = items.find(item => item.code === value);
      updated[index].itemCode = value;
      updated[index].itemName = selectedItem ? selectedItem.name : "";
      updated[index].unit = selectedItem ? selectedItem.unit : "PCS";
    } else if (name === "salesTaxPercentage") {
      updated[index][name] = parseFloat(value) || 0;
    } else {
      updated[index][name] =
        name === "quantity" || name === "rate" || name === "amount" || name === "salesTaxAmount" || name === "netAmount" ||
          name === "thisQty" || name === "poQty" || name === "grnQty" || name === "freightAmount"
          ? parseFloat(value) || 0
          : value;
    }

    if (name === "quantity" || name === "rate" || name === "salesTaxPercentage" || name === "thisQty" || name === "freightAmount") {
      const quantity = parseFloat(updated[index].thisQty || updated[index].quantity) || 0;
      const rate = parseFloat(updated[index].rate) || 0;
      const salesTaxPercentage = parseFloat(updated[index].salesTaxPercentage) || 0;
      const freightAmount = parseFloat(updated[index].freightAmount) || 0;

      const amount = quantity * rate;
      const salesTaxAmount = amount * (salesTaxPercentage / 100);
      const netAmount = amount + salesTaxAmount + freightAmount;

      updated[index].amount = amount;
      updated[index].salesTaxAmount = salesTaxAmount;
      updated[index].netAmount = netAmount;
      updated[index].value = amount;
      updated[index].netValue = netAmount;
    }

    setGrnDetails(updated);
  };

  // Update sales tax percentage for all items
  const updateAllSalesTax = (percentage) => {
    setSalesTaxPercentage(percentage);
    const updated = grnDetails.map(item => {
      const quantity = parseFloat(item.thisQty || item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const freightAmount = parseFloat(item.freightAmount) || 0;

      const amount = quantity * rate;
      const salesTaxAmount = amount * (percentage / 100);
      const netAmount = amount + salesTaxAmount + freightAmount;

      return {
        ...item,
        salesTaxPercentage: percentage,
        salesTaxAmount: salesTaxAmount,
        netAmount: netAmount,
        value: amount,
        netValue: netAmount
      };
    });

    setGrnDetails(updated);
  };

  const addRow = () => {
    setGrnDetails([
      ...grnDetails,
      {
        itemCode: "",
        itemName: "",
        quantity: 0,
        unit: "PCS",
        rate: 0,
        amount: 0,
        salesTaxPercentage: salesTaxPercentage,
        salesTaxAmount: 0,
        netAmount: 0,
        batchNo: "",
        expiryDate: "",
        remarks: "",
        poNo: "",
        poDate: "",
        alterCode: "",
        saleOrder: "",
        poQty: 0,
        grnQty: 0,
        thisQty: 0,
        value: 0,
        transporter: "",
        freightAmount: 0,
        netValue: 0,
        note: "",
        slipLcNo: "",
        POpk: 1,
        ROpk: 5417
      }
    ]);
  };

  const removeRow = (index) => {
    if (grnDetails.length > 1) {
      const updated = [...grnDetails];
      updated.splice(index, 1);
      setGrnDetails(updated);
    }
  };

  // Calculate totals
  const totalQuantity = grnDetails.reduce((sum, row) => sum + (parseFloat(row.thisQty || row.quantity) || 0), 0);
  const totalAmount = grnDetails.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
  const totalSalesTax = grnDetails.reduce((sum, row) => sum + (parseFloat(row.salesTaxAmount) || 0), 0);
  const totalFreight = grnDetails.reduce((sum, row) => sum + (parseFloat(row.freightAmount) || 0), 0);
  const totalNetAmount = grnDetails.reduce((sum, row) => sum + (parseFloat(row.netAmount) || 0), 0);

  // Generate PDF - UPDATED TO WORK WITH YOUR BACKEND RESPONSE
  const generatePDF = async (vno, vockey) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/generate-grn-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          vno: vno,
          vockey: vockey,
          offcode: "0101"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is PDF (binary data)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/pdf")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a download link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `GRN_${vno}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up URL object
        window.URL.revokeObjectURL(url);
      } else {
        // If it's JSON response with PDF URL
        const result = await response.json();
        if (result.success && result.pdfUrl) {
          // Open PDF in new tab
          window.open(result.pdfUrl, '_blank');
        } else if (result.success && result.message) {
          // If PDF generation was successful but returned as JSON
          setSuccessMessage("PDF generated successfully!");
        } else {
          throw new Error("PDF generation failed: " + (result.error || "Unknown error"));
        }
      }
    } catch (err) {
      setError("Failed to generate PDF: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update PO quantities after GRN save - NEW FUNCTION
  const updatePOQuantities = async (grnDetails, vno) => {
    try {
      for (const detail of grnDetails) {
        if (detail.poNo && detail.thisQty > 0) {
          await fetchJson(`${API_BASE}/update-po-quantity`, {
            method: "POST",
            body: JSON.stringify({
              poNo: detail.poNo,
              itemCode: detail.itemCode,
              grnQty: detail.thisQty,
              grnNo: vno,
              offcode: "0101"
            }),
          });
        }
      }
      console.log("PO quantities updated successfully");
    } catch (err) {
      console.error("Error updating PO quantities:", err);
      // Don't throw error here as GRN is already saved
    }
  };

  // Open form for new GRN
  const handleNew = () => {
    setGrnHeader({
      grnNo: "",
      grnDate: new Date().toISOString().split('T')[0],
      supplierCode: "",
      supplierName: "",
      supplierCountry: "",
      supplierCity: "",
      godownID: "",
      godownName: "",
      remarks: "",
      manualRefNo: "",
      status: "Unposted",
      createdby: credentials?.username || "",
      compcode: "01",
      offcode: "0101",
      vtype: "GRN",
      IGPNo: "",
      IGPDate: new Date().toISOString().split('T')[0],
      MTransportCode: "0000000001",
      MLabourCode: "0000000001"
    });
    setGrnDetails([
      {
        itemCode: "",
        itemName: "",
        quantity: 0,
        unit: "PCS",
        rate: 0,
        amount: 0,
        salesTaxPercentage: salesTaxPercentage,
        salesTaxAmount: 0,
        netAmount: 0,
        batchNo: "",
        expiryDate: "",
        remarks: "",
        poNo: "",
        poDate: "",
        alterCode: "",
        saleOrder: "",
        poQty: 0,
        grnQty: 0,
        thisQty: 0,
        value: 0,
        transporter: "",
        freightAmount: 0,
        netValue: 0,
        note: "",
        slipLcNo: "",
        POpk: 1,
        ROpk: 5417
      }
    ]);
    setEditMode("new");
    setIsEditing(true);
    setError(null);
    setSelectedPOs([]);
    setSelectedPODetails([]);
    setPdfUrl(null);
  };

  // Open form for edit
  const handleEdit = async (grn) => {
    try {
      setLoading(true);
      setError(null);

      const grnNo = grn.vno || grn.grnNo;
      const vockey = grn.vockey || `${grn.offcode || "0101"}${grnNo}`;

      setGrnHeader({
        grnNo: grnNo,
        grnDate: grn.vdate || grn.grnDate || new Date().toISOString().split('T')[0],
        supplierCode: grn.suppliercode || grn.supplierCode,
        supplierName: grn.suppliername || grn.supplierName,
        supplierCountry: grn.country || grn.supplierCountry,
        supplierCity: grn.city || grn.supplierCity,
        godownID: grn.godownid || grn.godownID,
        godownName: grn.godownname || grn.godownName,
        remarks: grn.remarks || "",
        manualRefNo: grn.ManualRefNo || grn.manualRefNo,
        status: grn.status === 1 ? "Posted" : "Unposted",
        createdby: grn.createdby || credentials?.username || "",
        compcode: grn.compcode || "01",
        offcode: grn.offcode || "0101",
        vtype: grn.vtype || "GRN",
        IGPNo: grn.IGPNo || "",
        IGPDate: grn.IGPDate || new Date().toISOString().split('T')[0],
        MTransportCode: grn.MTransportCode || "0000000001",
        MLabourCode: grn.MLabourCode || "0000000001"
      });

      // Load GRN details
      try {
        const detailsData = await fetchJson(`${API_BASE}/get-table-data`, {
          method: "POST",
          body: JSON.stringify({
            tableName: "invgrndet",
            offcode: "0101",
            columnName: "vockey",    // 👈 use columnName/value style
            value: vockey
          }),
        });


        if (detailsData.success && (detailsData.data || detailsData.rows)) {
          const detailsRows = (detailsData.data || detailsData.rows)
            .filter(row => (row.vockey || row.VOCKEY) === vockey); // 👈 filter manually

          setGrnDetails(detailsRows.map(row => ({
            itemCode: row.Itemcode || row.itemCode,
            itemName: row.Itemname || row.itemName,
            quantity: row.qty || row.quantity,
            unit: row.uom || row.unit,
            rate: row.rate,
            amount: row.value || row.amount,
            salesTaxPercentage: row.saleTaxPer || row.salesTaxPercentage,
            salesTaxAmount: row.salestaxAmt || row.salesTaxAmount,
            netAmount: row.netvalue || row.netAmount,
            batchNo: row.batchCode || row.batchNo,
            expiryDate: row.ExpDate || row.expiryDate,
            remarks: row.particular || row.remarks,
            poNo: row.PO || row.poNo,
            poDate: row.poDate,
            alterCode: row.alterCode,
            saleOrder: row.saleOrder,
            poQty: row.poQty,
            grnQty: row.grnQty,
            thisQty: row.qty || row.thisQty,
            value: row.value,
            transporter: row.transporter,
            freightAmount: row.freightAmount,
            netValue: row.netvalue || row.netAmount,
            note: row.note,
            slipLcNo: row.slipLcNo,
            POpk: row.POpk || 1,
            ROpk: row.ROpk || 5417
          })));
        }

      } catch (err) {
        console.error("Error loading GRN details:", err);
      }

      setEditMode("edit");
      setIsEditing(true);
    } catch (err) {
      setError(`Error loading GRN: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Save GRN - UPDATED WITH PO QUANTITY DEDUCTION
  // Save GRN - FIXED VERSION
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // --- Validation ---
      if (!grnHeader.supplierCode) {
        setError("Please select a supplier");
        return;
      }

      if (!grnHeader.godownID) {
        setError("Please select a godown");
        return;
      }

      if (totalQuantity === 0) {
        setError("Please add at least one item with quantity");
        return;
      }

      // --- Check for items without PO ---
      const itemsWithoutPO = grnDetails.filter(
        (item) => (item.thisQty > 0 || item.quantity > 0) && !item.poNo
      );
      if (itemsWithoutPO.length > 0) {
        if (
          !window.confirm(
            "Some items have quantities but no PO number. Continue without PO reference?"
          )
        ) {
          return;
        }
      }

      // --- Helper to format date (YYYY-MM-DD) ---
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d)) return null;
        return d.toISOString().split("T")[0]; // yyyy-mm-dd only
      };

      // --- Build payload ---
      const payload = {
        head: {
          tableName: "invgrnhead",
          data: {
            vdate: formatDate(grnHeader.grnDate),
            vtype: "GRN",
            Ptype: 110,
            suppliercode: grnHeader.supplierCode,
            suppliername: grnHeader.supplierName,
            city: grnHeader.supplierCity,
            country: grnHeader.supplierCountry,
            godownid: parseInt(grnHeader.godownID),
            godownname: grnHeader.godownName,
            currencycode: 1,
            currencyrate: 1,
            compcode: "01",
            createdby: grnHeader.createdby,
            status: 2,
            ManualRefNo: grnHeader.manualRefNo || "",
            IGPNo: grnHeader.IGPNo || "",
            IGPDate: formatDate(grnHeader.IGPDate),
            MTransportCode: grnHeader.MTransportCode,
            MLabourCode: grnHeader.MLabourCode,
            editby: credentials?.username || "",
            editdate: editMode === "edit" ? new Date().toISOString().slice(0, 19).replace("T", " ") : undefined
          },
          where:
            editMode === "edit"
              ? { vno: grnHeader.vno, offcode: grnHeader.offcode || "0101" }
              : undefined,
        },
        details: grnDetails.map((row) => {
          const detailData = {
            Itemcode: row.itemCode || "",
            Itemname: row.itemName || "",
            uom: row.unit || "PCS",
            qty: row.thisQty || row.quantity || 0,
            rate: row.rate || 0,
            godownid: parseInt(grnHeader.godownID),
            godownname: grnHeader.godownName,
            saleTaxPer: row.salesTaxPercentage || 0,
            PO: row.poNo || "",
            POpk: row.POpk || 1,
            RO: row.poNo || "",
            ROpk: row.ROpk || 0,
            mfgDate: formatDate(grnHeader.grnDate),
            ExpDate: formatDate(
              row.expiryDate ||
              new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            ),
            freightAmount: row.freightAmount || 0,
          };

          if (row.batchNo) detailData.batchCode = row.batchNo;
          if (row.remarks) detailData.particular = row.remarks;
          if (row.transporter) detailData.transporter = row.transporter;
          if (row.note) detailData.note = row.note;
          if (row.slipLcNo) detailData.slipLcNo = row.slipLcNo;

          return {
            tableName: "invgrndet",
            data: detailData,
            where:
              editMode === "edit"
                ? {
                  vno: grnHeader.vno,
                  offcode: grnHeader.offcode || "0101",
                  Itemcode: row.itemCode || "",
                }
                : undefined,
          };
        }),
        selectedBranch: grnHeader.supplierCity || "Lahore",
      };

      console.log(
        `GRN ${editMode === "edit" ? "Update" : "Insert"} Payload:`,
        JSON.stringify(payload, null, 2)
      );

      const apiUrl =
        editMode === "edit"
          ? `${API_BASE}/update-GRNtable-data`
          : `${API_BASE}/insert-GRNHeadDet`;

      const res = await fetchJson(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.success) {
        let successMsg = `GRN ${editMode === "edit" ? "updated" : "saved"
          } successfully! GRN Number: ${res.vno}`;

        if (res.poUpdates && res.poUpdates.count > 0) {
          successMsg += ` | Updated ${res.poUpdates.count} PO item(s)`;
        } else {
          successMsg += " | No PO items updated (check PO numbers)";
        }

        setSuccessMessage(successMsg);
        setTimeout(() => setSuccessMessage(""), 7000);

        await loadGrnList();
        setIsEditing(false);
        setError(null);
      } else {
        console.error("GRN save response error:", res);
        setError("Operation failed: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      console.error("GRN save error:", err);
      setError("Error saving GRN: " + err.message);
    } finally {
      setLoading(false);
    }
  };



  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setGrnHeader({
      grnNo: "",
      grnDate: new Date().toISOString().split('T')[0],
      supplierCode: "",
      supplierName: "",
      supplierCountry: "",
      supplierCity: "",
      godownID: "",
      godownName: "",
      remarks: "",
      manualRefNo: "",
      status: "Unposted",
      createdby: credentials?.username || "",
      compcode: "01",
      offcode: "0101",
      vtype: "GRN",
      IGPNo: "",
      IGPDate: new Date().toISOString().split('T')[0],
      MTransportCode: "0000000001",
      MLabourCode: "0000000001"
    });
    setGrnDetails([
      {
        itemCode: "",
        itemName: "",
        quantity: 0,
        unit: "PCS",
        rate: 0,
        amount: 0,
        salesTaxPercentage: salesTaxPercentage,
        salesTaxAmount: 0,
        netAmount: 0,
        batchNo: "",
        expiryDate: "",
        remarks: "",
        poNo: "",
        poDate: "",
        alterCode: "",
        saleOrder: "",
        poQty: 0,
        grnQty: 0,
        thisQty: 0,
        value: 0,
        transporter: "",
        freightAmount: 0,
        netValue: 0,
        note: "",
        slipLcNo: "",
        POpk: 1,
        ROpk: 5417
      }
    ]);
    setError(null);
    setShowPOs(false);
    setSelectedPOs([]);
    setSelectedPODetails([]);
    setPdfUrl(null);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGrnList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGrnList.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="grn-container">
        <div className="header-section">
          <h2><FaTruck /> Goods Received Note (GRN) Management</h2>
          <div className="accent-line"></div>
        </div>
        <div className="loading-spinner"></div>
        <p>Loading GRNs...</p>
      </div>
    );
  }

  return (
    <div className="grn-container">
      <div className="header-section">
        <h2><FaTruck /> Goods Received Note (GRN) Management</h2>
        <div className="accent-line"></div>
      </div>

      {error && (
        <div className="error-message">
          <FaExclamationTriangle /> {error}
          <button onClick={() => setError(null)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="grn-form glassmorphism">
          {/* GRN Header Section */}
          <div className="form-section">
            <h3><FaReceipt /> GRN Header</h3>
            <div className="form-row">
              <div className="form-group">
                <label><FaFileAlt /> GRN No</label>
                <input
                  type="text"
                  name="grnNo"
                  value={grnHeader.grnNo}
                  className="modern-input"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label><FaCalendarAlt /> GRN Date *</label>
                <input
                  type="date"
                  name="grnDate"
                  value={grnHeader.grnDate}
                  onChange={handleHeaderChange}
                  className="modern-input"
                  required
                />
              </div>

              <div className="form-group">
                <label><FaUser /> Supplier *</label>
                <select
                  name="supplierCode"
                  value={grnHeader.supplierCode}
                  onChange={handleHeaderChange}
                  className="modern-input"
                  required
                >
                  <option value="">Select Supplier</option>
                  {customers.map(customer => (
                    <option key={customer.CustomerCode} value={customer.CustomerCode}>
                      {customer.CustomerName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaWarehouse /> Godown *</label>
                <select
                  name="godownID"
                  value={grnHeader.godownID}
                  onChange={handleHeaderChange}
                  className="modern-input"
                  required
                >
                  <option value="">Select Godown</option>
                  {godowns.map(godown => (
                    <option key={godown.godownID} value={godown.godownID}>
                      {godown.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label><FaFileAlt /> Manual Ref No.</label>
                <input
                  type="text"
                  name="manualRefNo"
                  value={grnHeader.manualRefNo}
                  onChange={handleHeaderChange}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label><FaFileAlt /> IGP No.</label>
                <input
                  type="text"
                  name="IGPNo"
                  value={grnHeader.IGPNo}
                  onChange={handleHeaderChange}
                  className="modern-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label><FaCalendarAlt /> IGP Date</label>
                <input
                  type="date"
                  name="IGPDate"
                  value={grnHeader.IGPDate}
                  onChange={handleHeaderChange}
                  className="modern-input"
                />
              </div>

              <div className="form-group">
                <label><FaPercent /> Sales Tax %</label>
                <input
                  type="number"
                  value={salesTaxPercentage}
                  onChange={(e) => updateAllSalesTax(parseFloat(e.target.value) || 0)}
                  className="modern-input"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label><FaCodeBranch /> Status</label>
                <input
                  type="text"
                  value={grnHeader.status}
                  className="modern-input"
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <button
                type="button"
                className="btn fetch-po"
                onClick={() => loadPurchaseOrders(grnHeader.supplierCode)}
                disabled={!grnHeader.supplierCode}
              >
                <FaDownload /> Fetch Purchase Orders
              </button>
            </div>
          </div>

          {/* PO Selection Modal */}
          {showPOs && (
            <div className="modal-overlay">
              <div className="modal-content item-select-modal">
                <div className="modal-header">
                  <h2><FaClipboardList /> Item Selection</h2>
                  <button className="modal-close" onClick={() => setShowPOs(false)}>
                    <FaTimesCircle />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="search-container">
                    <div className="top-row">
                      <div className="search-group">
                        <FaSearch className="search-icon" />
                        <input type="text" placeholder="Search items..." />
                      </div>
                      <div className="date-group">
                        <FaCalendarAlt className="input-icon" />
                        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                      </div>
                      <button className="btn-search"><FaSearch /> Search</button>
                    </div>
                  </div>

                  <div className="table-container">
                    {purchaseOrders.length > 0 ? (
                      <table className="item-table">
                        <thead>
                          <tr>
                            <th><FaCheckSquare /> Select</th>
                            <th><FaCalendarAlt /> PO Date</th>
                            <th><FaFileInvoiceDollar /> PO. No</th>
                            <th><FaBarcode /> Code</th>
                            <th><FaBarcode /> AlterCode</th>
                            <th><FaBox /> Item Name</th>
                            <th><FaHashtag /> UOM</th>
                            <th><FaHashtag /> PO Qty</th>
                            <th><FaHashtag /> GRN Qty</th>
                            <th><FaHashtag /> This Qty</th>
                            <th><FaDollarSign /> Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseOrders.map((poGroup, idx) => (
                            poGroup.poDetails
                              // ✅ filter out fully received items
                              .filter(detail => {
                                const poQty = parseFloat(detail.qty?.[0] || 0);
                                const grnQty = parseFloat(detail.Recivedqty?.[0] || 0);
                                return (poQty - grnQty) > 0;
                              })
                              .map((detail, detIdx) => {
                                const poKey = `${poGroup.poHead.vno?.[0]}-${detail.Itemcode?.[0]}`;
                                const isSelected = selectedPODetails.some(p => `${p.poNo}-${p.itemCode}` === poKey);

                                return (
                                  <tr key={detIdx} className={isSelected ? 'selected' : ''}>
                                    <td>
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => togglePOSelection(poGroup.poHead, detail)}
                                      />
                                    </td>
                                    <td>{poGroup.poHead.vdate?.[0]}</td>
                                    <td>{poGroup.poHead.vno?.[0]}</td>
                                    <td>{detail.Itemcode?.[0]}</td>
                                    <td>{detail.Altercode?.[0] || ''}</td>
                                    <td>{detail.Itemname?.[0]}</td>
                                    <td>{detail.uom?.[0]}</td>
                                    <td>{parseFloat(detail.qty?.[0] || 0).toFixed(2)}</td>
                                    <td>{parseFloat(detail.Recivedqty?.[0] || 0).toFixed(2)}</td>
                                    <td>{(parseFloat(detail.qty?.[0] || 0) - parseFloat(detail.Recivedqty?.[0] || 0)).toFixed(2)}</td>
                                    <td>{parseFloat(detail.rate?.[0] || 0).toFixed(2)}</td>
                                  </tr>
                                );
                              })
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="no-data">No purchase orders found</div>
                    )}
                  </div>

                  {/* Selected Items Section */}
                  {selectedPODetails.length > 0 && (
                    <div className="selected-items-section">
                      <h3><FaCheckSquare /> Selected Items</h3>
                      <div className="selected-items-container">
                        <table className="selected-items-table">
                          <thead>
                            <tr>
                              <th><FaTrash /> Delete</th>
                              <th><FaFileInvoiceDollar /> PO. No</th>
                              <th><FaBarcode /> Code</th>
                              <th><FaBox /> Item Name</th>
                              <th><FaHashtag /> PO Qty</th>
                              <th><FaHashtag /> GRN Qty</th>
                              <th><FaHashtag /> This Qty</th>
                              <th><FaDollarSign /> Rate</th>
                              <th><FaShippingFast /> Transporter</th>
                              <th><FaMoneyBillWave /> Freight Amt</th>
                              <th><FaStickyNote /> Note</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPODetails.map((item, idx) => (
                              <tr key={idx}>
                                <td>
                                  <button
                                    type="button"
                                    className="btn-remove"
                                    onClick={() => deletePODetail(idx)}
                                  >
                                    <FaTrash />
                                  </button>
                                </td>
                                <td>{item.poNo}</td>
                                <td>{item.itemCode}</td>
                                <td>{item.itemName}</td>
                                <td>
                                  <input
                                    type="number"
                                    value={item.poQty}
                                    onChange={(e) => updatePODetail(idx, 'poQty', parseFloat(e.target.value) || 0)}
                                    className="qty-input"
                                    step="0.01"
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={item.grnQty}
                                    onChange={(e) => updatePODetail(idx, 'grnQty', parseFloat(e.target.value) || 0)}
                                    className="qty-input"
                                    step="0.01"
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={item.thisQty}
                                    readOnly
                                    className="qty-input"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={item.rate}
                                    readOnly
                                    className="rate-input"
                                    step="0.01"
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    value={item.transporter}
                                    onChange={(e) => updatePODetail(idx, 'transporter', e.target.value)}
                                    className="transporter-input"
                                    placeholder="Transporter"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    value={item.freightAmount}
                                    onChange={(e) => updatePODetail(idx, 'freightAmount', parseFloat(e.target.value) || 0)}
                                    className="freight-input"
                                    step="0.01"
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    value={item.note}
                                    onChange={(e) => updatePODetail(idx, 'note', e.target.value)}
                                    className="note-input"
                                    placeholder="Note"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="footer-container">
                    <button
                      className="submit-btn"
                      type="button"
                      onClick={addPOItemsToGRN}
                    >
                      <FaCheckCircle /> Add Selected to GRN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GRN Details Section */}
          <div className="form-section">
            <div className="section-header">
              <h3><FaBox /> GRN Details</h3>
              <button type="button" className="btn add-row" onClick={addRow}>
                <FaPlus /> Add Row
              </button>
            </div>

            <div className="table-container">
              <table className="grn-details-table">
                <thead>
                  <tr>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th>Tax %</th>
                    <th>Tax Amt</th>
                    <th>Net Amt</th>
                    <th>PO No</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grnDetails.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          name="itemCode"
                          value={row.itemCode}
                          onChange={(e) => handleDetailChange(idx, e)}
                          list="itemCodes"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="itemName"
                          value={row.itemName}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="thisQty"
                          value={row.thisQty || row.quantity}
                          onChange={(e) => handleDetailChange(idx, e)}
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="rate"
                          value={row.rate}
                          onChange={(e) => handleDetailChange(idx, e)}
                          step="0.01"
                          min="0"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={row.amount}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="salesTaxPercentage"
                          value={row.salesTaxPercentage}
                          onChange={(e) => handleDetailChange(idx, e)}
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="salesTaxAmount"
                          value={row.salesTaxAmount}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="netAmount"
                          value={row.netAmount}
                          readOnly
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="poNo"
                          value={row.poNo}
                          onChange={(e) => handleDetailChange(idx, e)}
                        />
                      </td>
                      <td>
                        <button type="button" onClick={() => removeRow(idx)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="2">Total</td>
                    <td>{totalQuantity.toFixed(2)}</td>
                    <td></td>
                    <td>{totalAmount.toFixed(2)}</td>
                    <td></td>
                    <td>{totalSalesTax.toFixed(2)}</td>
                    <td>{totalNetAmount.toFixed(2)}</td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn save" disabled={loading}>
              {loading ? "Processing..." : <><FaSave /> {editMode === "edit" ? "Update" : "Save"} GRN</>}
            </button>
            <button type="button" className="btn cancel" onClick={handleCancel}>
              <FaTimesCircle /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Toolbar */}
          <div className="grn-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search GRNs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-buttons">
              <button
                className={activeFilter === "all" ? "active" : ""}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                className={activeFilter === "posted" ? "active" : ""}
                onClick={() => setActiveFilter("posted")}
              >
                Posted
              </button>
              <button
                className={activeFilter === "unposted" ? "active" : ""}
                onClick={() => setActiveFilter("unposted")}
              >
                Unposted
              </button>
            </div>

            <button className="btn new" onClick={handleNew}>
              <FaPlus /> New GRN
            </button>
          </div>

          {/* GRN List */}
          <div className="grn-list-container">
            <table className="grn-list-table">
              <thead>
                <tr>
                  <th>GRN No</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Godown</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((grn, idx) => (
                  <tr key={idx}>
                    <td>{grn.vno}</td>
                    <td>{grn.vdate}</td>
                    <td>{grn.suppliername}</td>
                    <td>{grn.godownname}</td>
                    <td>{(parseFloat(grn.NetAmount) || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status ${grn.status === 1 ? 'posted' : 'unposted'}`}>
                        {grn.status === 1 ? 'Posted' : 'Unposted'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(grn)}>
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => generatePDF(grn.vno, grn.vockey)}>
                        <FaFilePdf /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* PDF Viewer Modal */}
      {pdfUrl && (
        <div className="modal-overlay">
          <div className="modal-content pdf-modal">
            <div className="modal-header">
              <h3>GRN PDF</h3>
              <button onClick={() => setPdfUrl(null)}>Close</button>
            </div>
            <div className="modal-body">
              <iframe src={pdfUrl} width="100%" height="600px" title="GRN PDF" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GRNScreen;