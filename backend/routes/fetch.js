const express = require("express");
const router = express.Router();
const soap = require("soap");
const { parseStringPromise } = require("xml2js");
const axios = require("axios");
const FULL_MENU_URL = "http://192.168.100.113:8081/api/get-full-menu";
const WSDL_URL = "http://192.168.100.103/smartapi/service.asmx?wsdl";
// ----------------- UTILITY FUNCTIONS -----------------
const utils = {
  // Guess type (used only for front-end display)
  guessType: function (value) {
    if (value === null || value === undefined || value === "") {
      return "string"; // default type for empty values
    }

    const strVal = String(value); // convert anything to string
    const lower = strVal.toLowerCase();

    if (lower === "true" || lower === "false") return "boolean";
    if (/^-?\d+$/.test(strVal)) return "int";
    if (/^-?\d*\.\d+$/.test(strVal)) return "decimal";
    if (/^\d{4}-\d{2}-\d{2}(T|$)/.test(strVal)) return "date";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(strVal)) return "datetime";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2}|Z)$/.test(strVal)) return "datetime-tz";

    return "string";
  },

  // Build insert query
  buildInsertQuery: function (tableName, rows) {
    const fields = Object.keys(rows[0]).join(", ");
    const values = rows
      .map(row =>
        Object.values(row)
          .map(v => {
            if (v === null || v === undefined) return "NULL";
            if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
            if (typeof v === "boolean") return v ? 1 : 0;
            return v;
          })
          .join(", ")
      )
      .map(v => `(${v})`)
      .join(", ");
    return `INSERT INTO ${tableName} (${fields}) VALUES ${values};`;
  },

  // Format date for SQL
  formatDateForSQL: function (date = new Date()) {
    const pad = (n) => (n < 10 ? "0" + n : n);
    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    );
  },

  // Execute SOAP query
  executeSoapQuery: async function (query, wsdlUrl = "http://192.168.100.103/smartapi/service.asmx?wsdl") {
    try {
      const client = await soap.createClientAsync(wsdlUrl);
      const [result] = await client.GetSP_DataTableXMLAsync({ Query: query });

      const rawXML = result.GetSP_DataTableXMLResult?.$value || result.GetSP_DataTableXMLResult;
      const parsed = await parseStringPromise(rawXML);

      return parsed.NewDataSet?.Table || [];
    } catch (error) {
      console.error("SOAP query execution error:", error);
      throw error;
    }
  },

  // Get company data recursively
  getCompanyData: async function (maxRetries = 3, retryCount = 0) {
    try {
      const fullMenuRes = await axios.post(
        "http://192.168.100.113:8081/api/get-full-menu",
        {
          username: "administrator",
          userpassword: "admin",
          Menuid: "01",
          nooftables: "3",
        },
        { timeout: 5000 }
      );

      return fullMenuRes.data?.data || null;
    } catch (error) {
      if (retryCount < maxRetries) {
        console.warn(`Retrying company data fetch (${retryCount + 1}/${maxRetries})`);
        return this.getCompanyData(maxRetries, retryCount + 1);
      }
      console.error("Failed to fetch company data after retries:", error);
      return null;
    }
  },

  // Build where clause from object
  buildWhereClause: function (whereObj) {
    return Object.entries(whereObj)
      .map(([key, val]) => {
        if (val === null || val === undefined) return `${key} IS NULL`;
        if (typeof val === "string") return `${key} = '${val.replace(/'/g, "''")}'`;
        if (typeof val === "boolean") return `${key} = ${val ? 1 : 0}`;
        return `${key} = ${val}`;
      })
      .join(" AND ");
  }
};

// ----------------- MIDDLEWARES -----------------
const middlewares = {
  // Validate table name
  validateTableName: function (req, res, next) {
    const tableName = req.body.tableName;
    if (!tableName) {
      return res.status(400).json({ success: false, error: "Table name is required" });
    }
    next();
  },

  // Add company data to request
  addCompanyData: async function (req, res, next) {
    try {
      if (!req.companyData) {
        req.companyData = await utils.getCompanyData();
      }
      next();
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch company data" });
    }
  }
};

