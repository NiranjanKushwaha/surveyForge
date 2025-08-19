import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Checkbox from "../../../components/ui/Checkbox";

const PropertiesPanel = ({ selectedQuestion, onQuestionUpdate, isCollapsed, onToggleCollapse, surveyData }) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'General', icon: 'Settings' },
    { id: 'validation', name: 'Validation', icon: 'Shield' },
    { id: 'logic', name: 'Logic', icon: 'GitBranch' },
    { id: 'styling', name: 'Styling', icon: 'Palette' }
  ];

  // Get all questions from all pages for conditional logic
  const getAllQuestions = () => {
    if (!surveyData?.pages) return [];
    
    return surveyData.pages.flatMap((page, pageIndex) => 
      page.questions?.map((question, qIndex) => ({
        id: question.id,
        label: `${page.name} - Q${qIndex + 1}: ${question.title}`,
        pageName: page.name,
        questionIndex: qIndex + 1
      })) || []
    ).filter(q => q.id !== selectedQuestion?.id); // Exclude current question
  };

  const handleInputChange = (field, value) => {
    onQuestionUpdate(selectedQuestion?.id, { [field]: value });
  };

  const handleOptionChange = (optionIndex, field, value) => {
    const updatedOptions = [...(selectedQuestion?.options || [])];
    updatedOptions[optionIndex] = { ...updatedOptions?.[optionIndex], [field]: value };
    onQuestionUpdate(selectedQuestion?.id, { options: updatedOptions });
  };

  const addOption = () => {
    const newOption = { 
      id: Date.now()?.toString(), 
      label: `Option ${(selectedQuestion?.options?.length || 0) + 1}`, 
      value: `option_${(selectedQuestion?.options?.length || 0) + 1}` 
    };
    const updatedOptions = [...(selectedQuestion?.options || []), newOption];
    onQuestionUpdate(selectedQuestion?.id, { options: updatedOptions });
  };

  const removeOption = (optionIndex) => {
    const updatedOptions = selectedQuestion?.options?.filter((_, index) => index !== optionIndex);
    onQuestionUpdate(selectedQuestion?.id, { options: updatedOptions });
  };

  if (isCollapsed) {
    return (
      <div id="properties-panel-collapsed" className="w-12 bg-card border-l border-border flex flex-col items-center py-4 properties-panel-collapsed">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-muted rounded-md survey-transition properties-panel-expand-button"
          title="Expand Properties Panel"
          id="properties-panel-expand-button"
        >
          <Icon name="ChevronLeft" size={16} />
        </button>
      </div>
    );
  }

  if (!selectedQuestion) {
    return (
      <div className="w-80 bg-card border-l border-border flex flex-col properties-panel-no-selection">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Properties</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-muted rounded-md survey-transition properties-panel-collapse-button"
            title="Collapse Panel"
            id="properties-panel-collapse-button"
          >
            <Icon name="ChevronRight" size={16} />
          </button>
        </div>
        <div id="properties-panel-no-selection-content" className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name="MousePointer" size={20} color="var(--color-text-secondary)" />
            </div>
            <p className="text-sm text-text-secondary">
              Select a question to view and edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderGeneralTab = () => (
    <div className="space-y-4">


      <Input
        label="Question Title"
        type="text"
        value={selectedQuestion?.title || ''}
        onChange={(e) => handleInputChange('title', e?.target?.value)}
        placeholder="Enter question title..."
      />

      <Input
        label="Description"
        type="text"
        value={selectedQuestion?.description || ''}
        onChange={(e) => handleInputChange('description', e?.target?.value)}
        placeholder="Optional description..."
        description="Additional context for the question"
      />

      <Input
        label="Placeholder Text"
        type="text"
        value={selectedQuestion?.placeholder || ''}
        onChange={(e) => handleInputChange('placeholder', e?.target?.value)}
        placeholder="Enter placeholder text..."
      />

      <div className="space-y-3">
        <Checkbox
          label="Required Field"
          checked={selectedQuestion?.required || false}
          onChange={(e) => handleInputChange('required', e?.target?.checked)}
          description="Users must answer this question"
        />

        <Checkbox
          label="Show Question Number"
          checked={selectedQuestion?.showNumber !== false}
          onChange={(e) => handleInputChange('showNumber', e?.target?.checked)}
        />

        <Checkbox
          label="Allow Comments"
          checked={selectedQuestion?.allowComments || false}
          onChange={(e) => handleInputChange('allowComments', e?.target?.checked)}
          description="Add a comment field below the question"
        />
      </div>

      {/* Options for choice-based questions */}
      {['radio', 'checkbox', 'dropdown', 'multi-select']?.includes(selectedQuestion?.type) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Options</label>
            <Button variant="outline" size="sm" onClick={addOption} iconName="Plus">
              Add Option
            </Button>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Column headers */}
              <div className="flex items-center space-x-2 px-2 py-1 bg-muted rounded text-xs font-medium text-text-secondary">
              <div className="flex-1">Label</div>
              <div className="flex-1">Value</div>
              <div className="w-6"></div> {/* Space for delete button */}
            </div>
            
            {(selectedQuestion?.options || [])?.map((option, index) => (
              <div key={option?.id || index} className="flex items-center space-x-2 p-2 bg-surface rounded border border-border">
                <Input
                  type="text"
                  value={option?.label}
                  onChange={(e) => handleOptionChange(index, 'label', e?.target?.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Input
                  type="text"
                  value={option?.value}
                  onChange={(e) => handleOptionChange(index, 'value', e?.target?.value)}
                  placeholder={`value_${index + 1}`}
                  className="flex-1"
                />
                <button
                  onClick={() => removeOption(index)}
                  className="p-1 hover:bg-error/10 hover:text-error rounded survey-transition"
                  title="Remove Option"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderValidationTab = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <Checkbox
          label="Required Field"
          checked={selectedQuestion?.required || false}
          onChange={(e) => handleInputChange('required', e?.target?.checked)}
        />

        {selectedQuestion?.type === 'text-input' && (
          <>
            <Input
              label="Minimum Length"
              type="number"
              value={selectedQuestion?.validation?.minLength || ''}
              onChange={(e) => handleInputChange('validation', { 
                ...selectedQuestion?.validation, 
                minLength: parseInt(e?.target?.value) || undefined 
              })}
              placeholder="0"
            />

            <Input
              label="Maximum Length"
              type="number"
              value={selectedQuestion?.validation?.maxLength || ''}
              onChange={(e) => handleInputChange('validation', { 
                ...selectedQuestion?.validation, 
                maxLength: parseInt(e?.target?.value) || undefined 
              })}
              placeholder="No limit"
            />

            <Input
              label="Pattern (Regex)"
              type="text"
              value={selectedQuestion?.validation?.pattern || ''}
              onChange={(e) => handleInputChange('validation', { 
                ...selectedQuestion?.validation, 
                pattern: e?.target?.value 
              })}
              placeholder="^[a-zA-Z]+$"
              description="Regular expression for validation"
            />
          </>
        )}

        {selectedQuestion?.type === 'number' && (
          <>
            <Input
              label="Minimum Value"
              type="number"
              value={selectedQuestion?.validation?.min || ''}
              onChange={(e) => handleInputChange('validation', { 
                ...selectedQuestion?.validation, 
                min: parseFloat(e?.target?.value) || undefined 
              })}
            />

            <Input
              label="Maximum Value"
              type="number"
              value={selectedQuestion?.validation?.max || ''}
              onChange={(e) => handleInputChange('validation', { 
                ...selectedQuestion?.validation, 
                max: parseFloat(e?.target?.value) || undefined 
              })}
            />
          </>
        )}

        <Input
          label="Custom Error Message"
          type="text"
          value={selectedQuestion?.validation?.errorMessage || ''}
          onChange={(e) => handleInputChange('validation', { 
            ...selectedQuestion?.validation, 
            errorMessage: e?.target?.value 
          })}
          placeholder="This field is required"
        />
      </div>
    </div>
  );

  const renderLogicTab = () => (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Info" size={16} color="var(--color-primary)" />
          <span className="text-sm font-medium text-foreground">Conditional Logic</span>
        </div>
        <p className="text-xs text-text-secondary">
          Show or hide this question based on answers to previous questions.
        </p>
      </div>

      <div className="space-y-3">
        <Checkbox
          label="Enable Conditional Logic"
          checked={selectedQuestion?.conditionalLogic?.enabled || false}
          onChange={(e) => handleInputChange('conditionalLogic', { 
            ...selectedQuestion?.conditionalLogic, 
            enabled: e?.target?.checked 
          })}
        />

        {selectedQuestion?.conditionalLogic?.enabled && (
          <div className="space-y-3 pl-4 border-l-2 border-primary">
            <div className="text-sm font-medium text-foreground">Show this question when:</div>
            
            <div className="p-3 bg-surface rounded border border-border">
              <div className="text-xs text-text-secondary mb-2">Condition Builder</div>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Previous Question</label>
                  <select 
                    className="w-full px-2 py-1 text-xs border border-border rounded"
                    value={selectedQuestion?.conditionalLogic?.dependsOn || ''}
                    onChange={(e) => handleInputChange('conditionalLogic', { 
                      ...selectedQuestion?.conditionalLogic, 
                      dependsOn: e?.target?.value 
                    })}
                  >
                    <option value="">Select previous question...</option>
                    {getAllQuestions()?.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Condition</label>
                  <select 
                    className="w-full px-2 py-1 text-xs border border-border rounded"
                    value={selectedQuestion?.conditionalLogic?.condition || 'equals'}
                    onChange={(e) => handleInputChange('conditionalLogic', { 
                      ...selectedQuestion?.conditionalLogic, 
                      condition: e?.target?.value 
                    })}
                  >
                    <option value="equals">equals</option>
                    <option value="not_equals">not equals</option>
                    <option value="contains">contains</option>
                    <option value="not_contains">not contains</option>
                    <option value="greater_than">greater than</option>
                    <option value="less_than">less than</option>
                    <option value="is_empty">is empty</option>
                    <option value="is_not_empty">is not empty</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-text-secondary block mb-1">Value</label>
                  <input 
                    type="text" 
                    placeholder="Enter value to compare against..."
                    className="w-full px-2 py-1 text-xs border border-border rounded"
                    value={selectedQuestion?.conditionalLogic?.value || ''}
                    onChange={(e) => handleInputChange('conditionalLogic', { 
                      ...selectedQuestion?.conditionalLogic, 
                      value: e?.target?.value 
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-text-secondary bg-blue-50 p-2 rounded border border-blue-200">
              <strong>Example:</strong> Show this question when "Would you like us to contact you?" equals "Yes, please contact me"
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStylingTab = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Question Width</label>
          <select 
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
            value={selectedQuestion?.styling?.width || 'full'}
            onChange={(e) => handleInputChange('styling', { 
              ...selectedQuestion?.styling, 
              width: e?.target?.value 
            })}
          >
            <option value="full">Full Width</option>
            <option value="half">Half Width</option>
            <option value="third">One Third</option>
            <option value="quarter">One Quarter</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Alignment</label>
          <div className="flex space-x-2">
            {['left', 'center', 'right']?.map((align) => (
              <button
                key={align}
                onClick={() => handleInputChange('styling', { 
                  ...selectedQuestion?.styling, 
                  alignment: align 
                })}
                className={`flex-1 px-3 py-2 text-xs border rounded-md survey-transition ${
                  (selectedQuestion?.styling?.alignment || 'left') === align
                    ? 'border-primary bg-primary text-primary-foreground' :'border-border hover:border-primary'
                }`}
              >
                <Icon name={align === 'left' ? 'AlignLeft' : align === 'center' ? 'AlignCenter' : 'AlignRight'} size={14} className="mx-auto" />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Checkbox
            label="Show Border"
            checked={selectedQuestion?.styling?.showBorder !== false}
            onChange={(e) => handleInputChange('styling', { 
              ...selectedQuestion?.styling, 
              showBorder: e?.target?.checked 
            })}
          />

          <Checkbox
            label="Highlight on Focus"
            checked={selectedQuestion?.styling?.highlightOnFocus !== false}
            onChange={(e) => handleInputChange('styling', { 
              ...selectedQuestion?.styling, 
              highlightOnFocus: e?.target?.checked 
            })}
          />

          <Checkbox
            label="Compact Layout"
            checked={selectedQuestion?.styling?.compact || false}
            onChange={(e) => handleInputChange('styling', { 
              ...selectedQuestion?.styling, 
              compact: e?.target?.checked 
            })}
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'validation':
        return renderValidationTab();
      case 'logic':
        return renderLogicTab();
      case 'styling':
        return renderStylingTab();
      default:
        return renderGeneralTab();
    }
  };

  return (
    <div id="properties-panel-container" className="w-80 bg-card border-l border-border flex flex-col h-full properties-panel-container">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name={selectedQuestion?.icon} size={16} color="var(--color-primary)" />
          <h2 className="text-sm font-semibold text-foreground">Properties</h2>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-muted rounded-md survey-transition"
          title="Collapse Panel"
        >
          <Icon name="ChevronRight" size={16} />
        </button>
      </div>
      {/* Question Type Badge */}
      <div className="px-4 py-2 border-b border-border">
        <div className="inline-flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
          <span>{selectedQuestion?.type?.replace('-', ' ')?.toUpperCase()}</span>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex-1 flex items-center justify-center space-x-1 px-2 py-3 text-xs font-medium survey-transition ${
              activeTab === tab?.id
                ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-text-secondary hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon name={tab?.icon} size={12} />
            <span className="hidden lg:inline">{tab?.name}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PropertiesPanel;