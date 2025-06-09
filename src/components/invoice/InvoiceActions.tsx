
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Mail, Loader2 } from 'lucide-react';
import { EmailInputSection } from './EmailInputSection';
import { InvoiceData } from '@/types/invoice';

interface InvoiceActionsProps {
  documentType: 'invoice' | 'receipt';
  clientEmail: string;
  onEmailChange: (email: string) => void;
  onSendEmail: () => void;
  onExportPDF: () => void;
  isSending: boolean;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  documentType,
  clientEmail,
  onEmailChange,
  onSendEmail,
  onExportPDF,
  isSending,
}) => {
  const title = documentType === 'invoice' ? 'Invoice Details' : 'Receipt Details';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-card border border-border rounded-lg">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="flex-1 sm:w-64">
          <EmailInputSection
            email={clientEmail}
            onEmailChange={onEmailChange}
            placeholder="Enter client's email address"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={onSendEmail}
            disabled={isSending || !clientEmail.trim()}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send to Client
              </>
            )}
          </Button>
          <Button onClick={onExportPDF} className="gap-2 bg-secondary hover:bg-secondary/80">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
