import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import "./HRMSDesignation.css";
import { FaEdit, FaPlus, FaTimes, FaSave, FaSearch, FaFilter, FaArrowLeft } from "react-icons/fa";

const HRMSGenericManager = ({
    moduleType = "allowance",
    moduleConfig,
    onClose,
    onBack,
    mode,
    ...rest
}) => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [customFilter, setCustomFilter] = useState("all");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(null);

    const useAuth = () => useContext(AuthContext);
    const { credentials } = useAuth();

    // Form state
    const [isEditing, setIsEditing] = useState(false);
    const [editMode, setEditMode] = useState("new");
    const [formData, setFormData] = useState({});

    const API_BASE = "http://192.168.100.113:8081/api";

    // Comprehensive configuration for all module types
    const config = moduleConfig || getDefaultConfig(moduleType);

    function getDefaultConfig(type) {
        const configs = {
            // Basic types with Code, Name, IsActive
            benefit: {
                tableName: "HRMSBenifit",
                title: "Benefit Management",
                formTitle: "Benefit",
                newButtonText: "New Benefit",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["Code", "Name"],
                    checkboxes: ["IsActive"],
                    hasActiveFilter: true
                }
            },
            employeetype: {
                tableName: "HRMSEmployeeType",
                title: "Employee Type Management",
                formTitle: "Employee Type",
                newButtonText: "New Employee Type",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["Code", "Name"],
                    checkboxes: ["IsActive"],
                    hasActiveFilter: true
                }
            },
            // Allowance Type with additional fields
            allowance: {
                tableName: "HRMSAllowanceType",
                title: "Allowance Type Management",
                formTitle: "Allowance Type",
                newButtonText: "New Allowance Type",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["Code", "Name"],
                    checkboxes: ["IsActive", "isEmployeeGL", "IsDisable"],
                    hasActiveFilter: true
                }
            },
            // Deduction Type
            deduction: {
                tableName: "HRMSDeductionType",
                title: "Deduction Type Management",
                formTitle: "Deduction Type",
                newButtonText: "New Deduction Type",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["Code", "Name"],
                    checkboxes: ["IsActive", "isEmployeeGL"],
                    hasActiveFilter: true
                }
            },
            // Department with number fields
            department: {
                tableName: "HRMSDepartment",
                title: "Department Management",
                formTitle: "Department",
                newButtonText: "New Department",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["Code", "Name"],
                    checkboxes: ["IsActive"],
                    numbers: ["PayrollGrossPayAccount", "PayrollNetPayAccount"],
                    hasActiveFilter: true
                }
            },
            // Designation with overtime
            designation: {
                tableName: "HRMSDesignation",
                title: "Designation Management",
                formTitle: "Designation",
                newButtonText: "New Designation",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["Code", "Name"],
                    checkboxes: ["IsActive", "IsOverTimeAllow"],
                    hasActiveFilter: true
                }
            },
            // Bank with multiple text fields
            bank: {
                tableName: "HRMSBank",
                title: "Bank Management",
                formTitle: "Bank",
                newButtonText: "New Bank",
                searchPlaceholder: "Search by Code, Name or Short Name...",
                fields: {
                    basic: ["Code", "Name"],
                    texts: ["ShortName", "Address", "CountryCode", "CityCode", "BranchManager"],
                    checkboxes: ["IsActive"],
                    hasActiveFilter: true
                }
            },
            // Currency with different field names
            currency: {
                tableName: "comCurrency",
                title: "Currency Management",
                formTitle: "Currency",
                newButtonText: "New Currency",
                searchPlaceholder: "Search by Code, Name or Label...",
                fields: {
                    basic: ["currencyCode", "currencyName"],
                    texts: ["currencyLable"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: false
                }
            },
            // Process
            process: {
                tableName: "comProcess",
                title: "Process Management",
                formTitle: "Process",
                newButtonText: "New Process",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["ccode", "cname"],
                    checkboxes: ["isActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },
            // Projects
            projects: {
                tableName: "comProjects",
                title: "Projects Management",
                formTitle: "Project",
                newButtonText: "New Project",
                searchPlaceholder: "Search by Code, Name or GL Code...",
                fields: {
                    basic: ["Code", "Name"],
                    texts: ["glCode"],
                    checkboxes: ["IsActive"],
                    hasActiveFilter: true
                }
            },
            // Reason with dropdown
            reason: {
                tableName: "comReason",
                title: "Reason Management",
                formTitle: "Reason",
                newButtonText: "New Reason",
                searchPlaceholder: "Search by Code, Name or Type...",
                fields: {
                    basic: ["ccode", "cname"],
                    checkboxes: ["isActive"],
                    dropdowns: [
                        {
                            name: "codetype",
                            options: [
                                { value: "OTS", label: "OTS" },
                                { value: "RWR", label: "Rework Reason" },
                                { value: "RJR", label: "Reject Reason" }
                            ]
                        }
                    ],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true,
                    hasCustomFilter: true,
                    customFilterOptions: [
                        { value: "all", label: "All Types" },
                        { value: "OTS", label: "OTS" },
                        { value: "RWR", label: "Rework Reason" },
                        { value: "RJR", label: "Reject Reason" }
                    ]
                }
            },
            // Dashboard Management
            dashboard: {
                tableName: "comtblDashboard",
                title: "Dashboard Management",
                formTitle: "Dashboard Item",
                newButtonText: "New Dashboard Item",
                searchPlaceholder: "Search by Code, Description or Type...",
                fields: {
                    basic: ["DBCode", "DBDescription"],
                    texts: [
                        "MenuSystem", "Remarks", "FeildToSum", "ImageURL",
                        "dbxxLabel", "dbyxLabel", "dbxxField", "dbyxField", "numberSuffix"
                    ],
                    numbers: ["dbSort", "dbWidth", "dbHeight"],
                    checkboxes: ["IsActive"],
                    dropdowns: [
                        {
                            name: "DBType",
                            options: [
                                { value: "TABLE", label: "Table" },
                                { value: "TILE", label: "Tile" },
                                { value: "CHART", label: "Chart" },
                                { value: "GRAPH", label: "Graph" }
                            ]
                        }
                    ],
                    special: ["BackColor"], // color input
                    fixed: [
                        { name: "DBParentCode", value: "00" },
                        { name: "offcode", value: "0101" }
                    ],
                    hasActiveFilter: true,
                    hasCustomFilter: true,
                    customFilterOptions: [
                        { value: "all", label: "All Types" },
                        { value: "TABLE", label: "Table" },
                        { value: "TILE", label: "Tile" },
                        { value: "CHART", label: "Chart" },
                        { value: "GRAPH", label: "Graph" }
                    ]
                }
            },

            // Type of Charges
            charges: {
                tableName: "comTypeofCharges",
                title: "Type of Charges Management",
                formTitle: "Charge Type",
                newButtonText: "New Charge Type",
                searchPlaceholder: "Search by Code, Name or GL Code...",
                fields: {
                    basic: ["ccode", "cname"],
                    texts: ["glCode"],
                    checkboxes: ["isActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // UOM Management
            uom: {
                tableName: "comUOM",
                title: "UOM (Unit of Measure) Management",
                formTitle: "UOM",
                newButtonText: "New UOM",
                searchPlaceholder: "Search by Code, Name or Short Code...",
                fields: {
                    basic: ["ccode", "cname"],
                    texts: ["cSHD"],
                    checkboxes: ["Isactive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Vehicle Type
            vehicletype: {
                tableName: "comVehicleType",
                title: "Vehicle Type Management",
                formTitle: "Vehicle Type",
                newButtonText: "New Vehicle Type",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["ccode", "cname"],
                    checkboxes: ["isActive"],
                    hasActiveFilter: true
                }
            },

            // Country Management
            country: {
                tableName: "country",
                title: "Country Management",
                formTitle: "Country",
                newButtonText: "New Country",
                searchPlaceholder: "Search by ID or Name...",
                fields: {
                    basic: ["CountryID", "CountryName"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Loan Type
            loantype: {
                tableName: "HRMSLoanType",
                title: "Loan Types Management",
                formTitle: "Loan Type",
                newButtonText: "New Loan Type",
                searchPlaceholder: "Search by Code, Name or Account Code...",
                fields: {
                    basic: ["Code", "Name"],
                    texts: ["LoanTypeAccountCode"],
                    checkboxes: ["IsActive", "isEmployeeGL"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Location Management
            location: {
                tableName: "HRMSLocation",
                title: "Location Management",
                formTitle: "Location",
                newButtonText: "New Location",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["Code", "Name"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // IMF Color
            imfcolor: {
                tableName: "IMFColor",
                title: "IMF Color Management",
                formTitle: "Color",
                newButtonText: "New Color",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["cCode", "cName"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // IMF Size
            imfsize: {
                tableName: "IMFSize",
                title: "IMF Size Management",
                formTitle: "Size",
                newButtonText: "New Size",
                searchPlaceholder: "Search by Code, Name or Qty...",
                fields: {
                    basic: ["cCode", "cName"],
                    numbers: ["qty"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // IMF Thickness
            imfthickness: {
                tableName: "IMFThickness",
                title: "IMF Thickness Management",
                formTitle: "Thickness",
                newButtonText: "New Thickness",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["cCode", "cName"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Floor Management
            floor: {
                tableName: "lndFloor",
                title: "Floor Management",
                formTitle: "Floor",
                newButtonText: "New Floor",
                searchPlaceholder: "Search by Code, Description or Short Name...",
                fields: {
                    basic: ["FloorCode", "FloorDesc"],
                    texts: ["FloorSHD"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Frequency Management
            frequency: {
                tableName: "lndFrequency",
                title: "Frequency Management",
                formTitle: "Frequency",
                newButtonText: "New Frequency",
                searchPlaceholder: "Search by Code or Name...",
                fields: {
                    basic: ["ccode", "cname"],
                    numbers: ["Qty"],
                    checkboxes: ["isactive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Payment Type
            paymenttype: {
                tableName: "lndPaymentType",
                title: "Payment Type Management",
                formTitle: "Payment Type",
                newButtonText: "New Payment Type",
                searchPlaceholder: "Search by Code, Desc, SHD or GL Code...",
                fields: {
                    basic: ["TypeCode", "TypeDesc"],
                    texts: ["TypeSHD", "TypeGLCode"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Plot Category
            plotcategory: {
                tableName: "lndPlotCatagory",
                title: "Plot Category Management",
                formTitle: "Category",
                newButtonText: "New Category",
                searchPlaceholder: "Search by Code, Description or Short Desc...",
                fields: {
                    basic: ["CatCode", "CatDesc"],
                    texts: ["CatSHD"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            },

            // Relation Management
            relation: {
                tableName: "lndRelation",
                title: "Relation Management",
                formTitle: "Relation",
                newButtonText: "New Relation",
                searchPlaceholder: "Search by Code, Description or Short Desc...",
                fields: {
                    basic: ["RelCode", "RelDesc"],
                    texts: ["RelSHD"],
                    checkboxes: ["IsActive"],
                    fixed: [{ name: "offcode", value: "0101", disabled: true }],
                    hasActiveFilter: true
                }
            }
        };

        return configs[type] || configs.allowance; // Default fallback
    }

    // Initialize form data based on configuration
    const initializeFormData = () => {
        const initialData = {};

        // Add basic fields
        if (config.fields.basic) {
            config.fields.basic.forEach(field => {
                initialData[field] = "";
            });
        }

        // Add checkbox fields
        if (config.fields.checkboxes) {
            config.fields.checkboxes.forEach(field => {
                initialData[field] = false;
            });
        }

        // Add number fields
        if (config.fields.numbers) {
            config.fields.numbers.forEach(field => {
                initialData[field] = "";
            });
        }

        // Add text fields
        if (config.fields.texts) {
            config.fields.texts.forEach(field => {
                initialData[field] = "";
            });
        }

        // Add fixed fields
        if (config.fields.fixed) {
            config.fields.fixed.forEach(field => {
                initialData[field.name] = field.value;
            });
        }

        // Add dropdown fields
        if (config.fields.dropdowns) {
            config.fields.dropdowns.forEach(field => {
                initialData[field.name] = field.options[0]?.value || "";
            });
        }

        return initialData;
    };

    // ✅ Helper to fetch JSON safely
    const fetchJson = async (url, options = {}) => {
        const res = await fetch(url, {
            headers: { "Content-Type": "application/json", ...options.headers },
            ...options,
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    };

    // ✅ Fetch all items
    const fetchItems = async () => {
        try {
            setLoading(true);
            const currentOffcode = credentials?.company?.offcode || '1010';
            const data = await fetchJson(`${API_BASE}/get-table-data`, {
                method: "POST",
                body: JSON.stringify({ tableName: config.tableName, currentOffcode }),
            });

            if (data.success && (data.data || data.rows)) {
                const rows = data.data || data.rows;
                setItems(rows);
                setFilteredItems(rows);
            } else {
                setError(`Failed to load ${config.formTitle.toLowerCase()} data`);
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // ✅ Filtering
    useEffect(() => {
        let filtered = items;

        // Search filter
        if (searchTerm.trim() !== "") {
            const searchFields = config.fields.basic || ["Code", "Name"];
            filtered = filtered.filter((item) =>
                searchFields.some(
                    (key) =>
                        item[key] &&
                        item[key].toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Active status filter
        if (config.fields.hasActiveFilter && activeFilter !== "all") {
            const isActive = activeFilter === "active";
            filtered = filtered.filter((item) => {
                const activeValue =
                    item.IsActive ??
                    item.isActive ??
                    item.ISACTIVE ??
                    item.Active ??
                    item.ACTIVE ??
                    false;
                const itemActive =
                    typeof activeValue === "boolean"
                        ? activeValue
                        : activeValue === "true" ||
                        activeValue === "1" ||
                        activeValue === 1;
                return itemActive === isActive;
            });
        }

        // Custom filter (e.g., for Reason type)
        if (config.fields.hasCustomFilter && customFilter !== "all") {
            filtered = filtered.filter((item) =>
                item.codetype === customFilter
            );
        }

        setFilteredItems(filtered);
    }, [searchTerm, activeFilter, customFilter, items]);

    // ✅ Input handler
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // ✅ Helper to get next available code
    const getNextCode = () => {
        if (!items || items.length === 0) return "001";

        const codeField = config.fields.basic?.[0] || "Code";
        const codes = items
            .map((item) => parseInt(item[codeField] || "0", 10))
            .filter((n) => !isNaN(n));

        if (codes.length === 0) return "001";

        const maxCode = Math.max(...codes);
        return (maxCode + 1).toString().padStart(3, "0");
    };

    // ✅ Open form for new
    const handleNew = () => {
        const newFormData = initializeFormData();

        // Auto-generate code for new items
        const codeField = config.fields.basic?.[0];
        if (codeField) {
            newFormData[codeField] = getNextCode();
        }

        // Set default active state
        const activeField = config.fields.checkboxes?.find(f =>
            f.toLowerCase().includes('active')
        );
        if (activeField) {
            newFormData[activeField] = true;
        }

        setFormData(newFormData);
        setEditMode("new");
        setIsEditing(true);
        setError(null);
        setSuccessMessage(null);
    };

    // ✅ Open form for edit
    const handleEdit = (item) => {
        const editFormData = initializeFormData();

        // Map all fields from the item to form data
        Object.keys(editFormData).forEach(key => {
            if (item[key] !== undefined) {
                // Handle boolean fields
                if (typeof editFormData[key] === 'boolean') {
                    editFormData[key] =
                        item[key] === true ||
                        item[key] === "true" ||
                        item[key] === 1 ||
                        item[key] === "1";
                } else {
                    editFormData[key] = item[key] || "";
                }
            }
        });

        setFormData(editFormData);
        setEditMode("edit");
        setIsEditing(true);
        setError(null);
        setSuccessMessage(null);
    };

    // ✅ Save or Update
    const handleSave = async () => {
        try {
            // Validation
            const requiredFields = config.fields.basic || [];
            for (const field of requiredFields) {
                if (!formData[field]?.toString().trim()) {
                    setError(`${field} is required`);
                    return;
                }
            }

            const payloadData = {};

            // Add all fields to payload
            Object.keys(formData).forEach(key => {
                if (key !== config.fields.basic?.[0] || editMode === "new") {
                    // Convert number fields
                    if (config.fields.numbers?.includes(key)) {
                        payloadData[key] = parseInt(formData[key] || "0", 10);
                    } else {
                        payloadData[key] = formData[key];
                    }
                }
            });

            const payload =
                editMode === "edit"
                    ? {
                        tableName: config.tableName,
                        data: payloadData,
                        where: { [config.fields.basic[0]]: formData[config.fields.basic[0]] },
                    }
                    : {
                        tableName: config.tableName,
                        data: payloadData,
                    };

            const url =
                editMode === "edit"
                    ? `${API_BASE}/update-table-data`
                    : `${API_BASE}/insert-table-data`;

            const res = await fetchJson(url, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            if (res.success) {
                await fetchItems();
                setIsEditing(false);
                setError(null);
                setSuccessMessage(
                    `${config.formTitle} ${editMode === "edit" ? "updated" : "created"} successfully!`
                );
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError("❌ Operation failed: " + (res.error || "Unknown error"));
            }
        } catch (err) {
            setError("❌ Error: " + err.message);
        }
    };

    // ✅ Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setFormData(initializeFormData());
        setError(null);
    };

    // ✅ Handle close with props
    const handleClose = () => {
        if (onClose) onClose();
    };

    // ✅ Handle back with props
    const handleBack = () => {
        if (onBack) onBack();
        else if (onClose) onClose();
    };

    // Render form field based on type
    const renderFormField = (fieldName) => {
        const fieldConfig = {
            name: fieldName,
            value: formData[fieldName] || "",
            onChange: handleInputChange,
            className: "modern-input",
            placeholder: `Enter ${fieldName.toLowerCase()}`

        };

        // Check if field is in fixed config
        const fixedField = config.fields.fixed?.find(f => f.name === fieldName);
        if (fixedField) {
            return (
                <div className="form-group" key={fieldName}>
                    <label>{fieldName}</label>
                    <input
                        {...fieldConfig}
                        value={fixedField.value}
                        disabled={fixedField.disabled}
                    />
                </div>
            );
        }

        // Check if field is in dropdowns config
        const dropdownField = config.fields.dropdowns?.find(f => f.name === fieldName);
        if (dropdownField) {
            return (
                <div className="form-group" key={fieldName}>
                    <label>{fieldName} *</label>
                    <select {...fieldConfig}>
                        {dropdownField.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        // Check if field is a checkbox
        if (config.fields.checkboxes?.includes(fieldName)) {
            return (
                <div className="form-group checkbox-container" key={fieldName}>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name={fieldName}
                            checked={formData[fieldName] || false}
                            onChange={handleInputChange}
                            className="modern-checkbox"
                        />
                        <span className="checkmark"></span>
                        {fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                </div>
            );
        }

        // Check if field is a number
        if (config.fields.numbers?.includes(fieldName)) {
            return (
                <div className="form-group" key={fieldName}>
                    <label>{fieldName}</label>
                    <input
                        type="number"
                        {...fieldConfig}
                    />
                </div>
            );
        }

        // Check if field is a textarea
        if (fieldName === "Address") {
            return (
                <div className="form-group full-width" key={fieldName}>
                    <label>{fieldName}</label>
                    <textarea
                        {...fieldConfig}
                        rows="3"
                    />
                </div>
            );
        }
        // Add this to the renderFormField function after the existing field types
        // Special field types
        if (config.fields.special?.includes(fieldName)) {
            if (fieldName === "BackColor") {
                return (
                    <div className="form-group" key={fieldName}>
                        <label>{fieldName}</label>
                        <input
                            type="color"
                            name={fieldName}
                            value={formData[fieldName] || "#f0f0f0"}
                            onChange={handleInputChange}
                            className="modern-input"
                            style={{ height: '38px' }}
                        />
                    </div>
                );
            }
        }
        // Default text input
        return (
            <div className="form-group" key={fieldName}>
                <label>{fieldName} *</label>
                <input
                    type="text"
                    {...fieldConfig}
                    disabled={editMode === "edit" && fieldName === config.fields.basic?.[0]}
                />
            </div>
        );
    };

    // Get table headers based on configuration
    const getTableHeaders = () => {
        const headers = [];

        // Basic fields
        if (config.fields.basic) {
            headers.push(...config.fields.basic.map(field =>
                ({ key: field, label: field, type: 'basic' })
            ));
        }

        // Additional display fields
        if (config.fields.texts) {
            const displayTexts = config.fields.texts.filter(field =>
                !['Address', 'BranchManager'].includes(field) // Hide some fields in table
            );
            headers.push(...displayTexts.map(field =>
                ({ key: field, label: field, type: 'text' })
            ));
        }

        // Checkbox status fields
        if (config.fields.checkboxes) {
            headers.push(...config.fields.checkboxes.map(field =>
                ({ key: field, label: field, type: 'status', center: true })
            ));
        }

        // Dropdown fields
        if (config.fields.dropdowns) {
            headers.push(...config.fields.dropdowns.map(field =>
                ({ key: field.name, label: field.name, type: 'dropdown' })
            ));
        }
        // In getTableHeaders function, add special handling for dashboard
        if (config.fields.special) {
            // For dashboard, show dimensions instead of individual width/height
            if (config.fields.special.includes("BackColor") &&
                config.fields.numbers?.includes("dbWidth") &&
                config.fields.numbers?.includes("dbHeight")) {
                headers.push({ key: 'dimensions', label: 'Dimensions', type: 'dimensions' });
            }
        }
        headers.push({ key: 'actions', label: 'Actions', type: 'actions', center: true });

        return headers;
    };

    // Render table cell based on item and header
    const renderTableCell = (item, header) => {
        if (header.type === 'actions') {
            return (
                <div className="list-cell center actions">
                    <button
                        className="btn-edit"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                    >
                        <FaEdit />
                    </button>
                </div>
            );
        }

        if (header.type === 'status') {
            const value = item[header.key];
            const isActive =
                value === true ||
                value === "true" ||
                value === 1 ||
                value === "1";

            return (
                <div className={`list-cell ${header.center ? 'center' : ''}`}>
                    <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Yes' : 'No'}
                    </span>
                </div>
            );
        }
        // Add to renderTableCell function
        if (header.key === 'dimensions') {
            const width = item.dbWidth || '500';
            const height = item.dbHeight || '300';
            return (
                <div className="list-cell">
                    {width}x{height}
                </div>
            );
        }

        if (header.key === 'DBType') {
            return (
                <div className="list-cell">
                    <span className="type-badge">{item[header.key]}</span>
                </div>
            );
        }
        return (
            <div className={`list-cell ${header.center ? 'center' : ''}`}>
                {item[header.key] || '-'}
            </div>
        );
    };

    // ---------------------------------------------------
    // UI
    // ---------------------------------------------------

    if (loading) {
        return (
            <div className="category-container">
                <div className="header-section">
                    <h2>{config.title}</h2>
                    <div className="accent-line"></div>
                </div>
                <div className="loading-spinner"></div>
                <p>Loading {config.formTitle.toLowerCase()}s...</p>
            </div>
        );
    }

    const tableHeaders = getTableHeaders();

    return (
        <div className="category-container">
            {/* Header with navigation */}
            <div className="header-section">
                <div className="header-nav">
                    {/* {(onBack || onClose) && (
                        <button className="btn-back" onClick={handleBack} title="Back">
                            <FaArrowLeft />
                        </button>
                    )} */}
                    <h2>{config.title}</h2>
                    {/* {onClose && (
                        <button className="btn-close" onClick={handleClose} title="Close">
                            <FaTimes />
                        </button>
                    )} */}
                </div>
                <div className="accent-line"></div>
            </div>

            {/* Messages */}
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            {isEditing ? (
                <div className="category-form glassmorphism">
                    <h3>{editMode === "edit" ? `Edit ${config.formTitle}` : `Add New ${config.formTitle}`}</h3>

                    <div className="form-row">
                        {/* Basic fields */}
                        {config.fields.basic?.map(field => renderFormField(field))}
                    </div>

                    {/* Additional text fields */}
                    {config.fields.texts && (
                        <div className="form-row">
                            {config.fields.texts.map(field => renderFormField(field))}
                        </div>
                    )}

                    {/* Number fields */}
                    {config.fields.numbers && (
                        <div className="form-row">
                            {config.fields.numbers.map(field => renderFormField(field))}
                        </div>
                    )}

                    {/* Dropdown fields */}
                    {config.fields.dropdowns && (
                        <div className="form-row">
                            {config.fields.dropdowns.map(field => renderFormField(field.name))}
                        </div>
                    )}

                    {/* Fixed fields */}
                    {config.fields.fixed && (
                        <div className="form-row">
                            {config.fields.fixed.map(field => renderFormField(field.name))}
                        </div>
                    )}

                    {/* Checkbox fields */}
                    {config.fields.checkboxes && (
                        <div className="form-row">
                            {config.fields.checkboxes.map(field => renderFormField(field))}
                        </div>
                    )}

                    <div className="form-actions">
                        <button className="btn save" onClick={handleSave}>
                            <FaSave /> {editMode === "edit" ? "Update" : "Save"}
                        </button>
                        <button className="btn cancel" onClick={handleCancel}>
                            <FaTimes /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="category-toolbar glassmorphism">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder={config.searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="modern-input"
                            />
                        </div>

                        {/* Active Status Filter */}
                        {config.fields.hasActiveFilter && (
                            <div className="filter-buttons">
                                <span>Status:</span>
                                <button
                                    className={activeFilter === "all" ? "btn-filter active" : "btn-filter"}
                                    onClick={() => setActiveFilter("all")}
                                >
                                    All
                                </button>
                                <button
                                    className={activeFilter === "active" ? "btn-filter active" : "btn-filter"}
                                    onClick={() => setActiveFilter("active")}
                                >
                                    Active
                                </button>
                                <button
                                    className={activeFilter === "inactive" ? "btn-filter active" : "btn-filter"}
                                    onClick={() => setActiveFilter("inactive")}
                                >
                                    Inactive
                                </button>
                            </div>
                        )}

                        {/* Custom Filter (e.g., for Reason) */}
                        {config.fields.hasCustomFilter && (
                            <div className="filter-buttons">
                                <span>Type:</span>
                                <select
                                    value={customFilter}
                                    onChange={(e) => setCustomFilter(e.target.value)}
                                    className="modern-select"
                                >
                                    {config.fields.customFilterOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button className="btn new" onClick={handleNew}>
                            <FaPlus /> {config.newButtonText}
                        </button>
                    </div>

                    {/* List */}
                    <div className="category-list-container glassmorphism">
                        <div className="category-list-header">
                            {tableHeaders.map(header => (
                                <div
                                    key={header.key}
                                    className={`header-cell ${header.center ? 'center' : ''}`}
                                >
                                    {header.label}
                                </div>
                            ))}
                        </div>

                        <div className="category-list">
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item, idx) => (
                                    <div key={idx} className="category-item">
                                        {tableHeaders.map(header => renderTableCell(item, header))}
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">
                                    {searchTerm || activeFilter !== "all" || customFilter !== "all"
                                        ? `No ${config.formTitle.toLowerCase()}s match your search criteria`
                                        : `No ${config.formTitle.toLowerCase()}s found`}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HRMSGenericManager;