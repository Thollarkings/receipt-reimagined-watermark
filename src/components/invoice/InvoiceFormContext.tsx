
import React, { createContext, useContext } from 'react';
import { InvoiceData, InvoiceItem } from '@/types/invoice';

interface InvoiceFormContextType {
  invoiceData: InvoiceData;
  clientEmail: string;
  loading: boolean;
  isSending: boolean;
  saving: boolean;
  handleBusinessInfoChange: (field: keyof InvoiceData, value: string) => void;
  handleClientInfoChange: (field: keyof InvoiceData, value: string) => void;
  handleDocumentDetailsChange: (field: keyof InvoiceData, value: string) => void;
  handleCurrencyChange: (currency: string) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  handleNotesChange: (notes: string) => void;
  handleTermsChange: (terms: string) => void;
  handleExportPDF: () => Promise<void>;
  handleSendEmail: () => Promise<void>;
  setClientEmail: (email: string) => void;
}

export const InvoiceFormContext = createContext<InvoiceFormContextType | undefined>(undefined);

export const useInvoiceForm = () => {
  const context = useContext(InvoiceFormContext);
  if (context === undefined) {
    throw new Error('useInvoiceForm must be used within an InvoiceFormProvider');
  }
  return context;
};

