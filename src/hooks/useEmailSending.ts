
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InvoiceData } from '@/types/invoice';

export const useEmailSending = () => {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendInvoiceEmail = async (
    data: InvoiceData,
    pdfDataUrl: string,
    clientEmail: string
  ): Promise<boolean> => {
    try {
      setIsSending(true);
      console.log('Opening email client...');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientEmail)) {
        throw new Error('Please enter a valid email address');
      }

      const documentType = data.type === 'invoice' ? 'Invoice' : 'Receipt';
      const subject = `Your ${documentType} from ${data.businessName}`;
      const body = `Dear ${data.clientName || 'Valued Customer'},

Please find your ${documentType.toLowerCase()} details below:

${documentType} Number: ${data.invoiceNumber}
Date: ${data.invoiceDate}
${data.type === 'invoice' ? `Due Date: ${data.dueDate}` : `Payment Date: ${data.paymentDate}`}

Business: ${data.businessName}
${data.businessAddress ? `Address: ${data.businessAddress}` : ''}
${data.businessPhone ? `Phone: ${data.businessPhone}` : ''}
${data.businessEmail ? `Email: ${data.businessEmail}` : ''}

Thank you for your business!

Best regards,
${data.businessName}`;

      // Create mailto link
      const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Open the default email client
      window.open(mailtoLink, '_self');

      console.log('Email client opened successfully');

      toast({
        title: "Email Client Opened",
        description: `Your default email application has been opened with a pre-composed email to ${clientEmail}`,
      });

      return true;
    } catch (error: any) {
      console.error('Email opening error:', error);
      
      let errorMessage = "There was an error opening the email client. Please try again.";
      
      if (error.message?.includes('valid email')) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Failed to Open Email Client",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendInvoiceEmail,
    isSending,
  };
};
