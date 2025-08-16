export const mockJSONData = {
  id: "survey_001",
  title: "Customer Satisfaction Survey",
  description: "Help us improve our services by sharing your feedback",
  pages: [
    {
      id: "page_1",
      name: "General Information",
      questionCount: 3,
      questions: [
        {
          id: "q1",
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
          id: "q2",
          type: "email",
          icon: "Mail",
          title: "What is your email address?",
          placeholder: "Enter your email...",
          required: true,
        },
        {
          id: "q3",
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
      questionCount: 2,
      questions: [
        {
          id: "q4",
          type: "rating",
          icon: "Star",
          title: "How would you rate our service?",
          required: true,
          scale: 5,
        },
        {
          id: "q5",
          type: "textarea",
          icon: "TextArea",
          title: "What can we improve?",
          placeholder: "Share your suggestions...",
          required: false,
        },
      ],
    },
    {
      id: "page_3",
      name: "Final Thoughts",
      questionCount: 1,
      questions: [
        {
          id: "q6",
          type: "checkbox",
          icon: "CheckBox",
          title: "Would you recommend us to others?",
          required: true,
          options: [
            {
              id: "opt1",
              label: "Yes, definitely",
              value: "yes",
            },
            {
              id: "opt2",
              label: "Maybe",
              value: "maybe",
            },
            {
              id: "opt3",
              label: "No, not really",
              value: "no",
            },
          ],
        },
      ],
    },
  ],
  currentPageId: "page_1",
};
