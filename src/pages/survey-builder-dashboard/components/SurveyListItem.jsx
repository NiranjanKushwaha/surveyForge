import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SurveyListItem = ({ survey, onDuplicate, onArchive, onExport, isSelected, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-success text-success-foreground';
      case 'draft':
        return 'bg-warning text-warning-foreground';
      case 'closed':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:survey-shadow-lg survey-transition">
      <div className="flex items-center space-x-4">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(survey?.id, e?.target?.checked)}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
        />

        {/* Survey Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {survey?.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey?.status)}`}>
              {survey?.status?.charAt(0)?.toUpperCase() + survey?.status?.slice(1)}
            </span>
          </div>
          
          <p className="text-sm text-text-secondary mb-2 line-clamp-1">
            {survey?.description}
          </p>

          <div className="flex items-center space-x-6 text-sm text-text-secondary">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={14} />
              <span>{survey?.responses} responses</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>Created {formatDate(survey?.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="BarChart3" size={14} />
              <span>{survey?.completionRate}% completion</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Link to="/visual-survey-builder">
            <Button variant="default" size="sm">
              <Icon name="Edit" size={14} className="mr-2" />
              Edit
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(survey?.id)}
          >
            <Icon name="Copy" size={14} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExport(survey?.id)}
          >
            <Icon name="Download" size={14} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArchive(survey?.id)}
            className="text-error hover:text-error"
          >
            <Icon name="Archive" size={14} />
          </Button>

          {survey?.status === 'published' && (
            <Button variant="outline" size="sm">
              <Icon name="ExternalLink" size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyListItem;