import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ImportExportPanel = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleImport = (format) => {
    console.log('Importing questions in format:', format);
    setShowDropdown(false);
    // In a real app, this would trigger a file picker
  };

  const handleExport = (format) => {
    console.log('Exporting questions in format:', format);
    setShowDropdown(false);
    // In a real app, this would generate and download the file
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative"
      >
        <Icon name="Download" size={16} className="mr-2" />
        Import/Export
        <Icon name="ChevronDown" size={14} className="ml-2" />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg survey-shadow-lg z-1010">
          <div className="py-2">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium text-foreground">Import Questions</p>
            </div>
            
            <button
              onClick={() => handleImport('json')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
            >
              <Icon name="FileText" size={14} />
              <span>From JSON file</span>
            </button>
            
            <button
              onClick={() => handleImport('csv')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
            >
              <Icon name="Table" size={14} />
              <span>From CSV file</span>
            </button>
            
            <button
              onClick={() => handleImport('template')}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
            >
              <Icon name="Download" size={14} />
              <span>From template library</span>
            </button>

            <div className="border-t border-border mt-2 pt-2">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">Export Questions</p>
              </div>
              
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
              >
                <Icon name="FileText" size={14} />
                <span>As JSON file</span>
              </button>
              
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
              >
                <Icon name="Table" size={14} />
                <span>As CSV file</span>
              </button>
              
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
              >
                <Icon name="FileText" size={14} />
                <span>As PDF document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-999"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default ImportExportPanel;