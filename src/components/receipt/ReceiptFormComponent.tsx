
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfileData } from '@/hooks/useProfileData';
import { useDraftData } from '@/hooks/useDraftData';
import { BusinessInfoSection } from '@/components/invoice/BusinessInfoSection';
import { ClientInfoSection } from '@/components/invoice/ClientInfoSection';
import { DocumentDetailsSection } from '@/components/invoice/DocumentDetailsSection';
import { ItemsSection } from '@/components/invoice/ItemsSection';
import { NotesSection } from '@/components/invoice/NotesSection';

interface ReceiptFormComponentProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange: (data: InvoiceData) => void;
  colorScheme: string;
  darkMode: boolean;
  watermarkColor: string;
  watermarkOpacity: number;
  watermarkDensity: number;
}

export const ReceiptFormComponent: React.FC<ReceiptFormComponentProps> = ({ 
  onExportPDF, 
  onDataChange, 
  colorScheme,
  darkMode,
  watermarkColor,
  watermarkOpacity,
  watermarkDensity
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData, updateProfile } = useProfileData();
  const { draftData, clientData, sharedItems, loading, saveDraftData, saveClientData, saveSharedItems, setDraftData, setClientData } = useDraftData('receipt');
  const [loadingPDF, setLoadingPDF] = useState(false);
  
  // Accordion state - only one section open at a time
  const [openSection, setOpenSection] = useState<string | null>('business');
  
  const [formData, setFormData] = useState<InvoiceData>({
    id: '',
    type: 'receipt',
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
    invoiceNumber: `REC-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    currency: 'NGN',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    notes: '',
    terms: '',
    amountPaid: 0,
    colorScheme: colorScheme,
    darkMode: darkMode,
    watermarkColor: watermarkColor,
    watermarkOpacity: watermarkOpacity,
    watermarkDensity: watermarkDensity,
  });

  // Load profile data into form when available
  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      setFormData(prev => ({
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

  // Load draft data when available
  useEffect(() => {
    if (draftData && !loading) {
      setFormData(prev => ({
        ...prev,
        invoiceNumber: draftData.invoiceNumber,
        invoiceDate: draftData.invoiceDate,
        dueDate: draftData.dueDate,
        paymentDate: draftData.paymentDate || new Date().toISOString().split('T')[0],
        paymentMethod: draftData.paymentMethod || '',
        currency: draftData.currency,
        notes: draftData.notes,
        terms: draftData.terms,
        amountPaid: draftData.amountPaid || 0,
      }));
    }
  }, [draftData, loading]);

  // Load shared client data
  useEffect(() => {
    if (clientData) {
      setFormData(prev => ({
        ...prev,
        clientName: clientData.name,
        clientAddress: clientData.address,
        clientPhone: clientData.phone,
        clientEmail: clientData.email,
      }));
    }
  }, [clientData]);

  // Load shared items
  useEffect(() => {
    if (sharedItems.length > 0) {
      setFormData(prev => ({ ...prev, items: sharedItems }));
    }
  }, [sharedItems]);

  // Update preview whenever form data changes
  useEffect(() => {
    onDataChange({ 
      ...formData, 
      colorScheme, 
      darkMode, 
      watermarkColor, 
      watermarkOpacity, 
      watermarkDensity 
    });
  }, [formData, colorScheme, darkMode, watermarkColor, watermarkOpacity, watermarkDensity, onDataChange]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleBusinessFieldChange = async (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
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

  const handleDraftFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (draftData) {
      saveDraftData({ [field]: value } as any);
    }
  };

  const handleClientFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [`client${field.charAt(0).toUpperCase() + field.slice(1)}`]: value }));
    if (clientData) {
      saveClientData({ [field]: value } as any);
    }
  };

  const handleCurrencyChange = async (value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
    try {
      await updateProfile({ default_currency: value });
      if (draftData) {
        saveDraftData({ currency: value });
      }
    } catch (error) {
      console.error('Failed to save currency:', error);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleBusinessFieldChange('businessLogo', result);
      };
      reader.readAsDataURL(file);
    }
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
    const updatedItems = [...formData.items, newItem];
    setFormData(prev => ({ ...prev, items: updatedItems }));
    saveSharedItems(updatedItems);
  };

  const removeItem = (id: string) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter(item => item.id !== id);
      setFormData(prev => ({ ...prev, items: updatedItems }));
      saveSharedItems(updatedItems);
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = formData.items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormData(prev => ({ ...prev, items: updatedItems }));
    saveSharedItems(updatedItems);
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.clientName) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the business name and client name before exporting.",
        variant: "destructive",
      });
      return;
    }

    setLoadingPDF(true);
    try {
      const receiptData = {
        ...formData,
        colorScheme,
        darkMode,
        watermarkColor,
        watermarkOpacity,
        watermarkDensity,
        id: formData.id || `REC-${Date.now()}`,
        invoiceNumber: formData.invoiceNumber || `REC-${Date.now()}`,
      };

      await onExportPDF(receiptData);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingPDF(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <BusinessInfoSection
        isOpen={openSection === 'business'}
        onToggle={() => toggleSection('business')}
        formData={formData}
        onFieldChange={handleBusinessFieldChange}
        onLogoUpload={handleLogoUpload}
      />

      <ClientInfoSection
        isOpen={openSection === 'client'}
        onToggle={() => toggleSection('client')}
        formData={formData}
        onFieldChange={handleClientFieldChange}
      />

      <DocumentDetailsSection
        isOpen={openSection === 'details'}
        onToggle={() => toggleSection('details')}
        formData={formData}
        onFieldChange={handleDraftFieldChange}
        onCurrencyChange={handleCurrencyChange}
      />

      <ItemsSection
        isOpen={openSection === 'items'}
        onToggle={() => toggleSection('items')}
        items={formData.items}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItem={updateItem}
      />

      <NotesSection
        isOpen={openSection === 'notes'}
        onToggle={() => toggleSection('notes')}
        formData={formData}
        onFieldChange={handleDraftFieldChange}
      />

      {/* Export Button */}
      <div className="pt-6">
        <Button onClick={handleSubmit} disabled={loadingPDF} className="w-full h-12 text-lg">
          {loadingPDF ? 'Generating PDF...' : 'Export PDF'}
          <Download className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
