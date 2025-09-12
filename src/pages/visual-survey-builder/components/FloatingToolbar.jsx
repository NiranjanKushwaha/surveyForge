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
  onPublishSurvey,
  onUnpublishSurvey,
  onGetPublicLink,
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
  const [showPublishModal, setShowPublishModal] = useState(false); // New state for publish modal
  const [copyStatus, setCopyStatus] = useState("");
  const [importJsonText, setImportJsonText] = useState(""); // State for import textarea
  const [toastMessage, setToastMessage] = useState(""); // State for toast messages
  const [publicLink, setPublicLink] = useState(""); // State for public link

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

  const handlePublishSurvey = async () => {
    try {
      await onPublishSurvey();
      setShowPublishModal(true);
      setIsExpanded(false);
      showToast("Survey published successfully!");
    } catch (error) {
      showToast("Failed to publish survey: " + error.message);
    }
  };

  const handleUnpublishSurvey = async () => {
    try {
      await onUnpublishSurvey();
      setShowPublishModal(false);
      showToast("Survey unpublished successfully!");
    } catch (error) {
      showToast("Failed to unpublish survey: " + error.message);
    }
  };

  const handleGetPublicLink = async () => {
    try {
      const link = await onGetPublicLink();
      setPublicLink(link);
      setShowPublishModal(true);
      setIsExpanded(false);
    } catch (error) {
      showToast("Failed to get public link: " + error.message);
    }
  };

  const handleCopyPublicLink = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink).then(() => {
        showToast("Public link copied to clipboard!");
      }).catch(() => {
        showToast("Failed to copy link");
      });
    }
  };

  const handleShareToSocial = (platform) => {
    if (!publicLink) return;
    
    const surveyTitle = surveyData?.title || "Survey";
    const text = `Take this survey: ${surveyTitle}`;
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicLink)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicLink)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${publicLink}`)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(surveyTitle)}&body=${encodeURIComponent(`${text}\n\n${publicLink}`)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const generateQRCode = () => {
    if (!publicLink) return;
    
    // Simple QR code generation using a service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicLink)}`;
    
    // Open QR code in new window
    const qrWindow = window.open('', '_blank', 'width=400,height=500');
    qrWindow.document.write(`
      <html>
        <head><title>QR Code for Survey</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h2>QR Code for Survey</h2>
          <img src="${qrUrl}" alt="QR Code" style="border: 1px solid #ccc; border-radius: 8px;">
          <p style="margin-top: 20px; color: #666;">Scan this QR code to access the survey</p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">${publicLink}</p>
        </body>
      </html>
    `);
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

                    {/* Publish/Share Section */}
                    {surveyData?.id && (
                      <>
                        <button
                          onClick={handlePublishSurvey}
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                        >
                          <Icon name="Globe" size={14} />
                          <small>Publish Survey</small>
                        </button>

                        <button
                          onClick={handleGetPublicLink}
                          className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted survey-transition flex items-center space-x-2"
                        >
                          <Icon name="Share2" size={14} />
                          <small>Get Public Link</small>
                        </button>

                        <div className="border-t border-border my-1" />
                      </>
                    )}

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

      {/* Publish Modal */}
      {showPublishModal &&
        createPortal(
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  Survey Published
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPublishModal(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <div className="p-4">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Check" size={32} color="var(--color-success)" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Survey is now live!
                  </h3>
                  <p className="text-text-secondary text-sm">
                    Your survey is now publicly accessible and ready to collect responses.
                  </p>
                </div>

                {publicLink && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Public Survey Link
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={publicLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono"
                        />
                        <Button
                          onClick={handleCopyPublicLink}
                          size="sm"
                          iconName="Copy"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Icon name="Info" size={16} color="var(--color-primary)" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Share this link with your audience</p>
                          <p className="text-xs">
                            Anyone with this link can take your survey. Responses will be saved to your dashboard.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Sharing Options */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900 text-sm">Share Options</h4>
                      
                      {/* Social Media Sharing */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShareToSocial('twitter')}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Icon name="Twitter" size={16} />
                          <span>Twitter</span>
                        </button>
                        
                        <button
                          onClick={() => handleShareToSocial('facebook')}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Icon name="Facebook" size={16} />
                          <span>Facebook</span>
                        </button>
                        
                        <button
                          onClick={() => handleShareToSocial('linkedin')}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Icon name="Linkedin" size={16} />
                          <span>LinkedIn</span>
                        </button>
                        
                        <button
                          onClick={() => handleShareToSocial('whatsapp')}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Icon name="MessageCircle" size={16} />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                      
                      {/* Email and QR Code */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShareToSocial('email')}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Icon name="Mail" size={16} />
                          <span>Email</span>
                        </button>
                        
                        <button
                          onClick={generateQRCode}
                          className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Icon name="QrCode" size={16} />
                          <span>QR Code</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowPublishModal(false)}
                  >
                    Close
                  </Button>
                  {publicLink && (
                    <Button
                      onClick={() => {
                        window.open(publicLink, '_blank');
                        setShowPublishModal(false);
                      }}
                      iconName="ExternalLink"
                    >
                      Open Survey
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default FloatingToolbar;
