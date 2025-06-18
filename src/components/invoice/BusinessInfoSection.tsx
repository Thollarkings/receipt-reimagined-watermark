import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BusinessInfoSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  formData: any;
  onFieldChange: (field: string, value: string) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BusinessInfoSection: React.FC<BusinessInfoSectionProps> = ({
  isOpen,
  onToggle,
  formData,
  onFieldChange,
  onLogoUpload,
}) => {
  const content = (
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => onFieldChange('businessName', e.target.value)}
          placeholder="Your Business Name"
          className="mt-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div>
        <Label htmlFor="businessLogo">Business Logo</Label>
        <div className="flex items-center gap-3 mt-1">
          <Input
            id="businessLogo"
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {formData.businessLogo && (
            <img src={formData.businessLogo} alt="Logo" className="h-12 w-12 object-contain border rounded" />
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="businessAddress">Business Address</Label>
        <Textarea
          id="businessAddress"
          value={formData.businessAddress}
          onChange={(e) => onFieldChange('businessAddress', e.target.value)}
          placeholder="Your business address"
          rows={3}
          className="mt-1 bg-gray-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="businessPhone">Phone</Label>
          <Input
            id="businessPhone"
            value={formData.businessPhone}
            onChange={(e) => onFieldChange('businessPhone', e.target.value)}
            placeholder="Phone Number"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="businessEmail">Email</Label>
          <Input
            id="businessEmail"
            type="email"
            value={formData.businessEmail}
            onChange={(e) => onFieldChange('businessEmail', e.target.value)}
            placeholder="business@example.com"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="businessWebsite">Website</Label>
        <Input
          id="businessWebsite"
          value={formData.businessWebsite}
          onChange={(e) => onFieldChange('businessWebsite', e.target.value)}
          placeholder="https://yourwebsite.com"
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
          <CardTitle>Business Information</CardTitle>
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
              Business Information
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
