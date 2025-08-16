import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import Breadcrumb from "../../components/ui/Breadcrumb";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import SurveyCard from "./components/SurveyCard";
import SurveyListItem from "./components/SurveyListItem";
import BulkActions from "./components/BulkActions";
import SearchAndSort from "./components/SearchAndSort";
import StatsOverview from "./components/StatsOverview";

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

  // Mock survey data
  const mockSurveys = [
    {
      id: 1,
      title: "Customer Satisfaction Survey Q4 2024",
      description:
        "Comprehensive survey to measure customer satisfaction levels across all product lines and identify areas for improvement.",
      thumbnail:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop",
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
      thumbnail:
        "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400&h=200&fit=crop",
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
      thumbnail:
        "https://images.pixabay.com/photo/2016/11/29/06/18/home-office-1867761_1280.jpg?w=400&h=200&fit=crop",
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
      thumbnail:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
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
      thumbnail:
        "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?w=400&h=200&fit=crop",
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
      thumbnail:
        "https://images.pixabay.com/photo/2016/11/29/20/22/computer-1869236_1280.jpg?w=400&h=200&fit=crop",
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
        "https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=200&fit=crop",
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
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?w=400&h=200&fit=crop",
      status: "published",
      responses: 234,
      completionRate: 89,
      createdAt: "2024-11-25T15:10:00Z",
      type: "employee",
    },
  ];

  // Mock stats data
  const mockStats = {
    totalSurveys: 43,
    activeSurveys: 22,
    totalResponses: 8945,
    avgCompletionRate: 86,
  };

  useEffect(() => {
    setSurveys(mockSurveys);
    setFilteredSurveys(mockSurveys);
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
  const handleDuplicate = (surveyId) => {
    console.log("Duplicating survey:", surveyId);
  };

  const handleArchive = (surveyId) => {
    console.log("Archiving survey:", surveyId);
  };

  const handleExport = (surveyId) => {
    console.log("Exporting survey:", surveyId);
  };

  const handleBulkDuplicate = () => {
    console.log("Bulk duplicating surveys:", selectedSurveys);
  };

  const handleBulkArchive = () => {
    console.log("Bulk archiving surveys:", selectedSurveys);
  };

  const handleBulkExport = () => {
    console.log("Bulk exporting surveys:", selectedSurveys);
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
              <div className="mt-4 lg:mt-0">
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

            {/* Stats Overview */}
            <StatsOverview stats={mockStats} />

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

            {/* Survey Grid/List */}
            {filteredSurveys?.length === 0 ? (
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
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyBuilderDashboard;
