// Transform frontend survey data to backend API format
export const transformToBackendFormat = (frontendData) => {
  console.log('🔄 Transforming frontend data to backend format:', frontendData);
  
  const transformed = {
    title: frontendData.title,
    description: frontendData.description,
    settings: parseJsonField(frontendData.settings) || {},
    theme: parseJsonField(frontendData.theme) || {},
    isPublic: frontendData.isPublic || false,
    allowAnonymous: frontendData.allowAnonymous || true,
    expiresAt: frontendData.expiresAt,
    pages: frontendData.pages?.map(page => ({
      name: page.name,
      orderIndex: page.orderIndex || 0,
      questions: page.questions?.map(question => ({
        name: question.name,
        type: mapQuestionType(question.type), // Map question types to backend supported types
        title: question.title,
        description: question.description,
        placeholder: question.placeholder,
        required: question.required || false,
        orderIndex: question.orderIndex || 0,
        validation: parseJsonField(question.validation) || {},
        conditionalLogic: parseJsonField(question.conditionalLogic) || {},
        styling: parseJsonField(question.styling) || {},
        options: question.options || []
      })) || []
    })) || []
  };
  
  console.log('✅ Transformed backend data:', transformed);
  return transformed;
};

// Helper function to parse JSON fields that might be strings
const parseJsonField = (field) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (error) {
      console.warn('Failed to parse JSON field:', field, error);
      return {};
    }
  }
  return field || {};
};

// Map frontend question types to backend supported types
const mapQuestionType = (frontendType) => {
  const typeMap = {
    'text-input': 'text',
    'email': 'email',
    'textarea': 'textarea',
    'radio': 'radio',
    'checkbox': 'checkbox',
    'rating': 'rating',
    'dropdown': 'select',
    'date': 'date',
    'number': 'number',
    'phone': 'text' // Map phone to text type for backend
  };
  return typeMap[frontendType] || frontendType;
};

// Transform backend API data to frontend format
export const transformToFrontendFormat = (backendData) => {
  return {
    id: backendData.id,
    title: backendData.title,
    description: backendData.description,
    settings: parseJsonField(backendData.settings) || {},
    theme: parseJsonField(backendData.theme) || {},
    isPublic: backendData.isPublic || false,
    allowAnonymous: backendData.allowAnonymous || true,
    expiresAt: backendData.expiresAt,
    status: backendData.status || 'draft',
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    currentPageId: backendData.pages?.[0]?.id || null,
    pages: backendData.pages?.map(page => ({
      id: page.id,
      name: page.name,
      orderIndex: page.orderIndex || 0,
      questionCount: page.questions?.length || 0,
      questions: page.questions?.map(question => ({
        id: question.id,
        name: question.name,
        type: mapBackendQuestionType(question.type), // Map backend types to frontend types
        title: question.title,
        description: question.description,
        placeholder: question.placeholder,
        required: question.required || false,
        orderIndex: question.orderIndex || 0,
        validation: parseJsonField(question.validation) || {},
        conditionalLogic: parseJsonField(question.conditionalLogic) || {},
        styling: parseJsonField(question.styling) || {},
        options: question.options || [],
        // Frontend-specific properties
        icon: getQuestionIcon(mapBackendQuestionType(question.type)),
        logic: {
          enabled: parseJsonField(question.conditionalLogic)?.enabled || false
        }
      })) || []
    })) || []
  };
};

// Map backend question types to frontend types
const mapBackendQuestionType = (backendType) => {
  const typeMap = {
    'text': 'text-input',
    'email': 'email',
    'textarea': 'textarea',
    'radio': 'radio',
    'checkbox': 'checkbox',
    'rating': 'rating',
    'select': 'dropdown',
    'date': 'date',
    'number': 'number'
  };
  return typeMap[backendType] || backendType;
};

// Get appropriate icon for question type
const getQuestionIcon = (type) => {
  const iconMap = {
    'text-input': 'Type',
    'email': 'Mail',
    'textarea': 'FileText',
    'radio': 'Circle',
    'checkbox': 'CheckSquare',
    'rating': 'Star',
    'dropdown': 'ChevronDown',
    'date': 'Calendar',
    'number': 'Hash',
    'phone': 'Phone'
  };
  return iconMap[type] || 'HelpCircle';
};

// Transform survey response data for submission
export const transformResponseData = (formData, surveyId, metadata = {}) => {
  const answers = Object.entries(formData).map(([questionId, answer]) => ({
    questionId,
    answer
  }));

  return {
    sessionId: metadata.sessionId,
    timeSpent: metadata.timeSpent,
    deviceInfo: metadata.deviceInfo,
    answers
  };
};

// Transform survey list data for dashboard
export const transformSurveyListData = (backendSurveys) => {
  return backendSurveys.map(survey => ({
    id: survey.id,
    title: survey.title,
    description: survey.description,
    thumbnail: survey.thumbnail || '/assets/images/no_image.png',
    status: survey.status || 'draft',
    responses: survey.responseCount || 0,
    completionRate: survey.completionRate || 0,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    type: survey.type || 'general'
  }));
};

// Validate and clean data before sending to backend
export const validateBackendData = (data) => {
  const cleaned = { ...data };
  
  // Ensure settings and theme are objects
  if (typeof cleaned.settings === 'string') {
    try {
      cleaned.settings = JSON.parse(cleaned.settings);
    } catch (error) {
      console.warn('Invalid settings JSON, using empty object:', cleaned.settings);
      cleaned.settings = {};
    }
  }
  
  if (typeof cleaned.theme === 'string') {
    try {
      cleaned.theme = JSON.parse(cleaned.theme);
    } catch (error) {
      console.warn('Invalid theme JSON, using empty object:', cleaned.theme);
      cleaned.theme = {};
    }
  }
  
  // Ensure all question fields are objects
  if (cleaned.pages) {
    cleaned.pages = cleaned.pages.map(page => ({
      ...page,
      questions: page.questions?.map(question => ({
        ...question,
        validation: parseJsonField(question.validation),
        conditionalLogic: parseJsonField(question.conditionalLogic),
        styling: parseJsonField(question.styling)
      })) || []
    })) || [];
  }
  
  return cleaned;
};
