
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
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1400px] mx-auto">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="mb-8">
            <DocumentTypeSelector
              type={documentType}
              onTypeChange={setDocumentType}
            />
          </div>

          <div className="mb-8">
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

        {/* Preview Section - Mobile Responsive */}
        <div className="xl:sticky xl:top-6 h-fit">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg invoice-preview-container">
            {/* Mobile-optimized preview container */}
            <div className="p-2 sm:p-4 lg:p-6">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[300px] max-w-full">
                  {previewData ? (
                    documentType === 'invoice' ? (
                      <div className="transform scale-75 sm:scale-90 lg:scale-100 origin-top-left">
                        <InvoicePreview data={previewData} colorScheme={colorScheme} />
                      </div>
                    ) : (
                      <div className="transform scale-75 sm:scale-90 lg:scale-100 origin-top-left">
                        <ReceiptPreview 
                          data={previewData} 
                          colorScheme={colorScheme}
                          darkMode={darkMode}
                          watermarkColor={watermarkColor}
                          watermarkOpacity={watermarkOpacity}
                          watermarkDensity={watermarkDensity}
                        />
                      </div>
                    )
                  ) : (
                    <div className="h-64 sm:h-80 lg:h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base lg:text-lg text-center px-4">
                        Fill out the form to see preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
