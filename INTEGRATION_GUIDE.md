# SurveyForge Integration Guide

## Overview

SurveyForge is a React-based survey management application that can be easily integrated into other applications. It provides two main integration points:

1. **Survey Builder** - For creating and editing surveys
2. **Survey Viewer** - For displaying surveys to end users

## Quick Start

### 1. Basic Survey Viewer Integration

```jsx
import SurveyViewer from 'surveyforge/components/SurveyViewer';

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
    // Send data to your backend
  };

  return (
    <SurveyViewer
      surveyData={surveyData}
      onSubmit={handleSubmit}
    />
  );
}
```

### 2. URL-Based Integration

You can also integrate surveys by navigating to specific URLs:

```
/survey-viewer/survey_123?mode=form&styles={"input":"border-red-300"}
```

## Integration Modes

### Survey Mode (Default)

- Shows survey title and description
- Displays question descriptions
- More engaging user experience
- Progress indicators and page navigation

### Form Mode

- Clean, form-like appearance
- Hides question descriptions
- More compact layout
- Better for embedded forms

```jsx
<SurveyViewer
  surveyData={surveyData}
  mode="form"  // or "survey"
  onSubmit={handleSubmit}
/>
```

## Custom Styling

### Basic Customization

```jsx
const customStyles = {
  input: "border-2 border-blue-300 rounded-lg px-4 py-3",
  label: "text-lg font-semibold text-blue-800 mb-3",
  button: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg",
  error: "text-red-700 font-medium"
};

<SurveyViewer
  surveyData={surveyData}
  customStyles={customStyles}
  onSubmit={handleSubmit}
/>
```

### URL-Based Styling

```
/survey-viewer/survey_123?styles={"input":"border-red-300","button":"bg-red-600"}
```

## Conditional Questions

SurveyForge supports conditional logic for showing/hiding questions based on previous answers:

```jsx
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
```

### Supported Conditions

- `equals` - Show when value equals
- `not_equals` - Show when value doesn't equal
- `contains` - Show when value contains
- `not_contains` - Show when value doesn't contain
- `greater_than` - Show when value is greater than
- `less_than` - Show when value is less than

## Event Handling

### Form Submission

```jsx
const handleSubmit = (formData) => {
  console.log('All form data:', formData);
  // formData structure: { q1: "John Doe", q2: "john@example.com" }
  
  // Send to your backend
  fetch('/api/survey-responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
};
```

### Question Changes

```jsx
const handleQuestionChange = (questionId, value, allData) => {
  console.log('Question changed:', questionId, value);
  console.log('All current data:', allData);
  
  // Save partial responses or track user behavior
};
```

## Iframe Integration

### Basic Iframe

```html
<iframe 
  src="/survey-viewer/survey_123?mode=form" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
```

### Responsive Iframe

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe 
    src="/survey-viewer/survey_123?mode=form" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
    frameborder="0">
  </iframe>
</div>
```

## Cross-Origin Communication

If integrating across different domains, use postMessage for communication:

```jsx
// In your parent application
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://your-surveyforge-domain.com') return;
  
  switch (event.data.type) {
    case 'SURVEY_SUBMITTED':
      console.log('Survey completed:', event.data.data);
      break;
    case 'SURVEY_QUESTION_CHANGED':
      console.log('Question changed:', event.data.questionId, event.data.value);
      break;
  }
});

