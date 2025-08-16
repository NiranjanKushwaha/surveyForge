import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FloatingToolbar = ({ 
  onUndo, 
  onRedo, 
  onSave, 
  onPreview, 
  canUndo, 
  canRedo, 
  saveStatus,
  isPreviewMode,
  onTogglePreview 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSaveStatusInfo = () => {
    switch (saveStatus) {
      case 'saving':
        return { icon: 'Loader2', text: 'Saving...', color: 'var(--color-warning)' };
      case 'saved':
        return { icon: 'Check', text: 'Saved', color: 'var(--color-success)' };
      case 'error':
        return { icon: 'AlertCircle', text: 'Save Failed', color: 'var(--color-error)' };
      default:
        return { icon: 'Clock', text: 'Unsaved', color: 'var(--color-text-secondary)' };
    }
  };

  const statusInfo = getSaveStatusInfo();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card border border-border rounded-lg survey-shadow-lg">
        {/* Main Toolbar */}
        <div className="flex items-center space-x-1 p-2">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              iconName="Undo2"
              title="Undo (Ctrl+Z)"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              iconName="Redo2"
              title="Redo (Ctrl+Y)"
            />
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Save Status */}
          <div className="flex items-center space-x-2 px-2">
            <Icon 
              name={statusInfo?.icon} 
              size={14} 
              color={statusInfo?.color}
              className={saveStatus === 'saving' ? 'animate-spin' : ''}
            />
            <span className="text-xs text-text-secondary">{statusInfo?.text}</span>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          {/* Preview Toggle */}
          <Button
            variant={isPreviewMode ? "default" : "ghost"}
            size="sm"
            onClick={onTogglePreview}
            iconName="Eye"
            title="Toggle Preview Mode"
          >
            {isPreviewMode ? 'Exit Preview' : 'Preview'}
          </Button>

          {/* More Actions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName="MoreHorizontal"
              title="More Actions"
            />

            {/* Expanded Menu */}
            {isExpanded && (
              <div className="absolute bottom-full mb-2 right-0 bg-popover border border-border rounded-md survey-shadow-lg min-w-48">
                <div className="py-1">
                  <button
                    onClick={() => {
                      onSave();
                      setIsExpanded(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                  >
                    <Icon name="Save" size={14} />
                    <span>Save Survey</span>
                    <span className="ml-auto text-xs text-text-secondary">Ctrl+S</span>
                  </button>
                  
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                  >
                    <Icon name="Download" size={14} />
                    <span>Export Survey</span>
                  </button>
                  
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                  >
                    <Icon name="Upload" size={14} />
                    <span>Import Survey</span>
                  </button>
                  
                  <div className="border-t border-border my-1" />
                  
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                  >
                    <Icon name="Share" size={14} />
                    <span>Share Survey</span>
                  </button>
                  
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                  >
                    <Icon name="Settings" size={14} />
                    <span>Survey Settings</span>
                  </button>
                  
                  <div className="border-t border-border my-1" />
                  
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                  >
                    <Icon name="HelpCircle" size={14} />
                    <span>Help & Shortcuts</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="px-3 py-1 border-t border-border bg-muted/50">
          <div className="flex items-center justify-center space-x-4 text-xs text-text-secondary">
            <span>Ctrl+Z: Undo</span>
            <span>Ctrl+Y: Redo</span>
            <span>Ctrl+S: Save</span>
            <span>Ctrl+P: Preview</span>
          </div>
        </div>
      </div>
      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default FloatingToolbar;