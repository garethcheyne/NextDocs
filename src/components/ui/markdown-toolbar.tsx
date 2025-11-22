'use client';

import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link2, 
  Code, 
  Heading2,
  Quote,
  Minus
} from 'lucide-react';
import { Button } from './button';

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
}

export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const tools = [
    {
      icon: Bold,
      label: 'Bold',
      action: () => onInsert('**', '**', 'bold text'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => onInsert('*', '*', 'italic text'),
    },
    {
      icon: Heading2,
      label: 'Heading',
      action: () => onInsert('## ', '', 'Heading'),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => onInsert('- ', '', 'List item'),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => onInsert('1. ', '', 'List item'),
    },
    {
      icon: Link2,
      label: 'Link',
      action: () => onInsert('[', '](url)', 'link text'),
    },
    {
      icon: Code,
      label: 'Code',
      action: () => onInsert('`', '`', 'code'),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => onInsert('> ', '', 'Quote'),
    },
    {
      icon: Minus,
      label: 'Horizontal Line',
      action: () => onInsert('\n---\n', '', ''),
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/50">
      {tools.map((tool) => (
        <Button
          key={tool.label}
          type="button"
          variant="ghost"
          size="sm"
          onClick={tool.action}
          title={tool.label}
          className="h-8 w-8 p-0"
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
      <div className="ml-auto flex items-center">
        <span className="text-xs text-muted-foreground">Formatting tools</span>
      </div>
    </div>
  );
}
