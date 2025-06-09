
import React, { useState, useEffect } from 'react';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { useDraftData } from '@/hooks/useDraftData';
import { useEmailSending } from '@/hooks/useEmailSending';
import { useProfileData } from '@/hooks/useProfileData';
import { generatePDF } from '@/utils/pdfGenerator';

interface InvoiceFormProviderProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange: (data: InvoiceData) => void;
  colorScheme: string;
  documentType: 'invoice' | 'receipt';
  children: (props: InvoiceFormProviderState) => React.ReactNode;
}

interface InvoiceFormProviderState {
  invoiceData: InvoiceData;
  clientEmail: string;
  loading: boolean;
  isSending: boolean;
  handleBusinessInfoChange: (field: string, value: string) => Promise<void>;
  handleClientInfoChange: (field: string, value: string) => void;
  handleDocumentDetailsChange: (field: string, value: string) => void;
  handleCurrencyChange: (value: string) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
  handleNotesChange: (value: string) => void;
  handleTermsChange: (value: string) => void;
  handleExportPDF: () => Promise<void>;
  handleSendEmail: () => Promise<void>;
  setClientEmail: (email: string) => void;
}

export const InvoiceFormProvider: React.FC<InvoiceFormProviderProps> = ({
  onExportPDF,
  onDataChange,
  colorScheme,
  documentType,
  children,
}) => {
  const { draftData, clientData, sharedItems, loading, saveDraftData, saveClientData, saveSharedItems } = useDraftData(documentType);
  const { profileData, updateProfile } = useProfileData();
  const { sendInvoiceEmail, isSending } = useEmailSending();
  const [clientEmail, setClientEmail] = useState('');

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    id: `${documentType.toUpperCase()}-${Date.now()}`,
    type: documentType,
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
    invoiceNumber: draftData?.invoiceNumber || `${documentType.toUpperCase()}-${Date.now()}`,
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
        invoiceNumber: draftData.invoiceNumber || `${documentType.toUpperCase()}-${Date.now()}`,
        invoiceDate: draftData.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: draftData.dueDate || '',
        currency: draftData.currency || 'NGN',
        notes: draftData.notes || '',
        terms: draftData.terms || ''
      }));
    }
  }, [draftData, documentType]);

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

  // Update client email when clientData changes
  useEffect(() => {
    if (clientData?.email) {
      setClientEmail(clientData.email);
    }
  }, [clientData]);

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

  const handleCurrencyChange = (value: string) => {
    handleDocumentDetailsChange('currency', value);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discount: 0,
    };
    const updatedItems = [...invoiceData.items, newItem];
    setInvoiceData(prev => ({ ...prev, items: updatedItems }));
    saveSharedItems(updatedItems);
  };

  const removeItem = (id: string) => {
    if (invoiceData.items.length > 1) {
      const updatedItems = invoiceData.items.filter(item => item.id !== id);
      setInvoiceData(prev => ({ ...prev, items: updatedItems }));
      saveSharedItems(updatedItems);
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = invoiceData.items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setInvoiceData(prev => ({ ...prev, items: updatedItems }));
    saveSharedItems(updatedItems);
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

  const providerState: InvoiceFormProviderState = {
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
  };

  return <>{children(providerState)}</>;
};
