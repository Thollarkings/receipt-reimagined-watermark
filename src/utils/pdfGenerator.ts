
import { InvoiceData } from '@/types/invoice';

export const generatePDF = async (data: InvoiceData): Promise<void> => {
  // Create a temporary element to render the invoice/receipt
  const printElement = document.createElement('div');
  printElement.innerHTML = createPrintableHTML(data);
  
  // Apply styles
  const style = document.createElement('style');
  style.textContent = getPrintStyles();
  printElement.appendChild(style);
  
  // Add to body temporarily
  document.body.appendChild(printElement);
  
  // Use browser's print functionality
  const originalContent = document.body.innerHTML;
  document.body.innerHTML = printElement.innerHTML;
  
  // Set page title for PDF
  const originalTitle = document.title;
  document.title = `${data.type.toUpperCase()}-${data.invoiceNumber}`;
  
  // Trigger print
  window.print();
  
  // Restore original content
  document.body.innerHTML = originalContent;
  document.title = originalTitle;
  
  // Clean up
  if (printElement.parentNode) {
    printElement.parentNode.removeChild(printElement);
  }
};

const createPrintableHTML = (data: InvoiceData): string => {
  const colorSchemes = {
    blue: { primary: '#1e40af', secondary: '#3b82f6', light: '#dbeafe' },
    purple: { primary: '#7c3aed', secondary: '#a855f7', light: '#e9d5ff' },
    green: { primary: '#059669', secondary: '#10b981', light: '#d1fae5' },
    red: { primary: '#dc2626', secondary: '#ef4444', light: '#fee2e2' },
    orange: { primary: '#ea580c', secondary: '#f97316', light: '#fed7aa' },
    teal: { primary: '#0d9488', secondary: '#14b8a6', light: '#ccfbf1' },
    indigo: { primary: '#4338ca', secondary: '#6366f1', light: '#e0e7ff' }
  };

  const colors = colorSchemes[data.colorScheme as keyof typeof colorSchemes] || colorSchemes.blue;
  
  // Calculate totals
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

  const watermarkStyle = data.type === 'receipt' && data.businessName ? `
    <div class="watermark" style="
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      background-image: repeating-linear-gradient(
        45deg,
        rgba(${hexToRgb(data.watermarkColor || '#9ca3af')}, ${(data.watermarkOpacity || 20) / 100}) 0px,
        rgba(${hexToRgb(data.watermarkColor || '#9ca3af')}, ${(data.watermarkOpacity || 20) / 100}) ${Math.max(20, 100 - (data.watermarkDensity || 30))}px,
        transparent ${Math.max(20, 100 - (data.watermarkDensity || 30))}px,
        transparent ${Math.max(40, 200 - (data.watermarkDensity || 30) * 2)}px
      );
      font-size: 24px;
      font-weight: bold;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      ${Array(Math.ceil((data.watermarkDensity || 30) / 10)).fill(data.businessName).join(' • ')}
    </div>
  ` : '';

  return `
    <div class="document-container" style="position: relative; ${data.type === 'receipt' && data.darkMode ? 'background: #1f2937; color: white;' : 'background: white; color: black;'}">
      ${watermarkStyle}
      <div style="position: relative; z-index: 2; max-width: 800px; margin: 0 auto; padding: 40px; font-family: system-ui;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px;">
          <div style="display: flex; align-items: center; gap: 20px;">
            ${data.businessLogo ? `<img src="${data.businessLogo}" alt="Logo" style="height: 64px; width: 64px; object-fit: contain;" />` : ''}
            <div>
              <h1 style="color: ${colors.primary}; font-size: 24px; font-weight: bold; margin: 0;">${data.businessName}</h1>
              <div style="font-size: 14px; color: #666; margin-top: 4px;">
                ${data.businessPhone ? `<div>Phone: ${data.businessPhone}</div>` : ''}
                ${data.businessEmail ? `<div>Email: ${data.businessEmail}</div>` : ''}
                ${data.businessWebsite ? `<div>Web: ${data.businessWebsite}</div>` : ''}
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <h2 style="color: ${colors.primary}; font-size: 32px; font-weight: bold; margin: 0 0 8px 0;">${data.type.toUpperCase()}</h2>
            <div style="font-size: 14px;">
              <div><strong>${data.type === 'invoice' ? 'Invoice' : 'Receipt'} No:</strong> ${data.invoiceNumber}</div>
              <div><strong>Date:</strong> ${data.invoiceDate}</div>
              ${data.dueDate ? `<div><strong>Due Date:</strong> ${data.dueDate}</div>` : ''}
              ${data.paymentDate ? `<div><strong>Payment Date:</strong> ${data.paymentDate}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Addresses -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
          <div>
            <h3 style="color: ${colors.primary}; font-weight: bold; margin: 0 0 8px 0;">From:</h3>
            <div style="font-size: 14px;">
              <div style="font-weight: 500;">${data.businessName}</div>
              <div style="white-space: pre-line;">${data.businessAddress}</div>
            </div>
          </div>
          <div>
            <h3 style="color: ${colors.primary}; font-weight: bold; margin: 0 0 8px 0;">To:</h3>
            <div style="font-size: 14px;">
              <div style="font-weight: 500;">${data.clientName}</div>
              <div style="white-space: pre-line;">${data.clientAddress}</div>
              ${data.clientPhone ? `<div>Phone: ${data.clientPhone}</div>` : ''}
              ${data.clientEmail ? `<div>Email: ${data.clientEmail}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background-color: ${colors.light};">
              <th style="border: 1px solid #ccc; padding: 12px; text-align: left;">Description</th>
              <th style="border: 1px solid #ccc; padding: 12px; text-align: center;">Qty</th>
              <th style="border: 1px solid #ccc; padding: 12px; text-align: right;">Unit Price</th>
              <th style="border: 1px solid #ccc; padding: 12px; text-align: right;">Discount</th>
              <th style="border: 1px solid #ccc; padding: 12px; text-align: right;">Tax</th>
              <th style="border: 1px solid #ccc; padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => {
              const itemSubtotal = item.quantity * item.unitPrice;
              const discountAmount = (itemSubtotal * item.discount) / 100;
              const discountedTotal = itemSubtotal - discountAmount;
              const taxAmount = (discountedTotal * item.taxRate) / 100;
              const itemTotal = discountedTotal + taxAmount;
              
              return `
                <tr>
                  <td style="border: 1px solid #ccc; padding: 12px;">${item.description}</td>
                  <td style="border: 1px solid #ccc; padding: 12px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${data.currency} ${item.unitPrice.toFixed(2)}</td>
                  <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${item.discount}%</td>
                  <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${item.taxRate}%</td>
                  <td style="border: 1px solid #ccc; padding: 12px; text-align: right;">${data.currency} ${itemTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
          <div style="width: 320px;">
            <div style="text-align: right;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal:</span>
                <span>${data.currency} ${subtotal.toFixed(2)}</span>
              </div>
              ${totalDiscount > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Total Discount:</span>
                  <span>-${data.currency} ${totalDiscount.toFixed(2)}</span>
                </div>
              ` : ''}
              ${totalTax > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span>Total Tax:</span>
                  <span>${data.currency} ${totalTax.toFixed(2)}</span>
                </div>
              ` : ''}
              <hr style="margin: 8px 0;" />
              <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: ${colors.primary};">
                <span>TOTAL:</span>
                <span>${data.currency} ${total.toFixed(2)}</span>
              </div>
              ${data.type === 'receipt' && data.amountPaid ? `
                <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                  <span>Amount Paid:</span>
                  <span>${data.currency} ${data.amountPaid.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Balance:</span>
                  <span>${data.currency} ${(total - data.amountPaid).toFixed(2)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Notes and Terms -->
        ${data.notes || data.terms ? `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
            ${data.notes ? `
              <div>
                <h3 style="color: ${colors.primary}; font-weight: bold; margin: 0 0 8px 0;">Notes:</h3>
                <p style="font-size: 14px; white-space: pre-line; margin: 0;">${data.notes}</p>
              </div>
            ` : ''}
            ${data.terms ? `
              <div>
                <h3 style="color: ${colors.primary}; font-weight: bold; margin: 0 0 8px 0;">Terms & Conditions:</h3>
                <p style="font-size: 14px; white-space: pre-line; margin: 0;">${data.terms}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

const getPrintStyles = (): string => `
  @media print {
    @page {
      margin: 0.5in;
      size: A4;
    }
    
    body {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    .document-container {
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
    }
  }
`;

const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '156, 163, 175';
};
