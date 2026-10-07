import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RdaProblemDescription } from "@/data/rda";

interface RdaProblemDescriptionTabProps {
  data: RdaProblemDescription;
  onChange: (data: RdaProblemDescription) => void;
}

export function RdaProblemDescriptionTab({ data, onChange }: RdaProblemDescriptionTabProps) {
  const handleChange = (field: keyof RdaProblemDescription, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const concatenatedText = [
    data.que,
    data.como,
    data.cuando,
    data.donde,
    data.quien,
    data.cual
  ]
    .filter(Boolean)
    .map(s => s.trim())
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          En esta primera pestaña, se define claramente la anomalía respondiendo a seis preguntas clave (Metodología 5W + 1H).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-semibold text-base">¿Qué?</Label>
          <p className="text-xs text-muted-foreground">Identificar el componente, producto o sitio de trabajo afectado.</p>
          <Textarea 
            placeholder="Ej. En la marca corona..." 
            value={data.que} 
            onChange={(e) => handleChange("que", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">¿Cómo?</Label>
          <p className="text-xs text-muted-foreground">Determinar cómo cambió el estado actual frente a la meta o especificación y el impacto.</p>
          <Textarea 
            placeholder="Ej. Los polifenoles dan por arriba de especificación..." 
            value={data.como} 
            onChange={(e) => handleChange("como", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">¿Cuándo?</Label>
          <p className="text-xs text-muted-foreground">Registrar la fecha y hora exacta del suceso.</p>
          <Textarea 
            placeholder="Ej. El 7 de junio del 2026 en segundo turno..." 
            value={data.cuando} 
            onChange={(e) => handleChange("cuando", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">¿Dónde?</Label>
          <p className="text-xs text-muted-foreground">Especificar la línea, máquina, sistema o componente involucrado.</p>
          <Textarea 
            placeholder="Ej. En los BBT's 25, 28, 58, 60 y 62..." 
            value={data.donde} 
            onChange={(e) => handleChange("donde", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">¿Quién?</Label>
          <p className="text-xs text-muted-foreground">Evaluar si el problema está relacionado con la habilidad de las personas o personal nuevo.</p>
          <Textarea 
            placeholder="Ej. Operador de turno 2, personal en entrenamiento..." 
            value={data.quien} 
            onChange={(e) => handleChange("quien", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">¿Cuál?</Label>
          <p className="text-xs text-muted-foreground">Analizar la tendencia o patrón y el principio de operación del equipo que falló.</p>
          <Textarea 
            placeholder="Ej. Tendencia al alza en los últimos 3 lotes..." 
            value={data.cual} 
            onChange={(e) => handleChange("cual", e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="mt-8 border-t pt-8">
        <div className="bg-[#1e293b] border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700/50">
            <h4 className="text-sm font-semibold text-white text-center">
              Descripción del Problema (5W, 1H: Que, Cuando, Donde, Quien, Cual y Cómo).
            </h4>
          </div>
          <div className="p-4 bg-white dark:bg-transparent text-center min-h-[80px] flex items-center justify-center">
            {concatenatedText ? (
              <p className="text-base font-medium text-foreground">
                {concatenatedText}{concatenatedText.endsWith('.') || concatenatedText.endsWith(',') ? '' : ','}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                La descripción concatenada aparecerá aquí conforme llenes los campos superiores...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
