
// // fullmenu.js
// const express = require('express');
// const router = express.Router();
// const soap = require("soap");
// const xml2js = require("xml2js");
// const fs = require("fs");
// const path = require("path");

// // Global token store (in-memory)
// global.fbrTokens = {
//   companyToken: null
// };

// router.post("/get-full-menu", async (req, res) => {
//   const { username, userpassword, Menuid = "01", nooftables = "3" } = req.body;

//   try {
//     if (!req.apiEndpoint) {
//       return res.status(500).json({
//         success: false,
//         error: "API endpoint is not configured"
//       });
//     }

//     const client = await soap.createClientAsync(req.apiEndpoint);
//     const [result] = await client.GetMenuDataSetXMLAsync({
//       username,
//       userpassword,
//       Menuid,
//       nooftables
//     });

//     let rawXML = null;
//     if (result?.GetMenuDataSetXMLResult?.$value) {
//       rawXML = result.GetMenuDataSetXMLResult.$value;
//     } else if (typeof result?.GetMenuDataSetXMLResult === "string") {
//       rawXML = result.GetMenuDataSetXMLResult;
//     } else if (result?.GetMenuDataSetXMLResult && typeof result.GetMenuDataSetXMLResult === "object") {
//       if (result.GetMenuDataSetXMLResult._) {
//         rawXML = result.GetMenuDataSetXMLResult._;
//       } else if (result.GetMenuDataSetXMLResult.value) {
//         rawXML = result.GetMenuDataSetXMLResult.value;
//       } else {
//         return res.status(500).json({
//           success: false,
//           error: "SOAP response is not a string",
//           type: typeof result.GetMenuDataSetXMLResult,
//           raw: result.GetMenuDataSetXMLResult
//         });
//       }
//     }

//     if (Buffer.isBuffer(rawXML)) {
//       rawXML = rawXML.toString("utf-8");
//     }
//     if (typeof rawXML !== "string") {
//       return res.status(500).json({
//         success: false,
//         error: "SOAP response is not a string",
//         type: typeof rawXML,
//         raw: rawXML
//       });
//     }

//     rawXML = rawXML.trim();
//     if (!rawXML.startsWith("<")) {
//       return res.status(500).json({
//         success: false,
//         error: "Invalid/empty SOAP XML response",
//         raw: rawXML
//       });
//     }

//     xml2js.parseString(rawXML, (err, parsed) => {
//       if (err) {
//         console.error("XML parse error:", err);
//         return res.status(500).json({
//           success: false,
//           error: "Failed to parse XML",
//           details: err.message
//         });
//       }

//       const ds = parsed?.DataSet || parsed?.NewDataSet || {};
//       const t1 = ds.tbl1?.[0] || ds.tbl1 || {};
//       const t2 = ds.tbl2 || [];
//       const t3 = ds.tbl3 || [];

//       const company = {
//         name: t1?.offdesc?.[0] || "",
//         code: t1?.offcode?.[0] || "",
//         offcode: t1?.offcode?.[0] || "",
//         offdesc: t1?.offdesc?.[0] || "",
//         token: t1?.FBRToken?.[0] || ""
//       };

//       // ✅ Store token globally for later use
//       global.fbrTokens.companyToken = company.token;

//       // ✅ Also update .env file
//       if (company.token) {
//         try {
//           const envPath = path.join(__dirname, "../.env");
//           let envContent = fs.readFileSync(envPath, "utf8");

//           // Replace existing token or add if not exists
//           if (/^FBR_API_TOKEN=.*/m.test(envContent)) {
//             envContent = envContent.replace(/^FBR_API_TOKEN=.*/m, `FBR_API_TOKEN=${company.token}`);
//           } else {
//             envContent += `\nFBR_API_TOKEN=${company.token}`;
//           }

//           fs.writeFileSync(envPath, envContent, "utf8");

//           // Update runtime env variable
//           process.env.FBR_API_TOKEN = company.token;

//           console.log(`✅ Updated .env with new FBR_API_TOKEN: ${company.token}`);
//         } catch (fileErr) {
//           console.error("Failed to update .env:", fileErr);
//         }
//       }

//       const branches = Array.isArray(t2)
//         ? t2.map(item => ({
//             branch: item.bname?.[0] || "",
//             code: item.bcode?.[0] || "",
//             offcode: item.offcode?.[0] || "",
//             token: item.FBRToken?.[0] || ""
//           }))
//         : [];

//       const menu = Array.isArray(t3)
//         ? t3.map(item => ({
//             id: item.Menuid?.[0],
//             title: item.MenuTitle?.[0],
//             url: item.MenuURL?.[0] || "#",
//             parentId: item.ParentId?.[0]
//           }))
//         : [];

