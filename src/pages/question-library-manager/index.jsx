import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import QuestionCard from './components/QuestionCard';
import QuestionEditor from './components/QuestionEditor';
import FolderManager from './components/FolderManager';
import ImportExportPanel from './components/ImportExportPanel';
import TagManager from './components/TagManager';

const QuestionLibraryManager = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [activeFolder, setActiveFolder] = useState('all');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    tags: [],
    industry: 'all'
  });

  // Mock questions data
  const mockQuestions = [
    {
      id: 1,
      title: "Customer Satisfaction Rating",
      description: "Rate your overall satisfaction with our service",
      type: "rating",
      category: "feedback",
      tags: ["satisfaction", "service", "rating"],
      industry: "general",
      questionText: "How satisfied are you with our service?",
      options: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
      validation: { required: true },
      usageCount: 45,
      lastUsed: "2024-12-15T10:30:00Z",
      createdAt: "2024-11-01T09:00:00Z",
      folderId: "customer-feedback"
    },
    {
      id: 2,
      title: "Product Feature Request",
      description: "Open-ended feedback for product improvements",
      type: "textarea",
      category: "product",
      tags: ["feature", "improvement", "feedback"],
      industry: "technology",
      questionText: "What new features would you like to see in our product?",
      validation: { required: false, maxLength: 500 },
      usageCount: 32,
      lastUsed: "2024-12-12T14:20:00Z",
      createdAt: "2024-10-15T11:30:00Z",
      folderId: "product-feedback"
    },
    {
      id: 3,
      title: "Employment Status",
      description: "Multiple choice question for employment information",
      type: "radio",
      category: "demographics",
      tags: ["employment", "status", "demographic"],
      industry: "hr",
      questionText: "What is your current employment status?",
      options: ["Full-time", "Part-time", "Self-employed", "Unemployed", "Student", "Retired"],
      validation: { required: true },
      usageCount: 78,
      lastUsed: "2024-12-10T08:15:00Z",
      createdAt: "2024-09-20T16:45:00Z",
      folderId: "demographics"
    },
    {
      id: 4,
      title: "Event Attendance Confirmation",
      description: "Yes/No question for event participation",
      type: "checkbox",
      category: "event",
      tags: ["attendance", "confirmation", "event"],
      industry: "events",
      questionText: "Will you be attending the upcoming conference?",
      options: ["Yes, I will attend", "No, I cannot attend", "Maybe, depending on schedule"],
      validation: { required: true },
      usageCount: 23,
      lastUsed: "2024-12-08T12:00:00Z",
      createdAt: "2024-11-10T10:15:00Z",
      folderId: "event-planning"
    },
    {
      id: 5,
      title: "Email Address Collection",
      description: "Input field for collecting email addresses",
      type: "email",
      category: "contact",
      tags: ["email", "contact", "information"],
      industry: "general",
      questionText: "Please provide your email address for updates",
      validation: { required: true, pattern: "email" },
      usageCount: 156,
      lastUsed: "2024-12-14T16:30:00Z",
      createdAt: "2024-08-05T14:00:00Z",
      folderId: "contact-info"
    },
    {
      id: 6,
      title: "Budget Range Selection",
      description: "Dropdown for budget range selection",
      type: "select",
      category: "financial",
      tags: ["budget", "financial", "range"],
      industry: "finance",
      questionText: "What is your budget range for this project?",
      options: ["Under $1,000", "$1,000 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000", "Over $25,000"],
      validation: { required: true },
      usageCount: 67,
      lastUsed: "2024-12-11T09:45:00Z",
      createdAt: "2024-10-01T13:20:00Z",
      folderId: "financial"
    }
  ];

  // Mock folders data
  const folders = [
    { id: "all", name: "All Questions", count: 6 },
    { id: "customer-feedback", name: "Customer Feedback", count: 1 },
    { id: "product-feedback", name: "Product Feedback", count: 1 },
    { id: "demographics", name: "Demographics", count: 1 },
    { id: "event-planning", name: "Event Planning", count: 1 },
    { id: "contact-info", name: "Contact Information", count: 1 },
    { id: "financial", name: "Financial", count: 1 }
  ];

  useEffect(() => {
    setQuestions(mockQuestions);
    setFilteredQuestions(mockQuestions);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = questions;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered?.filter(question =>
        question?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        question?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        question?.questionText?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        question?.tags?.some(tag => tag?.toLowerCase()?.includes(searchQuery?.toLowerCase()))
      );
    }

    // Apply folder filter
    if (activeFolder && activeFolder !== 'all') {
      filtered = filtered?.filter(question => question?.folderId === activeFolder);
    }

    // Apply type filter
    if (filters?.type !== 'all') {
      filtered = filtered?.filter(question => question?.type === filters?.type);
    }

    // Apply category filter
    if (filters?.category !== 'all') {
      filtered = filtered?.filter(question => question?.category === filters?.category);
    }

    // Apply industry filter
    if (filters?.industry !== 'all') {
      filtered = filtered?.filter(question => question?.industry === filters?.industry);
    }

    // Apply tag filters
    if (filters?.tags?.length > 0) {
      filtered = filtered?.filter(question =>
        filters?.tags?.some(tag => question?.tags?.includes(tag))
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, searchQuery, activeFolder, filters]);

  // Selection handlers
  const handleSelectQuestion = (questionId, isSelected) => {
    if (isSelected) {
      setSelectedQuestions([...selectedQuestions, questionId]);
    } else {
      setSelectedQuestions(selectedQuestions?.filter(id => id !== questionId));
    }
  };

  const handleSelectAll = () => {
    setSelectedQuestions(filteredQuestions?.map(question => question?.id));
  };

  const handleDeselectAll = () => {
    setSelectedQuestions([]);
  };

  // Question actions
  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setShowEditor(true);
  };

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setShowEditor(true);
  };

  const handleSaveQuestion = (questionData) => {
    if (selectedQuestion) {
      // Update existing question
      setQuestions(questions?.map(q =>
        q?.id === selectedQuestion?.id ? { ...questionData, id: selectedQuestion?.id } : q
      ));
    } else {
      // Create new question
      const newQuestion = {
        ...questionData,
        id: Math.max(...questions?.map(q => q?.id), 0) + 1,
        usageCount: 0,
        createdAt: new Date()?.toISOString()
      };
      setQuestions([...questions, newQuestion]);
    }
    setShowEditor(false);
    setSelectedQuestion(null);
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestions(questions?.filter(q => q?.id !== questionId));
    setSelectedQuestions(selectedQuestions?.filter(id => id !== questionId));
  };

  const handleDuplicateQuestion = (question) => {
    const duplicated = {
      ...question,
      id: Math.max(...questions?.map(q => q?.id), 0) + 1,
      title: `${question?.title} (Copy)`,
      usageCount: 0,
      createdAt: new Date()?.toISOString()
    };
    setQuestions([...questions, duplicated]);
  };

  const handleBulkDelete = () => {
    setQuestions(questions?.filter(q => !selectedQuestions?.includes(q?.id)));
    setSelectedQuestions([]);
  };

  const handleBulkTag = (tag) => {
    setQuestions(questions?.map(q =>
      selectedQuestions?.includes(q?.id)
        ? { ...q, tags: [...new Set([...q?.tags, tag])] }
        : q
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-16">
        {/* Left Sidebar - Question Library */}
        <div className="w-80 fixed left-0 top-16 bottom-0 bg-card border-r border-border overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Question Library</h2>
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateQuestion}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                New
              </Button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-3 text-text-secondary" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Question Type</label>
                <Select
                  value={filters?.type}
                  onChange={(value) => setFilters({ ...filters, type: value })}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'rating', label: 'Rating Scale' },
                    { value: 'radio', label: 'Multiple Choice' },
                    { value: 'checkbox', label: 'Checkbox' },
                    { value: 'textarea', label: 'Text Area' },
                    { value: 'email', label: 'Email' },
                    { value: 'select', label: 'Dropdown' }
                  ]}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <Select
                  value={filters?.category}
                  onChange={(value) => setFilters({ ...filters, category: value })}
                  options={[
                    { value: 'all', label: 'All Categories' },
                    { value: 'feedback', label: 'Feedback' },
                    { value: 'product', label: 'Product' },
                    { value: 'demographics', label: 'Demographics' },
                    { value: 'event', label: 'Event' },
                    { value: 'contact', label: 'Contact' },
                    { value: 'financial', label: 'Financial' }
                  ]}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Industry</label>
                <Select
                  value={filters?.industry}
                  onChange={(value) => setFilters({ ...filters, industry: value })}
                  options={[
                    { value: 'all', label: 'All Industries' },
                    { value: 'general', label: 'General' },
                    { value: 'technology', label: 'Technology' },
                    { value: 'hr', label: 'Human Resources' },
                    { value: 'events', label: 'Events' },
                    { value: 'finance', label: 'Finance' }
                  ]}
                />
              </div>
            </div>

            {/* Folder Navigation */}
            <FolderManager
              folders={folders}
              activeFolder={activeFolder}
              onFolderSelect={setActiveFolder}
            />

            {/* Question List */}
            <div className="space-y-2">
              {filteredQuestions?.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="FileText" size={32} className="mx-auto text-text-secondary mb-3" />
                  <p className="text-sm text-text-secondary mb-3">No questions found</p>
                  <Button variant="outline" size="sm" onClick={handleCreateQuestion}>
                    <Icon name="Plus" size={14} className="mr-1" />
                    Create Question
                  </Button>
                </div>
              ) : (
                filteredQuestions?.map((question) => (
                  <QuestionCard
                    key={question?.id}
                    question={question}
                    isSelected={selectedQuestions?.includes(question?.id)}
                    onSelect={handleSelectQuestion}
                    onEdit={() => handleEditQuestion(question)}
                    onDelete={() => handleDeleteQuestion(question?.id)}
                    onDuplicate={() => handleDuplicateQuestion(question)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Question Editor */}
        <div className="flex-1 ml-80">
          <div className="p-6">
            <Breadcrumb />

            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Question Library Manager</h1>
                <p className="text-text-secondary">
                  Create, organize, and reuse question templates across survey projects.
                </p>
              </div>
              <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                <ImportExportPanel />
                <Button variant="outline" onClick={handleCreateQuestion}>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Create Question
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedQuestions?.length > 0 && (
              <div className="bg-muted border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-foreground">
                      {selectedQuestions?.length} question{selectedQuestions?.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={handleSelectAll}>
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                        Deselect All
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TagManager onApplyTag={handleBulkTag} />
                    <Button variant="outline" size="sm">
                      <Icon name="Copy" size={14} className="mr-1" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Icon name="FolderOpen" size={14} className="mr-1" />
                      Move to Folder
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                      <Icon name="Trash2" size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            {showEditor ? (
              <QuestionEditor
                question={selectedQuestion}
                onSave={handleSaveQuestion}
                onCancel={() => {
                  setShowEditor(false);
                  setSelectedQuestion(null);
                }}
              />
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <Icon name="FileText" size={64} className="mx-auto text-text-secondary mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Welcome to Question Library Manager
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  Create reusable question templates, organize them into folders, and build surveys faster with your question library.
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <Button variant="default" onClick={handleCreateQuestion}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Create Your First Question
                  </Button>
                  <Link to="/visual-survey-builder">
                    <Button variant="outline">
                      <Icon name="ArrowRight" size={16} className="mr-2" />
                      Go to Survey Builder
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionLibraryManager;