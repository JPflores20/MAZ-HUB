/**
 * @fileoverview Duration-in-days selector and external-email exception notice for admin-provisioned intern profiles.
 */

import { CalendarClock, Info } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const PRESET_DAYS = [30, 60, 90, 180] as const;

interface AdminInternDurationFieldProps {
  active_days: string;
  set_active_days: (next_days: string) => void;
}

/** Computes a formatted local expiration preview date from a positive day count. */
function format_expiration_preview(raw_days: string): string | null {
  const parsed_days = Number(raw_days);
  if (!Number.isInteger(parsed_days) || parsed_days < 1 || parsed_days > 730) {
    return null;
  }
  const target_date = new Date(Date.now() + parsed_days * 86_400_000);
  return target_date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Renders active-days input, quick duration presets, and Gmail exception notice for temporary interns. */
export function AdminInternDurationField({
  active_days,
  set_active_days,
}: AdminInternDurationFieldProps) {
  const expiration_preview = format_expiration_preview(active_days);

  return (
    <div className="space-y-2.5 rounded-lg border border-amber-500/35 bg-amber-500/10 p-3">
      <div className="flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
        <Info className="size-3.5 shrink-0 mt-0.5" />
        <p>
          <strong>Excepción exclusiva de Becario:</strong> puedes usar correo externo (ej.{" "}
          <strong>@gmail.com</strong>). También deberá verificar su correo con el enlace enviado y
          su acceso caducará automáticamente al cumplirse los días asignados.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="internActiveDays"
          className="text-xs font-semibold flex items-center gap-1.5"
        >
          <CalendarClock className="size-3.5 text-amber-700 dark:text-amber-300" />
          VIGENCIA TEMPORAL (DÍAS ACTIVOS) *
        </Label>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id="internActiveDays"
            type="number"
            min={1}
            max={730}
            required
            value={active_days}
            onChange={(change_event) => set_active_days(change_event.target.value)}
            className="h-8 w-28 bg-background text-xs font-semibold"
            placeholder="90"
          />
          <div className="flex flex-wrap items-center gap-1">
            {PRESET_DAYS.map((preset_day) => (
              <button
                key={preset_day}
                type="button"
                onClick={() => set_active_days(String(preset_day))}
                className={`rounded border px-2 py-1 text-[10px] font-semibold cursor-pointer transition-colors ${
                  active_days === String(preset_day)
                    ? "border-amber-600 bg-amber-600 text-white"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {preset_day}d
              </button>
            ))}
          </div>
        </div>
        {expiration_preview && (
          <p className="text-[10px] font-medium text-amber-800 dark:text-amber-200">
            Acceso válido por {active_days} día(s) · Expira el <strong>{expiration_preview}</strong>
          </p>
        )}
      </div>
    </div>
  );
}
