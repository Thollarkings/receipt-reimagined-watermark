import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { InvoiceItem } from '@/types/invoice';

interface ItemsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  items: InvoiceItem[];
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: any) => void;
}

export const ItemsSection: React.FC<ItemsSectionProps> = ({
  isOpen,
  onToggle,
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}) => {
  const content = (
    <CardContent className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <div>
            <Label>Description</Label>
            <Input
              value={item.description}
              onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
              placeholder="Item description"
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onUpdateItem(item.id, 'quantity', Number(e.target.value))}
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Unit Price</Label>
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) => onUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                min="0"
                step="0.01"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Tax Rate (%)</Label>
              <Input
                type="number"
                value={item.taxRate}
                onChange={(e) => onUpdateItem(item.id, 'taxRate', Number(e.target.value))}
                min="0"
                max="100"
                step="0.01"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Discount (%)</Label>
              <Input
                type="number"
                value={item.discount}
                onChange={(e) => onUpdateItem(item.id, 'discount', Number(e.target.value))}
                min="0"
                max="100"
                step="0.01"
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                disabled={items.length === 1}
                className="w-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      <Button onClick={onAddItem} variant="outline" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
    </CardContent>
  );

  // If used in tabs (isOpen is always true), render without collapsible
  if (isOpen && onToggle.toString() === '() => {}') {
    return (
      <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        {content}
      </Card>
    );
  }

  // Otherwise, render with collapsible functionality
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className='bg-gradient-to-r from-fuchsia-200 to-violet-300'>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <CardTitle className="flex items-center justify-between">
              Items
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {content}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
