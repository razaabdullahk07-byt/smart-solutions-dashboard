const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
require("dotenv").config();


const upload = multer({ storage: multer.memoryStorage() });
router.post("/upload-excel", upload.single("excelFile"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded"
      });
    }
      
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    if (!rawRows.length) {
      return res.status(400).json({
        success: false,
        error: "Empty or invalid Excel content"
      });
    }

    const { header, details } = processExcelData(rawRows);

    res.json({
      success: true,
      header,
      details,
      originalFilename: req.file.originalname
    });

  } catch (err) {
    console.error("Excel upload error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to process Excel file",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});
// Excel Download Endpoint
router.post("/download-updated-excel", (req, res) => {
  try {
    const { header, details, originalFilename } = req.body;

    if (!header || !details || !originalFilename) {
      return res.status(400).json({
        success: false,
        error: "Missing required data"
      });
    }

    const excelBuffer = generateUpdatedExcel(header, details);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const downloadFilename = originalFilename.replace('.xlsx', '') +
      `_updated_${timestamp}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${downloadFilename}`);
    res.send(excelBuffer);

  } catch (err) {
    console.error("Excel download error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate Excel file",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Helper Functions
function processExcelData(rawRows) {
  const header = {};
  const details = [];

  // Extract header
  for (const key of headerKeys) {
    header[key] = rawRows[0]?.[key] !== undefined ? rawRows[0][key] : "";
  }

  // Process details
  for (const row of rawRows) {
    const detail = {};

    for (const key of detailKeys) {
      let value = row[key];

      if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
        value = "";
      } else if (key === "hsCode") {
        if (typeof value === "number") {
          value = value.toFixed(4);
        } else {
          const strVal = String(value);
          const parts = strVal.split(".");
          if (parts.length === 2) {
            parts[1] = parts[1].padEnd(4, "0");
            value = parts[0] + "." + parts[1];
          } else {
            value = strVal + ".0000";
          }
        }
      } else if (forceTwoDecimalFields.includes(key)) {
        const num = parseFloat(value);
        value = isNaN(num) ? "" : num.toFixed(2);
      } else if (!isNaN(value) && value !== "") {
        value = parseFloat(value);
      }

      detail[key] = value;
    }

    details.push(detail);
  }

  return { header, details };
}

function generateUpdatedExcel(header, details) {
  const excelData = details.map(item => ({
    ...header,
    ...item
  }));

  const worksheet = xlsx.utils.json_to_sheet(excelData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "InvoiceData");

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Constants
const headerKeys = [
  "invoiceType", "invoiceDate", "sellerNTNCNIC", "sellerBusinessName",
  "sellerProvince", "buyerNTNCNIC", "buyerBusinessName", "buyerProvince",
  "buyerAddress", "sellerAddress", "invoiceRefNo", "buyerRegistrationType", "scenarioId"
];

const detailKeys = [
  "hsCode", "productDescription", "rate", "fixedNotifiedValueOrRetailPrice", "uoM",
  "quantity", "totalValues", "valueSalesExcludingST", "salesTaxApplicable",
  "salesTaxWithheldAtSource", "extraTax", "furtherTax", "sroScheduleNo",
  "fedPayable", "discount", "saleType", "sroItemSerialNo", "fbrInvoiceNumber"
];

const forceTwoDecimalFields = [
  "salesTaxApplicable", "furtherTax", "salesTaxWithheldAtSource",
  "extraTax", "fedPayable", "discount", "rate",
  "fixedNotifiedValueOrRetailPrice", "totalValues", "valueSalesExcludingST"
];

module.exports = router;