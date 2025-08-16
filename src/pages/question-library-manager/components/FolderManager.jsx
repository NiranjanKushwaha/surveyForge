import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const FolderManager = ({ folders, activeFolder, onFolderSelect }) => {
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set(['all']));

  const handleCreateFolder = () => {
    if (newFolderName?.trim()) {
      // In a real app, this would call an API to create the folder
      console.log('Creating folder:', newFolderName?.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const toggleExpanded = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded?.has(folderId)) {
      newExpanded?.delete(folderId);
    } else {
      newExpanded?.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Folders</h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsCreatingFolder(true)}
          title="Create new folder"
        >
          <Icon name="FolderPlus" size={14} />
        </Button>
      </div>
      <div className="space-y-1">
        {folders?.map((folder) => (
          <div key={folder?.id}>
            <button
              onClick={() => onFolderSelect?.(folder?.id)}
              className={`w-full flex items-center justify-between px-2 py-2 rounded-md text-sm survey-transition ${
                activeFolder === folder?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center space-x-2 flex-1">
                <Icon
                  name={folder?.id === 'all' ? 'Folder' : 'Folder'}
                  size={14}
                />
                <span className="truncate">{folder?.name}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFolder === folder?.id
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-text-secondary'
              }`}>
                {folder?.count}
              </span>
            </button>
          </div>
        ))}

        {/* Create Folder Form */}
        {isCreatingFolder && (
          <div className="px-2 py-2 space-y-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e?.target?.value)}
              onKeyPress={(e) => e?.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="xs"
                onClick={handleCreateFolder}
                disabled={!newFolderName?.trim()}
              >
                <Icon name="Check" size={12} className="mr-1" />
                Create
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                }}
              >
                <Icon name="X" size={12} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderManager;