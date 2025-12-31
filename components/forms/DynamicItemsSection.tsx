'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import type { DynamicCostItem } from '@/lib/types';

const itemSchema = z.object({
  name: z.string().min(1),
  amount: z.number().min(0),
  type: z.enum(['fixed', 'variable']),
  category: z.enum(['cost', 'revenue']),
  description: z.string().optional(),
});

interface DynamicItemsSectionProps {
  items: DynamicCostItem[];
  onChange: (items: DynamicCostItem[]) => void;
  categoryName: string;
}

export default function DynamicItemsSection({ items, onChange, categoryName }: DynamicItemsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Omit<DynamicCostItem, 'id'>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      amount: 0,
      type: 'fixed',
      category: 'cost',
      description: '',
    },
  });

  const formData = watch();

  const handleAdd = () => {
    setIsAdding(true);
    reset({
      name: '',
      amount: 0,
      type: 'fixed',
      category: 'cost',
      description: '',
    });
  };

  const handleSave = (data: Omit<DynamicCostItem, 'id'>) => {
    if (editingId) {
      const updated = items.map(item =>
        item.id === editingId ? { ...data, id: editingId } : item
      );
      onChange(updated);
      setEditingId(null);
    } else {
      const newItem: DynamicCostItem = {
        ...data,
        id: Date.now().toString(),
      };
      onChange([...items, newItem]);
      setIsAdding(false);
    }
    reset();
  };

  const handleDelete = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleEdit = (item: DynamicCostItem) => {
    setEditingId(item.id);
    setIsAdding(false);
    setValue('name', item.name);
    setValue('amount', item.amount);
    setValue('type', item.type);
    setValue('category', item.category);
    setValue('description', item.description || '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    reset();
  };

  if (items.length === 0 && !isAdding) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold">Weitere {categoryName}</h4>
          <Button onClick={handleAdd} type="button" size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">Weitere {categoryName}</h4>
        <Button onClick={handleAdd} type="button" size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Hinzufügen
        </Button>
      </div>

      {(isAdding || editingId) && (
        <div className="p-3 bg-muted rounded-lg mb-2">
          <form onSubmit={handleSubmit(handleSave)} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Name *</Label>
                <Input
                  id="name"
                  className="h-8 text-sm"
                  {...register('name')}
                  placeholder="z.B. Zusatzversicherung"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="amount" className="text-xs">Betrag (€) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  className="h-8 text-sm"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="type" className="text-xs">Art</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'fixed' | 'variable') => setValue('type', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fix (monatlich)</SelectItem>
                    <SelectItem value="variable">Variabel (pro Flasche)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs">Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: 'cost' | 'revenue') => setValue('category', value)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost">Kosten</SelectItem>
                    <SelectItem value="revenue">Einnahmen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-8">
                <Check className="h-3 w-3 mr-1" />
                Speichern
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8" onClick={handleCancel}>
                <X className="h-3 w-3 mr-1" />
                Abbrechen
              </Button>
            </div>
          </form>
        </div>
      )}

      {items.length > 0 && (
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    item.category === 'cost'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {item.category === 'cost' ? 'Kosten' : 'Einnahmen'}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {item.type === 'fixed' ? 'Fix' : 'Variabel'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.amount.toFixed(2)} € {item.type === 'fixed' ? '/ Monat' : '/ Flasche'}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleEdit(item)}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
