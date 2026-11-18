/**
 * @fileoverview Selector múltiple de responsables y colaboradores asignados en el Paso 1 del PDCA.
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, UserPlus } from "lucide-react";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  ResponsibleProfileCard,
  ResponsibleSelectorItem,
  useDirectoryUsers,
} from "@/shared/components/responsible_profile";
import type { UsuarioPlan } from "./phase_plan_types";

interface PropiedadesResponsablesAsignados {
  assigned_users: UsuarioPlan[];
  available_users: UsuarioPlan[];
  is_editable: boolean;
  on_toggle_assigned_user: (usuario: UsuarioPlan) => void;
}

/**
 * Permite seleccionar co-responsables del directorio corporativo o agregar colaboradores externos.
 */
export function Subphase1AssignedUsers({
  assigned_users,
  available_users,
  is_editable,
  on_toggle_assigned_user,
}: PropiedadesResponsablesAsignados) {
  const { t: translate } = useTranslation();
  const [nombre_personalizado, set_nombre_personalizado] = useState("");
  const { directory: usuarios_directorio, resolve_user } = useDirectoryUsers(available_users);
  const usuarios_seleccionables =
    usuarios_directorio.length > 0 ? usuarios_directorio : available_users ?? [];

  const agregar_asignado_manual = () => {
    const nombre_limpio = nombre_personalizado.trim();
    if (!nombre_limpio) return;
    on_toggle_assigned_user({
      name: nombre_limpio.toUpperCase(),
      email: `${nombre_limpio.toLowerCase().replace(/\s+/g, ".")}@colaborador.local`,
    });
    set_nombre_personalizado("");
  };

  return (
    <div className="space-y-2 rounded-xl border border-border bg-secondary/15 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-xs font-bold uppercase tracking-wide text-foreground">
          {translate("pdcaPlan.assignedUsers")}
        </Label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!is_editable}
              className="h-8 gap-1.5 text-xs font-semibold"
            >
              <UserPlus className="size-3.5 text-primary" />
              {assigned_users.length === 0
                ? translate("pdcaPlan.selectUsers")
                : "Asignar / quitar responsables"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3 space-y-2.5" align="end">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Asignar PDCA a varios usuarios
            </p>
            <div className="max-h-64 overflow-y-auto space-y-1 border-b border-border pb-2">
              {usuarios_seleccionables.map((usuario_opcion) => {
                const usuario_resuelto = resolve_user(usuario_opcion);
                const esta_asignado = assigned_users.some(
                  (asignado) =>
                    (usuario_opcion.email &&
                      asignado.email.toLowerCase() === usuario_opcion.email.toLowerCase()) ||
                    asignado.name.toLowerCase() === usuario_opcion.name.toLowerCase(),
                );
                return (
                  <ResponsibleSelectorItem
                    key={usuario_opcion.email || usuario_opcion.name}
                    user={usuario_resuelto}
                    selected={esta_asignado}
                    onToggle={() =>
                      on_toggle_assigned_user({
                        name: usuario_resuelto.name,
                        email: usuario_resuelto.email,
                      })
                    }
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 pt-0.5">
              <Input
                value={nombre_personalizado}
                onChange={(evento) => set_nombre_personalizado(evento.target.value)}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter") {
                    evento.preventDefault();
                    agregar_asignado_manual();
                  }
                }}
                placeholder="Agregar otro nombre..."
                className="h-7 text-xs"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={agregar_asignado_manual}
                className="h-7 w-7 shrink-0"
              >
                <Plus className="size-3.5" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {assigned_users.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">
          No hay responsables asignados aún. Haz clic en el botón superior para seleccionar uno o
          varios responsables.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {assigned_users.map((usuario_asignado) => (
            <ResponsibleProfileCard
              key={usuario_asignado.email || usuario_asignado.name}
              user={resolve_user(usuario_asignado)}
              onRemove={
                is_editable ? () => on_toggle_assigned_user(usuario_asignado) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
