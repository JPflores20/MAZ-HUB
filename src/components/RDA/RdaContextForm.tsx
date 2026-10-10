import React from "react";
import { useTranslation } from "react-i18next";
import type { RdaAnomalyContext } from "@/data/rda";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  const { t } = useTranslation();
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

  const headClass =
    "font-bold text-white uppercase text-center border-r border-white/20 text-[10px] bg-[#0078D7] py-2 h-auto";
  const cellClass = "p-2 align-top border-r border-border";
  const inputClass =
    "w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
      <Table className="min-w-[1000px] text-xs">
        <TableHeader>
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className={headClass}>{t('rdaInternal.thPlanta')}</TableHead>
            <TableHead className={headClass}>{t('rdaInternal.thFecha')}</TableHead>
            <TableHead className={headClass}>{t('rdaInternal.thTurno')}</TableHead>
            <TableHead className={headClass}>{t('rdaInternal.thIniciadoPor')}</TableHead>
            <TableHead className={headClass}>{t('rdaInternal.thResponsable')}</TableHead>
            <TableHead className={`${headClass} border-r-0`}>{t('rdaInternal.thEtapa')}</TableHead>
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
                placeholder={t('rdaInternal.phPlanta')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Input
                    className={`${inputClass} cursor-pointer caret-transparent`}
                    value={context.fecha}
                    onChange={(e) => handleChange("fecha", e.target.value)}
                    placeholder={t('rdaInternal.phFecha')}
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
                placeholder={t('rdaInternal.phTurno')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.iniciadoPor}
                onChange={(e) => handleChange("iniciadoPor", e.target.value)}
                placeholder={t('rdaInternal.phIniciadoPor')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.responsable}
                onChange={(e) => handleChange("responsable", e.target.value)}
                placeholder={t('rdaInternal.phResponsable')}
              />
            </TableCell>
            <TableCell className="p-2 align-top">
              <Input
                className={inputClass}
                value={context.etapa}
                onChange={(e) => handleChange("etapa", e.target.value)}
                placeholder={t('rdaInternal.phEtapa')}
              />
            </TableCell>
          </TableRow>

          {/* Row 2 Headers */}
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className={headClass}>{t('rdaInternal.thDepartamento')}</TableHead>
            <TableHead className={headClass}>{t('rdaInternal.thArea')}</TableHead>
            <TableHead className={headClass}>{t('rdaInternal.thDisparador')}</TableHead>
            <TableHead colSpan={2} className={headClass}>
              {t('rdaInternal.thEquipoAfectado')}
            </TableHead>
            <TableHead className={`${headClass} border-r-0`}>{t('rdaInternal.thFolioRda')}</TableHead>
          </TableRow>

          {/* Row 2 Inputs */}
          <TableRow className="border-b border-border">
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.departamento}
                onChange={(e) => handleChange("departamento", e.target.value)}
                placeholder={t('rdaInternal.phDepartamento')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.area}
                onChange={(e) => handleChange("area", e.target.value)}
                placeholder={t('rdaInternal.phArea')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.disparador}
                onChange={(e) => handleChange("disparador", e.target.value)}
                placeholder={t('rdaInternal.phDisparador')}
              />
            </TableCell>
            <TableCell colSpan={2} className={cellClass}>
              <Input
                className={inputClass}
                value={context.equiposAfectados}
                onChange={(e) => handleChange("equiposAfectados", e.target.value)}
                placeholder={t('rdaInternal.phEquipoAfectado')}
              />
            </TableCell>
            <TableCell className="p-2 align-top">
              <Input
                className={inputClass}
                value={context.folio}
                onChange={(e) => handleChange("folio", e.target.value)}
                placeholder={t('rdaInternal.phFolioRda')}
              />
            </TableCell>
          </TableRow>

          {/* Row 3 Headers (Impacto) */}
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className={headClass}>
              {t('rdaInternal.thTiempoParoNum')}
            </TableHead>
            <TableHead className={headClass}>
              {t('rdaInternal.thUnidadesTiempoParo')}
            </TableHead>
            <TableHead className={headClass}>
              {t('rdaInternal.thPerdidasNum')}
            </TableHead>
            <TableHead className={headClass}>
              {t('rdaInternal.thUnidadesPerdidas')}
            </TableHead>
            <TableHead className={headClass}>
              {t('rdaInternal.thNoConformesNum')}
            </TableHead>
            <TableHead className={`${headClass} border-r-0`}>
              {t('rdaInternal.thUnidadesNoConformes')}
            </TableHead>
          </TableRow>

          {/* Row 3 Inputs */}
          <TableRow>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.tiempoParo}
                onChange={(e) => handleChange("tiempoParo", e.target.value)}
                placeholder={t('rdaInternal.phTiempoParo')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.unidadesTiempoParo}
                onChange={(e) => handleChange("unidadesTiempoParo", e.target.value)}
                placeholder={t('rdaInternal.phUnidadesTiempo')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.perdidas}
                onChange={(e) => handleChange("perdidas", e.target.value)}
                placeholder={t('rdaInternal.phUnidadesTiempo')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.unidadesPerdidas}
                onChange={(e) => handleChange("unidadesPerdidas", e.target.value)}
                placeholder={t('rdaInternal.phUnidadesPerdidas')}
              />
            </TableCell>
            <TableCell className={cellClass}>
              <Input
                className={inputClass}
                value={context.productosNoConformes}
                onChange={(e) => handleChange("productosNoConformes", e.target.value)}
                placeholder={t('rdaInternal.phNoConformes')}
              />
            </TableCell>
            <TableCell className="p-2 align-top">
              <Input
                className={inputClass}
                value={context.unidadesNoConformes}
                onChange={(e) => handleChange("unidadesNoConformes", e.target.value)}
                placeholder={t('rdaInternal.phUnidadesNoConformes')}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
