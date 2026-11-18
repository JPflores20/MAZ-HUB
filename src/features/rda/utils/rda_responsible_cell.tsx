/**
 * @fileoverview Shared responsible-user badge list and directory popover reused by RDA context & summary tables.
 */

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import type { DirectoryUser } from "@/features/auth/auth_context";
import {
  ResponsibleProfileCard,
  ResponsibleSelectorItem,
} from "@/shared/components/responsible_profile";
import type { ResponsibleInput } from "@/shared/components/responsible_profile";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

interface RdaResponsibleCellProps {
  assigned_names: string[];
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  is_editable: boolean;
  on_toggle_user: (user_name: string) => void;
  on_add_custom_name: (custom_name: string) => void;
  compact_trigger_variant?: "form" | "table";
}

/** Displays assigned user cards alongside a searchable popover to assign directory or custom users. */
export function RdaResponsibleCell({
  assigned_names,
  available_users,
  resolve_user,
  is_editable,
  on_toggle_user,
  on_add_custom_name,
  compact_trigger_variant = "form",
}: RdaResponsibleCellProps) {
  const [custom_responsible, set_custom_responsible] = useState("");

  const handle_submit_custom = () => {
    const trimmed = custom_responsible.trim();
    if (!trimmed) return;
    on_add_custom_name(trimmed);
    set_custom_responsible("");
  };

  const empty_button_class =
    compact_trigger_variant === "table"
      ? "inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer print:hidden"
      : "w-full min-h-[34px] rounded-md border border-input bg-transparent px-2 py-1 text-left text-xs flex items-center gap-1.5 text-muted-foreground hover:bg-secondary/40 transition-colors cursor-pointer";

  const icon_button_class =
    compact_trigger_variant === "table"
      ? "inline-flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer shrink-0 print:hidden"
      : "inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer shrink-0";

  return (
    <div
      className={
        compact_trigger_variant === "table"
          ? "flex flex-wrap items-center justify-center gap-1.5 py-0.5"
          : "flex flex-wrap items-center gap-1.5 min-w-[230px]"
      }
    >
      {assigned_names.map((person_name) => (
        <ResponsibleProfileCard
          key={person_name}
          compact
          user={resolve_user(person_name)}
          onRemove={is_editable ? () => on_toggle_user(person_name) : undefined}
        />
      ))}
      {!is_editable && assigned_names.length === 0 && "-"}
      {is_editable && (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={assigned_names.length === 0 ? empty_button_class : icon_button_class}
            >
              <UserPlus
                className={
                  compact_trigger_variant === "table" ? "size-3.5 text-blue-700" : "size-3.5 text-primary"
                }
              />
              {assigned_names.length === 0 && (
                <span>{compact_trigger_variant === "table" ? "Asignar..." : "Asignar responsables..."}</span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 space-y-2.5" align="start">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Seleccionar Usuarios Responsables
            </p>
            <div className="max-h-56 overflow-y-auto space-y-1 border-b border-border pb-2">
              {available_users.map((directory_user) => {
                const resolved_user = resolve_user(directory_user);
                const is_selected = assigned_names.some(
                  (assigned_person) =>
                    assigned_person.toLowerCase() === resolved_user.name.toLowerCase(),
                );
                return (
                  <ResponsibleSelectorItem
                    key={directory_user.email || directory_user.name}
                    user={resolved_user}
                    selected={is_selected}
                    onToggle={() => on_toggle_user(resolved_user.name)}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <Input
                value={custom_responsible}
                onChange={(change_event) => set_custom_responsible(change_event.target.value)}
                onKeyDown={(keyboard_event) => {
                  if (keyboard_event.key === "Enter") {
                    keyboard_event.preventDefault();
                    handle_submit_custom();
                  }
                }}
                placeholder="Otro nombre..."
                className="h-7 text-xs"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={handle_submit_custom}
                className="h-7 w-7 shrink-0"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
