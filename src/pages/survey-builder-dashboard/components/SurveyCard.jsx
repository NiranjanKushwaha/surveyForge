import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SurveyCard = ({ survey, onDuplicate, onArchive, onExport, isSelected, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

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
    <div 
      className="bg-card border border-border rounded-lg survey-shadow hover:survey-shadow-lg survey-transition relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(survey?.id, e?.target?.checked)}
          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
        />
      </div>
      {/* Survey Thumbnail */}
      <div className="relative h-32 bg-muted rounded-t-lg overflow-hidden">
        <Image
          src={survey?.thumbnail}
          alt={`${survey?.title} thumbnail`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(survey?.status)}`}>
            {survey?.status?.charAt(0)?.toUpperCase() + survey?.status?.slice(1)}
          </span>
        </div>
      </div>
      {/* Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 flex-1 mr-2">
            {survey?.title}
          </h3>
        </div>

        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {survey?.description}
        </p>

        {/* Survey Stats */}
        <div className="flex items-center justify-between text-sm text-text-secondary mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={14} />
              <span>{survey?.responses}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>{formatDate(survey?.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="BarChart3" size={14} />
            <span>{survey?.completionRate}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Link to={`/visual-survey-builder/${survey?.id}`} className="flex-1 mr-2">
            <Button variant="default" size="sm" className="w-full">
              <Icon name="Edit" size={14} className="mr-2" />
              Edit
            </Button>
          </Link>
          
          {survey?.status === 'published' && (
            <Button variant="outline" size="sm">
              <Icon name="ExternalLink" size={14} />
            </Button>
          )}
        </div>
      </div>
      {/* Hover Actions */}
      {isHovered && (
        <div className="absolute top-3 right-3 flex items-center space-x-1 bg-background border border-border rounded-md survey-shadow p-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDuplicate(survey?.id)}
            className="h-8 w-8 p-0"
          >
            <Icon name="Copy" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onExport(survey?.id)}
            className="h-8 w-8 p-0"
          >
            <Icon name="Download" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onArchive(survey?.id)}
            className="h-8 w-8 p-0 text-error hover:text-error"
          >
            <Icon name="Archive" size={14} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default SurveyCard;