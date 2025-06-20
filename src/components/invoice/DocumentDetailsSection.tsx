import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { currencies } from '@/lib/currencies';

interface DocumentDetailsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  formData: any;
  onFieldChange: (field: string, value: string | number) => void;
  onCurrencyChange: (value: string) => void;
}

export const DocumentDetailsSection: React.FC<DocumentDetailsSectionProps> = ({
  isOpen,
  onToggle,
  formData,
  onFieldChange,
  onCurrencyChange,
}) => {
  const isReceipt = formData.type === 'receipt';
  const documentTitle = isReceipt ? 'Receipt Details' : 'Invoice Details';

  const content = (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="invoiceNumber">
            {isReceipt ? 'Receipt Number' : 'Invoice Number'}
          </Label>
          <Input
            id="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={(e) => onFieldChange('invoiceNumber', e.target.value)}
            placeholder={isReceipt ? 'REC-001' : 'INV-001'}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="invoiceDate">
            {isReceipt ? 'Receipt Date' : 'Invoice Date'}
          </Label>
          <Input
            id="invoiceDate"
            type="date"
            value={formData.invoiceDate}
            onChange={(e) => onFieldChange('invoiceDate', e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isReceipt && (
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => onFieldChange('dueDate', e.target.value)}
              className="mt-1"
            />
          </div>
        )}
        
        {isReceipt && (
          <>
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => onFieldChange('paymentDate', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Input
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => onFieldChange('paymentMethod', e.target.value)}
                placeholder="Credit Card, Cash, etc."
                className="mt-1"
              />
            </div>
          </>
        )}
        
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={onCurrencyChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isReceipt && (
        <div>
          <Label htmlFor="amountPaid">Amount Paid</Label>
          <Input
            id="amountPaid"
            type="number"
            value={formData.amountPaid}
            onChange={(e) => onFieldChange('amountPaid', Number(e.target.value))}
            placeholder="Amount Paid"
            className="mt-1"
            step="0.01"
            min="0"
          />
        </div>
      )}
    </CardContent>
  );

  // If used in tabs (isOpen is always true), render without collapsible
  if (isOpen && onToggle.toString() === '() => {}') {
    return (
      <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
        <CardHeader>
          <CardTitle>{documentTitle}</CardTitle>
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
              {documentTitle}
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
