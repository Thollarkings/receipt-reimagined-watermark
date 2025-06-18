
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceData } from '@/types/invoice';

export const generatePDF = async (data: InvoiceData, download: boolean = false): Promise<string> => {
  try {
    // Find the specific invoice/receipt preview container (not including history)
    const previewContainer = document.querySelector('[data-invoice-preview]') as HTMLElement;
    if (!previewContainer) {
      throw new Error('Invoice preview container not found');
    }

    // Create canvas from the preview
    const canvas = await html2canvas(previewContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: previewContainer.scrollWidth,
      height: previewContainer.scrollHeight,
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Limit the scale to maximum 1.4
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight, 1.4);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

    if (download) {
      const filename = `${data.type}-${data.invoiceNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    }

    // Return base64 data URL for email or storage
    return pdf.output('datauristring');
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF');
  }
};
