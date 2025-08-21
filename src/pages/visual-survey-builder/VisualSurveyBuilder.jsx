import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Button from "../../components/ui/Button";
import ComponentLibrary from "./components/ComponentLibrary";
import SurveyCanvas from "./components/SurveyCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import FloatingToolbar from "./components/FloatingToolbar";
import PageNavigation from "./components/PageNavigation";
// import { mockJSONData } from "../../util/mockData";
import { surveyAPI } from "../../services/api";
import {
  transformToBackendFormat,
  transformToFrontendFormat,
  validateBackendData,
} from "../../utils/dataTransformers";
import { SAVE_STATUS } from "./constants";

const VisualSurveyBuilder = () => {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [surveyData, setSurveyData] = useState({
    id: surveyId || null,
    title: "Customer Satisfaction Survey",
    description: "Help us improve our services by sharing your feedback",
    currentPageId: "page_1",
    pages: [],
  });

  // Loading state for editing existing surveys
  const [isLoading, setIsLoading] = useState(!!surveyId);

  // Selection and history states
  const [selectedQuestionId, setSelectedQuestionId] = useState("q1");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  // Centralized save status values
  const [saveStatus, setSaveStatus] = useState(SAVE_STATUS.SAVED); // Start with saved since no auto-save

  // Derived values
  const currentPage = surveyData?.pages?.find(
    (page) => page?.id === surveyData?.currentPageId
  );
  const currentQuestions = currentPage?.questions || [];
  const selectedQuestion = currentQuestions?.find(
    (q) => q?.id === selectedQuestionId
  );

  // Effects: Load existing survey if editing
  useEffect(() => {
    const loadSurvey = async () => {
      if (surveyId) {
        try {
          setIsLoading(true);
          const data = await surveyAPI.getSurvey(surveyId);
          const transformedData = transformToFrontendFormat(data);
          setSurveyData(transformedData);

          // Also set the history for undo/redo
          setHistory([transformedData]);
          setHistoryIndex(0);
        } catch (error) {
          console.error("❌ Error loading survey:", error);
          // Fallback to new survey
          alert(`Failed to load survey: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      } else {
        // For new surveys, try to load auto-saved data
        const autoSavedData = localStorage.getItem("surveyforge_autosave");
        if (autoSavedData) {
          try {
            const parsedData = JSON.parse(autoSavedData);
            setSurveyData(parsedData);
            setHistory([parsedData]);
            setHistoryIndex(0);
            setSaveStatus(SAVE_STATUS.SAVED);
          } catch (error) {
            console.error("❌ Error parsing auto-saved data:", error);
            // Clear invalid auto-saved data
            localStorage.removeItem("surveyforge_autosave");
          }
        }
      }
    };

    loadSurvey();

    // Cleanup function to clear auto-saved data when component unmounts
    return () => {
      if (saveStatus === "saved") {
        localStorage.removeItem("surveyforge_autosave");
      }
    };
  }, [surveyId]);

  // Effects: Auto-save functionality (local only - no API calls)
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (saveStatus === SAVE_STATUS.UNSAVED) {
        localStorage.setItem(
          "surveyforge_autosave",
          JSON.stringify(surveyData)
        );
        setSaveStatus(SAVE_STATUS.SAVED);
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [surveyData, saveStatus]);

  // Effects: Initialize with empty survey if no data
  useEffect(() => {
    if (!surveyData || !surveyData?.pages || surveyData?.pages?.length === 0) {
      // Clear any existing auto-saved data when starting fresh
      localStorage.removeItem("surveyforge_autosave");

      const emptySurvey = {
        id: null,
        title: "Untitled Survey",
        description: "",
        currentPageId: "page_1",
        pages: [
          {
            id: "page_1",
            name: "Page 1",
            questionCount: 0,
            questions: [],
          },
        ],
      };
      setSurveyData(emptySurvey);
      setHistory([emptySurvey]);
      setHistoryIndex(0);
    }
  }, []);

  // Effects: Keyboard shortcuts (placed after handlers it uses)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e?.ctrlKey || e?.metaKey) {
        switch (e?.key) {
          case "z":
            e?.preventDefault();
            handleUndo();
            break;
          case "y":
            e?.preventDefault();
            handleRedo();
            break;
          case "p":
            e?.preventDefault();
            setIsPreviewMode(!isPreviewMode);
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewMode]);

  // Memoized helpers
  const addToHistory = useCallback(
    (newData) => {
      setHistory((prev) => {
        const newHistory = prev?.slice(0, historyIndex + 1);
        newHistory?.push(JSON.parse(JSON.stringify(newData)));
        return newHistory?.slice(-50); // Keep last 50 states
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
      // Set status to indicate changes are pending
      setSaveStatus(SAVE_STATUS.UNSAVED);
    },
    [historyIndex]
  );

  // Component library handlers
  const handleLibraryToggle = () => {
    setIsLibraryCollapsed(!isLibraryCollapsed);
  };

  const handleDragStart = (component) => {
    // Handle drag start if needed
  };

  // Handle survey data updates from JSON editor
  const handleSurveyDataUpdate = (newSurveyData) => {
    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
    setSelectedQuestionId(null); // Clear selection when data structure changes
  };

  // Canvas handlers
  const handleQuestionSelect = (questionId) => {
    setSelectedQuestionId(questionId);
  };

  const handleQuestionUpdate = (questionId, updates) => {
    const newSurveyData = { ...surveyData };
    const pageIndex = newSurveyData?.pages?.findIndex(
      (page) => page?.id === surveyData?.currentPageId
    );
    const questionIndex = newSurveyData?.pages?.[
      pageIndex
    ]?.questions?.findIndex((q) => q?.id === questionId);

    if (questionIndex !== -1) {
      newSurveyData.pages[pageIndex].questions[questionIndex] = {
        ...newSurveyData?.pages?.[pageIndex]?.questions?.[questionIndex],
        ...updates,
      };

      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
    }
  };

  const handleQuestionDelete = (questionId) => {
    const newSurveyData = { ...surveyData };
    const pageIndex = newSurveyData?.pages?.findIndex(
      (page) => page?.id === surveyData?.currentPageId
    );

    newSurveyData.pages[pageIndex].questions = newSurveyData?.pages?.[
      pageIndex
    ]?.questions?.filter((q) => q?.id !== questionId);

    // ✅ Update orderIndex values after deletion
    newSurveyData.pages[pageIndex].questions.forEach((question, index) => {
      question.orderIndex = index;
    });

    newSurveyData.pages[pageIndex].questionCount =
      newSurveyData?.pages?.[pageIndex]?.questions?.length;

    // Clear selection if deleted question was selected
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }

    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
  };

  const handleQuestionDuplicate = (questionId) => {
    const newSurveyData = { ...surveyData };
    const pageIndex = newSurveyData?.pages?.findIndex(
      (page) => page?.id === surveyData?.currentPageId
    );
    const questionIndex = newSurveyData?.pages?.[
      pageIndex
    ]?.questions?.findIndex((q) => q?.id === questionId);

    if (questionIndex !== -1) {
      const originalQuestion =
        newSurveyData?.pages?.[pageIndex]?.questions?.[questionIndex];
      const duplicatedQuestion = {
        ...originalQuestion,
        id: `q_${Date.now()}`,
        title: `${originalQuestion?.title} (Copy)`,
        orderIndex: questionIndex + 1, // ✅ Set orderIndex to the position after the original question
      };

      newSurveyData?.pages?.[pageIndex]?.questions?.splice(
        questionIndex + 1,
        0,
        duplicatedQuestion
      );

      // ✅ Update orderIndex values for all questions after duplication
      newSurveyData.pages[pageIndex].questions.forEach((question, index) => {
        question.orderIndex = index;
      });

      newSurveyData.pages[pageIndex].questionCount =
        newSurveyData?.pages?.[pageIndex]?.questions?.length;

      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
      setSelectedQuestionId(duplicatedQuestion?.id);
    }
  };

  const handleQuestionReorder = (fromIndex, toIndex) => {
    const newSurveyData = { ...surveyData };
    const pageIndex = newSurveyData?.pages?.findIndex(
      (page) => page?.id === surveyData?.currentPageId
    );

    if (pageIndex !== -1) {
      const questions = [...newSurveyData?.pages?.[pageIndex]?.questions];

      const [movedQuestion] = questions?.splice(fromIndex, 1);
      questions?.splice(toIndex, 0, movedQuestion);

      // ✅ Update orderIndex values after reordering
      questions.forEach((question, index) => {
        question.orderIndex = index;
      });

      newSurveyData.pages[pageIndex].questions = questions;
      newSurveyData.pages[pageIndex].questionCount = questions.length;

      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
    }
  };

  const handleDrop = (component, insertIndex) => {
    // Generate unique name for the new question
    const questionName = `q_${Date.now()}`;

    // Get the current questions to determine the next orderIndex
    const currentPage = surveyData?.pages?.find(
      (page) => page.id === surveyData?.currentPageId
    );
    const currentQuestions = currentPage?.questions || [];

    const newQuestion = {
      id: questionName,
      name: questionName,
      type: component?.id,
      icon: component?.icon,
      title: `New ${component?.name}`,
      description: "",
      required: false,
      placeholder: "",
      orderIndex: insertIndex, // ✅ Set orderIndex to the insert position
      options:
        component?.id === "radio" ||
        component?.id === "checkbox" ||
        component?.id === "dropdown" ||
        component?.id === "multi-select"
          ? [
              {
                id: `opt_${Date.now()}_1`,
                label: "Option 1",
                value: "option_1",
              },
              {
                id: `opt_${Date.now()}_2`,
                label: "Option 2",
                value: "option_2",
              },
            ]
          : [],
      validation: component?.defaultValidation || {},
      conditionalLogic: {
        enabled: false,
        dependsOn: "",
        condition: "equals",
        value: "",
      },
    };

    const newSurveyData = { ...surveyData };
    const pageIndex = newSurveyData?.pages?.findIndex(
      (page) => page?.id === surveyData?.currentPageId
    );

    if (pageIndex !== -1) {
      // Insert the new question at the specified position
      newSurveyData.pages[pageIndex].questions?.splice(
        insertIndex,
        0,
        newQuestion
      );

      // ✅ Update orderIndex values for all questions after insertion
      newSurveyData.pages[pageIndex].questions.forEach((question, index) => {
        question.orderIndex = index;
      });

      newSurveyData.pages[pageIndex].questionCount =
        newSurveyData?.pages?.[pageIndex]?.questions?.length;

      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
      setSelectedQuestionId(newQuestion?.id);

      // Return the new question ID for auto-scrolling
      return newQuestion.id;
    }

    return null;
  };

  // Page navigation handlers
  const handlePageChange = (pageId) => {
    const newSurveyData = { ...surveyData };
    newSurveyData.currentPageId = pageId;
    setSurveyData(newSurveyData);
    setSelectedQuestionId(null);
  };

  const handleAddPage = () => {
    const newPage = {
      id: `page_${Date.now()}`,
      name: `Page ${(surveyData?.pages?.length || 0) + 1}`,
      orderIndex: surveyData?.pages?.length || 0, // ✅ Add orderIndex for pages
      questionCount: 0,
      questions: [],
    };

    const newSurveyData = { ...surveyData };
    newSurveyData.pages?.push(newPage);
    newSurveyData.currentPageId = newPage?.id;

    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
    setSelectedQuestionId(null);
  };

  const handleDeletePage = (pageId) => {
    if (surveyData?.pages?.length <= 1) return;

    const newSurveyData = { ...surveyData };
    newSurveyData.pages = newSurveyData?.pages?.filter(
      (page) => page?.id !== pageId
    );

    // ✅ Update orderIndex values for all pages after deletion
    newSurveyData.pages.forEach((page, index) => {
      page.orderIndex = index;
    });

    if (surveyData?.currentPageId === pageId) {
      newSurveyData.currentPageId = newSurveyData?.pages?.[0]?.id;
    }

    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
    setSelectedQuestionId(null);
  };

  const handlePageReorder = (fromIndex, toIndex) => {
    const newSurveyData = { ...surveyData };
    const pages = [...newSurveyData?.pages];

    const [movedPage] = pages?.splice(fromIndex, 1);
    pages?.splice(toIndex, 0, movedPage);

    // ✅ Update orderIndex values for all pages after reordering
    pages.forEach((page, index) => {
      page.orderIndex = index;
    });

    newSurveyData.pages = pages;
    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
  };

  // Properties panel handlers
  const handlePropertiesToggle = () => {
    setIsPropertiesCollapsed(!isPropertiesCollapsed);
  };

  // Floating toolbar handlers - Legacy save function (kept for compatibility)
  const handleSave = async () => {
    setSaveStatus(SAVE_STATUS.SAVING);
    try {
      localStorage.setItem("surveyforge_autosave", JSON.stringify(surveyData));
      setSaveStatus(SAVE_STATUS.SAVED);
    } catch (error) {
      setSaveStatus(SAVE_STATUS.ERROR);
      console.error("Error saving to localStorage:", error);
    }
  };

  // Main function for publishing/updating survey to server - ONLY function that calls API
  const handlePublishUpdate = async () => {
    setSaveStatus(SAVE_STATUS.SAVING);
    try {
      // First validate and clean the data
      const validatedData = validateBackendData(surveyData);

      // Then transform to backend format
      const backendData = transformToBackendFormat(validatedData);

      if (surveyId) {
        // Update existing survey
        await surveyAPI.updateSurvey(surveyId, backendData);
      } else {
        // Create new survey
        const newSurvey = await surveyAPI.createSurvey(backendData);
        setSurveyData((prev) => ({ ...prev, id: newSurvey.id }));
        // Update URL to include survey ID
        navigate(`/visual-survey-builder/${newSurvey.id}`, { replace: true });
      }

      // Clear auto-saved data after successful API call
      localStorage.removeItem("surveyforge_autosave");
      setSaveStatus(SAVE_STATUS.SAVED);
      alert(
        surveyId
          ? "Survey updated successfully!"
          : "Survey created successfully!"
      );
    } catch (error) {
      setSaveStatus(SAVE_STATUS.ERROR);
      console.error("Error publishing/updating survey:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSurveyData(history[historyIndex - 1]);
      setSaveStatus(SAVE_STATUS.UNSAVED);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history?.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSurveyData(history[historyIndex + 1]);
      setSaveStatus(SAVE_STATUS.UNSAVED);
    }
  };

  const handlePreview = () => {
    setIsPreviewMode((prev) => !prev);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(surveyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${surveyData?.title || "survey"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e?.target?.result);
          setSurveyData(importedData);
          setHistory([importedData]);
          setHistoryIndex(0);
          setSaveStatus(SAVE_STATUS.UNSAVED);
        } catch (error) {
          console.error("Error parsing imported file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // UI Data
  const breadcrumbItems = [
    { label: "Dashboard", path: "/survey-builder-dashboard" },
    { label: "Visual Builder", path: "/visual-survey-builder" },
    { label: surveyId ? surveyData?.title || "Loading..." : "New Survey" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header className="fixed top-0 w-full z-10" />

      {/* Breadcrumb - Fixed below header */}
      <div className="fixed top-[64px] w-full z-10 px-6 pt-2 bg-card border-b border-border">
        <div className="flex items-center justify-between">
          <Breadcrumb items={breadcrumbItems} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("=== DEBUG INFO ===");
              console.log("Survey ID from URL:", surveyId);
              console.log("Survey Data:", surveyData);
              console.log("Current Page ID:", surveyData?.currentPageId);
              console.log("All Pages:", surveyData?.pages);
              const currentPage = surveyData?.pages?.find(
                (page) => page.id === surveyData?.currentPageId
              );
              console.log("Current Page:", currentPage);
              console.log("Current Questions:", currentPage?.questions);
              console.log("Loading State:", isLoading);
              alert("Check console for debug info");
            }}
          >
            Debug
          </Button>
        </div>
      </div>

      {/* Main Builder Interface - This section will scroll vertically */}
      <div
        className="absolute inset-0 overflow-y-auto"
        style={{ paddingTop: "116px", paddingBottom: "100px" }}
      >
        <div className="flex h-full">
          {/* Component Library */}
          <ComponentLibrary
            isCollapsed={isLibraryCollapsed}
            onToggleCollapse={handleLibraryToggle}
            onDragStart={handleDragStart}
            className="transition-all duration-300 ease-in-out"
          />

          {/* Survey Canvas */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-secondary">Loading survey...</p>
              </div>
            </div>
          ) : (
            <SurveyCanvas
              surveyData={surveyData}
              onQuestionSelect={handleQuestionSelect}
              selectedQuestionId={selectedQuestionId}
              onQuestionUpdate={handleQuestionUpdate}
              onQuestionDelete={handleQuestionDelete}
              onQuestionDuplicate={handleQuestionDuplicate}
              onQuestionReorder={handleQuestionReorder}
              onDrop={handleDrop}
              isPreviewMode={isPreviewMode}
              onTogglePreview={handlePreview}
              onSurveyDataUpdate={handleSurveyDataUpdate}
            />
          )}

          {/* Properties Panel */}
          <PropertiesPanel
            selectedQuestion={selectedQuestion}
            onQuestionUpdate={handleQuestionUpdate}
            isCollapsed={isPropertiesCollapsed}
            onToggleCollapse={handlePropertiesToggle}
            surveyData={surveyData}
            className="transition-all duration-300 ease-in-out"
          />
        </div>
      </div>

      {/* Page Navigation - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <PageNavigation
          pages={surveyData?.pages}
          currentPageId={surveyData?.currentPageId}
          onPageSelect={handlePageChange}
          onPageAdd={handleAddPage}
          onPageDelete={handleDeletePage}
          onPageReorder={handlePageReorder}
        />
      </div>

      {/* Floating Toolbar - Fixed at bottom */}
      <div className="fixed bottom-[60px] right-0 z-30">
        <FloatingToolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onSave={handleSave}
          onPreview={handlePreview}
          onPublishUpdate={handlePublishUpdate}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history?.length - 1}
          saveStatus={saveStatus}
          isPreviewMode={isPreviewMode}
          onTogglePreview={handlePreview}
          surveyData={surveyData}
          onExportSurvey={handleExport}
          onImportJson={handleImport}
        />
      </div>
    </div>
  );
};

export default VisualSurveyBuilder;
