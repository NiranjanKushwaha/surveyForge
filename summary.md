# SurveyForge - Comprehensive Project Documentation

## Overview
SurveyForge is a modern, full-stack survey management platform built with React.js frontend and NestJS backend. It provides a comprehensive solution for creating, managing, deploying, and analyzing surveys with advanced features like drag-and-drop visual builder, real-time preview, conditional logic, and extensive question types.

## Technology Stack

### Frontend Technologies
- **Framework:** React.js 18.2.0 with modern hooks and functional components
- **Routing:** React Router DOM 6.0.2 for client-side navigation
- **State Management:** React Context API and useState/useEffect hooks
- **Styling:** Tailwind CSS 3.4.6 with custom design system
- **UI Components:** 
  - Radix UI primitives (@radix-ui/react-slot)
  - Lucide React icons for consistent iconography
  - Class Variance Authority for component variants
- **Form Handling:** React Hook Form 7.55.0 with validation
- **HTTP Client:** Axios 1.8.4 for API communication
- **Build Tool:** Vite 5.0.0 for fast development and optimized builds
- **Utilities:** 
  - clsx and tailwind-merge for conditional styling
  - date-fns for date manipulation
  - framer-motion for animations

### Backend Technologies
- **Framework:** NestJS with TypeScript
- **Database:** Microsoft SQL Server (MSSQL) with TypeORM
- **Authentication:** JWT-based authentication system
- **Validation:** class-validator and class-transformer
- **Documentation:** Swagger/OpenAPI for API documentation
- **Logging:** Winston for structured logging
- **Scheduling:** @nestjs/schedule for background tasks
- **Events:** @nestjs/event-emitter for event-driven architecture

## Project Structure

```
surveyforge/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Base UI components (Button, Input, etc.)
│   │   ├── AppIcon.jsx      # Icon wrapper component
│   │   ├── AppImage.jsx     # Image component with fallback
│   │   ├── ErrorBoundary.jsx # Error handling component
│   │   ├── ScrollToTop.jsx  # Scroll management
│   │   └── SurveyViewer.jsx # Survey rendering component
│   ├── pages/               # Main application pages
│   │   ├── survey-builder-dashboard/    # Survey management dashboard
│   │   ├── visual-survey-builder/       # Visual survey builder
│   │   ├── survey-viewer/              # Survey response collection
│   │   └── demo-integration/           # Integration examples
│   ├── services/            # API service layer
│   ├── utils/               # Utility functions
│   └── styles/              # Global styles and Tailwind config
├── BackEndSetup.md          # Backend setup documentation
└── summary.md              # This documentation
```

## Core Features & Components

### 1. Survey Builder Dashboard (`/survey-builder-dashboard`)

**Purpose:** Central hub for managing all surveys with comprehensive overview and bulk operations.

**Key Components:**
- **SurveyBuilderDashboard.jsx** - Main dashboard container
- **StatsOverview.jsx** - Analytics cards showing survey metrics
- **SearchAndSort.jsx** - Advanced filtering and sorting controls
- **BulkActions.jsx** - Bulk operations for multiple surveys
- **SurveyCard.jsx** - Grid view survey cards
- **SurveyListItem.jsx** - List view survey items

**Features:**
- **Survey Management:** Create, edit, duplicate, archive, and delete surveys
- **Advanced Filtering:** Filter by status, type, date range, and search terms
- **Bulk Operations:** Select multiple surveys for bulk actions
- **View Modes:** Toggle between grid and list views
- **Real-time Stats:** Display total surveys, active surveys, responses, and completion rates
- **Quick Actions:** Direct access to edit, preview, and share surveys

### 2. Visual Survey Builder (`/visual-survey-builder`)

**Purpose:** Drag-and-drop visual interface for creating and editing surveys with real-time preview.

**Main Components:**

#### A. Component Library (`ComponentLibrary.jsx`)
**Purpose:** Provides drag-and-drop question components organized by categories.

**Question Categories & Types:**

**1. Text Inputs Category:**
- **Text Input** (`text-input`) - Single line text field with validation
- **Text Area** (`textarea`) - Multi-line text input for longer responses
- **Email** (`email`) - Email validation field with format checking
- **Number** (`number`) - Numeric input with min/max validation
- **Phone** (`phone`) - Phone number field with formatting

**2. Multiple Choice Category:**
- **Radio Buttons** (`radio`) - Single selection from multiple options
- **Checkboxes** (`checkbox`) - Multiple selection from options
- **Dropdown** (`dropdown`) - Single selection from dropdown list
- **Multi-Select** (`multi-select`) - Multiple selection from dropdown

**3. Rating & Scale Category:**
- **Star Rating** (`star-rating`) - 5-star rating system
- **Likert Scale** (`likert`) - Agreement scale (1-5)
- **NPS Score** (`nps`) - Net Promoter Score (0-10)
- **Slider** (`slider`) - Range slider input (0-100)

