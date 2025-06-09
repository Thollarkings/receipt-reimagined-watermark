
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

      const { data: result, error } = await supabase.functions.invoke('send-invoice-email', {
        body: {
          pdfDataUrl,
          clientEmail: clientEmail.trim(),
          clientName: data.clientName,
          businessName: data.businessName || 'Your Business',
          invoiceNumber: data.invoiceNumber,
          documentType: data.type,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }

      toast({
        title: "Email Sent Successfully",
        description: result.message,
      });

      return true;
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "Failed to Send Email",
        description: error.message || "There was an error sending the email. Please try again.",
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
