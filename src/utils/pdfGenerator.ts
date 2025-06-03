
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
      scrollX: 0,
      scrollY: 0,
      logging: false
    });

    console.log('Canvas generated, creating PDF...');

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF with proper dimensions
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgData = canvas.toDataURL('image/png');
    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm for A4
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm for A4
    
    // Original content dimensions in pixels, converted to mm (assuming 96 DPI)
    const contentWidthMM = (canvas.width * 25.4) / 96; // Convert pixels to mm
    const contentHeightMM = (canvas.height * 25.4) / 96; // Convert pixels to mm
    
    // Calculate uniform scale factor to fit page width while maintaining aspect ratio
    const scale = Math.min(pageWidth / contentWidthMM, pageHeight / contentHeightMM);
    
    // Calculate scaled dimensions
    const scaledWidth = contentWidthMM * scale;
    const scaledHeight = contentHeightMM * scale;
    
    // Calculate horizontal offset to center content
    const offsetX = (pageWidth - scaledWidth) / 2;
    const offsetY = 0; // Top aligned, vertical white space below is acceptable
    
    console.log('Original content dimensions (mm):', contentWidthMM, 'x', contentHeightMM);
    console.log('Page dimensions (mm):', pageWidth, 'x', pageHeight);
    console.log('Scale factor:', scale);
    console.log('Scaled dimensions (mm):', scaledWidth, 'x', scaledHeight);
    console.log('Horizontal offset (mm):', offsetX);

    let heightLeft = scaledHeight;
    let position = offsetY;
    let pageCount = 0;

    // Add the first page with centered content
    pdf.addImage(imgData, 'PNG', offsetX, position, scaledWidth, scaledHeight);
    pageCount++;
    heightLeft -= pageHeight;

    // Add additional pages only if there's remaining content
    while (heightLeft > 0) {
      position = heightLeft - scaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', offsetX, position, scaledWidth, scaledHeight);
      pageCount++;
      heightLeft -= pageHeight;
    }

    console.log('Total pages generated:', pageCount);

    // Download the PDF
    const filename = `${data.type}-${data.invoiceNumber || 'document'}.pdf`;
    console.log('Saving PDF as:', filename);
    pdf.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