**4. Matrix Questions Category:**
- **Matrix (Single)** (`matrix-single`) - Single choice matrix with rows/columns
- **Matrix (Multiple)** (`matrix-multiple`) - Multiple choice matrix
- **Ranking** (`ranking`) - Drag-to-rank items in order

**5. Advanced Widgets Category:**
- **Date Picker** (`date-picker`) - Date selection component
- **Time Picker** (`time-picker`) - Time selection component
- **File Upload** (`file-upload`) - File attachment with drag-drop
- **Signature** (`signature`) - Digital signature pad
- **Location** (`location`) - GPS coordinates picker

**Upcoming Components:**
- **Typeahead** - Autocomplete text input with suggestions
- **Autocomplete** - Enhanced dropdown with search functionality

#### B. Survey Canvas (`SurveyCanvas.jsx`)
**Purpose:** Main workspace where questions are dropped, arranged, and previewed.

**Key Features:**
- **Drag & Drop Interface:** Intuitive question placement and reordering
- **Real-time Preview:** Three preview modes (Default, Form, JSON Editor)
- **Question Management:** Select, duplicate, delete, and reorder questions
- **Auto-scroll:** Automatic scrolling during drag operations
- **Visual Feedback:** Drop indicators and hover states
- **JSON Editor:** Direct JSON editing with validation
- **Debug Tools:** Built-in debugging for data structure issues

**Preview Modes:**
1. **Default View:** Survey builder view with question cards
2. **Form View:** Interactive form preview for testing
3. **JSON Editor:** Direct JSON editing with syntax highlighting

**Question Rendering:**
Each question type has specialized rendering logic:
- **Text Inputs:** Proper input types (text, email, number, tel)
- **Choice Questions:** Radio buttons, checkboxes, dropdowns with options
- **Rating Questions:** Interactive star ratings, Likert scales, NPS scores
- **Matrix Questions:** Table-based layout with rows and columns
- **Advanced Widgets:** Specialized components (date picker, file upload, etc.)

#### C. Properties Panel (`PropertiesPanel.jsx`)
**Purpose:** Context-sensitive panel for editing question properties and settings.

**Property Tabs:**

**1. General Tab:**
- Question title and description
- Placeholder text
- Required field toggle
- Show question number option
- Allow comments toggle
- Options management for choice questions

**2. Validation Tab:**
- Required field validation
- Text length limits (min/max)
- Pattern validation (regex)
- Numeric range validation
- Custom error messages
- Email format validation

**3. Logic Tab:**
- Conditional logic enable/disable
- Dependency selection (previous questions)
- Condition types (equals, not equals, contains, etc.)
- Value comparison
- Visual condition builder

**4. Styling Tab:**
- Question width (full, half, third, quarter)
- Text alignment (left, center, right)
- Border and highlight options
- Compact layout toggle
- Custom styling options

#### D. Floating Toolbar (`FloatingToolbar.jsx`)
**Purpose:** Fixed toolbar providing quick access to essential actions.

**Toolbar Actions:**

**Primary Actions:**
- **Undo/Redo** - History management with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- **Save Status** - Real-time save status indicator (Auto-saving, Saved, Error)
- **Preview Toggle** - Switch between builder and preview modes
- **Publish/Update** - Save survey to backend server (only API call)

**More Actions Menu:**
- **Save to Local Storage** - Local backup with Ctrl+S shortcut
- **Copy Survey JSON** - Copy survey data to clipboard
- **Import Survey** - Import survey from JSON text
- **View Survey JSON** - Modal with formatted JSON display
- **Help & Shortcuts** - Keyboard shortcuts reference

**Status Indicators:**
- **Auto-save Status:** Visual indicators for save states
- **Unsaved Changes:** Warning indicators for pending changes
- **Toast Messages:** User feedback for actions

#### E. Page Navigation (`PageNavigation.jsx`)
**Purpose:** Multi-page survey management with visual navigation.

**Features:**
- **Page Tabs:** Visual page navigation with question counts
- **Page Management:** Add, delete, rename, and reorder pages
- **Progress Indicator:** Visual progress bar showing completion
- **Page Actions:** Quick access to page operations
- **Navigation Controls:** Previous/next page buttons

### 3. Survey Viewer (`/survey-viewer`)

**Purpose:** Component for rendering surveys to end users for response collection.

**Key Features:**
- **Multi-page Support:** Navigate between survey pages
- **Question Types:** Render all supported question types
- **Validation:** Real-time form validation
- **Conditional Logic:** Show/hide questions based on answers
- **Progress Tracking:** Visual progress indicators
- **Response Collection:** Comprehensive data collection
- **Mobile Responsive:** Optimized for all device sizes

**Modes:**
- **Survey Mode:** Multi-page navigation with progress
- **Form Mode:** Single-page layout for embedding

### 4. Demo Integration (`/demo-integration`)

**Purpose:** Showcase and testing environment for the SurveyViewer component.

**Features:**
- **Component Showcase:** Demonstrates all question types
- **Submit Button Variants:** Shows different button styles
- **Custom Styling:** Examples of custom CSS integration
- **Response Handling:** Demonstrates form submission
- **Integration Examples:** Code examples for developers

