import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActions = ({ selectedCount, onSelectAll, onDeselectAll, onBulkDuplicate, onBulkArchive, onBulkExport }) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-foreground">
            {selectedCount} survey{selectedCount > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelectAll}
              className="text-primary hover:text-primary"
            >
              Select All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeselectAll}
              className="text-text-secondary"
            >
              Deselect All
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDuplicate}
            className="flex items-center space-x-2"
          >
            <Icon name="Copy" size={14} />
            <span className="hidden sm:inline">Duplicate</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
            className="flex items-center space-x-2"
          >
            <Icon name="Download" size={14} />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkArchive}
            className="flex items-center space-x-2 text-error hover:text-error border-error/20 hover:border-error"
          >
            <Icon name="Archive" size={14} />
            <span className="hidden sm:inline">Archive</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;