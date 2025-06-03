import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { InvoiceData } from '@/types/invoice';

export const generatePDF = async (data: InvoiceData): Promise<void> => {
  try {
    console.log('Starting PDF generation for:', data.type);

    // Find the preview container element
    let previewElement = document.querySelector('.invoice-preview-container') 
                      || document.querySelector('[data-preview-container]') 
                      || (() => {
                        const el = document.querySelector('.transform.scale-50, .transform.scale-65, .transform.scale-75, .transform.scale-90, .transform.scale-100');
                        return el ? el.parentElement : null;
                      })();

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

    // Wait for styles to apply
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('Generating canvas...');

    // Ensure the tempContainer height adjusts to fit the content
    tempContainer.style.height = 'auto';
    tempContainer.style.maxHeight = 'none';

    // Wait for reflow
    await new Promise(resolve => setTimeout(resolve, 100));

    // Get the full rendered height of the content
    const contentRect = tempContainer.getBoundingClientRect();
    const fullHeight = Math.ceil(contentRect.height);

    // Generate canvas from the temporary container with actual content height
    const canvas = await html2canvas(tempContainer, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 650, // Fixed width for consistent scaling
      height: 1000, // Dynamic height based on content
      scrollX: 0,
      scrollY: 0,
      logging: false
    });

    console.log('Canvas generated, creating PDF...');

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF with Legal size in mm
    const pdf = new jsPDF('p', 'mm', 'legal');

    // Define page and content dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();   // Legal width in mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // Legal height in mm
    const pxToMm = 25.4 / 96;                              // 1 px = 0.264583 mm at 96 DPI
    const contentWidthMM = canvas.width * pxToMm;          // width in mm
    const contentHeightMM = canvas.height * pxToMm;        // height in mm

    // Calculate scale to fit page width (never upscale beyond 1)
    const scale = Math.min(pageWidth / contentWidthMM, 1);

    // Scaled content width and height in mm
    const scaledWidth = contentWidthMM * scale;
    const scaledHeight = contentHeightMM * scale;

    // Horizontal offset to center content
    const offsetX = (pageWidth - scaledWidth) / 2;

    // Pixels per mm for slicing
    const pxPerMm = 96 / 25.4;

    // Height of one PDF page in pixels at the scaled size
    const pageHeightPx = pageHeight * pxPerMm / scale;

    let remainingHeightPx = canvas.height;
    let page = 0;

    while (remainingHeightPx > 0) {
      // Height of current slice in pixels
      const sliceHeightPx = Math.min(remainingHeightPx, pageHeightPx);

      // Create canvas for this page slice
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;

      const ctx = pageCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Draw slice from original canvas
      ctx.drawImage(
        canvas,
        0, page * pageHeightPx,  // source x, y
        canvas.width, sliceHeightPx, // source width, height
        0, 0,                       // destination x, y
        canvas.width, sliceHeightPx  // destination width, height
      );

      // Convert slice to image data
      const imgData = pageCanvas.toDataURL('image/png');

      // Scaled height of this slice in mm
      const scaledSliceHeight = sliceHeightPx * pxToMm * scale;

      if (page > 0) pdf.addPage();

      // Add image to PDF, horizontally centered, top aligned vertically
      pdf.addImage(imgData, 'PNG', offsetX, 0, scaledWidth, scaledSliceHeight);

      remainingHeightPx -= sliceHeightPx;
      page++;
    }

    console.log('Total pages generated:', page);

    // Save the PDF with a meaningful filename
    const filename = `${data.type}-${data.invoiceNumber || 'document'}.pdf`;
    console.log('Saving PDF as:', filename);
    pdf.save(filename);

  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};