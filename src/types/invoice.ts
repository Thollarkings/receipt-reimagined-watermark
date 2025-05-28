
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
}

export interface InvoiceData {
  id: string;
  type: 'invoice' | 'receipt';
  
  // Business Information
  businessName: string;
  businessLogo: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  businessWebsite: string;
  
  // Client Information
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  
  // Invoice Details
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  currency: string;
  
  // Items
  items: InvoiceItem[];
  
  // Additional Info
  notes: string;
  terms: string;
  
  // Receipt specific
  amountPaid?: number;
  
  // Customization
  colorScheme: string;
  darkMode?: boolean;
  watermarkColor?: string;
  watermarkOpacity?: number;
  watermarkDensity?: number;
}
