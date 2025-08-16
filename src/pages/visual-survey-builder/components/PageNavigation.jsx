import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PageNavigation = ({ 
  pages, 
  currentPageId, 
  onPageSelect, 
  onPageAdd, 
  onPageDelete, 
  onPageRename,
  onPageReorder 
}) => {
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [editingPageId, setEditingPageId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const handleAddPage = () => {
    if (newPageName?.trim()) {
      onPageAdd(newPageName?.trim());
      setNewPageName('');
      setIsAddingPage(false);
    }
  };

  const handleRename = (pageId) => {
    if (editingName?.trim()) {
      onPageRename(pageId, editingName?.trim());
      setEditingPageId(null);
      setEditingName('');
    }
  };

  const startRename = (page) => {
    setEditingPageId(page?.id);
    setEditingName(page?.name);
  };

  const cancelRename = () => {
    setEditingPageId(null);
    setEditingName('');
  };

  const getCurrentPageIndex = () => {
    return pages?.findIndex(page => page?.id === currentPageId);
  };

  const currentIndex = getCurrentPageIndex();
  const totalPages = pages?.length;

  return (
    <div className="bg-card border-t border-border">
      {/* Progress Indicator */}
      <div className="px-6 py-2 border-b border-border">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Page {currentIndex + 1} of {totalPages}</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary survey-transition"
                style={{ width: `${((currentIndex + 1) / totalPages) * 100}%` }}
              />
            </div>
            <span>{Math.round(((currentIndex + 1) / totalPages) * 100)}%</span>
          </div>
        </div>
      </div>
      {/* Page Tabs */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2 overflow-x-auto flex-1">
          {pages?.map((page, index) => (
            <div
              key={page?.id}
              className={`group relative flex items-center space-x-2 px-3 py-2 rounded-md border survey-transition cursor-pointer ${
                currentPageId === page?.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-surface border-border hover:border-primary hover:bg-muted'
              }`}
              onClick={() => onPageSelect(page?.id)}
            >
              {/* Page Icon */}
              <Icon 
                name="FileText" 
                size={14} 
                color={currentPageId === page?.id ? 'white' : 'var(--color-text-secondary)'} 
              />

              {/* Page Name */}
              {editingPageId === page?.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e?.target?.value)}
                  onBlur={() => handleRename(page?.id)}
                  onKeyDown={(e) => {
                    if (e?.key === 'Enter') handleRename(page?.id);
                    if (e?.key === 'Escape') cancelRename();
                  }}
                  className="bg-transparent border-none outline-none text-sm font-medium min-w-0 w-20"
                  autoFocus
                  onClick={(e) => e?.stopPropagation()}
                />
              ) : (
                <span className="text-sm font-medium truncate max-w-24">
                  {page?.name}
                </span>
              )}

              {/* Question Count */}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                currentPageId === page?.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-text-secondary'
              }`}>
                {page?.questionCount || 0}
              </span>

              {/* Page Actions */}
              {currentPageId === page?.id && (
                <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 survey-transition">
                  <div className="flex items-center space-x-1 bg-card border border-border rounded-md p-1 survey-shadow">
                    <button
                      onClick={(e) => {
                        e?.stopPropagation();
                        startRename(page);
                      }}
                      className="p-1 hover:bg-muted rounded text-text-secondary hover:text-foreground survey-transition"
                      title="Rename Page"
                    >
                      <Icon name="Edit2" size={10} />
                    </button>
                    {pages?.length > 1 && (
                      <button
                        onClick={(e) => {
                          e?.stopPropagation();
                          onPageDelete(page?.id);
                        }}
                        className="p-1 hover:bg-error/10 hover:text-error rounded survey-transition"
                        title="Delete Page"
                      >
                        <Icon name="Trash2" size={10} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add New Page */}
          {isAddingPage ? (
            <div className="flex items-center space-x-2 px-3 py-2 bg-surface border border-border rounded-md">
              <Icon name="FileText" size={14} color="var(--color-text-secondary)" />
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e?.target?.value)}
                onBlur={handleAddPage}
                onKeyDown={(e) => {
                  if (e?.key === 'Enter') handleAddPage();
                  if (e?.key === 'Escape') {
                    setIsAddingPage(false);
                    setNewPageName('');
                  }
                }}
                placeholder="Page name..."
                className="bg-transparent border-none outline-none text-sm font-medium w-24"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setIsAddingPage(true)}
              className="flex items-center space-x-2 px-3 py-2 text-text-secondary hover:text-foreground hover:bg-muted border border-dashed border-border hover:border-primary rounded-md survey-transition"
              title="Add New Page"
            >
              <Icon name="Plus" size={14} />
              <span className="text-sm font-medium">Add Page</span>
            </button>
          )}
        </div>

        {/* Page Navigation Controls */}
        <div className="flex items-center space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const prevIndex = Math.max(0, currentIndex - 1);
              onPageSelect(pages?.[prevIndex]?.id);
            }}
            disabled={currentIndex === 0}
            iconName="ChevronLeft"
            title="Previous Page"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const nextIndex = Math.min(pages?.length - 1, currentIndex + 1);
              onPageSelect(pages?.[nextIndex]?.id);
            }}
            disabled={currentIndex === pages?.length - 1}
            iconName="ChevronRight"
            title="Next Page"
          />
        </div>
      </div>
    </div>
  );
};

export default PageNavigation;