//       res.json({
//         success: true,
//         data: { company, branches, menu }
//       });
//     });
//   } catch (err) {
//     console.error("get-full-menu error:", err);
//     res.status(500).json({
//       success: false,
//       error: "SOAP request failed",
//       details: err.message,
//       stack: process.env.NODE_ENV === "development" ? err.stack : undefined
//     });
//   }
// });

// module.exports = router;
// fullmenu.js
const express = require("express");
const router = express.Router();
const soap = require("soap");
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");

// Global token store (in-memory)
global.fbrTokens = {
  companyToken: null
};

// Utility function to parse XML with retry logic
const parseXmlWithRetry = async (xmlString, maxRetries = 3, retryCount = 0) => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xmlString.trim(), (err, parsed) => {
      if (err) {
        if (retryCount < maxRetries) {
          console.warn(`Retrying XML parse (${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            resolve(parseXmlWithRetry(xmlString, maxRetries, retryCount + 1));
          }, 100 * (retryCount + 1));
        } else {
          reject(err);
        }
      } else {
        resolve(parsed);
      }
    });
  });
};

// Utility function to update environment file
const updateEnvFile = (token) => {
  try {
    const envPath = path.join(__dirname, "../.env");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
    }

    if (/^FBR_API_TOKEN=.*/m.test(envContent)) {
      envContent = envContent.replace(
        /^FBR_API_TOKEN=.*/m,
        `FBR_API_TOKEN=${token}`
      );
    } else {
      envContent += `\nFBR_API_TOKEN=${token}`;
    }

    fs.writeFileSync(envPath, envContent, "utf8");
    process.env.FBR_API_TOKEN = token;

    console.log(`✅ Updated FBR_API_TOKEN in .env`);
  } catch (fileErr) {
    console.error("Failed to update .env:", fileErr);
  }
};

// Main route handler
router.post("/get-full-menu", async (req, res) => {
  const { username, userpassword, Menuid = "01", nooftables = "3" } = req.body;

  try {
    if (!req.apiEndpoint) {
      return res.status(500).json({
        success: false,
        error: "API endpoint is not configured"
      });
    }

    const client = await soap.createClientAsync(req.apiEndpoint);
    const [result] = await client.GetMenuDataSetXMLAsync({
      username,
      userpassword,
      Menuid,
      nooftables
    });

    let rawXML = null;
    if (result?.GetMenuDataSetXMLResult?.$value) {
      rawXML = result.GetMenuDataSetXMLResult.$value;
    } else if (typeof result?.GetMenuDataSetXMLResult === "string") {
      rawXML = result.GetMenuDataSetXMLResult;
    } else if (result?.GetMenuDataSetXMLResult && typeof result.GetMenuDataSetXMLResult === "object") {
      rawXML =
        result.GetMenuDataSetXMLResult._ ||
        result.GetMenuDataSetXMLResult.value ||
        null;
    }

    if (Buffer.isBuffer(rawXML)) {
      rawXML = rawXML.toString("utf-8");
    }

    if (typeof rawXML !== "string" || !rawXML.trim().startsWith("<")) {
      return res.status(500).json({
        success: false,
        error: "Invalid/empty SOAP XML response",
        raw: rawXML
      });
    }

    // Parse XML with retry logic
    const parsed = await parseXmlWithRetry(rawXML);
    const ds = parsed?.DataSet || parsed?.NewDataSet || {};
    const t1 = ds.tbl1?.[0] || ds.tbl1 || {};
    const t2 = ds.tbl2 || [];
    const t3 = ds.tbl3 || [];

    const company = {
      name: t1?.offdesc?.[0] || "",
      code: t1?.offcode?.[0] || "",
      offcode: t1?.offcode?.[0] || "",
      offdesc: t1?.offdesc?.[0] || "",
      token: t1?.FBRToken?.[0] || ""
    };

    // ✅ Store token globally
    global.fbrTokens.companyToken = company.token;

    // ✅ Save to .env file if token exists
    if (company.token) {
      updateEnvFile(company.token);
    }

    const branches = Array.isArray(t2)
      ? t2.map((item) => ({
          branch: item.bname?.[0] || "",
          code: item.bcode?.[0] || "",
          offcode: item.offcode?.[0] || "",
          token: item.FBRToken?.[0] || ""
        }))
      : [];

    const menu = Array.isArray(t3)
      ? t3.map((item) => ({
          id: item.Menuid?.[0],
          title: item.MenuTitle?.[0],
          url: item.MenuURL?.[0] || "#",
          parentId: item.ParentId?.[0]
        }))
      : [];

    return res.json({
      success: true,
      data: { company, branches, menu }
    });
  } catch (err) {
    console.error("get-full-menu error:", err);
    return res.status(500).json({
      success: false,
      error: "SOAP request failed",
      details: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
});

module.exports = router;
