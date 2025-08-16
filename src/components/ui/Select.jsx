import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  label,
  description,
  error,
  disabled = false,
  required = false,
  loading = false,
  multiple = false,
  searchable = false,
  clearable = false,
  id,
  name,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options?.filter(option =>
        option?.label?.toLowerCase()?.includes(searchTerm?.toLowerCase())
      )
    : options;

  // Get display value
  const getDisplayValue = () => {
    if (multiple && Array.isArray(value)) {
      if (value?.length === 0) return placeholder;
      if (value?.length === 1) {
        const option = options?.find(opt => opt?.value === value?.[0]);
        return option ? option?.label : placeholder;
      }
      return `${value?.length} items selected`;
    }
    
    const option = options?.find(opt => opt?.value === value);
    return option ? option?.label : placeholder;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues?.includes(optionValue)
        ? currentValues?.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = (e) => {
    e?.stopPropagation();
    onChange(multiple ? [] : '');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef?.current && !selectRef?.current?.contains(event?.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef?.current) {
      searchInputRef?.current?.focus();
    }
  }, [isOpen, searchable]);

  const hasValue = multiple ? (Array.isArray(value) && value?.length > 0) : value;

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground mb-2"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {/* Select Trigger */}
      <div
        className={`
          relative w-full min-h-[40px] px-3 py-2 bg-input border rounded-md cursor-pointer
          flex items-center justify-between
          survey-transition
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-ring'}
          ${error ? 'border-error' : 'border-border'}
          ${isOpen ? 'border-ring ring-2 ring-ring/20' : ''}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`flex-1 text-left ${!hasValue ? 'text-text-secondary' : 'text-foreground'}`}>
          {getDisplayValue()}
        </span>

        <div className="flex items-center space-x-1">
          {loading && (
            <Icon name="Loader2" size={16} className="animate-spin text-text-secondary" />
          )}
          
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded text-text-secondary hover:text-foreground"
            >
              <Icon name="X" size={14} />
            </button>
          )}
          
          <Icon
            name="ChevronDown"
            size={16}
            className={`text-text-secondary survey-transition ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>
      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md survey-shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e?.target?.value)}
                  className="w-full pl-9 pr-3 py-2 bg-input border border-border rounded text-sm focus:outline-none focus:border-ring"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions?.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-secondary">
                {searchTerm ? 'No options found' : 'No options available'}
              </div>
            ) : (
              filteredOptions?.map((option) => {
                const isSelected = multiple
                  ? Array.isArray(value) && value?.includes(option?.value)
                  : value === option?.value;

                return (
                  <div
                    key={option?.value}
                    className={`
                      px-3 py-2 cursor-pointer text-sm survey-transition
                      ${option?.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'}
                      ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'}
                    `}
                    onClick={() => !option?.disabled && handleOptionSelect(option?.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div>{option?.label}</div>
                        {option?.description && (
                          <div className="text-xs text-text-secondary mt-1">
                            {option?.description}
                          </div>
                        )}
                      </div>
                      {multiple && isSelected && (
                        <Icon name="Check" size={16} className="text-primary" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {/* Description */}
      {description && (
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      )}
      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-error flex items-center">
          <Icon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
      {/* Hidden Input for Form Integration */}
      <input
        type="hidden"
        id={id}
        name={name}
        value={multiple ? JSON.stringify(value || []) : (value || '')}
      />
    </div>
  );
};

export default Select;