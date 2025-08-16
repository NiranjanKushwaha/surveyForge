import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import QuestionRenderer from "../../survey-runtime-renderer/components/QuestionRenderer";

const SurveyCanvas = ({
  surveyData,
  onQuestionSelect,
  selectedQuestionId,
  onQuestionUpdate,
  onQuestionDelete,
  onQuestionDuplicate,
  onQuestionReorder,
  onDrop,
}) => {
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
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
                  className="p-1 hover:bg-muted rounded survey-transition"
                  title="Duplicate Question"
                >
                  <Icon name="Copy" size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e?.stopPropagation();
                    onQuestionDelete(question?.id);
                  }}
                  className="p-1 hover:bg-error/10 hover:text-error rounded survey-transition"
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
    switch (question?.type) {
      case "text-input":
      case "email":
      case "number":
        return (
          <input
            type="text"
            placeholder={question?.placeholder || "Your answer..."}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            disabled
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={question?.placeholder || "Your answer..."}
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none"
            disabled
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question?.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`preview-${question?.id}`}
                  disabled
                  className="text-primary"
                />
                <span className="text-sm text-foreground">{option?.label}</span>
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
          <div className="space-y-2">
            {question?.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input type="checkbox" disabled className="text-primary" />
                <span className="text-sm text-foreground">{option?.label}</span>
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
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            disabled
          >
            <option>Select an option...</option>
            {question?.options?.map((option, index) => (
              <option key={index} value={option?.value}>
                {option?.label}
              </option>
            ))}
          </select>
        );

      case "star-rating":
        return (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5]?.map((star) => (
              <Icon
                key={star}
                name="Star"
                size={20}
                color="var(--color-border)"
              />
            ))}
          </div>
        );

      case "likert":
        return (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              Strongly Disagree
            </span>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5]?.map((point) => (
                <input
                  key={point}
                  type="radio"
                  name={`likert-${question?.id}`}
                  disabled
                />
              ))}
            </div>
            <span className="text-xs text-text-secondary">Strongly Agree</span>
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase tracking-wider"></th>
                  {columns?.map((col) => (
                    <th
                      key={col?.id}
                      className="px-4 py-2 text-center text-xs font-medium text-text-secondary uppercase tracking-wider"
                    >
                      {col?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows?.map((row) => (
                  <tr key={row?.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-foreground">
                      {row?.label}
                    </td>
                    {columns?.map((col) => (
                      <td
                        key={col?.id}
                        className="px-4 py-2 whitespace-nowrap text-center"
                      >
                        <input
                          type={inputType}
                          name={`matrix-${question?.id}-${row?.id}`}
                          disabled
                          className="text-primary"
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
              <div className="text-sm text-text-secondary italic mt-2 text-center">
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
    <div className="flex-1 bg-surface overflow-hidden">
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
              onClick={() => setShowPreview(true)}
            >
              Preview
            </Button>
            <Button variant="outline" size="sm" iconName="Settings">
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

      {showPreview &&
        createPortal(
          <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-3xl h-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  Survey Preview: {surveyData?.title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {surveyData?.questions?.length === 0 ? (
                  <div className="text-center text-text-secondary">
                    No questions to preview. Add some questions to your survey.
                  </div>
                ) : (
                  surveyData?.questions?.map((question) => (
                    <div
                      key={question?.id}
                      className="bg-surface border border-border rounded-md p-4"
                    >
                      <h3 className="text-lg font-medium text-foreground mb-3">
                        {question?.title}
                      </h3>
                      <div className="space-y-3">
                        {renderQuestionPreview(question)}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-border text-right">
                <Button onClick={() => setShowPreview(false)}>
                  Close Preview
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SurveyCanvas;
