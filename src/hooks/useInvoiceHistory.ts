
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { InvoiceData } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";

export interface InvoiceHistoryEntry {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  type: string;
  data: InvoiceData;
}

export function useInvoiceHistory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [history, setHistory] = useState<InvoiceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, type, created_at, data")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setError("Failed to load history");
      setLoading(false);
      return;
    }

    setHistory(
      (data || []).map((row: any) => ({
        id: row.id,
        invoiceNumber: row.invoice_number,
        createdAt: row.created_at,
        type: row.type,
        data: row.data,
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const deleteInvoice = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Remove from local state
      setHistory(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Deleted Successfully",
        description: "Invoice/Receipt has been deleted from your history",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete invoice/receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { history, loading, error, deleteInvoice, refreshHistory: fetchHistory };
}
