
import React from 'react';
import { useDraftData } from '@/hooks/useDraftData';
import { useProfileData } from '@/hooks/useProfileData';
import { useEmailSending } from '@/hooks/useEmailSending';
import { useInvoiceStorage } from '@/hooks/useInvoiceStorage';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { generatePDF } from '@/utils/pdfGenerator';

// Debounce utility hook
function useDebouncedCallback<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timer = React.useRef<NodeJS.Timeout | null>(null);
  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export function useInvoiceFormState({
  onExportPDF,
  onDataChange,
  colorScheme,
  documentType,
  historyData
}: {
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange: (data: InvoiceData) => void;
  colorScheme: string;
  documentType: 'invoice' | 'receipt';
  historyData?: InvoiceData | null;
}) {
  const {
    draftData,
    clientData,
    sharedItems,
    loading,
    saveDraftData,
    saveClientData,
    saveSharedItems,
    setDraftData,
    setClientData,
  } = useDraftData(documentType);
  const { profileData, updateProfile } = useProfileData();
  const { sendInvoiceEmail, isSending } = useEmailSending();
  const { saveInvoiceData, saving } = useInvoiceStorage();

  const [clientEmail, setClientEmail] = React.useState('');
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false);

  const [invoiceData, setInvoiceData] = React.useState<InvoiceData>({
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

  // -- Load history data when provided --
  React.useEffect(() => {
    if (historyData) {
      setIsLoadingHistory(true);
      setInvoiceData(prev => ({
        ...prev,
        ...historyData,
        colorScheme: colorScheme // Keep current color scheme
      }));
      
      // Update client email for form
      if (historyData.clientEmail) {
        setClientEmail(historyData.clientEmail);
      }
      
      setIsLoadingHistory(false);
    }
  }, [historyData, colorScheme]);

  // -- EFFECT: INIT LOCAL STATE FROM DB --
  React.useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0 && !historyData) {
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
    // eslint-disable-next-line
  }, [profileData, historyData]);

  React.useEffect(() => {
    if (draftData && !historyData) {
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: draftData.invoiceNumber || `${documentType.toUpperCase()}-${Date.now()}`,
        invoiceDate: draftData.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: draftData.dueDate || '',
        currency: draftData.currency || 'NGN',
        notes: draftData.notes || '',
        terms: draftData.terms || '',
        amountPaid: draftData.amountPaid || 0,
        paymentDate: draftData.paymentDate || '',
        paymentMethod: draftData.paymentMethod || ''
      }));
    }
    // eslint-disable-next-line
  }, [draftData, documentType, historyData]);

  React.useEffect(() => {
    if (clientData && !historyData) {
      setInvoiceData(prev => ({
        ...prev,
        clientName: clientData.name || '',
        clientAddress: clientData.address || '',
        clientPhone: clientData.phone || '',
        clientEmail: clientData.email || '',
      }));
    }
    // eslint-disable-next-line
  }, [clientData, historyData]);

  React.useEffect(() => {
    if (!historyData) {
      setInvoiceData(prev => ({
        ...prev,
        items: sharedItems || [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
      }));
    }
    // eslint-disable-next-line
  }, [sharedItems, historyData]);

  // Only fire onDataChange when finished typing
  React.useEffect(() => {
    const handle = setTimeout(() => {
      onDataChange({ ...invoiceData, colorScheme });
    }, 200);
    return () => clearTimeout(handle);
    // eslint-disable-next-line
  }, [invoiceData, onDataChange, colorScheme]);

  // DEBOUNCE utility for updating draft/client/profile data
  const debouncedSaveDraftData = useDebouncedCallback(saveDraftData, 1000);
  const debouncedSaveClientData = useDebouncedCallback(saveClientData, 1000);
  const debouncedUpdateProfile = useDebouncedCallback(updateProfile, 1000);

  // -- Change Handlers --
  const handleBusinessInfoChange = React.useCallback((field: keyof InvoiceData, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
    // Profile update - only if not editing history
    if (!historyData) {
      if (field === 'businessName') debouncedUpdateProfile({ business_name: value });
      if (field === 'businessLogo') debouncedUpdateProfile({ business_logo: value });
      if (field === 'businessAddress') debouncedUpdateProfile({ business_address: value });
      if (field === 'businessPhone') debouncedUpdateProfile({ business_phone: value });
      if (field === 'businessEmail') debouncedUpdateProfile({ business_email: value });
      if (field === 'businessWebsite') debouncedUpdateProfile({ business_website: value });
    }
  }, [debouncedUpdateProfile, historyData]);

  const handleClientInfoChange = React.useCallback((field: keyof InvoiceData, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));

    // Update client data even when editing history to ensure fields remain editable
    let updateField: string | null = null;
    switch (field) {
      case 'clientName': updateField = 'name'; break;
      case 'clientAddress': updateField = 'address'; break;
      case 'clientPhone': updateField = 'phone'; break;
      case 'clientEmail': updateField = 'email'; setClientEmail(value); break;
      default: return;
    }

    if (updateField && !historyData) {
      debouncedSaveClientData({ [updateField]: value });
    } else if (field === 'clientEmail') {
      setClientEmail(value);
    }
  }, [debouncedSaveClientData, historyData]);

  const handleDocumentDetailsChange = React.useCallback((field: keyof InvoiceData, value: string) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));

    if (!historyData) {
      let updateField: string | null = null;
      switch (field) {
        case 'invoiceNumber': updateField = 'invoiceNumber'; break;
        case 'invoiceDate': updateField = 'invoiceDate'; break;
        case 'dueDate': updateField = 'dueDate'; break;
        case 'paymentDate': updateField = 'paymentDate'; break;
        case 'paymentMethod': updateField = 'paymentMethod'; break;
        case 'amountPaid': updateField = 'amountPaid'; break;
        default: return;
      }
      if (updateField) debouncedSaveDraftData({ [updateField]: field === 'amountPaid' ? Number(value) : value });
    }
  }, [debouncedSaveDraftData, historyData]);

  const handleCurrencyChange = React.useCallback((currency: string) => {
    setInvoiceData(prev => ({
      ...prev,
      currency
    }));
    if (!historyData) {
      debouncedSaveDraftData({ currency });
    }
  }, [debouncedSaveDraftData, historyData]);

  const addItem = React.useCallback(() => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discount: 0,
    };
    const updatedItems = [...invoiceData.items, newItem];
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems,
    }));
    if (!historyData) {
      saveSharedItems(updatedItems);
    }
  }, [invoiceData.items, saveSharedItems, historyData]);

  const removeItem = React.useCallback((id: string) => {
    const updatedItems = invoiceData.items.filter(item => item.id !== id);
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems,
    }));
    if (!historyData) {
      saveSharedItems(updatedItems);
    }
  }, [invoiceData.items, saveSharedItems, historyData]);

  const updateItem = React.useCallback((id: string, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoiceData.items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setInvoiceData(prev => ({
      ...prev,
      items: updatedItems,
    }));
    if (!historyData) {
      saveSharedItems(updatedItems);
    }
  }, [invoiceData.items, saveSharedItems, historyData]);

  const handleNotesChange = React.useCallback((notes: string) => {
    setInvoiceData(prev => ({
      ...prev,
      notes
    }));
    if (!historyData) {
      debouncedSaveDraftData({ notes });
    }
  }, [debouncedSaveDraftData, historyData]);

  const handleTermsChange = React.useCallback((terms: string) => {
    setInvoiceData(prev => ({
      ...prev,
      terms
    }));
    if (!historyData) {
      debouncedSaveDraftData({ terms });
    }
  }, [debouncedSaveDraftData, historyData]);

  // Export/Email
  const handleExportPDF = React.useCallback(async () => {
    try {
      const exportData = prepareInvoiceData();
      await saveInvoiceData(exportData);
      await onExportPDF(exportData);
    } catch (error) {
      console.error('Export error:', error);
    }
  }, [saveInvoiceData, onExportPDF]);

  const handleSendEmail = React.useCallback(async () => {
    try {
      const emailData = prepareInvoiceData();
      await saveInvoiceData(emailData);
      const pdfDataUrl = await generatePDF(emailData, false);
      await sendInvoiceEmail(emailData, pdfDataUrl, clientEmail);
    } catch (error) {
      console.error('Email sending error:', error);
    }
  }, [clientEmail, saveInvoiceData, sendInvoiceEmail, generatePDF]);

  // Prepare data for export/send
  const prepareInvoiceData = React.useCallback((): InvoiceData => {
    return {
      id: invoiceData.id,
      type: documentType,
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate || '',
      paymentDate: invoiceData.paymentDate || '',
      paymentMethod: invoiceData.paymentMethod || '',
      businessName: invoiceData.businessName || '',
      businessLogo: invoiceData.businessLogo || '',
      businessAddress: invoiceData.businessAddress || '',
      businessPhone: invoiceData.businessPhone || '',
      businessEmail: invoiceData.businessEmail || '',
      businessWebsite: invoiceData.businessWebsite || '',
      clientName: invoiceData.clientName,
      clientAddress: invoiceData.clientAddress,
      clientPhone: invoiceData.clientPhone,
      clientEmail: invoiceData.clientEmail,
      items: invoiceData.items,
      currency: invoiceData.currency,
      notes: invoiceData.notes,
      terms: invoiceData.terms,
      amountPaid: invoiceData.amountPaid || 0,
      colorScheme,
    };
  }, [invoiceData, colorScheme, documentType]);

  return {
    invoiceData,
    clientEmail,
    loading: loading || isLoadingHistory,
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
  };
}
