
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Mail, Loader2 } from 'lucide-react';
import { BusinessInfoSection } from './BusinessInfoSection';
import { ClientInfoSection } from './ClientInfoSection';
import { DocumentDetailsSection } from './DocumentDetailsSection';
import { ItemsSection } from './ItemsSection';
import { NotesSection } from './NotesSection';
import { EmailInputSection } from './EmailInputSection';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { useDraftData } from '@/hooks/useDraftData';
import { useEmailSending } from '@/hooks/useEmailSending';
import { useProfileData } from '@/hooks/useProfileData';
import { generatePDF } from '@/utils/pdfGenerator';

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
  const { draftData, clientData, sharedItems, loading, saveDraftData, saveClientData, saveSharedItems } = useDraftData('invoice');
  const { profileData, updateProfile } = useProfileData();
  const { sendInvoiceEmail, isSending } = useEmailSending();
  const [clientEmail, setClientEmail] = useState('');

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    id: `INV-${Date.now()}`,
    type: 'invoice',
    businessName: '',
    businessLogo: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    invoiceNumber: draftData?.invoiceNumber || `INV-${Date.now()}`,
    invoiceDate: draftData?.invoiceDate || new Date().toISOString().split('T')[0],
    dueDate: draftData?.dueDate || '',
    currency: draftData?.currency || 'NGN',
    items: sharedItems || [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    notes: draftData?.notes || '',
    terms: draftData?.terms || '',
    colorScheme: colorScheme
  });

  // Load profile data into form when available
  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      setInvoiceData(prev => ({
        ...prev,
        businessName: profileData.business_name || '',
        businessLogo: profileData.business_logo || '',
        businessAddress: profileData.business_address || '',
        businessPhone: profileData.business_phone || '',
        businessEmail: profileData.business_email || '',
        businessWebsite: profileData.business_website || '',
        currency: profileData.default_currency || 'NGN',
      }));
    }
  }, [profileData]);

  useEffect(() => {
    if (draftData) {
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: draftData.invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: draftData.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: draftData.dueDate || '',
        currency: draftData.currency || 'NGN',
        notes: draftData.notes || '',
        terms: draftData.terms || ''
      }));
    }
  }, [draftData]);

  useEffect(() => {
    if (clientData) {
      setInvoiceData(prev => ({
        ...prev,
        clientName: clientData.name || '',
        clientAddress: clientData.address || '',
        clientPhone: clientData.phone || '',
        clientEmail: clientData.email || '',
      }));
    }
  }, [clientData]);

  useEffect(() => {
    setInvoiceData(prev => ({
      ...prev,
      items: sharedItems || [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    }));
  }, [sharedItems]);

  useEffect(() => {
    onDataChange({
      ...invoiceData,
      colorScheme
    });
  }, [invoiceData, onDataChange, colorScheme]);

  const handleBusinessInfoChange = async (field: string, value: string) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
    
    const dbField = field === 'businessName' ? 'business_name' :
                   field === 'businessLogo' ? 'business_logo' :
                   field === 'businessAddress' ? 'business_address' :
                   field === 'businessPhone' ? 'business_phone' :
                   field === 'businessEmail' ? 'business_email' :
                   field === 'businessWebsite' ? 'business_website' : field;
    
    try {
      await updateProfile({ [dbField]: value });
    } catch (error) {
      console.error('Failed to save business data:', error);
    }
  };

  const handleClientInfoChange = (field: string, value: string) => {
    setInvoiceData(prev => ({ ...prev, [`client${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }));
    saveClientData({ [field]: value } as any);
  };

  const handleDocumentDetailsChange = (field: string, value: string) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
    saveDraftData({ [field]: value } as any);
  };

  const handleItemsChange = (items: InvoiceItem[]) => {
    setInvoiceData(prev => ({ ...prev, items: items }));
    saveSharedItems(items);
  };

  const handleNotesChange = (value: string) => {
    setInvoiceData(prev => ({ ...prev, notes: value }));
    saveDraftData({ notes: value });
  };

  const handleTermsChange = (value: string) => {
    setInvoiceData(prev => ({ ...prev, terms: value }));
    saveDraftData({ terms: value });
  };

  const handleExportPDF = async () => {
    await onExportPDF({
      ...invoiceData,
      colorScheme
    });
  };

  // Update client email when clientData changes
  useEffect(() => {
    if (clientData?.email) {
      setClientEmail(clientData.email);
    }
  }, [clientData]);

  const handleSendEmail = async () => {
    if (!clientEmail.trim()) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Generate PDF without saving to file
      const pdfDataUrl = await generatePDF({
        ...invoiceData,
        colorScheme
      }, false);
      
      // Send email with PDF attachment
      await sendInvoiceEmail({
        ...invoiceData,
        colorScheme
      }, pdfDataUrl, clientEmail);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-64">
            <EmailInputSection
              email={clientEmail}
              onEmailChange={setClientEmail}
              placeholder="Enter client's email address"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSendEmail}
              disabled={isSending || !clientEmail.trim()}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send to Client
                </>
              )}
            </Button>
            <Button onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

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
        invoiceNumber={invoiceData.invoiceNumber}
        invoiceDate={invoiceData.invoiceDate}
        dueDate={invoiceData.dueDate}
        currency={invoiceData.currency}
        onDocumentDetailsChange={handleDocumentDetailsChange}
      />

      <ItemsSection
        items={invoiceData.items}
        onItemsChange={handleItemsChange}
      />

      <NotesSection
        notes={invoiceData.notes}
        onNotesChange={handleNotesChange}
      />

      {/* Terms & Conditions Section */}
      <NotesSection
        title="Terms & Conditions"
        notes={invoiceData.terms}
        onNotesChange={handleTermsChange}
      />
    </div>
  );
};
