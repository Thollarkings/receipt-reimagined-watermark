
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

export const useInvoiceStorage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const saveInvoiceData = async (data: InvoiceData): Promise<string | null> => {
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    try {
      setSaving(true);

      const { data: savedInvoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: data.invoiceNumber,
          type: data.type,
          data: data as any, // <-- Fix for type compatibility
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Invoice/Receipt saved successfully:', savedInvoice.id);

      toast({
        title: "Data Saved",
        description: `${data.type === 'invoice' ? 'Invoice' : 'Receipt'} #${data.invoiceNumber} has been saved to your account`,
      });

      return savedInvoice.id;
    } catch (error) {
      console.error('Error saving invoice/receipt:', error);

      toast({
        title: "Save Failed",
        description: "Failed to save invoice/receipt data. Please try again.",
        variant: "destructive",
      });

      return null;
    } finally {
      setSaving(false);
    }
  };

  return {
    saveInvoiceData,
    saving
  };
};
