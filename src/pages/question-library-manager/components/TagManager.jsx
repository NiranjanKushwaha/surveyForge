import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const TagManager = ({ onApplyTag }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [newTag, setNewTag] = useState('');

  const commonTags = [
    'satisfaction', 'feedback', 'product', 'service', 'quality',
    'experience', 'recommendation', 'demographic', 'contact',
    'preference', 'behavior', 'opinion', 'rating', 'evaluation'
  ];

  const handleApplyTag = (tag) => {
    onApplyTag?.(tag);
    setShowDropdown(false);
  };

  const handleCreateAndApplyTag = () => {
    if (newTag?.trim()) {
      onApplyTag?.(newTag?.trim());
      setNewTag('');
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Icon name="Tag" size={14} className="mr-1" />
        Add Tags
      </Button>
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg survey-shadow-lg z-1010">
          <div className="p-3">
            <div className="mb-3">
              <p className="text-sm font-medium text-foreground mb-2">Add New Tag</p>
              <div className="flex space-x-2">
                <Input
                  placeholder="Tag name"
                  value={newTag}
                  onChange={(e) => setNewTag(e?.target?.value)}
                  onKeyPress={(e) => e?.key === 'Enter' && handleCreateAndApplyTag()}
                  size="sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateAndApplyTag}
                  disabled={!newTag?.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium text-foreground mb-2">Common Tags</p>
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                {commonTags?.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleApplyTag(tag)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted hover:bg-secondary hover:text-secondary-foreground survey-transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Overlay */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-999"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default TagManager;