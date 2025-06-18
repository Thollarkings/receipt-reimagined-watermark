import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NotesSectionProps {
  title?: string;
  notes: string;
  onNotesChange: (value: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  title = "Notes",
  notes,
  onNotesChange,
  isOpen = true,
  onToggle = () => {},
}) => {
  const content = (
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor={title.toLowerCase().replace(/\s+/g, '-')}>
          {title === "Terms & Conditions" ? "Terms & Conditions" : "Notes"}
        </Label>
        <Textarea
          id={title.toLowerCase().replace(/\s+/g, '-')}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder={title === "Terms & Conditions" ? "Payment terms and conditions" : "Additional notes or comments"}
          rows={3}
          className="mt-1"
        />
      </div>
    </CardContent>
  );

  // If used in tabs (isOpen is always true), render without collapsible
  if (isOpen && onToggle.toString() === '() => {}') {
    return (
      <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        {content}
      </Card>
    );
  }

  // Otherwise, render with collapsible functionality
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <CardTitle className="flex items-center justify-between">
              {title}
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {content}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
