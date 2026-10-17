/**
 * RdaContextForm.tsx
 * Formulario de datos generales y contexto operativo del RDA (Planta, Área, Línea, Equipo, Fecha, Folio, Responsable).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, UserPlus } from "lucide-react";
import type { RdaAnomalyContext } from "@/data/rda";
import { AREAS } from "@/data/pdca-defaults";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ResponsibleProfileCard,
  ResponsibleSelectorItem,
  useDirectoryUsers,
} from "@/components/ui/responsible-profile-card";
import { Calendar } from "@/components/ui/calendar";
import { format, parse, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { useRdas } from "@/context/rda-context";
import { generateNextRdaFolio } from "@/components/RDA/rda-name";

interface RdaContextFormProps {
  context: RdaAnomalyContext;
  onChange: (context: RdaAnomalyContext) => void;
  disabled?: boolean | undefined;
}

export function RdaContextForm({ context, onChange, disabled }: RdaContextFormProps) {
  const { t } = useTranslation();
  const { directory: availableUsers, resolveUser } = useDirectoryUsers();
  const { allRdas } = useRdas();
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [customResponsible, setCustomResponsible] = React.useState("");

  const assignedList = React.useMemo(() => {
    return (context.responsable || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [context.responsable]);

  const toggleResponsibleUser = (name: string) => {
    if (disabled) return;
    const normalized = name.trim();
    if (!normalized) return;
    const exists = assignedList.some((r) => r.toLowerCase() === normalized.toLowerCase());
    const next = exists
      ? assignedList.filter((r) => r.toLowerCase() !== normalized.toLowerCase())
      : [...assignedList, normalized];
    handleChange("responsable", next.join(", "));
  };

  const handleAddCustomResponsible = () => {
    const val = customResponsible.trim();
    if (!val) return;
    if (!assignedList.some((r) => r.toLowerCase() === val.toLowerCase())) {
      handleChange("responsable", [...assignedList, val].join(", "));
    }
    setCustomResponsible("");
  };

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
              <div className="flex flex-wrap items-center gap-1.5 min-w-[230px]">
                {assignedList.map((person) => (
                  <ResponsibleProfileCard
                    key={person}
                    compact
                    user={resolveUser(person)}
                    onRemove={!disabled ? () => toggleResponsibleUser(person) : undefined}
                  />
                ))}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={disabled}
                      className={
                        assignedList.length === 0
                          ? "w-full min-h-[34px] rounded-md border border-input bg-transparent px-2 py-1 text-left text-xs flex items-center gap-1.5 text-muted-foreground hover:bg-secondary/40 transition-colors cursor-pointer"
                          : "inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer shrink-0"
                      }
                    >
                      <UserPlus className="size-3.5 text-primary" />
                      {assignedList.length === 0 && <span>Asignar responsables...</span>}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3 space-y-2.5" align="start">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Seleccionar Usuarios Responsables
                    </p>
                    <div className="max-h-56 overflow-y-auto space-y-1 border-b border-border pb-2">
                      {availableUsers.map((u) => {
                        const resolved = resolveUser(u);
                        const isSelected = assignedList.some(
                          (r) => r.toLowerCase() === resolved.name.toLowerCase(),
                        );
                        return (
                          <ResponsibleSelectorItem
                            key={u.email || u.name}
                            user={resolved}
                            selected={isSelected}
                            onToggle={() => toggleResponsibleUser(resolved.name)}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <Input
                        value={customResponsible}
                        onChange={(e) => setCustomResponsible(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomResponsible();
                          }
                        }}
                        placeholder="Otro nombre..."
                        className="h-7 text-xs"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={handleAddCustomResponsible}
                        className="h-7 w-7 shrink-0"
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
                list="rda-context-area-list"
                value={context.area}
                onChange={(e) => handleChange("area", e.target.value)}
                onBlur={(e) => handleChange("area", e.target.value.trim())}
                placeholder={t('rdaInternal.phArea')}
              />
              <datalist id="rda-context-area-list">
                {AREAS.map((a) => (
                  <option key={a.value} value={a.label} />
                ))}
              </datalist>
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
              <div className="space-y-1">
                <Input
                  className={`${inputClass} font-mono font-semibold`}
                  value={context.folio}
                  onChange={(e) => handleChange("folio", e.target.value)}
                  placeholder="RDA_2026_01"
                />
                {!context.folio?.trim() && !disabled && (
                  <button
                    type="button"
                    onClick={() => handleChange("folio", generateNextRdaFolio(allRdas))}
                    className="w-full text-center text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                  >
                    + Generar automático
                  </button>
                )}
              </div>
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
