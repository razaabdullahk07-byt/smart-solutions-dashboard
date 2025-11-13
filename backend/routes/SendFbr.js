const express = require('express');
const router = express.Router();
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
router.use(cors({ origin: "*", methods: "GET,POST" }));
router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
router.post("/send-invoice-to-fbr", async (req, res) => {
    const invoicePayload = req.body;
console.log("🔑 Token being sent to FBR:", process.env.FBR_API_TOKEN);
    try {
        const response = await axios.post(
            "https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb",
            invoicePayload,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.FBR_API_TOKEN}`
                },
                timeout: 30000,
                responseType: 'text'  // ✅ force plain text to avoid crashing on HTML
            }
        );
        let data;
        try {
            data = JSON.parse(response.data); // try parsing as JSON
        } catch (parseError) {
            // If it fails, it's HTML, not JSON
            console.error("FBR returned HTML instead of JSON:", response.data.slice(0, 300));
            return res.status(502).json({
                success: false,
                message: "FBR returned invalid response (likely HTML)",
                error: "Invalid JSON from FBR",
                htmlPreview: response.data.slice(0, 300) // just first part for debugging
            });
        }

        // Check for FBR validation errors
        if (data.validationResponse?.status === "Invalid") {
            return res.status(400).json({
                success: false,
                fbrResponse: data,
                message: data.validationResponse.error || "FBR validation failed",
                validationError: true,
                errorCode: data.validationResponse.errorCode,
                statusCode: data.validationResponse.statusCode,
                timestamp: data.dated
            });
        }

        // Check for other FBR errors
        if (data.error) {
            return res.status(400).json({
                success: false,
                fbrResponse: data,
                message: data.error,
                errorCode: data.errorCode || "FBR_ERROR",
                timestamp: data.dated
            });
        }

        // Successful response
        res.json({
            success: true,
            fbrResponse: data, // ✅ fixed here
            message: "Invoice successfully processed by FBR",
            invoiceNumber: data.invoiceNumber,
            timestamp: data.dated
        });


    } catch (err) {
        console.error("FBR API Error:", err.response?.data || err.message);

        // Extract error details
        const fbrError = err.response?.data;
        let errorMessage = "Failed to send invoice to FBR";
        let errorCode = "FBR_API_ERROR";
        let statusCode = 500;

        if (fbrError?.validationResponse) {
            errorMessage = fbrError.validationResponse.error || "FBR validation failed";
            errorCode = fbrError.validationResponse.errorCode || "VALIDATION_ERROR";
            statusCode = 400;
        } else if (fbrError?.error) {
            errorMessage = fbrError.error;
            errorCode = fbrError.errorCode || "FBR_ERROR";
            statusCode = 400;
        } else if (err.response?.status === 401) {
            errorMessage = "Unauthorized: Invalid FBR API token";
            errorCode = "AUTH_ERROR";
            statusCode = 401;
        } else if (err.code === "ECONNABORTED") {
            errorMessage = "FBR API timeout: The request took too long";
            errorCode = "TIMEOUT";
            statusCode = 504;
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: fbrError || err.message,
            fbrResponse: fbrError,
            errorCode,
            statusCode,
            timestamp: fbrError?.dated || new Date().toISOString(),
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
module.exports = router;

// sendfbr.js
// const express = require('express');
// const router = express.Router();
// const axios = require("axios");
// const cors = require("cors");
// const bodyParser = require("body-parser");

// router.use(cors({ origin: "*", methods: "GET,POST" }));
// router.use(bodyParser.json({ limit: '10mb' }));
// router.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// router.post("/send-invoice-to-fbr", async (req, res) => {
//     const invoicePayload = req.body;

//     try {
//         // ✅ Get token from memory (set by fullmenu.js)
//         const token = global.fbrTokens?.companyToken;
//         console.log("🔑 Token being sent to FBR:", token);

//         if (!token) {
//             return res.status(400).json({
//                 success: false,
//                 message: "FBR token not available. Please call /get-full-menu first."
//             });
//         }

//         const response = await axios.post(
//             "https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb",
//             invoicePayload,
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}` // ✅ use dynamic token
//                 },
//                 timeout: 30000,
//                 responseType: 'text'
//             }
//         );

//         let data;
//         try {
//             data = JSON.parse(response.data);
//         } catch {
//             console.error("FBR returned HTML instead of JSON:", response.data.slice(0, 300));
//             return res.status(502).json({
//                 success: false,
//                 message: "FBR returned invalid response (likely HTML)",
//                 error: "Invalid JSON from FBR",
//                 htmlPreview: response.data.slice(0, 300)
//             });
//         }

//         if (data.validationResponse?.status === "Invalid") {
//             return res.status(400).json({
//                 success: false,
//                 fbrResponse: data,
//                 message: data.validationResponse.error || "FBR validation failed",
//                 validationError: true,
//                 errorCode: data.validationResponse.errorCode,
//                 statusCode: data.validationResponse.statusCode,
//                 timestamp: data.dated
//             });
//         }

//         if (data.error) {
//             return res.status(400).json({
//                 success: false,
//                 fbrResponse: data,
//                 message: data.error,
//                 errorCode: data.errorCode || "FBR_ERROR",
//                 timestamp: data.dated
//             });
//         }

//         res.json({
//             success: true,
//             fbrResponse: data,
//             message: "Invoice successfully processed by FBR",
//             invoiceNumber: data.invoiceNumber,
//             timestamp: data.dated
//         });

//     } catch (err) {
//         console.error("FBR API Error:", err.response?.data || err.message);
//         const fbrError = err.response?.data;
//         let errorMessage = "Failed to send invoice to FBR";
//         let errorCode = "FBR_API_ERROR";
//         let statusCode = 500;

//         if (fbrError?.validationResponse) {
//             errorMessage = fbrError.validationResponse.error || "FBR validation failed";
//             errorCode = fbrError.validationResponse.errorCode || "VALIDATION_ERROR";
//             statusCode = 400;
//         } else if (fbrError?.error) {
//             errorMessage = fbrError.error;
//             errorCode = fbrError.errorCode || "FBR_ERROR";
//             statusCode = 400;
//         } else if (err.response?.status === 401) {
//             errorMessage = "Unauthorized: Invalid FBR API token";
//             errorCode = "AUTH_ERROR";
//             statusCode = 401;
//         } else if (err.code === "ECONNABORTED") {
//             errorMessage = "FBR API timeout: The request took too long";
//             errorCode = "TIMEOUT";
//             statusCode = 504;
//         }

//         res.status(statusCode).json({
//             success: false,
//             message: errorMessage,
//             error: fbrError || err.message,
//             fbrResponse: fbrError,
//             errorCode,
//             statusCode,
//             timestamp: fbrError?.dated || new Date().toISOString(),
//             stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
//         });
//     }
// });

// module.exports = router;
