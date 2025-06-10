
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('Starting email send process...');

      // Create a promise that rejects after 30 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Email sending timed out. Please try again.'));
        }, 30000);
      });

      // Create the email sending promise
      const emailPromise = supabase.functions.invoke('send-invoice-email', {
        body: {
          pdfDataUrl,
          clientEmail: clientEmail.trim(),
          clientName: data.clientName,
          businessName: data.businessName || 'Your Business',
          invoiceNumber: data.invoiceNumber,
          documentType: data.type,
        }
      });

      // Race between the email promise and timeout
      const { data: result, error } = await Promise.race([emailPromise, timeoutPromise]);

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to call email function');
      }

      if (!result) {
        throw new Error('No response from email service');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      console.log('Email sent successfully:', result);

      toast({
        title: "Email Sent Successfully",
        description: result.message,
      });

      return true;
    } catch (error: any) {
      console.error('Email sending error:', error);
      
      let errorMessage = "There was an error sending the email. Please try again.";
      
      if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
        errorMessage = "Email sending timed out. Please check your internet connection and try again.";
      } else if (error.message?.includes('RESEND_API_KEY')) {
        errorMessage = "Email service configuration error. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Failed to Send Email",
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
