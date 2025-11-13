// EmployeeManagement.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaEye, FaGraduationCap,
  FaBriefcase, FaMoneyBill, FaMoneyCheck, FaUsers, FaIdCard, FaBuilding,
  FaCalendar, FaMoneyBillWave, FaPercent, FaVenusMars, FaRing, FaGlobe,
  FaUniversity, FaChartLine, FaTrash, FaClock, FaCheckSquare, FaUpload,
  FaUser, FaEnvelope, FaPhone, FaMapMarker, FaBirthdayCake, FaTransgender,
  FaIdCardAlt, FaUserTie, FaBuilding as FaOffice, FaMoneyBillAlt
} from "react-icons/fa";
import "./HRMSDesignation.css";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { AuthContext } from "../AuthContext"; // Adjust path as needed

const EmployeeManagement = () => {
  // Get logged in user from context
  const { credentials } = useContext(AuthContext);
  
  // ---- State ----
  const [employees, setEmployees] = useState([]);
  const [academicInfo, setAcademicInfo] = useState([]);
  const [employmentHistory, setEmploymentHistory] = useState([]);
  const [grantAllowances, setGrantAllowances] = useState([]);
  const [grantDeductions, setGrantDeductions] = useState([]);
  const [familyDetails, setFamilyDetails] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);

  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState("new");
  const [formData, setFormData] = useState({});
  const [tableHeaders, setTableHeaders] = useState({});

  // related data shown in UI
  const [relatedData, setRelatedData] = useState({
    academic: [],
    employment: [],
    allowances: [],
    deductions: [],
    family: [],
    attendance: []
  });

  // inline edit buffers for related rows (keeps edits separate until saved)
  const [relatedEditData, setRelatedEditData] = useState({});
  const [relatedEditMode, setRelatedEditMode] = useState({});

  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  // ---- API endpoints (adjust base as needed) ----
  const API_BASE = "http://192.168.100.113:8081/api";
  // This endpoint matches the backend function name you pasted
  const API_INSERT_ALL = `${API_BASE}/insert-EmployeeHeadDet`;
  const API_INSERT_SPEC = `${API_BASE}/insert-table-data`;
  const API_DELETE = `${API_BASE}/delete-table-data`;
  const API_UPDATE = `${API_BASE}/update-table-data`;
  const API_GET_TABLE_DATA = `${API_BASE}/get-table-data`;
  const API_GET_TABLE_HEADERS = `${API_BASE}/get-table-headers`;

  // ---- helper fetch ----
  const fetchJson = async (url, options = {}) => {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} ${text}`);
    }
    return await res.json();
  };

  // ---- label helpers ----
  const getDepartmentName = useCallback((code) => {
    if (!code) return "N/A";
    const dept = departments.find(d => d.Code === code || d.code === code);
    return dept ? (dept.Name || dept.description || dept.name) : code;
  }, [departments]);

  const getDesignationName = useCallback((code) => {
    if (!code) return "N/A";
    const desig = designations.find(d => d.Code === code || d.code === code);
    return desig ? (desig.Name || desig.description || desig.name) : code;
  }, [designations]);

  const getAllowanceName = useCallback((code) => {
    if (!code) return "N/A";
    const allowance = allowanceTypes.find(a => a.Code === code || a.code === code);
    return allowance ? (allowance.Name || allowance.description || allowance.name) : code;
  }, [allowanceTypes]);

  const getDeductionName = useCallback((code) => {
    if (!code) return "N/A";
    const deduction = deductionTypes.find(d => d.Code === code || d.code === code);
    return deduction ? (deduction.Name || deduction.description || deduction.name) : code;
  }, [deductionTypes]);

  const safeDate = (d) => {
    if (!d) return "N/A";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d || "N/A";
      return date.toLocaleDateString();
    } catch {
      return d || "N/A";
    }
  };

  // ---- fetch headers function ----
  const fetchTableHeaders = async () => {
    try {
      const tableNames = [
        "HRMSEmployee",
        "HRMSEmployeeAcademicInfo",
        "HRMSEmployementHistory",
        "HRMSEmployeeGrantAllowance",
        "HRMSEmployeeGrantDeduction",
        "HRMSEmployeeFamilyDet",
        "HRMSEmployeeAttendance"
      ];

      const out = {};
      for (const t of tableNames) {
        try {
          const res = await fetchJson(API_GET_TABLE_HEADERS, {
            method: "POST",
            body: JSON.stringify({ tableName: t })
          });
          out[t] = res.fields || res;
        } catch (err) {
          console.warn("Header fetch failed for", t, err.message);
        }
      }
      setTableHeaders(out);
    } catch (err) {
      console.error("fetchTableHeaders error:", err);
    }
  };

  // ---- initial data fetch ----
  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        empRes, academicRes, historyRes, allowanceRes, deductionRes,
        familyRes, attendanceRes, deptRes, desigRes, allowanceTypesRes, deductionTypesRes
      ] = await Promise.all([
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSEmployee"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSEmployeeAcademicInfo"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSEmployementHistory"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSEmployeeGrantAllowance"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSEmployeeGrantDeduction"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSEmployeeFamilyDet"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSEmployeeAttendance"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSDepartment"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSDesignation"  }) }),
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSAllowanceType"  }) }), // Changed to HRMSAllowance
        fetchJson(`${API_GET_TABLE_DATA}`, { method: "POST", body: JSON.stringify({ tableName: "HRMSDeductionType"  }) }) // Changed to HRMSDeduction
      ]);

      if (empRes?.success) setEmployees(empRes.rows || empRes.data || []);
      if (academicRes?.success) setAcademicInfo(academicRes.rows || academicRes.data || []);
      if (historyRes?.success) setEmploymentHistory(historyRes.rows || historyRes.data || []);
      if (allowanceRes?.success) setGrantAllowances(allowanceRes.rows || allowanceRes.data || []);
      if (deductionRes?.success) setGrantDeductions(deductionRes.rows || deductionRes.data || []);
      if (familyRes?.success) setFamilyDetails(familyRes.rows || familyRes.data || []);
      if (attendanceRes?.success) setAttendanceData(attendanceRes.rows || attendanceRes.data || []);
      if (deptRes?.success) setDepartments(deptRes.rows || deptRes.data || []);
      if (desigRes?.success) setDesignations(desigRes.rows || desigRes.data || []);
      if (allowanceTypesRes?.success) setAllowanceTypes(allowanceTypesRes.rows || allowanceTypesRes.data || []);
      if (deductionTypesRes?.success) setDeductionTypes(deductionTypesRes.rows || deductionTypesRes.data || []);

      setFilteredEmployees(empRes?.rows || empRes?.data || []);
    } catch (err) {
      setError("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // fetch headers + data on mount
  useEffect(() => {
    (async () => {
      await fetchTableHeaders();
      await fetchEmployeeData();
    })();
  }, []);

  // ---- filtering logic ----
  useEffect(() => {
    let filtered = employees || [];
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((item) =>
        ["Code", "Name", "FName", "LName", "DepartmentCode", "DesignationCode"].some(
          (key) => item[key] && item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (activeFilter !== "all") {
      const isActive = activeFilter === "active";
      filtered = filtered.filter((item) => {
        const activeValue = item.IsActive ?? item.isactive ?? item.Active ?? false;
        const itemActive =
          typeof activeValue === "boolean"
            ? activeValue
            : activeValue === "true" || activeValue === "1" || activeValue === 1;
        return itemActive === isActive;
      });
    }
    setFilteredEmployees(filtered);
  }, [searchTerm, activeFilter, employees]);

  // ---- related data getter for chosen employee code ----
  const getEmployeeRelatedData = useCallback((code) => {
    if (!code) {
      setRelatedData({ academic: [], employment: [], allowances: [], deductions: [], family: [], attendance: [] });
      return;
    }
    const academic = (academicInfo || []).filter(item => item.Code === code);
    const employment = (employmentHistory || []).filter(item => item.Code === code);
    const allowances = (grantAllowances || []).filter(item => item.Code === code);
    const deductions = (grantDeductions || []).filter(item => item.Code === code);
    const family = (familyDetails || []).filter(item => item.Code === code);
    const attendance = (attendanceData || []).filter(item => item.EmployeeCode === code || item.Code === code);

    setRelatedData({ academic, employment, allowances, deductions, family, attendance });
    setRelatedEditMode({});
    setRelatedEditData({});
  }, [academicInfo, employmentHistory, grantAllowances, grantDeductions, familyDetails, attendanceData]);

  // ---- selecting an employee ----
  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setActiveTab("basic");
    setIsEditing(false);
    setFormData(employee || {});
    getEmployeeRelatedData(employee?.Code);
  };

  const handleCloseDetails = () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setRelatedEditData({});
    setRelatedEditMode({});
    setFormData({});
  };

  const handleEdit = () => { setIsEditing(true); setEditMode("edit"); };

  // ---- input change ----
  const handleInputChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    if (type === "file") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setFormData(prev => ({ ...prev, [name]: ev.target.result }));
        reader.readAsDataURL(file);
      }
    } else if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: checked ? "true" : "false" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ---- related row edit/new/delete/save handlers ----
  const handleRelatedEdit = (table, index) => {
    setRelatedEditMode(prev => ({
      ...prev,
      [table]: { ...prev[table], [index]: true }
    }));
    const item = (relatedData[table] && relatedData[table][index]) || {};
    setRelatedEditData(prev => ({
      ...prev,
      [table]: { ...prev[table], [index]: { ...item } }
    }));
  };

  const handleRelatedCancel = (table, index) => {
    setRelatedEditMode(prev => ({
      ...prev,
      [table]: { ...prev[table], [index]: false }
    }));
    setRelatedEditData(prev => ({
      ...prev,
      [table]: { ...prev[table], [index]: {} }
    }));
  };

  const handleRelatedNew = (table) => {
    const codeForLink = selectedEmployee?.Code || formData?.Code || "";
    const blank = { Code: codeForLink  };

    setRelatedData(prev => {
      const arr = [...(prev[table] || []), blank];
      const newIndex = arr.length - 1;
      setRelatedEditMode(prevMode => ({
        ...prevMode,
        [table]: { ...(prevMode[table] || {}), [newIndex]: true }
      }));
      setRelatedEditData(prevEdit => ({
        ...prevEdit,
        [table]: { ...(prevEdit[table] || {}), [newIndex]: { ...blank } }
      }));
      return { ...prev, [table]: arr };
    });
  };

  const handleRelatedInputChange = (table, field, value, index) => {
    setRelatedEditData(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [index]: {
          ...(prev[table] && prev[table][index] || {}),
          [field]: value
        }
      }
    }));
  };

  const getTableName = (table) => {
    const tableMap = {
      academic: "HRMSEmployeeAcademicInfo",
      employment: "HRMSEmployementHistory",
      allowances: "HRMSEmployeeGrantAllowance",
      deductions: "HRMSEmployeeGrantDeduction",
      family: "HRMSEmployeeFamilyDet",
      attendance: "HRMSEmployeeAttendance"
    };
    return tableMap[table] || table;
  };

  // Get primary key field for a record
  const getPrimaryKeyField = (record) => {
    if (!record || typeof record !== "object") return null;
    if ("Pk" in record) return "Pk";
    if ("PK" in record) return "PK";
    if ("id" in record) return "id";
    if ("EHID" in record) return "EHID";
    return null;
  };

  // Merge a table's relatedData + relatedEditData into final rows for saving the head + details.
  const getMergedRelatedRows = (table, headData) => {
    const raw = relatedData[table] || [];
    const edits = (relatedEditData[table] && Object.keys(relatedEditData[table]).length > 0) ? relatedEditData[table] : null;
    // start with raw rows
    const rows = [...raw];
    // apply edits
    if (edits) {
      Object.entries(edits).forEach(([k, v]) => {
        const idx = Number(k);
        rows[idx] = { ...(rows[idx] || {}), ...(v || {}) };
      });
    }
    // ensure every row has Code/offcode from headData
    const normalized = rows.map(r => ({ ...r, Code: headData.Code, offcode: headData.offcode || "0101" }));
    // remove rows that are effectively empty (no meaningful data besides Code/offcode)
    const filtered = normalized.filter(row => {
      const keys = Object.keys(row).filter(k => k.toLowerCase() !== "code" && k.toLowerCase() !== "offcode");
      return keys.some(k => row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "");
    });
    return filtered;
  };

  const handleRelatedSave = async (table, index) => {
    try {
      const buffer = (relatedEditData[table] && relatedEditData[table][index]) || (relatedData[table] && relatedData[table][index]) || {};
      const original = (relatedData[table] && relatedData[table][index]) || {};
      const codeForLink = selectedEmployee?.Code || formData?.Code || "";

      if (!buffer.Code) buffer.Code = codeForLink;
      if (!buffer.offcode) buffer.offcode = "0101";

      const pkField = getPrimaryKeyField(buffer) || getPrimaryKeyField(original);
      const recordId = pkField ? (buffer[pkField] || original[pkField]) : null;

      const tableName = getTableName(table);
      let res;

      if (recordId) {
        // Update existing record
        const where = { [pkField]: recordId };

        // remove PK from data before sending
        const { [pkField]: _, ...updateData } = buffer;

        res = await fetchJson(API_UPDATE, {
          method: "POST",
          body: JSON.stringify({
            tableName,
            data: updateData,
            where
          })
        });

      } else {
        // Insert new record - use generic insert endpoint shape the backend accepts for single-table insert
        // Some backends have a dedicated single-insert endpoint; if yours does, replace API_INSERT_SPEC/API_INSERT_ALL here
        res = await fetchJson(API_INSERT_SPEC, {
          method: "POST",
          body: JSON.stringify({
            tableName,
            data: buffer
          })
        });
      }

      if (res?.success) {
        // Update frontend state
        const newRow = res.row || res.insertedRow || buffer;

        setRelatedData(prev => {
          const updated = [...(prev[table] || [])];
          updated[index] = newRow;
          return { ...prev, [table]: updated };
        });

        setRelatedEditMode(prev => ({
          ...prev,
          [table]: { ...prev[table], [index]: false }
        }));

        setRelatedEditData(prev => ({
          ...prev,
          [table]: { ...prev[table], [index]: {} }
        }));

        await fetchEmployeeData();
        if (selectedEmployee?.Code) getEmployeeRelatedData(selectedEmployee.Code);
        setError(null);
      } else {
        setError("❌ Save failed: " + (res.error || "Unknown"));
      }
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  const handleRelatedDelete = async (table, index) => {
    const conf = window.confirm("Are you sure you want to delete this record?");
    if (!conf) return;

    try {
      const record = (relatedData[table] && relatedData[table][index]) || {};
      const pkField = getPrimaryKeyField(record);
      const recordId = record[pkField] || record.Pk || record.PK || record.id;

      if (!recordId) {
        // Remove unsaved row from UI
        setRelatedData(prev => ({
          ...prev,
          [table]: (prev[table] || []).filter((_, i) => i !== index)
        }));

        setRelatedEditMode(prev => ({
          ...prev,
          [table]: Object.fromEntries(
            Object.entries(prev[table] || {})
              .filter(([k]) => Number(k) !== index)
              .map(([k, v]) => [Number(k) < index ? Number(k) : Number(k) - 1, v])
          )
        }));

        setRelatedEditData(prev => ({
          ...prev,
          [table]: Object.fromEntries(
            Object.entries(prev[table] || {})
              .filter(([k]) => Number(k) !== index)
              .map(([k, v]) => [Number(k) < index ? Number(k) : Number(k) - 1, v])
          )
        }));
        return;
      }

      const tableName = getTableName(table);
      const where = { [pkField]: recordId };

      const res = await fetchJson(API_DELETE, {
        method: "POST",
        body: JSON.stringify({
          tableName,
          where
        })
      });

      if (res?.success) {
        setRelatedData(prev => ({
          ...prev,
          [table]: (prev[table] || []).filter((_, i) => i !== index)
        }));

        await fetchEmployeeData();
        if (selectedEmployee?.Code) getEmployeeRelatedData(selectedEmployee.Code);
        setError(null);
      } else {
        setError("❌ Delete failed: " + (res?.error || "Unknown"));
      }
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  // ---- Save main employee (basic info) ----
  const saveBasicInfo = async () => {
    try {
      const headData = { ...formData };
      
      // Set created by and created date for new employees
      if (editMode === "new") {
        headData.createdby = credentials?.username || "admin";
        headData.createddate = new Date().toISOString();
      } else {
        // For updates, set modified by and modified date
        headData.modifiedby = credentials?.username || "admin";
        headData.modifieddate = new Date().toISOString();
      }
      
      if (!headData.Code) {
        setError("❌ Employee Code is required");
        return;
      }

      if (editMode === "new") {
        // Merge any inline edits into related arrays before sending
        const details = [
          {
            tableName: "HRMSEmployeeAcademicInfo",
            rows: getMergedRelatedRows("academic", headData)
          },
          {
            tableName: "HRMSEmployementHistory",
            rows: getMergedRelatedRows("employment", headData)
          },
          {
            tableName: "HRMSEmployeeGrantAllowance",
            rows: getMergedRelatedRows("allowances", headData)
          },
          {
            tableName: "HRMSEmployeeGrantDeduction",
            rows: getMergedRelatedRows("deductions", headData)
          },
          {
            tableName: "HRMSEmployeeFamilyDet",
            rows: getMergedRelatedRows("family", headData)
          }
        ];

        // filter out empty detail tables
        const filteredDetails = details.filter(d => Array.isArray(d.rows) && d.rows.length > 0);

        const payload = {
          head: { tableName: "HRMSEmployee", data: headData },
          details: filteredDetails,
          selectedBranch: "Lahore"
        };

        // debug log (browser console)
        console.log("Saving head+details payload:", payload);

        const res = await fetchJson(API_INSERT_ALL, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (res?.success) {
          setError(null);
          await fetchEmployeeData();
          setIsEditing(false);
          setEditMode("edit");
          const created = (employees || []).find(e => e.Code === headData.Code);
          if (created) {
            setSelectedEmployee(created);
            setFormData(created);
            getEmployeeRelatedData(created.Code);
          } else {
            // If not found in current state, try reloading selectedEmployee from server results if returned
            if (res.empCode) {
              // try to pick the newly created record
              const match = (employees || []).find(e => e.Code === res.empCode);
              if (match) {
                setSelectedEmployee(match);
                setFormData(match);
                getEmployeeRelatedData(match.Code);
              }
            }
          }
          alert("Employee created successfully!");
        } else {
          throw new Error(res?.error || "Unknown error");
        }
      } else {
        // Update existing head only
        const where = { Code: headData.Code };
        const res = await fetchJson(API_UPDATE, {
          method: "POST",
          body: JSON.stringify({
            tableName: "HRMSEmployee",
            data: headData,
            where
          })
        });

        if (res?.success) {
          await fetchEmployeeData();
          setIsEditing(false);
          setEditMode("edit");
          if (headData.Code) {
            const updated = (employees || []).find(e => e.Code === headData.Code);
            if (updated) {
              setSelectedEmployee(updated);
              setFormData(updated);
              getEmployeeRelatedData(updated.Code);
            }
          }
          alert("Employee updated successfully!");
        } else {
          setError("❌ Update failed: " + (res?.error || "Unknown"));
        }
      }
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  const handleCancelEdit = () => { setIsEditing(false); setFormData(selectedEmployee || {}); };

  const getNextCode = () => {
    if (!employees || employees.length === 0) return "001";
    const codes = employees.map((c) => parseInt(c.Code || c.CODE || "0", 10)).filter(n => !isNaN(n));
    if (codes.length === 0) return "001";
    const maxCode = Math.max(...codes);
    return (maxCode + 1).toString().padStart(3, "0");
  };

  const handleNewEmployee = () => {
    setFormData({
      Code: getNextCode(),
      Name: "",
      IsActive: "true",
      offcode: "0101",
      createdby: credentials?.username || "admin",
      createddate: new Date().toISOString(),
      offdayBonusAllow: "false",
      AutoAttendanceAllow: "false",
      OverTimeAllow: "false",
      PunctuailityAllown: "false",
      EarlyLateAllow: "false",
      EarlyLateNoofDeductionExempt: 0,
    });
    setEditMode("new");
    setIsEditing(true);
    setRelatedData({
      academic: [],
      employment: [],
      allowances: [],
      deductions: [],
      family: [],
      attendance: []
    });
    setRelatedEditMode({});
    setRelatedEditData({});
  };

  // ---- PDF generator ----
  const generatePDFPreview = (employeeObj = selectedEmployee, related = relatedData) => {
    const employee = employeeObj;
    if (!employee) { alert("No employee to print"); return; }

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(16);
    doc.text(employee.CompName || "Company Name", pageWidth / 2, 40, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Employee Report - ${employee.Name || "N/A"}`, pageWidth / 2, 60, { align: "center" });

    let cursorY = 80;

    // Add picture if exists
    try {
      const picBase64 = employee.pictureimg || employee.picture || employee.pictureURL;
      if (picBase64) {
        let dataUrl = picBase64;
        if (!picBase64.startsWith("data:")) {
          dataUrl = "data:image/jpeg;base64," + picBase64;
        }
        const imgW = 80;
        const imgH = 80;
        const x = pageWidth - imgW - 40;
        doc.addImage(dataUrl, "JPEG", x, 40, imgW, imgH);
      }
    } catch (err) {
      console.warn("Could not add image to PDF:", err);
    }

    const addSectionTitle = (title) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(title, 40, cursorY);
      doc.setFont("helvetica", "normal");
      cursorY += 16;
    };

    const addKeyValueTable = (rows) => {
      doc.autoTable({
        startY: cursorY,
        head: [["Field", "Value"]],
        body: rows,
        theme: "grid",
        styles: { fontSize: 9 },
        margin: { left: 40, right: 40 }
      });
      cursorY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : (cursorY + 100);
    };

    // Basic Information
    addSectionTitle("Basic Information");
    const basicRows = [];
    const empHeaders = tableHeaders?.HRMSEmployee || {};

    // Important fields to show first
    const importantFields = ["Code", "Name", "FName", "LName", "DepartmentCode", "DesignationCode",
      "AppointmentDate", "JoiningDate", "BasicPay", "EmploymentStatus"];

    for (const key of importantFields) {
      if (empHeaders[key]) {
        const val = employee[key] ?? "";
        let display = val;
        const type = empHeaders[key]?.type || "";
        if (type === "date") display = safeDate(val);
        if (type === "boolean") display = (val === true || val === "true") ? "Yes" : "No";
        if (key === "DepartmentCode") display = getDepartmentName(val);
        if (key === "DesignationCode") display = getDesignationName(val);
        basicRows.push([key, display ?? ""]);
      }
    }
    addKeyValueTable(basicRows);

    // Contact Information
    addSectionTitle("Contact Information");
    const contactRows = [
      ["Mobile", employee.Mobile || ""],
      ["Email", employee.Email || ""],
      ["P_Address", employee.P_Address || ""],
      ["P_City", employee.P_City || ""],
      ["H_Address", employee.H_Address || ""],
      ["H_City", employee.H_City || ""]
    ];
    addKeyValueTable(contactRows);

    // Attendance Specification
    addSectionTitle("Attendance Specification");
    const specRows = [
      ["Off Day Bonus Allow", employee.offdayBonusAllow === "true" ? "Yes" : "No"],
      ["Auto Attendance", employee.AutoAttendanceAllow === "true" ? "Yes" : "No"],
      ["Over Time Allow", employee.OverTimeAllow === "true" ? "Yes" : "No"],
      ["Punctuality Allow", employee.PunctuailityAllown === "true" ? "Yes" : "No"],
      ["Early/Late Deduction", employee.EarlyLateAllow === "true" ? "Yes" : "No"],
      ["Exemptions", employee.EarlyLateNoofDeductionExempt || 0]
    ];
    addKeyValueTable(specRows);

    // Related data tables
    const addRelatedTable = (title, arr, tableKey) => {
      if (!arr || arr.length === 0) return;
      addSectionTitle(title);
      const headersObj = tableHeaders?.[tableKey] || {};

      // Get meaningful column names
      let columns = [];
      if (Object.keys(headersObj).length > 0) {
        columns = Object.keys(headersObj).filter(col =>
          !col.toLowerCase().includes('pk') &&
          !col.toLowerCase().includes('id') &&
          col !== 'offcode'
        );
      } else if (arr.length > 0) {
        columns = Object.keys(arr[0]).filter(col =>
          !col.toLowerCase().includes('pk') &&
          !col.toLowerCase().includes('id') &&
          col !== 'offcode'
        );
      }

      const body = arr.map(r => columns.map(c => {
        let v = r[c];
        const headerType = headersObj?.[c]?.type || "";
        if (headerType === "date") v = safeDate(v);
        if (c === "DepartmentCode") v = getDepartmentName(v);
        if (c === "DesignationCode") v = getDesignationName(v);
        if (c === "AllowancesCode") v = getAllowanceName(v);
        if (c === "DeductionsCode") v = getDeductionName(v);
        return v ?? "";
      }));

      doc.autoTable({
        startY: cursorY,
        head: [columns],
        body,
        theme: "grid",
        styles: { fontSize: 8 },
        margin: { left: 40, right: 40 }
      });
      cursorY = doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : (cursorY + 100);
    };

    addRelatedTable("Academic Information", related?.academic || [], "HRMSEmployeeAcademicInfo");
    addRelatedTable("Employment History", related?.employment || [], "HRMSEmployementHistory");
    addRelatedTable("Allowances", related?.allowances || [], "HRMSEmployeeGrantAllowance");
    addRelatedTable("Deductions", related?.deductions || [], "HRMSEmployeeGrantDeduction");
    addRelatedTable("Family Details", related?.family || [], "HRMSEmployeeFamilyDet");

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    setShowPdf(true);
  };

  // ---- render dynamic input for main employee fields ----
  const renderDynamicFields = () => {
    const empHeaders = tableHeaders?.HRMSEmployee || {};
    const keys = Object.keys(empHeaders);

    if (keys.length === 0) {
      return (
        <>
          <div className="form-row">
            <div className="form-group">
              <label>Code</label>
              {isEditing ? <input name="Code" value={formData.Code || ""} onChange={handleInputChange} /> : <div className="info-value">{selectedEmployee?.Code}</div>}
            </div>
            <div className="form-group">
              <label>Name</label>
              {isEditing ? <input name="Name" value={formData.Name || ""} onChange={handleInputChange} /> : <div className="info-value">{selectedEmployee?.Name}</div>}
            </div>
          </div>
        </>
      );
    }

    // Define priority fields to show first
    const priorityFields = [
      "Code", "Name", "FName", "LName", "DepartmentCode", "DesignationCode",
      "AppointmentDate", "JoiningDate", "BasicPay", "EmploymentStatus",
      "Mobile", "Email", "P_Address", "P_City", "H_Address", "H_City",
      "Gender", "MaritalStatus", "DOB", "CNIC", "Nationality"
    ];

    // Sort keys with priority fields first
    const sortedKeys = [...keys].sort((a, b) => {
      const aIndex = priorityFields.indexOf(a);
      const bIndex = priorityFields.indexOf(b);
      
      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    const elements = [];
    for (let i = 0; i < sortedKeys.length; i += 2) {
      const k1 = sortedKeys[i];
      const k2 = sortedKeys[i + 1];

      const renderField = (k) => {
        const meta = empHeaders[k] || {};
        const type = (meta.type || "").toLowerCase();
        const value = formData[k] ?? selectedEmployee?.[k] ?? "";

        // Skip technical fields
        if (k.toLowerCase().includes('pk') || k.toLowerCase().includes('id') || k === 'offcode' || 
            k === 'createdby' || k === 'createddate' || k === 'modifiedby' || k === 'modifieddate') {
          return null;
        }

        // Picture fields
        if (k.toLowerCase().includes("picture") || k.toLowerCase().includes("image")) {
          return (
            <div className="form-group full-width" key={k}>
              <label>{k}</label>
              {isEditing ? (
                <div className="file-upload-container">
                  <input type="file" name={k} onChange={handleInputChange} accept="image/*" className="file-input" />
                  <div className="file-upload-label">
                    <FaUpload /> Upload Image
                  </div>
                  {value && <img src={value.startsWith("data:") ? value : `data:image/jpeg;base64,${value}`} alt="Preview" className="image-preview" />}
                </div>
              ) : (
                <div className="info-value">
                  {value ? <img src={value.startsWith("data:") ? value : `data:image/jpeg;base64,${value}`} alt="Profile" className="profile-picture" /> : "No image"}
                </div>
              )}
            </div>
          );
        }

        // Boolean fields
        if (type === "boolean") {
          return (
            <div className="form-group" key={k}>
              <label className="checkbox-label">
                {isEditing ? (
                  <input type="checkbox" name={k} checked={String(value) === "true"} onChange={handleInputChange} />
                ) : (
                  <input type="checkbox" checked={String(value) === "true"} readOnly disabled />
                )}
                {k}
              </label>
            </div>
          );
        }

        // Date fields
        if (type === "date") {
          return (
            <div className="form-group" key={k}>
              <label>{k}</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaCalendar className="input-icon" />
                  <input type="date" name={k} value={value ? (value.split ? value.split("T")[0] : value) : ""} onChange={handleInputChange} className="modern-input" />
                </div>
              ) : (
                <div className="info-value">{safeDate(value)}</div>
              )}
            </div>
          );
        }

        // Numeric fields
        if (type === "int" || type === "decimal" || type === "number") {
          return (
            <div className="form-group" key={k}>
              <label>{k}</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaMoneyBillAlt className="input-icon" />
                  <input type="number" name={k} value={value || ""} onChange={handleInputChange} className="modern-input" />
                </div>
              ) : (
                <div className="info-value">{value}</div>
              )}
            </div>
          );
        }

        // Department selection
        if (k === "DepartmentCode") {
          return (
            <div className="form-group" key={k}>
              <label>Department</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaBuilding className="input-icon" />
                  <select name="DepartmentCode" value={value || ""} onChange={handleInputChange} className="modern-input">
                    <option value="">Select Department</option>
                    {departments.map(dept =>
                      <option key={dept.Code} value={dept.Code}>
                        {dept.Name || dept.description || dept.name}
                      </option>
                    )}
                  </select>
                </div>
              ) : (
                <div className="info-value">{getDepartmentName(value)}</div>
              )}
            </div>
          );
        }

        // Designation selection
        if (k === "DesignationCode") {
          return (
            <div className="form-group" key={k}>
              <label>Designation</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaUserTie className="input-icon" />
                  <select name="DesignationCode" value={value || ""} onChange={handleInputChange} className="modern-input">
                    <option value="">Select Designation</option>
                    {designations.map(d =>
                      <option key={d.Code} value={d.Code}>
                        {d.Name || d.description || d.name}
                      </option>
                    )}
                  </select>
                </div>
              ) : (
                <div className="info-value">{getDesignationName(value)}</div>
              )}
            </div>
          );
        }

        // Gender field
        if (k === "Gender") {
          return (
            <div className="form-group" key={k}>
              <label>Gender</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaTransgender className="input-icon" />
                  <select name="Gender" value={value || ""} onChange={handleInputChange} className="modern-input">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              ) : (
                <div className="info-value">{value}</div>
              )}
            </div>
          );
        }

        // Marital Status field
        if (k === "MaritalStatus") {
          return (
            <div className="form-group" key={k}>
              <label>Marital Status</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaRing className="input-icon" />
                  <select name="MaritalStatus" value={value || ""} onChange={handleInputChange} className="modern-input">
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              ) : (
                <div className="info-value">{value}</div>
              )}
            </div>
          );
        }

        // Nationality field
        if (k === "Nationality") {
          return (
            <div className="form-group" key={k}>
              <label>Nationality</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaGlobe className="input-icon" />
                  <input type="text" name="Nationality" value={value || ""} onChange={handleInputChange} className="modern-input" />
                </div>
              ) : (
                <div className="info-value">{value}</div>
              )}
            </div>
          );
        }

        // Email field
        if (k === "Email") {
          return (
            <div className="form-group" key={k}>
              <label>Email</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaEnvelope className="input-icon" />
                  <input type="email" name="Email" value={value || ""} onChange={handleInputChange} className="modern-input" />
                </div>
              ) : (
                <div className="info-value">{value}</div>
              )}
            </div>
          );
        }

        // Mobile field
        if (k === "Mobile") {
          return (
            <div className="form-group" key={k}>
              <label>Mobile</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input type="tel" name="Mobile" value={value || ""} onChange={handleInputChange} className="modern-input" />
                </div>
              ) : (
                <div className="info-value">{value}</div>
              )}
            </div>
          );
        }

        // Address fields
        if (k === "P_Address" || k === "H_Address") {
          return (
            <div className="form-group full-width" key={k}>
              <label>{k === "P_Address" ? "Permanent Address" : "Home Address"}</label>
              {isEditing ? (
                <div className="input-with-icon">
                  <FaMapMarker className="input-icon" />
                  <textarea name={k} value={value || ""} onChange={handleInputChange} className="modern-input" rows="3" />
                </div>
              ) : (
                <div className="info-value">{value}</div>
              )}
            </div>
          );
        }

        // Default text input
        return (
          <div className="form-group" key={k}>
            <label>{k}</label>
            {isEditing ? (
              <input type="text" name={k} value={value || ""} onChange={handleInputChange} className="modern-input" />
            ) : (
              <div className="info-value">{value ?? ""}</div>
            )}
          </div>
        );
      };

      const field1 = renderField(k1);
      const field2 = k2 ? renderField(k2) : null;

      if (field1 || field2) {
        // Check if either field is full-width
        const isFullWidth1 = field1 && field1.props.className.includes('full-width');
        const isFullWidth2 = field2 && field2.props.className.includes('full-width');
        
        if (isFullWidth1 || isFullWidth2) {
          // If any field is full-width, render it separately
          if (field1) elements.push(field1);
          if (field2) elements.push(
            <div className="form-row" key={`row-${i}`}>
              {field2}
            </div>
          );
        } else {
          elements.push(
            <div className="form-row" key={`row-${i}`}>
              {field1 || <div className="form-group" style={{ flex: 1 }} />}
              {field2 || <div className="form-group" style={{ flex: 1 }} />}
            </div>
          );
        }
      }
    }

    return elements;
  };

  // ---- UI render ----
  if (loading) {
    return (
      <div className="category-container">
        <h2>Employee Management</h2>
        <div className="loading-spinner"></div>
        <p>Loading employee data...</p>
      </div>
    );
  }

  return (
    <div className="category-container">
      <div className="header-section">
        <h2>Employee Management</h2>
        <div className="accent-line"></div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {selectedEmployee || isEditing ? (
        <div className="employee-details glassmorphism">
          <div className="details-header">
            <h3>
              {isEditing ? (editMode === "new" ? "New Employee" : "Edit Employee") : "Employee Details"}{" "}
              {formData?.Name || (selectedEmployee?.Name || "New Employee")}
            </h3>
            <div className="header-actions">
              {!isEditing ? (
                <button className="btn edit" onClick={handleEdit}>
                  <FaEdit /> Edit
                </button>
              ) : (
                <>
                  <button className="btn cancel" onClick={handleCancelEdit}>
                    <FaTimes /> Cancel
                  </button>
                  <button className="btn save" onClick={saveBasicInfo}>
                    <FaSave /> Save All
                  </button>
                </>
              )}
              <button className="btn pdf" onClick={() => {
                if (!selectedEmployee && !isEditing) { alert("Please select an employee first!"); return; }
                generatePDFPreview(selectedEmployee || formData, relatedData);
              }}>
                <FaSave /> Generate PDF
              </button>
              <button className="btn close" onClick={handleCloseDetails}>
                <FaTimes /> Close
              </button>
            </div>
          </div>

          <div className="tabs-container">
            <div className="tabs-scroll">
              <button className={activeTab === "basic" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("basic")}>
                <FaUsers/> Basic Info
              </button>
              <button className={activeTab === "academic" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("academic")}>
                <FaGraduationCap /> Education
              </button>
              <button className={activeTab === "employment" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("employment")}>
                <FaBriefcase /> Employment
              </button>
              <button className={activeTab === "allowances" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("allowances")}>
                <FaMoneyBill /> Allowances
              </button>
              <button className={activeTab === "deductions" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("deductions")}>
                <FaMoneyCheck /> Deductions
              </button>
              <button className={activeTab === "family" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("family")}>
                <FaUsers /> Family
              </button>
              <button className={activeTab === "attendanceSpec" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveTab("attendanceSpec")}>
                <FaClock /> Attendance
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === "basic" && (
              <div className="basic-info">
                <div className="info-section">
                  <h4><FaUsers/> Personal & General Information</h4>
                  {renderDynamicFields()}
                  
                  {/* Display created by and date info */}
                  {(selectedEmployee?.createdby || formData.createdby) && (
                    <div className="meta-info">
                      <div className="meta-item">
                        <strong>Created By:</strong> {selectedEmployee?.createdby || formData.createdby}
                      </div>
                      <div className="meta-item">
                        <strong>Created Date:</strong> {safeDate(selectedEmployee?.createddate || formData.createddate)}
                      </div>
                      {selectedEmployee?.modifiedby && (
                        <>
                          <div className="meta-item">
                            <strong>Modified By:</strong> {selectedEmployee.modifiedby}
                          </div>
                          <div className="meta-item">
                            <strong>Modified Date:</strong> {safeDate(selectedEmployee.modifieddate)}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "academic" && (
              <div className="academic-info">
                <div className="tab-header-actions">
                  <h4><FaGraduationCap /> Academic Information</h4>
                  <button className="btn new" onClick={() => handleRelatedNew("academic")}><FaPlus /> Add New</button>
                </div>

                {(relatedData.academic || []).length > 0 ? (
                  <div className="info-table">
                    <div className="table-header">
                      <div className="header-cell">Degree</div>
                      <div className="header-cell">Institute</div>
                      <div className="header-cell">Year</div>
                      <div className="header-cell">Grade/Percentage</div>
                      <div className="header-cell actions">Actions</div>
                    </div>

                    {(relatedData.academic || []).map((item, idx) => (
                      <div key={idx} className="table-row">
                        {relatedEditMode.academic && relatedEditMode.academic[idx] ? (
                          <>
                            <div className="table-cell"><input type="text" value={(relatedEditData.academic && relatedEditData.academic[idx] && relatedEditData.academic[idx].Description) || item.Description || ""} onChange={(e) => handleRelatedInputChange("academic", "Description", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="text" value={(relatedEditData.academic && relatedEditData.academic[idx] && relatedEditData.academic[idx].Institute) || item.Institute || ""} onChange={(e) => handleRelatedInputChange("academic", "Institute", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="text" value={(relatedEditData.academic && relatedEditData.academic[idx] && relatedEditData.academic[idx].Year) || item.Year || ""} onChange={(e) => handleRelatedInputChange("academic", "Year", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="text" value={(relatedEditData.academic && relatedEditData.academic[idx] && relatedEditData.academic[idx].Grade) || item.Grade || ""} onChange={(e) => handleRelatedInputChange("academic", "Grade", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell actions"><button className="btn-save" onClick={() => handleRelatedSave("academic", idx)}><FaSave /></button><button className="btn-cancel" onClick={() => handleRelatedCancel("academic", idx)}><FaTimes /></button></div>
                          </>
                        ) : (
                          <>
                            <div className="table-cell">{item.Description}</div>
                            <div className="table-cell">{item.Institute}</div>
                            <div className="table-cell">{item.Year}</div>
                            <div className="table-cell">{item.Grade}</div>
                            <div className="table-cell actions"><button className="btn-edit" onClick={() => handleRelatedEdit("academic", idx)}><FaEdit /></button><button className="btn-delete" onClick={() => handleRelatedDelete("academic", idx)}><FaTrash /></button></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (<p>No academic information available</p>)}
              </div>
            )}

            {activeTab === "employment" && (
              <div className="employment-info">
                <div className="tab-header-actions">
                  <h4><FaBriefcase /> Employment History</h4>
                  <button className="btn new" onClick={() => handleRelatedNew("employment")}><FaPlus /> Add New</button>
                </div>

                {(relatedData.employment || []).length > 0 ? (
                  <div className="info-table">
                    <div className="table-header">
                      <div className="header-cell">Position</div>
                      <div className="header-cell">Company</div>
                      <div className="header-cell">From Date</div>
                      <div className="header-cell">To Date</div>
                      <div className="header-cell">Experience</div>
                      <div className="header-cell actions">Actions</div>
                    </div>

                    {(relatedData.employment || []).map((item, idx) => (
                      <div key={idx} className="table-row">
                        {relatedEditMode.employment && relatedEditMode.employment[idx] ? (
                          <>
                            <div className="table-cell"><input type="text" value={(relatedEditData.employment && relatedEditData.employment[idx] && relatedEditData.employment[idx].Description) || item.Description || ""} onChange={(e) => handleRelatedInputChange("employment", "Description", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="text" value={(relatedEditData.employment && relatedEditData.employment[idx] && relatedEditData.employment[idx].Company) || item.Company || ""} onChange={(e) => handleRelatedInputChange("employment", "Company", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="date" value={(relatedEditData.employment && relatedEditData.employment[idx] && relatedEditData.employment[idx].FromDate) || item.FromDate || ""} onChange={(e) => handleRelatedInputChange("employment", "FromDate", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="date" value={(relatedEditData.employment && relatedEditData.employment[idx] && relatedEditData.employment[idx].ToDate) || item.ToDate || ""} onChange={(e) => handleRelatedInputChange("employment", "ToDate", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="text" value={(relatedEditData.employment && relatedEditData.employment[idx] && relatedEditData.employment[idx].Experience) || item.Experience || ""} onChange={(e) => handleRelatedInputChange("employment", "Experience", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell actions"><button className="btn-save" onClick={() => handleRelatedSave("employment", idx)}><FaSave /></button><button className="btn-cancel" onClick={() => handleRelatedCancel("employment", idx)}><FaTimes /></button></div>
                          </>
                        ) : (
                          <>
                            <div className="table-cell">{item.Description}</div>
                            <div className="table-cell">{item.Company}</div>
                            <div className="table-cell">{safeDate(item.FromDate)}</div>
                            <div className="table-cell">{safeDate(item.ToDate)}</div>
                            <div className="table-cell">{item.Experience}</div>
                            <div className="table-cell actions"><button className="btn-edit" onClick={() => handleRelatedEdit("employment", idx)}><FaEdit /></button><button className="btn-delete" onClick={() => handleRelatedDelete("employment", idx)}><FaTrash /></button></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (<p>No employment history available</p>)}
              </div>
            )}

            {activeTab === "allowances" && (
              <div className="allowances-info">
                <div className="tab-header-actions">
                  <h4><FaMoneyBill /> Allowances</h4>
                  <button className="btn new" onClick={() => handleRelatedNew("allowances")}><FaPlus /> Add New</button>
                </div>

                {(relatedData.allowances || []).length > 0 ? (
                  <div className="info-table">
                    <div className="table-header">
                      <div className="header-cell">Allowance</div>
                      <div className="header-cell">Amount</div>
                      <div className="header-cell">Calculation Type</div>
                      <div className="header-cell">Effective Date</div>
                      <div className="header-cell actions">Actions</div>
                    </div>

                    {(relatedData.allowances || []).map((item, idx) => (
                      <div key={idx} className="table-row">
                        {relatedEditMode.allowances && relatedEditMode.allowances[idx] ? (
                          <>
                            <div className="table-cell">
                              <select value={(relatedEditData.allowances && relatedEditData.allowances[idx] && relatedEditData.allowances[idx].AllowancesCode) || item.AllowancesCode || ""} onChange={(e) => handleRelatedInputChange("allowances", "AllowancesCode", e.target.value, idx)} className="modern-input small">
                                <option value="">Select Allowance</option>
                                {allowanceTypes.map(a =>
                                  <option key={a.Code} value={a.Code}>
                                    {a.Name || a.description || a.name}
                                  </option>
                                )}
                              </select>
                            </div>
                            <div className="table-cell"><input type="number" value={(relatedEditData.allowances && relatedEditData.allowances[idx] && relatedEditData.allowances[idx].Amount) || item.Amount || ""} onChange={(e) => handleRelatedInputChange("allowances", "Amount", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell">
                              <select value={(relatedEditData.allowances && relatedEditData.allowances[idx] && relatedEditData.allowances[idx].CalType) || item.CalType || ""} onChange={(e) => handleRelatedInputChange("allowances", "CalType", e.target.value, idx)} className="modern-input small">
                                <option value="1">Fixed</option>
                                <option value="2">Percentage</option>
                              </select>
                            </div>
                            <div className="table-cell"><input type="date" value={(relatedEditData.allowances && relatedEditData.allowances[idx] && relatedEditData.allowances[idx].EffectiveDate) || item.EffectiveDate || ""} onChange={(e) => handleRelatedInputChange("allowances", "EffectiveDate", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell actions"><button className="btn-save" onClick={() => handleRelatedSave("allowances", idx)}><FaSave /></button><button className="btn-cancel" onClick={() => handleRelatedCancel("allowances", idx)}><FaTimes /></button></div>
                          </>
                        ) : (
                          <>
                            <div className="table-cell">{getAllowanceName(item.AllowancesCode)}</div>
                            <div className="table-cell">{item.Amount}</div>
                            <div className="table-cell">{item.CalType === "1" ? "Fixed" : "Percentage"}</div>
                            <div className="table-cell">{safeDate(item.EffectiveDate)}</div>
                            <div className="table-cell actions"><button className="btn-edit" onClick={() => handleRelatedEdit("allowances", idx)}><FaEdit /></button><button className="btn-delete" onClick={() => handleRelatedDelete("allowances", idx)}><FaTrash /></button></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (<p>No allowances information available</p>)}
              </div>
            )}

            {activeTab === "deductions" && (
              <div className="deductions-info">
                <div className="tab-header-actions">
                  <h4><FaMoneyCheck /> Deductions</h4>
                  <button className="btn new" onClick={() => handleRelatedNew("deductions")}><FaPlus /> Add New</button>
                </div>

                {(relatedData.deductions || []).length > 0 ? (
                  <div className="info-table">
                    <div className="table-header">
                      <div className="header-cell">Deduction</div>
                      <div className="header-cell">Amount</div>
                      <div className="header-cell">Calculation Type</div>
                      <div className="header-cell">Effective Date</div>
                      <div className="header-cell actions">Actions</div>
                    </div>

                    {(relatedData.deductions || []).map((item, idx) => (
                      <div key={idx} className="table-row">
                        {relatedEditMode.deductions && relatedEditMode.deductions[idx] ? (
                          <>
                            <div className="table-cell">
                              <select value={(relatedEditData.deductions && relatedEditData.deductions[idx] && relatedEditData.deductions[idx].DeductionsCode) || item.DeductionsCode || ""} onChange={(e) => handleRelatedInputChange("deductions", "DeductionsCode", e.target.value, idx)} className="modern-input small">
                                <option value="">Select Deduction</option>
                                {deductionTypes.map(d =>
                                  <option key={d.Code} value={d.Code}>
                                    {d.Name || d.description || d.name}
                                  </option>
                                )}
                              </select>
                            </div>
                            <div className="table-cell"><input type="number" value={(relatedEditData.deductions && relatedEditData.deductions[idx] && relatedEditData.deductions[idx].Amount) || item.Amount || ""} onChange={(e) => handleRelatedInputChange("deductions", "Amount", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell">
                              <select value={(relatedEditData.deductions && relatedEditData.deductions[idx] && relatedEditData.deductions[idx].CalType) || item.CalType || ""} onChange={(e) => handleRelatedInputChange("deductions", "CalType", e.target.value, idx)} className="modern-input small">
                                <option value="1">Fixed</option>
                                <option value="2">Percentage</option>
                              </select>
                            </div>
                            <div className="table-cell"><input type="date" value={(relatedEditData.deductions && relatedEditData.deductions[idx] && relatedEditData.deductions[idx].EffectiveDate) || item.EffectiveDate || ""} onChange={(e) => handleRelatedInputChange("deductions", "EffectiveDate", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell actions"><button className="btn-save" onClick={() => handleRelatedSave("deductions", idx)}><FaSave /></button><button className="btn-cancel" onClick={() => handleRelatedCancel("deductions", idx)}><FaTimes /></button></div>
                          </>
                        ) : (
                          <>
                            <div className="table-cell">{getDeductionName(item.DeductionsCode)}</div>
                            <div className="table-cell">{item.Amount}</div>
                            <div className="table-cell">{item.CalType === "1" ? "Fixed" : "Percentage"}</div>
                            <div className="table-cell">{safeDate(item.EffectiveDate)}</div>
                            <div className="table-cell actions"><button className="btn-edit" onClick={() => handleRelatedEdit("deductions", idx)}><FaEdit /></button><button className="btn-delete" onClick={() => handleRelatedDelete("deductions", idx)}><FaTrash /></button></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (<p>No deductions information available</p>)}
              </div>
            )}

            {activeTab === "family" && (
              <div className="family-info">
                <div className="tab-header-actions">
                  <h4><FaUsers /> Family Details</h4>
                  <button className="btn new" onClick={() => handleRelatedNew("family")}><FaPlus /> Add New</button>
                </div>

                {(relatedData.family || []).length > 0 ? (
                  <div className="info-table">
                    <div className="table-header">
                      <div className="header-cell">Name</div>
                      <div className="header-cell">Relation</div>
                      <div className="header-cell">CNIC</div>
                      <div className="header-cell">Date of Birth</div>
                      <div className="header-cell">Contact</div>
                      <div className="header-cell actions">Actions</div>
                    </div>

                    {(relatedData.family || []).map((item, idx) => (
                      <div key={idx} className="table-row">
                        {relatedEditMode.family && relatedEditMode.family[idx] ? (
                          <>
                            <div className="table-cell"><input type="text" value={(relatedEditData.family && relatedEditData.family[idx] && relatedEditData.family[idx].Name) || item.Name || ""} onChange={(e) => handleRelatedInputChange("family", "Name", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell">
                              <select value={(relatedEditData.family && relatedEditData.family[idx] && relatedEditData.family[idx].Relation) || item.Relation || ""} onChange={(e) => handleRelatedInputChange("family", "Relation", e.target.value, idx)} className="modern-input small">
                                <option value="">Select Relation</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Brother">Brother</option>
                                <option value="Sister">Sister</option>
                              </select>
                            </div>
                            <div className="table-cell"><input type="text" value={(relatedEditData.family && relatedEditData.family[idx] && relatedEditData.family[idx].CNIC) || item.CNIC || ""} onChange={(e) => handleRelatedInputChange("family", "CNIC", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="date" value={(relatedEditData.family && relatedEditData.family[idx] && relatedEditData.family[idx].DOB) ? (relatedEditData.family[idx].DOB.split('T')[0]) : (item.DOB ? (item.DOB.split ? item.DOB.split('T')[0] : item.DOB) : "")} onChange={(e) => handleRelatedInputChange("family", "DOB", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell"><input type="text" value={(relatedEditData.family && relatedEditData.family[idx] && relatedEditData.family[idx].Contact) || item.Contact || ""} onChange={(e) => handleRelatedInputChange("family", "Contact", e.target.value, idx)} className="modern-input small" /></div>
                            <div className="table-cell actions"><button className="btn-save" onClick={() => handleRelatedSave("family", idx)}><FaSave /></button><button className="btn-cancel" onClick={() => handleRelatedCancel("family", idx)}><FaTimes /></button></div>
                          </>
                        ) : (
                          <>
                            <div className="table-cell">{item.Name}</div>
                            <div className="table-cell">{item.Relation}</div>
                            <div className="table-cell">{item.CNIC}</div>
                            <div className="table-cell">{safeDate(item.DOB)}</div>
                            <div className="table-cell">{item.Contact}</div>
                            <div className="table-cell actions"><button className="btn-edit" onClick={() => handleRelatedEdit("family", idx)}><FaEdit /></button><button className="btn-delete" onClick={() => handleRelatedDelete("family", idx)}><FaTrash /></button></div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (<p>No family details available</p>)}
              </div>
            )}

            {activeTab === "attendanceSpec" && (
              <div className="attendance-spec-info">
                <h4><FaCheckSquare /> Attendance Specification</h4>

                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="offdayBonusAllow"
                      checked={formData.offdayBonusAllow === "true"}
                      onChange={handleInputChange}
                    />
                    Off Day Bonus Allow
                  </label>
                </div>

                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="AutoAttendanceAllow"
                      checked={formData.AutoAttendanceAllow === "true"}
                      onChange={handleInputChange}
                    />
                    Auto Attendance
                  </label>
                </div>

                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="OverTimeAllow"
                      checked={formData.OverTimeAllow === "true"}
                      onChange={handleInputChange}
                    />
                    Over Time Allow
                  </label>
                </div>

                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="PunctuailityAllown"
                      checked={formData.PunctuailityAllown === "true"}
                      onChange={handleInputChange}
                    />
                    Punctuality Allow
                  </label>
                </div>

                <div className="form-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="EarlyLateAllow"
                      checked={formData.EarlyLateAllow === "true"}
                      onChange={handleInputChange}
                    />
                    Early / Late Deduction
                  </label>
                </div>

                {formData.EarlyLateAllow === "true" && (
                  <div className="form-row">
                    <label>No Of Exempt</label>
                    <input
                      type="number"
                      name="EarlyLateNoofDeductionExempt"
                      value={formData.EarlyLateNoofDeductionExempt || 0}
                      onChange={handleInputChange}
                      className="modern-input small"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="category-toolbar glassmorphism">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Search by Code, Name, or Department..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="modern-input" />
            </div>

            <div className="filter-buttons">
              <span>Status:</span>
              <button className={activeFilter === "all" ? "btn-filter active" : "btn-filter"} onClick={() => setActiveFilter("all")}>All</button>
              <button className={activeFilter === "active" ? "btn-filter active" : "btn-filter"} onClick={() => setActiveFilter("active")}>Active</button>
              <button className={activeFilter === "inactive" ? "btn-filter active" : "btn-filter"} onClick={() => setActiveFilter("inactive")}>Inactive</button>
            </div>

            <button className="btn new" onClick={handleNewEmployee}><FaPlus /> New Employee</button>
          </div>

          <div className="category-list-container glassmorphism">
            <div className="category-list-header">
              <div className="header-cell">Code</div>
              <div className="header-cell">Name</div>
              <div className="header-cell">Department</div>
              <div className="header-cell">Designation</div>
              <div className="header-cell">Basic Pay</div>
              <div className="header-cell center">Status</div>
              <div className="header-cell center">Actions</div>
            </div>

            <div className="category-list">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((item, idx) => {
                  const activeValue = item.IsActive ?? item.isactive ?? item.Active ?? false;
                  const isActive =
                    typeof activeValue === "boolean"
                      ? activeValue
                      : activeValue === "true" || activeValue === "1" || activeValue === 1;

                  return (
                    <div key={idx} className="category-item">
                      <div className="list-cell">{item.Code}</div>
                      <div className="list-cell">{item.Name}</div>
                      <div className="list-cell">{getDepartmentName(item.DepartmentCode)}</div>
                      <div className="list-cell">{getDesignationName(item.DesignationCode)}</div>
                      <div className="list-cell">{item.BasicPay}</div>
                      <div className="list-cell center">
                        <span className={`status-badge ${isActive ? "active" : "inactive"}`}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="list-cell center actions">
                        <button className="btn-view" onClick={() => handleEmployeeSelect(item)} title="View Details"><FaEye /></button>
                        <button className="btn-edit" onClick={() => { handleEmployeeSelect(item); handleEdit(); }} title="Edit Employee"><FaEdit /></button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-data">{searchTerm || activeFilter !== "all" ? "No employees match your search criteria" : "No employee records found"}</div>
              )}
            </div>
          </div>
        </>
      )}

      {showPdf && pdfUrl && (
        <div className="pdf-preview-modal">
          <div className="pdf-preview-content">
            <div className="pdf-preview-header">
              <h3>Employee PDF Preview</h3>
              <button className="btn-close" onClick={() => setShowPdf(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}><FaTimes /></button>
            </div>
            <div className="pdf-preview-body">
              <iframe src={pdfUrl} title="Employee PDF Preview" className="pdf-preview-iframe" />
            </div>
            <div className="pdf-actions">
              <button className="btn btn-primary" onClick={() => { const link = document.createElement('a'); link.href = pdfUrl; link.download = `Employee_${selectedEmployee?.Code || formData?.Code || 'Info'}.pdf`; document.body.appendChild(link); link.click(); document.body.removeChild(link); }}>
                <FaSave /> Download PDF
              </button>
              <button className="btn btn-secondary" onClick={() => window.open(pdfUrl, '_blank')}><FaEye /> Open in New Tab</button>
              <button className="btn btn-cancel" onClick={() => setShowPdf(false)}><FaTimes /> Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;