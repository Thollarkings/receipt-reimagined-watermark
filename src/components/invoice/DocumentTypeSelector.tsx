
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Receipt } from 'lucide-react';

interface DocumentTypeSelectorProps {
  type: 'invoice' | 'receipt';
  onTypeChange: (type: 'invoice' | 'receipt') => void;
}

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  type,
  onTypeChange,
}) => {
  return (
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
            variant={type === 'invoice' ? 'default' : 'outline'}
            onClick={() => onTypeChange('invoice')}
            className="flex-1"
          >
            <FileText className="mr-2 h-4 w-4" />
            Invoice
          </Button>
          <Button
            variant={type === 'receipt' ? 'default' : 'outline'}
            onClick={() => onTypeChange('receipt')}
            className="flex-1"
          >
            <Receipt className="mr-2 h-4 w-4" />
            Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
