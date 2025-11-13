const express = require('express');
const router = express.Router();
const xml2js = require("xml2js");
const soap = require("soap");
router.post("/get-invoice-xml", async (req, res) => {
  const { InvoiceNo, InvoiceType, HeadDet } = req.body;

  try {
    const client = await soap.createClientAsync(req.apiEndpoint);
    const [result] = await client.GetInvoiceXMLAsync({
      InvoiceNo,
      InvoiceType,
      HeadDet
    });

    const rawXML = result?.GetInvoiceXMLResult?.$value || result?.GetInvoiceXMLResult;

    if (!rawXML?.trim()?.startsWith("<")) {
      return res.status(500).json({
        success: false,
        error: "Invalid/empty SOAP response",
        raw: rawXML
      });
    }

    xml2js.parseString(rawXML, (err, parsed) => {
      if (err) {
        console.error("XML parse error:", err);
        return res.status(500).json({
          success: false,
          error: "Failed to parse XML",
          details: err.message
        });
      }

      res.json({
        success: true,
        rawXML,
        parsedXML: parsed
      });
    });
  } catch (err) {
    console.error("get-invoice-xml error:", err.message);
    res.status(500).json({
      success: false,
      error: "SOAP request failed",
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});
module.exports = router;