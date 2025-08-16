export const mockJSONData = {
  id: "survey_001",
  title: "Customer Satisfaction Survey",
  description: "Help us improve our services by sharing your feedback",
  currentPageId: "page_1",
  pages: [
    {
      id: "page_1",
      name: "General Information",
      questionCount: 4,
      questions: [
        {
          id: "q1",
          name: "full_name",
          type: "text-input",
          icon: "Type",
          title: "What is your full name?",
          description: "Please enter your first and last name",
          placeholder: "Enter your full name...",
          required: true,
          validation: {
            minLength: 2,
            maxLength: 100,
          },
        },
        {
          id: "q_1755352913853",
          name: "department",
          type: "checkbox",
          icon: "CheckSquare",
          title: "SELECT DEPARTMENT",
          description: "DEPT please",
          required: true,
          placeholder: "enter department",
          options: [
            {
              id: "1755352958359",
              label: "BSC",
              value: "option_1"
            },
            {
              id: "1755352967197",
              label: "OPTION 3",
              value: "option_2"
            },
            {
              id: "1755352975460",
              label: "best",
              value: "option_3"
            },
            {
              id: "1755352981639",
              label: "Good",
              value: "option_4"
            }
          ],
          validation: {},
          conditionalLogic: {
            enabled: false,
            dependsOn: "",
            condition: "equals",
            value: ""
          },
          logic: {
            enabled: true
          }
        },
        {
          id: "q2",
          name: "email",
          type: "email",
          icon: "Mail",
          title: "What is your email address?",
          placeholder: "Enter your email...",
          required: true,
        },
        {
          id: "q3",
          name: "hear_about_us",
          type: "radio",
          icon: "Circle",
          title: "How did you hear about us?",
          required: true,
          options: [
            {
              id: "opt1",
              label: "Social Media",
              value: "social_media",
            },
            {
              id: "opt2",
              label: "Search Engine",
              value: "search_engine",
            },
            {
              id: "opt3",
              label: "Word of Mouth",
              value: "word_of_mouth",
            },
            {
              id: "opt4",
              label: "Advertisement",
              value: "advertisement",
            },
            {
              id: "opt5",
              label: "Other",
              value: "other",
            },
          ],
        },
      ],
    },
    {
      id: "page_2",
      name: "Feedback",
      questionCount: 3,
      questions: [
        {
          id: "q4",
          name: "service_rating",
          type: "rating",
          icon: "Star",
          title: "How would you rate our service?",
          required: true,
          scale: 5,
        },
        {
          id: "q5",
          name: "improvements",
          type: "textarea",
          icon: "TextArea",
          title: "What can we improve?",
          placeholder: "Share your suggestions...",
          required: false,
        },
        {
          id: "q6",
          name: "recommendation",
          type: "checkbox",
          icon: "CheckBox",
          title: "Would you recommend us to others?",
          required: true,
          options: [
            {
              id: "opt1",
              label: "Yes, definitely",
              value: "yes_definitely",
            },
            {
              id: "opt2",
              label: "Yes, probably",
              value: "yes_probably",
            },
            {
              id: "opt3",
              label: "Not sure",
              value: "not_sure",
            },
            {
              id: "opt4",
              label: "No, probably not",
              value: "no_probably_not",
            },
            {
              id: "opt5",
              label: "No, definitely not",
              value: "no_definitely_not",
            },
          ],
        },
      ],
    },
    {
      id: "page_3",
      name: "Follow-up Questions",
      questionCount: 2,
      questions: [
        {
          id: "q7",
          name: "contact_followup",
          type: "radio",
          icon: "Circle",
          title: "Would you like us to contact you for follow-up?",
          required: false,
          options: [
            {
              id: "opt1",
              label: "Yes, please contact me",
              value: "yes_contact",
            },
            {
              id: "opt2",
              label: "No, thank you",
              value: "no_thanks",
            },
          ],
        },
        {
          id: "q8",
          name: "contact_method",
          type: "text-input",
          icon: "Type",
          title: "What is your preferred contact method?",
          description: "Please specify how you'd like to be contacted",
          placeholder: "Phone, email, or other...",
          required: false,
          conditionalLogic: {
            enabled: true,
            dependsOn: "q7",
            condition: "equals",
            value: "yes_contact",
          },
        },
      ],
    },
  ],
};

// Example of how to use the SurveyViewer component
export const integrationExamples = {
  // Basic integration
  basic: `
import SurveyViewer from './components/SurveyViewer';

function App() {
  const surveyData = {
    id: "my_survey",
    title: "My Survey",
    description: "A simple survey",
    pages: [
      {
        id: "page1",
        name: "Page 1",
        questions: [
          {
            id: "q1",
            type: "text-input",
            title: "What's your name?",
            required: true
          }
        ]
      }
    ]
  };

  const handleSubmit = (data) => {
    console.log('Survey submitted:', data);
  };

  return (
    <SurveyViewer
      surveyData={surveyData}
      onSubmit={handleSubmit}
    />
  );
}
  `,

  // Form mode integration
  formMode: `
import SurveyViewer from './components/SurveyViewer';

function App() {
  const surveyData = { /* your survey data */ };

  return (
    <SurveyViewer
      surveyData={surveyData}
      mode="form"
      onSubmit={handleSubmit}
    />
  );
}
  `,

  // Custom styles integration
  customStyles: `
import SurveyViewer from './components/SurveyViewer';

function App() {
  const customStyles = {
    input: "border-2 border-blue-300 rounded-lg px-4 py-3",
    label: "text-lg font-semibold text-blue-800 mb-3",
    button: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg",
    error: "text-red-700 font-medium"
  };

  return (
    <SurveyViewer
      surveyData={surveyData}
      customStyles={customStyles}
      onSubmit={handleSubmit}
    />
  );
}
  `,

  // URL-based integration
  urlIntegration: `
// Embed in iframe or navigate to:
// /survey-viewer/survey_123?mode=form&styles={"input":"border-red-300","button":"bg-red-600"}

// Or use as a component with URL parameters:
function App() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'survey';
  const customStyles = JSON.parse(searchParams.get('styles') || '{}');

  return (
    <SurveyViewer
      surveyData={surveyData}
      mode={mode}
      customStyles={customStyles}
      onSubmit={handleSubmit}
    />
  );
}
  `,

  // Conditional questions example
  conditionalExample: `
const surveyWithConditionals = {
  id: "conditional_survey",
  title: "Conditional Survey",
  pages: [
    {
      id: "page1",
      name: "Page 1",
      questions: [
        {
          id: "q1",
          type: "radio",
          title: "Do you have children?",
          required: true,
          options: [
            { id: "opt1", label: "Yes", value: "yes" },
            { id: "opt2", label: "No", value: "no" }
          ]
        },
        {
          id: "q2",
          type: "text-input",
          title: "How many children do you have?",
          required: true,
          conditionalLogic: {
            enabled: true,
            dependsOn: "q1",
            condition: "equals",
            value: "yes"
          }
        }
      ]
    }
  ]
};
  `
};
