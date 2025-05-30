
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NotesSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  formData: any;
  onFieldChange: (field: string, value: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  isOpen,
  onToggle,
  formData,
  onFieldChange,
}) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <CardTitle className="flex items-center justify-between">
              Notes & Terms
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => onFieldChange('notes', e.target.value)}
                placeholder="Additional notes or comments"
                rows={3}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => onFieldChange('terms', e.target.value)}
                placeholder="Payment terms and conditions"
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