// ----------------- ROUTE HANDLERS -----------------
const handlers = {
  // Get table headers
  getTableHeaders: async function (req, res) {
    const tableName = req.body.tableName;
    const query = `SELECT TOP(1) * FROM ${tableName}`;

    try {
      const rows = await utils.executeSoapQuery(query);
      const firstRow = rows[0] || {};
      const fields = {};

      for (const key of Object.keys(firstRow)) {
        const val = firstRow[key]?.[0] ?? "";
        fields[key] = { value: val, type: utils.guessType(val) };
      }

      res.json({ success: true, fields });
    } catch (err) {
      console.error("Error in /get-table-headers:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  // GET GRN SUPPLIer data
  getGRNTableData: async function (req, res) {
    const tableName = req.body.tableName;
    const companyData = req.companyData;
    const companyOffcode = companyData?.company?.offcode;

    try {
      let query;
      if (companyOffcode) {
        query = `SELECT * FROM ${tableName} WHERE offcode = '${companyOffcode}' and IsActive = 1`;
        console.log("Executing query with offcode filter:", query);
      } else {
        query = `SELECT * FROM ${tableName}`;
        console.warn("No offcode available, fetching all records without filter");
      }

      const rows = await utils.executeSoapQuery(query);
      const jsonRows = rows.map((row) => {
        const obj = {};
        for (const key of Object.keys(row)) {
          const val = row[key]?.[0] ?? "";
          obj[key] = val;
        }
        return obj;
      });

      res.json({
        success: true,
        rows: jsonRows,
        offcode: companyOffcode,
        filtered: !!companyOffcode,
        count: jsonRows.length,
        query,
      });
    } catch (err) {
      console.error("Error in /get-table-data:", err);
      res.status(500).json({
        success: false,
        error: err.message,
        details: "Failed to fetch table data",
      });
    }
  },
  // Get table data
  getTableData: async function (req, res) {
    const tableName = req.body.tableName;
    const companyData = req.companyData;
    const companyOffcode = companyData?.company?.offcode;

    try {
      let query;
      if (companyOffcode) {
        query = `SELECT * FROM ${tableName} WHERE offcode = '${companyOffcode}'`;
        console.log("Executing query with offcode filter:", query);
      } else {
        query = `SELECT * FROM ${tableName}`;
        console.warn("No offcode available, fetching all records without filter");
      }

      const rows = await utils.executeSoapQuery(query);
      const jsonRows = rows.map((row) => {
        const obj = {};
        for (const key of Object.keys(row)) {
          const val = row[key]?.[0] ?? "";
          obj[key] = val;
        }
        return obj;
      });

      res.json({
        success: true,
        rows: jsonRows,
        offcode: companyOffcode,
        filtered: !!companyOffcode,
        count: jsonRows.length,
        query,
      });
    } catch (err) {
      console.error("Error in /get-table-data:", err);
      res.status(500).json({
        success: false,
        error: err.message,
        details: "Failed to fetch table data",
      });
    }
  },

  // Get table structure
  getTableStructure: async function (req, res) {
    const tableName = req.body.tableName;
    const query = `
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION
    `;

    try {
      const columns = await utils.executeSoapQuery(query);
      const structure = columns.map(col => ({
        name: col.COLUMN_NAME?.[0],
        type: col.DATA_TYPE?.[0],
        maxLength: col.CHARACTER_MAXIMUM_LENGTH?.[0],
        nullable: col.IS_NULLABLE?.[0] === 'YES'
      }));

      res.json({ success: true, structure });
    } catch (err) {
      console.error("Error in /get-table-structure:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Get table relationships
  getTableRelationships: async function (req, res) {
    const tableName = req.body.tableName;
    const query = `
      SELECT 
        fk.name AS 'ConstraintName',
        OBJECT_NAME(fk.parent_object_id) AS 'TableName',
        COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS 'ColumnName',
        OBJECT_NAME(fk.referenced_object_id) AS 'ReferencedTable',
        COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS 'ReferencedColumn'
      FROM 
        sys.foreign_keys AS fk
      INNER JOIN 
        sys.foreign_key_columns AS fkc ON fk.object_id = fkc.constraint_object_id
      WHERE 
        OBJECT_NAME(fk.parent_object_id) = '${tableName}'
    `;

    try {
      const relationships = await utils.executeSoapQuery(query);
      res.json({ success: true, relationships });
    } catch (err) {
      console.error("Error in /get-table-relationships:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Get parent table data
  getParentTableData: async function (req, res) {
    const { tableName, columnName } = req.body;

    if (!tableName || !columnName) {
      return res.status(400).json({ success: false, error: "Table name and column name are required" });
    }

    const query = `SELECT DISTINCT ${columnName} FROM ${tableName} ORDER BY ${columnName}`;

    try {
      const rows = await utils.executeSoapQuery(query);
      const values = rows.map(row => row[columnName]?.[0]).filter(Boolean);

      res.json({ success: true, values });
    } catch (err) {
      console.error("Error in /get-parent-table-data:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // simple insert withou offcode
  SinsertTableData: async function (req, res) {
    let formData = req.body.data;
    const tableName = req.body.tableName;

    if (!tableName) {
      return res.status(400).json({ success: false, error: "Table name is required" });
    }
    if (!formData) {
      return res.status(400).json({ success: false, error: "No data provided" });
    }
    if (!Array.isArray(formData)) formData = [formData];

    try {
      const client = await soap.createClientAsync(WSDL_URL);
      const vJsonTable = JSON.stringify(formData);

      const firstRow = formData[0];
      const fields = Object.keys(firstRow).join(", ");
      const values = Object.values(firstRow)
        .map(v => {
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === "boolean") return v ? 1 : 0;
          return v;
        })
        .join(", ");

      const insertQuery = `INSERT INTO ${tableName} (${fields}) VALUES (${values});`;

      const args = {
        vJsonTable,
        vQuery_SPName: insertQuery,
        isStoreProcedure: false,
      };

      const [result] = await client.InsertJSonTableDataWithParameterAsync(args);
      const responseValue =
        result.InsertJSonTableDataWithParameterResult?._ ||
        result.InsertJSonTableDataWithParameterResult;

      res.json({
        success: true,
        query: insertQuery,
        response: responseValue,
      });
    } catch (err) {
      console.error("Error in /insert-table-data:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Insert common data GRN

  // Insert table data
  insertTableData: async function (req, res) {
    let formData = req.body.data;
    const tableName = req.body.tableName;

    if (!tableName) {
      return res.status(400).json({ success: false, error: "Table name is required" });
    }
    if (!formData) {
      return res.status(400).json({ success: false, error: "No data provided" });
    }
    if (!Array.isArray(formData)) formData = [formData];

    try {
      // ✅ First fetch company offcode
      let companyOffcode = null;
      try {
        const fullMenuRes = await axios.post(FULL_MENU_URL, {
          username: "administrator",
          userpassword: "admin",
          Menuid: "01",
          nooftables: "3",
        });

        companyOffcode = fullMenuRes.data?.data?.company?.offcode;
        console.log("Fetched offcode for insert:", companyOffcode);
      } catch (err) {
        console.warn("Could not fetch company offcode, inserting without it:", err.message);
      }

      // ✅ Inject offcode into every row if not provided
      formData = formData.map(row => ({
        ...row,
        offcode: row.offcode ?? companyOffcode,  // override only if missing
      }));

      const client = await soap.createClientAsync(WSDL_URL);
      const vJsonTable = JSON.stringify(formData);

      const firstRow = formData[0];
      const fields = Object.keys(firstRow).join(", ");
      const values = Object.values(firstRow)
        .map(v => {
          if (v === null || v === undefined) return "NULL";
          if (typeof v === "string") return `'${v.replace(/'/g, "''")}'`;
          if (typeof v === "boolean") return v ? 1 : 0;
          return v;
        })
        .join(", ");

      const insertQuery = `INSERT INTO ${tableName} (${fields}) VALUES (${values});`;

      const args = {
        vJsonTable,
        vQuery_SPName: insertQuery,
        isStoreProcedure: false,
      };

      const [result] = await client.InsertJSonTableDataWithParameterAsync(args);
      const responseValue =
        result.InsertJSonTableDataWithParameterResult?._ ||
        result.InsertJSonTableDataWithParameterResult;

      res.json({
        success: true,
        query: insertQuery,
        offcode: companyOffcode, // ✅ show for debugging
        response: responseValue,
      });
    } catch (err) {
      console.error("Error in /insert-table-data:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  // Insert table data of GRN
  // Insert GRN head and detail data with PO quantity update - FIXED VERSION
  insertGRNHeadDet: async function (req, res) {
    const { head, details, selectedBranch } = req.body;
    const companyData = req.companyData;

    if (!head || !details || !Array.isArray(details)) {
      return res.status(400).json({ success: false, error: "Head and details are required" });
    }

    // helper to fix array values
    const normalizeValue = (val) => {
      if (Array.isArray(val)) return val[0];
      return val ?? "";
    };

    try {
      const companyOffcode = companyData?.company?.offcode;
      let branchCode = null;

      // Get branch code
      if (companyData?.branches?.length > 0) {
        if (selectedBranch) {
          const selected = companyData.branches.find(b => b.branch === selectedBranch);
          branchCode = selected ? selected.code : companyData.branches[0].code;
        } else {
          branchCode = companyData.branches[0].code;
        }
      }

      // Get voucher number
      const { vdate, vtype } = head.data;
      let vno = null, vockey = null;

      const voucherResponse = await axios.post(
        "http://192.168.100.103/smartapi/service.asmx/GetVoucherNo",
        `tableName=${head.tableName}&vdate=${vdate}&offcode=${companyOffcode}&bcode=${branchCode}&vtype=${vtype}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        }
      );

      const parsedVoucher = await parseStringPromise(voucherResponse.data);

      // Extract vno safely
      let rawVno = parsedVoucher?.string?._ || parsedVoucher?.string?.$text || parsedVoucher?.string;
      if (!rawVno || typeof rawVno !== "string") {
        return res.status(400).json({ success: false, error: "Voucher number not received from SOAP service" });
      }

      // Trim and limit
      vno = rawVno.trim().substring(0, 10);

      // Build vockey safely
      vockey = (branchCode + vno).substring(0, 19);

      // Get user ID
      let uid = "07"; // default
      const createdby = head.data.createdby;
      if (!createdby) {
        return res.status(400).json({ success: false, error: "createdby (username) is required" });
      }

      try {
        const userQuery = `SELECT TOP 1 Uid FROM comUsers WHERE Userlogin = '${createdby.replace(/'/g, "''")}'`;
        const userRows = await utils.executeSoapQuery(userQuery);
        if (userRows[0]?.Uid?.[0]) {
          uid = userRows[0].Uid[0];
        }
      } catch (err) {
        console.warn("Could not fetch Uid from comUsers, using default 07:", err.message);
      }

      // Get period code
      let ycode = null;
      try {
        const periodQuery = `SELECT TOP 1 YCode FROM comPeriods WHERE '${vdate}' BETWEEN SDate AND EDate`;
        const periodRows = await utils.executeSoapQuery(periodQuery);
        if (periodRows[0]) {
          ycode = periodRows[0].YCode?.[0];
        }
      } catch (err) {
        return res.status(400).json({ success: false, error: "Could not fetch YCode" });
      }

      // Calculate totals with sales tax
      let totalAmount = 0;
      let totalQty = 0;
      let salesTaxAmount = 0;
      let netAmount = 0;

      // Track PO items for updating quantities
      const poItemsToUpdate = [];

      // Process details and track PO items
      const processedDetails = details.map((det) => {
        const itemCode = normalizeValue(det.data.Itemcode || det.data.itemCode);
        const itemName = normalizeValue(det.data.Itemname || det.data.itemName);
        const uom = normalizeValue(det.data.uom || det.data.UOM);
        const poNo = normalizeValue(det.data.PO || det.data.poNo);
        const roNo = normalizeValue(det.data.RO || det.data.roNo);

        const quantity = parseFloat(det.data.qty || det.data.quantity || 0);
        const rate = parseFloat(det.data.rate || 0);
        const salesTaxPer = parseFloat(det.data.saleTaxPer || det.data.salesTaxPercentage || 0);

        const amount = quantity * rate;
        const itemSalesTax = amount * (salesTaxPer / 100);
        const itemNetAmount = amount + itemSalesTax;

        totalAmount += amount;
        totalQty += quantity;
        salesTaxAmount += itemSalesTax;
        netAmount += itemNetAmount;

        // Track PO items for updating quantities
        if (poNo && itemCode && quantity > 0) {
          poItemsToUpdate.push({
            poNo,
            itemCode,
            grnQty: quantity,
            grnNo: vno
          });
        }

        return {
          ...det.data,
          Itemcode: itemCode,
          Itemname: itemName,
          uom,
          PO: poNo,
          RO: roNo,
          value: amount,
          salestaxAmt: itemSalesTax,
          netvalue: itemNetAmount
        };
      });

      // Insert head data
      const createdate = utils.formatDateForSQL();
      const headRow = {
        ...head.data,
        vno,
        vockey,
        offcode: companyOffcode,
        bcode: branchCode,
        YCode: ycode,
        createdby,
        createdate,
        uid,
        totalAmount,
        totalQtyE: totalQty,
        SalesTaxAmount: salesTaxAmount,
        NetAmount: netAmount,
        NoofItemcount: details.length
      };

      const headInsertQuery = utils.buildInsertQuery(head.tableName, [headRow]);
      const headJson = JSON.stringify([headRow]);

      const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");

      // Insert head record
      await client.InsertJSonTableDataWithParameterAsync({
        vJsonTable: headJson,
        vQuery_SPName: headInsertQuery,
        isStoreProcedure: false,
      });

      // Insert detail data
      const detRows = processedDetails.map((det) => {
        let vockeySafe = branchCode + vno;
        if (vockeySafe.length > 20) {
          vockeySafe = vockeySafe.substring(0, 20);
        }

        return {
          ...det,
          vno,
          vockey: vockeySafe,
          offcode: companyOffcode,
          vdate,
          vtype,
        };
      });

      const detInsertQuery = utils.buildInsertQuery(details[0].tableName, detRows);
      const detJson = JSON.stringify(detRows);

      await client.InsertJSonTableDataWithParameterAsync({
        vJsonTable: detJson,
        vQuery_SPName: detInsertQuery,
        isStoreProcedure: false,
      });

      // ✅ UPDATE PURCHASE ORDER QUANTITIES
      if (poItemsToUpdate.length > 0) {
        console.log("Updating PO quantities for items:", poItemsToUpdate);

        for (const poItem of poItemsToUpdate) {
          try {
            const updateQuery = `
            UPDATE invPOdet
            SET Recivedqty = ISNULL(Recivedqty, 0) + ${poItem.grnQty},
                BalQty = ISNULL(BalQty, 0) - ${poItem.grnQty}
            WHERE vno = '${poItem.poNo}'
              AND Itemcode = '${poItem.itemCode}'
              AND offcode = '${companyOffcode}'
          `;

            console.log("Executing PO update query:", updateQuery);
            const result = await utils.executeSoapQuery(updateQuery);
            console.log("PO update SOAP result:", result);

          } catch (poError) {
            console.error(`❌ Failed to update PO ${poItem.poNo}, item ${poItem.itemCode}:`, poError);
          }
        }
      } else {
        console.log("No PO items to update");
      }

      res.json({
        success: true,
        message: "GRN saved successfully" + (poItemsToUpdate.length > 0 ? " and PO quantities updated" : ""),
        vno,
        vockey,
        ycode,
        uid,
        totals: {
          amount: totalAmount,
          quantity: totalQty,
          salesTax: salesTaxAmount,
          netAmount: netAmount
        },
        poUpdates: {
          count: poItemsToUpdate.length,
          items: poItemsToUpdate
        },
        queries: { head: headInsertQuery, det: detInsertQuery }
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // New function to fetch purchase orders
  getPurchaseOrders: async function (req, res) {
    const { supplierCode, offcode = "0101" } = req.body;

    if (!supplierCode) {
      return res.status(400).json({ success: false, error: "Supplier code is required" });
    }

    try {
      // First get PO headers
      const poHeadQuery = `SELECT * FROM invPOhead WHERE suppliercode = '${supplierCode}' AND offcode = '${offcode}' AND posted = 1`;
      const poHeads = await utils.executeSoapQuery(poHeadQuery);

      // Get PO details for each PO
      const poDetails = [];
      for (const head of poHeads) {
        const vno = head.vno?.[0];
        const vockey = head.vockey?.[0];

        if (vno && vockey) {
          const poDetailQuery = `SELECT * FROM invPOdet WHERE vockey = '${vockey}' AND offcode = '${offcode}'`;
          const details = await utils.executeSoapQuery(poDetailQuery);

          poDetails.push({
            poHead: head,
            poDetails: details
          });
        }
      }

      res.json({
        success: true,
        data: poDetails
      });
    } catch (err) {
      console.error("Error fetching purchase orders:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Insert cash payment voucher head and detail data
  insertHeadDet: async function (req, res) {
    const { head, details, selectedBranch } = req.body;
    const companyData = req.companyData;

    if (!head || !details || !Array.isArray(details)) {
      return res.status(400).json({ success: false, error: "Head and details are required" });
    }

    try {
      const companyOffcode = companyData?.company?.offcode;
      let branchCode = null;

      // Get branch code
      if (companyData?.branches?.length > 0) {
        if (selectedBranch) {
          const selected = companyData.branches.find(b => b.branch === selectedBranch);
          branchCode = selected ? selected.code : companyData.branches[0].code;
        } else {
          branchCode = companyData.branches[0].code;
        }
      }

      // Get voucher number
      const { vdate, vtype } = head.data;
      let vno = null, vockey = null;

      const voucherResponse = await axios.post(
        "http://192.168.100.103/smartapi/service.asmx/GetVoucherNo",
        `tableName=${head.tableName}&vdate=${vdate}&offcode=${companyOffcode}&bcode=${branchCode}&vtype=${vtype}`,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 10000,
        }
      );

      const parsedVoucher = await parseStringPromise(voucherResponse.data);

      // Extract vno safely
      let rawVno = parsedVoucher?.string?._ || parsedVoucher?.string?.$text || parsedVoucher?.string;
      if (!rawVno || typeof rawVno !== "string") {
        return res.status(400).json({ success: false, error: "Voucher number not received from SOAP service" });
      }

      // Trim and limit
      vno = rawVno.trim().substring(0, 10);

      // Build vockey safely
      vockey = (branchCode + vno).substring(0, 19);


      // Get user ID
      let uid = "07"; // default
      // let createdby = head.data.createdby || "system";
      const createdby = head.data.createdby;
      if (!createdby) {
        return res.status(400).json({ success: false, error: "createdby (username) is required" });
      }

      try {
        const userQuery = `SELECT TOP 1 Uid FROM comUsers WHERE Userlogin = '${createdby.replace(/'/g, "''")}'`;
        const userRows = await utils.executeSoapQuery(userQuery);
        if (userRows[0]?.Uid?.[0]) {
          uid = userRows[0].Uid[0];
        }
      } catch (err) {
        console.warn("Could not fetch Uid from comUsers, using default 07:", err.message);
      }

      // Get period code
      let pcode = null, ycode = null;
      try {
        const periodQuery = `SELECT TOP 1 PCode, YCode FROM comPeriods WHERE '${vdate}' BETWEEN SDate AND EDate`;
        const periodRows = await utils.executeSoapQuery(periodQuery);
        if (periodRows[0]) {
          // pcode = periodRows[0].PCode?.[0];
          ycode = periodRows[0].YCode?.[0];
        }
      } catch (err) {
        return res.status(400).json({ success: false, error: "Could not fetch PCode/YCode" });
      }

      // Insert head data
      const createdate = utils.formatDateForSQL();
      const headRow = {
        ...head.data,
        vno,
        vockey,
        offcode: companyOffcode,
        bcode: branchCode,
        // PCode: pcode,
        YCode: ycode,
        createdby,
        createdate,
        uid,
      };

      const headInsertQuery = utils.buildInsertQuery(head.tableName, [headRow]);
      const headJson = JSON.stringify([headRow]);

      const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");
      await client.InsertJSonTableDataWithParameterAsync({
        vJsonTable: headJson,
        vQuery_SPName: headInsertQuery,
        isStoreProcedure: false,
      });

      // Insert detail data
      const detRows = details.map((det) => {
        let empName = det.data.EmployeeName || "";
        if (empName.length > 50) {
          empName = empName.substring(0, 50);
        }

        let vockeySafe = branchCode + vno;
        if (vockeySafe.length > 20) {
          vockeySafe = vockeySafe.substring(0, 20);
        }

        return {
          ...det.data,
          // vno,
          vockey: vockeySafe,
          offcode: companyOffcode,
          // bcode: branchCode,
          // PCode: pcode,
          // YCode: ycode,
          // vdate,
          vtype,
        };
      });

      const detInsertQuery = utils.buildInsertQuery(details[0].tableName, detRows);
      const detJson = JSON.stringify(detRows);

      await client.InsertJSonTableDataWithParameterAsync({
        vJsonTable: detJson,
        vQuery_SPName: detInsertQuery,
        isStoreProcedure: false,
      });

      res.json({
        success: true,
        message: "Head + detail inserted successfully",
        vno,
        vockey,
        // pcode,
        ycode,
        uid,
        queries: { head: headInsertQuery, det: detInsertQuery },
        payloads: { head: headJson, det: detJson },
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  // Insert Shift&timetable head and detail data
  insertSTHeadDet: async function (req, res) {
    const { head, details, selectedBranch } = req.body;
    const companyData = req.companyData;

    if (!head || !details || !Array.isArray(details)) {
      return res.status(400).json({ success: false, error: "Head and details are required" });
    }

    try {
      const companyOffcode = companyData?.company?.offcode;
      let branchCode = null;

      // Get branch code
      if (companyData?.branches?.length > 0) {
        if (selectedBranch) {
          const selected = companyData.branches.find(b => b.branch === selectedBranch);
          branchCode = selected ? selected.code : companyData.branches[0].code;
        } else {
          branchCode = companyData.branches[0].code;
        }
      }

      // For HRMSShift, we don't need voucher number since it's not a voucher-based transaction
      // We'll use the provided Code from head data instead
      const shiftCode = head.data.Code;
      if (!shiftCode) {
        return res.status(400).json({ success: false, error: "Shift Code is required" });
      }

      // Get user ID
      let uid = "07"; // default
      const createdby = head.data.createdby;
      if (!createdby) {
        return res.status(400).json({ success: false, error: "createdby (username) is required" });
      }

      try {
        const userQuery = `SELECT TOP 1 Uid FROM comUsers WHERE Userlogin = '${createdby.replace(/'/g, "''")}'`;
        const userRows = await utils.executeSoapQuery(userQuery);
        if (userRows[0]?.Uid?.[0]) {
          uid = userRows[0].Uid[0];
        }
      } catch (err) {
        console.warn("Could not fetch Uid from comUsers, using default 07:", err.message);
      }

      // Insert head data (HRMSShift)
      const createdate = utils.formatDateForSQL();
      const headRow = {
        ...head.data,
        offcode: companyOffcode,
        createdby,
        createdate,
        uid,
        // Ensure boolean values are properly formatted
        IsActive: head.data.IsActive === "true" ? 1 : 0
      };

      const headInsertQuery = utils.buildInsertQuery(head.tableName, [headRow]);
      const headJson = JSON.stringify([headRow]);

      const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");

      // Insert head record
      await client.InsertJSonTableDataWithParameterAsync({
        vJsonTable: headJson,
        vQuery_SPName: headInsertQuery,
        isStoreProcedure: false,
      });

      // Insert detail data (HRMSShiftTimeTable)
      const detRows = details.map((det) => {
        return {
          ...det.data,
          ShiftCode: shiftCode, // Link to head record
          offcode: companyOffcode,
          // Ensure boolean values are properly formatted
          isRestDay: det.data.isRestDay === "true" ? 1 : 0
        };
      });

      const detInsertQuery = utils.buildInsertQuery(details[0].tableName, detRows);
      const detJson = JSON.stringify(detRows);

      await client.InsertJSonTableDataWithParameterAsync({
        vJsonTable: detJson,
        vQuery_SPName: detInsertQuery,
        isStoreProcedure: false,
      });

      res.json({
        success: true,
        message: "Shift + Shift TimeTable inserted successfully",
        shiftCode: shiftCode,
        offcode: companyOffcode,
        uid,
        queries: { head: headInsertQuery, det: detInsertQuery },
        payloads: { head: headJson, det: detJson },
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },
  // insertEmployeeHeadDet: async function (req, res) {
  //   const { head, details, selectedBranch } = req.body;
  //   const companyData = req.companyData;

  //   if (!head || !details || !Array.isArray(details)) {
  //     return res.status(400).json({ success: false, error: "Head and details are required" });
  //   }

  //   try {
  //     const companyOffcode = companyData?.company?.offcode;
  //     let branchCode = null;

  //     if (companyData?.branches?.length > 0) {
  //       if (selectedBranch) {
  //         const selected = companyData.branches.find(b => b.branch === selectedBranch);
  //         branchCode = selected ? selected.code : companyData.branches[0].code;
  //       } else {
  //         branchCode = companyData.branches[0].code;
  //       }
  //     }

  //     const empCode = head.data.Code;
  //     if (!empCode) {
  //       return res.status(400).json({ success: false, error: "Employee Code is required" });
  //     }

  //     let uid = "07";
  //     const createdby = head.data.createdby;
  //     if (!createdby) {
  //       return res.status(400).json({ success: false, error: "createdby (username) is required" });
  //     }

  //     try {
  //       const userQuery = `SELECT TOP 1 Uid FROM comUsers WHERE Userlogin = '${createdby.replace(/'/g, "''")}'`;
  //       const userRows = await utils.executeSoapQuery(userQuery);
  //       if (userRows[0]?.Uid?.[0]) {
  //         uid = userRows[0].Uid[0];
  //       }
  //     } catch (err) {
  //       console.warn("Could not fetch Uid from comUsers, using default 07:", err.message);
  //     }

  //     const createdate = utils.formatDateForSQL();
  //     const headRow = {
  //       ...head.data,
  //       offcode: companyOffcode,
  //       createdby,
  //       createdate,
  //       uid,
  //       IsActive: head.data.IsActive === "true" ? 1 : 0
  //     };

  //     const headInsertQuery = utils.buildInsertQuery(head.tableName, [headRow]);
  //     const headJson = JSON.stringify([headRow]);

  //     const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");

  //     await client.InsertJSonTableDataWithParameterAsync({
  //       vJsonTable: headJson,
  //       vQuery_SPName: headInsertQuery,
  //       isStoreProcedure: false,
  //     });

  //     const detRows = details.map((det) => {
  //       return {
  //         ...det.data,
  //         EmpCode: empCode,
  //         offcode: companyOffcode,
  //         OverTimeAllow: det.data.OverTimeAllow === "true" ? 1 : 0,
  //         LateTimeAllow: det.data.LateTimeAllow === "true" ? 1 : 0,
  //         EarlyLateAllow: det.data.EarlyLateAllow === "true" ? 1 : 0,
  //         AutoAttendanceAllow: det.data.AutoAttendanceAllow === "true" ? 1 : 0,
  //         offdayBonusAllow: det.data.offdayBonusAllow === "true" ? 1 : 0,
  //         HolyDayBonusAllow: det.data.HolyDayBonusAllow === "true" ? 1 : 0,
  //         IsActive: det.data.IsActive === "true" ? 1 : 0
  //       };
  //     });

  //     const detInsertQuery = utils.buildInsertQuery(details[0].tableName, detRows);
  //     const detJson = JSON.stringify(detRows);

  //     await client.InsertJSonTableDataWithParameterAsync({
  //       vJsonTable: detJson,
  //       vQuery_SPName: detInsertQuery,
  //       isStoreProcedure: false,
  //     });

  //     res.json({
  //       success: true,
  //       message: "Employee + Attendance Specification inserted successfully",
  //       empCode: empCode,
  //       offcode: companyOffcode,
  //       uid,
  //       queries: { head: headInsertQuery, det: detInsertQuery },
  //       payloads: { head: headJson, det: detJson },
  //     });
  //   } catch (err) {
  //     console.error("Insert error:", err);
  //     res.status(500).json({ success: false, error: err.message });
  //   }
  // },
  insertEmployeeHeadDetAll: async function (req, res) {
    const { head, details, selectedBranch } = req.body;
    const companyData = req.companyData;

    if (!head || !details || !Array.isArray(details)) {
      return res.status(400).json({ success: false, error: "Head and details are required" });
    }

    try {
      const companyOffcode = companyData?.company?.offcode;
      let branchCode = null;

      if (companyData?.branches?.length > 0) {
        if (selectedBranch) {
          const selected = companyData.branches.find(b => b.branch === selectedBranch);
          branchCode = selected ? selected.code : companyData.branches[0].code;
        } else {
          branchCode = companyData.branches[0].code;
        }
      }

      const empCode = head.data.Code;
      if (!empCode) {
        return res.status(400).json({ success: false, error: "Employee Code is required" });
      }

      let uid = "07";
      const createdby = head.data.createdby;
      if (!createdby) {
        return res.status(400).json({ success: false, error: "createdby (username) is required" });
      }

      try {
        const userQuery = `SELECT TOP 1 Uid FROM comUsers WHERE Userlogin = '${createdby.replace(/'/g, "''")}'`;
        const userRows = await utils.executeSoapQuery(userQuery);
        if (userRows[0]?.Uid?.[0]) {
          uid = userRows[0].Uid[0];
        }
      } catch (err) {
        console.warn("Could not fetch Uid from comUsers, using default 07:", err.message);
      }

      const createdate = utils.formatDateForSQL();

      // Head row (HRMSEmployee) - exclude computed/system-only columns
      const excludedCols = ["Name"];
      const headRow = Object.fromEntries(
        Object.entries({
          ...head.data,
          offcode: companyOffcode,
          createdby,
          createdate,
          uid,
          IsActive: head.data.IsActive === "true" ? 1 : 0
        }).filter(([key]) => !excludedCols.includes(key))
      );

      const headInsertQuery = utils.buildInsertQuery(head.tableName, [headRow]);
      const headJson = JSON.stringify([headRow]);

      const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");

      console.log("=== HEAD INSERT START ===");
      console.log("Table:", head.tableName);
      console.log("Query:", headInsertQuery);
      console.log("Payload:", headJson);
      console.log("=== HEAD INSERT END ===");

      await client.InsertJSonTableDataWithParameterAsync({
        vJsonTable: headJson,
        vQuery_SPName: headInsertQuery,
        isStoreProcedure: false,
      });

      // Insert details into child tables
      let queries = { head: headInsertQuery, details: [] };

      for (const det of details) {
        let detRows = det.rows.map((row) => {
          // ✅ Flatten nested attendanceSpec object if present
          if (row.attendanceSpec) {
            row.OverTimeAllow = row.attendanceSpec.OverTimeAllow === "true" ? 1 : 0;
            row.LateTimeAllow = row.attendanceSpec.LateTimeAllow === "true" ? 1 : 0;
            row.EarlyLateAllow = row.attendanceSpec.EarlyLateAllow === "true" ? 1 : 0;
            row.AutoAttendanceAllow = row.attendanceSpec.AutoAttendanceAllow === "true" ? 1 : 0;
            row.offdayBonusAllow = row.attendanceSpec.offdayBonusAllow === "true" ? 1 : 0;
            row.HolyDayBonusAllow = row.attendanceSpec.HolyDayBonusAllow === "true" ? 1 : 0;
            row.NoOfExempt = row.attendanceSpec.NoOfExempt || 0;

            delete row.attendanceSpec; // remove nested object
          }

          return {
            ...row,
            Code: empCode,
            offcode: companyOffcode
          };
        });

        // Handle table-specific rules
        switch (det.tableName) {
          case "HRMSEmployeeAcademicInfo":
          case "HRMSEmployementHistory":
          case "HRMSEmployeeGrantAllowance":
          case "HRMSEmployeeGrantDeduction":
          case "HRMSEmployeeFamilyDet":
            // ✅ these tables don’t have IsActive
            break;

          case "HRMSEmployeeAttendance":
            detRows = detRows.map(r => ({
              ...r,
              IsActive: r.IsActive === "true" ? 1 : 0
            }));
            break;

          default:
            break;
        }

        if (detRows.length > 0) {
          const detInsertQuery = utils.buildInsertQuery(det.tableName, detRows);
          const detJson = JSON.stringify(detRows);

          console.log("=== DETAIL INSERT START ===");
          console.log("Table:", det.tableName);
          console.log("Query:", detInsertQuery);
          console.log("Payload:", detJson);
          console.log("=== DETAIL INSERT END ===");

          await client.InsertJSonTableDataWithParameterAsync({
            vJsonTable: detJson,
            vQuery_SPName: detInsertQuery,
            isStoreProcedure: false,
          });

          queries.details.push({ table: det.tableName, query: detInsertQuery });
        }
      }
      console.log(queries)
      res.json({
        success: true,
        message: "Employee + related details inserted successfully",
        empCode,
        offcode: companyOffcode,
        uid,
        queries
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Simple Update table Data without offcode
  SupdateTableData: async function (req, res) {
    const { tableName, data, where, loginUser } = req.body;

    if (!tableName) {
      return res.status(400).json({ success: false, error: "Table name is required" });
    }
    if (!data || typeof data !== "object") {
      return res.status(400).json({ success: false, error: "Update data is required" });
    }
    if (!where || typeof where !== "object") {
      return res.status(400).json({ success: false, error: "WHERE condition is required" });
    }

    try {
      // Add editby/editdate for Head tables
      const finalData = { ...data };
      if (/Head$/i.test(tableName)) {
        finalData.editby = loginUser || "system";
        finalData.editdate = utils.formatDateForSQL(new Date());
      }

      // Build query
      const setClause = Object.entries(finalData)
        .map(([key, val]) => {
          if (val === null || val === undefined) return `${key} = NULL`;
          if (typeof val === "string") return `${key} = '${val.replace(/'/g, "''")}'`;
          if (typeof val === "boolean") return `${key} = ${val ? 1 : 0}`;
          return `${key} = ${val}`;
        })
        .join(", ");

      const whereClause = utils.buildWhereClause(where);
      const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause};`;

      const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");
      const args = {
        vJsonTable: JSON.stringify([finalData]),
        vQuery_SPName: updateQuery,
        isStoreProcedure: false,
      };

      const [result] = await client.InsertJSonTableDataWithParameterAsync(args);
      const responseValue =
        result.InsertJSonTableDataWithParameterResult?._ ||
        result.InsertJSonTableDataWithParameterResult;

      res.json({
        success: true,
        query: updateQuery,
        response: responseValue,
      });
    } catch (err) {
      console.error("Error in /update-table-data:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Update table data
  updateTableData: async function (req, res) {
    const { tableName, data, where, loginUser } = req.body;
    const companyData = req.companyData;

    if (!tableName) {
      return res.status(400).json({ success: false, error: "Table name is required" });
    }
    if (!data || typeof data !== "object") {
      return res.status(400).json({ success: false, error: "Update data is required" });
    }
    if (!where || typeof where !== "object") {
      return res.status(400).json({ success: false, error: "WHERE condition is required" });
    }

    try {
      const companyOffcode = companyData?.company?.offcode;

      // Ensure offcode exists in WHERE clause
      const finalWhere = { ...where };
      if (!finalWhere.offcode && companyOffcode) {
        finalWhere.offcode = companyOffcode;
      }

      // Add editby/editdate for Head tables
      const finalData = { ...data };
      if (/Head$/i.test(tableName)) {
        finalData.editby = loginUser || "system";
        finalData.editdate = utils.formatDateForSQL(new Date());
      }

      // Build query
      const setClause = Object.entries(finalData)
        .map(([key, val]) => {
          if (val === null || val === undefined) return `${key} = NULL`;
          if (typeof val === "string") return `${key} = '${val.replace(/'/g, "''")}'`;
          if (typeof val === "boolean") return `${key} = ${val ? 1 : 0}`;
          return `${key} = ${val}`;
        })
        .join(", ");

      const whereClause = utils.buildWhereClause(finalWhere);
      const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause};`;
      console.log("Update Query:", updateQuery);
      const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");
      const args = {
        vJsonTable: JSON.stringify([finalData]),
        vQuery_SPName: updateQuery,
        isStoreProcedure: false,
      };

      const [result] = await client.InsertJSonTableDataWithParameterAsync(args);
      const responseValue =
        result.InsertJSonTableDataWithParameterResult?._ ||
        result.InsertJSonTableDataWithParameterResult;

      res.json({
        success: true,
        query: updateQuery,

        offcode: companyOffcode,
        response: responseValue,

      });

    } catch (err) {
      console.error("Error in /update-table-data:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  updateGRNTableData: async function (req, res) {
    const { head, details, tableName, data, where, loginUser } = req.body;
    const companyData = req.companyData;

    try {
      const companyOffcode = companyData?.company?.offcode;

      // Helper to build and run update for any table
      const runUpdate = async (tableName, data, where, loginUser) => {
        if (!tableName) throw new Error("Table name is required");
        if (!data || typeof data !== "object") throw new Error("Update data is required");
        if (!where || typeof where !== "object") throw new Error("WHERE condition is required");

        const finalWhere = { ...where };
        if (!finalWhere.offcode && companyOffcode) {
          finalWhere.offcode = companyOffcode;
        }

        const finalData = { ...data };
        if (/Head$/i.test(tableName)) {
          finalData.editby = loginUser || "system";
          finalData.editdate = utils.formatDateForSQL(new Date());
        }

        const setClause = Object.entries(finalData)
          .map(([key, val]) => {
            if (val === null || val === undefined) return `${key} = NULL`;
            if (typeof val === "string") return `${key} = '${val.replace(/'/g, "''")}'`;
            if (typeof val === "boolean") return `${key} = ${val ? 1 : 0}`;
            return `${key} = ${val}`;
          })
          .join(", ");

        const whereClause = utils.buildWhereClause(finalWhere);
        const updateQuery = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause};`;
        console.log("🔥 Update GRN Query:", updateQuery);

        const client = await soap.createClientAsync(
          "http://192.168.100.103/smartapi/service.asmx?wsdl"
        );

        const args = {
          vJsonTable: JSON.stringify([finalData]),
          vQuery_SPName: updateQuery,
          isStoreProcedure: false,
        };

        const [result] = await client.InsertJSonTableDataWithParameterAsync(args);
        const responseValue =
          result.InsertJSonTableDataWithParameterResult?._ ||
          result.InsertJSonTableDataWithParameterResult;

        return { tableName, query: updateQuery, response: responseValue };
      };

      const results = {};

      // --- Case 1: new payload with head + details ---
      if (head) {
        results.head = await runUpdate(head.tableName, head.data, head.where, loginUser);

        results.details = [];
        if (Array.isArray(details)) {
          for (const det of details) {
            const r = await runUpdate(det.tableName, det.data, det.where, loginUser);
            results.details.push(r);
          }
        }

        return res.json({
          success: true,
          message: "Head and details updated successfully",
          results,
        });
      }

      // --- Case 2: legacy single table payload ---
      if (tableName && data && where) {
        const singleResult = await runUpdate(tableName, data, where, loginUser);
        return res.json({ success: true, ...singleResult });
      }

      return res.status(400).json({ success: false, error: "Invalid payload format" });
    } catch (err) {
      console.error("❌ Error in updateGRNTableData:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },


  // Delete table data
  deleteTableData: async function (req, res) {
    const { tableName, where } = req.body;
    const companyData = req.companyData;

    if (!tableName) {
      return res.status(400).json({ success: false, error: "Table name is required" });
    }
    if (!where || typeof where !== "object") {
      return res.status(400).json({ success: false, error: "WHERE condition is required" });
    }

    try {
      const companyOffcode = companyData?.company?.offcode;

      // Ensure offcode exists in WHERE clause
      const finalWhere = { ...where };
      if (!finalWhere.offcode && companyOffcode) {
        finalWhere.offcode = companyOffcode;
      }

      // Build query
      const whereClause = utils.buildWhereClause(finalWhere);
      const deleteQuery = `DELETE FROM ${tableName} WHERE ${whereClause};`;

      const client = await soap.createClientAsync("http://192.168.100.103/smartapi/service.asmx?wsdl");
      const args = {
        vJsonTable: JSON.stringify([where]),
        vQuery_SPName: deleteQuery,
        isStoreProcedure: false,
      };

      const [result] = await client.InsertJSonTableDataWithParameterAsync(args);
      const responseValue =
        result.InsertJSonTableDataWithParameterResult?._ ||
        result.InsertJSonTableDataWithParameterResult;

      res.json({
        success: true,
        query: deleteQuery,
        offcode: companyOffcode,
        response: responseValue,
      });
    } catch (err) {
      console.error("Error in /delete-table-data:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Load status controls
  loadStatusControls: async function (req, res) {
    const { screenName, createdby } = req.body;
    const companyData = req.companyData;

    if (!screenName || !createdby) {
      return res.status(400).json({
        success: false,
        error: "screenName and createdby are required",
      });
    }

    try {
      const company = companyData.company;
      const menus = companyData.menu || [];
      const offcode = company?.offcode;

      // ✅ Find menu ID by screen name
      const menu = menus.find((m) => m.title === screenName);
      if (!menu) {
        return res.status(404).json({
          success: false,
          error: `Menuid not found for screenName ${screenName}`,
        });
      }
      const cMenuid = menu.id;

      // ✅ Get user ID
      let userid;
      if (isNaN(createdby)) {
        const userQuery = `SELECT Uid FROM comUsers WHERE Userlogin = '${createdby}'`;
        const userRows = await utils.executeSoapQuery(userQuery);
        if (userRows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `Failed to fetch userid from comUsers for ${createdby}`,
          });
        }
        userid = userRows[0]?.Uid?.[0];
      } else {
        userid = createdby;
      }

      // ✅ Get status code + cname
      const statusQuery = `
      SELECT TOP 1 ccode, cname
      FROM tblDocumentStatus
      WHERE isactive = '1' AND Menuid = '${cMenuid}'
    `;
      const statusRows = await utils.executeSoapQuery(statusQuery);
      if (statusRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: `No active status found for Menuid ${cMenuid}`,
        });
      }

      const cStatusid = statusRows[0]?.ccode?.[0];
      const statusName = statusRows[0]?.cname?.[0]; // ✅ cname → status

      // ✅ Call CMB_LoadStatusControls SOAP method
      const client = await soap.createClientAsync(
        "http://192.168.100.103/smartapi/service.asmx?wsdl"
      );
      const soapArgs = { cMenuid, userid, offcode, cStatusid };

      console.log("📤 Sending SOAP args:", soapArgs);

      const [result] = await client.CMB_LoadStatusControlsAsync(soapArgs);

      res.json({
        success: true,
        sentArgs: soapArgs,
        status: statusName, // ✅ cname is returned as status
        response: result,
      });
    } catch (error) {
      console.error("❌ Error in /load-status-controls:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  updatePOQuantity: async function (req, res) {
    try {
      const { poNo, itemCode, grnQty, grnNo, offcode = "0101" } = req.body;

      // Validate required fields
      if (!poNo || !itemCode || !grnQty) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields: poNo, itemCode, grnQty"
        });
      }

      // Build query (use vno instead of PO)
      const updateQuery = `
      UPDATE invPOdet
      SET Recivedqty = ISNULL(Recivedqty, 0) + ${grnQty},
          editdate = '${new Date().toISOString().slice(0, 19).replace("T", " ")}'
      WHERE vno = '${poNo}'
        AND Itemcode = ${itemCode}   -- int type, don’t wrap in quotes
        AND offcode = '${offcode}'
    `;

      console.log("Executing PO update query:", updateQuery);

      // Execute query
      await utils.executeSoapQuery(updateQuery);

      // Response
      res.json({
        success: true,
        message: "PO quantity updated successfully",
        poNo,
        itemCode,
        grnQty,
        grnNo
      });
    } catch (err) {
      console.error("Error updating PO quantity:", err);
      res.status(500).json({
        success: false,
        error: err.message,
        details: "Failed to update PO quantity"
      });
    }
  }

};

// ----------------- ROUTES -----------------
router.post("/get-table-headers", middlewares.validateTableName, handlers.getTableHeaders);
router.post("/get-table-data", middlewares.validateTableName, middlewares.addCompanyData, handlers.getTableData);
router.post("/get-GRNtable-data", middlewares.validateTableName, middlewares.addCompanyData, handlers.getGRNTableData);
router.post("/get-table-structure", middlewares.validateTableName, handlers.getTableStructure);
router.post("/get-table-relationships", middlewares.validateTableName, handlers.getTableRelationships);
router.post("/get-parent-table-data", handlers.getParentTableData);
router.post("/Sinsert-table-data", middlewares.addCompanyData, handlers.SinsertTableData);
router.post("/insert-table-data", middlewares.addCompanyData, handlers.insertTableData);
router.post("/insert-head-det", middlewares.addCompanyData, handlers.insertHeadDet);
router.post("/insert-SThead-det", middlewares.addCompanyData, handlers.insertSTHeadDet);
router.post("/insert-EmployeeHeadDet", middlewares.addCompanyData, handlers.insertEmployeeHeadDetAll);
router.post("/insert-GRNHeadDet", middlewares.addCompanyData, handlers.insertGRNHeadDet);
router.post("/insert-PurchaseOrders", middlewares.addCompanyData, handlers.getPurchaseOrders);
router.post("/Supdate-table-data", middlewares.addCompanyData, handlers.SupdateTableData);
router.post("/update-table-data", middlewares.addCompanyData, handlers.updateTableData);
router.post("/update-GRNtable-data", middlewares.addCompanyData, handlers.updateGRNTableData);
router.post("/delete-table-data", middlewares.addCompanyData, handlers.deleteTableData);
router.post("/load-status-controls", middlewares.addCompanyData, handlers.loadStatusControls);
router.post("/updatePOQuantity", middlewares.addCompanyData, handlers.updatePOQuantity);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Table API is running",
    timestamp: new Date().toISOString()
  });
});

module.exports = router;