import React from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // "warning", "danger", "info"
  isLoading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "AlertTriangle",
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
          confirmVariant: "danger"
        };
      case "info":
        return {
          icon: "Info",
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
          confirmVariant: "default"
        };
      default: // warning
        return {
          icon: "AlertTriangle",
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-100",
          confirmVariant: "warning"
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
              <Icon name={styles.icon} size={20} className={styles.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">
                {message}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={styles.confirmVariant}
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              <span>{confirmText}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
