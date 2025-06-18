
import React, { useState } from 'react';
import { InvoiceData } from '@/types/invoice';
import { DocumentTypeSelector } from '@/components/invoice/DocumentTypeSelector';
import { InvoiceFormComponent } from '@/components/invoice/InvoiceFormComponent';
import { ReceiptFormComponent } from '@/components/receipt/ReceiptFormComponent';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { ReceiptPreview } from '@/components/receipt/ReceiptPreview';
import { InvoiceHistory } from '@/components/invoice/InvoiceHistory';
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';
import { useInvoiceStorage } from '@/hooks/useInvoiceStorage';
import { useToast } from '@/hooks/use-toast';

interface InvoiceFormProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  onExportPDF
}) => {
  const [documentType, setDocumentType] = useState<'invoice' | 'receipt'>('invoice');
  const [colorScheme, setColorScheme] = useState('blue');
  const [darkMode, setDarkMode] = useState(false);
  const [watermarkColor, setWatermarkColor] = useState('#9ca3af');
  const [watermarkOpacity, setWatermarkOpacity] = useState(20);
  const [watermarkDensity, setWatermarkDensity] = useState(30);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  
  const { saveInvoiceData, saving } = useInvoiceStorage();
  const { toast } = useToast();

  const handleDataChange = (data: InvoiceData) => {
    setPreviewData(data);
    // If user starts editing, clear history selection
    if (isEditingHistory) {
      setIsEditingHistory(false);
      setSelectedHistoryId(null);
    }
  };

  const handleHistoryLoad = (data: InvoiceData, historyId: string) => {
    setPreviewData(data);
    setSelectedHistoryId(historyId);
    setIsEditingHistory(true);
    
    // Switch document type if needed
    if (data.type && data.type !== documentType) {
      setDocumentType(data.type as 'invoice' | 'receipt');
    }
  };

  const handlePDFExport = async (data: InvoiceData) => {
    const printData = {
      ...data,
      colorScheme,
      darkMode,
      watermarkColor,
      watermarkOpacity,
      watermarkDensity: watermarkEnabled ? watermarkDensity : 0,
      watermarkEnabled
    };
    await onExportPDF(printData);
  };

  const handleSendEmail = (data: InvoiceData) => {
    // Optionally you can implement a modal forwarding to send email page/action
    // Right now left as a placeholder
  };

  const handleNewDocument = () => {
    setSelectedHistoryId(null);
    setIsEditingHistory(false);
    setPreviewData(null);
  };

  const handleSaveDocument = async () => {
    if (!previewData) {
      toast({
        title: "Nothing to Save",
        description: "Please fill out the form before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const saveData = {
        ...previewData,
        colorScheme,
        darkMode,
        watermarkColor,
        watermarkOpacity,
        watermarkDensity: watermarkEnabled ? watermarkDensity : 0,
        watermarkEnabled
      };
      
      await saveInvoiceData(saveData);
      
      toast({
        title: "Document Saved",
        description: `${documentType === 'invoice' ? 'Invoice' : 'Receipt'} #${previewData.invoiceNumber} has been saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWatermarkEnabledChange = (enabled: boolean) => {
    setWatermarkEnabled(enabled);
    // If watermark is disabled, set density to 0 to remove it from preview
    if (!enabled && previewData) {
      setPreviewData({
        ...previewData,
        watermarkDensity: 0
      });
    } else if (enabled && previewData) {
      setPreviewData({
        ...previewData,
        watermarkDensity: watermarkDensity
      });
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-[1400px] mx-auto">
        {/* Form Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="mb-6 sm:mb-8">
            <DocumentTypeSelector type={documentType} onTypeChange={setDocumentType} />
          </div>

          {/* New Invoice/Receipt and Save Buttons */}
          <div className="mb-6 space-y-3">
            <Button
              onClick={handleNewDocument}
              className="w-full bg-gradient-to-r from-fuchsia-200 to-violet-300 text-black hover:from-fuchsia-300 hover:to-violet-400 rounded-lg gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New {documentType === 'invoice' ? 'Invoice' : 'Receipt'}
            </Button>
            
            <Button
              onClick={handleSaveDocument}
              disabled={saving || !previewData}
              className="w-full bg-gradient-to-r from-fuchsia-200 to-violet-300 text-black hover:from-fuchsia-300 hover:to-violet-400 rounded-lg gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              variant="outline"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : `Save ${documentType === 'invoice' ? 'Invoice' : 'Receipt'}`}
            </Button>
          </div>
          
          {documentType === 'invoice' ? (
            <InvoiceFormComponent
              onExportPDF={handlePDFExport}
              onDataChange={handleDataChange}
              colorScheme={colorScheme}
              onColorSchemeChange={setColorScheme}
              darkMode={darkMode}
              onDarkModeChange={setDarkMode}
              watermarkEnabled={watermarkEnabled}
              onWatermarkEnabledChange={handleWatermarkEnabledChange}
              watermarkColor={watermarkColor}
              onWatermarkColorChange={setWatermarkColor}
              watermarkOpacity={watermarkOpacity}
              onWatermarkOpacityChange={setWatermarkOpacity}
              watermarkDensity={watermarkDensity}
              onWatermarkDensityChange={setWatermarkDensity}
              historyData={isEditingHistory ? previewData : null}
              onNewDocument={handleNewDocument}
            />
          ) : (
            <ReceiptFormComponent
              onExportPDF={handlePDFExport}
              onDataChange={handleDataChange}
              colorScheme={colorScheme}
              onColorSchemeChange={setColorScheme}
              darkMode={darkMode}
              onDarkModeChange={setDarkMode}
              watermarkColor={watermarkColor}
              onWatermarkColorChange={setWatermarkColor}
              watermarkOpacity={watermarkOpacity}
              onWatermarkOpacityChange={setWatermarkOpacity}
              watermarkDensity={watermarkDensity}
              onWatermarkDensityChange={setWatermarkDensity}
              watermarkEnabled={watermarkEnabled}
              onWatermarkEnabledChange={handleWatermarkEnabledChange}
              historyData={isEditingHistory ? previewData : null}
              onNewDocument={handleNewDocument}
            />
          )}
        </div>

        {/* Preview & History Section */}
        <div className="xl:sticky xl:top-6 h-fit space-y-6">
          {/* Preview Section - Only this gets exported */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {previewData ? (
              <div className="w-auto h-auto flex flex-col items-center justify-center p-0 sm:p-0 rounded-none bg-purple-900">
                <div className="w-full h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  {/* This container is what gets captured for PDF export */}
                  <div className="invoice-preview-container" data-invoice-preview>
                    {documentType === 'invoice' ? (
                      <div className="w-full origin-top" style={{
                        transform: 'scale(0.95)',
                        transformOrigin: 'top left',
                        width: 'auto',
                        margin: '0 auto'
                      }}>
                        <div className="w-[650px] min-h-auto bg-white">
                          <InvoicePreview data={previewData} colorScheme={colorScheme} />
                        </div>
                      </div>
                    ) : (
                      <div className="w-auto origin-top" style={{
                        transform: 'scale(0.9)',
                        transformOrigin: 'top left',
                        width: 'auto',
                        margin: '0 auto'
                      }}>
                        <div className="w-[700px] h-auto bg-white">
                          <ReceiptPreview
                            data={previewData}
                            colorScheme={colorScheme}
                            darkMode={darkMode}
                            watermarkColor={watermarkColor}
                            watermarkOpacity={watermarkOpacity}
                            watermarkDensity={watermarkEnabled ? watermarkDensity : 0}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center m-4">
                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg text-center px-4">
                  Fill out the form to see preview
                </p>
              </div>
            )}
          </div>

          {/* History Section - Separate from preview, won't be exported */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">
              Invoice & Receipt History
            </h2>
            <InvoiceHistory
              onLoad={handleHistoryLoad}
              onExportPDF={handlePDFExport}
              onSendEmail={handleSendEmail}
              selectedId={selectedHistoryId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
