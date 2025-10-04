
import React from "react";
import { useInvoiceHistory } from "@/hooks/useInvoiceHistory";
import { Button } from "@/components/ui/button";
import { Eye, Download, Mail, Loader2, Trash2 } from "lucide-react";

interface InvoiceHistoryProps {
  onLoad: (data: any, historyId: string) => void;
  onExportPDF: (data: any) => void;
  onSendEmail?: (data: any) => void;
  selectedId?: string | null;
  onRefresh?: () => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  onLoad,
  onExportPDF,
  onSendEmail,
  selectedId,
}) => {
  const { history, loading, error, deleteInvoice, refreshHistory } = useInvoiceHistory();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this invoice/receipt?')) {
      await deleteInvoice(id);
      // Refresh history after deletion
      await refreshHistory();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin h-6 w-6 text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No exported invoices or receipts found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border bg-white dark:bg-gray-900 rounded-lg shadow text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Type</th>
            <th className="px-3 py-2 font-medium">Client</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((doc, idx) => {
            const isSelected = selectedId === doc.id;
            return (
              <tr
                key={doc.id}
                className={
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500"
                    : idx % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800"
                }
              >
                <td className="px-3 py-2">{doc.invoiceNumber}</td>
                <td className="px-3 py-2 capitalize">{doc.type}</td>
                <td className="px-3 py-2">
                  {doc.data?.clientName || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-3 py-2">
                  {doc.data?.invoiceDate
                    ? new Date(doc.data.invoiceDate).toLocaleDateString()
                    : new Date(doc.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2 flex gap-2">
                  <Button 
                    variant={isSelected ? "default" : "outline"}
                    size="sm" 
                    onClick={() => onLoad(doc.data, doc.id)}
                    title="View and edit in preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onExportPDF(doc.data)}
                    title="Download PDF"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {onSendEmail && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onSendEmail(doc.data)}
                      title="Send email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
