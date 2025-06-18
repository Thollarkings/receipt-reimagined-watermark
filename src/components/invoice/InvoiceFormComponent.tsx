
import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BusinessInfoSection } from './BusinessInfoSection';
import { ClientInfoSection } from './ClientInfoSection';
import { DocumentDetailsSection } from './DocumentDetailsSection';
import { DocumentCustomization } from './DocumentCustomization';
import { ItemsSection } from './ItemsSection';
import { NotesSection } from './NotesSection';
import { InvoiceActions } from './InvoiceActions';
import { InvoiceFormProvider } from './InvoiceFormProvider';
import { InvoiceData } from '@/types/invoice';
import { TabsCustom, TabsListCustom, TabsTriggerCustom, TabsContentCustom } from '@/components/ui/tabs-custom';

interface InvoiceFormComponentProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange: (data: InvoiceData) => void;
  colorScheme: string;
  onColorSchemeChange: (scheme: string) => void;
  darkMode: boolean;
  onDarkModeChange: (dark: boolean) => void;
  watermarkEnabled: boolean;
  onWatermarkEnabledChange: (enabled: boolean) => void;
  watermarkColor: string;
  onWatermarkColorChange: (color: string) => void;
  watermarkOpacity: number;
  onWatermarkOpacityChange: (opacity: number) => void;
  watermarkDensity: number;
  onWatermarkDensityChange: (density: number) => void;
  historyData?: InvoiceData | null;
  onNewDocument: () => void;
}

export const InvoiceFormComponent: React.FC<InvoiceFormComponentProps> = ({
  onExportPDF,
  onDataChange,
  colorScheme,
  onColorSchemeChange,
  darkMode,
  onDarkModeChange,
  watermarkEnabled,
  onWatermarkEnabledChange,
  watermarkColor,
  onWatermarkColorChange,
  watermarkOpacity,
  onWatermarkOpacityChange,
  watermarkDensity,
  onWatermarkDensityChange,
  historyData,
  onNewDocument
}) => {
  return (
    <InvoiceFormProvider
      onExportPDF={onExportPDF}
      onDataChange={onDataChange}
      colorScheme={colorScheme}
      documentType="invoice"
      historyData={historyData}
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
                    New Invoice
                  </Button>
                </div>
              </div>
            )}

            <TabsCustom defaultValue="customization">
              <TabsListCustom twoRows={true}>
                <TabsTriggerCustom value="customization">Customization</TabsTriggerCustom>
                <TabsTriggerCustom value="business">Business Info</TabsTriggerCustom>
                <TabsTriggerCustom value="client">Client Info</TabsTriggerCustom>
                <TabsTriggerCustom value="document">Invoice Details</TabsTriggerCustom>
                <TabsTriggerCustom value="items">Items</TabsTriggerCustom>
                <TabsTriggerCustom value="notes">Notes</TabsTriggerCustom>
                <TabsTriggerCustom value="terms">Terms</TabsTriggerCustom>
                <TabsTriggerCustom value="actions">Send & Export</TabsTriggerCustom>
              </TabsListCustom>

              <TabsContentCustom value="customization">
                <DocumentCustomization
                  documentType="invoice"
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
                  notes={invoiceData.notes}
                  onNotesChange={handleNotesChange}
                />
              </TabsContentCustom>

              <TabsContentCustom value="terms">
                <NotesSection
                  title="Terms & Conditions"
                  notes={invoiceData.terms}
                  onNotesChange={handleTermsChange}
                />
              </TabsContentCustom>

              <TabsContentCustom value="actions">
                <InvoiceActions
                  documentType="invoice"
                  clientEmail={clientEmail}
                  onEmailChange={setClientEmail}
                  onSendEmail={handleSendEmail}
                  onExportPDF={handleExportPDF}
                  isSending={isSending}
                />
              </TabsContentCustom>
            </TabsCustom>
          </div>
        );
      }}
    </InvoiceFormProvider>
  );
};
