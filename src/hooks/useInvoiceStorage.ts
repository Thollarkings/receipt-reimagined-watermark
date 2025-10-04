
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InvoiceData } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

export const useInvoiceStorage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const saveInvoiceData = async (data: InvoiceData, existingId?: string | null): Promise<string | null> => {
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    try {
      setSaving(true);

      // If existingId is provided, UPDATE instead of INSERT
      if (existingId) {
        const { data: updatedInvoice, error } = await supabase
          .from('invoices')
          .update({
            invoice_number: data.invoiceNumber,
            type: data.type,
            data: data as any,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        console.log('Invoice/Receipt updated successfully:', updatedInvoice.id);

        toast({
          title: "Data Updated",
          description: `${data.type === 'invoice' ? 'Invoice' : 'Receipt'} #${data.invoiceNumber} has been updated`,
        });

        return updatedInvoice.id;
      } else {
        // Create new record
        const { data: savedInvoice, error } = await supabase
          .from('invoices')
          .insert({
            user_id: user.id,
            invoice_number: data.invoiceNumber,
            type: data.type,
            data: data as any,
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
      }
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
