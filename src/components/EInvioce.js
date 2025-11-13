import React, { useState, useEffect } from "react";
import "./EInvoice.css";
import {
  FiUpload, FiSearch, FiSend, FiFileText, FiShoppingCart,
  FiDatabase, FiCheckCircle, FiDownload, FiChevronDown, FiChevronUp,
  //FiClock, FiUser, FiHash, FiX
} from "react-icons/fi";
import { FaRegFileExcel } from "react-icons/fa";
import { motion } from "framer-motion";

const excelDateToJSDate = (serial) => {
  if (!serial || isNaN(serial)) return serial;
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);

  if (serial >= 60) {
    serial--;
  }

  return new Date(Math.round((serial - 25569) * 86400 * 1000));
};

const formatDate = (date) => {
  if (!date) return '';
  if (typeof date === 'string') return date;

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return date;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatDateTime = (datetime) => {
  if (!datetime) return '';
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return datetime;

  return d.toLocaleString();
};

const EInvoice = ({ onClose, branch, username }) => {
  const [headerData, setHeaderData] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [error, setError] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceType, setInvoiceType] = useState("INT");
  const [fbrInvoiceRefNo, setFbrInvoiceRefNo] = useState("");
  const [saveResponseRaw, setSaveResponseRaw] = useState("");
  const [dataSource, setDataSource] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [originalFilename, setOriginalFilename] = useState("");
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [fullError, setFullError] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);

  const BASE_URL = "http://192.168.100.113:8081";

  const flatten = (obj) => {
    const flat = {};
    for (const key in obj) {
      let val = Array.isArray(obj[key]) ? obj[key][0] : obj[key];
      if (key === "rate") {
        val = val.toString().includes("%") ? val.toString() : val.toString() + "%";
      }
      flat[key] = val;
    }
    return flat;
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/invoices`);
      const data = await response.json();
      const processedInvoices = data.data.map(invoice => ({
        ...invoice,
        Date: formatDate(invoice.Date)
      }));
      setInvoices(processedInvoices);
    } catch (error) {
      setError("❌ Failed to fetch invoices: " + error.message);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/invoice-submissions`);
      const data = await response.json();
      if (data.success) {
        setSubmissions(data.data);
        setShowSubmissions(true);
      }
    } catch (error) {
      setError("Failed to fetch submissions: " + error.message);
    }
  };

  const fetchBothHeaderAndDetail = async () => {
    setIsLoading(true);
    setError("");
    setFullError(null);
    setFbrInvoiceRefNo("");
    setSaveResponseRaw("");

    try {
      const commonBody = {
        InvoiceNo: invoiceNo,
        InvoiceType: invoiceType,
      };

      const [headRes, detRes] = await Promise.all([
        fetch(`${BASE_URL}/api/get-invoice-xml`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...commonBody, HeadDet: "H" }),
        }),
        fetch(`${BASE_URL}/api/get-invoice-xml`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...commonBody, HeadDet: "D" }),
        })
      ]);

      const [headData, detData] = await Promise.all([headRes.json(), detRes.json()]);

      if (!headData.success) throw new Error("Header API Error: " + (headData.message || headData.error));
      if (!detData.success) throw new Error("Detail API Error: " + (detData.message || detData.error));

      const header = headData.parsedXML?.NewDataSet?.tblINT?.[0] ||
        headData.parsedXML?.NewDataSet?.tblINV?.[0];
      const details = detData.parsedXML?.NewDataSet?.tblINT ||
        detData.parsedXML?.NewDataSet?.tblINV;

      if (!header) throw new Error("No valid header data received.");
      if (!details || details.length === 0) throw new Error("No valid detail data received.");

      const processedHeader = { ...header };
      if (processedHeader.invoiceDate) {
        processedHeader.invoiceDate = formatDate(excelDateToJSDate(processedHeader.invoiceDate));
      }

      setHeaderData(processedHeader);
      setDetailItems(details);
      setDataSource("api");
    } catch (err) {
      setError(err.message);
      setFullError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError("");
    setFullError(null);
    const formData = new FormData();
    formData.append("excelFile", file);

    try {
      const res = await fetch(`${BASE_URL}/api/upload-excel`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const processedHeader = { ...data.header };
      if (processedHeader.invoiceDate) {
        processedHeader.invoiceDate = formatDate(excelDateToJSDate(processedHeader.invoiceDate));
      }

      setHeaderData(processedHeader);
      setDetailItems(data.details);
      setDataSource("excel");
      setOriginalFilename(data.originalFilename);
      setShowDownloadButton(false);
    } catch (err) {
      setError("Excel Upload Error: " + err.message);
      setFullError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendToFBR = async () => {
    setIsLoading(true);
    setError("");
    setFullError(null);
    try {
      const flattenedHeader = flatten(headerData || {});
      const flattenedItems = (detailItems || []).map(flatten);

      const regType = (flattenedHeader.buyerRegistrationType || "").toLowerCase();
      flattenedHeader.scenarioId =
        regType === "registered" ? "SN001" :
          regType === "unregistered" ? "SN005" : "SN007";

      if (flattenedHeader.invoiceDate) {
        const date = new Date(flattenedHeader.invoiceDate);
        if (!isNaN(date.getTime())) {
          const excelSerial = (date.getTime() / (1000 * 60 * 60 * 24)) + 25569;
          flattenedHeader.invoiceDate = excelSerial.toFixed(0);
        }
      }

      const response = await fetch(`${BASE_URL}/api/send-invoice-to-fbr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...flattenedHeader, items: flattenedItems }),
      });

      const result = await response.json();

      const saveResponse = await fetch(`${BASE_URL}/api/save-invoice-submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          invoice_no: invoiceNo,
          invoice_type: invoiceType,
          fbr_invoice_ref_no: result.fbrResponse?.invoiceNumber || "",
          status: result.success ? "success" : "failed",
          response_data: result
        })
      });

      const saveResult = await saveResponse.json();
      if (!saveResult.success) {
        console.error("Failed to save submission record");
      }

      if (!result.success) {
        let errorMessage = "FBR API Error";
        let fullErrorData = result.fbrResponse || result;

        if (result.fbrResponse?.validationResponse) {
          const { statusCode, status, errorCode, error } = result.fbrResponse.validationResponse;
          errorMessage = `FBR Validation Error (Code ${errorCode}): ${error}`;
        }
        else if (result.fbrResponse?.error) {
          errorMessage = `FBR Error: ${result.fbrResponse.error}`;
        }
        else if (result.message) {
          errorMessage = result.message;
        }

        setFullError(fullErrorData);
        throw new Error(errorMessage);
      }

      const invoiceNumber = result.fbrResponse?.invoiceNumber;
      if (!invoiceNumber) throw new Error("FBR returned no invoice number.");

      const updatedDetails = detailItems.map(item => ({
        ...item,
        fbrInvoiceNumber: invoiceNumber
      }));

      setDetailItems(updatedDetails);
      setFbrInvoiceRefNo(invoiceNumber);
      await autoSaveToSmartAPI(invoiceNumber);
      setShowDownloadButton(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadUpdatedExcel = async () => {
    try {
      setIsLoading(true);
      setError("");
      setFullError(null);

      const excelHeader = { ...headerData };
      if (excelHeader.invoiceDate) {
        const date = new Date(excelHeader.invoiceDate);
        if (!isNaN(date.getTime())) {
          const excelSerial = (date.getTime() / (1000 * 60 * 60 * 24)) + 25569;
          excelHeader.invoiceDate = excelSerial;
        }
      }

      const response = await fetch(`${BASE_URL}/api/download-updated-excel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          header: excelHeader,
          details: detailItems,
          originalFilename: originalFilename
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const contentDisposition = response.headers.get('Content-Disposition');
      const fallbackFilename = "Updated-Invoice.xlsx";

      let filename = fallbackFilename;
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition.split("filename=")[1].replace(/"/g, '');
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError("Download Error: " + err.message);
      setFullError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveToSmartAPI = async (invoiceNumber) => {
    try {
      const response = await fetch(`${BASE_URL}/api/save-invoice-fbr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          InvoiceNo: invoiceNo,
          InvoiceType: invoiceType,
          FBRInvoiceRefNo: invoiceNumber,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error("Save API Error: " + (result.message || "Unknown"));

      setSaveResponseRaw(result.rawXML || "Invoice saved successfully.");
    } catch (err) {
      setError("Save API Error: " + err.message);
      setFullError(err);
    }
  };

  const toggleErrorDetails = () => {
    setShowErrorDetails(!showErrorDetails);
  };

  return (
    <div className="einvoice-modal">
      <div className="modal-header">
        <h2>E-Invoice System</h2>
        {/* <button onClick={onClose} className="close-btn">
          <FiX />
        </button> */}
      </div>

      <div className="modal-content">
        <div className="search-section">
          <div className="input-group">
            <input
              placeholder="Enter Invoice No"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              className="invoice-input"
            />
            <select
              value={invoiceType}
              onChange={(e) => setInvoiceType(e.target.value)}
              className="invoice-select"
            >
              <option value="INT">INT</option>
              <option value="INV">INV</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchBothHeaderAndDetail}
              className="search-btn"
              disabled={isLoading}
            >
              <FiSearch className="btn-icon" />
              {isLoading ? "Loading..." : "Fetch Invoice"}
            </motion.button>
          </div>

          <div className="file-actions">
            <label className="excel-upload-btn">
              <motion.div whileHover={{ scale: 1.03 }} className="upload-content">
                <FaRegFileExcel className="excel-icon" />
                <span>Upload Excel</span>
                <FiUpload className="upload-icon" />
              </motion.div>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleExcelUpload}
                style={{ display: "none" }}
              />
            </label>
            <a
              href="http://192.168.100.113/FBR_Application_E-Invoice/Excel-Format.xlsx"
              download
              className="download-template-btn"
            >
              <motion.div whileHover={{ scale: 1.03 }} className="upload-content">
                <FaRegFileExcel className="excel-icon" />
                <span>Download Format</span>
              </motion.div>
            </a>
          </div>
        </div>

        {(error || fullError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="error-message"
          >
            <div className="error-summary">
              {error}
              <button onClick={toggleErrorDetails} className="error-details-toggle">
                {showErrorDetails ? <FiChevronUp /> : <FiChevronDown />}
                {showErrorDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {showErrorDetails && fullError && (
              <pre className="error-details">
                {JSON.stringify(fullError, null, 2)}
              </pre>
            )}
          </motion.div>
        )}

        <div className="data-sections">
          {headerData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="header-section"
            >
              <div className="section-header">
                <FiFileText className="section-icon" />
                <h3>Invoice Header</h3>
                {dataSource && (
                  <span className={`data-source ${dataSource}`}>
                    {dataSource === "excel" ? (
                      <><FaRegFileExcel /> Excel File</>
                    ) : (
                      <><FiDatabase /> API</>
                    )}
                  </span>
                )}
              </div>
              <div className="header-grid">
                {Object.entries(headerData).map(([key, value]) => (
                  <div key={key} className="header-item">
                    <div className="header-key">{key}</div>
                    <div className="header-value">
                      {Array.isArray(value) ? value[0] || "null" : value || "null"}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {detailItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="details-section"
            >
              <div className="section-header">
                <FiShoppingCart className="section-icon" />
                <h3>Invoice Details</h3>
                <div className="action-buttons">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={sendToFBR}
                    className="send-btn"
                    disabled={isLoading}
                  >
                    <FiSend className="btn-icon" />
                    {isLoading ? "Processing..." : "Send to FBR"}
                  </motion.button>

                  {showDownloadButton && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={downloadUpdatedExcel}
                      className="download-btn"
                      disabled={isLoading}
                    >
                      <FiDownload className="btn-icon" />
                      {isLoading ? "Preparing..." : "Download Excel"}
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="details-container">
                <div className="details-table-container">
                  <table className="details-table">
                    <thead>
                      <tr>
                        {Object.keys(detailItems[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detailItems.map((item, i) => (
                        <tr key={i}>
                          {Object.keys(item).map((key) => (
                            <td key={key}>
                              {item[key] === null || item[key] === undefined ? "" : item[key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {fbrInvoiceRefNo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="fbr-ref-section"
            >
              <div className="section-header">
                <FiCheckCircle className="section-icon success" />
                <h3>FBR Invoice Reference</h3>
              </div>
              <div className="fbr-ref-box">
                <div className="fbr-ref-label">FBR Invoice No:</div>
                <div className="fbr-ref-value">{fbrInvoiceRefNo}</div>
              </div>
            </motion.div>
          )}

          {saveResponseRaw && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="response-section"
            >
              <div className="section-header">
                <FiDatabase className="section-icon" />
                <h3>API Response</h3>
              </div>
              <pre className="response-raw">{saveResponseRaw}</pre>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EInvoice;