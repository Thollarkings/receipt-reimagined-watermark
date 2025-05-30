
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ClientInfoSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  formData: any;
  onFieldChange: (field: string, value: string) => void;
}

export const ClientInfoSection: React.FC<ClientInfoSectionProps> = ({
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
              Client Information
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => onFieldChange('name', e.target.value)}
                placeholder="Client Name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea
                id="clientAddress"
                value={formData.clientAddress}
                onChange={(e) => onFieldChange('address', e.target.value)}
                placeholder="Client Address"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={formData.clientPhone}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  placeholder="Phone Number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  placeholder="client@example.com"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
