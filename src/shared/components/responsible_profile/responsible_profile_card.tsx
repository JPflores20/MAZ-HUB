/**
 * responsible_profile_card.tsx
 * Tarjeta visual compacta o estándar para mostrar un colaborador responsable con zoom a su fotografía.
 */
import React, { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type { DirectoryUser } from "@/features/auth/auth_context";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/utils/class_names";
import { ResponsiblePhotoModal } from "./responsible_photo_modal";
import {
  format_user_area_label,
  format_user_position_label,
  get_user_initials,
} from "./responsible_types";

interface ResponsibleProfileCardProps {
  user: DirectoryUser;
  onRemove?: (() => void) | undefined;
  compact?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Muestra foto ampliable, nombre, puesto y área de un responsable asignado.
 *
 * @param props - Datos del colaborador, modo compacto y callback opcional para quitarlo.
 * @returns Tarjeta interactiva con visor modal acoplado.
 */
export const ResponsibleProfileCard: React.FC<ResponsibleProfileCardProps> = ({
  user,
  onRemove,
  compact = false,
  className,
}) => {
  const [is_photo_open, set_is_photo_open] = useState(false);

  const display_position = format_user_position_label(user.position);
  const display_area = format_user_area_label(user.area);

  return (
    <>
      <div
        className={cn(
          "group relative inline-flex items-center gap-2.5 rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all hover:border-primary/40 hover:shadow-sm",
          compact ? "px-2 py-1.5" : "px-3 py-2",
          className,
        )}
      >
        <button
          type="button"
          title="Haz clic para expandir la foto"
          onClick={(click_event) => {
            click_event.preventDefault();
            click_event.stopPropagation();
            set_is_photo_open(true);
          }}
          className={cn(
            "relative shrink-0 rounded-full overflow-hidden border-2 border-primary/25 bg-primary/10 text-primary font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-105 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40",
            compact ? "size-8 text-[10px]" : "size-10 text-xs",
          )}
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
          ) : (
            <span>{get_user_initials(user.name)}</span>
          )}
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <ZoomIn className={compact ? "size-3" : "size-3.5"} />
          </span>
        </button>

        <div className="min-w-0 flex-1 text-left leading-tight">
          <p
            className={cn(
              "font-bold uppercase tracking-tight text-foreground truncate",
              compact ? "text-[11px] max-w-[175px]" : "text-xs max-w-[220px]",
            )}
            title={user.name}
          >
            {user.name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <Badge
              variant="secondary"
              className={cn(
                "font-semibold uppercase tracking-wide px-1.5 py-0 h-4 bg-primary/10 text-primary border-none",
                compact ? "text-[9px]" : "text-[10px]",
              )}
            >
              {display_position}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "font-medium uppercase tracking-wide px-1.5 py-0 h-4 text-muted-foreground border-border",
                compact ? "text-[9px]" : "text-[10px]",
              )}
            >
              {display_area}
            </Badge>
          </div>
        </div>

        {onRemove && (
          <button
            type="button"
            title="Quitar responsable"
            onClick={(click_event) => {
              click_event.preventDefault();
              click_event.stopPropagation();
              onRemove();
            }}
            className="ml-0.5 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer shrink-0"
          >
            <X className={compact ? "size-3" : "size-3.5"} />
          </button>
        )}
      </div>

      <ResponsiblePhotoModal
        open={is_photo_open}
        onOpenChange={set_is_photo_open}
        user={user}
      />
    </>
  );
};
