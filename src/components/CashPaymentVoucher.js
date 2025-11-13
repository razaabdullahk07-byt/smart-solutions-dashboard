import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { 
  FaSave, FaSync, FaEdit, FaPlus, FaTrash, 
  FaCalendarAlt, FaReceipt, FaMoneyBillWave, 
  FaCodeBranch, FaProjectDiagram, FaFileAlt,
  FaSearchDollar, FaBalanceScale, FaCheckCircle,
  FaTimesCircle, FaDollarSign, FaCalculator
} from "react-icons/fa";
import "./CashPaymentVoucher.css";

const CashPaymentVoucher = () => {
  const { credentials } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [projects, setProjects] = useState([]);
  const [voucherTypes, setVoucherTypes] = useState([
    { code: "CPV", name: "Cash Payment Voucher" },
    { code: "CRV", name: "Cash Receipt Voucher" },
    { code: "BPV", name: "Bank Payment Voucher" },
    { code: "BRV", name: "Bank Receipt Voucher" },
    { code: "JV", name: "Journal Voucher" }
  ]);
  const [successMessage, setSuccessMessage] = useState("");

  // State for HEAD form
  const [head, setHead] = useState({
    vdate: new Date().toISOString().split('T')[0],
    vtype: "CPV",
    Amount: "",
    currencyrate: "1",
    compcode: "01",
    offcode: "",
    createdby: credentials?.username || "",
    ProjectCode: "",
    ManualRefNo: ""
  });

  // State for detail rows
  const [details, setDetails] = useState([
    {
      code: "",
      name: "",
      narration: "",
      chequeno: "",
      debit: 0,
      credit: 0,
      EntryType: "D",
      amount: 0,
      IsActive: "false",
      FCdebit: 0,
      FCcredit: 0,
      FCAmount: 0
    }
  ]);

  // Load accounts, branches, and projects
  useEffect(() => {
    if (credentials?.username) {
      setHead(prev => ({ ...prev, createdby: credentials.username }));
    }
    
    // Simulate loading accounts, branches, and projects
    const loadData = async () => {
      try {
        // In a real app, you would fetch these from your API
        setAccounts([
          { code: "1001", name: "Cash Account" },
          { code: "2001", name: "Accounts Payable" },
          { code: "3001", name: "Office Expenses" },
          { code: "4001", name: "Travel Expenses" },
          { code: "5001", name: "Salaries Payable" },
          { code: "6001", name: "Utilities Expense" }
        ]);
        
        setBranches([
          { code: "0101", name: "Main Branch" },
          { code: "0102", name: "North Branch" },
          { code: "0103", name: "South Branch" },
          { code: "0104", name: "East Branch" },
          { code: "0105", name: "West Branch" }
        ]);
        
        setProjects([
          { code: "P001", name: "Project Alpha" },
          { code: "P002", name: "Project Beta" },
          { code: "P003", name: "Project Gamma" },
          { code: "P004", name: "Project Delta" }
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadData();
  }, [credentials]);

  // Handle HEAD field change
  const handleHeadChange = (e) => {
    const { name, value } = e.target;
    setHead({ ...head, [name]: value });
  };

  // Handle detail row field change
  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...details];
    
    if (name === "code") {
      // Find the account name when code is selected
      const selectedAccount = accounts.find(acc => acc.code === value);
      updated[index].code = value;
      updated[index].name = selectedAccount ? selectedAccount.name : "";
      updated[index].EntryType = value.startsWith("1") || value.startsWith("3") || value.startsWith("4") || value.startsWith("6") ? "D" : "C";
    } else {
      updated[index][name] = 
        name === "debit" || name === "credit" || name === "amount" || name.startsWith("FC")
          ? parseFloat(value) || 0
          : value;
    }
    
    // Auto-calculate amount based on debit/credit
    if (name === "debit" || name === "credit") {
      updated[index].amount = parseFloat(updated[index].debit) || parseFloat(updated[index].credit) || 0;
    }
    
    setDetails(updated);
  };

  const addRow = () => {
    setDetails([
      ...details,
      {
        code: "",
        name: "",
        narration: "",
        chequeno: "",
        debit: 0,
        credit: 0,
        EntryType: "D",
        amount: 0,
        IsActive: "false",
        FCdebit: 0,
        FCcredit: 0,
        FCAmount: 0
      }
    ]);
  };

  const removeRow = (index) => {
    if (details.length > 1) {
      const updated = [...details];
      updated.splice(index, 1);
      setDetails(updated);
    }
  };

  // Calculate totals
  const totalDebit = details.reduce((sum, row) => sum + (parseFloat(row.debit) || 0), 0);
  const totalCredit = details.reduce((sum, row) => sum + (parseFloat(row.credit) || 0), 0);
  const balance = totalDebit - totalCredit;

  // Insert new voucher
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Math.abs(balance) > 0.01) {
      alert(`Voucher is not balanced! Difference: ${balance.toFixed(2)}`);
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        head: {
          tableName: "acGLhead",
          data: {
            ...head,
            Amount: totalDebit
          }
        },
        details: details.map((row) => ({
          tableName: "acGLdet",
          data: row
        })),
        selectedBranch: head.offcode
      };

      const response = await axios.post(
        "http://localhost:8081/api/insert-SThead-det",
        payload
      );

      if (response.data.success) {
        setSuccessMessage("Voucher saved successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
        resetForm();
      } else {
        alert("Error: " + (response.data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Insert failed:", err);
      alert("Error inserting voucher");
    } finally {
      setLoading(false);
    }
  };

  // Update voucher
  const handleUpdate = async () => {
    if (!head.vtype || !head.vdate) {
      alert("Voucher type and date are required for update");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tableName: "acGLhead",
        data: head,
        where: { vtype: head.vtype, vdate: head.vdate },
        loginUser: credentials?.username || "system"
      };

      const response = await axios.post(
        "http://localhost:8081/api/update-table-data",
        payload
      );

      if (response.data.success) {
        setSuccessMessage("Voucher updated successfully!");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        alert("Update failed: " + (response.data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Error updating voucher");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setHead({
      vdate: new Date().toISOString().split('T')[0],
      vtype: "CPV",
      Amount: "",
      currencyrate: "1",
      compcode: "01",
      offcode: "",
      createdby: credentials?.username || "",
      ProjectCode: "",
      ManualRefNo: ""
    });
    setDetails([
      {
        code: "",
        name: "",
        narration: "",
        chequeno: "",
        debit: 0,
        credit: 0,
        EntryType: "D",
        amount: 0,
        IsActive: "false",
        FCdebit: 0,
        FCcredit: 0,
        FCAmount: 0
      }
    ]);
  };

  return (
    <div className="voucher-container">
      <div className="header-section">
        <h2><FaMoneyBillWave /> Cash Payment Voucher</h2>
        <div className="accent-line"></div>
      </div>

      {successMessage && (
        <div className="success-message">
          <FaCheckCircle /> {successMessage}
        </div>
      )}

      {loading && <div className="loading-overlay">Processing...</div>}

      <form onSubmit={handleSubmit} className="voucher-form glassmorphism">
        {/* HEAD Section */}
        <div className="form-section">
          <h3><FaReceipt /> Voucher Header</h3>
          <div className="form-row">
            <div className="form-group">
              <label><FaCalendarAlt /> Date *</label>
              <div className="input-with-icon">
                <FaCalendarAlt className="input-icon" />
                <input
                  type="date"
                  name="vdate"
                  value={head.vdate}
                  onChange={handleHeadChange}
                  className="modern-input"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label><FaFileAlt /> Voucher Type *</label>
              <div className="input-with-icon">
                <FaFileAlt className="input-icon" />
                <select
                  name="vtype"
                  value={head.vtype}
                  onChange={handleHeadChange}
                  className="modern-input"
                  required
                >
                  {voucherTypes.map(type => (
                    <option key={type.code} value={type.code}>
                      {type.code} - {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label><FaDollarSign /> Amount *</label>
              <div className="input-with-icon">
                <FaDollarSign className="input-icon" />
                <input
                  type="number"
                  name="Amount"
                  value={head.Amount}
                  onChange={handleHeadChange}
                  className="modern-input"
                  required
                  step="0.01"
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><FaMoneyBillWave /> Currency Rate</label>
              <div className="input-with-icon">
                <FaMoneyBillWave className="input-icon" />
                <input
                  type="number"
                  name="currencyrate"
                  value={head.currencyrate}
                  onChange={handleHeadChange}
                  className="modern-input"
                  step="0.0001"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label><FaCodeBranch /> Branch *</label>
              <div className="input-with-icon">
                <FaCodeBranch className="input-icon" />
                <select
                  name="offcode"
                  value={head.offcode}
                  onChange={handleHeadChange}
                  className="modern-input"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.code} value={branch.code}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label><FaProjectDiagram /> Project</label>
              <div className="input-with-icon">
                <FaProjectDiagram className="input-icon" />
                <select
                  name="ProjectCode"
                  value={head.ProjectCode}
                  onChange={handleHeadChange}
                  className="modern-input"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.code} value={project.code}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label><FaFileAlt /> Manual Reference No.</label>
              <div className="input-with-icon">
                <FaFileAlt className="input-icon" />
                <input
                  type="text"
                  name="ManualRefNo"
                  value={head.ManualRefNo}
                  onChange={handleHeadChange}
                  className="modern-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label><FaReceipt /> Created By</label>
              <div className="input-with-icon">
                <FaReceipt className="input-icon" />
                <input
                  type="text"
                  name="createdby"
                  value={head.createdby}
                  className="modern-input"
                  readOnly
                />
              </div>
            </div>
            
            <div className="form-group">
              <label><FaCodeBranch /> Company Code</label>
              <div className="input-with-icon">
                <FaCodeBranch className="input-icon" />
                <input
                  type="text"
                  name="compcode"
                  value={head.compcode}
                  className="modern-input"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS Section */}
        <div className="form-section">
          <div className="section-header">
            <h3><FaSearchDollar /> Voucher Details</h3>
            <button type="button" className="btn add-row" onClick={addRow}>
              <FaPlus /> Add Row
            </button>
          </div>
          
          <div className="details-container">
            <div className="details-header">
              <div>Account Code</div>
              <div>Account Name</div>
              <div>Narration</div>
              <div>Cheque No.</div>
              <div>Debit</div>
              <div>Credit</div>
              <div>Action</div>
            </div>
            
            {details.map((row, idx) => (
              <div key={idx} className="detail-row">
                <select
                  name="code"
                  value={row.code}
                  onChange={(e) => handleDetailChange(idx, e)}
                  className="modern-input"
                  required
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.code} value={acc.code}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  name="name"
                  value={row.name}
                  onChange={(e) => handleDetailChange(idx, e)}
                  className="modern-input"
                  readOnly
                />
                
                <input
                  type="text"
                  name="narration"
                  placeholder="Narration"
                  value={row.narration}
                  onChange={(e) => handleDetailChange(idx, e)}
                  className="modern-input"
                />
                
                <input
                  type="text"
                  name="chequeno"
                  placeholder="Cheque No."
                  value={row.chequeno}
                  onChange={(e) => handleDetailChange(idx, e)}
                  className="modern-input"
                />
                
                <input
                  type="number"
                  name="debit"
                  placeholder="Debit"
                  value={row.debit}
                  onChange={(e) => handleDetailChange(idx, e)}
                  className="modern-input"
                  step="0.01"
                />
                
                <input
                  type="number"
                  name="credit"
                  placeholder="Credit"
                  value={row.credit}
                  onChange={(e) => handleDetailChange(idx, e)}
                  className="modern-input"
                  step="0.01"
                />
                
                <button 
                  type="button" 
                  className="btn remove" 
                  onClick={() => removeRow(idx)}
                  disabled={details.length <= 1}
                  title="Remove Row"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          
          <div className="totals-row">
            <div>Total</div>
            <div></div>
            <div></div>
            <div></div>
            <div className={balance !== 0 ? "amount-error" : "amount-total"}>
              {totalDebit.toFixed(2)}
            </div>
            <div className={balance !== 0 ? "amount-error" : "amount-total"}>
              {totalCredit.toFixed(2)}
            </div>
            <div></div>
          </div>
          
          <div className="balance-row">
            <div className="balance-label">
              <FaBalanceScale /> Balance:
            </div>
            <div className={balance !== 0 ? "balance-amount error" : "balance-amount success"}>
              {balance.toFixed(2)}
              {balance === 0 ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
          </div>
          
          {Math.abs(balance) > 0.01 && (
            <div className="error-message">
              <FaTimesCircle /> Voucher is not balanced! Difference: {balance.toFixed(2)}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn save" disabled={loading || Math.abs(balance) > 0.01}>
            {loading ? "Processing..." : <><FaSave /> Save Voucher</>}
          </button>
          <button type="button" className="btn update" onClick={handleUpdate} disabled={loading}>
            {loading ? "Processing..." : <><FaEdit /> Update Voucher</>}
          </button>
          <button type="button" className="btn cancel" onClick={resetForm} disabled={loading}>
            <FaSync /> Reset Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default CashPaymentVoucher;