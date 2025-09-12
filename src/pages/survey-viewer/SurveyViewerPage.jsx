import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import SurveyViewer from "../../components/SurveyViewer";
import { mockJSONData } from "../../util/mockData";
import { publicSurveyAPI } from "../../services/api";
import { transformToFrontendFormat } from "../../utils/dataTransformers";

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
    const loadSurvey = async () => {
      setLoading(true);
      try {
        const data = await publicSurveyAPI.getPublicSurvey(surveyId);
        const transformedData = transformToFrontendFormat(data);
        setSurveyData(transformedData);
      } catch (error) {
        console.error("Error loading survey from API:", error);
        // Fallback to mock data for development
        // setSurveyData(mockJSONData); // Removed mock data fallback
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId]);

  const handleSubmit = async (submissionData) => {
    try {
      const responseData = {
        sessionId: `session_${Date.now()}`,
        timeSpent: submissionData.timeSpent || 0,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform
        },
        answers: Object.entries(submissionData.formData).map(([questionId, answer]) => ({
          questionId,
          answer
        }))
      };

      console.log("Submitting response data:", responseData);
      await publicSurveyAPI.submitResponse(surveyId, responseData);
      
      // Only set as submitted if API call succeeds
      setFormData(submissionData);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting response:", error);
      // Show error message to user
      alert(`Failed to submit survey: ${error.message || 'Unknown error'}`);
    }
    
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "SURVEY_SUBMITTED",
        surveyId,
        data: submissionData
      }, "*");
    }
  };

  const handleQuestionChange = (questionId, value, allData) => {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Survey</h2>
          <p className="text-gray-600">Please wait while we prepare your survey...</p>
        </div>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Survey Not Found</h1>
            <p className="text-gray-600 mb-6">The requested survey could not be loaded or may not be published yet.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Success Animation */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Thank You!</h1>
              <p className="text-green-100 text-lg">Your response has been submitted successfully</p>
            </div>
            
            <div className="p-8">
              {/* Submission summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="font-bold text-blue-900 mb-4 text-xl flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Submission Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{formData.answeredQuestions || 0}</div>
                    <div className="text-sm text-blue-800">Questions Answered</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">{formData.totalQuestions || 0}</div>
                    <div className="text-sm text-green-800">Total Questions</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">100%</div>
                    <div className="text-sm text-purple-800">Completion Rate</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-blue-800">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Survey:</span>
                    <span className="text-right">{formData.surveyTitle || "Survey"}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium">Submitted:</span>
                    <span className="text-right">{new Date(formData.submittedAt || Date.now()).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Take Survey Again</span>
                </button>
                
                <button
                  onClick={() => window.close()}
                  className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Close</span>
                </button>
              </div>
              
              {/* Debug info (collapsible) */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-8 text-left">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 p-3 rounded-lg">
                    View Response Data (Debug)
                  </summary>
                  <pre className="mt-3 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40 text-left border">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern header with glassmorphism effect */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
              {surveyData?.title || "Survey"}
            </h1>
            {surveyData?.description && (
              <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                {surveyData.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Survey content with enhanced design */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <SurveyViewer
            surveyData={surveyData}
            mode={mode}
            submitButton={{
              label: "Submit Survey",
              variant: "primary",
              className: "w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
            }}
            customStyles={{
              container: "p-8 md:p-12",
              question: "mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300",
              input: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm",
              label: "block text-base font-semibold text-gray-800 mb-3",
              button: "w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105",
              textarea: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none",
              select: "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/80 backdrop-blur-sm",
              ...customStyles
            }}
            onSubmit={handleSubmit}
            onQuestionChange={handleQuestionChange}
            initialValues={{}}
          />
        </div>
      </div>

      {/* Enhanced footer */}
      <div className="bg-white/60 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-800">SurveyForge</span>
            </div>
            <p className="text-gray-600 mb-2">Create beautiful surveys in minutes</p>
            <p className="text-sm text-gray-500">Professional survey tools for everyone</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyViewerPage;
