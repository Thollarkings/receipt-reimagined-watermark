
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Receipt, Settings, LogOut, Menu, Plus } from 'lucide-react';
import AuthForm from '@/components/auth/AuthForm';
import InvoiceForm from '@/components/invoice/InvoiceForm';
import ReceiptForm from '@/components/receipt/ReceiptForm';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('invoices');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <AuthForm />;
  }

  const menuItems = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const Sidebar = ({ mobile = false }) => (
    <div className={`${mobile ? 'w-full' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          InvoicePro
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Professional Invoicing</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className="w-full justify-start gap-3"
              onClick={() => {
                setActiveTab(item.id);
                if (mobile) setMobileMenuOpen(false);
              }}
            >
              <IconComponent className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="lg:hidden" /> {/* Spacer for mobile menu button */}
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {activeTab}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.email}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {activeTab === 'invoices' && <InvoiceForm />}
          {activeTab === 'receipts' && <ReceiptForm />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
};

export default Index;
