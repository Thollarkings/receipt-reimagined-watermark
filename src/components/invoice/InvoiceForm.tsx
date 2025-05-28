
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Download, Eye } from 'lucide-react';
import { currencies } from '@/lib/currencies';
import InvoicePreview from './InvoicePreview';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

interface InvoiceData {
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
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
}

const InvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
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
    currency: 'USD',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }],
    notes: '',
    terms: ''
  });

  const [colorScheme, setColorScheme] = useState('blue');

  const colorSchemes = [
    { id: 'blue', name: 'Ocean Blue', primary: '#1e40af', secondary: '#3b82f6' },
    { id: 'purple', name: 'Royal Purple', primary: '#7c3aed', secondary: '#a855f7' },
    { id: 'green', name: 'Forest Green', primary: '#059669', secondary: '#10b981' },
    { id: 'red', name: 'Crimson Red', primary: '#dc2626', secondary: '#ef4444' },
    { id: 'orange', name: 'Sunset Orange', primary: '#ea580c', secondary: '#f97316' },
    { id: 'teal', name: 'Ocean Teal', primary: '#0d9488', secondary: '#14b8a6' },
    { id: 'indigo', name: 'Deep Indigo', primary: '#4338ca', secondary: '#6366f1' }
  ];

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discount: 0
    };
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (id: string) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData(prev => ({
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
        setInvoiceData(prev => ({
          ...prev,
          businessLogo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <InvoicePreview data={invoiceData} colorScheme={colorScheme} />
            </DialogContent>
          </Dialog>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={invoiceData.businessName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessName: e.target.value }))}
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
                value={invoiceData.businessAddress}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessAddress: e.target.value }))}
                placeholder="Business Address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="businessPhone">Phone</Label>
              <Input
                id="businessPhone"
                value={invoiceData.businessPhone}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessPhone: e.target.value }))}
                placeholder="Phone Number"
              />
            </div>
            <div>
              <Label htmlFor="businessEmail">Email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={invoiceData.businessEmail}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessEmail: e.target.value }))}
                placeholder="Email Address"
              />
            </div>
            <div>
              <Label htmlFor="businessWebsite">Website</Label>
              <Input
                id="businessWebsite"
                value={invoiceData.businessWebsite}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, businessWebsite: e.target.value }))}
                placeholder="Website URL"
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={invoiceData.clientName}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Client Name"
              />
            </div>
            <div>
              <Label htmlFor="clientAddress">Address</Label>
              <Textarea
                id="clientAddress"
                value={invoiceData.clientAddress}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                placeholder="Client Address"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Phone</Label>
              <Input
                id="clientPhone"
                value={invoiceData.clientPhone}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, clientPhone: e.target.value }))}
                placeholder="Phone Number"
              />
            </div>
            <div>
              <Label htmlFor="clientEmail">Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={invoiceData.clientEmail}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, clientEmail: e.target.value }))}
                placeholder="Email Address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceData.invoiceDate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={invoiceData.currency} onValueChange={(value) => setInvoiceData(prev => ({ ...prev, currency: value }))}>
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
              <Label htmlFor="colorScheme">Color Scheme</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorSchemes.map((scheme) => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: scheme.primary }}
                        />
                        {scheme.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button onClick={addItem} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoiceData.items.map((item, index) => (
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
                    disabled={invoiceData.items.length === 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or comments"
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={invoiceData.terms}
              onChange={(e) => setInvoiceData(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Payment terms and conditions"
              rows={4}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceForm;
