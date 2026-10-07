import React from "react";
import { Textarea } from "@/components/ui/textarea";
import type { RdaAnalysis } from "@/data/rda";
import { MultiImageUploadSection } from "@/components/pdca/image-upload-section";

interface RdaAnalysisTabProps {
  data: RdaAnalysis;
  onChange: (data: RdaAnalysis) => void;
}

export function RdaAnalysisTab({ data, onChange }: RdaAnalysisTabProps) {
  const updateField = (field: keyof RdaAnalysis, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          En esta pestaña se recopilan y cruzan los datos técnicos de operación, parámetros fisicoquímicos, 
          gráficos de tendencias y valores de los equipos involucrados durante la incidencia para su evaluación integral.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Análisis de Datos y Variables</label>
          <Textarea 
            placeholder="Describe aquí el análisis de los datos cruzados, parámetros y variables observadas..." 
            value={data.data} 
            onChange={(e) => updateField("data", e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <div className="pt-4">
          <MultiImageUploadSection 
            images={data.images || []} 
            onChange={(imgs) => updateField("images", imgs)}
            title="Gráficos y Tendencias"
            subtitle="Sube gráficos de tendencias, tablas o evidencias de los equipos involucrados."
          />
        </div>
      </div>
    </div>
  );
}
