import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";
import SurveyBuilderDashboard from "./pages/survey-builder-dashboard";
import VisualSurveyBuilder from "./pages/visual-survey-builder";

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
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
