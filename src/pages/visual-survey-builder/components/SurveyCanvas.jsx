import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";

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
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState("default");
  const canvasRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    const rect = canvasRef?.current?.getBoundingClientRect();
    const y = e?.clientY - rect?.top;
    const questionElements = canvasRef?.current?.querySelectorAll(
      "[data-question-index]"
    );

    let insertIndex = surveyData?.questions?.length;

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
      onDrop(componentData, dragOverIndex);
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

    return (
      <div key={question?.id} className="relative">
        {/* Drop indicator */}
        {dragOverIndex === index && (
          <div className="h-1 bg-primary rounded-full mb-4 survey-transition" />
        )}
        <div
          data-question-index={index}
          onClick={() => onQuestionSelect(question?.id)}
          className={`group relative p-6 bg-card border-2 rounded-lg survey-transition cursor-pointer ${
            isSelected
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          id={`survey-canvas-question-${question?.id}`}
        >
          {/* Drag Handle */}
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 survey-transition">
            <div className="p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing">
              <Icon
                name="GripVertical"
                size={16}
                color="var(--color-text-secondary)"
              />
            </div>
          </div>

          {/* Question Content */}
          <div className="ml-6">
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4">
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
                    <span className="text-xs text-error">Required</span>
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
                  className="p-1 hover:bg-muted rounded survey-transition survey-canvas-duplicate-question-button"
                  title="Duplicate Question"
                  id={`survey-canvas-duplicate-question-button-${question?.id}`}
                >
                  <Icon name="Copy" size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onQuestionDelete(question?.id);
                  }}
                  className="p-1 hover:bg-error/10 hover:text-error rounded survey-transition survey-canvas-delete-question-button"
                  title="Delete Question"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>

            {/* Question Preview */}
            <div className="space-y-3">{renderQuestionPreview(question)}</div>

            {/* Question Footer */}
            {(question?.validation || question?.logic) && (
              <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-border">
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
        ? "px-4 py-3 border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        : "px-3 py-2 border-border rounded-md",
      "border bg-background text-foreground placeholder:text-text-secondary"
    );

    switch (question?.type) {
      case "text-input":
      case "email":
      case "number":
        return (
          <input
            type={question?.type === "number" ? "number" : "text"}
            placeholder={question?.placeholder || "Your answer..."}
            className={inputClasses}
            disabled={previewMode !== "form"}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={question?.placeholder || "Your answer..."}
            rows={4}
            className={clsx(inputClasses, "resize-none min-h-[100px]")}
            disabled={previewMode !== "form"}
          />
        );

      case "radio":
        return (
          <div className={clsx("space-y-3", previewMode === "form" && "mt-2")}>
            {question?.options?.map((option, index) => (
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
            )) || (
              <div className="text-sm text-text-secondary italic">
                No options configured
              </div>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className={clsx("space-y-3", previewMode === "form" && "mt-2")}>
            {question?.options?.map((option, index) => (
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
            )) || (
              <div className="text-sm text-text-secondary italic">
                No options configured
              </div>
            )}
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
            {question?.options?.map((option, index) => (
              <option key={index} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
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
                className={clsx(
                  "transition-all duration-200 survey-canvas-star-rating-button",
                  previewMode === "form"
                    ? "p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                    : "cursor-default"
                )}
                id={`survey-canvas-star-rating-button-${star}`}
                disabled={previewMode !== "form"}
              >
                <Icon
                  name="Star"
                  size={previewMode === "form" ? 24 : 20}
                  className="text-zinc-300 hover:text-yellow-400 transition-colors"
                />
              </button>
            ))}
          </div>
        );

      case "likert":
        return (
          <div
            className={clsx(
              previewMode === "form"
                ? "bg-zinc-50 dark:bg-zinc-900 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700"
                : ""
            )}
          >
            <div className="flex items-center justify-between mb-4">
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
                    disabled={!previewMode === "form"}
                    className={clsx("sr-only")}
                  />
                  <div
                    className={clsx(
                      "mx-auto mb-2 flex items-center justify-center",
                      previewMode === "form"
                        ? "w-12 h-12 rounded-full border-2 border-zinc-200 dark:border-zinc-700 hover:border-primary hover:bg-primary/5 transition-colors"
                        : "w-8 h-8"
                    )}
                  >
                    <span
                      className={clsx(
                        "font-medium",
                        previewMode === "form" ? "text-lg" : "text-sm"
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

      case "matrix-single":
      case "matrix-multiple":
        const rows = question?.rows || [
          { id: "row1", label: "Row 1" },
          { id: "row2", label: "Row 2" },
        ];
        const columns = question?.columns || [
          { id: "col1", label: "Column 1" },
          { id: "col2", label: "Column 2" },
        ];
        const inputType =
          question?.type === "matrix-single" ? "radio" : "checkbox";

        return (
          <div
            className={clsx(
              "overflow-x-auto",
              previewMode === "form" && "-mx-6"
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
                        ? "px-6 py-4 text-sm"
                        : "px-4 py-2 text-xs"
                    )}
                  ></th>
                  {columns?.map((col) => (
                    <th
                      key={col?.id}
                      className={clsx(
                        "text-center font-medium text-text-secondary uppercase tracking-wider",
                        previewMode === "form"
                          ? "px-6 py-4 text-sm"
                          : "px-4 py-2 text-xs"
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
                          ? "px-6 py-4 text-base"
                          : "px-4 py-2 text-sm"
                      )}
                    >
                      {row?.label}
                    </td>
                    {columns?.map((col) => (
                      <td
                        key={col?.id}
                        className={clsx(
                          "whitespace-nowrap text-center",
                          previewMode === "form" ? "px-6 py-4" : "px-4 py-2"
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
              <div className="text-sm text-text-secondary italic mt-4 text-center">
                No rows or columns configured. Showing example.
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-muted rounded-md text-center">
            <Icon
              name="HelpCircle"
              size={24}
              color="var(--color-text-secondary)"
              className="mx-auto mb-2"
            />
            <p className="text-sm text-text-secondary">
              Preview not available for this question type
            </p>
          </div>
        );
    }
  };

  return (
    <div id="survey-canvas-container" className="flex-1 bg-surface flex flex-col survey-canvas-container">
      {/* Canvas Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {surveyData?.title}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {surveyData?.description}
            </p>
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
            <Button id="survey-canvas-settings-button" variant="outline" size="sm" iconName="Settings" className="survey-canvas-settings-button">
              Settings
            </Button>
          </div>
        </div>
      </div>
      {/* Canvas Content */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-y-auto p-6"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {surveyData?.questions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Icon name="Plus" size={24} color="var(--color-text-secondary)" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Start Building Your Survey
            </h3>
            <p className="text-text-secondary max-w-md">
              Drag components from the left panel to begin creating your survey.
              You can reorder questions and customize them as needed.
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {surveyData?.questions?.map((question, index) =>
              renderQuestion(question, index)
            )}

            {/* Final drop zone */}
            {dragOverIndex === surveyData?.questions?.length && (
              <div className="h-1 bg-primary rounded-full survey-transition" />
            )}
          </div>
        )}
      </div>

      {isPreviewMode &&
        createPortal(
          <div id="survey-canvas-preview-container" className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border shadow-lg w-full h-full md:w-[90%] md:h-[90%] rounded-lg max-w-4xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border bg-surface">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {surveyData?.title}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    {surveyData?.description}
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

              <div
                className={clsx(
                  "flex-1 overflow-y-auto",
                  previewMode === "form"
                    ? "bg-white dark:bg-zinc-900"
                    : "bg-background"
                )}
              >
                {surveyData?.questions?.length === 0 ? (
                  <div id="survey-canvas-preview-no-questions-content" className="flex flex-col items-center justify-center h-full text-center p-6">
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
                      Add some questions to your survey to preview how it will
                      look.
                    </p>
                  </div>
                ) : (
                  <form id="survey-canvas-preview-questions-form" className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
                      {surveyData?.questions?.map((question, index) => (
                        <div
                          key={question?.id}
                          className={clsx(
                            "relative group",
                            question?.type === "matrix-single" ||
                              question?.type === "matrix-multiple"
                              ? "col-span-full"
                              : "",
                            question?.type === "likert" ? "md:col-span-2" : "",
                            question?.type === "textarea" ? "md:col-span-2" : ""
                          )}
                        >
                          <div id={`survey-canvas-preview-question-${question?.id}`} className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-base font-medium text-foreground group">
                                  {question?.title}
                                  {question?.required && (
                                    <span className="text-error font-normal text-sm bg-error/10 px-2 py-0.5 rounded">
                                      Required
                                    </span>
                                  )}
                                </label>
                                {question?.description && (
                                  <p className="text-sm text-text-secondary">
                                    {question?.description}
                                  </p>
                                )}
                              </div>
                              <span id={`survey-canvas-preview-question-index-${index}`} className="text-xs text-text-secondary px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
                                Q{index + 1}
                              </span>
                            </div>
                            {renderQuestionPreview(question)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </form>
                )}
              </div>

              {previewMode === "form" && surveyData?.questions?.length > 0 && (
                <div className="p-4 border-t border-border bg-surface">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <Button variant="outline" size="lg">
                      <Icon name="ArrowLeft" size={16} className="mr-2" />
                      Previous
                    </Button>
                    <Button size="lg">
                      Next
                      <Icon name="ArrowRight" size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SurveyCanvas;
