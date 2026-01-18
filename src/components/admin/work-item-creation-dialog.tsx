'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { MarkdownToolbar } from '@/components/markdown/markdown-toolbar';
import { useMarkdownEditor } from '@/hooks/use-markdown-editor';
import ReactMarkdown from 'react-markdown';

interface WorkItemCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureRequest: {
    title: string;
    description: string;
  };
  integrationType: 'github' | 'azure-devops' | null;
  onConfirm: (data: {
    title: string;
    description: string;
    workItemType: string;
    tags: string[];
  }) => void;
}

export function WorkItemCreationDialog({
  open,
  onOpenChange,
  featureRequest,
  integrationType,
  onConfirm,
}: WorkItemCreationDialogProps) {
  const [title, setTitle] = useState(featureRequest.title);
  const [description, setDescription] = useState(featureRequest.description);
  const [workItemType, setWorkItemType] = useState('User Story');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const { textareaRef, handleInsert } = useMarkdownEditor(description, setDescription);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleConfirm = () => {
    onConfirm({
      title,
      description,
      workItemType,
      tags,
    });
  };

  const workItemTypes = integrationType === 'github'
    ? ['Issue', 'Bug', 'Feature Request', 'Task']
    : ['User Story', 'Bug', 'Feature', 'Task', 'Epic'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Item</DialogTitle>
          <DialogDescription>
            Review and customize the work item before creating it in{' '}
            {integrationType === 'github' ? 'GitHub' : 'Azure DevOps'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter work item title..."
            />
          </div>

          {/* Work Item Type */}
          <div className="space-y-2">
            <Label htmlFor="work-item-type">
              {integrationType === 'github' ? 'Issue Type' : 'Work Item Type'}
            </Label>
            <Select value={workItemType} onValueChange={setWorkItemType}>
              <SelectTrigger id="work-item-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workItemTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Description</Label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-2 py-1 rounded ${!showPreview ? 'bg-muted' : ''}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-2 py-1 rounded ${showPreview ? 'bg-muted' : ''}`}
                >
                  Preview
                </button>
              </div>
            </div>
            {!showPreview && (
              <MarkdownToolbar onInsert={handleInsert} />
            )}
            {showPreview ? (
              <div className="prose prose-sm max-w-none dark:prose-invert p-3 border rounded-md min-h-[200px]">
                {description ? (
                  <ReactMarkdown>{description}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground italic">Nothing to preview</p>
                )}
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="font-mono text-sm"
                placeholder="Enter description..."
              />
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              {integrationType === 'github' ? 'Labels' : 'Tags'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder={`Add ${integrationType === 'github' ? 'label' : 'tag'}...`}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                      aria-label={`Remove ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-brand-orange hover:bg-brand-orange/90">
            Create Work Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
