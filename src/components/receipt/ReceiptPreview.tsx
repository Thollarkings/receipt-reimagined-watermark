
import React from 'react';
import { getCurrencySymbol } from '@/lib/currencies';

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

interface ReceiptPreviewProps {
  data: ReceiptData;
  colorScheme: string;
  darkMode: boolean;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ data, colorScheme, darkMode }) => {
  const colorSchemes = {
    blue: { primary: '#1e40af', secondary: '#3b82f6', light: '#dbeafe', dark: '#1e3a8a' },
    purple: { primary: '#7c3aed', secondary: '#a855f7', light: '#e9d5ff', dark: '#6b21a8' },
    green: { primary: '#059669', secondary: '#10b981', light: '#d1fae5', dark: '#047857' },
    red: { primary: '#dc2626', secondary: '#ef4444', light: '#fee2e2', dark: '#b91c1c' },
    orange: { primary: '#ea580c', secondary: '#f97316', light: '#fed7aa', dark: '#c2410c' },
    teal: { primary: '#0d9488', secondary: '#14b8a6', light: '#ccfbf1', dark: '#0f766e' },
    indigo: { primary: '#4338ca', secondary: '#6366f1', light: '#e0e7ff', dark: '#3730a3' }
  };

  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.blue;
  const currencySymbol = getCurrencySymbol(data.currency);

  const calculateItemTotal = (item: ReceiptItem) => {
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
    const balance = total - data.amountPaid;

    return { subtotal, totalDiscount, totalTax, total, balance };
  };

  const totals = calculateTotals();

  // Generate watermark pattern
  const generateWatermarkPattern = () => {
    const watermarks = [];
    const watermarkText = data.businessName || 'BUSINESS NAME';
    
    // Calculate how many instances based on density
    const instances = data.watermark.density;
    
    for (let i = 0; i < instances; i++) {
      watermarks.push(
        <div
          key={i}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            transform: `rotate(-45deg) translate(${(i % 3 - 1) * 200}px, ${Math.floor(i / 3) * 150}px)`,
            fontSize: '4rem',
            fontWeight: 'bold',
            color: data.watermark.color,
            opacity: data.watermark.opacity / 100,
            zIndex: 0,
            whiteSpace: 'nowrap'
          }}
        >
          {watermarkText}
        </div>
      );
    }
    
    return watermarks;
  };

  const bgColor = darkMode ? '#1f2937' : '#ffffff';
  const textColor = darkMode ? '#f9fafb' : '#111827';
  const secondaryTextColor = darkMode ? '#d1d5db' : '#6b7280';
  const borderColor = darkMode ? '#374151' : '#d1d5db';

  return (
    <div 
      className="max-w-4xl mx-auto p-8 shadow-lg relative overflow-hidden" 
      style={{ 
        fontFamily: 'system-ui',
        backgroundColor: bgColor,
        color: textColor,
        position: 'relative'
      }}
    >
      {/* Watermark Layer */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        {generateWatermarkPattern()}
      </div>

      {/* Content Layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            {data.businessLogo && (
              <img src={data.businessLogo} alt="Business Logo" className="h-16 w-16 object-contain" />
            )}
            <div>
              <h1 className="text-2xl font-bold" style={{ color: darkMode ? colors.secondary : colors.primary }}>
                {data.businessName}
              </h1>
              <div className="text-sm mt-1" style={{ color: secondaryTextColor }}>
                {data.businessPhone && <div>Phone: {data.businessPhone}</div>}
                {data.businessEmail && <div>Email: {data.businessEmail}</div>}
                {data.businessWebsite && <div>Web: {data.businessWebsite}</div>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <h2 
              className="text-3xl font-bold mb-2" 
              style={{ color: darkMode ? colors.secondary : colors.primary }}
            >
              RECEIPT
            </h2>
            <div className="text-sm space-y-1">
              <div><strong>Receipt No:</strong> {data.receiptNumber}</div>
              <div><strong>Date:</strong> {data.receiptDate}</div>
              <div><strong>Payment Date:</strong> {data.paymentDate}</div>
              <div><strong>Payment Method:</strong> {data.paymentMethod}</div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-2" style={{ color: darkMode ? colors.secondary : colors.primary }}>
              From:
            </h3>
            <div className="text-sm">
              <div className="font-medium">{data.businessName}</div>
              <div className="whitespace-pre-line">{data.businessAddress}</div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2" style={{ color: darkMode ? colors.secondary : colors.primary }}>
              To:
            </h3>
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
              <tr style={{ 
                backgroundColor: darkMode ? colors.dark : colors.light,
                color: darkMode ? '#ffffff' : '#000000'
              }}>
                <th className="border p-3 text-left" style={{ borderColor }}>Description</th>
                <th className="border p-3 text-center" style={{ borderColor }}>Qty</th>
                <th className="border p-3 text-right" style={{ borderColor }}>Unit Price</th>
                <th className="border p-3 text-right" style={{ borderColor }}>Discount</th>
                <th className="border p-3 text-right" style={{ borderColor }}>Tax</th>
                <th className="border p-3 text-right" style={{ borderColor }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="border p-3" style={{ borderColor }}>{item.description}</td>
                  <td className="border p-3 text-center" style={{ borderColor }}>{item.quantity}</td>
                  <td className="border p-3 text-right" style={{ borderColor }}>
                    {currencySymbol}{item.unitPrice.toFixed(2)}
                  </td>
                  <td className="border p-3 text-right" style={{ borderColor }}>{item.discount}%</td>
                  <td className="border p-3 text-right" style={{ borderColor }}>{item.taxRate}%</td>
                  <td className="border p-3 text-right" style={{ borderColor }}>
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
              <hr className="my-2" style={{ borderColor }} />
              <div className="flex justify-between text-lg font-bold">
                <span>TOTAL:</span>
                <span>{currencySymbol}{totals.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold" style={{ color: colors.primary }}>
                <span>AMOUNT PAID:</span>
                <span>{currencySymbol}{data.amountPaid.toFixed(2)}</span>
              </div>
              {totals.balance !== 0 && (
                <div className="flex justify-between text-lg font-bold" style={{ 
                  color: totals.balance > 0 ? '#dc2626' : '#059669'
                }}>
                  <span>{totals.balance > 0 ? 'BALANCE DUE:' : 'CHANGE:'}</span>
                  <span>{currencySymbol}{Math.abs(totals.balance).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div>
            <h3 className="font-semibold mb-2" style={{ color: darkMode ? colors.secondary : colors.primary }}>
              Notes:
            </h3>
            <p className="text-sm whitespace-pre-line">{data.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t" style={{ borderColor }}>
          <p className="text-lg font-semibold" style={{ color: darkMode ? colors.secondary : colors.primary }}>
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreview;
