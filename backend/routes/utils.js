// utils.js - Improved version
const soap = require("soap");
const { parseStringPromise } = require("xml2js");

module.exports.executeSoapQuery = async function (query) {
  try {
    const client = await soap.createClientAsync(
      "http://192.168.100.103/smartapi/service.asmx?wsdl"
    );

    const [result] = await client.ExecuteQueryAsync({ vQuery: query });

    if (!result?.ExecuteQueryResult) {
      console.warn("SOAP returned empty result for query:", query);
      return { rows: [], raw: null, success: true };
    }

    const xml = result.ExecuteQueryResult;

    // Check if it's a non-SELECT query (INSERT/UPDATE/DELETE)
    if (typeof xml === 'string' && !xml.includes('<?xml')) {
      return { 
        rows: [], 
        raw: xml, 
        success: true,
        affected: xml.includes('affected') || xml.includes('success') 
      };
    }

    // Try parsing XML for SELECT queries
    let parsed;
    try {
      parsed = await parseStringPromise(xml);
    } catch (parseErr) {
      // Not XML or invalid XML, return raw string
      return { rows: [], raw: xml, success: true };
    }

    const rows = parsed?.NewDataSet?.Table || [];

    return { 
      rows: Array.isArray(rows) ? rows : [], 
      raw: xml, 
      success: true 
    };
  } catch (err) {
    console.error("SOAP query execution error:", err.message, "for query:", query);
    console.log("SOAP raw response:", result.ExecuteQueryResult);

    return { 
      rows: [], 
      raw: null, 
      success: false, 
      error: err.message 
    };
  }
};