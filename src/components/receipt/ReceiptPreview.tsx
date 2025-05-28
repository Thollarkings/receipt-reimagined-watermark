
import React from 'react';
import { getCurrencySymbol } from '@/lib/currencies';
import { InvoiceData } from '@/types/invoice';

interface ReceiptPreviewProps {
  data: InvoiceData;
  colorScheme: string;
  darkMode?: boolean;
  watermarkColor?: string;
  watermarkOpacity?: number;
  watermarkDensity?: number;
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ 
  data, 
  colorScheme, 
  darkMode = false,
  watermarkColor = '#9ca3af',
  watermarkOpacity = 20,
  watermarkDensity = 30
}) => {
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

  const calculateItemTotal = (item: any) => {
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

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '156, 163, 175';
  };

  const getWatermarkStyle = () => {
    if (!data.businessName) return {};
    
    const rgbColor = hexToRgb(watermarkColor);
    const opacity = watermarkOpacity / 100;
    const density = Math.max(10, watermarkDensity);
    
    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none' as const,
      zIndex: 1,
      backgroundImage: `repeating-linear-gradient(
        45deg,
        rgba(${rgbColor}, ${opacity}) 0px,
        rgba(${rgbColor}, ${opacity}) ${Math.max(15, 80 - density)}px,
        transparent ${Math.max(15, 80 - density)}px,
        transparent ${Math.max(30, 160 - density * 2)}px
      )`,
      fontSize: '20px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'rotate(-45deg)',
      overflow: 'hidden',
    };
  };

  return (
    <div className="relative">
      <div 
        className={`max-w-4xl mx-auto p-8 shadow-lg relative overflow-hidden ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
        }`} 
        style={{ fontFamily: 'system-ui', minHeight: '600px' }}
      >
        {/* Watermark */}
        {data.businessName && (
          <div style={getWatermarkStyle()}>
            {Array(Math.ceil(watermarkDensity / 10)).fill(data.businessName).join(' • ')}
          </div>
        )}

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
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
                <div className="text-sm mt-1" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
                  {data.businessPhone && <div>Phone: {data.businessPhone}</div>}
                  {data.businessEmail && <div>Email: {data.businessEmail}</div>}
                  {data.businessWebsite && <div>Web: {data.businessWebsite}</div>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>RECEIPT</h2>
              <div className="text-sm space-y-1">
                <div><strong>Receipt No:</strong> {data.invoiceNumber}</div>
                <div><strong>Date:</strong> {data.invoiceDate}</div>
                {data.paymentDate && <div><strong>Payment Date:</strong> {data.paymentDate}</div>}
                {data.paymentMethod && <div><strong>Payment Method:</strong> {data.paymentMethod}</div>}
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
                <tr style={{ backgroundColor: darkMode ? colors.primary + '40' : colors.light }}>
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
                {data.amountPaid && (
                  <>
                    <div className="flex justify-between">
                      <span>Amount Paid:</span>
                      <span>{currencySymbol}{data.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Balance:</span>
                      <span>{currencySymbol}{(totals.total - data.amountPaid).toFixed(2)}</span>
                    </div>
                  </>
                )}
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
      </div>
    </div>
  );
};
