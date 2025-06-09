
import React from 'react';
import { Loader2 } from 'lucide-react';
import { BusinessInfoSection } from './BusinessInfoSection';
import { ClientInfoSection } from './ClientInfoSection';
import { DocumentDetailsSection } from './DocumentDetailsSection';
import { ItemsSection } from './ItemsSection';
import { NotesSection } from './NotesSection';
import { InvoiceActions } from './InvoiceActions';
import { InvoiceFormProvider } from './InvoiceFormProvider';
import { InvoiceData } from '@/types/invoice';

interface InvoiceFormComponentProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange: (data: InvoiceData) => void;
  colorScheme: string;
}

export const InvoiceFormComponent: React.FC<InvoiceFormComponentProps> = ({
  onExportPDF,
  onDataChange,
  colorScheme
}) => {
  return (
    <InvoiceFormProvider
      onExportPDF={onExportPDF}
      onDataChange={onDataChange}
      colorScheme={colorScheme}
      documentType="invoice"
    >
      {({
        invoiceData,
        clientEmail,
        loading,
        isSending,
        handleBusinessInfoChange,
        handleClientInfoChange,
        handleDocumentDetailsChange,
        handleCurrencyChange,
        addItem,
        removeItem,
        updateItem,
        handleNotesChange,
        handleTermsChange,
        handleExportPDF,
        handleSendEmail,
        setClientEmail,
      }) => {
        if (loading) {
          return (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <BusinessInfoSection
              isOpen={true}
              onToggle={() => {}}
              formData={invoiceData}
              onFieldChange={handleBusinessInfoChange}
              onLogoUpload={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    handleBusinessInfoChange('businessLogo', result);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />

            <ClientInfoSection
              isOpen={true}
              onToggle={() => {}}
              formData={invoiceData}
              onFieldChange={handleClientInfoChange}
            />

            <DocumentDetailsSection
              isOpen={true}
              onToggle={() => {}}
              formData={invoiceData}
              onFieldChange={handleDocumentDetailsChange}
              onCurrencyChange={handleCurrencyChange}
            />

            <ItemsSection
              isOpen={true}
              onToggle={() => {}}
              items={invoiceData.items}
              onAddItem={addItem}
              onRemoveItem={removeItem}
              onUpdateItem={updateItem}
            />

            <NotesSection
              notes={invoiceData.notes}
              onNotesChange={handleNotesChange}
            />

            <NotesSection
              title="Terms & Conditions"
              notes={invoiceData.terms}
              onNotesChange={handleTermsChange}
            />

            <InvoiceActions
              documentType="invoice"
              clientEmail={clientEmail}
              onEmailChange={setClientEmail}
              onSendEmail={handleSendEmail}
              onExportPDF={handleExportPDF}
              isSending={isSending}
            />
          </div>
        );
      }}
    </InvoiceFormProvider>
  );
};
