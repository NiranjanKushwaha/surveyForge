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
  submitButton = {
    label: "Complete",
    className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors",
    variant: "primary", // "primary", "secondary", "success", "warning", "danger", "outline", "ghost", "custom"
    loadingLabel: "Submitting...",
    disabled: false
  },
  ...props
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (validateCurrentPage()) {
      setIsSubmitting(true);
      
      try {
        // Get all questions from all pages to create a comprehensive mapping
        const allQuestions = surveyData?.pages?.flatMap(page => page?.questions || []) || [];
        const questionMap = allQuestions.reduce((acc, question) => {
          acc[question.id] = question;
          return acc;
        }, {});

        // Prepare the submission data with enhanced question metadata
        const submissionData = {
          formData,
          surveyId: surveyData?.id,
          surveyTitle: surveyData?.title,
          submittedAt: new Date().toISOString(),
          totalQuestions: allQuestions.length,
          answeredQuestions: Object.keys(formData).filter(key => {
            const value = formData[key];
            return value && (typeof value === 'string' ? value.trim() !== '' : Array.isArray(value) ? value.length > 0 : true);
          }).length,
          // Enhanced question mapping with names
          questions: allQuestions.map(question => ({
            id: question.id,
            name: question.name || question.id,
            title: question.title,
            type: question.type,
            required: question.required,
            answer: formData[question.id] || null,
            answered: formData[question.id] && (
              typeof formData[question.id] === 'string' 
                ? formData[question.id].trim() !== '' 
                : Array.isArray(formData[question.id]) 
                  ? formData[question.id].length > 0 
                  : true
            )
          })),
          // Flattened answers with question names for easy processing
          answers: Object.entries(formData).map(([questionId, answer]) => {
            const question = questionMap[questionId];
            return {
              questionId,
              questionName: question?.name || questionId,
              questionTitle: question?.title || '',
              questionType: question?.type || '',
              answer,
              answered: answer && (
                typeof answer === 'string' 
                  ? answer.trim() !== '' 
                  : Array.isArray(answer) 
                    ? answer.length > 0 
                    : true
              )
            };
          }).filter(item => item.answered)
        };

        if (onSubmit) {
          // If onSubmit returns a promise, wait for it
          const result = onSubmit(submissionData);
          if (result && typeof result.then === 'function') {
            await result;
          }
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        // You could add error handling here, like showing a toast notification
      } finally {
        setIsSubmitting(false);
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

  // Get submit button styles based on variant
  const getSubmitButtonStyles = useCallback((variant) => {
    const baseClasses = "px-6 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    switch (variant) {
      case "primary":
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
      case "secondary":
        return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500`;
      case "success":
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
      case "warning":
        return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500`;
      case "danger":
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`;
      case "outline":
        return `${baseClasses} bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500`;
      case "ghost":
        return `${baseClasses} bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500`;
      case "custom":
        return submitButton.className || `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
      default:
        return submitButton.className || `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
    }
  }, [submitButton.className]);

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
          disabled={currentPageIndex === totalPages - 1 ? (isSubmitting || submitButton.disabled) : false}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-colors survey-viewer-next-button",
            currentPageIndex === totalPages - 1
              ? getSubmitButtonStyles(submitButton.variant)
              : "bg-blue-600 text-white hover:bg-blue-700",
            customStyles?.button || "",
            (isSubmitting || submitButton.disabled) ? "opacity-50 cursor-not-allowed" : ""
          )}
          id="survey-viewer-next-button"
        >
          {currentPageIndex === totalPages - 1 
            ? (isSubmitting ? submitButton.loadingLabel : submitButton.label)
            : "Next"
          }
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

      {/* Standalone Submit Button for Single Page Surveys */}
      {totalPages <= 1 && currentPage?.questions && currentPage.questions.length > 0 && (
        <div className="flex justify-center mt-8 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || submitButton.disabled}
            className={cn(
              getSubmitButtonStyles(submitButton.variant),
              "survey-viewer-submit-button px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200",
              (isSubmitting || submitButton.disabled) ? "opacity-50 cursor-not-allowed" : ""
            )}
            id="survey-viewer-submit-button"
          >
            {isSubmitting ? submitButton.loadingLabel : submitButton.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default SurveyViewer;
