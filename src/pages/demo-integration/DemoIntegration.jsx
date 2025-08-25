import React, { useState } from "react";
import SurveyViewer from "../../components/SurveyViewer";
import { mockJSONData } from "../../util/mockData";
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

const DemoIntegration = () => {
  const [submittedData, setSubmittedData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Transform mock data to single page format for demo
  const demoSurveyData = {
    ...mockJSONData,
    pages: [
      {
        id: "demo_page",
        name: "Demo Questions",
        questions: mockJSONData.pages.flatMap((page) => page.questions),
      },
    ],
  };

  const handleSubmit = async (submissionData) => {
    console.log("Demo form submitted:", submissionData);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setSubmittedData(submissionData);
    setIsSubmitted(true);

    // Example of returning a promise for async handling
    return Promise.resolve();
  };

  const handleQuestionChange = (questionId, value, allData) => {
    console.log("Question changed:", questionId, value, allData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Demo Completed!
            </h1>
            <p className="text-gray-600">
              Your demo survey has been submitted successfully.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              Submission Summary
            </h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <span className="font-medium">Survey:</span>{" "}
                {submittedData.surveyTitle}
              </p>
              <p>
                <span className="font-medium">Questions:</span>{" "}
                {submittedData.answeredQuestions} of{" "}
                {submittedData.totalQuestions} answered
              </p>
              <p>
                <span className="font-medium">Submitted:</span>{" "}
                {new Date(submittedData.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSubmittedData(null);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setSubmittedData(null);
                setIsSubmitted(false);
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <div>
              {/* Todo: go back to home page */}
              <Link to="/">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="text-xl font-bold text-gray-900">
              SurveyForge Demo Integration
            </div>
          </div>

          <p className="text-lg text-gray-600 mb-6">
            This demo showcases the enhanced SurveyViewer component with
            configurable submit buttons and enhanced callbacks.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Submit Button Variants
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { variant: "primary", label: "Primary", color: "blue" },
                { variant: "secondary", label: "Secondary", color: "gray" },
                { variant: "success", label: "Success", color: "green" },
                { variant: "warning", label: "Warning", color: "yellow" },
                { variant: "danger", label: "Danger", color: "red" },
                { variant: "outline", label: "Outline", color: "blue" },
                { variant: "ghost", label: "Ghost", color: "blue" },
                { variant: "custom", label: "Custom", color: "purple" },
              ].map(({ variant, label, color }) => (
                <div key={variant} className="text-center">
                  <button
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      variant === "primary"
                        ? "bg-blue-600 text-white"
                        : variant === "secondary"
                        ? "bg-gray-600 text-white"
                        : variant === "success"
                        ? "bg-green-600 text-white"
                        : variant === "warning"
                        ? "bg-yellow-600 text-white"
                        : variant === "danger"
                        ? "bg-red-600 text-white"
                        : variant === "outline"
                        ? "bg-transparent border-2 border-blue-600 text-blue-600"
                        : variant === "ghost"
                        ? "bg-transparent text-blue-600"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {label}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">{variant}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <SurveyViewer
            surveyData={demoSurveyData}
            mode="survey"
            submitButton={{
              label: "Complete Demo Survey",
              variant: "success",
              loadingLabel: "Submitting...",
              disabled: false,
            }}
            customStyles={{
              container: "max-w-none",
              input:
                "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
              label: "text-gray-700 font-medium",
              error: "text-red-600",
            }}
            onSubmit={handleSubmit}
            onQuestionChange={handleQuestionChange}
            initialValues={{}}
            className="p-8"
          />
        </div>
      </div>
    </div>
  );
};

export default DemoIntegration;
