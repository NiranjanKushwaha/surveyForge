import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import SurveyCard from "./components/SurveyCard";
import SurveyListItem from "./components/SurveyListItem";
import BulkActions from "./components/BulkActions";
import SearchAndSort from "./components/SearchAndSort";
import StatsOverview from "./components/StatsOverview";
import { surveyAPI } from "../../services/api";
import { transformSurveyListData } from "../../utils/dataTransformers";
import { testAPIConnection } from "../../utils/apiTest";

const SurveyBuilderDashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [selectedSurveys, setSelectedSurveys] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    types: [],
    status: [],
    dateRange: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning"
  });

  // Track if there's already a duplicated survey (only one allowed total)
  const [hasDuplicatedSurvey, setHasDuplicatedSurvey] = useState(false);
  const [duplicatedSurveyId, setDuplicatedSurveyId] = useState(null);

  // Mock survey data (fallback)
  const mockSurveys = [
    {
      id: 1,
      title: "Customer Satisfaction Survey Q4 2024",
      description:
        "Comprehensive survey to measure customer satisfaction levels across all product lines and identify areas for improvement.",
      thumbnail: "/assets/images/no_image.png",
      status: "published",
      responses: 1247,
      completionRate: 87,
      createdAt: "2024-12-15T10:30:00Z",
      type: "feedback",
    },
    {
      id: 2,
      title: "Employee Engagement Assessment",
      description:
        "Annual employee engagement survey to understand workplace satisfaction, culture, and areas for organizational improvement.",
      thumbnail: "/assets/images/no_image.png",
      status: "draft",
      responses: 0,
      completionRate: 0,
      createdAt: "2024-12-10T14:20:00Z",
      type: "employee",
    },
    {
      id: 3,
      title: "Product Feature Feedback",
      description:
        "Gather user feedback on new product features and functionality to guide future development priorities.",
      thumbnail: "/assets/images/no_image.png",
      status: "published",
      responses: 892,
      completionRate: 92,
      createdAt: "2024-12-08T09:15:00Z",
      type: "product",
    },
    {
      id: 4,
      title: "Market Research - Consumer Preferences",
      description:
        "In-depth market research survey to understand consumer preferences and buying behavior in our target demographic.",
      thumbnail: "/assets/images/no_image.png",
      status: "published",
      responses: 2156,
      completionRate: 78,
      createdAt: "2024-12-05T16:45:00Z",
      type: "research",
    },
    {
      id: 5,
      title: "Event Feedback - Annual Conference",
      description:
        "Post-event survey to collect attendee feedback on the annual conference experience and suggestions for improvement.",
      thumbnail: "/assets/images/no_image.png",
      status: "closed",
      responses: 456,
      completionRate: 95,
      createdAt: "2024-11-28T11:30:00Z",
      type: "event",
    },
    {
      id: 6,
      title: "Website Usability Study",
      description:
        "User experience survey to evaluate website usability, navigation, and overall user satisfaction with our digital platform.",
      thumbnail: "/assets/images/no_image.png",
      status: "draft",
      responses: 0,
      completionRate: 0,
      createdAt: "2024-12-12T13:20:00Z",
      type: "product",
    },
    {
      id: 7,
      title: "Brand Awareness Survey",
      description:
        "Comprehensive brand awareness and perception study to understand market positioning and brand recognition levels.",
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbCqZD7iZhNTv0jbhlK_g_dys6PW4pBdhcOg&s",
      status: "published",
      responses: 1834,
      completionRate: 83,
      createdAt: "2024-12-01T08:00:00Z",
      type: "research",
    },
    {
      id: 8,
      title: "Training Program Evaluation",
      description:
        "Post-training survey to assess the effectiveness of our professional development programs and identify improvement areas.",
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbCqZD7iZhNTv0jbhlK_g_dys6PW4pBdhcOg&s",
      status: "published",
      responses: 234,
      completionRate: 89,
      createdAt: "2024-11-25T15:10:00Z",
      type: "employee",
    },
  ];

  // Calculate dynamic stats from actual survey data
  const calculateStats = (surveyList) => {
    const totalSurveys = surveyList.length;
    const activeSurveys = surveyList.filter(survey => survey.status === 'published').length;
    const totalResponses = surveyList.reduce((sum, survey) => sum + (survey.responses || 0), 0);
    const avgCompletionRate = totalSurveys > 0 
      ? Math.round(surveyList.reduce((sum, survey) => sum + (survey.completionRate || 0), 0) / totalSurveys)
      : 0;

    return {
      totalSurveys,
      activeSurveys,
      totalResponses,
      avgCompletionRate,
    };
  };

  // Get current stats from all surveys
  const currentStats = calculateStats(surveys);
  
  // Get filtered stats (for when search/filters are applied)
  const filteredStats = calculateStats(filteredSurveys);

  // Load surveys from API
  useEffect(() => {
    const loadSurveys = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await surveyAPI.getSurveys();
        const transformedData = transformSurveyListData(data);
        setSurveys(transformedData);
        setFilteredSurveys(transformedData);
        
        // Check if there's already a duplicated survey
        const duplicatedSurvey = transformedData.find(s => s.isDuplicated);
        if (duplicatedSurvey) {
          setHasDuplicatedSurvey(true);
          setDuplicatedSurveyId(duplicatedSurvey.id);
        }
      } catch (error) {
        console.error('Error loading surveys:', error);
        setError('Failed to load surveys. Using demo data.');
        // Fallback to mock data for development
        setSurveys(mockSurveys);
        setFilteredSurveys(mockSurveys);
        
        // Check mock data for duplicated surveys
        const duplicatedSurvey = mockSurveys.find(s => s.isDuplicated);
        if (duplicatedSurvey) {
          setHasDuplicatedSurvey(true);
          setDuplicatedSurveyId(duplicatedSurvey.id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveys();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = surveys;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered?.filter(
        (survey) =>
          survey?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
          survey?.description
            ?.toLowerCase()
            ?.includes(searchQuery?.toLowerCase())
      );
    }

    // Apply type filters
    if (filters?.types?.length > 0) {
      filtered = filtered?.filter((survey) =>
        filters?.types?.includes(survey?.type)
      );
    }

    // Apply status filters
    if (filters?.status?.length > 0) {
      filtered = filtered?.filter((survey) =>
        filters?.status?.includes(survey?.status)
      );
    }

    // Apply sorting
    filtered = [...filtered]?.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "most-responses":
          return b?.responses - a?.responses;
        case "least-responses":
          return a?.responses - b?.responses;
        case "alphabetical":
          return a?.title?.localeCompare(b?.title);
        case "completion-rate":
          return b?.completionRate - a?.completionRate;
        default:
          return 0;
      }
    });

    setFilteredSurveys(filtered);
  }, [surveys, searchQuery, filters, sortBy]);

  // Selection handlers
  const handleSelectSurvey = (surveyId, isSelected) => {
    if (isSelected) {
      setSelectedSurveys([...selectedSurveys, surveyId]);
    } else {
      setSelectedSurveys(selectedSurveys?.filter((id) => id !== surveyId));
    }
  };

  const handleSelectAll = () => {
    setSelectedSurveys(filteredSurveys?.map((survey) => survey?.id));
  };

  const handleDeselectAll = () => {
    setSelectedSurveys([]);
  };

  // Action handlers
  const handleDuplicate = async (surveyId) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) {
      alert('Survey not found');
      return;
    }

    // Allow replacing existing duplicate

    const message = hasDuplicatedSurvey 
      ? `Are you sure you want to duplicate "${survey.title}"? This will replace the existing duplicate.`
      : `Are you sure you want to duplicate "${survey.title}"? This will create a copy with draft status.`;

    setConfirmationDialog({
      isOpen: true,
      title: "Duplicate Survey",
      message,
      type: "info",
      onConfirm: async () => {
        try {
          // Remove existing duplicate if any
          if (hasDuplicatedSurvey && duplicatedSurveyId) {
            setSurveys(prev => prev.filter(s => s.id !== duplicatedSurveyId));
            setFilteredSurveys(prev => prev.filter(s => s.id !== duplicatedSurveyId));
          }

          // In a real app, this would call the API
          const duplicatedSurvey = {
            ...survey,
            id: Date.now(), // Generate new ID
            title: `${survey.title} (Copy)`,
            status: 'draft',
            responses: 0,
            completionRate: 0,
            createdAt: new Date().toISOString(),
            isDuplicated: true, // Mark as duplicated
            originalId: surveyId, // Keep reference to original
          };
          
          setSurveys(prev => [duplicatedSurvey, ...prev]);
          setFilteredSurveys(prev => [duplicatedSurvey, ...prev]);
          
          // Mark that we have a duplicated survey
          setHasDuplicatedSurvey(true);
          setDuplicatedSurveyId(duplicatedSurvey.id);
          
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
          alert(hasDuplicatedSurvey ? 'Survey duplicated successfully! Previous duplicate was replaced.' : 'Survey duplicated successfully!');
        } catch (error) {
          console.error('Error duplicating survey:', error);
          alert('Failed to duplicate survey. Please try again.');
        }
      }
    });
  };

  const handleArchive = async (surveyId) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey) {
      alert('Survey not found');
      return;
    }

    setConfirmationDialog({
      isOpen: true,
      title: "Archive Survey",
      message: `Are you sure you want to archive "${survey.title}"? This action can be undone.`,
      type: "warning",
      onConfirm: async () => {
        try {
          // In a real app, this would call the API
          setSurveys(prev => prev.filter(s => s.id !== surveyId));
          setFilteredSurveys(prev => prev.filter(s => s.id !== surveyId));
          setSelectedSurveys(prev => prev.filter(id => id !== surveyId));
          
          // If the archived survey was a duplicate, reset duplicate state
          if (survey.isDuplicated) {
            setHasDuplicatedSurvey(false);
            setDuplicatedSurveyId(null);
          }
          
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
          alert('Survey archived successfully!');
        } catch (error) {
          console.error('Error archiving survey:', error);
          alert('Failed to archive survey. Please try again.');
        }
      }
    });
  };

  const handleExport = async (surveyId) => {
    try {
      const survey = surveys.find(s => s.id === surveyId);
      if (!survey) {
        alert('Survey not found');
        return;
      }

      // Create export data
      const exportData = {
        survey: survey,
        exportedAt: new Date().toISOString(),
        format: 'json'
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert('Survey exported successfully!');
    } catch (error) {
      console.error('Error exporting survey:', error);
      alert('Failed to export survey. Please try again.');
    }
  };

  const handleBulkDuplicate = async () => {
    if (selectedSurveys.length === 0) return;
    
    setConfirmationDialog({
      isOpen: true,
      title: "Duplicate Surveys",
      message: `Are you sure you want to duplicate ${selectedSurveys.length} survey(s)? This will create copies with draft status.`,
      type: "info",
      onConfirm: async () => {
        try {
          const surveysToDuplicate = surveys.filter(s => selectedSurveys.includes(s.id));
          const duplicatedSurveys = surveysToDuplicate.map(survey => ({
            ...survey,
            id: Date.now() + Math.random(), // Generate unique ID
            title: `${survey.title} (Copy)`,
            status: 'draft',
            responses: 0,
            completionRate: 0,
            createdAt: new Date().toISOString(),
          }));
          
          setSurveys(prev => [...duplicatedSurveys, ...prev]);
          setFilteredSurveys(prev => [...duplicatedSurveys, ...prev]);
          setSelectedSurveys([]);
          
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
          alert(`${duplicatedSurveys.length} survey(s) duplicated successfully!`);
        } catch (error) {
          console.error('Error bulk duplicating surveys:', error);
          alert('Failed to duplicate surveys. Please try again.');
        }
      }
    });
  };

  const handleBulkArchive = async () => {
    if (selectedSurveys.length === 0) return;
    
    setConfirmationDialog({
      isOpen: true,
      title: "Archive Surveys",
      message: `Are you sure you want to archive ${selectedSurveys.length} survey(s)? This action can be undone.`,
      type: "warning",
      onConfirm: async () => {
        try {
          setSurveys(prev => prev.filter(s => !selectedSurveys.includes(s.id)));
          setFilteredSurveys(prev => prev.filter(s => !selectedSurveys.includes(s.id)));
          setSelectedSurveys([]);
          
          setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
          alert(`${selectedSurveys.length} survey(s) archived successfully!`);
        } catch (error) {
          console.error('Error bulk archiving surveys:', error);
          alert('Failed to archive surveys. Please try again.');
        }
      }
    });
  };

  const handleBulkExport = async () => {
    if (selectedSurveys.length === 0) return;
    
    try {
      const surveysToExport = surveys.filter(s => selectedSurveys.includes(s.id));
      
      // Create export data
      const exportData = {
        surveys: surveysToExport,
        exportedAt: new Date().toISOString(),
        format: 'json',
        count: surveysToExport.length
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `surveys_bulk_export_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      alert(`${surveysToExport.length} survey(s) exported successfully!`);
    } catch (error) {
      console.error('Error bulk exporting surveys:', error);
      alert('Failed to export surveys. Please try again.');
    }
  };

  const handleTestAPI = async () => {
    console.log('🧪 Testing API connection...');
    const result = await testAPIConnection();
    if (result.success) {
      alert('✅ API connection successful! Check console for details.');
    } else {
      alert('❌ API connection failed! Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16">
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-6">
            {/* Breadcrumb */}
            <Breadcrumb />

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Survey Dashboard
                </h1>
                <p className="text-text-secondary">
                  Create, manage, and analyze your surveys from one central
                  location.
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex space-x-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full lg:w-auto"
                  onClick={handleTestAPI}
                >
                  <Icon name="TestTube" size={20} className="mr-2" />
                  Test API
                </Button>
                <Link to="/demo-integration">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full lg:w-auto"
                  >
                    <Icon name="Eye" size={20} className="mr-2" />
                    View Integration Demo
                  </Button>
                </Link>
                <Link to="/visual-survey-builder">
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full lg:w-auto"
                  >
                    <Icon name="Plus" size={20} className="mr-2" />
                    Create New Survey
                  </Button>
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Icon name="AlertTriangle" size={20} className="text-yellow-600 mr-2" />
                  <span className="text-yellow-800">{error}</span>
                </div>
              </div>
            )}

            {/* Stats Overview */}
            <StatsOverview 
              stats={currentStats} 
              isFiltered={searchQuery || filters?.types?.length > 0 || filters?.status?.length > 0}
              filteredStats={filteredStats}
            />

            {/* Search and Sort Controls */}
            <SearchAndSort
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Bulk Actions */}
            <BulkActions
              selectedCount={selectedSurveys?.length}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkDuplicate={handleBulkDuplicate}
              onBulkArchive={handleBulkArchive}
              onBulkExport={handleBulkExport}
            />

            {/* Loading State */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Loading surveys...
                </h3>
                <p className="text-text-secondary">
                  Please wait while we fetch your surveys
                </p>
              </div>
            ) : filteredSurveys?.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  name="FileText"
                  size={48}
                  className="mx-auto text-text-secondary mb-4"
                />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No surveys found
                </h3>
                <p className="text-text-secondary mb-6">
                  {searchQuery ||
                  filters?.types?.length > 0 ||
                  filters?.status?.length > 0
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first survey"}
                </p>
                {!searchQuery &&
                  filters?.types?.length === 0 &&
                  filters?.status?.length === 0 && (
                    <Link to="/visual-survey-builder">
                      <Button variant="default">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Create New Survey
                      </Button>
                    </Link>
                  )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {filteredSurveys?.map((survey) =>
                  viewMode === "grid" ? (
                    <SurveyCard
                      key={survey?.id}
                      survey={survey}
                      onDuplicate={handleDuplicate}
                      onArchive={handleArchive}
                      onExport={handleExport}
                      isSelected={selectedSurveys?.includes(survey?.id)}
                      onSelect={handleSelectSurvey}
                      hasDuplicatedSurvey={hasDuplicatedSurvey}
                    />
                  ) : (
                    <SurveyListItem
                      key={survey?.id}
                      survey={survey}
                      onDuplicate={handleDuplicate}
                      onArchive={handleArchive}
                      onExport={handleExport}
                      isSelected={selectedSurveys?.includes(survey?.id)}
                      onSelect={handleSelectSurvey}
                      hasDuplicatedSurvey={hasDuplicatedSurvey}
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmationDialog.onConfirm}
        title={confirmationDialog.title}
        message={confirmationDialog.message}
        type={confirmationDialog.type}
      />
    </div>
  );
};

export default SurveyBuilderDashboard;
