
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthModal } from '@/components/Auth/AuthModal';
import { UserMenu } from '@/components/Auth/UserMenu';
import { InvoiceForm } from '@/components/InvoiceForm';
import { InvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LogIn, FileText, CreditCard, Download } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';

const Index = () => {
  const { user, loading } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async (data: InvoiceData) => {
    try {
      await generatePDF(data);
      toast({
        title: "PDF Export Successful",
        description: `${data.type === 'invoice' ? 'Invoice' : 'Receipt'} #${data.invoiceNumber} has been downloaded as PDF`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
              InvoiceMax
            </h1>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create stunning, professional invoices and receipts with bold, modern designs. 
              Advanced customization with watermarks, multiple currencies, and beautiful themes.
            </p>
            <Button 
              onClick={() => setAuthModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            >
              <LogIn className="mr-3 h-6 w-6" />
              Get Started Free
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 hover:bg-gray-800/70 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Beautiful Themes</h3>
              <p className="text-gray-300 text-lg">Choose from 7 stunning color themes to match your brand perfectly</p>
            </div>
            
            <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 hover:bg-gray-800/70 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Multi-Currency</h3>
              <p className="text-gray-300 text-lg">Support for all major currencies worldwide with live conversion</p>
            </div>
            
            <div className="text-center p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 hover:bg-gray-800/70 transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">PDF Export</h3>
              <p className="text-gray-300 text-lg">Export your invoices and receipts as high-quality PDFs</p>
            </div>
          </div>

          <div className="text-center">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30">
                <h4 className="text-xl font-semibold text-white mb-3">Advanced Watermarks</h4>
                <p className="text-gray-400">Customize watermark color, opacity, and density for professional branding</p>
              </div>
              <div className="p-6 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/30">
                <h4 className="text-xl font-semibold text-white mb-3">Dark Mode Receipts</h4>
                <p className="text-gray-400">Modern dark theme receipts with bold, vibrant colors</p>
              </div>
            </div>
          </div>
        </div>

        <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <header className="bg-gray-800/50 shadow-sm border-b border-gray-700/50 sticky top-0 z-50 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            InvoiceMax
          </h1>
          <UserMenu />
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="max-w-7xl mx-auto">
          <InvoiceForm onExportPDF={handleExportPDF} />
        </div>
      </main>
    </div>
  );
};

export default Index;
