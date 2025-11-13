import React, { useState, useEffect } from 'react';
import './Department.css';
import { FaSave, FaPowerOff, FaEdit, FaPlus } from 'react-icons/fa';

const Department = ({ mode, onClose, initialData = {} }) => {
  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [grossAccount, setGrossAccount] = useState('');
  const [netAccount, setNetAccount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load initial data when editing
  useEffect(() => {
    console.log("Department component mounted with mode:", mode);
    console.log("Initial data received:", initialData);

    if (mode === 'edit' && initialData && Object.keys(initialData).length > 0) {
      console.log("Loading initial data for edit:", initialData);

      // Handle Code field (case-insensitive)
      const codeValue = initialData.Code || initialData.CODE || '';
      setCode(codeValue);

      // Handle Name field (case-insensitive)
      const nameValue = initialData.Name || initialData.NAME || '';
      setName(nameValue);

      // Handle IsActive field (case-insensitive)
      const activeValue = initialData.IsActive !== undefined ? initialData.IsActive :
        initialData.isActive !== undefined ? initialData.isActive :
          initialData.ISACTIVE !== undefined ? initialData.ISACTIVE :
            initialData.Active !== undefined ? initialData.Active :
              initialData.ACTIVE !== undefined ? initialData.ACTIVE : false;

      setIsActive(
        activeValue === true || activeValue === 'true' || activeValue === 1 || activeValue === '1'
      );

      // Handle PayrollGrossPayAccount field (case-insensitive)
      const grossValue = initialData.PayrollGrossPayAccount !== undefined ? initialData.PayrollGrossPayAccount :
        initialData.PAYROLLGROSSPAYACCOUNT !== undefined ? initialData.PAYROLLGROSSPAYACCOUNT :
          initialData.PayrollGrossAccount !== undefined ? initialData.PayrollGrossAccount :
            initialData.PAYROLLGROSSACCOUNT !== undefined ? initialData.PAYROLLGROSSACCOUNT : '';
      setGrossAccount(grossValue);

      // Handle PayrollNetPayAccount field (case-insensitive)
      const netValue = initialData.PayrollNetPayAccount !== undefined ? initialData.PayrollNetPayAccount :
        initialData.PAYROLLNETPAYACCOUNT !== undefined ? initialData.PAYROLLNETPAYACCOUNT :
          initialData.PayrollNetAccount !== undefined ? initialData.PayrollNetAccount :
            initialData.PAYROLLNETACCOUNT !== undefined ? initialData.PAYROLLNETACCOUNT : '';
      setNetAccount(netValue);
    } else if (mode === 'new') {
      // Reset form for new entry
      setCode('');
      setName('');
      setIsActive(false);
      setGrossAccount('');
      setNetAccount('');
    }
  }, [initialData, mode]);

  const API_URL =
    mode === 'edit'
      ? 'http://192.168.100.113:8081/api/update-table-data'
      : 'http://192.168.100.113:8081/api/insert-table-data';

  const handleSave = async () => {
    if (!code || !name) {
      setMessage('⚠️ Code and Name are required');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const payload =
      mode === 'edit'
        ? {
          tableName: 'HRMSDepartment',
          data: {
            Name: name,
            IsActive: isActive,
            PayrollGrossPayAccount: parseInt(grossAccount || '0', 10),
            PayrollNetPayAccount: parseInt(netAccount || '0', 10),
          },
          where: { Code: code },
        }
        : {
          tableName: 'HRMSDepartment',
          data: {
            Code: code,
            Name: name,
            IsActive: isActive,
            PayrollGrossPayAccount: parseInt(grossAccount || '0', 10),
            PayrollNetPayAccount: parseInt(netAccount || '0', 10),
          },
        };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        setMessage(
          mode === 'edit'
            ? '✅ Department updated successfully!'
            : '✅ Department inserted successfully!'
        );

        // Clear only if "new" entry
        if (mode === 'new') {
          setCode('');
          setName('');
          setIsActive(false);
          setGrossAccount('');
          setNetAccount('');
        }
      } else {
        setMessage('❌ Operation failed: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      setMessage('❌ Error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="department-container">
      <header className="department-header">
        <h2>
          {mode === 'new' ? <FaPlus /> : <FaEdit />}
          {mode === 'new' ? ' Create New Department' : ' Edit Department'}
        </h2>
        <p className="department-subtitle">
          {mode === 'edit'
            ? `Editing department: ${initialData?.Name || initialData?.NAME || ''}`
            : 'Add a new department to the system'}
        </p>
      </header>

      <div className="department-body">
        <div className="form-group">
          <label>Code *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter department code"
            disabled={mode === 'edit'} // lock Code on edit
            className={mode === 'edit' ? 'disabled-field' : ''}
          />
        </div>

        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter department name"
          />
        </div>

        <div className="form-group-checkbox">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            <span className="checkmark"></span>
            Active
          </label>
        </div>

        <div className="form-group">
          <label>Payroll Gross Pay Account</label>
          <input
            type="number"
            value={grossAccount}
            onChange={(e) => setGrossAccount(e.target.value)}
            placeholder="Enter gross pay account"
          />
        </div>

        <div className="form-group">
          <label>Payroll Net Pay Account</label>
          <input
            type="number"
            value={netAccount}
            onChange={(e) => setNetAccount(e.target.value)}
            placeholder="Enter net pay account"
          />
        </div>

        {message && (
          <div
            className={`form-message ${message.includes('✅') ? 'success' : 'error'
              }`}
          >
            {message}
          </div>
        )}
      </div>

      <div className="button-toolbar">
        <button
          className={`toolbar-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner"></span>
          ) : (
            <>
              <FaSave /> <span>{mode === 'new' ? 'Save' : 'Update'}</span>
            </>
          )}
        </button>
        <button className="toolbar-btn" onClick={onClose}>
          <FaPowerOff /> <span>Close</span>
        </button>
      </div>
    </div>
  );
};

export default Department;