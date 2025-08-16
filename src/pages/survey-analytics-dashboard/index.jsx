import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

import KPICards from './components/KPICards';
import AnalyticsCharts from './components/AnalyticsCharts';
import ResponseTable from './components/ResponseTable';
import FilterPanel from './components/FilterPanel';
import ExportModal from './components/ExportModal';

const SurveyAnalyticsDashboard = () => {
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [filters, setFilters] = useState({
    demographics: [],
    responseStatus: [],
    dateRange: 'all'
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mock survey and analytics data
  const mockSurvey = {
    id: surveyId || 1,
    title: "Customer Satisfaction Survey Q4 2024",
    description: "Comprehensive survey to measure customer satisfaction levels",
    status: "published",
    createdAt: "2024-12-01T08:00:00Z",
    totalQuestions: 5
  };

  const mockAnalyticsData = {
    overview: {
      totalResponses: 1247,
      completionRate: 87,
      averageTime: 185, // seconds
      responseRate: 62,
      lastResponseAt: "2024-12-20T15:30:00Z"
    },
    demographics: {
      age: [
        { range: "18-25", count: 186, percentage: 15 },
        { range: "26-35", count: 374, percentage: 30 },
        { range: "36-45", count: 436, percentage: 35 },
        { range: "46-55", count: 186, percentage: 15 },
        { range: "55+", count: 65, percentage: 5 }
      ],
      location: [
        { region: "North America", count: 623, percentage: 50 },
        { region: "Europe", count: 311, percentage: 25 },
        { region: "Asia Pacific", count: 187, percentage: 15 },
        { region: "Other", count: 126, percentage: 10 }
      ]
    },
    responses: {
      byQuestion: [
        {
          id: 1,
          title: "How would you rate our overall service?",
          type: "single-choice",
          responses: [
            { option: "Excellent", count: 436, percentage: 35 },
            { option: "Good", count: 561, percentage: 45 },
            { option: "Fair", count: 187, percentage: 15 },
            { option: "Poor", count: 63, percentage: 5 }
          ]
        },
        {
          id: 2,
          title: "Which features do you find most valuable?",
          type: "multiple-choice",
          responses: [
            { option: "Fast Response Time", count: 748, percentage: 60 },
            { option: "24/7 Support", count: 623, percentage: 50 },
            { option: "User-Friendly Interface", count: 811, percentage: 65 },
            { option: "Comprehensive Documentation", count: 374, percentage: 30 },
            { option: "Regular Updates", count: 498, percentage: 40 }
          ]
        },
        {
          id: 4,
          title: "How likely are you to recommend us?",
          type: "rating",
          averageRating: 8.2,
          distribution: [
            { rating: 1, count: 12 },
            { rating: 2, count: 19 },
            { rating: 3, count: 31 },
            { rating: 4, count: 56 },
            { rating: 5, count: 87 },
            { rating: 6, count: 124 },
            { rating: 7, count: 186 },
            { rating: 8, count: 249 },
            { rating: 9, count: 311 },
            { rating: 10, count: 172 }
          ]
        }
      ],
      timeline: [
        { date: "2024-12-01", responses: 45 },
        { date: "2024-12-02", responses: 52 },
        { date: "2024-12-03", responses: 38 },
        { date: "2024-12-04", responses: 67 },
        { date: "2024-12-05", responses: 71 },
        { date: "2024-12-06", responses: 43 },
        { date: "2024-12-07", responses: 29 },
        { date: "2024-12-08", responses: 84 },
        { date: "2024-12-09", responses: 92 },
        { date: "2024-12-10", responses: 76 }
      ]
    },
    sentiment: {
      overall: "positive",
      score: 7.8,
      breakdown: {
        positive: 68,
        neutral: 22,
        negative: 10
      }
    }
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSurvey(mockSurvey);
      setAnalyticsData(mockAnalyticsData);
      setFilteredData(mockAnalyticsData);
      setIsLoading(false);
    };

    loadAnalytics();
  }, [surveyId]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Apply filters to analytics data
    // In a real app, this would filter the actual data
    setFilteredData(analyticsData);
  };

  const handleExport = (exportOptions) => {
    console.log('Exporting data with options:', exportOptions);
    // In a real app, this would trigger the actual export
  };

  const viewOptions = [
    { value: 'overview', label: 'Overview', icon: 'BarChart3' },
    { value: 'questions', label: 'Question Analysis', icon: 'PieChart' },
    { value: 'responses', label: 'Response Details', icon: 'Table' },
    { value: 'demographics', label: 'Demographics', icon: 'Users' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!survey || !analyticsData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Icon name="AlertCircle" size={48} className="mx-auto text-error mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Analytics Not Available</h2>
            <p className="text-text-secondary">Unable to load analytics data for this survey.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="p-6">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: 'Dashboard', href: '/survey-builder-dashboard' },
              { label: 'Analytics', href: '#' },
              { label: survey?.title, href: '#' }
            ]}
          />

          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Survey Analytics</h1>
              <p className="text-text-secondary mb-4">
                {survey?.title} • {survey?.totalQuestions} Questions
              </p>
              <div className="flex items-center space-x-4 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={14} />
                  <span>Created {new Date(survey?.createdAt)?.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={14} />
                  <span>Last response {new Date(analyticsData?.overview?.lastResponseAt)?.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsFilterPanelOpen(true)}
                iconName="Filter"
              >
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsExportModalOpen(true)}
                iconName="Download"
              >
                Export
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <KPICards data={analyticsData?.overview} />

          {/* View Selector */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {viewOptions?.map((option) => (
                <Button
                  key={option?.value}
                  variant={activeView === option?.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveView(option?.value)}
                  className="flex items-center space-x-2"
                >
                  <Icon name={option?.icon} size={16} />
                  <span>{option?.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {activeView === 'overview' && (
              <AnalyticsCharts 
                data={filteredData} 
                type="overview"
              />
            )}
            
            {activeView === 'questions' && (
              <AnalyticsCharts 
                data={filteredData} 
                type="questions"
              />
            )}
            
            {activeView === 'demographics' && (
              <AnalyticsCharts 
                data={filteredData} 
                type="demographics"
              />
            )}
            
            {activeView === 'responses' && (
              <ResponseTable 
                data={filteredData?.responses}
                surveyId={surveyId}
              />
            )}
          </div>
        </div>
      </div>
      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={handleFilterChange}
        analyticsData={analyticsData}
      />
      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        survey={survey}
      />
    </div>
  );
};

export default SurveyAnalyticsDashboard;