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

// Get appropriate icon for question type
const getQuestionIcon = (type) => {
  const iconMap = {
    "text-input": "Type",
    email: "Mail",
    textarea: "FileText",
    radio: "Circle",
    checkbox: "CheckSquare",
    rating: "Star",
    dropdown: "ChevronDown",
    date: "Calendar",
    number: "Hash",
    phone: "Phone",
    "multi-select": "CheckSquare",
    select: "ChevronDown",
    text: "Type",
  };
  return iconMap[type] || "HelpCircle";
};

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
    if (surveyData && Object.keys(surveyData).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        try {
          localStorage.setItem("surveyforge_autosave", JSON.stringify(surveyData));
          if (saveStatus === SAVE_STATUS.UNSAVED) {
            setSaveStatus(SAVE_STATUS.SAVED);
          }
        } catch (error) {
          console.error("Error auto-saving:", error);
          setSaveStatus(SAVE_STATUS.ERROR);
        }
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
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
  const handleSurveyDataUpdate = (updates) => {
    const newSurveyData = { ...surveyData, ...updates };
    setSurveyData(newSurveyData);
    addToHistory(newSurveyData);
    markAsUnsaved();
  };

  // Canvas handlers
  const handleQuestionSelect = (questionId) => {
    setSelectedQuestionId(questionId);
  };

  // Mark as unsaved when data changes
  const markAsUnsaved = () => {
    if (saveStatus !== SAVE_STATUS.SAVING) {
      setSaveStatus(SAVE_STATUS.UNSAVED);
    }
  };

  // Update handlers to mark as unsaved
  const handleQuestionUpdate = (questionId, updates) => {
    const newSurveyData = { ...surveyData };
    const currentPage = newSurveyData.pages?.find(
      (page) => page.id === newSurveyData.currentPageId
    );
    
    if (currentPage) {
      const questionIndex = currentPage.questions?.findIndex(
        (q) => q.id === questionId
      );
      if (questionIndex !== -1) {
        currentPage.questions[questionIndex] = {
          ...currentPage.questions[questionIndex],
          ...updates,
        };
        setSurveyData(newSurveyData);
        addToHistory(newSurveyData);
        markAsUnsaved();
      }
    }
  };

  const handleQuestionDelete = (questionId) => {
    const newSurveyData = { ...surveyData };
    const currentPage = newSurveyData.pages?.find(
      (page) => page.id === newSurveyData.currentPageId
    );
    
    if (currentPage) {
      currentPage.questions = currentPage.questions?.filter(
        (q) => q.id !== questionId
      );
      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
      setSelectedQuestionId(null);
      markAsUnsaved();
    }
  };

  const handleQuestionDuplicate = (questionId) => {
    const newSurveyData = { ...surveyData };
    const currentPage = newSurveyData.pages?.find(
      (page) => page.id === newSurveyData.currentPageId
    );
    
    if (currentPage) {
      const originalQuestion = currentPage.questions?.find(
        (q) => q.id === questionId
      );
      if (originalQuestion) {
        const duplicatedQuestion = {
          ...originalQuestion,
          id: `q_${Date.now()}`,
          name: `${originalQuestion.name}_copy`,
          title: `${originalQuestion.title} (Copy)`,
        };
        currentPage.questions.push(duplicatedQuestion);
        setSurveyData(newSurveyData);
        addToHistory(newSurveyData);
        setSelectedQuestionId(duplicatedQuestion.id);
        markAsUnsaved();
      }
    }
  };

  const handleQuestionReorder = (fromIndex, toIndex) => {
    const newSurveyData = { ...surveyData };
    const currentPage = newSurveyData.pages?.find(
      (page) => page.id === newSurveyData.currentPageId
    );
    
    if (currentPage) {
      const questions = [...currentPage.questions];
      const [movedQuestion] = questions.splice(fromIndex, 1);
      questions.splice(toIndex, 0, movedQuestion);
      currentPage.questions = questions;
      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
      markAsUnsaved();
    }
  };

  const handleDrop = (componentData, dropIndex) => {
    const newSurveyData = { ...surveyData };
    const currentPage = newSurveyData.pages?.find(
      (page) => page.id === newSurveyData.currentPageId
    );
    
    if (currentPage) {
      const questionType = componentData.id; // Extract question type from componentData
      const newQuestion = {
        id: `q_${Date.now()}`,
        name: generateUniqueQuestionName(questionType, newSurveyData), // Use a unique name generator
        type: questionType,
        title: `New ${componentData.name} Question`, // Use component name for title
        description: "",
        placeholder: "",
        required: false,
        options: [],
        validation: {},
        conditionalLogic: { enabled: false },
        styling: {},
        icon: getQuestionIcon(questionType),
      };

      if (dropIndex === -1) {
        currentPage.questions.push(newQuestion);
      } else {
        currentPage.questions.splice(dropIndex, 0, newQuestion);
      }

      setSurveyData(newSurveyData);
      addToHistory(newSurveyData);
      setSelectedQuestionId(newQuestion.id);
      markAsUnsaved();
      return newQuestion.id; // Return the new question ID for SurveyCanvas to handle auto-scroll
    }
    return null;
  };

  // Helper function to generate a unique question name
  const generateUniqueQuestionName = (questionType, currentSurveyData) => {
    const typeMap = {
      "text-input": "text_input",
      textarea: "textarea",
      email: "email",
      number: "number",
      phone: "phone",
      radio: "radio_selection",
      checkbox: "checkbox_selection",
      dropdown: "dropdown_selection",
      "multi-select": "multi_select",
      "star-rating": "star_rating",
      likert: "likert_scale",
      nps: "nps_score",
      slider: "slider",
      "matrix-single": "matrix_single",
      "matrix-multiple": "matrix_multiple",
      ranking: "ranking",
      "date-picker": "date_picker",
      "time-picker": "time_picker",
      "file-upload": "file_upload",
      signature: "signature",
      location: "location",
    };

    const baseName = typeMap[questionType] || "question";
    let counter = 1;
    let questionName = `${baseName}_${counter}`;

    const existingNames =
      currentSurveyData?.pages?.flatMap(
        (page) => page?.questions?.map((q) => q.name) || []
      ) || [];

    while (existingNames.includes(questionName)) {
      counter++;
      questionName = `${baseName}_${counter}`;
    }
    return questionName;
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
    markAsUnsaved();
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
    markAsUnsaved();
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
    markAsUnsaved();
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