// In SurveyForge (automatically handled)
// The component will send messages to the parent window
```

## Survey Data Structure

### Basic Structure

```jsx
const surveyData = {
  id: "unique_survey_id",
  title: "Survey Title",
  description: "Survey description (optional)",
  currentPageId: "page_1",
  pages: [
    {
      id: "page_1",
      name: "Page Name",
      questionCount: 2,
      questions: [
        // Question objects
      ]
    }
  ]
};
```

### Question Types

#### Text Input
```jsx
{
  id: "q1",
  type: "text-input",
  title: "Question title",
  description: "Question description (optional)",
  placeholder: "Placeholder text (optional)",
  required: true,
  validation: {
    minLength: 2,
    maxLength: 100
  }
}
```

#### Email
```jsx
{
  id: "q2",
  type: "email",
  title: "Email address",
  required: true
}
```

#### Radio Buttons
```jsx
{
  id: "q3",
  type: "radio",
  title: "Select one option",
  required: true,
  options: [
    { id: "opt1", label: "Option 1", value: "option_1" },
    { id: "opt2", label: "Option 2", value: "option_2" }
  ]
}
```

#### Checkboxes
```jsx
{
  id: "q4",
  type: "checkbox",
  title: "Select all that apply",
  required: false,
  options: [
    { id: "opt1", label: "Option 1", value: "option_1" },
    { id: "opt2", label: "Option 2", value: "option_2" }
  ]
}
```

#### Rating
```jsx
{
  id: "q5",
  type: "rating",
  title: "Rate your experience",
  required: true,
  scale: 5  // 1-5 rating scale
}
```

#### Textarea
```jsx
{
  id: "q6",
  type: "textarea",
  title: "Additional comments",
  placeholder: "Enter your comments...",
  required: false
}
```

#### Dropdown
```jsx
{
  id: "q7",
  type: "dropdown",
  title: "Select from dropdown",
  required: true,
  options: [
    { id: "opt1", label: "Option 1", value: "option_1" },
    { id: "opt2", label: "Option 2", value: "option_2" }
  ]
}
```

## Advanced Features

### Validation

```jsx
{
  id: "q1",
  type: "text-input",
  title: "Age",
  required: true,
  validation: {
    minLength: 1,
    maxLength: 3,
    pattern: "^[0-9]+$"  // Numbers only
  }
}
```

### Custom Styling Per Question

```jsx
{
  id: "q1",
  type: "text-input",
  title: "Special question",
  customStyles: {
    input: "border-4 border-purple-500 bg-purple-50",
    label: "text-purple-800 font-bold"
  }
}
```

## Error Handling

### Survey Loading Errors

```jsx
const [surveyData, setSurveyData] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
  const loadSurvey = async () => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`);
      if (!response.ok) throw new Error('Survey not found');
      
      const data = await response.json();
      setSurveyData(data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  loadSurvey();
}, [surveyId]);

if (error) {
  return <div>Error: {error}</div>;
}
```

### Form Validation Errors

The component automatically handles validation errors and displays them below each question. Custom error styling can be applied through the `customStyles.error` property.

## Performance Considerations

### Large Surveys

For surveys with many questions or pages:

1. **Lazy Loading**: Load questions as needed
2. **Pagination**: Use the built-in page system
3. **Virtual Scrolling**: For very long surveys

### Memory Management

```jsx
// Clean up event listeners
useEffect(() => {
  const handleMessage = (event) => { /* ... */ };
  window.addEventListener('message', handleMessage);
  
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

## Security Considerations

### Data Validation

Always validate survey data on your backend:

```jsx
// Frontend validation (basic)
const validateSurveyData = (data) => {
  if (!data.id || !data.title || !data.pages) {
    throw new Error('Invalid survey structure');
  }
  return true;
};

// Backend validation (essential)
app.post('/api/surveys', (req, res) => {
  const { surveyData } = req.body;
  
  // Validate structure
  if (!isValidSurveyStructure(surveyData)) {
    return res.status(400).json({ error: 'Invalid survey structure' });
  }
  
  // Sanitize content
  const sanitizedData = sanitizeSurveyData(surveyData);
  
  // Save to database
  saveSurvey(sanitizedData);
});
```

### XSS Prevention

The component automatically escapes user input, but ensure your backend also sanitizes data.

## Troubleshooting

### Common Issues

1. **Survey not loading**: Check survey ID and data structure
2. **Styling not applied**: Verify customStyles object structure
3. **Conditional logic not working**: Check dependsOn field names and values
4. **Form submission issues**: Verify onSubmit handler is properly defined

### Debug Mode

Enable debug logging:

```jsx
<SurveyViewer
  surveyData={surveyData}
  onSubmit={handleSubmit}
  debug={true}  // Enable console logging
/>
```

## Support

For integration support:

1. Check the console for error messages
2. Verify survey data structure matches examples
3. Test with simple surveys first
4. Review the component props and event handlers

## Examples Repository

See `src/util/mockData.js` for complete examples of:
- Basic survey structures
- Conditional questions
- Custom styling
- Integration patterns
