import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus, Download, Eye, Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { currencies } from '@/lib/currencies';
import { ReceiptPreview } from './ReceiptPreview';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { InvoiceData, InvoiceItem } from '@/types/invoice';

interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

interface WatermarkSettings {
  color: string;
  opacity: number;
  density: number;
}

interface ReceiptData {
  businessName: string;
  businessLogo: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  receiptNumber: string;
  receiptDate: string;
  paymentDate: string;
  paymentMethod: string;
  currency: string;
  items: ReceiptItem[];
  amountPaid: number;
  notes: string;
  watermark: WatermarkSettings;
}

const ReceiptForm = () => {
  const [receiptData, setReceiptData] = useState<ReceiptData>({
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
    receiptNumber: `REC-${Date.now()}`,
    receiptDate: new Date().toISOString().split('T')[0],
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    currency: 'USD',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    amountPaid: 0,
    notes: '',
    watermark: {
      color: '#9ca3af',
      opacity: 20,
      density: 30
    }
  });

  const [colorScheme, setColorScheme] = useState('blue');
  const [darkMode, setDarkMode] = useState(false);
  
  // Collapsible section states
  const [businessOpen, setBusinessOpen] = useState(true);
  const [clientOpen, setClientOpen] = useState(true);
  const [receiptDetailsOpen, setReceiptDetailsOpen] = useState(true);
  const [itemsOpen, setItemsOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);

  const colorSchemes = [
    { id: 'blue', name: 'Ocean Blue', primary: '#1e40af', secondary: '#3b82f6' },
    { id: 'purple', name: 'Royal Purple', primary: '#7c3aed', secondary: '#a855f7' },
    { id: 'green', name: 'Forest Green', primary: '#059669', secondary: '#10b981' },
    { id: 'red', name: 'Crimson Red', primary: '#dc2626', secondary: '#ef4444' },
    { id: 'orange', name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316' },
    { id: 'teal', name: 'Ocean Teal', primary: '#0d9488', secondary: '#14b8a6' },
    { id: 'indigo', name: 'Deep Indigo', primary: '#4338ca', secondary: '#6366f1' }
  ];

  const watermarkColors = [
    { name: 'Light Gray', value: '#e5e7eb' },
    { name: 'Blue Gray', value: '#64748b' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Pink', value: '#ec4899' }
  ];

  const paymentMethods = [
    'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'PayPal', 'Mobile Payment', 'Cryptocurrency', 'Other'
  ];

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discount: 0
    };
    setReceiptData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof ReceiptItem, value: string | number) => {
    setReceiptData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptData(prev => ({
          ...prev,
          businessLogo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateWatermark = (field: keyof WatermarkSettings, value: any) => {
    setReceiptData(prev => ({
      ...prev,
      watermark: {
        ...prev.watermark,
        [field]: value
      }
    }));
  };

  // Convert ReceiptData to InvoiceData format for preview
  const convertToInvoiceData = (): InvoiceData => {
    return {
      id: Date.now().toString(),
      type: 'receipt' as const,
      businessName: receiptData.businessName,
      businessLogo: receiptData.businessLogo,
      businessAddress: receiptData.businessAddress,
      businessPhone: receiptData.businessPhone,
      businessEmail: receiptData.businessEmail,
      businessWebsite: receiptData.businessWebsite,
      clientName: receiptData.clientName,
      clientAddress: receiptData.clientAddress,
      clientPhone: receiptData.clientPhone,
      clientEmail: receiptData.clientEmail,
      invoiceNumber: receiptData.receiptNumber,
      invoiceDate: receiptData.receiptDate,
      dueDate: receiptData.receiptDate,
      paymentDate: receiptData.paymentDate,
      paymentMethod: receiptData.paymentMethod,
      currency: receiptData.currency,
      items: receiptData.items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        discount: item.discount
      })) as InvoiceItem[],
      notes: receiptData.notes,
      terms: '',
      amountPaid: receiptData.amountPaid,
      colorScheme: colorScheme,
      darkMode: darkMode,
      watermarkColor: receiptData.watermark.color,
      watermarkOpacity: receiptData.watermark.opacity,
      watermarkDensity: receiptData.watermark.density
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Receipt</h1>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <ReceiptPreview 
                data={convertToInvoiceData()} 
                colorScheme={colorScheme} 
                darkMode={darkMode} 
              />
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Controls */}
        <div className="space-y-6">
          {/* Document Customization - Moved to top */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Document Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <div className="grid grid-cols-7 gap-2 mt-2">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.id}
                        className={`relative h-12 rounded-md border-2 transition-all ${
                          colorScheme === scheme.id 
                            ? 'border-gray-900 dark:border-white scale-110' 
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ 
                          background: `linear-gradient(135deg, ${scheme.primary} 0%, ${scheme.secondary} 100%)` 
                        }}
                        onClick={() => setColorScheme(scheme.id)}
                        title={scheme.name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Selected: {colorSchemes.find(s => s.id === colorScheme)?.name}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <Switch
                    id="darkMode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                {/* Watermark Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Watermark Settings</h4>
                  
                  <div>
                    <Label htmlFor="watermarkColor">Watermark Color</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {watermarkColors.map((color) => (
                        <button
                          key={color.value}
                          className={`w-full h-10 rounded-md border-2 transition-all ${
                            receiptData.watermark.color === color.value 
                              ? 'border-gray-900 dark:border-white scale-110' 
                              : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => updateWatermark('color', color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Opacity: {receiptData.watermark.opacity}%</Label>
                    </div>
                    <Slider
                      value={[receiptData.watermark.opacity]}
                      onValueChange={(value) => updateWatermark('opacity', value[0])}
                      min={5}
                      max={60}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Density: {receiptData.watermark.density}%</Label>
                    </div>
                    <Slider
                      value={[receiptData.watermark.density]}
                      onValueChange={(value) => updateWatermark('density', value[0])}
                      min={10}
                      max={80}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Information - Collapsible */}
          <Collapsible open={businessOpen} onOpenChange={setBusinessOpen}>
            <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    Business Information ttt
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
                      value={receiptData.businessName}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessLogo">Business Logo</Label>
                    <Input
                      id="businessLogo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessAddress">Address</Label>
                    <Textarea
                      id="businessAddress"
                      value={receiptData.businessAddress}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, businessAddress: e.target.value }))}
                      placeholder="Business Address"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessPhone">Phone</Label>
                    <Input
                      id="businessPhone"
                      value={receiptData.businessPhone}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, businessPhone: e.target.value }))}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessEmail">Email</Label>
                    <Input
                      id="businessEmail"
                      type="email"
                      value={receiptData.businessEmail}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, businessEmail: e.target.value }))}
                      placeholder="Email Address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessWebsite">Website</Label>
                    <Input
                      id="businessWebsite"
                      value={receiptData.businessWebsite}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, businessWebsite: e.target.value }))}
                      placeholder="Website URL"
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
                      value={receiptData.clientName}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, clientName: e.target.value }))}
                      placeholder="Client Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientAddress">Address</Label>
                    <Textarea
                      id="clientAddress"
                      value={receiptData.clientAddress}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, clientAddress: e.target.value }))}
                      placeholder="Client Address"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Phone</Label>
                    <Input
                      id="clientPhone"
                      value={receiptData.clientPhone}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, clientPhone: e.target.value }))}
                      placeholder="Phone Number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={receiptData.clientEmail}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, clientEmail: e.target.value }))}
                      placeholder="Email Address"
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Receipt Details - Collapsible */}
          <Collapsible open={receiptDetailsOpen} onOpenChange={setReceiptDetailsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    Receipt Details
                    {receiptDetailsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="receiptNumber">Receipt Number</Label>
                    <Input
                      id="receiptNumber"
                      value={receiptData.receiptNumber}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, receiptNumber: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="receiptDate">Receipt Date</Label>
                    <Input
                      id="receiptDate"
                      type="date"
                      value={receiptData.receiptDate}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, receiptDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={receiptData.paymentDate}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, paymentDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={receiptData.paymentMethod} onValueChange={(value) => setReceiptData(prev => ({ ...prev, paymentMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={receiptData.currency} onValueChange={(value) => setReceiptData(prev => ({ ...prev, currency: value }))}>
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
                  <div>
                    <Label htmlFor="amountPaid">Amount Paid</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      value={receiptData.amountPaid}
                      onChange={(e) => setReceiptData(prev => ({ ...prev, amountPaid: Number(e.target.value) }))}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Items Section - Collapsible */}
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
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={addItem} size="sm" className="gap-2 mb-4">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                    {receiptData.items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="md:col-span-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                            min="0"
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
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={receiptData.items.length === 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Additional Notes - Collapsible */}
          <Collapsible open={notesOpen} onOpenChange={setNotesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    Additional Notes
                    {notesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Textarea
                    value={receiptData.notes}
                    onChange={(e) => setReceiptData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or comments"
                    rows={4}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-6">
          <ReceiptPreview 
            data={convertToInvoiceData()} 
            colorScheme={colorScheme} 
            darkMode={darkMode}
            watermarkColor={receiptData.watermark.color}
            watermarkOpacity={receiptData.watermark.opacity}
            watermarkDensity={receiptData.watermark.density}
          />
        </div>
      </div>
    </div>
  );
};

export default ReceiptForm;
