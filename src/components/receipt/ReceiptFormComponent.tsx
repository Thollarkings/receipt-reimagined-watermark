
import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessInfoSection } from '../invoice/BusinessInfoSection';
import { ClientInfoSection } from '../invoice/ClientInfoSection';
import { DocumentDetailsSection } from '../invoice/DocumentDetailsSection';
import { DocumentCustomization } from '../invoice/DocumentCustomization';
import { ItemsSection } from '../invoice/ItemsSection';
import { NotesSection } from '../invoice/NotesSection';
import { InvoiceActions } from '../invoice/InvoiceActions';
import { InvoiceFormProvider } from '../invoice/InvoiceFormProvider';
import { InvoiceData } from '@/types/invoice';
import { TabsCustom, TabsListCustom, TabsTriggerCustom, TabsContentCustom } from '@/components/ui/tabs-custom';

interface ReceiptFormComponentProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange: (data: InvoiceData) => void;
  colorScheme: string;
  onColorSchemeChange: (scheme: string) => void;
  darkMode: boolean;
  onDarkModeChange: (dark: boolean) => void;
  watermarkColor: string;
  onWatermarkColorChange: (color: string) => void;
  watermarkOpacity: number;
  onWatermarkOpacityChange: (opacity: number) => void;
  watermarkDensity: number;
  onWatermarkDensityChange: (density: number) => void;
  watermarkEnabled: boolean;
  onWatermarkEnabledChange: (enabled: boolean) => void;
  historyData?: InvoiceData | null;
  onNewDocument: () => void;
}

export const ReceiptFormComponent: React.FC<ReceiptFormComponentProps> = ({
  onExportPDF,
  onDataChange,
  colorScheme,
  onColorSchemeChange,
  darkMode,
  onDarkModeChange,
  watermarkColor,
  onWatermarkColorChange,
  watermarkOpacity,
  onWatermarkOpacityChange,
  watermarkDensity,
  onWatermarkDensityChange,
  watermarkEnabled,
  onWatermarkEnabledChange,
  historyData,
  onNewDocument
}) => {
  return (
    <InvoiceFormProvider
      onExportPDF={onExportPDF}
      onDataChange={onDataChange}
      colorScheme={colorScheme}
      documentType="receipt"
      historyData={historyData}
    >
      {({
        invoiceData,
        clientEmail,
        loading,
        isSending,
        saving,
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
            {historyData && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Editing: {historyData.type?.toUpperCase()} #{historyData.invoiceNumber}
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Make changes below to update this document
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onNewDocument}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Receipt
                  </Button>
                </div>
              </div>
            )}

            <TabsCustom defaultValue="customization">
              <TabsListCustom twoRows={true}>
                <TabsTriggerCustom value="customization">Customization</TabsTriggerCustom>
                <TabsTriggerCustom value="business">Business Info</TabsTriggerCustom>
                <TabsTriggerCustom value="client">Client Info</TabsTriggerCustom>
                <TabsTriggerCustom value="document">Receipt Details</TabsTriggerCustom>
                <TabsTriggerCustom value="items">Items</TabsTriggerCustom>
                <TabsTriggerCustom value="notes">Notes</TabsTriggerCustom>
                <TabsTriggerCustom value="terms">Terms</TabsTriggerCustom>
                <TabsTriggerCustom value="actions">Send & Export</TabsTriggerCustom>
              </TabsListCustom>

              <TabsContentCustom value="customization">
                <DocumentCustomization
                  documentType="receipt"
                  colorScheme={colorScheme}
                  onColorSchemeChange={onColorSchemeChange}
                  darkMode={darkMode}
                  onDarkModeChange={onDarkModeChange}
                  watermarkEnabled={watermarkEnabled}
                  onWatermarkEnabledChange={onWatermarkEnabledChange}
                  watermarkColor={watermarkColor}
                  onWatermarkColorChange={onWatermarkColorChange}
                  watermarkOpacity={watermarkOpacity}
                  onWatermarkOpacityChange={onWatermarkOpacityChange}
                  watermarkDensity={watermarkDensity}
                  onWatermarkDensityChange={onWatermarkDensityChange}
                />
              </TabsContentCustom>

              <TabsContentCustom value="business">
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
              </TabsContentCustom>

              <TabsContentCustom value="client">
                <ClientInfoSection
                  isOpen={true}
                  onToggle={() => {}}
                  formData={invoiceData}
                  onFieldChange={handleClientInfoChange}
                />
              </TabsContentCustom>

              <TabsContentCustom value="document">
                <DocumentDetailsSection
                  isOpen={true}
                  onToggle={() => {}}
                  formData={invoiceData}
                  onFieldChange={handleDocumentDetailsChange}
                  onCurrencyChange={handleCurrencyChange}
                />
              </TabsContentCustom>

              <TabsContentCustom value="items">
                <ItemsSection
                  isOpen={true}
                  onToggle={() => {}}
                  items={invoiceData.items}
                  onAddItem={addItem}
                  onRemoveItem={removeItem}
                  onUpdateItem={updateItem}
                />
              </TabsContentCustom>

              <TabsContentCustom value="notes">
                <NotesSection
                  title="Notes"
                  notes={invoiceData.notes}
                  onNotesChange={handleNotesChange}
                  isOpen={true}
                  onToggle={() => {}}
                />
              </TabsContentCustom>

              <TabsContentCustom value="terms">
                <NotesSection
                  title="Terms & Conditions"
                  notes={invoiceData.terms}
                  onNotesChange={handleTermsChange}
                  isOpen={true}
                  onToggle={() => {}}
                />
              </TabsContentCustom>

              <TabsContentCustom value="actions">
                <InvoiceActions
                  documentType="receipt"
                  clientEmail={clientEmail}
                  onEmailChange={setClientEmail}
                  onSendEmail={handleSendEmail}
                  onExportPDF={handleExportPDF}
                  isSending={isSending || saving}
                />
              </TabsContentCustom>
            </TabsCustom>
          </div>
        );
      }}
    </InvoiceFormProvider>
  );
};
