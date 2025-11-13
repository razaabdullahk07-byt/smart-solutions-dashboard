// EmployeeForm.jsx
import React, { useState, useCallback, useEffect } from "react";
import {
  FaEdit, FaTimes, FaSave,FaEye, FaUser, FaGraduationCap,
  FaBriefcase, FaMoneyBill, FaMoneyCheck, FaUsers, FaIdCard, FaBuilding,
  FaCalendar, FaMoneyBillWave, FaVenusMars, FaRing, FaGlobe,
  FaUniversity, FaChartLine, FaTrash, FaClock, FaCheckSquare, FaPlus
} from "react-icons/fa";
import { jsPDF } from "jspdf";

const EmployeeForm = ({
  employee,
  isEditing,
  editMode,
  onClose,
  onEdit,
  onSave,
  departments,
  designations,
  academicInfo,
  employmentHistory,
  grantAllowances,
  grantDeductions,
  familyDetails,
  attendanceData,
  API_BASE,
  fetchJson
}) => {
  const [formData, setFormData] = useState({
    offcode: "0101",
    IsActive: true,
    attendanceSpec: {
      offDayBonus: false,
      autoAttendance: false,
      overTime: false,
      punctuality: false,
      earlyLateDeduction: false,
      noOfExempt: 0,
    },
  });
  const [activeTab, setActiveTab] = useState("basic");
  const [error, setError] = useState(null);
  const [relatedData, setRelatedData] = useState({
    academic: [],
    employment: [],
    allowances: [],
    deductions: [],
    family: [],
    attendance: []
  });
  const [relatedEditData, setRelatedEditData] = useState({});
  const [relatedEditMode, setRelatedEditMode] = useState({});
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showPdf, setShowPdf] = useState(false);

  // Initialize form data when employee changes
  useEffect(() => {
    if (employee) {
      setFormData(employee);
      getEmployeeRelatedData(employee.Code);
    } else if (editMode === "new") {
      setFormData({
        offcode: "0101",
        IsActive: true,
        attendanceSpec: {
          offDayBonus: false,
          autoAttendance: false,
          overTime: false,
          punctuality: false,
          earlyLateDeduction: false,
          noOfExempt: 0,
        },
      });
    }
  }, [employee, editMode]);

  // Get related data for an employee
  const getEmployeeRelatedData = useCallback((code) => {
    if (!code) {
      setRelatedData({
        academic: [],
        employment: [],
        allowances: [],
        deductions: [],
        family: [],
        attendance: []
      });
      return;
    }

    const academic = (academicInfo || []).filter(item => item.Code === code);
    const employment = (employmentHistory || []).filter(item => item.Code === code);
    const allowances = (grantAllowances || []).filter(item => item.Code === code);
    const deductions = (grantDeductions || []).filter(item => item.Code === code);
    const family = (familyDetails || []).filter(item => item.Code === code);
    const attendance = (attendanceData || []).filter(item => item.EmployeeCode === code || item.Code === code);

    setRelatedData({
      academic,
      employment,
      allowances,
      deductions,
      family,
      attendance
    });

    // reset edit buffers for related
    setRelatedEditMode({});
    setRelatedEditData({});
  }, [academicInfo, employmentHistory, grantAllowances, grantDeductions, familyDetails, attendanceData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAttendanceSpecChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      attendanceSpec: {
        ...prev.attendanceSpec,
        [field]: value
      }
    }));
  };

  // When user toggles edit on a related row
  const handleRelatedEdit = (table, index) => {
    setRelatedEditMode(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [index]: true
      }
    }));

    const item = (relatedData[table] && relatedData[table][index]) || {};
    setRelatedEditData(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [index]: { ...item }
      }
    }));
  };

  // Cancel edit on related row
  const handleRelatedCancel = (table, index) => {
    setRelatedEditMode(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [index]: false
      }
    }));
    
    setRelatedEditData(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [index]: {}
      }
    }));
  };

  // Add a new empty related row
  const handleRelatedNew = (table) => {
    const codeForLink = employee?.Code || formData?.Code || "";
    const blank = { Code: codeForLink, offcode: "0101" };
    
    setRelatedData(prev => ({
      ...prev,
      [table]: [...(prev[table] || []), blank]
    }));

    const currentLen = (relatedData[table] || []).length;
    
    setRelatedEditMode(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [currentLen]: true
      }
    }));

    setRelatedEditData(prev => ({
      ...prev,
      [table]: {
        ...prev[table],
        [currentLen]: blank
      }
    }));
  };

  // input change for related edit buffers
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

  // Helper: map logical table slug to actual DB table name
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

  // Save a related row (insert or update)
  const handleRelatedSave = async (table, index) => {
    try {
      const buffer = (relatedEditData[table] && relatedEditData[table][index]) || {};
      const original = (relatedData[table] && relatedData[table][index]) || {};

      // ensure Code exists (link to employee)
      const codeForLink = employee?.Code || formData?.Code || "";
      if (!buffer.Code) buffer.Code = codeForLink;
      if (!buffer.offcode) buffer.offcode = "0101";

      const recordId = buffer.id || original.id;
      let res;
      
      if (recordId) {
        res = await fetchJson(`${API_BASE}/update-table-data`, {
          method: "POST",
          body: JSON.stringify({
            tableName: getTableName(table),
            data: buffer,
            where: { id: recordId }
          })
        });
      } else {
        res = await fetchJson(`${API_BASE}/insert-table-data`, {
          method: "POST",
          body: JSON.stringify({
            tableName: getTableName(table),
            data: buffer
          })
        });
      }

      if (res?.success) {
        // Update UI immediately without waiting for full refresh
        setRelatedData(prev => {
          const updatedData = [...(prev[table] || [])];
          updatedData[index] = {
            ...(recordId ? buffer : (res.row || res.insertedRow || buffer)),
            id: res.insertedId || res.id || (recordId ? buffer.id : undefined)
          };
          
          return {
            ...prev,
            [table]: updatedData
          };
        });

        // Turn off edit mode
        setRelatedEditMode(prev => ({
          ...prev,
          [table]: {
            ...prev[table],
            [index]: false
          }
        }));

        // Clear buffer
        setRelatedEditData(prev => ({
          ...prev,
      [table]: {
        ...prev[table],
        [index]: {}
      }
    }));

    setError(null);
  } else {
    setError("❌ Save failed: " + (res.error || "Unknown"));
  }
} catch (err) {
  setError("❌ " + err.message);
}
  };

  // Delete related row
  const handleRelatedDelete = async (table, index) => {
    const confirm = window.confirm("Are you sure you want to delete this record?");
    if (!confirm) return;
    
    try {
      const record = (relatedData[table] && relatedData[table][index]) || {};
      const recordId = record.id;
      
      if (!recordId) {
        // Unsaved row - just remove locally
        setRelatedData(prev => ({
          ...prev,
          [table]: (prev[table] || []).filter((_, i) => i !== index)
        }));
        
        // Cleanup edit buffers
        setRelatedEditMode(prev => {
          const newModes = { ...(prev[table] || {}) };
          delete newModes[index];
          return { ...prev, [table]: newModes };
        });
        
        setRelatedEditData(prev => {
          const newData = { ...(prev[table] || {}) };
          delete newData[index];
          return { ...prev, [table]: newData };
        });
        
        return;
      }

      // Call delete endpoint
      const res = await fetchJson(`${API_BASE}/delete-table-data`, {
        method: "POST",
        body: JSON.stringify({
          tableName: getTableName(table),
          where: { id: recordId }
        })
      });

      if (res?.success) {
        // Remove from local list
        setRelatedData(prev => ({
          ...prev,
          [table]: (prev[table] || []).filter((_, i) => i !== index)
        }));
        
        setError(null);
      } else {
        setError("❌ Delete failed: " + (res.error || "Unknown"));
      }
    } catch (err) {
      setError("❌ " + err.message);
    }
  };

  // Save or update employee main record
  const handleSave = async () => {
    try {
      let res;
      if (editMode === "new") {
        res = await fetchJson(`${API_BASE}/insert-table-data`, {
          method: "POST",
          body: JSON.stringify({
            tableName: "HRMSEmployee",
            data: formData
          }),
        });
      } else {
        res = await fetchJson(`${API_BASE}/update-table-data`, {
          method: "POST",
          body: JSON.stringify({
            tableName: "HRMSEmployee",
            data: formData,
            where: { Code: formData.Code }
          }),
        });
      }

      if (res?.success) {
        onSave();
        setError(null);
      } else {
        setError("❌ Operation failed: " + (res?.error || "Unknown error"));
      }
    } catch (err) {
      setError("❌ Error: " + err.message);
    }
  };

  const handleCancelEdit = () => {
    onEdit();
    setFormData(employee || {});
  };

  // Helper functions for date/time formatting
  const safeDate = (d) => {
    if (!d) return "N/A";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  const getDepartmentName = (code) => {
    if (!code) return "N/A";
    const dept = departments.find(d => d.Code === code);
    return dept ? dept.Name : code;
  };

  const getDesignationName = (code) => {
    if (!code) return "N/A";
    const desig = designations.find(d => d.Code === code);
    return desig ? desig.Name : code;
  };

  // Enhanced PDF generation function
  const generatePDFPreview = () => {
    if (!employee && !formData.Code) {
      alert("No employee data available for PDF");
      return;
    }

    const employeeData = employee || formData;
    const doc = new jsPDF();
    
    // Add header with company logo and title
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Employee Information", 105, 12, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    let y = 30;
    
    // Employee Basic Information Section
    doc.setFontSize(12);
    doc.setFillColor(241, 241, 241);
    doc.rect(10, y, 190, 8, 'F');
    doc.text("Basic Information", 14, y + 6);
    y += 12;
    
    const basicInfo = [
      [`Employee Code: ${employeeData.Code || "N/A"}`, `Name: ${employeeData.Name || "N/A"}`],
      [`Father Name: ${employeeData.FatherName || "N/A"}`, `Date of Birth: ${safeDate(employeeData.DOB)}`],
      [`CNIC: ${employeeData.IDNo || "N/A"}`, `Basic Pay: ${employeeData.BasicPay || "N/A"}`],
      [`Gender: ${employeeData.Gender === "1" ? "Male" : employeeData.Gender === "2" ? "Female" : "N/A"}`, 
       `Marital Status: ${employeeData.MarriadStatus === "1" ? "Married" : employeeData.MarriadStatus === "2" ? "Single" : "N/A"}`],
      [`Department: ${getDepartmentName(employeeData.DepartmentCode)}`, 
       `Designation: ${getDesignationName(employeeData.DesignationCode)}`],
      [`Joining Date: ${safeDate(employeeData.JoiningDate)}`, `Nationality: ${employeeData.Nationality === "1" ? "Pakistani" : "Other"}`],
      [`Status: ${employeeData.IsActive ? "Active" : "Inactive"}`, '']
    ];
    
    basicInfo.forEach(([left, right]) => {
      doc.text(left, 15, y);
      doc.text(right, 110, y);
      y += 7;
    });
    
    y += 5;
    
    // Academic Information Section
    if (relatedData.academic && relatedData.academic.length > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFillColor(241, 241, 241);
      doc.rect(10, y, 190, 8, 'F');
      doc.text("Academic Information", 14, y + 6);
      y += 12;
      
      doc.setFontSize(10);
      relatedData.academic.forEach((item, index) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(`${index + 1}. ${item.Description || "N/A"} - ${item.Institute || "N/A"} (${item.Year || "N/A"})`, 15, y);
        y += 7;
      });
    }
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: "center" });
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 292, { align: "center" });
    }

    const pdfBlob = doc.output("blob");
    const url = URL.createObjectURL(pdfBlob);

    setPdfUrl(url);
    setShowPdf(true);
  };

  // Render functions for each tab would go here...
  // [The rendering code from your original component for each tab]

  return (
    <div className="employee-details glassmorphism">
      <div className="details-header">
        <h3>
          {isEditing ? (editMode === "new" ? "New Employee" : "Edit Employee") : "Employee Details"}{" "}
          {formData?.Name || (employee?.Name || "New Employee")}
        </h3>
        <div className="header-actions">
          {!isEditing ? (
            <>
              <button className="btn pdf" onClick={generatePDFPreview}>
                <FaSave /> Generate PDF
              </button>
              <button className="btn edit" onClick={onEdit}>
                <FaEdit /> Edit
              </button>
            </>
          ) : (
            <>
              <button className="btn save" onClick={handleSave}>
                <FaSave /> Save
              </button>
              <button className="btn cancel" onClick={handleCancelEdit}>
                <FaTimes /> Cancel
              </button>
            </>
          )}
          <button className="btn close" onClick={onClose}>
            <FaTimes /> Close
          </button>
        </div>
      </div>

      {/* Rest of the form rendering would go here */}
      {/* This would include all the tab content from your original component */}

      {/* PDF Preview Modal */}
      {showPdf && pdfUrl && (
        <div className="pdf-preview-modal">
          <div className="pdf-preview-content">
            <div className="pdf-preview-header">
              <h3>Employee PDF Preview</h3>
              <button
                className="btn-close"
                onClick={() => setShowPdf(false)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="pdf-preview-body">
              <iframe
                src={pdfUrl}
                title="Employee PDF Preview"
                className="pdf-preview-iframe"
              />
            </div>
            <div className="pdf-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfUrl;
                  link.download = `Employee_${employee?.Code || formData?.Code || 'Info'}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <FaSave /> Download PDF
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => window.open(pdfUrl, '_blank')}
              >
                <FaEye /> Open in New Tab
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => setShowPdf(false)}
              >
                <FaTimes /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeForm;