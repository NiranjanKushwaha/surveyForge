import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import ComponentLibrary from "./components/ComponentLibrary";
import SurveyCanvas from "./components/SurveyCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import FloatingToolbar from "./components/FloatingToolbar";
import PageNavigation from "./components/PageNavigation";
import { mockJSONData } from "../../util/mockData";

const VisualSurveyBuilder = () => {
  const navigate = useNavigate();

  // Panel states
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Survey data state
  const [surveyData, setSurveyData] = useState(mockJSONData);

  // Selection and history states
  const [selectedQuestionId, setSelectedQuestionId] = useState("q1");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveStatus, setSaveStatus] = useState("saved");

  // Get current page data
  const currentPage = surveyData?.pages?.find(
    (page) => page?.id === surveyData?.currentPageId
  );
  const currentQuestions = currentPage?.questions || [];
  const selectedQuestion = currentQuestions?.find(
    (q) => q?.id === selectedQuestionId
  );

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (saveStatus === "unsaved") {
        handleSave();
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [surveyData, saveStatus]);

  // Keyboard shortcuts
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
          case "s":
            e?.preventDefault();
            handleSave();
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

  // History management
  const addToHistory = useCallback(
    (newData) => {
      setHistory((prev) => {
        const newHistory = prev?.slice(0, historyIndex + 1);
        newHistory?.push(JSON.parse(JSON.stringify(newData)));
        return newHistory?.slice(-50); // Keep last 50 states
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
      setSaveStatus("unsaved");
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
      };

      newSurveyData?.pages?.[pageIndex]?.questions?.splice(
        questionIndex + 1,
        0,
        duplicatedQuestion
      );
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
    const questions = [...newSurveyData?.pages?.[pageIndex]?.questions];

    const [movedQuestion] = questions?.splice(fromIndex, 1);
    questions?.splice(toIndex, 0, movedQuestion);

    newSurveyData.pages[pageIndex].questions = questions;

    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
  };

  const handleDrop = (component, insertIndex) => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      type: component?.id,
      icon: component?.icon,
      title: `New ${component?.name}`,
      description: "",
      required: false,
      placeholder: "",
      options: component?.defaultOptions || [],
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
      newSurveyData.pages[pageIndex].questions?.splice(
        insertIndex,
        0,
        newQuestion
      );
      newSurveyData.pages[pageIndex].questionCount =
        newSurveyData?.pages?.[pageIndex]?.questions?.length;

      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
      setSelectedQuestionId(newQuestion?.id);
    }
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

    newSurveyData.pages = pages;
    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
  };

  // Properties panel handlers
  const handlePropertiesToggle = () => {
    setIsPropertiesCollapsed(!isPropertiesCollapsed);
  };

  // Floating toolbar handlers
  const handleSave = () => {
    // Save survey data
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
    }, 1000);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSurveyData(history[historyIndex - 1]);
      setSaveStatus("unsaved");
    }
  };

  const handleRedo = () => {
    if (historyIndex < history?.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSurveyData(history[historyIndex + 1]);
      setSaveStatus("unsaved");
    }
  };

  const handlePreview = () => {
    setIsPreviewMode(prev => !prev);
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
          setSaveStatus("unsaved");
        } catch (error) {
          console.error("Error parsing imported file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Initialize with empty survey if no data
  useEffect(() => {
    if (!surveyData || !surveyData?.pages || surveyData?.pages?.length === 0) {
      const emptySurvey = {
        id: `survey_${Date.now()}`,
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

  const breadcrumbItems = [
    { label: "Dashboard", path: "/survey-builder-dashboard" },
    { label: "Visual Builder", path: "/visual-survey-builder" },
    { label: surveyData?.title },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header className="fixed top-0 w-full z-10" />

      {/* Breadcrumb - Fixed below header */}
      <div className="fixed top-[64px] w-full z-10 px-6 pt-2 bg-card border-b border-border">
        <Breadcrumb items={breadcrumbItems} />
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
          <SurveyCanvas
            surveyData={{
              ...surveyData,
              questions: currentQuestions,
            }}
            onQuestionSelect={handleQuestionSelect}
            selectedQuestionId={selectedQuestionId}
            onQuestionUpdate={handleQuestionUpdate}
            onQuestionDelete={handleQuestionDelete}
            onQuestionDuplicate={handleQuestionDuplicate}
            onQuestionReorder={handleQuestionReorder}
            onDrop={handleDrop}
            isPreviewMode={isPreviewMode}
            onTogglePreview={handlePreview}
          />
          
          {/* Properties Panel */}
          <PropertiesPanel
            selectedQuestion={selectedQuestion}
            onQuestionUpdate={handleQuestionUpdate}
            isCollapsed={isPropertiesCollapsed}
            onToggleCollapse={handlePropertiesToggle}
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
