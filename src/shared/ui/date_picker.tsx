/**
 * date_picker.tsx
 * Componente selector de fecha con calendario desplegable formateado en español.
 */
import * as React from "react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/shared/utils/class_names";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (selected_date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  dateFormat?: string;
  disabled?: boolean;
}

/**
 * Selector emergente de fecha con formato configurable.
 *
 * @param props - Fecha actual, callback `setDate` y formato de visualización.
 * @returns Botón disparador con calendario en un `Popover`.
 */
export function DatePicker({
  date,
  setDate,
  placeholder = "Seleccionar fecha",
  className,
  dateFormat = "dd/MM/yyyy",
  disabled = false,
}: DatePickerProps) {
  const is_valid_date = date instanceof Date && isValid(date);

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          disabled={disabled}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal truncate",
            !is_valid_date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">
            {is_valid_date ? format(date, dateFormat, { locale: es }) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={is_valid_date ? date : undefined}
          onSelect={setDate}
          initialFocus
          locale={es}
        />
      </PopoverContent>
    </Popover>
  );
}
