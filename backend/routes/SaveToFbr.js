const express = require("express");
const soap = require("soap");
const router = express.Router();
require("dotenv").config();



router.post("/save-invoice-fbr", async (req, res) => {
  const { InvoiceNo, InvoiceType, FBRInvoiceRefNo } = req.body;

  try {
    const client = await soap.createClientAsync(req.apiEndpoint);
    const [result] = await client.SaveInvoiceFBRAsync({
      InvoiceNo,
      InvoiceType,
      FBRInvoiceRefNo
    });

    const rawXML = result?.SaveInvoiceFBRResult?.$value || result?.SaveInvoiceFBRResult;

    if (!rawXML?.trim()?.startsWith("<")) {
      return res.status(500).json({
        success: false,
        error: "Invalid/empty SOAP response",
        raw: rawXML
      });
    }

    res.json({
      success: true,
      rawXML
    });
  } catch (err) {
    console.error("save-invoice-fbr error:", err.message);
    res.status(500).json({
      success: false,
      error: "SOAP request failed",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});
module.exports = router;