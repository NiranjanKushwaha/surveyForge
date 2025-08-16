import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ComponentLibrary = ({ isCollapsed, onToggleCollapse, onDragStart }) => {
  const [activeCategory, setActiveCategory] = useState('text');

  const componentCategories = [
    {
      id: 'text',
      name: 'Text Inputs',
      icon: 'Type',
      components: [
        { id: 'text-input', name: 'Text Input', icon: 'Type', description: 'Single line text field' },
        { id: 'textarea', name: 'Text Area', icon: 'AlignLeft', description: 'Multi-line text field' },
        { id: 'email', name: 'Email', icon: 'Mail', description: 'Email validation field' },
        { id: 'number', name: 'Number', icon: 'Hash', description: 'Numeric input field' },
        { id: 'phone', name: 'Phone', icon: 'Phone', description: 'Phone number field' }
      ]
    },
    {
      id: 'choice',
      name: 'Multiple Choice',
      icon: 'CheckSquare',
      components: [
        { id: 'radio', name: 'Radio Buttons', icon: 'Circle', description: 'Single selection' },
        { id: 'checkbox', name: 'Checkboxes', icon: 'CheckSquare', description: 'Multiple selection' },
        { id: 'dropdown', name: 'Dropdown', icon: 'ChevronDown', description: 'Select from list' },
        { id: 'multi-select', name: 'Multi-Select', icon: 'List', description: 'Multiple dropdown selection' }
      ]
    },
    {
      id: 'rating',
      name: 'Rating & Scale',
      icon: 'Star',
      components: [
        { id: 'star-rating', name: 'Star Rating', icon: 'Star', description: '5-star rating scale' },
        { id: 'likert', name: 'Likert Scale', icon: 'BarChart3', description: 'Agreement scale' },
        { id: 'nps', name: 'NPS Score', icon: 'TrendingUp', description: 'Net Promoter Score' },
        { id: 'slider', name: 'Slider', icon: 'Minus', description: 'Range slider input' }
      ]
    },
    {
      id: 'matrix',
      name: 'Matrix Questions',
      icon: 'Grid3X3',
      components: [
        { id: 'matrix-single', name: 'Matrix (Single)', icon: 'Grid3X3', description: 'Single choice matrix' },
        { id: 'matrix-multiple', name: 'Matrix (Multiple)', icon: 'Grid', description: 'Multiple choice matrix' },
        { id: 'ranking', name: 'Ranking', icon: 'ArrowUpDown', description: 'Drag to rank items' }
      ]
    },
    {
      id: 'advanced',
      name: 'Advanced Widgets',
      icon: 'Settings',
      components: [
        { id: 'date-picker', name: 'Date Picker', icon: 'Calendar', description: 'Date selection' },
        { id: 'time-picker', name: 'Time Picker', icon: 'Clock', description: 'Time selection' },
        { id: 'file-upload', name: 'File Upload', icon: 'Upload', description: 'File attachment' },
        { id: 'signature', name: 'Signature', icon: 'PenTool', description: 'Digital signature' },
        { id: 'location', name: 'Location', icon: 'MapPin', description: 'GPS coordinates' }
      ]
    }
  ];

  const handleDragStart = (e, component) => {
    e?.dataTransfer?.setData('application/json', JSON.stringify(component));
    onDragStart(component);
  };

  if (isCollapsed) {
    return (
      <div id="component-library-collapsed" className="w-12 bg-card border-r border-border flex flex-col items-center py-4 space-y-4 component-library-collapsed">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-muted rounded-md survey-transition component-library-expand-button"
          title="Expand Component Library"
          id="component-library-expand-button"
        >
          <Icon name="ChevronRight" size={16} />
        </button>
        {componentCategories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => {
              setActiveCategory(category?.id);
              onToggleCollapse();
            }}
            className={`p-2 rounded-md survey-transition component-library-category-button-collapsed ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-text-secondary'
            }`}
            title={category?.name}
            id={`component-library-category-button-${category?.id}`}
          >
            <Icon name={category?.icon} size={16} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div id="component-library-expanded" className="w-64 bg-card border-r border-border flex flex-col h-full component-library-expanded">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Components</h2>
        <button
          onClick={onToggleCollapse}
          className="p-1 hover:bg-muted rounded-md survey-transition component-library-collapse-button"
          title="Collapse Panel"
          id="component-library-collapse-button"
        >
          <Icon name="ChevronLeft" size={16} />
        </button>
      </div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 p-3 border-b border-border">
        {componentCategories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setActiveCategory(category?.id)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium survey-transition component-library-category-tab ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:text-foreground hover:bg-muted'
            }`}
            id={`component-library-category-tab-${category?.id}`}
          >
            <Icon name={category?.icon} size={12} />
            <span className="hidden lg:inline">{category?.name}</span>
          </button>
        ))}
      </div>
      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {componentCategories?.find(cat => cat?.id === activeCategory)
          ?.components?.map((component) => (
            <div
              key={component?.id}
              draggable
              onDragStart={(e) => handleDragStart(e, component)}
              className="group p-3 bg-surface border border-border rounded-md hover:border-primary hover:bg-muted cursor-grab active:cursor-grabbing survey-transition"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 p-2 bg-background rounded-md group-hover:bg-primary group-hover:text-primary-foreground survey-transition">
                  <Icon name={component?.icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary survey-transition">
                    {component?.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {component?.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-text-secondary text-center">
          Drag components to canvas
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary;