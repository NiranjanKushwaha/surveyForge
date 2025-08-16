import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import SurveyBuilderDashboard from "./pages/survey-builder-dashboard";
import VisualSurveyBuilder from "./pages/visual-survey-builder";
import SurveyRuntimeRenderer from "./pages/survey-runtime-renderer";
import SurveyAnalyticsDashboard from "./pages/survey-analytics-dashboard";
import QuestionLibraryManager from "./pages/question-library-manager";

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
            path="/survey-runtime-renderer"
            element={<SurveyRuntimeRenderer />}
          />
          <Route
            path="/survey-runtime-renderer/:surveyId"
            element={<SurveyRuntimeRenderer />}
          />
          <Route
            path="/survey-analytics-dashboard"
            element={<SurveyAnalyticsDashboard />}
          />
          <Route
            path="/survey-analytics-dashboard/:surveyId"
            element={<SurveyAnalyticsDashboard />}
          />
          <Route
            path="/question-library-manager"
            element={<QuestionLibraryManager />}
          />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
