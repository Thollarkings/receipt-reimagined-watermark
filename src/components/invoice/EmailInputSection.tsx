
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

interface EmailInputSectionProps {
  email: string;
  onEmailChange: (email: string) => void;
  placeholder?: string;
}

export const EmailInputSection: React.FC<EmailInputSectionProps> = ({
  email,
  onEmailChange,
  placeholder = "Enter client's email address"
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="client-email" className="text-sm font-medium flex items-center gap-2">
        <Mail className="h-4 w-4" />
        Client Email
      </Label>
      <Input
        id="client-email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
};
