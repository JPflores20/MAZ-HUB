/**
 * responsible_selector_item.tsx
 * Fila seleccionable dentro del directorio de responsables con vista ampliable de avatar.
 */
import React, { useState } from "react";
import { Check, ZoomIn } from "lucide-react";
import type { DirectoryUser } from "@/features/auth/auth_context";
import { cn } from "@/shared/utils/class_names";
import { ResponsiblePhotoModal } from "./responsible_photo_modal";
import {
  format_user_area_label,
  format_user_position_label,
  get_user_initials,
} from "./responsible_types";

interface ResponsibleSelectorItemProps {
  user: DirectoryUser;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Fila interactiva para elegir o desmarcar un responsable dentro del selector de directorio.
 *
 * @param props - Usuario del directorio, bandera de selección y handler `onToggle`.
 * @returns Fila accesible con teclado y modal de fotografía independiente.
 */
export const ResponsibleSelectorItem: React.FC<ResponsibleSelectorItemProps> = ({
  user,
  selected,
  onToggle,
}) => {
  const [is_photo_open, set_is_photo_open] = useState(false);
  const display_position = format_user_position_label(user.position);
  const display_area = format_user_area_label(user.area);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(keyboard_event) => {
          if (keyboard_event.key === "Enter" || keyboard_event.key === " ") {
            keyboard_event.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer border",
          selected
            ? "bg-primary/10 border-primary/30 text-primary font-semibold"
            : "border-transparent hover:bg-muted text-foreground",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            title="Ver foto en grande"
            onClick={(click_event) => {
              click_event.preventDefault();
              click_event.stopPropagation();
              set_is_photo_open(true);
            }}
            className="relative group/avatar size-8 shrink-0 rounded-full overflow-hidden border border-primary/30 bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
            ) : (
              <span>{get_user_initials(user.name)}</span>
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="size-3" />
            </span>
          </button>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-bold uppercase text-[11px] text-foreground">
              {user.name}
            </p>
            <p className="truncate text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
              {display_position} • {display_area}
            </p>
          </div>
        </div>

        {selected && <Check className="size-4 shrink-0 text-primary" />}
      </div>

      <ResponsiblePhotoModal
        open={is_photo_open}
        onOpenChange={set_is_photo_open}
        user={user}
      />
    </>
  );
};
