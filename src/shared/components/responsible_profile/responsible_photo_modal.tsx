/**
 * responsible_photo_modal.tsx
 * Visor modal ampliado (lightbox) con la fotografía, puesto y área de un colaborador asignado.
 */
import React from "react";
import { Briefcase, Building2 } from "lucide-react";
import type { DirectoryUser } from "@/features/auth/auth_context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  format_user_area_label,
  format_user_position_label,
  get_user_initials,
} from "./responsible_types";

interface ResponsiblePhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DirectoryUser;
}

/**
 * Muestra la foto de perfil ampliada del responsable junto con su información institucional.
 *
 * @param props - Estado abierto, handler `onOpenChange` y perfil `user` a inspeccionar.
 * @returns Modal `<Dialog />` con fotografía o iniciales de respaldo.
 */
export const ResponsiblePhotoModal: React.FC<ResponsiblePhotoModalProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const display_area = format_user_area_label(user.area, "SIN ÁREA ASIGNADA");
  const display_position = format_user_position_label(user.position, "SIN PUESTO ASIGNADO");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-border bg-card shadow-2xl"
        onClick={(click_event) => click_event.stopPropagation()}
      >
        <DialogHeader className="p-4 pb-2 border-b border-border bg-secondary/30">
          <DialogTitle className="text-sm font-bold uppercase tracking-wide text-foreground">
            {user.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fotografía y datos del responsable asignado
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 flex flex-col items-center gap-4">
          <div className="relative w-full flex items-center justify-center rounded-xl bg-muted/50 border border-border p-3 min-h-[260px] max-h-[65vh] overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Foto de ${user.name}`}
                className="max-h-[58vh] w-auto max-w-full rounded-lg object-contain shadow-md transition-transform"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                <div className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-black border-2 border-primary/20 shadow-inner">
                  {get_user_initials(user.name)}
                </div>
                <span className="text-xs italic">Sin fotografía de perfil cargada</span>
              </div>
            )}
          </div>

          <div className="w-full rounded-xl border border-border bg-secondary/20 p-3.5 space-y-2">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-wide text-foreground">
                {user.name}
              </p>
              {user.email && !user.email.endsWith("@colaborador.local") && (
                <p className="text-[11px] text-muted-foreground">{user.email}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
              <div className="rounded-lg bg-background/80 p-2 border border-border/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                  <Briefcase className="size-3 text-primary" />
                  Puesto
                </span>
                <span className="mt-0.5 block font-bold uppercase text-foreground text-[11px]">
                  {display_position}
                </span>
              </div>
              <div className="rounded-lg bg-background/80 p-2 border border-border/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                  <Building2 className="size-3 text-primary" />
                  Área
                </span>
                <span className="mt-0.5 block font-bold uppercase text-foreground text-[11px]">
                  {display_area}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
