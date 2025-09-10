import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMySettings, updateSystemSettings } from "../../store/travelCategories/actions";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { headerCurrency } from "./HeaderCurrency.tsx";

// Custom Searchable Dropdown Component
const SearchableDropdown = ({ 
  id, name, value, onChange, options, placeholder = "Select...", 
  disabled = false, className = "w-50" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setDisplayValue(selectedOption ? selectedOption.label : "");
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm("");
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearchTerm(inputValue);
    setDisplayValue(inputValue);
    setIsOpen(true);
  };

  const handleOptionClick = (option) => {
    setDisplayValue(option.label);
    setSearchTerm("");
    setIsOpen(false);
    onChange({ target: { name: name, value: option.value } });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleOptionClick(filteredOptions[0]);
    }
  };

  return (
    <div className={`position-relative ${className}`} ref={dropdownRef}>
      <input
        type="text"
        id={id}
        name={name}
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        className="form-control"
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        style={{ 
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderColor: '',
          transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#007bff';
          e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '';
          e.target.style.boxShadow = '';
        }}
      />
      
      <div 
        className="position-absolute"
        style={{ 
          right: '12px', top: '50%', transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }}
      >
        <svg 
          width="12" height="8" viewBox="0 0 12 8" fill="none"
          style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M1 1L6 6L11 1" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {isOpen && (
        <div 
          className="position-absolute bg-white border rounded shadow-lg"
          style={{ 
            top: '100%', left: 0, right: 0, zIndex: 1050,
            maxHeight: '200px', overflowY: 'auto'
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2"
                style={{ 
                  cursor: 'pointer',
                  backgroundColor: value === option.value ? '#e3f2fd' : 'transparent'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = value === option.value ? '#e3f2fd' : 'transparent';
                }}
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-muted">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const dispatch = useDispatch();
  const { settings, loading, error, updateLoading, updateError, updateSuccess } = 
    useSelector((state) => state.travelCategory || {});

  const [formData, setFormData] = useState({
    siteName: "TickYourList",
    defaultCurrency: "USD",
    defaultLanguage: "en",
    timezone: "UTC",
    emailNotifications: true,
    maintenanceMode: false,
    bookingTimeout: 30,
  });

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "fr", label: "French" },
    
  ];

  // const currencyOptions = [
  //   { value: "USD", label: "USD - US Dollar" },
  //   { value: "EUR", label: "EUR - Euro" },
  //   { value: "INR", label: "INR - Indian Rupee" },
  //   { value: "GBP", label: "GBP - British Pound" },
  //   { value: "JPY", label: "JPY - Japanese Yen" },
  //   { value: "AUD", label: "AUD - Australian Dollar" },
  //   { value: "CAD", label: "CAD - Canadian Dollar" },
  //   { value: "CHF", label: "CHF - Swiss Franc" },
  //   { value: "CNY", label: "CNY - Chinese Yuan" },
  //   { value: "SEK", label: "SEK - Swedish Krona" }
  // ];
   // To use headerCurrency, uncomment import above and replace currencyOptions with:
  const currencyOptions = headerCurrency.map(currency => ({
    value: currency.id,
    label: `${currency.name} - ${currency.displayName}`
  }));
  
  const timezoneOptions = [
    { value: "UTC", label: "UTC - Coordinated Universal Time" },
    { value: "IST", label: "IST - India Standard Time" },
   
  ];

  useEffect(() => {
    toastr.options = {
      closeButton: true,
      newestOnTop: true,
      progressBar: true,
      positionClass: "toast-top-right",
      timeOut: "5000",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
    dispatch(fetchMySettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings?.data?.settings) {
      const apiSettings = settings.data.settings;
      setFormData({
        siteName: apiSettings.siteName || "TickYourList",
        defaultCurrency: apiSettings.defaultCurrency || "USD",
        defaultLanguage: apiSettings.defaultLanguage || "en",
        timezone: apiSettings.timezone || "UTC",
        emailNotifications: apiSettings.emailNotifications ?? true,
        maintenanceMode: apiSettings.maintenanceMode ?? false,
        bookingTimeout: apiSettings.bookingTimeoutMinutes || 30,
      });
    }
  }, [settings]);

  useEffect(() => {
    if (updateSuccess) toastr.success("System settings updated successfully!");
    if (updateError) toastr.error(updateError || "Failed to update system settings");
  }, [updateSuccess, updateError]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = {
      siteName: formData.siteName,
      defaultCurrency: formData.defaultCurrency,
      defaultLanguage: formData.defaultLanguage,
      timezone: formData.timezone,
      emailNotifications: formData.emailNotifications,
      maintenanceMode: formData.maintenanceMode,
      bookingTimeoutMinutes: parseInt(formData.bookingTimeout),
    };
    dispatch(updateSystemSettings(updateData));
  };

  if (loading) return <div className="container py-4"><div className="text-center">Loading settings...</div></div>;
  if (error) return <div className="container py-4"><div className="alert alert-danger">Error loading settings: {error}</div></div>;

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4 font-weight-bold">System Settings</h1>
      <div className="card shadow-sm p-4 border w-100" style={{ maxWidth: "1800px" }}>
        <div className="card-header bg-light">
          <h1 className="h3 mb-4 font-weight-bold">System Settings</h1>
        </div>
        
        <div className="card-body p-4">
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div className="form-group mb-3">
              <label htmlFor="siteName" className="form-label h5 font-weight-semibold d-block mb-2">
                Site Name
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="form-control w-50"
                disabled={updateLoading}
                style={{
                  borderColor: '',
                  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="defaultLanguage" className="form-label h5 font-weight-semibold d-block mb-2">
                Default Language
              </label>
              <SearchableDropdown
                id="defaultLanguage"
                name="defaultLanguage"
                value={formData.defaultLanguage}
                onChange={handleChange}
                options={languageOptions}
                placeholder="Search language..."
                disabled={updateLoading}
                className="w-50"
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="defaultCurrency" className="form-label h5 font-weight-semibold d-block mb-2">
                Default Currency
              </label>
              <SearchableDropdown
                id="defaultCurrency"
                name="defaultCurrency"
                value={formData.defaultCurrency}
                onChange={handleChange}
                options={currencyOptions}
                placeholder="Search currency..."
                disabled={updateLoading}
                className="w-50"
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="timezone" className="form-label h5 font-weight-semibold d-block mb-2">
                Timezone
              </label>
              <SearchableDropdown
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                options={timezoneOptions}
                placeholder="Search timezone..."
                disabled={updateLoading}
                className="w-50"
              />
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
                className="form-check-input"
                disabled={updateLoading}
                style={{
                  borderColor: '',
                  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
              <label htmlFor="emailNotifications" className="form-check-label h5 font-weight-semibold">
                Email Notifications
              </label>
            </div>

            <div className="form-check mb-3">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={formData.maintenanceMode}
                onChange={handleChange}
                className="form-check-input"
                disabled={updateLoading}
                style={{
                  borderColor: '',
                  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
              <label htmlFor="maintenanceMode" className="form-check-label h5 font-weight-semibold">
                Maintenance Mode
              </label>
            </div>

            <div className="form-group mb-3">
              <label htmlFor="bookingTimeout" className="form-label h5 font-weight-semibold d-block mb-2">
                Booking Timeout (minutes)
              </label>
              <input
                type="number"
                id="bookingTimeout"
                name="bookingTimeout"
                value={formData.bookingTimeout}
                onChange={handleChange}
                className="form-control w-50"
                disabled={updateLoading}
                style={{
                  borderColor: '',
                  transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#007bff';
                  e.target.style.boxShadow = '0 0 0 0.2rem rgba(0, 123, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary text-white px-4 py-2 rounded-md"
                disabled={updateLoading}
              >
                {updateLoading ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;