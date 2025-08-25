import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import SurveyViewer from "../../../components/SurveyViewer";

const SurveyCanvas = ({
  surveyData,
  onQuestionSelect,
  selectedQuestionId,
  onQuestionUpdate,
  onQuestionDelete,
  onQuestionDuplicate,
  onQuestionReorder,
  onDrop,
  isPreviewMode,
  onTogglePreview,
  onSurveyDataUpdate, // Add this prop for updating survey data
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState("default");
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [jsonEditorValue, setJsonEditorValue] = useState("");
  const [originalJsonValue, setOriginalJsonValue] = useState("");
  const [jsonValidationErrors, setJsonValidationErrors] = useState([]);
  const [isJsonValid, setIsJsonValid] = useState(true);
  const [jsonEditorHistory, setJsonEditorHistory] = useState([]);
  const [jsonEditorHistoryIndex, setJsonEditorHistoryIndex] = useState(-1);
  const [lastAddedQuestionId, setLastAddedQuestionId] = useState(null);

  // Simple drag state
  const [draggedQuestionId, setDraggedQuestionId] = useState(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Add missing dragScrollInterval state
  const [dragScrollInterval, setDragScrollInterval] = useState(null);

  // Add mouse position tracking for drag scroll
  const [mouseY, setMouseY] = useState(0);

  const canvasRef = useRef(null);
  const jsonEditorRef = useRef(null);

  // Simple working drag and drop
  const handleQuestionDragStart = useCallback((e, questionId) => {
    setDraggedQuestionId(questionId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", questionId);
  }, []);

  const handleQuestionDragEnd = useCallback(() => {
    setDraggedQuestionId(null);
    setDragOverQuestionId(null);
    setIsDragging(false);
  }, []);

  const handleQuestionDragOver = useCallback(
    (e, questionId) => {
      e.preventDefault();
      if (draggedQuestionId && draggedQuestionId !== questionId) {
        setDragOverQuestionId(questionId);
      }
    },
    [draggedQuestionId]
  );

  const handleQuestionDragLeave = useCallback(() => {
    setDragOverQuestionId(null);
  }, []);

  const handleQuestionDrop = useCallback(
    (e, targetQuestionId) => {
      e.preventDefault();

      if (draggedQuestionId && draggedQuestionId !== targetQuestionId) {
        const currentPage = surveyData?.pages?.find(
          (page) => page.id === surveyData?.currentPageId
        );
        const currentQuestions = currentPage?.questions || [];

        const fromIndex = currentQuestions.findIndex(
          (q) => q.id === draggedQuestionId
        );
        const toIndex = currentQuestions.findIndex(
          (q) => q.id === targetQuestionId
        );

        if (fromIndex !== -1 && toIndex !== -1) {
          if (onQuestionReorder) {
            onQuestionReorder(fromIndex, toIndex);
          } else {
            // Fallback: manually reorder questions
            const newQuestions = [...currentQuestions];
            const [movedQuestion] = newQuestions.splice(fromIndex, 1);
            newQuestions.splice(toIndex, 0, movedQuestion);

            if (onSurveyDataUpdate) {
              const newSurveyData = {
                ...surveyData,
                pages: surveyData.pages.map((page) =>
                  page.id === surveyData.currentPageId
                    ? { ...page, questions: newQuestions }
                    : page
                ),
              };
              onSurveyDataUpdate(newSurveyData);
            }
          }
        }
      }

      setDraggedQuestionId(null);
      setDragOverQuestionId(null);
      setIsDragging(false);
    },
    [draggedQuestionId, surveyData, onQuestionReorder, onSurveyDataUpdate]
  );

  // Auto-scroll to newly added question
  useEffect(() => {
    if (lastAddedQuestionId) {
      const questionElement = document.getElementById(
        `survey-canvas-question-${lastAddedQuestionId}`
      );
      if (questionElement) {
        questionElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setLastAddedQuestionId(null);
      }
    }
  }, [lastAddedQuestionId]);

  // JSON Editor History Management
  const addToJsonHistory = useCallback(
    (value) => {
      setJsonEditorHistory((prev) => {
        const newHistory = prev.slice(0, jsonEditorHistoryIndex + 1);
        newHistory.push(value);
        return newHistory.slice(-50); // Keep last 50 states
      });
      setJsonEditorHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [jsonEditorHistoryIndex]
  );

  const undoJsonChange = useCallback(() => {
    if (jsonEditorHistoryIndex > 0) {
      const newIndex = jsonEditorHistoryIndex - 1;
      setJsonEditorHistoryIndex(newIndex);
      setJsonEditorValue(jsonEditorHistory[newIndex]);
      validateJSON(jsonEditorHistory[newIndex]);
    }
  }, [jsonEditorHistoryIndex, jsonEditorHistory]);

  const redoJsonChange = useCallback(() => {
    if (jsonEditorHistoryIndex < jsonEditorHistory.length - 1) {
      const newIndex = jsonEditorHistoryIndex + 1;
      setJsonEditorHistoryIndex(newIndex);
      setJsonEditorValue(jsonEditorHistory[newIndex]);
      validateJSON(jsonEditorHistory[newIndex]);
    }
  }, [jsonEditorHistoryIndex, jsonEditorHistory]);

  // Simple JSON Editor functions
  const openJsonEditor = useCallback(() => {
    try {
      const currentJson = JSON.stringify(surveyData, null, 2);
      setJsonEditorValue(currentJson);
      setOriginalJsonValue(currentJson);
      setIsJsonEditorOpen(true);
    } catch (error) {
      console.error("Error opening JSON editor:", error);
      alert("Error opening JSON editor. Please check your survey data.");
    }
  }, [surveyData]);

  const closeJsonEditor = useCallback(() => {
    setIsJsonEditorOpen(false);
    setJsonEditorValue(originalJsonValue);
    validateJSON(originalJsonValue);
  }, [originalJsonValue]);

  const saveJsonChanges = useCallback(() => {
    try {
      const parsedData = JSON.parse(jsonEditorValue);

      // Fix the data structure to match what the app expects
      const fixedData = {
        ...parsedData,
        currentPageId:
          parsedData.currentPageId ||
          (parsedData.pages && parsedData.pages[0]
            ? parsedData.pages[0].id
            : "page_1"),
        pages: parsedData.pages
          ? parsedData.pages.map((page) => ({
              ...page,
              questions: page.questions
                ? page.questions.map((question) => {
                    // Parse options if they're stored as JSON string
                    let options = question.options;
                    if (typeof options === "string" && options) {
                      try {
                        options = JSON.parse(options);
                      } catch (e) {
                        console.warn("Failed to parse options:", options);
                        options = [];
                      }
                    }

                    // Set default icon based on question type
                    let icon = question.icon || "Type";
                    switch (question.type) {
                      case "text":
                      case "text-input":
                        icon = "Type";
                        break;
                      case "email":
                        icon = "Mail";
                        break;
                      case "textarea":
                        icon = "FileText";
                        break;
                      case "radio":
                        icon = "Circle";
                        break;
                      case "checkbox":
                        icon = "CheckSquare";
                        break;
                      default:
                        icon = "Type";
                    }

                    return {
                      ...question,
                      options: options || [],
                      icon: icon,
                    };
                  })
                : [],
            }))
          : [],
      };

      console.log("Fixed data:", fixedData);

      if (onSurveyDataUpdate) {
        onSurveyDataUpdate(fixedData);
      }
      setIsJsonEditorOpen(false);
      setOriginalJsonValue(jsonEditorValue);
    } catch (error) {
      console.error("Error saving JSON:", error);
      alert("Invalid JSON format. Please check your syntax.");
    }
  }, [jsonEditorValue, onSurveyDataUpdate]);

  // Simple JSON validation
  const validateJSON = useCallback((jsonString) => {
    try {
      JSON.parse(jsonString);
      setJsonValidationErrors([]);
      setIsJsonValid(true);
      return true;
    } catch (error) {
      setJsonValidationErrors([`Invalid JSON syntax: ${error.message}`]);
      setIsJsonValid(false);
      return false;
    }
  }, []);

  const handleJsonEditorChange = useCallback(
    (value) => {
      setJsonEditorValue(value);
      validateJSON(value);
    },
    [validateJSON]
  );

  // Auto-scroll during drag operations
  const startDragScroll = useCallback(() => {
    if (dragScrollInterval) return;

    const interval = setInterval(() => {
      if (!isDragging) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Get mouse position from tracked state
      const currentMouseY = mouseY;
      const rect = canvas.getBoundingClientRect();
      const scrollSpeed = 35; // Much faster scrolling for better responsiveness
      const scrollThreshold = 60; // Smaller threshold for earlier activation

      // Calculate scroll zones with more aggressive detection
      const topZone = rect.top + scrollThreshold;
      const bottomZone = rect.bottom - scrollThreshold;

      // Add extra scroll zones at the very edges for easier activation
      const edgeZone = 40;

      if (currentMouseY < rect.top + edgeZone) {
        // Very top edge - super fast scroll
        canvas.scrollTop -= scrollSpeed * 2;
        showScrollIndicator("top");
      } else if (currentMouseY < topZone) {
        // Top zone - normal scroll
        canvas.scrollTop -= scrollSpeed;
        showScrollIndicator("top");
      } else if (currentMouseY > rect.bottom - edgeZone) {
        // Very bottom edge - super fast scroll
        canvas.scrollTop += scrollSpeed * 2;
        showScrollIndicator("bottom");
      } else if (currentMouseY > bottomZone) {
        // Bottom zone - normal scroll
        canvas.scrollTop += scrollSpeed;
        showScrollIndicator("bottom");
      } else {
        // Hide indicators when in middle
        hideScrollIndicators();
      }
    }, 8); // Even higher frequency for ultra-smooth scrolling

    setDragScrollInterval(interval);
  }, [isDragging, dragScrollInterval]);

  const stopDragScroll = useCallback(() => {
    if (dragScrollInterval) {
      clearInterval(dragScrollInterval);
      setDragScrollInterval(null);
    }
    hideScrollIndicators();
  }, [dragScrollInterval]);

  // Show/hide scroll indicators
  const showScrollIndicator = (position) => {
    let indicator = document.getElementById(`scroll-indicator-${position}`);
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = `scroll-indicator-${position}`;
      indicator.className = `scroll-indicator-${position}`;
      indicator.innerHTML = position === "top" ? "↑" : "↓";
      document.body.appendChild(indicator);
    }
    indicator.style.display = "flex";
  };

  const hideScrollIndicators = () => {
    const topIndicator = document.getElementById("scroll-indicator-top");
    const bottomIndicator = document.getElementById("scroll-indicator-bottom");
    if (topIndicator) topIndicator.style.display = "none";
    if (bottomIndicator) bottomIndicator.style.display = "none";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDragScroll();
      hideScrollIndicators();
    };
  }, [stopDragScroll]);

  // Add mouse position tracking for drag scroll
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseY(e.clientY);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Add keyboard shortcuts for faster navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isJsonEditorOpen && !isPreviewMode) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "z":
              e.preventDefault();
              // Could implement undo for question operations here
              break;
            case "y":
              e.preventDefault();
              // Could implement redo for question operations here
              break;
            case "s":
              e.preventDefault();
              // Could implement save here
              break;
            case "p":
              e.preventDefault();
              onTogglePreview();
              break;
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isJsonEditorOpen, isPreviewMode, onTogglePreview]);

  const handleDragOver = (e) => {
    e?.preventDefault();
    const rect = canvasRef?.current?.getBoundingClientRect();
    const y = e?.clientY - rect?.top;
    const questionElements = canvasRef?.current?.querySelectorAll(
      "[data-question-index]"
    );

    // Get questions from current page
    const currentPage = surveyData?.pages?.find(
      (page) => page.id === surveyData?.currentPageId
    );
    const currentQuestions = currentPage?.questions || [];
    let insertIndex = currentQuestions?.length;

    for (let i = 0; i < questionElements?.length; i++) {
      const element = questionElements?.[i];
      const elementRect = element?.getBoundingClientRect();
      const elementY = elementRect?.top - rect?.top + elementRect?.height / 2;

      if (y < elementY) {
        insertIndex = i;
        break;
      }
    }

    setDragOverIndex(insertIndex);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragOverIndex(null);

    try {
      const componentData = JSON.parse(
        e?.dataTransfer?.getData("application/json")
      );

      const newQuestionId = onDrop(componentData, dragOverIndex);

      if (newQuestionId) {
        setLastAddedQuestionId(newQuestionId);
      }
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  const handleDragLeave = (e) => {
    if (!canvasRef?.current?.contains(e?.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const renderQuestion = (question, index) => {
    const isSelected = selectedQuestionId === question?.id;
    const isDragging = draggedQuestionId === question?.id;
    const isDragOver = dragOverQuestionId === question?.id;

    return (
      <div key={question?.id} className="relative">
        {/* Drop indicator */}
        {dragOverIndex === index && (
          <div className="h-2 bg-gradient-to-r from-primary to-blue-500 rounded-full mb-3 survey-transition drop-indicator" />
        )}

        {/* Drag over indicator for reordering */}
        {isDragOver && (
          <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-3 survey-transition drop-indicator" />
        )}

        <div
          data-question-index={index}
          draggable={true}
          onDragStart={(e) => {
            handleQuestionDragStart(e, question?.id);
          }}
          onDragEnd={(e) => {
            handleQuestionDragEnd(e);
          }}
          onDragOver={(e) => {
            handleQuestionDragOver(e, question?.id);
          }}
          onDragLeave={(e) => {
            handleQuestionDragLeave(e);
          }}
          onDrop={(e) => {
            handleQuestionDrop(e, question?.id);
          }}
          onClick={() => onQuestionSelect(question?.id)}
          className={`group relative p-4 bg-card border-2 rounded-lg survey-transition cursor-pointer transform transition-all duration-200 ${
            isSelected
              ? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
              : isDragging
              ? "border-blue-400 bg-blue-50 opacity-60 scale-95 shadow-2xl"
              : isDragOver
              ? "border-blue-400 bg-blue-50 scale-[1.01] shadow-lg"
              : "border-border hover:border-primary/50 hover:bg-muted/50 hover:scale-[1.005] hover:shadow-md"
          } ${isDragging ? "dragging" : ""}`}
          id={`survey-canvas-question-${question?.id}`}
          style={{
            transform: isDragging ? "rotate(2deg) scale(0.95)" : "none",
            zIndex: isDragging ? 1000 : "auto",
          }}
        >
          {/* Enhanced Drag Handle */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 survey-transition">
            <div className="p-2 hover:bg-blue-100 rounded-full cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110">
              <Icon name="GripVertical" size={18} className="text-blue-500" />
            </div>
          </div>

          {/* Drag Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400 rounded-lg pointer-events-none animate-pulse" />
          )}

          {/* Question Content */}
          <div className="ml-4">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Icon
                    name={question?.icon}
                    size={16}
                    color="var(--color-primary)"
                  />
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                    {question?.type}
                  </span>
                  {question?.required && (
                    <span className="text-xs text-error bg-red-50 px-2 py-1 rounded-full">
                      Required
                    </span>
                  )}
                  {question?.conditionalLogic?.enabled && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full flex items-center">
                      <Icon name="GitBranch" size={10} className="mr-1" />
                      Logic
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={question?.title}
                  onChange={(e) =>
                    onQuestionUpdate(question?.id, { title: e?.target?.value })
                  }
                  className="text-lg font-medium text-foreground bg-transparent border-none outline-none w-full focus:bg-background focus:px-2 focus:py-1 focus:rounded survey-transition"
                  placeholder="Enter question title..."
                />
                {question?.description && (
                  <p className="text-sm text-text-secondary mt-1">
                    {question?.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 survey-transition">
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onQuestionDuplicate(question?.id);
                  }}
                  className="p-2 hover:bg-blue-100 rounded-full survey-transition survey-canvas-duplicate-question-button transition-all duration-200 hover:scale-110"
                  title="Duplicate Question"
                  id={`survey-canvas-duplicate-question-button-${question?.id}`}
                >
                  <Icon name="Copy" size={14} className="text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onQuestionDelete(question?.id);
                  }}
                  className="p-2 hover:bg-red-100 rounded-full survey-transition survey-canvas-delete-question-button transition-all duration-200 hover:scale-110"
                  title="Delete Question"
                >
                  <Icon name="Trash2" size={14} className="text-red-600" />
                </button>
              </div>
            </div>

            {/* Question Preview */}
            <div className="space-y-2">{renderQuestionPreview(question)}</div>

            {/* Question Footer */}
            {(question?.validation || question?.logic) && (
              <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-border">
                {question?.validation && (
                  <div className="flex items-center space-x-1 text-xs text-text-secondary">
                    <Icon name="Shield" size={12} />
                    <span>Validation</span>
                  </div>
                )}
                {question?.logic && (
                  <div className="flex items-center space-x-1 text-xs text-text-secondary">
                    <Icon name="GitBranch" size={12} />
                    <span>Logic</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionPreview = (question) => {
    const inputClasses = clsx(
      "w-full transition-all duration-200",
      previewMode === "form"
        ? "px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-foreground placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base"
        : "px-3 py-2 border border-border rounded bg-background text-foreground"
    );

    switch (question?.type) {
      case "text":
      case "text-input":
      case "email":
      case "number":
      case "phone":
        return (
          <input
            type={
              question?.type === "number"
                ? "number"
                : question?.type === "email"
                ? "email"
                : question?.type === "phone"
                ? "tel"
                : "text"
            }
            placeholder={question?.placeholder || "Your answer..."}
            className={inputClasses}
            disabled={previewMode !== "form"}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={question?.placeholder || "Your answer..."}
            rows={3}
            className={clsx(inputClasses, "resize-none min-h-[80px]")}
            disabled={previewMode !== "form"}
          />
        );

      case "radio":
        return (
          <div className={clsx("space-y-3", previewMode === "form" && "mt-2")}>
            {question?.options && question?.options?.length > 0
              ? question?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 cursor-pointer",
                      previewMode === "form" &&
                        "p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    )}
                  >
                    <input
                      type="radio"
                      name={`preview-${question?.id}`}
                      disabled={previewMode !== "form"}
                      className={clsx(
                        "text-primary",
                        previewMode === "form" && "h-5 w-5"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-foreground",
                        previewMode === "form" ? "text-base" : "text-sm"
                      )}
                    >
                      {option?.label}
                    </span>
                  </label>
                ))
              : // Show default radio options if none configured
                [
                  { label: "Option 1", value: "option1" },
                  { label: "Option 2", value: "option2" },
                  { label: "Option 3", value: "option3" },
                ].map((option, index) => (
                  <label
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 cursor-pointer",
                      previewMode === "form" &&
                        "p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    )}
                  >
                    <input
                      type="radio"
                      name={`preview-${question?.id}`}
                      disabled={previewMode !== "form"}
                      className={clsx(
                        "text-primary",
                        previewMode === "form" && "h-5 w-5"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-foreground",
                        previewMode === "form" ? "text-base" : "text-sm"
                      )}
                    >
                      {option?.label}
                    </span>
                  </label>
                ))}
          </div>
        );

      case "checkbox":
        return (
          <div className={clsx("space-y-3", previewMode === "form" && "mt-2")}>
            {question?.options && question?.options?.length > 0
              ? question?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 cursor-pointer",
                      previewMode === "form" &&
                        "p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={previewMode !== "form"}
                      className={clsx(
                        "text-primary rounded",
                        previewMode === "form" && "h-5 w-5"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-foreground",
                        previewMode === "form" ? "text-base" : "text-sm"
                      )}
                    >
                      {option?.label}
                    </span>
                  </label>
                ))
              : // Show default checkbox options if none configured
                [
                  { label: "Option 1", value: "option1" },
                  { label: "Option 2", value: "option2" },
                  { label: "Option 3", value: "option3" },
                ].map((option, index) => (
                  <label
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 cursor-pointer",
                      previewMode === "form" &&
                        "p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={previewMode !== "form"}
                      className={clsx(
                        "text-primary rounded",
                        previewMode === "form" && "h-5 w-5"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-foreground",
                        previewMode === "form" ? "text-base" : "text-sm"
                      )}
                    >
                      {option?.label}
                    </span>
                  </label>
                ))}
          </div>
        );

      case "dropdown":
        return (
          <select
            className={clsx(
              inputClasses,
              "appearance-none bg-no-repeat bg-[right_1rem_center] pr-10",
              previewMode === "form"
                ? "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')]"
                : ""
            )}
            disabled={previewMode !== "form"}
          >
            <option value="">Select an option...</option>
            {question?.options && question?.options?.length > 0
              ? question?.options?.map((option, index) => (
                  <option key={index} value={option?.value}>
                    {option?.label}
                  </option>
                ))
              : // Show default dropdown options if none configured
                [
                  { label: "Option 1", value: "option1" },
                  { label: "Option 2", value: "option2" },
                  { label: "Option 3", value: "option3" },
                ].map((option, index) => (
                  <option key={index} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
          </select>
        );

      case "multi-select":
        return (
          <div className={clsx("space-y-3", previewMode === "form" && "mt-2")}>
            {question?.options && question?.options?.length > 0
              ? question?.options?.map((option, index) => (
                  <label
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 cursor-pointer",
                      previewMode === "form" &&
                        "p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={previewMode !== "form"}
                      className={clsx(
                        "text-primary rounded",
                        previewMode === "form" && "h-5 w-5"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-foreground",
                        previewMode === "form" ? "text-base" : "text-sm"
                      )}
                    >
                      {option?.label}
                    </span>
                  </label>
                ))
              : // Show default multi-select options if none configured
                [
                  { label: "Option 1", value: "option1" },
                  { label: "Option 2", value: "option2" },
                  { label: "Option 3", value: "option3" },
                ].map((option, index) => (
                  <label
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 cursor-pointer",
                      previewMode === "form" &&
                        "p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    )}
                  >
                    <input
                      type="checkbox"
                      disabled={previewMode !== "form"}
                      className={clsx(
                        "text-primary rounded",
                        previewMode === "form" && "h-5 w-5"
                      )}
                    />
                    <span
                      className={clsx(
                        "text-foreground",
                        previewMode === "form" ? "text-base" : "text-sm"
                      )}
                    >
                      {option?.label}
                    </span>
                  </label>
                ))}
          </div>
        );

      case "star-rating":
        return (
          <div
            className={clsx(
              "flex items-center gap-2",
              previewMode === "form" && "mt-2"
            )}
          >
            {[1, 2, 3, 4, 5]?.map((star) => (
              <button
                key={star}
                type="button"
                className={clsx(
                  "transition-all duration-200 survey-canvas-star-rating-button",
                  previewMode === "form"
                    ? "p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    : "cursor-default"
                )}
                id={`survey-canvas-star-rating-button-${star}`}
                disabled={previewMode !== "form"}
                title={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Icon
                  name="Star"
                  size={previewMode === "form" ? 20 : 18}
                  className="text-yellow-400 transition-colors"
                />
              </button>
            ))}
            <span className="text-xs text-text-secondary ml-2">
              {previewMode === "form" ? "Click to rate" : "5-star rating"}
            </span>
          </div>
        );

      case "likert":
        return (
          <div
            className={clsx(
              previewMode === "form"
                ? "bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700"
                : ""
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className={clsx(
                  "text-text-secondary",
                  previewMode === "form" ? "text-sm" : "text-xs"
                )}
              >
                Strongly Disagree
              </span>
              <span
                className={clsx(
                  "text-text-secondary",
                  previewMode === "form" ? "text-sm" : "text-xs"
                )}
              >
                Strongly Agree
              </span>
            </div>
            <div className="flex justify-between gap-2">
              {[1, 2, 3, 4, 5]?.map((point) => (
                <label
                  key={point}
                  className={clsx(
                    "flex-1 text-center",
                    previewMode === "form" && "cursor-pointer"
                  )}
                >
                  <input
                    type="radio"
                    name={`likert-${question?.id}`}
                    value={point}
                    disabled={previewMode !== "form"}
                    className={clsx("sr-only")}
                  />
                  <div
                    className={clsx(
                      "mx-auto mb-2 flex items-center justify-center",
                      previewMode === "form"
                        ? "w-10 h-10 rounded-full border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary hover:bg-primary/5 transition-colors"
                        : "w-8 h-8"
                    )}
                  >
                    <span
                      className={clsx(
                        "font-medium",
                        previewMode === "form" ? "text-base" : "text-sm"
                      )}
                    >
                      {point}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case "nps":
        return (
          <div className="space-y-3">
            <div className="text-center mb-3">
              <p className="text-sm text-text-secondary mb-2">
                How likely are you to recommend us?
              </p>
              <p className="text-xs text-text-secondary">
                0 = Not at all likely, 10 = Extremely likely
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">0</span>
              <div className="flex gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={clsx(
                      "w-7 h-7 rounded border-2 transition-colors",
                      previewMode === "form"
                        ? "border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        : "border-gray-200 cursor-default"
                    )}
                    disabled={previewMode !== "form"}
                    title={`Rate ${i}`}
                  >
                    <span className="text-xs font-medium">{i}</span>
                  </button>
                ))}
              </div>
              <span className="text-xs text-text-secondary">10</span>
            </div>
            <div className="text-center text-xs text-text-secondary">
              {previewMode === "form"
                ? "Click a number to rate"
                : "NPS rating scale"}
            </div>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-secondary">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="50"
              step="1"
              className={clsx(
                "w-full h-2 bg-gray-200 rounded-lg appearance-none slider",
                previewMode === "form" ? "cursor-pointer" : "cursor-default"
              )}
              disabled={previewMode !== "form"}
            />
            <div className="text-center">
              <span className="text-sm font-medium">50</span>
              <span className="text-xs text-text-secondary ml-2">
                {previewMode === "form" ? "Drag to adjust" : "Slider value"}
              </span>
            </div>
          </div>
        );

      case "matrix-single":
      case "matrix-multiple":
        const rows = question?.rows || [
          { id: "row1", label: "Row 1" },
          { id: "row2", label: "Row 2" },
          { id: "row3", label: "Row 3" },
        ];
        const columns = question?.columns || [
          { id: "col1", label: "Column 1" },
          { id: "col2", label: "Column 2" },
          { id: "col3", label: "Column 3" },
        ];
        const inputType =
          question?.type === "matrix-single" ? "radio" : "checkbox";

        return (
          <div
            className={clsx(
              "overflow-x-auto",
              previewMode === "form" && "-mx-4"
            )}
          >
            <table
              className={clsx(
                "min-w-full",
                previewMode === "form"
                  ? "border-separate border-spacing-0"
                  : "divide-y divide-border"
              )}
            >
              <thead>
                <tr>
                  <th
                    className={clsx(
                      "text-left font-medium text-text-secondary uppercase tracking-wider",
                      previewMode === "form"
                        ? "px-4 py-3 text-sm"
                        : "px-3 py-2 text-xs"
                    )}
                  ></th>
                  {columns?.map((col) => (
                    <th
                      key={col?.id}
                      className={clsx(
                        "text-center font-medium text-text-secondary uppercase tracking-wider",
                        previewMode === "form"
                          ? "px-4 py-3 text-sm"
                          : "px-3 py-2 text-xs"
                      )}
                    >
                      {col?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className={clsx(
                  previewMode === "form"
                    ? "divide-y divide-zinc-200 dark:divide-zinc-700"
                    : "divide-y divide-border"
                )}
              >
                {rows?.map((row) => (
                  <tr key={row?.id}>
                    <td
                      className={clsx(
                        "whitespace-nowrap font-medium text-foreground",
                        previewMode === "form"
                          ? "px-4 py-3 text-base"
                          : "px-3 py-2 text-sm"
                      )}
                    >
                      {row?.label}
                    </td>
                    {columns?.map((col) => (
                      <td
                        key={col?.id}
                        className={clsx(
                          "whitespace-nowrap text-center",
                          previewMode === "form" ? "px-4 py-3" : "px-3 py-2"
                        )}
                      >
                        <input
                          type={inputType}
                          name={`matrix-${question?.id}-${row?.id}`}
                          disabled={previewMode !== "form"}
                          className={clsx(
                            "text-primary",
                            previewMode === "form" &&
                              inputType === "checkbox" &&
                              "rounded h-5 w-5",
                            previewMode === "form" &&
                              inputType === "radio" &&
                              "h-5 w-5"
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {(!question?.rows ||
              question?.rows?.length === 0 ||
              !question?.columns ||
              question?.columns?.length === 0) && (
              <div className="text-sm text-text-secondary italic mt-3 text-center">
                No rows or columns configured. Showing example.
              </div>
            )}
          </div>
        );

      case "ranking":
        return (
          <div className="space-y-2">
            {question?.options && question?.options?.length > 0
              ? question?.options?.map((option, index) => (
                  <div
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 p-2 border rounded-lg",
                      previewMode === "form"
                        ? "border-gray-200 hover:border-gray-300 cursor-move"
                        : "border-gray-100"
                    )}
                  >
                    <div className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-sm">
                      {option?.label || `Option ${index + 1}`}
                    </span>
                    <Icon
                      name="GripVertical"
                      size={14}
                      className="text-gray-400"
                    />
                  </div>
                ))
              : // Show default ranking options if none configured
                [
                  { label: "Option 1", value: "option1" },
                  { label: "Option 2", value: "option2" },
                  { label: "Option 3", value: "option3" },
                ].map((option, index) => (
                  <div
                    key={index}
                    className={clsx(
                      "flex items-center gap-3 p-2 border rounded-lg",
                      previewMode === "form"
                        ? "border-gray-200 hover:border-gray-300 cursor-move"
                        : "border-gray-100"
                    )}
                  >
                    <div className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <span className="flex-1 text-sm">{option?.label}</span>
                    <Icon
                      name="GripVertical"
                      size={14}
                      className="text-gray-400"
                    />
                  </div>
                ))}
          </div>
        );

      case "date-picker":
        return (
          <div className="space-y-2">
            <input
              type="date"
              className={inputClasses}
              disabled={previewMode !== "form"}
            />
            {previewMode === "form" && (
              <div className="text-xs text-text-secondary text-center">
                Click to select a date
              </div>
            )}
          </div>
        );

      case "time-picker":
        return (
          <div className="space-y-2">
            <input
              type="time"
              className={inputClasses}
              disabled={previewMode !== "form"}
            />
            {previewMode === "form" && (
              <div className="text-xs text-text-secondary text-center">
                Click to select a time
              </div>
            )}
          </div>
        );

      case "file-upload":
        return (
          <div
            className={clsx(
              "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
              previewMode === "form"
                ? "border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50"
                : "border-gray-200"
            )}
          >
            <Icon
              name="Upload"
              size={20}
              className="mx-auto mb-2 text-gray-400"
            />
            <p className="text-sm text-gray-600 mb-1">
              {previewMode === "form"
                ? "Click to upload files"
                : "File upload area"}
            </p>
            <p className="text-xs text-gray-500">
              Drag and drop files here or click to browse
            </p>
            {previewMode === "form" && (
              <div className="mt-3 text-xs text-gray-400">
                Supported formats: PDF, DOC, Images, etc.
              </div>
            )}
          </div>
        );

      case "signature":
        return (
          <div
            className={clsx(
              "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
              previewMode === "form"
                ? "border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50"
                : "border-gray-200"
            )}
          >
            <Icon
              name="PenTool"
              size={20}
              className="mx-auto mb-2 text-gray-400"
            />
            <p className="text-sm text-gray-600 mb-1">
              {previewMode === "form" ? "Click to sign" : "Signature area"}
            </p>
            <p className="text-xs text-gray-500">Draw your signature here</p>
            {previewMode === "form" && (
              <div className="mt-3 text-xs text-gray-400">
                Use mouse or touch to draw signature
              </div>
            )}
          </div>
        );

      case "location":
        return (
          <div
            className={clsx(
              "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
              previewMode === "form"
                ? "border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50"
                : "border-gray-200"
            )}
          >
            <Icon
              name="MapPin"
              size={20}
              className="mx-auto mb-2 text-gray-400"
            />
            <p className="text-sm text-gray-600 mb-1">
              {previewMode === "form"
                ? "Click to set location"
                : "Location picker"}
            </p>
            <p className="text-xs text-gray-500">
              Select your location on the map
            </p>
            {previewMode === "form" && (
              <div className="mt-3 text-xs text-gray-400">
                Opens map interface for location selection
              </div>
            )}
          </div>
        );

      // All supported question types are handled above
      // This case should not be reached for supported types

      default:
        return (
          <div className="p-3 bg-muted rounded-md text-center">
            <Icon
              name="HelpCircle"
              size={20}
              color="var(--color-text-secondary)"
              className="mx-auto mb-2"
            />
            <p className="text-sm text-text-secondary">
              Preview not available for question type:{" "}
              {question?.type || "unknown"}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              This question type may need additional configuration
            </p>
          </div>
        );
    }
  };

  const transformDataForSurveyViewer = (data) => {
    if (!data) return null;

    // Transform flat questions structure to pages structure for SurveyViewer
    const transformedData = {
      id: data.id || "preview_survey",
      title: data.title || "Survey Preview",
      description: data.description || "",
      pages: [
        {
          id: "preview_page",
          name: "Survey Questions",
          questions:
            data.questions?.map((question) => {
              const transformedQuestion = { ...question };

              // Handle different question types and map them to SurveyViewer supported types
              switch (question.type) {
                case "text":
                case "text-input":
                case "email":
                case "phone":
                  transformedQuestion.type = "text-input"; // Map to generic text input for viewer
                  transformedQuestion.placeholder =
                    question.placeholder || "Your answer...";
                  break;
                case "number":
                  transformedQuestion.type = "number-input"; // Use a specific type for number if viewer supports it
                  transformedQuestion.placeholder =
                    question.placeholder || "Enter a number...";
                  break;
                case "star-rating":
                  transformedQuestion.type = "rating";
                  transformedQuestion.scale = 5;
                  break;
                case "likert":
                  transformedQuestion.type = "radio"; // Convert likert to radio with scale options
                  transformedQuestion.options = [
                    { id: "opt1", label: "Strongly Disagree", value: "1" },
                    { id: "opt2", label: "Disagree", value: "2" },
                    { id: "opt3", label: "Neutral", value: "3" },
                    { id: "opt4", label: "Agree", value: "4" },
                    { id: "opt5", label: "Strongly Agree", value: "5" },
                  ];
                  break;
                case "nps":
                  transformedQuestion.type = "nps"; // Keep NPS type
                  transformedQuestion.scale = 10; // NPS typically 0-10
                  break;
                case "slider":
                  transformedQuestion.type = "slider"; // Keep slider type
                  transformedQuestion.min = 0;
                  transformedQuestion.max = 100;
                  transformedQuestion.step = 1;
                  break;
                case "date-picker":
                  transformedQuestion.type = "date";
                  break;
                case "time-picker":
                  transformedQuestion.type = "time";
                  break;
                case "file-upload":
                  transformedQuestion.type = "file";
                  break;
                case "signature":
                  transformedQuestion.type = "signature";
                  break;
                case "location":
                  transformedQuestion.type = "location";
                  break;
                case "matrix-single":
                case "matrix-multiple":
                case "ranking":
                case "radio":
                case "checkbox":
                case "dropdown":
                case "multi-select":
                case "textarea":
                  // These types are likely supported directly by SurveyViewer
                  break;
                default:
                  console.warn(
                    `Unknown question type encountered: ${question.type}. Defaulting to text-input.`
                  );
                  transformedQuestion.type = "text-input";
                  break;
              }

              return transformedQuestion;
            }) || [],
        },
      ],
    };

    return transformedData;
  };

  return (
    <div
      id="survey-canvas-container"
      className="flex-1 bg-surface flex flex-col survey-canvas-container"
    >
      {/* Canvas Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={surveyData?.title || "Untitled Survey"}
              onChange={(e) =>
                onSurveyDataUpdate?.({
                  ...surveyData,
                  title: e.target.value,
                })
              }
              className="text-xl font-semibold text-foreground bg-transparent border-none outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded survey-transition"
              placeholder="Enter survey title..."
            />
            <input
              type="text"
              value={surveyData?.description || ""}
              onChange={(e) =>
                onSurveyDataUpdate?.({
                  ...surveyData,
                  description: e.target.value,
                })
              }
              className="text-sm text-text-secondary bg-transparent border-none outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded survey-transition mt-1 w-full"
              placeholder="Enter survey description..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              onClick={onTogglePreview}
              className="survey-canvas-preview-button"
              id="survey-canvas-preview-button"
            >
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Code"
              onClick={openJsonEditor}
              className="survey-canvas-json-editor-button"
              id="survey-canvas-json-editor-button"
            >
              JSON Editor
            </Button>
            <Button
              id="survey-canvas-settings-button"
              variant="outline"
              size="sm"
              iconName="Settings"
              className="survey-canvas-settings-button"
            >
              Settings
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Info"
              onClick={() => {
                console.log("=== DEBUG INFO ===");
                console.log("Survey Data:", surveyData);
                console.log("Current Page ID:", surveyData?.currentPageId);
                console.log("All Pages:", surveyData?.pages);
                const currentPage = surveyData?.pages?.find(
                  (page) => page.id === surveyData?.currentPageId
                );
                console.log("Current Page:", currentPage);
                console.log("Current Questions:", currentPage?.questions);
                alert("Check console for debug info");
              }}
            >
              Debug
            </Button>
          </div>
        </div>
      </div>
      {/* Canvas Content */}
      <div
        ref={canvasRef}
        className={`flex-1 overflow-y-auto p-4 transition-all duration-300 ${
          isDragging ? "drag-scroll-zone" : ""
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {(() => {
          const currentPage = surveyData?.pages?.find(
            (page) => page.id === surveyData?.currentPageId
          );
          const currentQuestions = currentPage?.questions || [];

          if (currentQuestions?.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Icon
                    name="Plus"
                    size={24}
                    color="var(--color-text-secondary)"
                  />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Start Building Your Survey
                </h3>
                <p className="text-text-secondary max-w-md">
                  Drag components from the left panel to begin creating your
                  survey. You can reorder questions and customize them as
                  needed.
                </p>
              </div>
            );
          }

          return (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Enhanced Drag Scroll Zone Indicator */}
              {isDragging && (
                <div className="text-center text-sm text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4 shadow-sm">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Icon
                      name="MousePointer"
                      size={16}
                      className="text-blue-600"
                    />
                    <span className="font-semibold">🎯 Drag & Drop Active</span>
                  </div>
                  <p className="text-blue-700">
                    <strong>
                      Move your mouse to the top or bottom edges to scroll
                      quickly
                    </strong>
                  </p>
                  <div className="mt-2 text-xs text-blue-600">
                    💡 Tip: You can drag questions anywhere in the canvas to
                    reorder them
                  </div>
                </div>
              )}

              {/* Questions with enhanced spacing */}
              <div className="space-y-6">
                {currentQuestions?.map((question, index) =>
                  renderQuestion(question, index)
                )}
              </div>

              {/* Final drop zone with enhanced styling */}
              {dragOverIndex === currentQuestions?.length && (
                <div className="h-3 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full survey-transition drop-indicator shadow-lg" />
              )}
            </div>
          );
        })()}
      </div>

      {/* Preview Modal - Full Screen */}
      {isPreviewMode &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
              onClick={onTogglePreview}
            />

            {/* Preview Modal */}
            <div id="survey-canvas-preview-container" className="preview-modal">
              {/* Preview Header */}
              <div className="preview-modal-header">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {surveyData?.title || "Survey Preview"}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {surveyData?.description ||
                      "Preview your survey in different modes"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewMode === "default" ? "default" : "outline"}
                    size="sm"
                    id="survey-canvas-preview-mode-default-button"
                    onClick={() => setPreviewMode("default")}
                    className="survey-canvas-preview-mode-default-button"
                  >
                    <Icon name="Layout" size={16} className="mr-1" />
                    Default
                  </Button>
                  <Button
                    variant={previewMode === "form" ? "default" : "outline"}
                    size="sm"
                    id="survey-canvas-preview-mode-form-button"
                    onClick={() => setPreviewMode("form")}
                    className="survey-canvas-preview-mode-form-button"
                  >
                    <Icon name="FileText" size={16} className="mr-1" />
                    Form
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onTogglePreview}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
              </div>

              {/* Preview Content - Full Screen */}
              <div className="preview-modal-content">
                {(() => {
                  // Get all questions from all pages for comprehensive preview
                  const allQuestions =
                    surveyData?.pages?.flatMap(
                      (page) => page?.questions || []
                    ) || [];

                  if (allQuestions.length === 0) {
                    return (
                      <div
                        id="survey-canvas-preview-no-questions-content"
                        className="flex flex-col items-center justify-center h-full text-center p-6"
                      >
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
                          <Icon
                            name="FileQuestion"
                            size={24}
                            className="text-text-secondary"
                          />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          No Questions Yet
                        </h3>
                        <p className="text-text-secondary max-w-md">
                          Add some questions to your survey to preview how it
                          will look.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="p-6 overflow-y-auto max-h-screen">
                      {(() => {
                        const transformedData = transformDataForSurveyViewer({
                          ...surveyData,
                          questions: allQuestions,
                        });

                        if (
                          !transformedData ||
                          !transformedData.pages ||
                          transformedData.pages.length === 0
                        ) {
                          return (
                            <div className="text-center py-8 text-text-secondary">
                              Unable to preview survey data
                            </div>
                          );
                        }

                        return (
                          <SurveyViewer
                            key={`preview-${previewMode}`} // Force re-render when mode changes
                            surveyData={transformedData}
                            mode={previewMode === "form" ? "form" : "survey"}
                            submitButton={{
                              label: "Complete Survey",
                              variant: "primary",
                              className:
                                "bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl",
                            }}
                            customStyles={{
                              container: "max-w-none",
                              input:
                                "border-border bg-background text-foreground",
                              label: "text-foreground",
                              error: "text-error",
                            }}
                            onSubmit={(submissionData) => {
                              console.log(
                                "Preview form submitted:",
                                submissionData
                              );
                              // In preview mode, we just log the data with enhanced information
                              alert(
                                `Preview: Survey completed!\n\nTotal Questions: ${submissionData.totalQuestions}\nAnswered Questions: ${submissionData.answeredQuestions}\n\nCheck console for full data.`
                              );
                            }}
                            onQuestionChange={(questionId, value, allData) => {
                              console.log(
                                "Question changed:",
                                questionId,
                                value,
                                allData
                              );
                              // In preview mode, we just log the changes
                            }}
                            initialValues={{}}
                            className="survey-viewer-preview"
                          />
                        );
                      })()}
                    </div>
                  );
                })()}
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Simple JSON Editor Modal */}
      {isJsonEditorOpen &&
        createPortal(
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
            <div className="bg-card border border-border shadow-lg w-full h-full rounded-lg max-w-4xl overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Survey JSON Editor
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Edit the survey structure directly in JSON format
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveJsonChanges}
                    className="survey-canvas-json-editor-save-button"
                    id="survey-canvas-json-editor-save-button"
                    disabled={!isJsonValid}
                  >
                    <Icon name="Save" size={16} className="mr-1" />
                    Save Changes
                  </Button>
                  <Button variant="ghost" size="icon" onClick={closeJsonEditor}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <textarea
                  ref={jsonEditorRef}
                  value={jsonEditorValue}
                  onChange={(e) => handleJsonEditorChange(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-background text-foreground border-none outline-none resize-none"
                  placeholder="Enter JSON here..."
                  id="survey-canvas-json-editor-textarea"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-surface">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>
                    JSON Editor - Make sure to maintain valid JSON syntax
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        isJsonValid
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isJsonValid ? "Valid JSON" : "Invalid JSON"}
                    </span>
                    <span>{jsonEditorValue.length} characters</span>
                  </div>
                </div>

                {/* Validation Errors */}
                {jsonValidationErrors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon
                        name="AlertCircle"
                        size={16}
                        color="var(--color-error)"
                      />
                      <h4 className="font-semibold text-red-800">
                        JSON Validation Errors:
                      </h4>
                    </div>
                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                      {jsonValidationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SurveyCanvas;
