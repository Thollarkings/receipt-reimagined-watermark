
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Upload, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { currencies } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfileData } from '@/hooks/useProfileData';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData, updateProfile } = useProfileData();
  const [loading, setLoading] = useState(false);
  
  // Accordion state - only one section open at a time
  const [openSection, setOpenSection] = useState<string | null>('business');
  
  const [formData, setFormData] = useState<InvoiceData>({
    id: '',
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
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentDate: '',
    paymentMethod: '',
    currency: 'NGN', // Default to NGN
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    notes: '',
    terms: '',
    amountPaid: 0,
    colorScheme: colorScheme,
    darkMode: false,
    watermarkColor: '#9ca3af',
    watermarkOpacity: 20,
    watermarkDensity: 30,
  });

  // Update preview whenever form data changes
  useEffect(() => {
    onDataChange({ ...formData, colorScheme });
  }, [formData, colorScheme, onDataChange]);

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

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleBusinessFieldChange = async (field: string, value: string) => {
    // Update form data immediately
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Debounced save to database
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

  const handleCurrencyChange = async (value: string) => {
    setFormData(prev => ({ ...prev, currency: value }));
    try {
      await updateProfile({ default_currency: value });
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
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
      }));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
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

    setLoading(true);
    try {
      const invoiceData = {
        ...formData,
        colorScheme,
        id: formData.id || `INV-${Date.now()}`,
        invoiceNumber: formData.invoiceNumber || `INV-${Date.now()}`,
      };

      await onExportPDF(invoiceData);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <Collapsible open={openSection === 'business'} onOpenChange={() => toggleSection('business')}>
        <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardTitle className="flex items-center justify-between">
                Business Information
                {openSection === 'business' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => handleBusinessFieldChange('businessName', e.target.value)}
                  placeholder="Your Business Name"
                  className="mt-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label htmlFor="businessLogo">Business Logo</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    id="businessLogo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  {formData.businessLogo && (
                    <img src={formData.businessLogo} alt="Logo" className="h-12 w-12 object-contain border rounded" />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="businessAddress">Business Address</Label>
                <Textarea
                  id="businessAddress"
                  value={formData.businessAddress}
                  onChange={(e) => handleBusinessFieldChange('businessAddress', e.target.value)}
                  placeholder="Your business address"
                  rows={3}
                  className="mt-1 bg-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessPhone">Phone</Label>
                  <Input
                    id="businessPhone"
                    value={formData.businessPhone}
                    onChange={(e) => handleBusinessFieldChange('businessPhone', e.target.value)}
                    placeholder="Phone Number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleBusinessFieldChange('businessEmail', e.target.value)}
                    placeholder="business@example.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="businessWebsite">Website</Label>
                <Input
                  id="businessWebsite"
                  value={formData.businessWebsite}
                  onChange={(e) => handleBusinessFieldChange('businessWebsite', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Client Information */}
      <Collapsible open={openSection === 'client'} onOpenChange={() => toggleSection('client')}>
        <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardTitle className="flex items-center justify-between">
                Client Information
                {openSection === 'client' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Client Name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="clientAddress">Client Address</Label>
                <Textarea
                  id="clientAddress"
                  value={formData.clientAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                  placeholder="Client Address"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="Phone Number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="client@example.com"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Document Details */}
      <Collapsible open={openSection === 'details'} onOpenChange={() => toggleSection('details')}>
        <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardTitle className="flex items-center justify-between">
                Invoice Details
                {openSection === 'details' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="INV-001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Items */}
      <Collapsible open={openSection === 'items'} onOpenChange={() => toggleSection('items')}>
        <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardTitle className="flex items-center justify-between">
                Items
                {openSection === 'items' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Item description"
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        min="0"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.01"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.01"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        disabled={formData.items.length === 1}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button onClick={addItem} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Notes and Terms */}
      <Collapsible open={openSection === 'notes'} onOpenChange={() => toggleSection('notes')}>
        <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <CardTitle className="flex items-center justify-between">
                Notes & Terms
                {openSection === 'notes' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or comments"
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="Payment terms and conditions"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Export Button */}
      <div className="pt-6">
        <Button onClick={handleSubmit} disabled={loading} className="w-full h-12 text-lg">
          {loading ? 'Generating PDF...' : 'Export PDF'}
          <Download className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
