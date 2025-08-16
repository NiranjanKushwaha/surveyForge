import React, { useState, useEffect, useCallback } from "react";
import { cn } from "../utils/cn";

const SurveyViewer = ({
  surveyData,
  mode = "survey", // "survey" or "form"
  customStyles = {},
  onSubmit,
  onQuestionChange,
  initialValues = {},
  className = "",
  ...props
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [errors, setErrors] = useState({});

  // Get current page data
  const currentPage = surveyData?.pages?.[currentPageIndex];
  const totalPages = surveyData?.pages?.length || 0;

  // Initialize form data with survey structure
  useEffect(() => {
    const initialFormData = {};
    surveyData?.pages?.forEach((page) => {
      page?.questions?.forEach((question) => {
        if (question?.type === "checkbox" || question?.type === "multi-select") {
          initialFormData[question?.id] = [];
        } else {
          initialFormData[question?.id] = "";
        }
      });
    });
    setFormData({ ...initialFormData, ...initialValues });
  }, [surveyData, initialValues]);

  // Handle form data changes
  const handleInputChange = useCallback((questionId, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    // Call external onChange handler if provided
    if (onQuestionChange) {
      onQuestionChange(questionId, value, { ...formData, [questionId]: value });
    }
  }, [formData, onQuestionChange]);

  // Validate current page
  const validateCurrentPage = useCallback(() => {
    const pageErrors = {};
    currentPage?.questions?.forEach((question) => {
      if (question?.required) {
        const value = formData[question?.id];
        if (!value || (Array.isArray(value) && value?.length === 0)) {
          pageErrors[question?.id] = "This field is required";
        }
      }
    });
    setErrors(pageErrors);
    return Object.keys(pageErrors).length === 0;
  }, [currentPage, formData]);

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentPage()) {
      if (currentPageIndex < totalPages - 1) {
        setCurrentPageIndex(currentPageIndex + 1);
        setErrors({});
      } else {
        // Submit form on last page
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    if (validateCurrentPage()) {
      if (onSubmit) {
        onSubmit(formData);
      }
    }
  };

  // Check if question should be shown based on conditional logic
  const shouldShowQuestion = useCallback((question) => {
    if (!question?.conditionalLogic?.enabled) return true;

    const { dependsOn, condition, value } = question?.conditionalLogic;
    const dependentValue = formData[dependsOn];

    switch (condition) {
      case "equals":
        return dependentValue === value;
      case "not_equals":
        return dependentValue !== value;
      case "contains":
        return Array.isArray(dependentValue) 
          ? dependentValue?.includes(value)
          : String(dependentValue)?.includes(value);
      case "not_contains":
        return Array.isArray(dependentValue)
          ? !dependentValue?.includes(value)
          : !String(dependentValue)?.includes(value);
      case "greater_than":
        return Number(dependentValue) > Number(value);
      case "less_than":
        return Number(dependentValue) < Number(value);
      default:
        return true;
    }
  }, [formData]);

  // Render question based on type
  const renderQuestion = useCallback((question) => {
    if (!shouldShowQuestion(question)) return null;

    const questionId = question?.id;
    const value = formData[questionId];
    const error = errors[questionId];

    const baseInputClasses = cn(
      "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
      error ? "border-red-500" : "border-gray-300",
      customStyles?.input || ""
    );

    const baseLabelClasses = cn(
      "block text-sm font-medium mb-2",
      customStyles?.label || "text-gray-700"
    );

    const baseErrorClasses = cn(
      "text-sm text-red-600 mt-1",
      customStyles?.error || ""
    );

    switch (question?.type) {
      case "text-input":
        return (
          <div key={questionId} className="mb-6">
            <label htmlFor={questionId} className={baseLabelClasses}>
              {question?.title}
              {question?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {mode === "survey" && question?.description && (
              <p className="text-gray-600 text-sm mb-2">{question?.description}</p>
            )}
            <input
              type="text"
              id={questionId}
              name={questionId}
              value={value || ""}
              onChange={(e) => handleInputChange(questionId, e?.target?.value)}
              placeholder={question?.placeholder}
              className={baseInputClasses}
              required={question?.required}
            />
            {error && <p className={baseErrorClasses}>{error}</p>}
          </div>
        );

      case "email":
        return (
          <div key={questionId} className="mb-6">
            <label htmlFor={questionId} className={baseLabelClasses}>
              {question?.title}
              {question?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {mode === "survey" && question?.description && (
              <p className="text-gray-600 text-sm mb-2">{question?.description}</p>
            )}
            <input
              type="email"
              id={questionId}
              name={questionId}
              value={value || ""}
              onChange={(e) => handleInputChange(questionId, e?.target?.value)}
              placeholder={question?.placeholder}
              className={baseInputClasses}
              required={question?.required}
            />
            {error && <p className={baseErrorClasses}>{error}</p>}
          </div>
        );

      case "textarea":
        return (
          <div key={questionId} className="mb-6">
            <label htmlFor={questionId} className={baseLabelClasses}>
              {question?.title}
              {question?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {mode === "survey" && question?.description && (
              <p className="text-gray-600 text-sm mb-2">{question?.description}</p>
            )}
            <textarea
              id={questionId}
              name={questionId}
              value={value || ""}
              onChange={(e) => handleInputChange(questionId, e?.target?.value)}
              placeholder={question?.placeholder}
              rows={4}
              className={baseInputClasses}
              required={question?.required}
            />
            {error && <p className={baseErrorClasses}>{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={questionId} className="mb-6">
            <label className={baseLabelClasses}>
              {question?.title}
              {question?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {mode === "survey" && question?.description && (
              <p className="text-gray-600 text-sm mb-2">{question?.description}</p>
            )}
            <div className="space-y-2">
              {question?.options?.map((option) => (
                <label key={option?.id} className="flex items-center">
                  <input
                    type="radio"
                    name={questionId}
                    value={option?.value}
                    checked={value === option?.value}
                    onChange={(e) => handleInputChange(questionId, e?.target?.value)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                    required={question?.required}
                  />
                  <span className="text-sm text-gray-700">{option?.label}</span>
                </label>
              ))}
            </div>
            {error && <p className={baseErrorClasses}>{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={questionId} className="mb-6">
            <label className={baseLabelClasses}>
              {question?.title}
              {question?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {mode === "survey" && question?.description && (
              <p className="text-gray-600 text-sm mb-2">{question?.description}</p>
            )}
            <div className="space-y-2">
              {question?.options?.map((option) => (
                <label key={option?.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option?.value}
                    checked={Array.isArray(value) && value?.includes(option?.value)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? [...value] : [];
                      if (e?.target?.checked) {
                        currentValues.push(option?.value);
                      } else {
                        const index = currentValues.indexOf(option?.value);
                        if (index > -1) currentValues.splice(index, 1);
                      }
                      handleInputChange(questionId, currentValues);
                    }}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option?.label}</span>
                </label>
              ))}
            </div>
            {error && <p className={baseErrorClasses}>{error}</p>}
          </div>
        );

      case "rating":
        return (
          <div key={questionId} className="mb-6">
            <label className={baseLabelClasses}>
              {question?.title}
              {question?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {mode === "survey" && question?.description && (
              <p className="text-gray-600 text-sm mb-2">{question?.description}</p>
            )}
            <div className="flex space-x-1">
              {Array.from({ length: question?.scale || 5 }, (_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  onClick={() => handleInputChange(questionId, i + 1)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors survey-viewer-rating-button",
                    value === i + 1
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-gray-300 text-gray-600 hover:border-blue-300"
                  )}
                  id={`survey-viewer-rating-button-${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            {error && <p className={baseErrorClasses}>{error}</p>}
          </div>
        );

      case "dropdown":
        return (
          <div key={questionId} className="mb-6">
            <label htmlFor={questionId} className={baseLabelClasses}>
              {question?.title}
              {question?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {mode === "survey" && question?.description && (
              <p className="text-gray-600 text-sm mb-2">{question?.description}</p>
            )}
            <select
              id={questionId}
              name={questionId}
              value={value || ""}
              onChange={(e) => handleInputChange(questionId, e?.target?.value)}
              className={baseInputClasses}
              required={question?.required}
            >
              <option value="">Select an option</option>
              {question?.options?.map((option) => (
                <option key={option?.id} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
            {error && <p className={baseErrorClasses}>{error}</p>}
          </div>
        );

      default:
        return null;
    }
  }, [formData, errors, handleInputChange, shouldShowQuestion, mode, customStyles]);

  // Render progress indicator
  const renderProgress = () => {
    if (totalPages <= 1) return null;

    const progress = ((currentPageIndex + 1) / totalPages) * 100;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Page {currentPageIndex + 1} of {totalPages}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Render navigation buttons
  const renderNavigation = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPageIndex === 0}
          className={cn(
            "px-4 py-2 rounded-md font-medium transition-colors survey-viewer-previous-button",
            currentPageIndex === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-600 text-white hover:bg-gray-700",
            customStyles?.button || ""
          )}
          id="survey-viewer-previous-button"
        >
          Previous
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-colors survey-viewer-next-button",
            currentPageIndex === totalPages - 1
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-blue-600 text-white hover:bg-blue-700",
            customStyles?.button || ""
          )}
          id="survey-viewer-next-button"
        >
          {currentPageIndex === totalPages - 1 ? "Submit" : "Next"}
        </button>
      </div>
    );
  };

  if (!surveyData || !currentPage) {
    return (
      <div className="text-center py-8 text-gray-500">
        No survey data available
      </div>
    );
  }

  return (
    <div id="survey-viewer-container" className={cn("max-w-2xl mx-auto p-6 survey-viewer-container", className)} {...props}>
      {/* Survey Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {surveyData?.title}
        </h1>
        {mode === "survey" && surveyData?.description && (
          <p className="text-gray-600">{surveyData?.description}</p>
        )}
      </div>

      {/* Progress Indicator */}
      {renderProgress()}

      {/* Page Title */}
      {totalPages > 1 && (
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {currentPage?.name}
        </h2>
      )}

      {/* Questions */}
      <form onSubmit={(e) => e.preventDefault()}>
        {currentPage?.questions?.map(renderQuestion)}
      </form>

      {/* Navigation */}
      {renderNavigation()}
    </div>
  );
};

export default SurveyViewer;
