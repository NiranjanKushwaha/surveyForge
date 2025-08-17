import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import SurveyBuilderDashboard from "./pages/survey-builder-dashboard/SurveyBuilderDashboard";
import VisualSurveyBuilder from "./pages/visual-survey-builder/VisualSurveyBuilder";
import SurveyViewerPage from "./pages/survey-viewer/SurveyViewerPage";
import DemoIntegration from "./pages/demo-integration/DemoIntegration";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<SurveyBuilderDashboard />} />
          <Route
            path="/survey-builder-dashboard"
            element={<SurveyBuilderDashboard />}
          />
          <Route
            path="/visual-survey-builder"
            element={<VisualSurveyBuilder />}
          />
          <Route
            path="/visual-survey-builder/:surveyId"
            element={<VisualSurveyBuilder />}
          />
          <Route
            path="/survey-viewer/:surveyId"
            element={<SurveyViewerPage />}
          />
          <Route path="/demo-integration" element={<DemoIntegration />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
