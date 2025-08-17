# API Endpoints for SurveyForge Backend

This document outlines the API endpoints for managing surveys and their responses, including request and response structures.

---

## Surveys Module

### `SurveysController`

Base Path: `/surveys`

#### 1. Create a new survey

- **Endpoint:** `POST /surveys`
- **Summary:** Create a new survey
- **Request Body (CreateSurveyDto):**
  ```typescript
  export class CreateSurveyDto {
    userId?: string; // Optional: User ID
    title: string; // Survey title
    description?: string; // Optional: Survey description
    settings?: any; // Optional: Survey settings (object)
    theme?: any; // Optional: Survey theme (object)
    pages?: CreatePageDto[]; // Optional: Survey pages (array of CreatePageDto)
    expiresAt?: string; // Optional: Survey expiration date (ISO 8601 string)
    isPublic?: boolean; // Optional: Is survey public
    allowAnonymous?: boolean; // Optional: Allow anonymous responses
  }

  export class CreatePageDto {
    name: string; // Page name
    orderIndex?: number; // Optional: Page order index
    questions?: CreateQuestionDto[]; // Optional: Page questions (array of CreateQuestionDto)
  }

  export class CreateQuestionDto {
    name: string; // Question name/identifier
    type: string; // Question type
    title: string; // Question title
    description?: string; // Optional: Question description
    placeholder?: string; // Optional: Placeholder text
    required?: boolean; // Optional: Is question required
    orderIndex?: number; // Optional: Question order index
    validation?: any; // Optional: Validation rules (object)
    conditionalLogic?: any; // Optional: Conditional logic (object)
    styling?: any; // Optional: Styling options (object)
    options?: any[]; // Optional: Question options (array)
  }
  ```
- **Example Request Body:**
  ```json
  {
    "title": "Customer Feedback Survey",
    "description": "A survey to gather feedback from our customers.",
    "isPublic": true,
    "allowAnonymous": true,
    "pages": [
      {
        "name": "Page 1",
        "orderIndex": 0,
        "questions": [
          {
            "name": "satisfaction",
            "type": "rating",
            "title": "How satisfied are you with our service?",
            "required": true,
            "options": [1, 2, 3, 4, 5]
          },
          {
            "name": "comments",
            "type": "textarea",
            "title": "Any additional comments?",
            "required": false
          }
        ]
      }
    ]
  }
  ```
- **Responses:**
  - `201 Created`: Survey created successfully
    ```json
    {
      "id": "uuid-of-new-survey",
      "userId": "optional-user-id",
      "title": "Customer Feedback Survey",
      "description": "A survey to gather feedback from our customers.",
      "settings": {},
      "theme": {},
      "pages": [
        {
          "id": "uuid-of-page",
          "name": "Page 1",
          "orderIndex": 0,
          "questions": [
            {
              "id": "uuid-of-question-1",
              "name": "satisfaction",
              "type": "rating",
              "title": "How satisfied are you with our service?",
              "required": true,
              "options": [1, 2, 3, 4, 5]
            },
            {
              "id": "uuid-of-question-2",
              "name": "comments",
              "type": "textarea",
              "title": "Any additional comments?",
              "required": false
            }
          ]
        }
      ],
      "expiresAt": null,
      "isPublic": true,
      "allowAnonymous": true,
      "createdAt": "2025-08-17T15:00:00.000Z",
      "updatedAt": "2025-08-17T15:00:00.000Z"
    }
    ```
  - `400 Bad Request`: Bad request

#### 2. Get all surveys

- **Endpoint:** `GET /surveys`
- **Summary:** Get all surveys
- **Query Parameters:** `filters` (any object for filtering)
- **Responses:**
  - `200 OK`: Surveys retrieved successfully

#### 3. Get a specific survey by ID

- **Endpoint:** `GET /surveys/:id`
- **Summary:** Get a specific survey by ID
- **Path Parameters:** `id` (string)
- **Responses:**
  - `200 OK`: Surveys retrieved successfully
    ```json
    [
      {
        "id": "uuid-of-survey-1",
        "title": "Customer Feedback Survey",
        "status": "published",
        "createdAt": "2025-08-17T15:00:00.000Z"
      },
      {
        "id": "uuid-of-survey-2",
        "title": "Employee Satisfaction",
        "status": "draft",
        "createdAt": "2025-08-16T10:00:00.000Z"
      }
    ]
    ```
  - `404 Not Found`: Survey not found

#### 4. Update a survey

- **Endpoint:** `PUT /surveys/:id`
- **Summary:** Update a survey
- **Path Parameters:** `id` (string)
- **Request Body (UpdateSurveyDto):**
  ```typescript
  import { PartialType } from '@nestjs/swagger';
  import { CreateSurveyDto } from './create-survey.dto';
  import { IsOptional, IsString } from 'class-validator';
  import { ApiPropertyOptional } from '@nestjs/swagger';

  export class UpdateSurveyDto extends PartialType(CreateSurveyDto) {
    @ApiPropertyOptional({ description: 'Survey status', enum: ['draft', 'published', 'archived'] })
    @IsOptional()
    @IsString()
    status?: string; // Optional: Survey status ('draft', 'published', 'archived')
  }
  ```
