import { z } from 'zod';

// Invoice Item validation schema
export const invoiceItemSchema = z.object({
  id: z.string().uuid(),
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  quantity: z.number().positive("Quantity must be greater than 0").max(999999, "Quantity is too large"),
  unitPrice: z.number().nonnegative("Unit price must be 0 or greater").max(999999999, "Unit price is too large"),
  taxRate: z.number().nonnegative("Tax rate must be 0 or greater").max(100, "Tax rate cannot exceed 100%"),
  discount: z.number().nonnegative("Discount must be 0 or greater").max(100, "Discount cannot exceed 100%"),
});

// Invoice Data validation schema
export const invoiceDataSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['invoice', 'receipt']),
  
  // Business Information - with length limits
  businessName: z.string().trim().max(200, "Business name must be less than 200 characters").optional().default(''),
  businessLogo: z.string().trim().max(1000, "Logo URL must be less than 1000 characters").optional().default(''),
  businessAddress: z.string().trim().max(500, "Business address must be less than 500 characters").optional().default(''),
  businessPhone: z.string().trim().max(50, "Business phone must be less than 50 characters").optional().default(''),
  businessEmail: z.string().trim().max(255, "Business email must be less than 255 characters").email("Invalid email format").or(z.literal('')).optional().default(''),
  businessWebsite: z.string().trim().max(500, "Business website must be less than 500 characters").optional().default(''),
  
  // Client Information - with length limits
  clientName: z.string().trim().max(200, "Client name must be less than 200 characters").optional().default(''),
  clientAddress: z.string().trim().max(500, "Client address must be less than 500 characters").optional().default(''),
  clientPhone: z.string().trim().max(50, "Client phone must be less than 50 characters").optional().default(''),
  clientEmail: z.string().trim().max(255, "Client email must be less than 255 characters").email("Invalid email format").or(z.literal('')).optional().default(''),
  
  // Invoice Details
  invoiceNumber: z.string().trim().max(100, "Invoice number must be less than 100 characters").optional().default(''),
  invoiceDate: z.string().trim().max(50, "Invoice date must be less than 50 characters").optional().default(''),
  dueDate: z.string().trim().max(50, "Due date must be less than 50 characters").optional().default(''),
  paymentDate: z.string().trim().max(50, "Payment date must be less than 50 characters").optional(),
  paymentMethod: z.string().trim().max(100, "Payment method must be less than 100 characters").optional(),
  currency: z.string().trim().min(1, "Currency is required").max(10, "Currency code must be less than 10 characters"),
  
  // Items - validate array
  items: z.array(invoiceItemSchema).max(1000, "Cannot have more than 1000 items"),
  
  // Additional Info - with length limits
  notes: z.string().trim().max(5000, "Notes must be less than 5000 characters").optional().default(''),
  terms: z.string().trim().max(3000, "Terms must be less than 3000 characters").optional().default(''),
  
  // Receipt specific
  amountPaid: z.number().nonnegative("Amount paid must be 0 or greater").max(999999999, "Amount paid is too large").optional(),
  
  // Customization
  colorScheme: z.string().trim().max(50, "Color scheme must be less than 50 characters"),
  darkMode: z.boolean().optional(),
  watermarkColor: z.string().trim().max(50, "Watermark color must be less than 50 characters").optional(),
  watermarkOpacity: z.number().min(0).max(1).optional(),
  watermarkDensity: z.number().min(0).max(100).optional(),
});

// Client Data validation schema
export const clientDataSchema = z.object({
  name: z.string().trim().max(200, "Client name must be less than 200 characters").optional().default(''),
  address: z.string().trim().max(500, "Client address must be less than 500 characters").optional().default(''),
  phone: z.string().trim().max(50, "Client phone must be less than 50 characters").optional().default(''),
  email: z.string().trim().max(255, "Client email must be less than 255 characters").email("Invalid email format").or(z.literal('')).optional().default(''),
});

// Profile Data validation schema
export const profileDataSchema = z.object({
  business_name: z.string().trim().max(200, "Business name must be less than 200 characters").optional(),
  business_logo: z.string().trim().max(1000, "Logo URL must be less than 1000 characters").optional(),
  business_address: z.string().trim().max(500, "Business address must be less than 500 characters").optional(),
  business_phone: z.string().trim().max(50, "Business phone must be less than 50 characters").optional(),
  business_email: z.string().trim().max(255, "Business email must be less than 255 characters").email("Invalid email format").or(z.literal('')).optional(),
  business_website: z.string().trim().max(500, "Business website must be less than 500 characters").optional(),
  default_currency: z.string().trim().max(10, "Currency code must be less than 10 characters").optional(),
});

// Draft Data validation schema
export const draftDataSchema = z.object({
  invoice_number: z.string().trim().max(100, "Invoice number must be less than 100 characters").optional(),
  invoice_date: z.string().trim().max(50, "Invoice date must be less than 50 characters").optional(),
  due_date: z.string().trim().max(50, "Due date must be less than 50 characters").optional(),
  payment_date: z.string().trim().max(50, "Payment date must be less than 50 characters").optional(),
  payment_method: z.string().trim().max(100, "Payment method must be less than 100 characters").optional(),
  currency: z.string().trim().max(10, "Currency code must be less than 10 characters").optional(),
  notes: z.string().trim().max(5000, "Notes must be less than 5000 characters").optional(),
  terms: z.string().trim().max(3000, "Terms must be less than 3000 characters").optional(),
  amount_paid: z.number().nonnegative("Amount paid must be 0 or greater").max(999999999, "Amount paid is too large").optional(),
});

// Email request validation schema for edge function
export const emailRequestSchema = z.object({
  recipientEmail: z.string().trim().email("Invalid recipient email format").max(255, "Email must be less than 255 characters"),
  pdfData: z.string().min(1, "PDF data is required"),
  invoiceData: invoiceDataSchema,
});

// Type exports
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;
export type InvoiceDataInput = z.infer<typeof invoiceDataSchema>;
export type ClientDataInput = z.infer<typeof clientDataSchema>;
export type ProfileDataInput = z.infer<typeof profileDataSchema>;
export type DraftDataInput = z.infer<typeof draftDataSchema>;
export type EmailRequestInput = z.infer<typeof emailRequestSchema>;
