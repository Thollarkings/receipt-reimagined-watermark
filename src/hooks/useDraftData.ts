
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { InvoiceData, InvoiceItem } from '@/types/invoice';
import { useToast } from '@/hooks/use-toast';

interface DraftData {
  id?: string;
  type: 'invoice' | 'receipt';
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  currency: string;
  notes: string;
  terms: string;
  amountPaid?: number;
  items: InvoiceItem[];
}

interface ClientData {
  id?: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

export const useDraftData = (documentType: 'invoice' | 'receipt') => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [draftData, setDraftData] = useState<DraftData | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [sharedItems, setSharedItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load draft and client data on mount
  useEffect(() => {
    if (user) {
      loadDraftData();
      loadClientData();
      loadSharedItems();
    }
  }, [user, documentType]);

  const loadDraftData = async () => {
    if (!user) return;

    try {
      const { data: draft, error } = await supabase
        .from('invoice_drafts')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', documentType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (draft) {
        setDraftData({
          id: draft.id,
          type: draft.type as 'invoice' | 'receipt',
          invoiceNumber: draft.invoice_number || `${documentType.toUpperCase()}-${Date.now()}`,
          invoiceDate: draft.invoice_date || new Date().toISOString().split('T')[0],
          dueDate: draft.due_date || '',
          paymentDate: draft.payment_date || '',
          paymentMethod: draft.payment_method || '',
          currency: draft.currency || 'NGN',
          notes: draft.notes || '',
          terms: draft.terms || '',
          amountPaid: Number(draft.amount_paid) || 0,
          items: [], // Will be loaded from shared items
        });
      } else {
        // Create default draft
        setDraftData({
          type: documentType,
          invoiceNumber: `${documentType.toUpperCase()}-${Date.now()}`,
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: '',
          paymentDate: '',
          paymentMethod: '',
          currency: 'NGN',
          notes: '',
          terms: '',
          amountPaid: 0,
          items: [],
        });
      }
    } catch (error) {
      console.error('Error loading draft data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClientData = async () => {
    if (!user) return;

    try {
      // Load the most recent client regardless of document type
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (client) {
        setClientData({
          id: client.id,
          name: client.name,
          address: client.address || '',
          phone: client.phone || '',
          email: client.email || '',
        });
      } else {
        setClientData({
          name: '',
          address: '',
          phone: '',
          email: '',
        });
      }
    } catch (error) {
      console.error('Error loading client data:', error);
    }
  };

  const loadSharedItems = () => {
    // Load items from localStorage that are shared between invoice and receipt
    const savedItems = localStorage.getItem('shared_invoice_items');
    if (savedItems) {
      try {
        const items = JSON.parse(savedItems);
        setSharedItems(items);
      } catch (error) {
        console.error('Error parsing saved items:', error);
        setSharedItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }]);
      }
    } else {
      setSharedItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, discount: 0 }]);
    }
  };

  const saveDraftData = async (data: Partial<DraftData>) => {
    if (!user || !draftData) return;

    try {
      const updatedData = { ...draftData, ...data };
      setDraftData(updatedData);

      const draftPayload = {
        user_id: user.id,
        type: updatedData.type,
        invoice_number: updatedData.invoiceNumber,
        invoice_date: updatedData.invoiceDate,
        due_date: updatedData.dueDate || null,
        payment_date: updatedData.paymentDate || null,
        payment_method: updatedData.paymentMethod || null,
        currency: updatedData.currency,
        notes: updatedData.notes,
        terms: updatedData.terms,
        amount_paid: updatedData.amountPaid || 0,
      };

      let draftId = updatedData.id;

      if (draftId) {
        const { error } = await supabase
          .from('invoice_drafts')
          .update(draftPayload)
          .eq('id', draftId);

        if (error) throw error;
      } else {
        const { data: newDraft, error } = await supabase
          .from('invoice_drafts')
          .insert(draftPayload)
          .select()
          .single();

        if (error) throw error;
        draftId = newDraft.id;
        setDraftData(prev => prev ? { ...prev, id: draftId } : null);
      }
    } catch (error) {
      console.error('Error saving draft data:', error);
    }
  };

  const saveClientData = async (data: Partial<ClientData>) => {
    if (!user || !clientData) return;

    try {
      const updatedClient = { ...clientData, ...data };
      setClientData(updatedClient);

      const clientPayload = {
        user_id: user.id,
        name: updatedClient.name,
        address: updatedClient.address,
        phone: updatedClient.phone,
        email: updatedClient.email,
      };

      if (updatedClient.id) {
        const { error } = await supabase
          .from('clients')
          .update(clientPayload)
          .eq('id', updatedClient.id);

        if (error) throw error;
      } else if (updatedClient.name.trim()) {
        const { data: newClient, error } = await supabase
          .from('clients')
          .upsert(clientPayload, { onConflict: 'user_id,name' })
          .select()
          .single();

        if (error) throw error;
        setClientData(prev => prev ? { ...prev, id: newClient.id } : null);
      }
    } catch (error) {
      console.error('Error saving client data:', error);
    }
  };

  const saveSharedItems = (items: InvoiceItem[]) => {
    setSharedItems(items);
    localStorage.setItem('shared_invoice_items', JSON.stringify(items));
  };

  // Auto-save with debouncing
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedSaveDraft = (data: Partial<DraftData>) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    const timeout = setTimeout(() => {
      saveDraftData(data);
    }, 1000);
    setSaveTimeout(timeout);
  };

  const debouncedSaveClient = (data: Partial<ClientData>) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    const timeout = setTimeout(() => {
      saveClientData(data);
    }, 1000);
    setSaveTimeout(timeout);
  };

  return {
    draftData,
    clientData,
    sharedItems,
    loading,
    saveDraftData: debouncedSaveDraft,
    saveClientData: debouncedSaveClient,
    saveSharedItems,
    setDraftData,
    setClientData,
  };
};
