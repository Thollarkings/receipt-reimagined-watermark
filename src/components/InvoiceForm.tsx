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
    const printData = {
      ...data,
      colorScheme,
      darkMode,
      watermarkColor,
      watermarkOpacity,
      watermarkDensity
    };
    
    await onExportPDF(printData);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-[1400px] mx-auto">
        {/* Form Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="mb-6 sm:mb-8">
            <DocumentTypeSelector
              type={documentType}
              onTypeChange={setDocumentType}
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <DocumentCustomization
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
          </div>

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

        {/* Preview Section - Improved responsive layout */}
        <div className="xl:sticky xl:top-6 h-fit">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Optimized preview container with better scaling */}
            <div className="invoice-preview-container" data-preview-container>
              {previewData ? (
                <div className="w-auto h-auto flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-0 sm:p-0">
  <div className="w-full h-full overflow-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
    {documentType === 'invoice' ? (
      <div 
        className="w-full origin-top"
        style={{
          transform: 'scale(0.95)',
          transformOrigin: 'top left',
          width: 'auto',
          margin: '0 auto'
        }}
      >
        <div className="w-[650px] min-h-auto bg-white">
          <InvoicePreview data={previewData} colorScheme={colorScheme} />
        </div>
      </div>
    ) : (
      <div 
        className="w-auto origin-top"
        style={{
          transform: 'scale(0.9)',
          transformOrigin: 'top left',
          width: 'auto',
          margin: '0 auto'
        }}
      >
        <div className="w-[700px] h-auto bg-white">
          <ReceiptPreview 
            data={previewData} 
            colorScheme={colorScheme}
            darkMode={darkMode}
            watermarkColor={watermarkColor}
            watermarkOpacity={watermarkOpacity}
            watermarkDensity={watermarkDensity}
          />
        </div>
      </div>
    )}
  </div>
</div>

              ) : (
                <div className="h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center m-4">
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg text-center px-4">
                    Fill out the form to see preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
