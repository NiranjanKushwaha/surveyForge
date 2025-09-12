import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { cn } from '../../utils/cn';

const SignaturePad = ({
  value,
  onChange,
  disabled = false,
  className = "",
  width = 400,
  height = 200,
  backgroundColor = "#ffffff",
  penColor = "#000000",
  ...props
}) => {
  const sigPad = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize signature pad
  useEffect(() => {
    if (sigPad.current) {
      sigPad.current.clear();
      if (value) {
        sigPad.current.fromDataURL(value);
        setIsEmpty(false);
      }
    }
  }, [value]);

  const handleBegin = () => {
    setIsDrawing(true);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    if (sigPad.current) {
      const isEmpty = sigPad.current.isEmpty();
      setIsEmpty(isEmpty);
      
      if (!isEmpty && onChange) {
        const dataURL = sigPad.current.toDataURL();
        onChange(dataURL);
      }
    }
  };

  const clearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
      setIsEmpty(true);
      if (onChange) {
        onChange('');
      }
    }
  };

  const getSignatureData = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      return sigPad.current.toDataURL();
    }
    return null;
  };

  return (
    <div className={cn("signature-pad-container", className)} {...props}>
      <div className="relative">
        <SignatureCanvas
          ref={sigPad}
          canvasProps={{
            width,
            height,
            className: cn(
              "border border-gray-300 rounded-lg cursor-crosshair transition-all duration-200",
              disabled ? "cursor-not-allowed opacity-50" : "hover:border-gray-400",
              isDrawing ? "border-blue-500 shadow-lg" : "",
              className
            ),
            style: {
              backgroundColor,
            }
          }}
          penColor={penColor}
          onBegin={handleBegin}
          onEnd={handleEnd}
          disabled={disabled}
        />
        
        {/* Overlay for disabled state */}
        {disabled && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 text-sm font-medium">Signature disabled</span>
          </div>
        )}
        
        {/* Placeholder text when empty */}
        {isEmpty && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-sm italic">Draw your signature here</span>
          </div>
        )}
      </div>
      
      {/* Action buttons */}
      {!disabled && (
        <div className="flex items-center justify-between mt-3">
          <button
            type="button"
            onClick={clearSignature}
            disabled={isEmpty}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              isEmpty
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
            )}
          >
            Clear
          </button>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Use mouse or touch to draw</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePad;
