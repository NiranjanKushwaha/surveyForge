// Transform frontend survey data to backend API format
export const transformToBackendFormat = (frontendData) => {
  // Ensure all questions have unique orderIndex values
  const normalizedData = { ...frontendData };
  if (normalizedData.pages && Array.isArray(normalizedData.pages)) {
    normalizedData.pages = normalizedData.pages.map((page, pageIndex) => {
      const normalizedPage = { ...page, orderIndex: pageIndex };

      if (page.questions && Array.isArray(page.questions)) {
        normalizedPage.questions = page.questions.map(
          (question, questionIndex) => ({
            ...question,
            orderIndex: questionIndex,
          })
        );
      }

      return normalizedPage;
    });
  }

  const transformed = {
    title: String(normalizedData.title || ""),
    description: String(normalizedData.description || ""),
    settings: parseJsonField(normalizedData.settings) || {},
    theme: parseJsonField(normalizedData.theme) || {},
    isPublic: ensureBoolean(normalizedData.isPublic, false),
    allowAnonymous: ensureBoolean(normalizedData.allowAnonymous, true),
    expiresAt: ensureDate(normalizedData.expiresAt),
    pages:
      normalizedData.pages?.map((page) => ({
        name: String(page.name || ""),
        orderIndex: ensureNumber(page.orderIndex, 0),
        questions:
          page.questions?.map((question) => {
            // Ensure options are properly formatted before sending to backend
            const formattedOptions = ensureOptionsArray(question.options);
            
            return {
              name: String(question.name || ""),
              type: String(mapQuestionType(question.type) || "text"),
              title: String(question.title || ""),
              description: String(question.description || ""),
              placeholder: String(question.placeholder || ""),
              required: ensureBoolean(question.required, false),
              orderIndex: ensureNumber(question.orderIndex, 0),
              validation: parseJsonField(question.validation) || {},
              conditionalLogic: parseJsonField(question.conditionalLogic) || {},
              styling: parseJsonField(question.styling) || {},
              options: formattedOptions, // Send as array, backend should handle JSON stringification
            };
          }) || [],
      })) || [],
  };

  return transformed;
};

// Helper function to parse JSON fields that might be strings
const parseJsonField = (field) => {
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (error) {
      return {};
    }
  }
  return field || {};
};

// Helper function to ensure options are properly formatted
export const ensureOptionsArray = (field) => {
  // If it's already an array, ensure each item has proper structure
  if (Array.isArray(field)) {
    // Handle the case where backend returns [[],[]] (empty arrays)
    if (field.length > 0 && field.every(item => Array.isArray(item) && item.length === 0)) {
      // This is the malformed case from backend, return default options
      return [
        { id: "opt_0", label: "Option 1", value: "option1" },
        { id: "opt_1", label: "Option 2", value: "option2" },
        { id: "opt_2", label: "Option 3", value: "option3" },
      ];
    }
    
    // Normal array processing
    return field.map((option, index) => {
      if (typeof option === "string") {
        return { id: `opt_${index}`, label: option, value: option };
      }
      if (typeof option === "object" && option !== null) {
        return {
          id: option.id || `opt_${index}`,
          label: option.label || option.value || `Option ${index + 1}`,
          value: option.value || option.label || `option_${index + 1}`,
        };
      }
      return { id: `opt_${index}`, label: `Option ${index + 1}`, value: `option_${index + 1}` };
    });
  }
  
  // If it's a string, try to parse it
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      
      // Handle the case where backend returns "[[],[]]" (stringified empty arrays)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(item => Array.isArray(item) && item.length === 0)) {
        // This is the malformed case from backend, return default options
        return [
          { id: "opt_0", label: "Option 1", value: "option1" },
          { id: "opt_1", label: "Option 2", value: "option2" },
          { id: "opt_2", label: "Option 3", value: "option3" },
        ];
      }
      
      if (Array.isArray(parsed)) {
        return ensureOptionsArray(parsed);
      }
    } catch (error) {
      // If parsing fails, treat as comma-separated string
      const options = field.split(',').map((opt, index) => ({
        id: `opt_${index}`,
        label: opt.trim(),
        value: opt.trim().toLowerCase().replace(/\s+/g, '_')
      }));
      return options;
    }
  }
  
  // Return default options if nothing else works
  return [
    { id: "opt_0", label: "Option 1", value: "option1" },
    { id: "opt_1", label: "Option 2", value: "option2" },
    { id: "opt_2", label: "Option 3", value: "option3" },
  ];
};

// Helper function to ensure a field is always an array
const ensureArray = (field) => {
  if (Array.isArray(field)) {
    return field;
  }
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }
  return [];
};

