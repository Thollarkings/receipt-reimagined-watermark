
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Receipt } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { InvoiceFormComponent } from '@/components/invoice/InvoiceFormComponent';
import { ReceiptFormComponent } from '@/components/receipt/ReceiptFormComponent';

interface InvoiceFormProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onExportPDF }) => {
  const [documentType, setDocumentType] = useState<'invoice' | 'receipt'>('invoice');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Document Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={documentType === 'invoice' ? 'default' : 'outline'}
              onClick={() => setDocumentType('invoice')}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              Invoice
            </Button>
            <Button
              variant={documentType === 'receipt' ? 'default' : 'outline'}
              onClick={() => setDocumentType('receipt')}
              className="flex-1"
            >
              <Receipt className="mr-2 h-4 w-4" />
              Receipt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Render appropriate form based on document type */}
      {documentType === 'invoice' ? (
        <InvoiceFormComponent onExportPDF={onExportPDF} />
      ) : (
        <ReceiptFormComponent onExportPDF={onExportPDF} />
      )}
    </div>
  );
};
