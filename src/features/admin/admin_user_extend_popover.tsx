/**
 * @fileoverview Compact popover allowing administrators to assign or renew active days for an intern account.
 */

import { useState } from "react";
import { CalendarClock, Loader2 } from "lucide-react";
import type { UserProfile } from "@/features/auth/auth_context";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface AdminUserExtendPopoverProps {
  user_profile: UserProfile;
  on_extend_days: (user_profile: UserProfile, active_days: number) => Promise<void>;
}

/** Renders a calendar trigger button and inline days form to extend temporary intern access. */
export function AdminUserExtendPopover({
  user_profile,
  on_extend_days,
}: AdminUserExtendPopoverProps) {
  const [open, set_open] = useState(false);
  const [days_input, set_days_input] = useState(String(user_profile.activeDays || 30));
  const [is_saving, set_is_saving] = useState(false);

  const parsed_days = Number(days_input.trim());
  const is_valid = Number.isInteger(parsed_days) && parsed_days >= 1 && parsed_days <= 730;

  const handle_apply = async () => {
    if (!is_valid) return;
    set_is_saving(true);
    try {
      await on_extend_days(user_profile, parsed_days);
      set_open(false);
    } finally {
      set_is_saving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={set_open}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={`Asignar o renovar vigencia temporal (días) para ${user_profile.name}`}
          aria-label={`Renovar días de ${user_profile.name}`}
          className="h-8 w-8 text-sky-600 hover:bg-sky-500/15 hover:text-sky-700 dark:text-sky-400"
        >
          <CalendarClock className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 space-y-2.5" align="end">
        <p className="text-xs font-bold uppercase text-foreground">Vigencia de Becario (días)</p>
        <p className="text-[11px] text-muted-foreground">
          Define cuántos días permanecerá activa la cuenta a partir de hoy (1 a 730).
        </p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={730}
            value={days_input}
            onChange={(change_event) => set_days_input(change_event.target.value)}
            className="h-8 text-xs font-semibold"
          />
          <Button
            type="button"
            size="sm"
            disabled={!is_valid || is_saving}
            onClick={() => void handle_apply()}
            className="h-8 px-3 text-xs"
          >
            {is_saving ? <Loader2 className="size-3.5 animate-spin" /> : "Aplicar"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
