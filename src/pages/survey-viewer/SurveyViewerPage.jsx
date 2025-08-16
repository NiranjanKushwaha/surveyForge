import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SurveyViewer from "../../components/SurveyViewer";
import { mockJSONData } from "../../util/mockData";

const SurveyViewerPage = () => {
  const { surveyId } = useParams();
  const [searchParams] = useSearchParams();
  
  // Get configuration from URL parameters
  const mode = searchParams.get("mode") || "survey"; // "survey" or "form"
  const customStylesParam = searchParams.get("styles");
  
  // Parse custom styles if provided
  const customStyles = customStylesParam ? JSON.parse(decodeURIComponent(customStylesParam)) : {};
  
  // State for form data
  const [formData, setFormData] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load survey data (in real app, this would come from API)
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to load survey data
    const loadSurvey = async () => {
      setLoading(true);
      try {
        // In real app, fetch survey data by ID
        // const response = await fetch(`/api/surveys/${surveyId}`);
        // const data = await response.json();
        
        // For demo, use mock data
        const data = mockJSONData;
        setSurveyData(data);
      } catch (error) {
        console.error("Error loading survey:", error);
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId]);

  // Handle form submission
  const handleSubmit = (submissionData) => {
    setFormData(submissionData);
    setIsSubmitted(true);
    
    // In real app, send data to your backend
    console.log("Form submitted:", submissionData);
    console.log("Form responses:", submissionData.formData);
    console.log("Survey metadata:", {
      surveyId: submissionData.surveyId,
      surveyTitle: submissionData.surveyTitle,
      totalQuestions: submissionData.totalQuestions,
      answeredQuestions: submissionData.answeredQuestions,
      submittedAt: submissionData.submittedAt
    });
    
    // Example: Send to parent application if embedded
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "SURVEY_SUBMITTED",
        surveyId,
        data: submissionData
      }, "*");
    }
  };

  // Handle question changes
  const handleQuestionChange = (questionId, value, allData) => {
    // In real app, you might want to save partial responses
    console.log("Question changed:", questionId, value, allData);
    
    // Example: Send to parent application if embedded
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "SURVEY_QUESTION_CHANGED",
        surveyId,
        questionId,
        value,
        allData
      }, "*");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Not Found</h1>
          <p className="text-gray-600">The requested survey could not be loaded.</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-4">Your response has been submitted successfully.</p>
          
          {/* Display submission summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Submission Summary</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Survey:</span> {formData.surveyTitle}</p>
              <p><span className="font-medium">Questions:</span> {formData.answeredQuestions} of {formData.totalQuestions} answered</p>
              <p><span className="font-medium">Submitted:</span> {new Date(formData.submittedAt).toLocaleString()}</p>
            </div>
          </div>
          
          {/* Display submitted data for demo */}
          <details className="text-left">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
              View Full Response Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SurveyViewer
        surveyData={surveyData}
        mode={mode}
        submitButton={{
          label: "Submit Survey",
          variant: "primary",
          className: "bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        }}
        customStyles={customStyles}
        onSubmit={handleSubmit}
        onQuestionChange={handleQuestionChange}
        initialValues={{}}
      />
    </div>
  );
};

export default SurveyViewerPage;