- **Example Request Body:**
  ```json
  {
    "title": "Updated Customer Feedback Survey",
    "status": "published"
  }
  ```
- **Responses:**
  - `200 OK`: Survey updated successfully
    ```json
    {
      "id": "uuid-of-survey",
      "title": "Updated Customer Feedback Survey",
      "description": "A survey to gather feedback from our customers.",
      "status": "published",
      "updatedAt": "2025-08-17T16:00:00.000Z"
    }
    ```
  - `404 Not Found`: Survey not found

#### 5. Delete a survey

- **Endpoint:** `DELETE /surveys/:id`
- **Summary:** Delete a survey
- **Path Parameters:** `id` (string)
- **Responses:**
  - `200 OK`: Survey deleted successfully
    ```json
    {
      "message": "Survey deleted successfully"
    }
    ```
  - `404 Not Found`: Survey not found

#### 6. Duplicate a survey

- **Endpoint:** `POST /surveys/:id/duplicate`
- **Summary:** Duplicate a survey
- **Path Parameters:** `id` (string)
- **Responses:**
  - `201 Created`: Survey duplicated successfully
    ```json
    {
      "id": "uuid-of-duplicated-survey",
      "title": "Customer Feedback Survey (Copy)",
      "status": "draft",
      "createdAt": "2025-08-17T15:00:00.000Z"
    }
    ```

#### 7. Publish a survey

- **Endpoint:** `POST /surveys/:id/publish`
- **Summary:** Publish a survey
- **Path Parameters:** `id` (string)
- **Responses:**
  - `200 OK`: Survey published successfully
    ```json
    {
      "id": "uuid-of-survey",
      "title": "Customer Feedback Survey",
      "status": "published",
      "updatedAt": "2025-08-17T17:00:00.000Z"
    }
    ```

#### 8. Unpublish a survey

- **Endpoint:** `POST /surveys/:id/unpublish`
- **Summary:** Unpublish a survey
- **Path Parameters:** `id` (string)
- **Responses:**
  - `200 OK`: Survey unpublished successfully
    ```json
    {
      "id": "uuid-of-survey",
      "title": "Customer Feedback Survey",
      "status": "draft",
      "updatedAt": "2025-08-17T18:00:00.000Z"
    }
    ```

---

### `PublicSurveysController`

Base Path: `/public/surveys`

#### 1. Get a public survey for response

- **Endpoint:** `GET /public/surveys/:id`
- **Summary:** Get a public survey for response
- **Path Parameters:** `id` (string)
- **Responses:**
  - `200 OK`: Survey retrieved successfully
    ```json
    {
      "id": "uuid-of-public-survey",
      "title": "Public Customer Feedback Survey",
      "description": "Please provide your valuable feedback.",
      "pages": [
        {
          "id": "uuid-of-page",
          "name": "Page 1",
          "questions": [
            {
              "id": "uuid-of-question-1",
              "name": "satisfaction",
              "type": "rating",
              "title": "How satisfied are you?",
              "options": [1, 2, 3, 4, 5]
            }
          ]
        }
      ]
    }
    ```

#### 2. Submit a survey response

- **Endpoint:** `POST /public/surveys/:id/response`
- **Summary:** Submit a survey response
- **Path Parameters:** `id` (string)
- **Request Body (SubmitResponseDto):**
  ```typescript
  export class SubmitResponseDto {
    sessionId?: string; // Optional: Session ID for anonymous responses
    timeSpent?: number; // Optional: Time spent on survey in seconds
    deviceInfo?: any; // Optional: Device information (object)
    answers: ResponseAnswerDto[]; // Survey answers (array of ResponseAnswerDto)
  }

  export class ResponseAnswerDto {
    questionId: string; // Question ID
    answer: any; // Answer value (can be string, number, or object)
  }
  ```
- **Example Request Body:**
  ```json
  {
    "sessionId": "optional-session-id",
    "timeSpent": 120,
    "deviceInfo": {
      "os": "iOS",
      "browser": "Safari"
    },
    "answers": [
      {
        "questionId": "uuid-of-question-1",
        "answer": 4
      },
      {
        "questionId": "uuid-of-question-2",
        "answer": "This is a great service!"
      }
    ]
  }
  ```
- **Responses:**
  - `201 Created`: Response submitted successfully
    ```json
    {
      "id": "uuid-of-response",
      "surveyId": "uuid-of-survey",
      "sessionId": "optional-session-id",
      "timeSpent": 120,
      "deviceInfo": {
        "os": "iOS",
        "browser": "Safari"
      },
      "answers": [
        {
          "questionId": "uuid-of-question-1",
          "answer": 4
        },
        {
          "questionId": "uuid-of-question-2",
          "answer": "This is a great service!"
        }
      ],
      "submittedAt": "2025-08-17T19:00:00.000Z"
    }
    ```
