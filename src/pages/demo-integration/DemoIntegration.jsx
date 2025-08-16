import React, { useState } from "react";
import SurveyViewer from "../../components/SurveyViewer";
import { mockJSONData } from "../../util/mockData";

const DemoIntegration = () => {
  const [mode, setMode] = useState("survey");
  const [customStyles, setCustomStyles] = useState({});
  const [formData, setFormData] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Example custom styles
  const stylePresets = {
    default: {},
    modern: {
      input: "border-2 border-blue-300 rounded-lg px-4 py-3 bg-blue-50 focus:bg-white",
      label: "text-lg font-semibold text-blue-800 mb-3",
      button: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium",
      error: "text-red-700 font-medium"
    },
    elegant: {
      input: "border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
      label: "text-gray-700 font-medium mb-2",
      button: "bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md font-medium",
      error: "text-red-600 text-sm"
    },
    minimal: {
      input: "border-b-2 border-gray-300 px-2 py-1 focus:border-gray-600 outline-none",
      label: "text-gray-800 font-medium mb-1",
      button: "bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 font-medium",
      error: "text-red-600 text-xs"
    }
  };

  const handleStylePresetChange = (preset) => {
    setCustomStyles(stylePresets[preset]);
  };

  const handleSubmit = (data) => {
    setFormData(data);
    setIsSubmitted(true);
    console.log("Form submitted:", data);
  };

  const handleQuestionChange = (questionId, value, allData) => {
    console.log("Question changed:", questionId, value, allData);
  };

  const resetDemo = () => {
    setIsSubmitted(false);
    setFormData({});
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Demo Completed!</h1>
          <p className="text-gray-600 mb-6">This demonstrates how the SurveyViewer component handles form submission.</p>
          
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Submitted Data:</h3>
            <pre className="p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          <button
            onClick={resetDemo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Try Another Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SurveyForge Integration Demo</h1>
              <p className="text-gray-600 mt-2">See how easy it is to integrate surveys into your application</p>
            </div>
            <div className="flex space-x-4">
              <a
                href="/survey-builder-dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Options</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="survey">Survey Mode</option>
                <option value="form">Form Mode</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {mode === "survey" 
                  ? "Shows descriptions and progress indicators" 
                  : "Clean, compact form layout"
                }
              </p>
            </div>

            {/* Style Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style Preset
              </label>
              <select
                onChange={(e) => handleStylePresetChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="modern">Modern</option>
                <option value="elegant">Elegant</option>
                <option value="minimal">Minimal</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Pre-configured style themes
              </p>
            </div>

            {/* Custom Styles */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Styles (JSON)
              </label>
              <textarea
                value={JSON.stringify(customStyles, null, 2)}
                onChange={(e) => {
                  try {
                    setCustomStyles(JSON.parse(e.target.value));
                  } catch (error) {
                    // Ignore invalid JSON
                  }
                }}
                placeholder='{"input": "border-red-300", "button": "bg-red-600"}'
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Override specific style properties
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Integration Code:</h3>
            <pre className="text-xs text-blue-700 bg-blue-100 p-3 rounded overflow-auto">
{`<SurveyViewer
  surveyData={surveyData}
  mode="${mode}"
  customStyles={${JSON.stringify(customStyles, null, 2)}}
  onSubmit={handleSubmit}
  onQuestionChange={handleQuestionChange}
/>`}
            </pre>
          </div>
        </div>

        {/* Survey Display */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Live Preview</h2>
            <p className="text-gray-600 mt-1">
              This is how your survey will appear when integrated into your application
            </p>
          </div>
          
          <div className="p-6">
            <SurveyViewer
              surveyData={mockJSONData}
              mode={mode}
              customStyles={customStyles}
              onSubmit={handleSubmit}
              onQuestionChange={handleQuestionChange}
              initialValues={{}}
            />
          </div>
        </div>

        {/* Integration Examples */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Examples</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Integration */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Basic Integration</h3>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
{`import SurveyViewer from './components/SurveyViewer';

<SurveyViewer
  surveyData={surveyData}
  onSubmit={handleSubmit}
/>`}
              </pre>
            </div>

            {/* URL Integration */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">URL-Based Integration</h3>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
{`// Navigate to:
/survey-viewer/survey_123?mode=form&styles={"input":"border-red-300"}

// Or use as component with URL params:
const [searchParams] = useSearchParams();
const mode = searchParams.get('mode') || 'survey';`}
              </pre>
            </div>

            {/* Iframe Integration */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Iframe Integration</h3>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
{`<iframe 
  src="/survey-viewer/survey_123?mode=form" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>`}
              </pre>
            </div>

            {/* Custom Styling */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Custom Styling</h3>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-auto">
{`const customStyles = {
  input: "border-2 border-blue-300 rounded-lg",
  button: "bg-blue-600 hover:bg-blue-700",
  label: "text-blue-800 font-semibold"
};`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoIntegration;
