/**
 * @fileoverview Admin banner enabling quick profile switching between registered platform collaborators.
 */

import { RotateCcw, Users } from "lucide-react";
import type { UserProfile } from "@/features/auth/auth_context";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface AdminTargetUserBannerProps {
  current_user_uid: string;
  target_user_uid: string;
  available_users: UserProfile[];
  is_editing_other_user: boolean;
  on_select_uid: (next_uid: string) => void;
}

/** Displays the amber administrator selector bar at the top of the settings view. */
export function AdminTargetUserBanner({
  current_user_uid,
  target_user_uid,
  available_users,
  is_editing_other_user,
  on_select_uid,
}: AdminTargetUserBannerProps) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Users className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Modo Administrador
            </span>
            {is_editing_other_user && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">
                Editando a otro usuario
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground mt-0.5">
            Selecciona cualquier usuario registrado para consultar o modificar sus datos personales:
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full sm:w-80">
          <Select value={target_user_uid} onValueChange={on_select_uid}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Selecciona un usuario" />
            </SelectTrigger>
            <SelectContent>
              {available_users.map((directory_user) => (
                <SelectItem key={directory_user.uid} value={directory_user.uid}>
                  <span className="font-semibold uppercase">{directory_user.name}</span>{" "}
                  <span className="text-xs text-muted-foreground">
                    (
                    {directory_user.uid === current_user_uid
                      ? "Tú"
                      : directory_user.area || directory_user.email}
                    )
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {is_editing_other_user && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => on_select_uid(current_user_uid)}
            className="gap-1.5 text-xs shrink-0"
          >
            <RotateCcw className="size-3.5" />
            Volver a mi perfil
          </Button>
        )}
      </div>
    </div>
  );
}
