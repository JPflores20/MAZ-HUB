import React from "react";
import type { RdaAnomalyContext } from "@/data/rda";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";

interface RdaContextFormProps {
  context: RdaAnomalyContext;
  onChange: (context: RdaAnomalyContext) => void;
  disabled?: boolean;
}

export function RdaContextForm({ context, onChange, disabled }: RdaContextFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const handleChange = (field: keyof RdaAnomalyContext, value: string) => {
    if (disabled) return;
    onChange({ ...context, [field]: value });
  };

  // Date parsing logic
  let selectedDate: Date | undefined = undefined;
  if (context.fecha) {
    // Try to parse as dd-MMM or fallback to just using it if it's a valid ISO
    const parsed = parse(context.fecha, "dd-MMM", new Date(), { locale: es });
    if (isValid(parsed)) {
      selectedDate = parsed;
    } else {
      const fallback = new Date(context.fecha);
      if (isValid(fallback)) {
        selectedDate = fallback;
      }
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      handleChange("fecha", format(date, "dd-MMM", { locale: es }));
    }
    setIsCalendarOpen(false);
  };

  const headClass = "font-bold text-white uppercase text-center border-r border-white/20 text-[10px] bg-[#0078D7] py-2 h-auto";
  const cellClass = "p-2 align-top border-r border-border";
  const inputClass = "w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
      <Table className="min-w-[1000px] text-xs">
        <TableHeader>
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className={headClass}>PLANTA</TableHead>
            <TableHead className={headClass}>FECHA DE LA ANOMALÍA</TableHead>
            <TableHead className={headClass}>TURNO/EQUIPO</TableHead>
            <TableHead className={headClass}>INICIADO POR:</TableHead>
            <TableHead className={headClass}>RESPONSABLE:</TableHead>
            <TableHead className={`${headClass} border-r-0`}>ETAPA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Row 1 Inputs */}
          <TableRow className="border-b border-border">
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.planta}
                onChange={(e) => handleChange("planta", e.target.value)}
                placeholder="ZACATECAS"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Input
                    className={`${inputClass} cursor-pointer caret-transparent`}
                    value={context.fecha}
                    onChange={(e) => handleChange("fecha", e.target.value)}
                    placeholder="DD-MMM"
                    readOnly
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.turno}
                onChange={(e) => handleChange("turno", e.target.value)}
                placeholder="Ej. 3"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.iniciadoPor}
                onChange={(e) => handleChange("iniciadoPor", e.target.value)}
                placeholder="Nombres..."
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.responsable}
                onChange={(e) => handleChange("responsable", e.target.value)}
                placeholder="Responsable..."
              />
            </TableCell>
            <TableCell className="p-2 align-top">
              <Input
                className={inputClass}
                value={context.etapa}
                onChange={(e) => handleChange("etapa", e.target.value)}
                placeholder="Ej. BBT"
              />
            </TableCell>
          </TableRow>

          {/* Row 2 Headers */}
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className={headClass}>DEPARTAMENTO</TableHead>
            <TableHead className={headClass}>ÁREA</TableHead>
            <TableHead className={headClass}>DISPARADOR</TableHead>
            <TableHead colSpan={2} className={headClass}>EQUIPO AFECTADO:</TableHead>
            <TableHead className={`${headClass} border-r-0`}>FOLIO RDA:</TableHead>
          </TableRow>

          {/* Row 2 Inputs */}
          <TableRow className="border-b border-border">
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.departamento}
                onChange={(e) => handleChange("departamento", e.target.value)}
                placeholder="Ej. Elaboración"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.area}
                onChange={(e) => handleChange("area", e.target.value)}
                placeholder="Ej. Gobierno"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.disparador}
                onChange={(e) => handleChange("disparador", e.target.value)}
                placeholder="..."
              />
            </TableCell>
            <TableCell colSpan={2} className={cellClass}>
              <Input
                className={inputClass}
                value={context.equiposAfectados}
                onChange={(e) => handleChange("equiposAfectados", e.target.value)}
                placeholder="Ej. BBT 62, BBT 60..."
              />
            </TableCell>
            <TableCell className="p-2 align-top">
              <Input
                className={inputClass}
                value={context.folio}
                onChange={(e) => handleChange("folio", e.target.value)}
                placeholder="Ej. RDA_2026_13"
              />
            </TableCell>
          </TableRow>

          {/* Row 3 Headers (Impacto) */}
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className={headClass}>TIEMPO DE PARO<br/>(NÚMEROS)</TableHead>
            <TableHead className={headClass}>UNIDADES<br/>(TIEMPO DE PARO)</TableHead>
            <TableHead className={headClass}>PÉRDIDAS / DESPERDICIOS<br/>(NÚMEROS)</TableHead>
            <TableHead className={headClass}>UNIDADES<br/>(PÉRDIDAS)</TableHead>
            <TableHead className={headClass}>PRODUCTOS NO CONFORMES<br/>(NÚMEROS)</TableHead>
            <TableHead className={`${headClass} border-r-0`}>UNIDADES<br/>(PRODUCTO NO CONFORME)</TableHead>
          </TableRow>

          {/* Row 3 Inputs */}
          <TableRow>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.tiempoParo}
                onChange={(e) => handleChange("tiempoParo", e.target.value)}
                placeholder="Ej. 20"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.unidadesTiempoParo}
                onChange={(e) => handleChange("unidadesTiempoParo", e.target.value)}
                placeholder="Ej. 0"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.perdidas}
                onChange={(e) => handleChange("perdidas", e.target.value)}
                placeholder="Ej. 0"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.unidadesPerdidas}
                onChange={(e) => handleChange("unidadesPerdidas", e.target.value)}
                placeholder="Ej. $0.00"
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.productosNoConformes}
                onChange={(e) => handleChange("productosNoConformes", e.target.value)}
                placeholder="Ej. 5"
              />
            </TableCell>
            <TableCell className="p-2 align-top">
              <Input
                className={inputClass}
                value={context.unidadesNoConformes}
                onChange={(e) => handleChange("unidadesNoConformes", e.target.value)}
                placeholder="Ej. TANQUE"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
