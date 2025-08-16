# Project Summary: SurveyForge

This project, "SurveyForge," is a React-based web application designed for comprehensive survey management. It leverages modern web technologies and a modular structure to provide a robust platform for creating, deploying, analyzing, and managing surveys.

## Key Technologies:
- **Frontend Framework:** React.js
- **Routing:** React Router DOM
- **State Management:** React Context API
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Charting:** Recharts
- **Form Handling:** React Hook Form
- **UI Components:** Radix UI (via `@radix-ui/react-slot`), Lucide React (icons)
- **Utility Libraries:** Axios (HTTP client), Class Variance Authority, clsx, tailwind-merge (for CSS class management), date-fns (date utilities), framer-motion (animations)
- **Build Tool:** Vite

## Application Structure and Features:

The application is organized into several key modules, primarily under the `src/pages` directory, each handling a specific aspect of the survey management lifecycle:

1.  **Survey Builder Dashboard (`src/pages/survey-builder-dashboard`):**
    *   Provides an overview of existing surveys.
    *   Includes components for bulk actions, filtering, search, sort, and displaying survey cards/list items.

2.  **Visual Survey Builder (`src/pages/visual-survey-builder`):**
    *   A visual interface for designing surveys.
    *   Features include a component library, floating toolbar, page navigation, properties panel, and a survey canvas for drag-and-drop survey creation.

### Recent Enhancements (August 2025)

*   **Layout and Responsiveness:**
    *   The `PageNavigation` component is now always visible at the bottom of the screen, with a reduced height for a more compact appearance.
    *   The `FloatingToolbar` is distinctly separated from the `PageNavigation` and remains fixed at the bottom-right.
    *   `ComponentLibrary`, `SurveyCanvas`, and `PropertiesPanel` now correctly implement vertical scrolling (`overflow-y-auto`) when their content exceeds their height, ensuring all content is accessible.
*   **Survey Canvas Improvements:**
    *   Question cards within the `SurveyCanvas` have been restyled to be smaller and more visually appealing, improving the overall layout and density.
    *   The survey preview modal now opens in a full-screen overlay, providing a more immersive preview experience.
*   **Floating Toolbar Functionality:**
    *   A new "View Survey JSON" option has been added to the "More Actions" menu, allowing users to view the raw JSON representation of the survey data in a modal and copy it to the clipboard.
    *   The "Export Survey" functionality has been updated to copy the survey's JSON data directly to the clipboard, accompanied by a toast message for user confirmation.
    *   The "Import Survey" functionality has been enhanced to present a modal where users can paste survey JSON. The system then validates and loads this JSON, updating the builder's state.
    *   The "Share Survey" and "Survey Settings" options have been removed from the "More Actions" menu as per user request.
*   **Bug Fixes:**
    *   Resolved a `ReferenceError` related to the `handleImportSurvey` function, ensuring smooth operation of the import feature.

3.  **Survey Runtime Renderer (`src/pages/survey-runtime-renderer`):**
    *   Responsible for rendering surveys for participants to take.
    *   Includes components for completion screens, navigation controls, progress indicators, and a question renderer to display various question types.

4.  **Survey Analytics Dashboard (`src/pages/survey-analytics-dashboard`):**
    *   Displays analytics and insights from collected survey responses.
    *   Components include charts (AnalyticsCharts), export modal, filter panel, KPI cards, and a response table.

5.  **Question Library Manager (`src/pages/question-library-manager`):**
    *   Manages a library of reusable survey questions.
    *   Features include folder management, import/export functionality, question cards, a question editor, and tag management.

## Core Components and Utilities:

*   **`src/App.jsx`:** The main application component, which renders the `Routes` component.
*   **`src/Routes.jsx`:** Defines the application's routing structure using `react-router-dom`. It includes routes for all major dashboards and features, with dynamic routes for specific survey IDs in runtime and analytics. It also incorporates `ErrorBoundary` and `ScrollToTop` components for enhanced user experience and error handling.
*   **`src/components/`:** Contains reusable UI components suchs as `AppIcon`, `AppImage`, `ErrorBoundary`, `ScrollToTop`, and a `ui` subdirectory with common UI elements like `Breadcrumb`, `Button`, `Checkbox`, `Header`, `Input`, and `Select`.
*   **`src/styles/`:** Houses global CSS files, including `index.css` and `tailwind.css`.
*   **`src/utils/`:** Contains utility functions, such as `cn.js` (likely for conditional class name concatenation).

## Development and Build Process:

*   The project uses `Vite` for fast development and optimized builds.
*   `npm start` runs the development server.
*   `npm build` creates a production-ready build.
*   `npm serve` previews the production build locally.

This project provides a comprehensive solution for survey creation, deployment, and analysis, with a clear and modular architecture.
