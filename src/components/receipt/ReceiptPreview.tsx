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
    blue: { primary: '#2563eb', secondary: '#3b82f6', light: '#dbeafe' },
    purple: { primary: '#9333ea', secondary: '#a855f7', light: '#e9d5ff' },
    green: { primary: '#16a34a', secondary: '#22c55e', light: '#d1fae5' },
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
    
    // Create randomized watermark pattern
    const generateRandomPattern = () => {
      const patterns = [];
      const instanceCount = Math.floor((watermarkDensity || 30) / 10);
      
      for (let i = 0; i < instanceCount; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const rotation = Math.random() * 60 - 30; // Random rotation between -30 and 30 degrees
        const scale = 0.8 + Math.random() * 0.4; // Random scale between 0.8 and 1.2
        
        patterns.push(`
          <div style="
            position: absolute;
            left: ${x}%;
            top: ${y}%;
            transform: rotate(${rotation}deg) scale(${scale});
            color: rgba(${rgbColor}, ${opacity});
            font-size: 24px;
            font-weight: bold;
            white-space: nowrap;
            pointer-events: none;
            user-select: none;
          ">
            ${data.businessName}
          </div>
        `);
      }
      
      return patterns.join('');
    };
    
    return {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none' as const,
      zIndex: 1,
      overflow: 'hidden',
    };
  };

  const renderWatermark = () => {
    if (!data.businessName) return null;
    
    const rgbColor = hexToRgb(watermarkColor);
    const opacity = watermarkOpacity / 100;
    const instanceCount = Math.floor((watermarkDensity || 30) / 8);
    
    const watermarkInstances = [];
    for (let i = 0; i < instanceCount; i++) {
      const x = Math.random() * 90 + 5; // 5% to 95% to keep within bounds
      const y = Math.random() * 90 + 5;
      const rotation = Math.random() * 60 - 30;
      const scale = 0.7 + Math.random() * 0.6;
      
      watermarkInstances.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${rotation}deg) scale(${scale})`,
            color: `rgba(${rgbColor}, ${opacity})`,
            fontSize: '20px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {data.businessName}
        </div>
      );
    }
    
    return watermarkInstances;
  };

  return (
    <div className="relative">
      <div 
        className={`max-w-4xl mx-auto p-8 shadow-2xl relative overflow-hidden ${
          darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'
        }`} 
        style={{ fontFamily: 'system-ui', minHeight: '600px' }}
      >
        {/* Watermark */}
        {data.businessName && (
          <div style={getWatermarkStyle()}>
            {renderWatermark()}
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
                <h1 className="text-3xl font-bold" style={{ color: colors.primary }}>
                  {data.businessName}
                </h1>
                <div className="text-sm mt-2" style={{ color: darkMode ? '#d1d5db' : '#6b7280' }}>
                  {data.businessPhone && <div className="font-medium">Phone: {data.businessPhone}</div>}
                  {data.businessEmail && <div className="font-medium">Email: {data.businessEmail}</div>}
                  {data.businessWebsite && <div className="font-medium">Web: {data.businessWebsite}</div>}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-bold mb-3" style={{ color: colors.primary }}>RECEIPT</h2>
              <div className="text-sm space-y-1 font-medium">
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
              <h3 className="font-bold mb-3 text-lg" style={{ color: colors.primary }}>From:</h3>
              <div className="text-sm">
                <div className="font-bold text-base">{data.businessName}</div>
                <div className="whitespace-pre-line mt-1">{data.businessAddress}</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-lg" style={{ color: colors.primary }}>To:</h3>
              <div className="text-sm">
                <div className="font-bold text-base">{data.clientName}</div>
                <div className="whitespace-pre-line mt-1">{data.clientAddress}</div>
                {data.clientPhone && <div className="mt-1">Phone: {data.clientPhone}</div>}
                {data.clientEmail && <div>Email: {data.clientEmail}</div>}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse shadow-lg">
              <thead>
                <tr style={{ 
                  backgroundColor: darkMode ? colors.primary + '50' : colors.primary,
                  color: 'white'
                }}>
                  <th className="border border-gray-300 p-4 text-left font-bold">Description</th>
                  <th className="border border-gray-300 p-4 text-center font-bold">Qty</th>
                  <th className="border border-gray-300 p-4 text-right font-bold">Unit Price</th>
                  <th className="border border-gray-300 p-4 text-right font-bold">Discount</th>
                  <th className="border border-gray-300 p-4 text-right font-bold">Tax</th>
                  <th className="border border-gray-300 p-4 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 
                    (darkMode ? 'bg-gray-800' : 'bg-gray-50') : 
                    (darkMode ? 'bg-gray-750' : 'bg-white')
                  }>
                    <td className="border border-gray-300 p-4 font-medium">{item.description}</td>
                    <td className="border border-gray-300 p-4 text-center font-medium">{item.quantity}</td>
                    <td className="border border-gray-300 p-4 text-right font-medium">
                      {currencySymbol}{item.unitPrice.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-4 text-right font-medium">{item.discount}%</td>
                    <td className="border border-gray-300 p-4 text-right font-medium">{item.taxRate}%</td>
                    <td className="border border-gray-300 p-4 text-right font-bold">
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
              <div className="space-y-3 text-right bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-bold">{currencySymbol}{totals.subtotal.toFixed(2)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total Discount:</span>
                    <span className="font-bold text-red-600">-{currencySymbol}{totals.totalDiscount.toFixed(2)}</span>
                  </div>
                )}
                {totals.totalTax > 0 && (
                  <div className="flex justify-between text-lg">
                    <span className="font-medium">Total Tax:</span>
                    <span className="font-bold">{currencySymbol}{totals.totalTax.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-3 border-2" style={{ borderColor: colors.primary }} />
                <div className="flex justify-between text-2xl font-bold" style={{ color: colors.primary }}>
                  <span>TOTAL:</span>
                  <span>{currencySymbol}{totals.total.toFixed(2)}</span>
                </div>
                {data.amountPaid && (
                  <>
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Amount Paid:</span>
                      <span className="font-bold text-green-600">{currencySymbol}{data.amountPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="font-medium">Balance:</span>
                      <span className="font-bold">{currencySymbol}{(totals.total - data.amountPaid).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {data.notes && (
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="font-bold mb-3 text-lg" style={{ color: colors.primary }}>Notes:</h3>
              <p className="text-sm whitespace-pre-line leading-relaxed">{data.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
