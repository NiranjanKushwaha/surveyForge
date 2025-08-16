# Project Summary: SurveyForge

This project, "SurveyForge," is a React-based web application designed for comprehensive survey management. It leverages modern web technologies and a modular structure to provide a robust platform for creating, deploying, analyzing, and managing surveys.

## Key Technologies:
- **Frontend Framework:** React.js
- **Routing:** React Router DOM
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS, PostCSS, Autoprefixer
- **Charting:** Recharts, D3 (likely for data visualization)
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

3.  **Survey Runtime Renderer (`src/pages/survey-runtime-renderer`):**
    *   Responsible for rendering surveys for participants to take.
    *   Includes components for completion screens, navigation controls, progress indicators, and a question renderer to display various question types.

4.  **Survey Analytics Dashboard (`src/pages/survey-analytics-dashboard`):**
    *   Displays analytics and insights from collected survey responses.
    *   Components include charts (AnalyticsCharts), export modal, filter panel, KPI cards, and a response table.

5.  **Question Library Manager (`src/pages/question-library-manager`):**
    *   Manages a library of reusable survey questions.
    *   Features include folder management, import/export functionality, question cards, a question editor, and tag management.

6.  **User Authentication (`src/pages/user-authentication`):**
    *   Handles user login, registration, and authentication processes.
    *   Includes components for authentication form headers, password strength indicators, social authentication buttons, and two-factor authentication.

## Core Components and Utilities:

*   **`src/App.jsx`:** The main application component, which renders the `Routes` component.
*   **`src/Routes.jsx`:** Defines the application's routing structure using `react-router-dom`. It includes routes for all major dashboards and features, with dynamic routes for specific survey IDs in runtime and analytics. It also incorporates `ErrorBoundary` and `ScrollToTop` components for enhanced user experience and error handling.
*   **`src/components/`:** Contains reusable UI components such as `AppIcon`, `AppImage`, `ErrorBoundary`, `ScrollToTop`, and a `ui` subdirectory with common UI elements like `Breadcrumb`, `Button`, `Checkbox`, `Header`, `Input`, and `Select`.
*   **`src/styles/`:** Houses global CSS files, including `index.css` and `tailwind.css`.
*   **`src/utils/`:** Contains utility functions, such as `cn.js` (likely for conditional class name concatenation).

## Development and Build Process:

*   The project uses `Vite` for fast development and optimized builds.
*   `npm start` runs the development server.
*   `npm build` creates a production-ready build.
*   `npm serve` previews the production build locally.

This project provides a comprehensive solution for survey creation, deployment, and analysis, with a clear and modular architecture.
