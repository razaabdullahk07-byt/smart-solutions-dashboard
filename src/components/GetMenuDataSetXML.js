import React, { useState } from "react";
import "./App.css";

function GetMenuDataSetXML({ setCompanyData }) {
  const [username, setUsername] = useState("administrator");
  const [userpassword, setUserpassword] = useState("admin");
  const [menuid, setMenuid] = useState("01");
  const [nooftables, setNoOfTables] = useState("1");

  const [parsedXML, setParsedXML] = useState("");
  const [rawXML, setRawXML] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch("http://192.168.100.113:8081/api/get-menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          userpassword,
          Menuid: menuid,
          nooftables,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }

      const xmlString = result?.data?.[0]?.GetMenuDataSetXMLResult?.["$value"];
      
      if (xmlString) {
        setRawXML(xmlString);
        
        // Parse XML
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlString, "text/xml");
        const offcode = xml.getElementsByTagName("offcode")[0]?.textContent;
        const offdesc = xml.getElementsByTagName("offdesc")[0]?.textContent;

        setParsedXML(`Office Code: ${offcode}, Description: ${offdesc}`);
        
        // Update company data in parent component
        if (result.company) {
          setCompanyData(result.company);
        }
      } else {
        setRawXML("No XML found");
        setParsedXML("No data parsed");
      }
    } catch (error) {
      console.error("Error fetching XML:", error);
      setError(error.message);
      setParsedXML("Error fetching data");
      setRawXML("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="menu-container">
      <h2>Get Menu Data (SOAP)</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Username:</label>
        <input 
          type="text"
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Password:</label>
        <input 
          type="password"
          value={userpassword} 
          onChange={(e) => setUserpassword(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>Menu ID:</label>
        <input 
          type="text"
          value={menuid} 
          onChange={(e) => setMenuid(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label>No of Tables:</label>
        <input 
          type="text"
          value={nooftables} 
          onChange={(e) => setNoOfTables(e.target.value)} 
        />
      </div>

      <button onClick={fetchData} disabled={loading}>
        {loading ? "Fetching Data..." : "Fetch Menu"}
      </button>

      <div className="results-container">
        <h3>Parsed Data:</h3>
        <pre>{parsedXML}</pre>

        <h3>Raw XML:</h3>
        <pre className="xml-display">{rawXML}</pre>
      </div>
    </div>
  );
}

export default GetMenuDataSetXML;