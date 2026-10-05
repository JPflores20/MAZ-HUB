import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RdaAnomalyContext } from "@/data/rda";

interface RdaContextFormProps {
  context: RdaAnomalyContext;
  onChange: (context: RdaAnomalyContext) => void;
}

export function RdaContextForm({ context, onChange }: RdaContextFormProps) {
  const handleChange = (field: keyof RdaAnomalyContext, value: string) => {
    onChange({ ...context, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label>Planta</Label>
        <Select value={context.planta} onValueChange={(val) => handleChange("planta", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ZACATECAS">ZACATECAS</SelectItem>
            <SelectItem value="OTRA">OTRA</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fecha de la anomalía</Label>
        <Input
          type="date"
          value={context.fecha}
          onChange={(e) => handleChange("fecha", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Turno / Equipo</Label>
        <Input
          value={context.turno}
          onChange={(e) => handleChange("turno", e.target.value)}
          placeholder="Ej. Turno 3"
        />
      </div>

      <div className="space-y-2">
        <Label>Iniciado por</Label>
        <Input
          value={context.iniciadoPor}
          onChange={(e) => handleChange("iniciadoPor", e.target.value)}
          placeholder="Nombres"
        />
      </div>

      <div className="space-y-2">
        <Label>Responsable</Label>
        <Input
          value={context.responsable}
          onChange={(e) => handleChange("responsable", e.target.value)}
          placeholder="Nombre del responsable"
        />
      </div>

      <div className="space-y-2">
        <Label>Etapa</Label>
        <Input
          value={context.etapa}
          onChange={(e) => handleChange("etapa", e.target.value)}
          placeholder="Ej. BBT"
        />
      </div>

      <div className="space-y-2">
        <Label>Departamento</Label>
        <Input
          value={context.departamento}
          onChange={(e) => handleChange("departamento", e.target.value)}
          placeholder="Ej. Elaboración"
        />
      </div>

      <div className="space-y-2">
        <Label>Área</Label>
        <Input
          value={context.area}
          onChange={(e) => handleChange("area", e.target.value)}
          placeholder="Ej. GOBIERNO"
        />
      </div>

      <div className="space-y-2">
        <Label>Disparador</Label>
        <Input
          value={context.disparador}
          onChange={(e) => handleChange("disparador", e.target.value)}
          placeholder="¿Qué originó el RDA?"
        />
      </div>

      <div className="space-y-2">
        <Label>Equipo afectado</Label>
        <Input
          value={context.equiposAfectados}
          onChange={(e) => handleChange("equiposAfectados", e.target.value)}
          placeholder="Ej. BBT 62"
        />
      </div>

      <div className="space-y-2">
        <Label>Folio RDA</Label>
        <Input
          value={context.folio}
          onChange={(e) => handleChange("folio", e.target.value)}
          placeholder="Ej. RDA_ 2026_ 13"
        />
      </div>

      <div className="space-y-2">
        <Label>Tiempo de paro (números)</Label>
        <Input
          type="number"
          value={context.tiempoParo}
          onChange={(e) => handleChange("tiempoParo", e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label>Unidades (Tiempo de paro)</Label>
        <Input
          value={context.unidades}
          onChange={(e) => handleChange("unidades", e.target.value)}
          placeholder="Ej. minutos, horas"
        />
      </div>

      <div className="space-y-2">
        <Label>Pérdidas / Impacto</Label>
        <Input
          value={context.perdidas}
          onChange={(e) => handleChange("perdidas", e.target.value)}
          placeholder="Ej. 500 HL"
        />
      </div>
    </div>
  );
}
