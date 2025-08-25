import React, { useState } from "react";
import { createPortal } from "react-dom";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

const FloatingToolbar = ({
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onPublishUpdate,
  canUndo,
  canRedo,
  saveStatus,
  isPreviewMode,
  onTogglePreview,
  surveyData,
  onExportSurvey, // New prop for export (copy to clipboard)
  onImportSurveyClick, // New prop for opening import modal
  onImportJson, // New prop for importing JSON
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false); // New state for import modal
  const [copyStatus, setCopyStatus] = useState("");
  const [importJsonText, setImportJsonText] = useState(""); // State for import textarea
  const [toastMessage, setToastMessage] = useState(""); // State for toast messages

  const getSaveStatusInfo = () => {
    switch (saveStatus) {
      case "saving":
        return {
          icon: "Loader2",
          text: "Saving...",
          color: "var(--color-warning)",
        };
      case "saved":
        return {
          icon: "Check",
          text: "Saved",
          color: "var(--color-success)",
        };
      case "unsaved":
        return {
          icon: "Clock",
          text: "Unsaved",
          color: "var(--color-warning)",
        };
      case "error":
        return {
          icon: "AlertCircle",
          text: "Save Failed",
          color: "var(--color-error)",
        };
      default:
        return {
          icon: "Clock",
          text: "Auto-saving...",
          color: "var(--color-text-secondary)",
        };
    }
  };

  const handleShowJson = () => {
    setShowJsonModal(true);
    setIsExpanded(false);
    setCopyStatus("");
  };

  const handleCloseJsonModal = () => {
    setShowJsonModal(false);
  };

  const handleCopyJson = () => {
    if (surveyData) {
      const jsonString = JSON.stringify(surveyData, null, 2);
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          setCopyStatus("Copied!");
          setTimeout(() => setCopyStatus(""), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy JSON: ", err);
          setCopyStatus("Failed to copy");
        });
    }
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setIsExpanded(false);
    setImportJsonText(""); // Clear previous text
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
  };

  const handleImportSubmit = () => {
    onImportJson(importJsonText); // Pass the text to the parent
    handleCloseImportModal();
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000); // Hide toast after 3 seconds
  };

  const statusInfo = getSaveStatusInfo();

  return (
    <>
      <div
        id="floating-toolbar-container"
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 floating-toolbar-container"
      >
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
                className="floating-toolbar-undo-button"
                id="floating-toolbar-undo-button"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
                iconName="Redo2"
                title="Redo (Ctrl+Y)"
                className="floating-toolbar-redo-button"
                id="floating-toolbar-redo-button"
              />
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Save Status */}
            <div className="flex items-center space-x-2 px-2">
              <Icon
                name={statusInfo?.icon}
                size={14}
                color={statusInfo?.color}
                className={saveStatus === "saving" ? "animate-spin" : ""}
              />
              <span className="text-xs text-text-secondary">
                {statusInfo?.text}
              </span>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Preview Toggle */}
            <Button
              variant={isPreviewMode ? "default" : "ghost"}
              size="sm"
              onClick={onTogglePreview}
              iconName="Eye"
              title="Toggle Preview Mode"
              className="floating-toolbar-preview-button"
              id="floating-toolbar-preview-button"
            >
              {isPreviewMode ? "Exit Preview" : "Preview"}
            </Button>

            {/* Publish/Update Button - ONLY button that calls API */}
            <Button
              variant={saveStatus === "unsaved" ? "destructive" : "default"}
              size="sm"
              onClick={onPublishUpdate}
              iconName="Send"
              title={
                saveStatus === "unsaved"
                  ? "Publish/Update Survey to Server (Unsaved Changes)"
                  : "Publish/Update Survey to Server"
              }
              className="floating-toolbar-publish-button"
              id="floating-toolbar-publish-button"
            >
              {surveyData?.id ? "Update" : "Publish"}
              {saveStatus === "unsaved" && (
                <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  !
                </span>
              )}
            </Button>

            {/* More Actions */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                iconName="MoreHorizontal"
                title="More Actions"
                className="floating-toolbar-more-actions-button"
                id="floating-toolbar-more-actions-button"
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
                      id="floating-toolbar-save-button"
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2 floating-toolbar-save-button"
                    >
                      <Icon name="Save" size={14} />
                      <small>Save to Local Storage</small>
                      <small className="ml-auto text-xs text-text-secondary">
                        Ctrl+S
                      </small>
                    </button>

                    <button
                      onClick={() => {
                        onExportSurvey();
                        setIsExpanded(false);
                        showToast("Survey JSON dowloaded successfully!");
                      }}
                      id="floating-toolbar-copy-json-button"
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2 floating-toolbar-copy-json-button"
                    >
                      <Icon name="Copy" size={14} />
                      <small>Download Survey JSON</small>
                    </button>

                    <button
                      onClick={handleShowJson}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2 floating-toolbar-view-json-button"
                      id="floating-toolbar-view-json-button"
                    >
                      <Icon name="Code" size={14} />
                      <small>View Survey JSON</small>
                    </button>

                    <div className="border-t border-border my-1" />

                    <button
                      onClick={() => setIsExpanded(false)}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2 floating-toolbar-help-button"
                      id="floating-toolbar-help-button"
                    >
                      <Icon name="HelpCircle" size={14} />
                      <small>Help & Shortcuts</small>
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
              <span>Ctrl+S: Save Locally</span>
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

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg z-50 survey-transition">
          {toastMessage}
        </div>
      )}

      {/* JSON Modal */}
      {showJsonModal &&
        createPortal(
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl h-3/4 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  Survey JSON
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseJsonModal}
                  className="floating-toolbar-close-json-modal-button"
                  id="floating-toolbar-close-json-modal-button"
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <textarea
                  readOnly
                  value={JSON.stringify(surveyData, null, 2)}
                  className="w-full h-full bg-background text-foreground font-mono text-sm p-2 border border-border rounded-md resize-none"
                />
              </div>
              <div className="p-4 border-t border-border flex justify-between items-center">
                <span className="text-sm text-text-secondary">
                  {copyStatus}
                </span>
                <Button
                  onClick={handleCopyJson}
                  iconName="Copy"
                  className="floating-toolbar-copy-json-modal-button"
                  id="floating-toolbar-copy-json-modal-button"
                >
                  Copy JSON
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Import Survey Modal */}
      {showImportModal &&
        createPortal(
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl h-3/4 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  Import Survey from JSON
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseImportModal}
                  id="floating-toolbar-close-import-modal-button"
                  className="floating-toolbar-close-import-modal-button"
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste your survey JSON here..."
                  className="w-full h-full bg-background text-foreground font-mono text-sm p-2 border border-border rounded-md resize-none"
                />
              </div>
              <div className="p-4 border-t border-border text-right">
                <Button
                  id="floating-toolbar-import-modal-button"
                  onClick={handleImportSubmit}
                  iconName="Upload"
                  className="floating-toolbar-import-modal-button"
                >
                  Import Survey
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default FloatingToolbar;
