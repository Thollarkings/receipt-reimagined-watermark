
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InvoiceData } from '@/types/invoice';

export const generatePDF = async (data: InvoiceData): Promise<void> => {
  try {
    console.log('Starting PDF generation for:', data.type);
    
    // Look for the preview container - try multiple selectors
    let previewElement = document.querySelector('.invoice-preview-container');
    
    if (!previewElement) {
      // Try alternative selectors
      previewElement = document.querySelector('[data-preview-container]');
    }
    
    if (!previewElement) {
      // Try to find any preview element
      previewElement = document.querySelector('.transform.scale-50, .transform.scale-65, .transform.scale-75, .transform.scale-90, .transform.scale-100');
      if (previewElement) {
        previewElement = previewElement.parentElement;
      }
    }
    
    if (!previewElement) {
      throw new Error('Preview element not found. Please ensure the preview is visible.');
    }

    console.log('Found preview element:', previewElement);

    // Create a temporary container for PDF generation
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '794px'; // A4 width in pixels at 96 DPI
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.transform = 'scale(1)'; // Reset any scaling
    tempContainer.innerHTML = previewElement.innerHTML;
    
    document.body.appendChild(tempContainer);

    // Wait a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('Generating canvas...');

    // Generate canvas from the temporary container
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123, // A4 height in pixels
      scrollX: 0,
      scrollY: 0,
      logging: false
    });

    console.log('Canvas generated, creating PDF...');

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    const filename = `${data.type}-${data.invoiceNumber || 'document'}.pdf`;
    console.log('Saving PDF as:', filename);
    pdf.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
