import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { RdaEvidenceItem } from "@/data/rda";
import { MultiImageUploadSection } from "@/components/pdca/image-upload-section";

interface RdaEvidenceTabProps {
  items: RdaEvidenceItem[];
  onChange: (items: RdaEvidenceItem[]) => void;
  title: string;
  description: string;
  placeholder?: string;
}

export function RdaEvidenceTab({ items, onChange, title, description, placeholder }: RdaEvidenceTabProps) {
  const addItem = () => {
    onChange([...items, { 
      id: crypto.randomUUID(), 
      title: `Evidencia Causa Raíz ${items.length + 1}`, 
      description: "", 
      images: [] 
    }]);
  };

  const updateItem = (id: string, field: keyof RdaEvidenceItem, value: any) => {
    onChange(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  useEffect(() => {
    if (!items || items.length === 0) {
      onChange([{ 
        id: crypto.randomUUID(), 
        title: "Evidencia Causa Raíz 1", 
        description: "", 
        images: [] 
      }]);
    }
  }, [items, onChange]);

  const currentItems = items || [];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-1">{title}</h4>
        <p className="text-sm text-blue-800">{description}</p>
      </div>

      <div className="space-y-6">
        {currentItems.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg bg-card shadow-sm space-y-4 relative">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md">
                <label className="text-xs font-semibold mb-1 block text-muted-foreground">Título de la Evidencia</label>
                <Input 
                  value={item.title} 
                  onChange={(e) => updateItem(item.id, "title", e.target.value)}
                  placeholder="Ej. Evidencia Causa Raíz 1"
                  className="font-medium bg-background"
                />
              </div>
              {currentItems.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:bg-red-50 hover:text-red-600 mt-5"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold mb-1 block text-muted-foreground">Descripción y Hallazgos</label>
              <Textarea 
                placeholder={placeholder || "Describe los hallazgos y evidencias encontradas..."} 
                value={item.description} 
                onChange={(e) => updateItem(item.id, "description", e.target.value)}
                className="min-h-[100px] bg-background"
              />
            </div>

            <div className="pt-4 border-t">
              <MultiImageUploadSection 
                images={item.images || []} 
                onChange={(imgs) => updateItem(item.id, "images", imgs)}
                title="Soporte y Evidencias Visuales"
                subtitle="Adjunta tablas de control histórico, notas de inspección o reportes de laboratorio."
              />
            </div>
          </div>
        ))}
      </div>

      <Button onClick={addItem} variant="outline" className="w-full gap-2 border-dashed">
        <Plus className="size-4" /> Agregar Nueva Evidencia
      </Button>
    </div>
  );
}
