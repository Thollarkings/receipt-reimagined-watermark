
import React, { useState } from 'react';
import { InvoiceData } from '@/types/invoice';
import { DocumentTypeSelector } from '@/components/invoice/DocumentTypeSelector';
import { DocumentCustomization } from '@/components/invoice/DocumentCustomization';
import { InvoiceFormComponent } from '@/components/invoice/InvoiceFormComponent';
import { ReceiptFormComponent } from '@/components/receipt/ReceiptFormComponent';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { ReceiptPreview } from '@/components/receipt/ReceiptPreview';

interface InvoiceFormProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onExportPDF }) => {
  const [documentType, setDocumentType] = useState<'invoice' | 'receipt'>('invoice');
  const [customizationOpen, setCustomizationOpen] = useState(true);
  const [colorScheme, setColorScheme] = useState('blue');
  const [darkMode, setDarkMode] = useState(false);
  const [watermarkColor, setWatermarkColor] = useState('#9ca3af');
  const [watermarkOpacity, setWatermarkOpacity] = useState(20);
  const [watermarkDensity, setWatermarkDensity] = useState(30);
  const [previewData, setPreviewData] = useState<InvoiceData | null>(null);

  const handleDataChange = (data: InvoiceData) => {
    setPreviewData(data);
  };

  const handlePDFExport = async (data: InvoiceData) => {
    // Trigger the print dialog for the preview section
    const printContent = document.querySelector('.invoice-preview-container');
    if (printContent) {
      window.print();
    }
    
    // Also call the original export function if needed
    await onExportPDF(data);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
      {/* Form Section */}
      <div className="space-y-6">
        <DocumentTypeSelector
          type={documentType}
          onTypeChange={setDocumentType}
        />

        <DocumentCustomization
          isOpen={customizationOpen}
          onOpenChange={setCustomizationOpen}
          documentType={documentType}
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
        />

        {documentType === 'invoice' ? (
          <InvoiceFormComponent 
            onExportPDF={handlePDFExport}
            onDataChange={handleDataChange}
            colorScheme={colorScheme}
          />
        ) : (
          <ReceiptFormComponent 
            onExportPDF={handlePDFExport}
            onDataChange={handleDataChange}
            colorScheme={colorScheme}
            darkMode={darkMode}
            watermarkColor={watermarkColor}
            watermarkOpacity={watermarkOpacity}
            watermarkDensity={watermarkDensity}
          />
        )}
      </div>

      {/* Preview Section */}
      <div className="lg:sticky lg:top-6 invoice-preview-container">
        {previewData ? (
          documentType === 'invoice' ? (
            <InvoicePreview data={previewData} colorScheme={colorScheme} />
          ) : (
            <ReceiptPreview 
              data={previewData} 
              colorScheme={colorScheme}
              darkMode={darkMode}
              watermarkColor={watermarkColor}
              watermarkOpacity={watermarkOpacity}
              watermarkDensity={watermarkDensity}
            />
          )
        ) : (
          <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Fill out the form to see preview</p>
          </div>
        )}
      </div>
    </div>
  );
};
