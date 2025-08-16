import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';

import ProgressIndicator from './components/ProgressIndicator';
import QuestionRenderer from './components/QuestionRenderer';
import NavigationControls from './components/NavigationControls';
import CompletionScreen from './components/CompletionScreen';

const SurveyRuntimeRenderer = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Mock survey data with various question types
  const mockSurvey = {
    id: surveyId || 1,
    title: "Customer Satisfaction Survey Q4 2024",
    description: "Help us improve our services by sharing your feedback",
    thankyouMessage: "Thank you for taking the time to complete our survey!",
    questions: [
      {
        id: 1,
        type: "single-choice",
        title: "How would you rate our overall service?",
        required: true,
        options: [
          { id: 1, text: "Excellent", value: "excellent" },
          { id: 2, text: "Good", value: "good" },
          { id: 3, text: "Fair", value: "fair" },
          { id: 4, text: "Poor", value: "poor" }
        ]
      },
      {
        id: 2,
        type: "multiple-choice",
        title: "Which of the following features do you find most valuable? (Select all that apply)",
        required: false,
        options: [
          { id: 1, text: "Fast Response Time", value: "fast_response" },
          { id: 2, text: "24/7 Support", value: "24_7_support" },
          { id: 3, text: "User-Friendly Interface", value: "user_friendly" },
          { id: 4, text: "Comprehensive Documentation", value: "documentation" },
          { id: 5, text: "Regular Updates", value: "updates" }
        ]
      },
      {
        id: 3,
        type: "text",
        title: "Please share any specific feedback or suggestions for improvement:",
        placeholder: "Your feedback helps us improve our services...",
        required: false,
        maxLength: 500
      },
      {
        id: 4,
        type: "rating",
        title: "How likely are you to recommend us to a colleague?",
        required: true,
        scale: 10,
        minLabel: "Not likely",
        maxLabel: "Very likely"
      },
      {
        id: 5,
        type: "email",
        title: "Would you like to be contacted regarding your feedback?",
        placeholder: "Enter your email address (optional)",
        required: false
      }
    ]
  };

  useEffect(() => {
    // Simulate loading survey data
    const loadSurvey = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSurvey(mockSurvey);
      setIsLoading(false);
    };

    loadSurvey();
  }, [surveyId]);

  // Auto-save responses
  useEffect(() => {
    if (Object.keys(responses)?.length > 0) {
      const timer = setTimeout(() => {
        // Simulate auto-save to localStorage
        localStorage.setItem(`survey_${surveyId}_responses`, JSON.stringify(responses));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [responses, surveyId]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear error for this question if it exists
    if (errors?.[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: null
      }));
    }
  };

  const validateCurrentQuestion = () => {
    const currentQuestion = survey?.questions?.[currentQuestionIndex];
    if (!currentQuestion?.required) return true;

    const response = responses?.[currentQuestion?.id];
    const isValid = response !== undefined && response !== '' && response !== null;

    if (!isValid) {
      setErrors(prev => ({
        ...prev,
        [currentQuestion?.id]: 'This question is required'
      }));
    }

    return isValid;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    if (currentQuestionIndex < survey?.questions?.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate all required questions
    let hasErrors = false;
    const newErrors = {};

    survey?.questions?.forEach(question => {
      if (question?.required) {
        const response = responses?.[question?.id];
        const isValid = response !== undefined && response !== '' && response !== null;
        if (!isValid) {
          newErrors[question?.id] = 'This question is required';
          hasErrors = true;
        }
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Simulate survey submission
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Clear saved responses
    localStorage.removeItem(`survey_${surveyId}_responses`);
    
    setIsCompleted(true);
    setIsLoading(false);
  };

  const progressPercentage = survey ? ((currentQuestionIndex + 1) / survey?.questions?.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return <CompletionScreen survey={survey} />;
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Survey Not Found</h2>
          <p className="text-text-secondary">The survey you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = survey?.questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Bar */}
      <ProgressIndicator 
        progress={progressPercentage}
        currentStep={currentQuestionIndex + 1}
        totalSteps={survey?.questions?.length}
      />
      {/* Main Content */}
      <div className="flex flex-col min-h-screen pt-4">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-2xl">
            {/* Survey Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {survey?.title}
              </h1>
              {survey?.description && (
                <p className="text-text-secondary text-lg">
                  {survey?.description}
                </p>
              )}
            </div>

            {/* Question Card */}
            <div className="bg-card border border-border rounded-lg survey-shadow p-6 lg:p-8 mb-8">
              {currentQuestion && (
                <QuestionRenderer
                  question={currentQuestion}
                  value={responses?.[currentQuestion?.id]}
                  onChange={(value) => handleResponseChange(currentQuestion?.id, value)}
                  error={errors?.[currentQuestion?.id]}
                />
              )}
            </div>

            {/* Navigation Controls */}
            <NavigationControls
              canGoBack={currentQuestionIndex > 0}
              canGoNext={true}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isLastQuestion={currentQuestionIndex === survey?.questions?.length - 1}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 text-sm text-text-secondary border-t border-border">
          <p>Powered by SurveyForge • Progress auto-saved</p>
        </footer>
      </div>
    </div>
  );
};

export default SurveyRuntimeRenderer;