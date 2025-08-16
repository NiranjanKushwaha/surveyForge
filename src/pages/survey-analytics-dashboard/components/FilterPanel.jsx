import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';

const FilterPanel = ({ isOpen, onClose, filters, onFiltersChange, analyticsData }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (category, value, checked) => {
    const newFilters = { ...localFilters };
    
    if (category === 'dateRange') {
      newFilters.dateRange = value;
    } else {
      if (checked) {
        newFilters[category] = [...(newFilters?.[category] || []), value];
      } else {
        newFilters[category] = (newFilters?.[category] || [])?.filter(item => item !== value);
      }
    }
    
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters = {
      demographics: [],
      responseStatus: [],
      dateRange: 'all'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-1050 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border survey-shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Filter Analytics</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              iconName="X"
            />
          </div>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6">
          {/* Date Range Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Date Range</h4>
            <div className="space-y-2">
              {[
                { value: 'all', label: 'All time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'Last 7 days' },
                { value: 'month', label: 'Last 30 days' },
                { value: 'quarter', label: 'Last 3 months' }
              ]?.map((option) => (
                <label key={option?.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dateRange"
                    value={option?.value}
                    checked={localFilters?.dateRange === option?.value}
                    onChange={(e) => handleFilterChange('dateRange', e?.target?.value, e?.target?.checked)}
                    className="w-4 h-4 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{option?.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Response Status Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Response Status</h4>
            <div className="space-y-2">
              {[
                { value: 'completed', label: 'Completed' },
                { value: 'partial', label: 'Partial' },
                { value: 'abandoned', label: 'Abandoned' }
              ]?.map((option) => (
                <label key={option?.value} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={localFilters?.responseStatus?.includes(option?.value)}
                    onCheckedChange={(checked) => handleFilterChange('responseStatus', option?.value, checked)}
                  />
                  <span className="text-sm text-foreground">{option?.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Demographics Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Age Groups</h4>
            <div className="space-y-2">
              {analyticsData?.demographics?.age?.map((ageGroup) => (
                <label key={ageGroup?.range} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={localFilters?.demographics?.includes(ageGroup?.range)}
                      onCheckedChange={(checked) => handleFilterChange('demographics', ageGroup?.range, checked)}
                    />
                    <span className="text-sm text-foreground">{ageGroup?.range}</span>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {ageGroup?.count} ({ageGroup?.percentage}%)
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Geographic Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Geographic Region</h4>
            <div className="space-y-2">
              {analyticsData?.demographics?.location?.map((location) => (
                <label key={location?.region} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={localFilters?.demographics?.includes(location?.region)}
                      onCheckedChange={(checked) => handleFilterChange('demographics', location?.region, checked)}
                    />
                    <span className="text-sm text-foreground">{location?.region}</span>
                  </div>
                  <span className="text-xs text-text-secondary">
                    {location?.count} ({location?.percentage}%)
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-4">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1"
            >
              Reset All
            </Button>
            <Button
              variant="default"
              onClick={handleApplyFilters}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;