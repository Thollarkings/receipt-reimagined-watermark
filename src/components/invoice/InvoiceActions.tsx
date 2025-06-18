
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
  isSending
}) => {
  const title = documentType === 'invoice' ? 'Send & Export' : 'Send & Export';
  
  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
      
      <div className="space-y-4">
        {/* Email Section */}
        <div>
          <EmailInputSection 
            email={clientEmail} 
            onEmailChange={onEmailChange} 
            placeholder="Enter client's email address" 
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={onSendEmail} 
            disabled={isSending || !clientEmail.trim()} 
            className="gap-2 bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Open Email App
              </>
            )}
          </Button>
          
          <Button 
            onClick={onExportPDF} 
            className="gap-2 bg-black hover:bg-black/80 text-white flex-1 sm:flex-none"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
