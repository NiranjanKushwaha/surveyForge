import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Checkbox from '../../../components/ui/Checkbox';

const QuestionEditor = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questionText: '',
    type: 'radio',
    category: 'general',
    industry: 'general',
    tags: [],
    options: [''],
    validation: {
      required: false,
      maxLength: null,
      minLength: null,
      pattern: null
    },
    folderId: 'general'
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (question) {
      setFormData({
        ...question,
        options: question?.options || [''],
        tags: question?.tags || [],
        validation: question?.validation || {
          required: false,
          maxLength: null,
          minLength: null,
          pattern: null
        }
      });
    }
  }, [question]);

  const questionTypes = [
    { value: 'radio', label: 'Multiple Choice (Radio)', icon: 'Circle' },
    { value: 'checkbox', label: 'Multiple Choice (Checkbox)', icon: 'CheckSquare' },
    { value: 'rating', label: 'Rating Scale', icon: 'Star' },
    { value: 'textarea', label: 'Long Text', icon: 'Type' },
    { value: 'text', label: 'Short Text', icon: 'Type' },
    { value: 'email', label: 'Email', icon: 'Mail' },
    { value: 'select', label: 'Dropdown', icon: 'ChevronDown' },
    { value: 'number', label: 'Number', icon: 'Hash' },
    { value: 'date', label: 'Date', icon: 'Calendar' }
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'product', label: 'Product' },
    { value: 'demographics', label: 'Demographics' },
    { value: 'event', label: 'Event' },
    { value: 'contact', label: 'Contact Information' },
    { value: 'financial', label: 'Financial' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'hr', label: 'Human Resources' }
  ];

  const industries = [
    { value: 'general', label: 'General' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'finance', label: 'Finance' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'services', label: 'Services' },
    { value: 'events', label: 'Events' },
    { value: 'hr', label: 'Human Resources' }
  ];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors?.[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleValidationChange = (field, value) => {
    setFormData({
      ...formData,
      validation: { ...formData?.validation, [field]: value }
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData?.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    setFormData({ ...formData, options: [...formData?.options, ''] });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData?.options?.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddTag = () => {
    if (newTag?.trim() && !formData?.tags?.includes(newTag?.trim())) {
      setFormData({ ...formData, tags: [...formData?.tags, newTag?.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData?.tags?.filter(tag => tag !== tagToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData?.questionText?.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    if (['radio', 'checkbox', 'rating', 'select']?.includes(formData?.type)) {
      if (!formData?.options || formData?.options?.filter(opt => opt?.trim())?.length < 2) {
        newErrors.options = 'At least 2 options are required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const cleanedData = {
        ...formData,
        options: formData?.options?.filter(opt => opt?.trim()),
        lastModified: new Date()?.toISOString()
      };
      onSave?.(cleanedData);
    }
  };

  const needsOptions = ['radio', 'checkbox', 'rating', 'select']?.includes(formData?.type);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {question ? 'Edit Question' : 'Create New Question'}
          </h3>
          <p className="text-text-secondary">
            Configure your question template for reuse across surveys
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSave}>
            <Icon name="Save" size={16} className="mr-2" />
            Save Question
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Basic Information */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Question Title *
            </label>
            <Input
              placeholder="Enter a descriptive title for this question"
              value={formData?.title}
              onChange={(e) => handleInputChange('title', e?.target?.value)}
              error={errors?.title}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              placeholder="Brief description of what this question measures"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              className="w-full h-20 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Question Text *
            </label>
            <textarea
              placeholder="The actual question text that will be displayed to respondents"
              value={formData?.questionText}
              onChange={(e) => handleInputChange('questionText', e?.target?.value)}
              className="w-full h-24 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              error={errors?.questionText}
            />
            {errors?.questionText && (
              <p className="text-sm text-error mt-1">{errors?.questionText}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Question Type *
            </label>
            <Select
              value={formData?.type}
              onChange={(value) => handleInputChange('type', value)}
              options={questionTypes?.map(type => ({
                value: type?.value,
                label: type?.label
              }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <Select
                value={formData?.category}
                onChange={(value) => handleInputChange('category', value)}
                options={categories}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Industry
              </label>
              <Select
                value={formData?.industry}
                onChange={(value) => handleInputChange('industry', value)}
                options={industries}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData?.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-primary/10 text-primary"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-error"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add tag"
                value={newTag}
                onChange={(e) => setNewTag(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleAddTag()}
              />
              <Button variant="outline" size="sm" onClick={handleAddTag}>
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Options & Validation */}
        <div className="space-y-6">
          {/* Options */}
          {needsOptions && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Answer Options *
              </label>
              <div className="space-y-2">
                {formData?.options?.map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e?.target?.value)}
                    />
                    {formData?.options?.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddOption}>
                  <Icon name="Plus" size={14} className="mr-1" />
                  Add Option
                </Button>
              </div>
              {errors?.options && (
                <p className="text-sm text-error mt-1">{errors?.options}</p>
              )}
            </div>
          )}

          {/* Validation Rules */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Validation Rules
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData?.validation?.required}
                  onChange={(checked) => handleValidationChange('required', checked)}
                />
                <span className="text-sm text-foreground">Required field</span>
              </div>

              {['text', 'textarea']?.includes(formData?.type) && (
                <>
                  <div>
                    <label className="block text-sm text-foreground mb-1">
                      Minimum length
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 10"
                      value={formData?.validation?.minLength || ''}
                      onChange={(e) => handleValidationChange('minLength', parseInt(e?.target?.value) || null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-foreground mb-1">
                      Maximum length
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 500"
                      value={formData?.validation?.maxLength || ''}
                      onChange={(e) => handleValidationChange('maxLength', parseInt(e?.target?.value) || null)}
                    />
                  </div>
                </>
              )}

              {formData?.type === 'email' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData?.validation?.pattern === 'email'}
                    onChange={(checked) => handleValidationChange('pattern', checked ? 'email' : null)}
                  />
                  <span className="text-sm text-foreground">Validate email format</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Preview
            </label>
            <div className="bg-muted border border-border rounded-lg p-4">
              <div className="text-sm font-medium text-foreground mb-2">
                {formData?.questionText || 'Your question text will appear here'}
                {formData?.validation?.required && <span className="text-error ml-1">*</span>}
              </div>
              
              {formData?.type === 'radio' && formData?.options && (
                <div className="space-y-2">
                  {formData?.options?.filter(opt => opt?.trim())?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-border rounded-full"></div>
                      <span className="text-sm text-text-secondary">{option}</span>
                    </div>
                  ))}
                </div>
              )}

              {formData?.type === 'checkbox' && formData?.options && (
                <div className="space-y-2">
                  {formData?.options?.filter(opt => opt?.trim())?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-border rounded"></div>
                      <span className="text-sm text-text-secondary">{option}</span>
                    </div>
                  ))}
                </div>
              )}

              {formData?.type === 'textarea' && (
                <textarea
                  className="w-full h-20 px-3 py-2 border border-input rounded-md resize-none"
                  placeholder="Respondent's answer will be typed here..."
                  disabled
                />
              )}

              {formData?.type === 'text' && (
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Respondent's answer..."
                  disabled
                />
              )}

              {formData?.type === 'email' && (
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="example@email.com"
                  disabled
                />
              )}

              {formData?.type === 'select' && formData?.options && (
                <select
                  className="w-full px-3 py-2 border border-input rounded-md"
                  disabled
                >
                  <option>Select an option...</option>
                  {formData?.options?.filter(opt => opt?.trim())?.map((option, index) => (
                    <option key={index}>{option}</option>
                  ))}
                </select>
              )}

              {formData?.type === 'rating' && formData?.options && (
                <div className="flex space-x-2">
                  {formData?.options?.filter(opt => opt?.trim())?.map((_, index) => (
                    <div key={index} className="w-8 h-8 border border-border rounded flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;