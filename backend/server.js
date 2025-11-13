const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const soap = require("soap");
// const connectTomongoose = require('./db');
const axios = require("axios");
const config = require("./config");
const path = require("path");
// const mysql = require("mysql");
// const db = require('./db');
const multer = require("multer");
const xlsx = require("xlsx");
require("dotenv").config();
const FullMenuRouter = require('./routes/FullMenu');
const GetInvoiceRouter = require('./routes/GetInvoice');
const SendFbrRouter = require('./routes/SendFbr');
const SaveToFbrRouter = require('./routes/SaveToFbr');
const UploadExcelRouter = require('./routes/UploadExcel');
const DownloadUploadExcelRouter = require('./routes/UploadExcel');
const gettableheaders = require('./routes/fetch');
const tableRoutes = require("./routes/fetch");
const app = express();
app.use(express.json()); 

// // Middleware
app.use(cors({ origin: "*", methods: "GET,POST" }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// app.use(express.static(path.join(__dirname, "build")));

// // Routes
// const invoiceRoutes = require("./routes/invoice");
// app.use("/api", invoiceRoutes);

// API Endpoint Configuration
app.use((req, res, next) => {
  req.apiEndpoint = config.endpoints[config.activeApi];
  next();
});
// connectTomongoose();
// Database Test Endpoint
// app.get("/test-db", (req, res) => {
//   db.query("SELECT NOW() AS currentTime", (err, result) => {
//     if (err) return res.status(500).send("❌ DB Error");
//     res.send("✅ DB time is: " + result[0].currentTime);
//   });
// });

// Invoice Endpoints
// app.get("/api/invoices", (req, res) => {
//   db.query("SELECT * FROM einvoices", (err, results) => {
//     if (err) {
//       console.error("❌ Failed to fetch invoices:", err);
//       return res.status(500).json({ 
//         success: false, 
//         message: "DB error",
//         error: err.message,
//         stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//       });
//     }

//     const formattedResults = results.map(invoice => {
//       if (invoice.Date) {
//         const date = new Date(invoice.Date);
//         invoice.Date = date.toISOString().split('T')[0];
//       }
//       return invoice;
//     });

//     res.json({ 
//       success: true, 
//       data: formattedResults 
//     });
//   });
// });

// // Save Invoice Submission Record
// app.post("/api/save-invoice-submission", (req, res) => {
//   const {
//     username,
//     invoice_no,
//     invoice_type,
//     fbr_invoice_ref_no,
//     status,
//     response_data
//   } = req.body;

//   const submission_date = new Date().toISOString().slice(0, 19).replace('T', ' ');
//   const fbr_response_time = new Date().toISOString().slice(0, 19).replace('T', ' ');

//   const query = `
//     INSERT INTO invoice_submissions 
//     (username, invoice_no, invoice_type, fbr_invoice_ref_no, submission_date, fbr_response_time, status, response_data)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//   `;

//   db.query(query, [
//     username,
//     invoice_no,
//     invoice_type,
//     fbr_invoice_ref_no,
//     submission_date,
//     fbr_response_time,
//     status,
//     JSON.stringify(response_data)
//   ], (err, result) => {
//     if (err) {
//       console.error("❌ Failed to save invoice submission:", err);
//       return res.status(500).json({ 
//         success: false, 
//         message: "Failed to save submission record",
//         error: err.message 
//       });
//     }
//     res.json({ success: true, id: result.insertId });
//   });
// });

// // Get Invoice Submissions
// app.get("/api/invoice-submissions", (req, res) => {
//   const query = `
//     SELECT 
//       id,
//       username,
//       invoice_no,
//       invoice_type,
//       fbr_invoice_ref_no,
//       DATE_FORMAT(submission_date, '%Y-%m-%d %H:%i:%s') as submission_date,
//       DATE_FORMAT(fbr_response_time, '%Y-%m-%d %H:%i:%s') as fbr_response_time,
//       status,
//       response_data,
//       DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
//     FROM invoice_submissions
//     ORDER BY created_at DESC
//     LIMIT 100
//   `;

//   db.query(query, (err, results) => {
//     if (err) {
//       console.error("❌ Failed to fetch invoice submissions:", err);
//       return res.status(500).json({ 
//         success: false, 
//         message: "Failed to fetch submissions",
//         error: err.message 
//       });
//     }

//     // Parse JSON response data
//     const parsedResults = results.map(row => ({
//       ...row,
//       response_data: row.response_data ? JSON.parse(row.response_data) : null
//     }));

//     res.json({ success: true, data: parsedResults });
//   });
// });

// Menu Endpoint

// Invoice XML Endpoint

app.use('/api', FullMenuRouter);
app.use('/api', GetInvoiceRouter);
app.use('/api', SendFbrRouter);
app.use('/api',SaveToFbrRouter);
app.use('/api',UploadExcelRouter);
app.use('/api',DownloadUploadExcelRouter);
app.use('/api',gettableheaders);
app.use('/api', tableRoutes);
// const upload = multer({ storage: multer.memoryStorage() });
// app.post("/api/upload-excel", upload.single("excelFile"), (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         error: "No file uploaded"
//       });
//     }

//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

//     if (!rawRows.length) {
//       return res.status(400).json({
//         success: false,
//         error: "Empty or invalid Excel content"
//       });
//     }

//     const { header, details } = processExcelData(rawRows);

//     res.json({
//       success: true,
//       header,
//       details,
//       originalFilename: req.file.originalname
//     });

//   } catch (err) {
//     console.error("Excel upload error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to process Excel file",
//       details: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// });

// // Excel Download Endpoint
// app.post("/api/download-updated-excel", (req, res) => {
//   try {
//     const { header, details, originalFilename } = req.body;

//     if (!header || !details || !originalFilename) {
//       return res.status(400).json({
//         success: false,
//         error: "Missing required data"
//       });
//     }

//     const excelBuffer = generateUpdatedExcel(header, details);

//     const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
//     const downloadFilename = originalFilename.replace('.xlsx', '') +
//       `_updated_${timestamp}.xlsx`;

//     res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//     res.setHeader('Content-Disposition', `attachment; filename=${downloadFilename}`);
//     res.send(excelBuffer);

//   } catch (err) {
//     console.error("Excel download error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to generate Excel file",
//       details: err.message,
//       stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//     });
//   }
// });

// // Helper Functions
// function processExcelData(rawRows) {
//   const header = {};
//   const details = [];

//   // Extract header
//   for (const key of headerKeys) {
//     header[key] = rawRows[0]?.[key] !== undefined ? rawRows[0][key] : "";
//   }

//   // Process details
//   for (const row of rawRows) {
//     const detail = {};

//     for (const key of detailKeys) {
//       let value = row[key];

//       if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
//         value = "";
//       } else if (key === "hsCode") {
//         if (typeof value === "number") {
//           value = value.toFixed(4);
//         } else {
//           const strVal = String(value);
//           const parts = strVal.split(".");
//           if (parts.length === 2) {
//             parts[1] = parts[1].padEnd(4, "0");
//             value = parts[0] + "." + parts[1];
//           } else {
//             value = strVal + ".0000";
//           }
//         }
//       } else if (forceTwoDecimalFields.includes(key)) {
//         const num = parseFloat(value);
//         value = isNaN(num) ? "" : num.toFixed(2);
//       } else if (!isNaN(value) && value !== "") {
//         value = parseFloat(value);
//       }

//       detail[key] = value;
//     }

//     details.push(detail);
//   }

//   return { header, details };
// }

// function generateUpdatedExcel(header, details) {
//   const excelData = details.map(item => ({
//     ...header,
//     ...item
//   }));

//   const worksheet = xlsx.utils.json_to_sheet(excelData);
//   const workbook = xlsx.utils.book_new();
//   xlsx.utils.book_append_sheet(workbook, worksheet, "InvoiceData");

//   return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
// }

// // Constants
// const headerKeys = [
//   "invoiceType", "invoiceDate", "sellerNTNCNIC", "sellerBusinessName",
//   "sellerProvince", "buyerNTNCNIC", "buyerBusinessName", "buyerProvince",
//   "buyerAddress", "sellerAddress", "invoiceRefNo", "buyerRegistrationType", "scenarioId"
// ];

// const detailKeys = [
//   "hsCode", "productDescription", "rate", "fixedNotifiedValueOrRetailPrice", "uoM",
//   "quantity", "totalValues", "valueSalesExcludingST", "salesTaxApplicable",
//   "salesTaxWithheldAtSource", "extraTax", "furtherTax", "sroScheduleNo",
//   "fedPayable", "discount", "saleType", "sroItemSerialNo", "fbrInvoiceNumber"
// ];

// const forceTwoDecimalFields = [
//   "salesTaxApplicable", "furtherTax", "salesTaxWithheldAtSource",
//   "extraTax", "fedPayable", "discount", "rate",
//   "fixedNotifiedValueOrRetailPrice", "totalValues", "valueSalesExcludingST"
// ];

// Fallback Route
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

// Start Server
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`✅ Server running at http://${config.serverIp}:${config.port}`);
    console.log(`🔌 Active API: ${config.activeApi} (${config.endpoints[config.activeApi]})`);
  });
}

module.exports = app;
