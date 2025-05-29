import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Download, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { currencies } from '@/lib/currencies';
import InvoicePreview from '@/components/invoice/InvoicePreview';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface InvoiceFormComponentProps {
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange?: (data: InvoiceData) => void;
  colorScheme?: string;
}

export const InvoiceFormComponent: React.FC<InvoiceFormComponentProps> = ({ 
  onExportPDF, 
  onDataChange,
  colorScheme = 'blue'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Collapsible section states
  const [customizationOpen, setCustomizationOpen] = useState(true);
  const [businessOpen, setBusinessOpen] = useState(true);
  const [clientOpen, setClientOpen] = useState(true);
  const [documentDetailsOpen, setDocumentDetailsOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  
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
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentDate: '',
    paymentMethod: '',
    currency: 'NGN',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    notes: '',
    terms: '',
    amountPaid: 0,
    colorScheme: 'blue',
    darkMode: false,
    watermarkColor: '#9ca3af',
    watermarkOpacity: 20,
    watermarkDensity: 30,
  });

  const colorSchemes = [
    { id: 'blue', name: 'Ocean Blue', primary: '#2563eb', secondary: '#3b82f6' },
    { id: 'purple', name: 'Royal Purple', primary: '#9333ea', secondary: '#a855f7' },
    { id: 'green', name: 'Forest Green', primary: '#16a34a', secondary: '#22c55e' },
    { id: 'red', name: 'Crimson Red', primary: '#dc2626', secondary: '#ef4444' },
    { id: 'orange', name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316' },
    { id: 'teal', name: 'Ocean Teal', primary: '#0d9488', secondary: '#14b8a6' },
    { id: 'indigo', name: 'Deep Indigo', primary: '#4338ca', secondary: '#6366f1' }
  ];

  // Load user profile
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setFormData(prev => ({
          ...prev,
          businessName: data.business_name || '',
          businessLogo: data.business_logo || '',
          businessAddress: data.business_address || '',
          businessPhone: data.business_phone || '',
          businessEmail: data.business_email || '',
          businessWebsite: data.business_website || '',
          currency: data.default_currency || 'NGN',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    try {
      const profileData = {
        id: user.id,
        business_name: formData.businessName,
        business_logo: formData.businessLogo,
        business_address: formData.businessAddress,
        business_phone: formData.businessPhone,
        business_email: formData.businessEmail,
        business_website: formData.businessWebsite,
        default_currency: formData.currency,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Profile Saved",
        description: "Your business information has been saved.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save profile information.",
        variant: "destructive",
      });
    }
  };

  // Update the formData state change handler
  const updateFormData = (updates: Partial<InvoiceData>) => {
    const newData = { ...formData, ...updates, colorScheme };
    setFormData(newData);
    onDataChange?.(newData);
  };

  // Update all form field change handlers to use updateFormData
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateFormData({ businessLogo: result });
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
    updateFormData({ items: [...formData.items, newItem] });
  };

  const removeItem = (id: string) => {
    updateFormData({ items: formData.items.filter(item => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = formData.items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateFormData({ items: updatedItems });
  };

  const generateInvoiceNumber = () => {
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${number}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const invoiceData = {
        ...formData,
        id: formData.id || generateInvoiceNumber(),
        invoiceNumber: formData.invoiceNumber || generateInvoiceNumber(),
      };

      // Save to database
      const { error } = await supabase.from('invoices').insert({
        user_id: user?.id,
        invoice_number: invoiceData.invoiceNumber,
        type: invoiceData.type,
        data: invoiceData as any,
      });

      if (error) throw error;

      // Save profile
      await saveProfile();

      // Trigger PDF export using the preview
      window.print();

      setFormData(prev => ({ ...prev, ...invoiceData }));
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Customization */}
        <Collapsible open={customizationOpen} onOpenChange={setCustomizationOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Document Customization
                  </span>
                  {customizationOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div>
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        className={`relative h-12 rounded-md border-2 transition-all ${
                          formData.colorScheme === scheme.id 
                            ? 'border-gray-900 dark:border-white scale-110' 
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ 
                          background: `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)` 
                        }}
                        onClick={() => setFormData(prev => ({ ...prev, colorScheme: scheme.id }))}
                        title={scheme.name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {colorSchemes.find(s => s.id === formData.colorScheme)?.name}
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Business Information - Collapsible */}
        <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  Business Information
                  {businessOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
                    onChange={(e) => updateFormData({ businessName: e.target.value })}
                    placeholder="Your Business Name"
                  />
                </div>

                <div>
                  <Label htmlFor="businessLogo">Business Logo</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="businessLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
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
                    onChange={(e) => updateFormData({ businessAddress: e.target.value })}
                    placeholder="Business Address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="businessPhone">Phone</Label>
                    <Input
                      id="businessPhone"
                      value={formData.businessPhone}
                      onChange={(e) => updateFormData({ businessPhone: e.target.value })}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={formData.businessEmail}
                      onChange={(e) => updateFormData({ businessEmail: e.target.value })}
                      placeholder="business@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input
                    id="businessWebsite"
                    value={formData.businessWebsite}
                    onChange={(e) => updateFormData({ businessWebsite: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Client Information - Collapsible */}
        <Collapsible open={clientOpen} onOpenChange={setClientOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  Client Information
                  {clientOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
                    onChange={(e) => updateFormData({ clientName: e.target.value })}
                    placeholder="Client Name"
                  />
                </div>

                <div>
                  <Label htmlFor="clientAddress">Client Address</Label>
                  <Textarea
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => updateFormData({ clientAddress: e.target.value })}
                    placeholder="Client Address"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={formData.clientPhone}
                      onChange={(e) => updateFormData({ clientPhone: e.target.value })}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => updateFormData({ clientEmail: e.target.value })}
                      placeholder="client@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Document Details - Collapsible */}
        <Collapsible open={documentDetailsOpen} onOpenChange={setDocumentDetailsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  Invoice Details
                  {documentDetailsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={(e) => updateFormData({ invoiceNumber: e.target.value })}
                      placeholder="INV-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoiceDate">Invoice Date</Label>
                    <Input
                      id="invoiceDate"
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => updateFormData({ invoiceDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateFormData({ dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => updateFormData({ currency: value })}>
                    <SelectTrigger>
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
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Items - Collapsible */}
        <Collapsible open={itemsOpen} onOpenChange={setItemsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  Items
                  {itemsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                    <div className="md:col-span-2">
                      <Label htmlFor={`description-${item.id}`}>Description</Label>
                      <Input
                        id={`description-${item.id}`}
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Item Description"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unitPrice-${item.id}`}>Unit Price</Label>
                      <Input
                        id={`unitPrice-${item.id}`}
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`taxRate-${item.id}`}>Tax Rate (%)</Label>
                      <Input
                        id={`taxRate-${item.id}`}
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => updateItem(item.id, 'taxRate', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`discount-${item.id}`}>Discount (%)</Label>
                      <Input
                        id={`discount-${item.id}`}
                        type="number"
                        value={item.discount}
                        onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={addItem} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Notes and Terms - Collapsible */}
        <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <CardTitle className="flex items-center justify-between">
                  Notes & Terms
                  {notesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
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
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    placeholder="Additional notes or comments"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Terms & Conditions</Label>
                  <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => updateFormData({ terms: e.target.value })}
                    placeholder="Payment terms and conditions"
                    rows={3}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        <div className="flex gap-4">
          <Button onClick={saveProfile} variant="outline" className="flex-1">
            Save Profile
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? 'Processing...' : 'Export PDF'}
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="lg:sticky lg:top-6">
        <InvoicePreview data={formData} colorScheme={formData.colorScheme} />
      </div>
    </>
  );
};
