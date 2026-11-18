/**
 * @fileoverview Campos editables de metadatos del proyecto PDCA (título, área, autor, co-responsables y fecha límite).
 */
import React from "react";
import { Label } from "@/shared/ui/label";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import { DatePicker } from "@/shared/ui/date_picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { AREAS } from "@/domain/pdca";

interface UsuarioMeta {
  name: string;
  email: string;
}

interface PropiedadesCamposMetaPdca {
  title_value: string;
  on_title_change: (valor: string) => void;
  area_value: string;
  on_area_change: (valor: string) => void;
  deadline_date?: Date | undefined;
  on_deadline_change: (fecha?: Date) => void;
  author_name: string;
  author_email: string;
  on_author_change: (email: string, nombre: string) => void;
  assigned_users: UsuarioMeta[];
  on_toggle_assigned_user: (usuario: UsuarioMeta) => void;
  available_users: UsuarioMeta[];
  is_admin_user: boolean;
  is_editable: boolean;
}

/**
 * Formulario en cuadrícula para editar metadatos clave y asignaciones administrativas de un PDCA.
 */
export const PdcaMetaFields: React.FC<PropiedadesCamposMetaPdca> = ({
  title_value,
  on_title_change,
  area_value,
  on_area_change,
  deadline_date,
  on_deadline_change,
  author_email,
  on_author_change,
  assigned_users,
  on_toggle_assigned_user,
  available_users,
  is_admin_user,
  is_editable,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-border/80 bg-card/60">
      <div className="space-y-1.5 sm:col-span-2">
        <Label className="text-xs font-semibold">{translate("pdcaDialog.projectTitle")}</Label>
        <Input
          value={title_value}
          onChange={(evento) => on_title_change(evento.target.value)}
          disabled={!is_editable}
          placeholder="Ej: Reducción de mermas en cocimientos"
          className="h-9 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">{translate("pdcaDialog.operativeArea")}</Label>
        <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder={translate("pdcaDialog.selectArea")} />
          </SelectTrigger>
          <SelectContent>
            {AREAS.map((area_opcion) => (
              <SelectItem key={area_opcion.value} value={area_opcion.value}>
                {area_opcion.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold">{translate("pdcaDialog.deadline")}</Label>
        <DatePicker
          date={deadline_date}
          setDate={on_deadline_change}
          placeholder="DD/MM/AAAA"
          disabled={!is_admin_user}
          className="h-9 text-xs w-full"
        />
      </div>

      {is_admin_user && (
        <>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">{translate("pdcaDialog.mainAuthor")}</Label>
            <Select
              value={author_email}
              onValueChange={(correo_seleccionado) => {
                const usuario_encontrado = available_users.find(
                  (usuario_candidato) => usuario_candidato.email === correo_seleccionado,
                );
                on_author_change(correo_seleccionado, usuario_encontrado?.name || "Usuario");
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={translate("pdcaDialog.selectAuthor")} />
              </SelectTrigger>
              <SelectContent>
                {available_users.map((usuario_opcion) => (
                  <SelectItem key={usuario_opcion.email} value={usuario_opcion.email}>
                    {usuario_opcion.name} ({usuario_opcion.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">
              {translate("pdcaDialog.assignedCoResponsibles")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal min-h-[36px] h-auto p-2"
                >
                  {assigned_users.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {translate("pdcaDialog.assignCollaborators")}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {assigned_users.map((usuario_asignado) => (
                        <Badge
                          key={usuario_asignado.email}
                          variant="secondary"
                          className="text-[11px] py-0"
                        >
                          {usuario_asignado.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2" align="start">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {available_users.map((usuario_disponible) => {
                    const esta_asignado = assigned_users.some(
                      (asignado) => asignado.email === usuario_disponible.email,
                    );
                    return (
                      <div
                        key={usuario_disponible.email}
                        onClick={() => on_toggle_assigned_user(usuario_disponible)}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                      >
                        <span>{usuario_disponible.name}</span>
                        {esta_asignado && (
                          <Badge variant="outline" className="text-[10px]">
                            {translate("pdcaDialog.assigned")}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </>
      )}
    </div>
  );
};
