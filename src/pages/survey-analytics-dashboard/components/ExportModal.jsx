import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';

const ExportModal = ({ isOpen, onClose, onExport, survey }) => {
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    includeOverview: true,
    includeResponses: true,
    includeCharts: false,
    includeComments: true,
    dateRange: 'all'
  });

  const handleOptionChange = (key, value) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = () => {
    onExport(exportOptions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1050 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-background rounded-lg border border-border survey-shadow-lg">
          {/* Header */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Export Analytics</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                iconName="X"
              />
            </div>
            <p className="text-sm text-text-secondary mt-1">
              Export data for: {survey?.title}
            </p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* Format Selection */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Export Format</h4>
              <div className="space-y-2">
                {[
                  { value: 'csv', label: 'CSV (Spreadsheet)', description: 'Raw data for analysis' },
                  { value: 'pdf', label: 'PDF Report', description: 'Formatted report with charts' },
                  { value: 'xlsx', label: 'Excel Workbook', description: 'Multiple sheets with data' }
                ]?.map((format) => (
                  <label key={format?.value} className="flex items-start space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={format?.value}
                      checked={exportOptions?.format === format?.value}
                      onChange={(e) => handleOptionChange('format', e?.target?.value)}
                      className="w-4 h-4 text-primary focus:ring-primary mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-foreground">{format?.label}</div>
                      <div className="text-xs text-text-secondary">{format?.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Selection */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Include Data</h4>
              <div className="space-y-3">
                {[
                  { key: 'includeOverview', label: 'Overview & KPIs', description: 'Response rates, completion times' },
                  { key: 'includeResponses', label: 'Individual Responses', description: 'All survey responses' },
                  { key: 'includeCharts', label: 'Charts & Visualizations', description: 'Charts as images (PDF only)' },
                  { key: 'includeComments', label: 'Text Responses', description: 'Open-ended feedback' }
                ]?.map((option) => (
                  <label key={option?.key} className="flex items-start space-x-2 cursor-pointer">
                    <Checkbox
                      checked={exportOptions?.[option?.key]}
                      onCheckedChange={(checked) => handleOptionChange(option?.key, checked)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{option?.label}</div>
                      <div className="text-xs text-text-secondary">{option?.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Date Range</h4>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All responses' },
                  { value: 'week', label: 'Last 7 days' },
                  { value: 'month', label: 'Last 30 days' },
                  { value: 'quarter', label: 'Last 3 months' }
                ]?.map((range) => (
                  <label key={range?.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="dateRange"
                      value={range?.value}
                      checked={exportOptions?.dateRange === range?.value}
                      onChange={(e) => handleOptionChange('dateRange', e?.target?.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">{range?.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleExport}
              className="flex-1"
              iconName="Download"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;