## Survey Creation & Editing Workflow

### 1. Creating a New Survey
1. **Navigate to Dashboard:** Access survey builder dashboard
2. **Click "Create New Survey":** Opens visual survey builder
3. **Set Basic Info:** Enter title and description
4. **Add Questions:** Drag components from library to canvas
5. **Configure Properties:** Use properties panel to customize questions
6. **Preview & Test:** Use preview modes to test survey
7. **Save & Publish:** Save locally or publish to server

### 2. Drag & Drop Question Management
- **Adding Questions:** Drag from component library to canvas
- **Reordering:** Drag questions within canvas to reorder
- **Duplicating:** Use duplicate button on question cards
- **Deleting:** Use delete button or keyboard shortcuts
- **Auto-scroll:** Automatic scrolling during drag operations

### 3. Question Configuration
- **General Settings:** Title, description, placeholder, required status
- **Options Management:** Add, edit, reorder choice options
- **Validation Rules:** Set min/max values, patterns, custom messages
- **Conditional Logic:** Show/hide questions based on previous answers
- **Styling Options:** Width, alignment, borders, spacing

### 4. Multi-page Survey Management
- **Adding Pages:** Use page navigation to add new pages
- **Page Organization:** Drag to reorder pages
- **Page Properties:** Rename pages and set descriptions
- **Navigation Logic:** Configure page flow and conditions

## Backend Integration

### API Architecture
The frontend integrates with a NestJS backend providing:

**Survey Management APIs:**
- `GET /api/v1/surveys` - List all surveys
- `POST /api/v1/surveys` - Create new survey
- `GET /api/v1/surveys/:id` - Get specific survey
- `PUT /api/v1/surveys/:id` - Update survey
- `DELETE /api/v1/surveys/:id` - Delete survey
- `POST /api/v1/surveys/:id/duplicate` - Duplicate survey
- `POST /api/v1/surveys/:id/publish` - Publish survey

**Public Survey APIs:**
- `GET /api/v1/public/surveys/:id` - Get public survey
- `POST /api/v1/public/surveys/:id/response` - Submit response

### Data Transformation
**Frontend to Backend:**
- `transformToBackendFormat()` - Converts frontend data structure to API format
- `validateBackendData()` - Validates data before sending to API
- Automatic field normalization and type conversion

**Backend to Frontend:**
- `transformToFrontendFormat()` - Converts API response to frontend format
- `transformSurveyListData()` - Transforms survey list data
- Automatic icon assignment and data structure normalization

### Authentication & Security
- **JWT Authentication:** Secure API access with token-based auth
- **Role-based Access:** User permissions for survey management
- **Input Validation:** Comprehensive validation using class-validator
- **Error Handling:** Structured error responses and logging

## Advanced Features

### 1. Conditional Logic
- **Dependency Selection:** Choose which question to depend on
- **Condition Types:** Equals, not equals, contains, greater than, less than
- **Value Comparison:** Compare against specific values or other answers
- **Visual Builder:** Intuitive interface for setting up conditions

### 2. Real-time Preview
- **Form Mode:** Interactive preview for testing survey flow
- **Default Mode:** Builder view with question cards
- **JSON Editor:** Direct JSON editing with syntax highlighting
- **Live Updates:** Changes reflect immediately in preview

### 3. Data Management
- **Auto-save:** Automatic local storage backup
- **History Management:** Undo/redo functionality
- **Import/Export:** JSON-based survey sharing
- **Version Control:** Survey versioning and rollback

### 4. Responsive Design
- **Mobile-First:** Optimized for mobile devices
- **Flexible Layouts:** Adaptive question layouts
- **Touch Support:** Touch-friendly drag and drop
- **Cross-browser:** Compatible with all modern browsers

## Development & Deployment

### Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Preview production build
npm run serve
```

### Environment Configuration
- **Frontend:** Vite configuration with environment variables
- **Backend:** NestJS configuration with database and service settings
- **Database:** MSSQL setup with proper indexing and relationships

### Performance Optimization
- **Code Splitting:** Automatic route-based code splitting
- **Lazy Loading:** Components loaded on demand
- **Caching:** API response caching and local storage
- **Bundle Optimization:** Tree shaking and minification

## Future Enhancements

### Planned Features
1. **Advanced Question Types:**
   - Typeahead with autocomplete
   - Enhanced autocomplete dropdowns
   - Rich text editor
   - File upload with preview

2. **Analytics & Reporting:**
   - Real-time response analytics
   - Custom report generation
   - Data visualization charts
   - Export capabilities

3. **Collaboration Features:**
   - Multi-user editing
   - Comment and review system
   - Version control and branching
   - Team permissions

4. **Integration Capabilities:**
   - Webhook support
   - Third-party integrations
   - API rate limiting
   - Advanced authentication

This comprehensive documentation covers all aspects of the SurveyForge platform, from the visual survey builder to backend integration, providing a complete understanding of the system's capabilities and architecture.