// Helper function to ensure a field is always a number
const ensureNumber = (field, defaultValue = 0) => {
  if (typeof field === "number" && !isNaN(field)) {
    return field;
  }
  if (typeof field === "string") {
    const parsed = parseFloat(field);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
};

// Helper function to ensure a field is always a boolean
const ensureBoolean = (field, defaultValue = false) => {
  if (typeof field === "boolean") {
    return field;
  }
  if (typeof field === "string") {
    if (field.toLowerCase() === "true") return true;
    if (field.toLowerCase() === "false") return false;
  }
  if (typeof field === "number") {
    return field !== 0;
  }
  return defaultValue;
};

// Helper function to ensure a field is a valid date or null
const ensureDate = (field) => {
  if (!field) return null;
  if (field instanceof Date) return field.toISOString();
  if (typeof field === "string") {
    const date = new Date(field);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  if (typeof field === "number") {
    const date = new Date(field);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return null;
};

// Map frontend question types to backend supported types
const mapQuestionType = (frontendType) => {
  const typeMap = {
    "text-input": "text",
    email: "email",
    textarea: "textarea",
    radio: "radio",
    checkbox: "checkbox",
    rating: "rating",
    dropdown: "select",
    date: "date",
    number: "number",
    phone: "text", // Map phone to text type for backend
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
    status: backendData.status || "draft",
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    currentPageId: backendData.pages?.[0]?.id || null,
    pages:
      backendData.pages?.map((page, index) => ({
        id: page.id,
        name: page.name,
        orderIndex: page.orderIndex || index,
        questionCount: page.questions?.length || 0,
        questions:
          page.questions?.map((question) => {
            const transformedOptions = ensureOptionsArray(question.options);
            
            return {
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
              options: transformedOptions,
              // Frontend-specific properties
              icon: getQuestionIcon(mapBackendQuestionType(question.type)),
              logic: {
                enabled:
                  parseJsonField(question.conditionalLogic)?.enabled || false,
              },
            };
          }) || [],
      })) || [],
  };
};

// Map backend question types to frontend types
const mapBackendQuestionType = (backendType) => {
  const typeMap = {
    text: "text-input",
    email: "email",
    textarea: "textarea",
    radio: "radio",
    checkbox: "checkbox",
    rating: "rating",
    select: "dropdown",
    date: "date",
    number: "number",
    phone: "phone",
    "text-input": "text-input",
    dropdown: "dropdown",
    "multi-select": "checkbox",
  };
  return typeMap[backendType] || backendType;
};

// Get appropriate icon for question type
const getQuestionIcon = (type) => {
  const iconMap = {
    "text-input": "Type",
    email: "Mail",
    textarea: "FileText",
    radio: "Circle",
    checkbox: "CheckSquare",
    rating: "Star",
    dropdown: "ChevronDown",
    date: "Calendar",
    number: "Hash",
    phone: "Phone",
    "multi-select": "CheckSquare",
    select: "ChevronDown",
    text: "Type",
  };
  return iconMap[type] || "HelpCircle";
};

// Transform survey response data for submission
export const transformResponseData = (formData, surveyId, metadata = {}) => {
  const answers = Object.entries(formData).map(([questionId, answer]) => ({
    questionId,
    answer,
  }));

  return {
    sessionId: metadata.sessionId,
    timeSpent: metadata.timeSpent,
    deviceInfo: metadata.deviceInfo,
    answers,
  };
};

// Transform survey list data for dashboard
export const transformSurveyListData = (backendSurveys) => {
  return backendSurveys.map((survey) => ({
    id: survey.id,
    title: survey.title,
    description: survey.description,
    thumbnail: survey.thumbnail || "/assets/images/no_image.png",
    status: survey.status || "draft",
    responses: survey.responseCount || 0,
    completionRate: survey.completionRate || 0,
    createdAt: survey.createdAt,
    updatedAt: survey.updatedAt,
    type: survey.type || "general",
  }));
};

// Validate and clean data before sending to backend
export const validateBackendData = (data) => {
  const cleaned = { ...data };

  // Ensure all questions have unique orderIndex values
  if (cleaned.pages && Array.isArray(cleaned.pages)) {
    cleaned.pages = cleaned.pages.map((page, pageIndex) => {
      const cleanedPage = {
        ...page,
        name: String(page.name || ""),
        orderIndex: pageIndex,
      };

      if (page.questions && Array.isArray(page.questions)) {
        cleanedPage.questions = page.questions.map(
          (question, questionIndex) => {
            // Ensure options are properly formatted
            const formattedOptions = ensureOptionsArray(question.options);
            
            return {
              ...question,
              name: String(question.name || ""),
              type: String(question.type || "text"),
              title: String(question.title || ""),
              description: String(question.description || ""),
              placeholder: String(question.placeholder || ""),
              required: ensureBoolean(question.required, false),
              orderIndex: questionIndex,
              validation: parseJsonField(question.validation),
              conditionalLogic: parseJsonField(question.conditionalLogic),
              styling: parseJsonField(question.styling),
              options: formattedOptions,
            };
          }
        );
      } else {
        cleanedPage.questions = [];
      }

      return cleanedPage;
    });
  }

  // Ensure top-level fields have correct types
  cleaned.title = String(cleaned.title || "");
  cleaned.description = String(cleaned.description || "");
  cleaned.isPublic = ensureBoolean(cleaned.isPublic, false);
  cleaned.allowAnonymous = ensureBoolean(cleaned.allowAnonymous, true);
  cleaned.expiresAt = ensureDate(cleaned.expiresAt);

  // Ensure settings and theme are objects
  if (typeof cleaned.settings === "string") {
    try {
      cleaned.settings = JSON.parse(cleaned.settings);
    } catch (error) {
      console.warn(
        "Invalid settings JSON, using empty object:",
        cleaned.settings
      );
      cleaned.settings = {};
    }
  }

  if (typeof cleaned.theme === "string") {
    try {
      cleaned.theme = JSON.parse(cleaned.theme);
    } catch (error) {
      console.warn("Invalid theme JSON, using empty object:", cleaned.theme);
      cleaned.theme = {};
    }
  }

  return cleaned;
};
