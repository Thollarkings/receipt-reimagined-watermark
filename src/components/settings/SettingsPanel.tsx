
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, Upload, Download, Trash2, User, Building, Palette, Database } from 'lucide-react';
import { currencies } from '@/lib/currencies';
import { useToast } from '@/hooks/use-toast';

const SettingsPanel = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Business Profile
    businessName: '',
    businessLogo: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    businessWebsite: '',
    taxId: '',
    
    // Default Settings
    defaultCurrency: 'USD',
    defaultTaxRate: 0,
    defaultPaymentTerms: '30',
    
    // Invoice Settings
    invoicePrefix: 'INV',
    invoiceStartNumber: 1000,
    receiptPrefix: 'REC',
    receiptStartNumber: 1000,
    
    // Preferences
    autoSave: true,
    darkMode: false,
    notifications: true,
    emailNotifications: false,
    
    // Templates
    invoiceTemplate: 'professional',
    receiptTemplate: 'modern',
    defaultColorScheme: 'blue',
    
    // Terms & Conditions
    defaultInvoiceTerms: 'Payment is due within 30 days of invoice date. Late fees may apply.',
    defaultReceiptNotes: 'Thank you for your business!'
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({
          ...prev,
          businessLogo: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Save settings to local storage or backend
    localStorage.setItem('invoiceapp_settings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'invoiceapp-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          toast({
            title: "Settings Imported",
            description: "Your settings have been imported successfully.",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to import settings. Please check the file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      localStorage.removeItem('invoiceapp_settings');
      setSettings({
        businessName: '',
        businessLogo: '',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        businessWebsite: '',
        taxId: '',
        defaultCurrency: 'USD',
        defaultTaxRate: 0,
        defaultPaymentTerms: '30',
        invoicePrefix: 'INV',
        invoiceStartNumber: 1000,
        receiptPrefix: 'REC',
        receiptStartNumber: 1000,
        autoSave: true,
        darkMode: false,
        notifications: true,
        emailNotifications: false,
        invoiceTemplate: 'professional',
        receiptTemplate: 'modern',
        defaultColorScheme: 'blue',
        defaultInvoiceTerms: 'Payment is due within 30 days of invoice date. Late fees may apply.',
        defaultReceiptNotes: 'Thank you for your business!'
      });
      toast({
        title: "Settings Reset",
        description: "All settings have been reset to default values.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleReset} className="gap-2 text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Profile
            </CardTitle>
            <CardDescription>
              Configure your business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e) => setSettings(prev => ({ ...prev, businessName: e.target.value }))}
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
                {settings.businessLogo && (
                  <img src={settings.businessLogo} alt="Logo" className="h-10 w-10 object-contain border rounded" />
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="businessAddress">Business Address</Label>
              <Textarea
                id="businessAddress"
                value={settings.businessAddress}
                onChange={(e) => setSettings(prev => ({ ...prev, businessAddress: e.target.value }))}
                placeholder="Business Address"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="businessPhone">Phone</Label>
                <Input
                  id="businessPhone"
                  value={settings.businessPhone}
                  onChange={(e) => setSettings(prev => ({ ...prev, businessPhone: e.target.value }))}
                  placeholder="Phone Number"
                />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={settings.taxId}
                  onChange={(e) => setSettings(prev => ({ ...prev, taxId: e.target.value }))}
                  placeholder="Tax ID Number"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="businessEmail">Email</Label>
              <Input
                id="businessEmail"
                type="email"
                value={settings.businessEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, businessEmail: e.target.value }))}
                placeholder="business@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="businessWebsite">Website</Label>
              <Input
                id="businessWebsite"
                value={settings.businessWebsite}
                onChange={(e) => setSettings(prev => ({ ...prev, businessWebsite: e.target.value }))}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Default Settings
            </CardTitle>
            <CardDescription>
              Set default values for new invoices and receipts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select value={settings.defaultCurrency} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultCurrency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.slice(0, 10).map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  value={settings.defaultTaxRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultTaxRate: Number(e.target.value) }))}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>
              <div>
                <Label htmlFor="defaultPaymentTerms">Payment Terms (days)</Label>
                <Input
                  id="defaultPaymentTerms"
                  value={settings.defaultPaymentTerms}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultPaymentTerms: e.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                  placeholder="INV"
                />
              </div>
              <div>
                <Label htmlFor="invoiceStartNumber">Invoice Start Number</Label>
                <Input
                  id="invoiceStartNumber"
                  type="number"
                  value={settings.invoiceStartNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, invoiceStartNumber: Number(e.target.value) }))}
                  min="1"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="receiptPrefix">Receipt Prefix</Label>
                <Input
                  id="receiptPrefix"
                  value={settings.receiptPrefix}
                  onChange={(e) => setSettings(prev => ({ ...prev, receiptPrefix: e.target.value }))}
                  placeholder="REC"
                />
              </div>
              <div>
                <Label htmlFor="receiptStartNumber">Receipt Start Number</Label>
                <Input
                  id="receiptStartNumber"
                  type="number"
                  value={settings.receiptStartNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, receiptStartNumber: Number(e.target.value) }))}
                  min="1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultColorScheme">Default Color Scheme</Label>
              <Select value={settings.defaultColorScheme} onValueChange={(value) => setSettings(prev => ({ ...prev, defaultColorScheme: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Ocean Blue</SelectItem>
                  <SelectItem value="purple">Royal Purple</SelectItem>
                  <SelectItem value="green">Forest Green</SelectItem>
                  <SelectItem value="red">Crimson Red</SelectItem>
                  <SelectItem value="orange">Sunset Orange</SelectItem>
                  <SelectItem value="teal">Ocean Teal</SelectItem>
                  <SelectItem value="indigo">Deep Indigo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="darkMode">Dark Mode</Label>
                  <p className="text-sm text-gray-500">Enable dark theme</p>
                </div>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSave">Auto Save</Label>
                  <p className="text-sm text-gray-500">Automatically save drafts</p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSave: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-gray-500">Show app notifications</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email reminders</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Default Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Default Terms & Notes</CardTitle>
            <CardDescription>
              Set default text for invoices and receipts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultInvoiceTerms">Default Invoice Terms</Label>
              <Textarea
                id="defaultInvoiceTerms"
                value={settings.defaultInvoiceTerms}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultInvoiceTerms: e.target.value }))}
                placeholder="Payment terms and conditions"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="defaultReceiptNotes">Default Receipt Notes</Label>
              <Textarea
                id="defaultReceiptNotes"
                value={settings.defaultReceiptNotes}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultReceiptNotes: e.target.value }))}
                placeholder="Thank you message for receipts"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Import/Export */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Import or export your settings and data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="importSettings" className="cursor-pointer">
                <Button variant="outline" className="gap-2" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    Import Settings
                  </span>
                </Button>
              </Label>
              <Input
                id="importSettings"
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500">
              Import settings from a previously exported file
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPanel;
