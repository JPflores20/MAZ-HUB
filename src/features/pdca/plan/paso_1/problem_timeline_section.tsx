/**
 * @fileoverview Sección interactiva para construir la línea de tiempo del problema en modo flujo visual o tabla.
 */
import React from "react";
import { Plus, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio_group";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/utils/class_names";
import { ProblemTimelineFlow, type EventoLineaTiempo } from "./problem_timeline_flow";
import { ProblemTimelineTable } from "./problem_timeline_table";

interface ProblemTimelineSectionProps {
  timelineOption: "A" | "B";
  onOptionChange: (opcion: "A" | "B") => void;
  timelineFilter: "day" | "week" | "month" | "3months";
  onFilterChange: (filtro: "day" | "week" | "month" | "3months") => void;
  events: EventoLineaTiempo[];
  onEventsChange: (eventos: EventoLineaTiempo[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Permite documentar la cronología de aparición de un problema para identificar el punto de cambio.
 */
export const ProblemTimelineSection: React.FC<ProblemTimelineSectionProps> = ({
  timelineOption,
  onOptionChange,
  timelineFilter,
  onFilterChange,
  events,
  onEventsChange,
  isStepCompleted,
  onToggleStep,
}) => {
  const { t: translate } = useTranslation();

  const agregar_evento = () => {
    onEventsChange([...events, { id: crypto.randomUUID(), time: "", description: "" }]);
  };

  const actualizar_evento = (
    evento_id: string,
    campo: "time" | "description",
    valor: string,
  ) => {
    onEventsChange(
      events.map((evento_actual) =>
        evento_actual.id === evento_id ? { ...evento_actual, [campo]: valor } : evento_actual,
      ),
    );
  };

  const eliminar_evento = (evento_id: string) => {
    onEventsChange(events.filter((evento_actual) => evento_actual.id !== evento_id));
  };

  return (
    <Card className={cn("mt-6", isStepCompleted && "border-green-500 bg-green-50/10")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          {translate("pdcaPlan.dynamic.lNeaDeTiempoDel")}
          {isStepCompleted && <CheckCircle2 className="size-5 text-green-500" />}
        </CardTitle>
        {onToggleStep && (
          <Button
            variant={isStepCompleted ? "outline" : "default"}
            size="sm"
            onClick={onToggleStep}
            className={
              isStepCompleted
                ? "text-green-600 border-green-200 hover:bg-green-50"
                : "bg-blue-600 hover:bg-blue-700"
            }
          >
            {isStepCompleted ? "Completado" : "Marcar como Completado"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/40 text-foreground rounded-lg border">
          <div className="flex-1 space-y-3">
            <Label className="text-sm font-semibold">
              {translate("pdcaPlan.dynamic.opciNDeVisualizaciN")}
            </Label>
            <RadioGroup
              value={timelineOption}
              onValueChange={(opcion) => onOptionChange(opcion as "A" | "B")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="option-a" />
                <Label htmlFor="option-a">
                  {translate("pdcaPlan.dynamic.opciNAFlujoVisual")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="option-b" />
                <Label htmlFor="option-b">{translate("pdcaPlan.dynamic.opciNBTabla")}</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex-1 space-y-3">
            <Label className="text-sm font-semibold">
              {translate("pdcaPlan.dynamic.filtroTemporal")}
            </Label>
            <Select value={timelineFilter} onValueChange={onFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder={translate("pdcaPlan.dynamic.seleccionarFiltro")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{translate("pdcaPlan.dynamic.porDA")}</SelectItem>
                <SelectItem value="week">{translate("pdcaPlan.dynamic.porSemana")}</SelectItem>
                <SelectItem value="month">{translate("pdcaPlan.dynamic.porMes")}</SelectItem>
                <SelectItem value="3months">{translate("pdcaPlan.dynamic.por3Meses")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {timelineOption === "A" ? (
          <ProblemTimelineFlow
            events={events}
            on_update_event={actualizar_evento}
            on_remove_event={eliminar_evento}
          />
        ) : (
          <ProblemTimelineTable
            events={events}
            timeline_filter={timelineFilter}
            on_update_event={actualizar_evento}
            on_remove_event={eliminar_evento}
          />
        )}

        <div className="flex justify-between items-center mt-4">
          <Button onClick={agregar_evento} variant="outline" className="gap-2">
            <Plus className="size-4" /> {translate("pdcaPlan.dynamic.agregarEvento")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
