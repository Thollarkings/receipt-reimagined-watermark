
import React from 'react';
import { getCurrencySymbol } from '@/lib/currencies';

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

interface InvoicePreviewProps {
  data: InvoiceData;
  colorScheme: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data, colorScheme }) => {
  const colorSchemes = {
    blue: { primary: '#1e40af', secondary: '#3b82f6', light: '#dbeafe' },
    purple: { primary: '#7c3aed', secondary: '#a855f7', light: '#e9d5ff' },
    green: { primary: '#059669', secondary: '#10b981', light: '#d1fae5' },
    red: { primary: '#dc2626', secondary: '#ef4444', light: '#fee2e2' },
    orange: { primary: '#ea580c', secondary: '#f97316', light: '#fed7aa' },
    teal: { primary: '#0d9488', secondary: '#14b8a6', light: '#ccfbf1' },
    indigo: { primary: '#4338ca', secondary: '#6366f1', light: '#e0e7ff' }
  };

  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.blue;
  const currencySymbol = getCurrencySymbol(data.currency);

  const calculateItemTotal = (item: InvoiceItem) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = (subtotal * item.discount) / 100;
    const discountedTotal = subtotal - discountAmount;
    const taxAmount = (discountedTotal * item.taxRate) / 100;
    return discountedTotal + taxAmount;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    data.items.forEach(item => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const discountAmount = (itemSubtotal * item.discount) / 100;
      const discountedTotal = itemSubtotal - discountAmount;
      const taxAmount = (discountedTotal * item.taxRate) / 100;

      subtotal += itemSubtotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;
    });

    const total = subtotal - totalDiscount + totalTax;

    return { subtotal, totalDiscount, totalTax, total };
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg" style={{ fontFamily: 'system-ui' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-4">
          {data.businessLogo && (
            <img src={data.businessLogo} alt="Business Logo" className="h-16 w-16 object-contain" />
          )}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.primary }}>
              {data.businessName}
            </h1>
            <div className="text-sm text-gray-600 mt-1">
              {data.businessPhone && <div>Phone: {data.businessPhone}</div>}
              {data.businessEmail && <div>Email: {data.businessEmail}</div>}
              {data.businessWebsite && <div>Web: {data.businessWebsite}</div>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>INVOICE</h2>
          <div className="text-sm space-y-1">
            <div><strong>Invoice No:</strong> {data.invoiceNumber}</div>
            <div><strong>Date:</strong> {data.invoiceDate}</div>
            {data.dueDate && <div><strong>Due Date:</strong> {data.dueDate}</div>}
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>From:</h3>
          <div className="text-sm">
            <div className="font-medium">{data.businessName}</div>
            <div className="whitespace-pre-line">{data.businessAddress}</div>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>To:</h3>
          <div className="text-sm">
            <div className="font-medium">{data.clientName}</div>
            <div className="whitespace-pre-line">{data.clientAddress}</div>
            {data.clientPhone && <div>Phone: {data.clientPhone}</div>}
            {data.clientEmail && <div>Email: {data.clientEmail}</div>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: colors.light }}>
              <th className="border border-gray-300 p-3 text-left">Description</th>
              <th className="border border-gray-300 p-3 text-center">Qty</th>
              <th className="border border-gray-300 p-3 text-right">Unit Price</th>
              <th className="border border-gray-300 p-3 text-right">Discount</th>
              <th className="border border-gray-300 p-3 text-right">Tax</th>
              <th className="border border-gray-300 p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 p-3">{item.description}</td>
                <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-3 text-right">
                  {currencySymbol}{item.unitPrice.toFixed(2)}
                </td>
                <td className="border border-gray-300 p-3 text-right">{item.discount}%</td>
                <td className="border border-gray-300 p-3 text-right">{item.taxRate}%</td>
                <td className="border border-gray-300 p-3 text-right">
                  {currencySymbol}{calculateItemTotal(item).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="space-y-2 text-right">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{currencySymbol}{totals.subtotal.toFixed(2)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between">
                <span>Total Discount:</span>
                <span>-{currencySymbol}{totals.totalDiscount.toFixed(2)}</span>
              </div>
            )}
            {totals.totalTax > 0 && (
              <div className="flex justify-between">
                <span>Total Tax:</span>
                <span>{currencySymbol}{totals.totalTax.toFixed(2)}</span>
              </div>
            )}
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold" style={{ color: colors.primary }}>
              <span>TOTAL:</span>
              <span>{currencySymbol}{totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(data.notes || data.terms) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.notes && (
            <div>
              <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>Notes:</h3>
              <p className="text-sm whitespace-pre-line">{data.notes}</p>
            </div>
          )}
          {data.terms && (
            <div>
              <h3 className="font-semibold mb-2" style={{ color: colors.primary }}>Terms & Conditions:</h3>
              <p className="text-sm whitespace-pre-line">{data.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;
