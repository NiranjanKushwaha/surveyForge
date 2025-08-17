import { surveyAPI } from '../services/api';

// Test API connection and endpoints
export const testAPIConnection = async () => {
  console.log('🔍 Testing API Connection...');
  
  try {
    // Test 1: Check if server is reachable
    console.log('📡 Testing server connectivity...');
    const response = await fetch('http://localhost:3000/api/v1/surveys');
    console.log('✅ Server is reachable');
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    // Test 2: Try to get surveys
    console.log('📋 Testing GET /surveys...');
    const surveys = await surveyAPI.getSurveys();
    console.log('✅ GET /surveys successful');
    console.log('Surveys:', surveys);
    
    return { success: true, surveys };
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      }
    });
    
    return { success: false, error };
  }
};

// Test survey creation
export const testSurveyCreation = async (testData) => {
  console.log('🧪 Testing survey creation...');
  
  try {
    const survey = await surveyAPI.createSurvey(testData);
    console.log('✅ Survey creation successful');
    console.log('Created survey:', survey);
    return { success: true, survey };
  } catch (error) {
    console.error('❌ Survey creation failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return { success: false, error };
  }
};
