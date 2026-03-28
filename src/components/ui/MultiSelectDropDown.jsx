import React from "react";
import Select from "react-select";

/**
 * Generic Multi Select Dropdown
 * Matches SortDropdown + Date input UI
 */
const MultiSelectDropdown = ({
  value = [],
  onChange,
  options = [],
  placeholder = "Select",
  className = "",
  id,
  ...props
}) => {

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      borderRadius: "8px",

      border: state.isFocused
        ? "2px solid #f97316"
        : "1px solid #d1d5db",

      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(249,115,22,0.2)"
        : "none",

      "&:hover": {
        border: "2px solid #f97316",
      },

      fontSize: "14px",
      transition: "all 0.2s ease",
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0 8px",
      maxHeight: "40px",
      overflow: "auto",
    }),

    multiValue: (base) => ({
      ...base,
      backgroundColor: "#fff7ed",
      borderRadius: "6px",
    }),

    multiValueLabel: (base) => ({
      ...base,
      color: "#f97316",
      fontWeight: 500,
    }),

    multiValueRemove: (base) => ({
      ...base,
      color: "#f97316",
      ":hover": {
        backgroundColor: "#f97316",
        color: "#fff",
      },
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (base) => ({
      ...base,
      color: "#6b7280",
    }),

    menu: (base) => ({
      ...base,
      borderRadius: "8px",
      overflow: "hidden",
    }),
  };

  return (
    <div className={`min-w-[200px] ${className}`}>
      <Select
        id={id}
        isMulti
        options={options}
        value={options.filter((opt) => value.includes(opt.value))}
        onChange={(selected) =>
          onChange?.(selected ? selected.map((s) => s.value) : [])
        }
        placeholder={placeholder}
        styles={customStyles}
        classNamePrefix="react-select"
        {...props}
      />
    </div>
  );
};

export default MultiSelectDropdown;