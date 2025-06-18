
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDraftData } from '@/hooks/useDraftData';
import { useProfileData } from '@/hooks/useProfileData';
import { useEmailSending } from '@/hooks/useEmailSending';
import { useInvoiceStorage } from '@/hooks/useInvoiceStorage';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { generatePDF } from '@/utils/pdfGenerator';
import { useInvoiceFormState } from '@/hooks/useInvoiceFormState';
import { InvoiceFormContext } from './InvoiceFormContext';

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

interface InvoiceFormProviderProps {
  children: (context: InvoiceFormContextType) => ReactNode;
  onExportPDF: (data: InvoiceData) => Promise<void>;
  onDataChange: (data: InvoiceData) => void;
  colorScheme: string;
  documentType: 'invoice' | 'receipt';
  historyData?: InvoiceData | null;
}

export const InvoiceFormProvider: React.FC<InvoiceFormProviderProps> = ({
  children,
  onExportPDF,
  onDataChange,
  colorScheme,
  documentType,
  historyData
}) => {
  const contextValue = useInvoiceFormState({
    onExportPDF,
    onDataChange,
    colorScheme,
    documentType,
    historyData
  });

  return (
    <InvoiceFormContext.Provider value={contextValue}>
      {children(contextValue)}
    </InvoiceFormContext.Provider>
  );
};

export { useInvoiceForm } from './InvoiceFormContext';
