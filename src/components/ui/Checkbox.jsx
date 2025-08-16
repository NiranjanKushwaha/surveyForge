import React from 'react';
import Icon from '../AppIcon';

const Checkbox = ({
  checked = false,
  onChange,
  label,
  description,
  error,
  disabled = false,
  required = false,
  indeterminate = false,
  size = 'default',
  id,
  name,
  value,
  className = "",
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const checkboxId = id || `checkbox-${Math.random()?.toString(36)?.substr(2, 9)}`;

  return (
    <div className={`flex items-start space-x-3 ${className}`}>
      <div className="flex items-center">
        <div className="relative">
          <input
            type="checkbox"
            id={checkboxId}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={`
              ${sizeClasses?.[size]} border-2 rounded cursor-pointer
              flex items-center justify-center survey-transition
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${error ? 'border-error' : 'border-border'}
              ${checked || indeterminate 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'bg-input hover:border-ring'
              }
            `}
          >
            {indeterminate ? (
              <Icon name="Minus" size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
            ) : checked ? (
              <Icon name="Check" size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14} />
            ) : null}
          </label>
        </div>
      </div>
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`
                block text-sm font-medium cursor-pointer
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-foreground'}
              `}
            >
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </label>
          )}
          
          {description && (
            <p className="mt-1 text-sm text-text-secondary">
              {description}
            </p>
          )}
          
          {error && (
            <p className="mt-1 text-sm text-error flex items-center">
              <Icon name="AlertCircle" size={14} className="mr-1" />
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const CheckboxGroup = ({ 
  label, 
  description, 
  error, 
  required = false, 
  children, 
  className = "" 
}) => {
  return (
    <fieldset className={`space-y-3 ${className}`}>
      {label && (
        <legend className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </legend>
      )}
      
      {description && (
        <p className="text-sm text-text-secondary">{description}</p>
      )}
      
      <div className="space-y-3">
        {children}
      </div>
      
      {error && (
        <p className="text-sm text-error flex items-center">
          <Icon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </fieldset>
  );
};

export { Checkbox, CheckboxGroup };
export default Checkbox;