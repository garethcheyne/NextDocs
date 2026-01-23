'use client';

import { useState, useEffect } from 'react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatusBadge } from '@/components/badges/status-badge';
import { X, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CustomField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'select' | 'multiline';
  options?: string[];
  defaultValue?: any;
  required?: boolean;
}

interface WorkItemCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureRequest: {
    id: string;
    title: string;
    description: string;
    featureNumber?: string;  // Feature request number (e.g., "FR-123") for TheHive field
    createdByEmail?: string; // Creator email for Requestor field
    status?: string; // Feature request status
  };
  integrationType: 'github' | 'azure-devops' | null;
  categoryId?: string;
  onConfirm: (data: {
    title: string;
    description: string;
    workItemType: string;
    tags: string[];
    customFields: Record<string, any>;
  }) => void;
}

export function WorkItemCreationDialog({
  open,
  onOpenChange,
  featureRequest,
  integrationType,
  categoryId,
  onConfirm,
}: WorkItemCreationDialogProps) {
  const [title, setTitle] = useState(featureRequest.title);
  const [description, setDescription] = useState(featureRequest.description);
  const [workItemType, setWorkItemType] = useState('User Story');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [availableCustomFields, setAvailableCustomFields] = useState<CustomField[]>([]);
  const [showCustomFields, setShowCustomFields] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);

  // Load custom fields when dialog opens and Azure DevOps is selected
  useEffect(() => {
    if (open && integrationType === 'azure-devops' && categoryId) {
      loadCustomFields();
    }
  }, [open, integrationType, categoryId, workItemType]);

  const loadCustomFields = async () => {
    setIsLoadingFields(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/custom-fields?workItemType=${workItemType}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableCustomFields(data.fields || []);
        // Initialize custom fields with default values and auto-populated values
        const defaults: Record<string, any> = {};
        data.fields?.forEach((field: CustomField) => {
          if (field.defaultValue !== undefined) {
            defaults[field.name] = field.defaultValue;
          }
        });
        
        // Auto-populate Custom.Requestor with creator email
        if (featureRequest.createdByEmail) {
          defaults['Custom.Requestor'] = featureRequest.createdByEmail;
        }
        
        // Auto-populate Custom.TheHive with feature request number or ID
        if (featureRequest.featureNumber) {
          defaults['Custom.TheHive'] = featureRequest.featureNumber;
        } else if (featureRequest.id) {
          defaults['Custom.TheHive'] = featureRequest.id;
        }
        
        setCustomFields(defaults);
      }
    } catch (error) {
      console.error('Failed to load custom fields:', error);
    } finally {
      setIsLoadingFields(false);
    }
  };

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

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFields(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleConfirm = () => {
    onConfirm({
      title,
      description,
      workItemType,
      tags,
      customFields,
    });
  };

  const workItemTypes = integrationType === 'github'
    ? ['Issue', 'Bug', 'Feature Request', 'Task']
    : ['User Story', 'Bug', 'Feature', 'Task', 'Epic', 'Issue'];

  const renderCustomField = (field: CustomField) => {
    const value = customFields[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(val) => handleCustomFieldChange(field.name, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'multiline':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
          />
        );
      
      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        );
    }
  };

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

        {featureRequest.status && featureRequest.status.toUpperCase() !== 'APPROVED' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Status Requirement</AlertTitle>
            <AlertDescription>
              Feature request must be <strong>approved</strong> before creating a work item.
              Current status: <StatusBadge status={featureRequest.status || ''} className="ml-1" />
            </AlertDescription>
          </Alert>
        )}

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
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Enter description..."
              className="min-h-[200px]"
            />
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

          {/* Custom Fields - Azure DevOps only */}
          {integrationType === 'azure-devops' && availableCustomFields.length > 0 && (
            <Collapsible open={showCustomFields} onOpenChange={setShowCustomFields}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between" type="button">
                  <span>Custom Fields ({availableCustomFields.length})</span>
                  {showCustomFields ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t">
                {isLoadingFields ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Loading custom fields...</p>
                ) : (
                  availableCustomFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderCustomField(field)}
                    </div>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-brand-orange hover:bg-brand-orange/90"
            disabled={!!featureRequest.status && featureRequest.status.toUpperCase() !== 'APPROVED'}
          >
            Create Work Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
