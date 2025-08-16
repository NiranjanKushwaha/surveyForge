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
  const handleSubmit = (data) => {
    setFormData(data);
    setIsSubmitted(true);
    
    // In real app, send data to your backend
    console.log("Form submitted:", data);
    
    // Example: Send to parent application if embedded
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "SURVEY_SUBMITTED",
        surveyId,
        data
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
          <p className="text-gray-600 mb-6">Your response has been submitted successfully.</p>
          
          {/* Display submitted data for demo */}
          <details className="text-left">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
              View Submitted Data
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
        customStyles={customStyles}
        onSubmit={handleSubmit}
        onQuestionChange={handleQuestionChange}
        initialValues={{}}
      />
    </div>
  );
};

export default SurveyViewerPage;
