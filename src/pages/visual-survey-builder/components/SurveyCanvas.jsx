import React, { useState, useRef } from "react";
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
  console.log("SurveyCanvas received surveyData:", surveyData); // Debug log
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState("default");
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [jsonEditorValue, setJsonEditorValue] = useState("");
  const canvasRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    const rect = canvasRef?.current?.getBoundingClientRect();
    const y = e?.clientY - rect?.top;
    const questionElements = canvasRef?.current?.querySelectorAll(
      "[data-question-index]"
    );

    // Get questions from current page
    const currentPage = surveyData?.pages?.find(page => page.id === surveyData?.currentPageId);
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
      
      console.log("Component data received in SurveyCanvas:", componentData); // Debug log
      
      // Pass the component data directly to the parent component
      onDrop(componentData, dragOverIndex);
    } catch (error) {
      console.error("Error handling drop:", error);
    }
  };

  // Generate unique question name based on type and existing questions
  const generateUniqueQuestionName = (questionType, currentSurveyData) => {
    const typeMap = {
      'text': 'text_input',
      'text-input': 'text_input',
      'textarea': 'textarea',
      'email': 'email',
      'number': 'number',
      'phone': 'phone',
      'radio': 'radio_selection',
      'checkbox': 'checkbox_selection',
      'dropdown': 'dropdown_selection',
      'multi-select': 'multi_select',
      'star-rating': 'star_rating',
      'likert': 'likert_scale',
      'nps': 'nps_score',
      'slider': 'slider',
      'matrix-single': 'matrix_single',
      'matrix-multiple': 'matrix_multiple',
      'ranking': 'ranking',
      'date-picker': 'date_picker',
      'time-picker': 'time_picker',
      'file-upload': 'file_upload',
      'signature': 'signature',
      'location': 'location'
    };

    const baseName = typeMap[questionType] || 'question';
    let counter = 1;
    let questionName = `${baseName}_${counter}`;

    // Get all existing question names from the survey
    const existingNames = currentSurveyData?.pages?.flatMap(page => 
      page?.questions?.map(q => q.name) || []
    ) || [];

    // Find a unique name
    while (existingNames.includes(questionName)) {
      counter++;
      questionName = `${baseName}_${counter}`;
    }

    return questionName;
  };

  const handleDragLeave = (e) => {
    if (!canvasRef?.current?.contains(e?.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const renderQuestion = (question, index) => {
    console.log("Rendering question:", question); // Debug log
    console.log("Question type in renderQuestion:", question?.type); // Debug log
    
    const isSelected = selectedQuestionId === question?.id;

    return (
      <div key={question?.id} className="relative">
        {/* Drop indicator */}
        {dragOverIndex === index && (
          <div className="h-1 bg-primary rounded-full mb-3 survey-transition" />
        )}
        <div
          data-question-index={index}
          onClick={() => onQuestionSelect(question?.id)}
          className={`group relative p-4 bg-card border-2 rounded-lg survey-transition cursor-pointer ${
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
    console.log("Rendering preview for question:", question); // Debug log
    console.log("Question type:", question?.type); // Debug log
    
    const inputClasses = clsx(
      "w-full transition-all duration-200",
      previewMode === "form"
        ? "px-4 py-3 border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
        : "px-3 py-2 border-border rounded-md",
      "border bg-background text-foreground placeholder:text-text-secondary"
    );

    switch (question?.type) {
      case "text":
      case "text-input":
      case "email":
      case "number":
      case "phone":
        return (
          <input
            type={question?.type === "number" ? "number" : question?.type === "email" ? "email" : question?.type === "phone" ? "tel" : "text"}
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
            {(question?.options && question?.options?.length > 0) ? question?.options?.map((option, index) => (
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
            )) : (
              // Show default radio options if none configured
              [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" }
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
              ))
            )}
          </div>
        );

      case "checkbox":
        return (
          <div className={clsx("space-y-3", previewMode === "form" && "mt-2")}>
            {(question?.options && question?.options?.length > 0) ? question?.options?.map((option, index) => (
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
            )) : (
              // Show default checkbox options if none configured
              [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" }
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
              ))
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
            {(question?.options && question?.options?.length > 0) ? question?.options?.map((option, index) => (
              <option key={index} value={option?.value}>
                {option?.label}
              </option>
            )) : (
              // Show default dropdown options if none configured
              [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" }
              ].map((option, index) => (
                <option key={index} value={option?.value}>
                  {option?.label}
                </option>
              ))
            )}
          </select>
        );

      case "multi-select":
        return (
          <div className={clsx("space-y-3", previewMode === "form" && "mt-2")}>
            {(question?.options && question?.options?.length > 0) ? question?.options?.map((option, index) => (
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
            )) : (
              // Show default multi-select options if none configured
              [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" }
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
              ))
            )}
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
                className={clsx(
                  "transition-all duration-200 survey-canvas-star-rating-button",
                  previewMode === "form"
                    ? "p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full hover:scale-110"
                    : "cursor-default"
                )}
                id={`survey-canvas-star-rating-button-${star}`}
                disabled={previewMode !== "form"}
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Icon
                  name="Star"
                  size={previewMode === "form" ? 20 : 18}
                  className="text-zinc-300 hover:text-yellow-400 transition-colors"
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
                    disabled={!previewMode === "form"}
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
              <p className="text-sm text-text-secondary mb-2">How likely are you to recommend us?</p>
              <p className="text-xs text-text-secondary">0 = Not at all likely, 10 = Extremely likely</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-text-secondary">0</span>
              <div className="flex gap-1">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    className={clsx(
                      "w-7 h-7 rounded border-2 transition-colors",
                      previewMode === "form"
                        ? "border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer hover:scale-110"
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
              {previewMode === "form" ? "Click a number to rate" : "NPS rating scale"}
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
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
            {(question?.options && question?.options?.length > 0) ? question?.options?.map((option, index) => (
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
                <span className="flex-1 text-sm">{option?.label || `Option ${index + 1}`}</span>
                <Icon
                  name="GripVertical"
                  size={14}
                  className="text-gray-400"
                />
              </div>
            )) : (
              // Show default ranking options if none configured
              [
                { label: "Option 1", value: "option1" },
                { label: "Option 2", value: "option2" },
                { label: "Option 3", value: "option3" }
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
              ))
            )}
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
          <div className={clsx(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
            previewMode === "form"
              ? "border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50"
              : "border-gray-200"
          )}>
            <Icon
              name="Upload"
              size={20}
              className="mx-auto mb-2 text-gray-400"
            />
            <p className="text-sm text-gray-600 mb-1">
              {previewMode === "form" ? "Click to upload files" : "File upload area"}
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
          <div className={clsx(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
            previewMode === "form"
              ? "border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50"
              : "border-gray-200"
          )}>
            <Icon
              name="PenTool"
              size={20}
              className="mx-auto mb-2 text-gray-400"
            />
            <p className="text-sm text-gray-600 mb-1">
              {previewMode === "form" ? "Click to sign" : "Signature area"}
            </p>
            <p className="text-xs text-gray-500">
              Draw your signature here
            </p>
            {previewMode === "form" && (
              <div className="mt-3 text-xs text-gray-400">
                Use mouse or touch to draw signature
              </div>
            )}
          </div>
        );

      case "location":
        return (
          <div className={clsx(
            "border-2 border-dashed rounded-lg p-4 text-center transition-colors",
            previewMode === "form"
              ? "border-gray-300 hover:border-gray-400 cursor-pointer hover:bg-gray-50"
              : "border-gray-200"
          )}>
            <Icon
              name="MapPin"
              size={20}
              className="mx-auto mb-2 text-gray-400"
            />
            <p className="text-sm text-gray-600 mb-1">
              {previewMode === "form" ? "Click to set location" : "Location picker"}
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
        console.warn(`Unhandled question type: ${question?.type}`); // Debug log
        return (
          <div className="p-3 bg-muted rounded-md text-center">
            <Icon
              name="HelpCircle"
              size={20}
              color="var(--color-text-secondary)"
              className="mx-auto mb-2"
            />
            <p className="text-sm text-text-secondary">
              Preview not available for question type: {question?.type || 'unknown'}
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
          questions: data.questions?.map((question) => {
            const transformedQuestion = { ...question };
            
            // Handle different question types and map them to SurveyViewer supported types
            switch (question.type) {
              case "star-rating":
                transformedQuestion.type = "rating";
                transformedQuestion.scale = 5;
                break;
              case "number":
                transformedQuestion.type = "text-input";
                transformedQuestion.placeholder = question.placeholder || "Enter a number...";
                break;
              case "matrix-single":
                // Convert matrix single to radio with options
                transformedQuestion.type = "radio";
                if (!transformedQuestion.options) {
                  transformedQuestion.options = [
                    { id: "opt1", label: "Option 1", value: "option1" },
                    { id: "opt2", label: "Option 2", value: "option2" }
                  ];
                }
                break;
              case "matrix-multiple":
                // Convert matrix multiple to checkbox with options
                transformedQuestion.type = "checkbox";
                if (!transformedQuestion.options) {
                  transformedQuestion.options = [
                    { id: "opt1", label: "Option 1", value: "option1" },
                    { id: "opt2", label: "Option 2", value: "option2" }
                  ];
                }
                break;
              case "likert":
                // Convert likert to radio with scale options
                transformedQuestion.type = "radio";
                transformedQuestion.options = [
                  { id: "opt1", label: "Strongly Disagree", value: "1" },
                  { id: "opt2", label: "Disagree", value: "2" },
                  { id: "opt3", label: "Neutral", value: "3" },
                  { id: "opt4", label: "Agree", value: "4" },
                  { id: "opt5", label: "Strongly Agree", value: "5" }
                ];
                break;
              default:
                // Keep original type if it's already supported
                break;
            }
            
            return transformedQuestion;
          }) || []
        }
      ]
    };
    
    return transformedData;
  };

  return (
    <div id="survey-canvas-container" className="flex-1 bg-surface flex flex-col survey-canvas-container">
      {/* Canvas Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <input
              type="text"
              value={surveyData?.title || "Untitled Survey"}
              onChange={(e) => onSurveyDataUpdate?.({
                ...surveyData,
                title: e.target.value
              })}
              className="text-xl font-semibold text-foreground bg-transparent border-none outline-none focus:bg-background focus:px-2 focus:py-1 focus:rounded survey-transition"
              placeholder="Enter survey title..."
            />
            <input
              type="text"
              value={surveyData?.description || ""}
              onChange={(e) => onSurveyDataUpdate?.({
                ...surveyData,
                description: e.target.value
              })}
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
              onClick={() => {
                setJsonEditorValue(JSON.stringify(surveyData, null, 2));
                setIsJsonEditorOpen(true);
              }}
              className="survey-canvas-json-editor-button"
              id="survey-canvas-json-editor-button"
            >
              JSON Editor
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
        className="flex-1 overflow-y-auto p-4"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {(() => {
          const currentPage = surveyData?.pages?.find(page => page.id === surveyData?.currentPageId);
          const currentQuestions = currentPage?.questions || [];
          
          if (currentQuestions?.length === 0) {
            return (
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
            );
          }
          
          return (
            <div className="space-y-4 max-w-4xl mx-auto">
              {currentQuestions?.map((question, index) =>
                renderQuestion(question, index)
              )}

              {/* Final drop zone */}
              {dragOverIndex === currentQuestions?.length && (
                <div className="h-1 bg-primary rounded-full survey-transition" />
              )}
            </div>
          );
        })()}
      </div>

      {/* Preview Modal */}
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

              <div className="flex-1 overflow-y-auto">
                {(() => {
                  const currentPage = surveyData?.pages?.find(page => page.id === surveyData?.currentPageId);
                  const currentQuestions = currentPage?.questions || [];
                  
                  if (currentQuestions?.length === 0) {
                    return (
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
                    );
                  }
                  
                  return (
                    <div className="p-6">
                      {(() => {
                        const transformedData = transformDataForSurveyViewer({
                          ...surveyData,
                          questions: currentQuestions
                        });
                        
                        if (!transformedData || !transformedData.pages || transformedData.pages.length === 0) {
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
                              className: "bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            }}
                            customStyles={{
                              container: "max-w-none",
                              input: "border-border bg-background text-foreground",
                              label: "text-foreground",
                              error: "text-error"
                            }}
                            onSubmit={(submissionData) => {
                              console.log("Preview form submitted:", submissionData);
                              // In preview mode, we just log the data with enhanced information
                              alert(`Preview: Survey completed!\n\nTotal Questions: ${submissionData.totalQuestions}\nAnswered Questions: ${submissionData.answeredQuestions}\n\nCheck console for full data.`);
                            }}
                            onQuestionChange={(questionId, value, allData) => {
                              console.log("Question changed:", questionId, value, allData);
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
          </div>,
          document.body
        )}

      {/* JSON Editor Modal */}
      {isJsonEditorOpen &&
        createPortal(
          <div id="survey-canvas-json-editor-modal" className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border shadow-lg w-full h-full md:w-[90%] md:h-[90%] rounded-lg max-w-6xl overflow-hidden flex flex-col">
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
                    onClick={() => {
                      try {
                        const parsedData = JSON.parse(jsonEditorValue);
                        // Here you would typically call a function to update the survey data
                        console.log("Updated survey data:", parsedData);
                        onSurveyDataUpdate(parsedData); // Update the main surveyData prop
                        setIsJsonEditorOpen(false);
                      } catch (error) {
                        alert("Invalid JSON format. Please check your syntax.");
                      }
                    }}
                    className="survey-canvas-json-editor-save-button"
                    id="survey-canvas-json-editor-save-button"
                  >
                    <Icon name="Save" size={16} className="mr-1" />
                    Save Changes
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsJsonEditorOpen(false)}>
                    <Icon name="X" size={20} />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <textarea
                  value={jsonEditorValue}
                  onChange={(e) => setJsonEditorValue(e.target.value)}
                  className="w-full h-full p-4 font-mono text-sm bg-background text-foreground border-none outline-none resize-none"
                  placeholder="Enter JSON here..."
                  id="survey-canvas-json-editor-textarea"
                />
              </div>

              <div className="p-4 border-t border-border bg-surface">
                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <span>JSON Editor - Make sure to maintain valid JSON syntax</span>
                  <span>{jsonEditorValue.length} characters</span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default SurveyCanvas;
