import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Checkbox from '../../../components/ui/Checkbox';

const QuestionCard = ({ question, isSelected, onSelect, onEdit, onDelete, onDuplicate }) => {
  const getTypeIcon = (type) => {
    const iconMap = {
      rating: 'Star',
      radio: 'Circle',
      checkbox: 'CheckSquare',
      textarea: 'Type',
      email: 'Mail',
      select: 'ChevronDown'
    };
    return iconMap?.[type] || 'HelpCircle';
  };

  const getTypeLabel = (type) => {
    const labelMap = {
      rating: 'Rating Scale',
      radio: 'Multiple Choice',
      checkbox: 'Checkbox',
      textarea: 'Text Area',
      email: 'Email',
      select: 'Dropdown'
    };
    return labelMap?.[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 survey-transition hover:border-primary group ${
      isSelected ? 'bg-primary/5 border-primary' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <Checkbox
            checked={isSelected}
            onChange={(checked) => onSelect?.(question?.id, checked)}
          />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center">
              <Icon name={getTypeIcon(question?.type)} size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {question?.title}
              </h4>
              <p className="text-xs text-text-secondary">
                {getTypeLabel(question?.type)}
              </p>
            </div>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 survey-transition">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="xs"
              onClick={onEdit}
              title="Edit question"
            >
              <Icon name="Edit2" size={12} />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={onDuplicate}
              title="Duplicate question"
            >
              <Icon name="Copy" size={12} />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={onDelete}
              title="Delete question"
            >
              <Icon name="Trash2" size={12} />
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-text-secondary line-clamp-2">
          {question?.description}
        </p>
      </div>

      {/* Tags */}
      {question?.tags && question?.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {question?.tags?.slice(0, 3)?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-secondary/20 text-secondary"
            >
              {tag}
            </span>
          ))}
          {question?.tags?.length > 3 && (
            <span className="text-xs text-text-secondary">
              +{question?.tags?.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Icon name="BarChart3" size={10} />
            <span>{question?.usageCount} uses</span>
          </span>
          <span className="flex items-center space-x-1">
            <Icon name="Clock" size={10} />
            <span>{formatDate(question?.lastUsed || question?.createdAt)}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${
            question?.usageCount > 50 ? 'bg-success' :
            question?.usageCount > 20 ? 'bg-warning': 'bg-muted'
          }`} />
          <span className="capitalize">{question?.category}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;