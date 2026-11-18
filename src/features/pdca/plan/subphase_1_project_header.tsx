/**
 * @fileoverview Encabezado de metadatos generales (Título, Fecha, Autor y Ubicación) del Paso 1.
 */
import { useTranslation } from "react-i18next";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { DatePicker } from "@/shared/ui/date_picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useDirectoryUsers } from "@/shared/components/responsible_profile";
import { Subphase1LocationSelects } from "./subphase_1_location_selects";
import type { UsuarioPlan } from "./phase_plan_types";

interface PropiedadesEncabezadoPaso1 {
  title_value: string;
  on_title_change: (valor: string) => void;
  planta_value?: string | undefined;
  on_planta_change?: ((valor: string) => void) | undefined;
  departamento_value?: string | undefined;
  on_departamento_change?: ((valor: string) => void) | undefined;
  area_value: string;
  on_area_change: (valor: string) => void;
  etapa_value?: string | undefined;
  on_etapa_change?: ((valor: string) => void) | undefined;
  deadline_date?: Date | undefined;
  on_deadline_change: (fecha?: Date) => void;
  author_name: string;
  author_email: string;
  on_author_change: (email: string, nombre: string) => void;
  available_users: UsuarioPlan[];
  is_admin_user: boolean;
  is_editable: boolean;
}

/**
 * Renderiza título, autor, fecha límite y delega la fila de selectores de ubicación operativa del PDCA.
 */
export function Subphase1ProjectHeader({
  title_value,
  on_title_change,
  planta_value,
  on_planta_change,
  departamento_value,
  on_departamento_change,
  area_value,
  on_area_change,
  etapa_value,
  on_etapa_change,
  deadline_date,
  on_deadline_change,
  author_name,
  author_email,
  on_author_change,
  available_users,
  is_admin_user,
  is_editable,
}: PropiedadesEncabezadoPaso1) {
  const { t: translate } = useTranslation();
  const { directory: usuarios_directorio } = useDirectoryUsers(available_users);
  const usuarios_seleccionables =
    usuarios_directorio.length > 0 ? usuarios_directorio : available_users ?? [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5 lg:col-span-2">
          <Label className="text-xs font-semibold">{translate("pdcaPlan.projectTitle")}</Label>
          <Input
            value={title_value}
            onChange={(evento) => on_title_change(evento.target.value)}
            disabled={!is_editable}
            placeholder={translate("pdcaPlan.projectTitlePlaceholder")}
            className="h-9 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{translate("pdcaPlan.deadline")}</Label>
          <DatePicker
            date={deadline_date}
            setDate={on_deadline_change}
            placeholder={translate("pdcaPlan.selectDeadline")}
            disabled={!is_admin_user}
            className="h-9 text-xs w-full"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{translate("pdcaPlan.originalAuthor")}</Label>
          {is_admin_user ? (
            <Select
              value={author_email}
              onValueChange={(correo_seleccionado) => {
                const usuario_encontrado = usuarios_seleccionables.find(
                  (candidato) => candidato.email === correo_seleccionado,
                );
                on_author_change(correo_seleccionado, usuario_encontrado?.name || "Usuario");
              }}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={translate("pdcaPlan.selectAuthor")} />
              </SelectTrigger>
              <SelectContent>
                {usuarios_seleccionables.map((usuario_opcion) => (
                  <SelectItem
                    key={usuario_opcion.email || usuario_opcion.name}
                    value={usuario_opcion.email}
                  >
                    {usuario_opcion.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={author_name} disabled className="h-9 text-xs" />
          )}
        </div>
      </div>

      <Subphase1LocationSelects
        planta_value={planta_value}
        on_planta_change={on_planta_change}
        departamento_value={departamento_value}
        on_departamento_change={on_departamento_change}
        area_value={area_value}
        on_area_change={on_area_change}
        etapa_value={etapa_value}
        on_etapa_change={on_etapa_change}
        is_editable={is_editable}
      />
    </>
  );
}
