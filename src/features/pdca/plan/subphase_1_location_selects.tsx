/**
 * @fileoverview Selectores normalizados de ubicación operativa (Planta, Departamento, Área, Etapa) del Paso 1.
 */
import { useTranslation } from "react-i18next";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  OFFICIAL_AREAS,
  OFFICIAL_DEPARTAMENTOS,
  OFFICIAL_ETAPAS,
  OFFICIAL_PLANTAS,
} from "@/domain/pdca";

interface PropiedadesSelectoresUbicacion {
  planta_value?: string | undefined;
  on_planta_change?: ((valor: string) => void) | undefined;
  departamento_value?: string | undefined;
  on_departamento_change?: ((valor: string) => void) | undefined;
  area_value: string;
  on_area_change: (valor: string) => void;
  etapa_value?: string | undefined;
  on_etapa_change?: ((valor: string) => void) | undefined;
  is_editable: boolean;
}

function resolver_opciones_catalogo(
  catalogo_oficial: readonly string[],
  valor_actual?: string,
): string[] {
  const valor_limpio = (valor_actual || "").trim();
  if (!valor_limpio) return [...catalogo_oficial];
  const existe_en_catalogo = catalogo_oficial.some(
    (opcion) => opcion.toLowerCase() === valor_limpio.toLowerCase(),
  );
  return existe_en_catalogo ? [...catalogo_oficial] : [valor_limpio, ...catalogo_oficial];
}

function normalizar_opcion_catalogo(
  catalogo_oficial: readonly string[],
  valor_actual?: string,
): string {
  const valor_limpio = (valor_actual || "").trim();
  if (!valor_limpio) return "";
  const minusculas = valor_limpio.toLowerCase();
  if (minusculas === "cocimientos") return "Cocimientos";
  if (minusculas === "bloque_frio" || minusculas === "cuartos_frios" || minusculas === "cuartos frios") {
    return "Cuartos Frios";
  }
  if (minusculas === "mantenimiento") return "Mantenimiento";
  return (
    catalogo_oficial.find((opcion) => opcion.toLowerCase() === minusculas) ?? valor_limpio
  );
}

/**
 * Renderiza la fila de selectores de catálogo oficial (Planta, Departamento, Área y Etapa) del PDCA.
 */
export function Subphase1LocationSelects({
  planta_value,
  on_planta_change,
  departamento_value,
  on_departamento_change,
  area_value,
  on_area_change,
  etapa_value,
  on_etapa_change,
  is_editable,
}: PropiedadesSelectoresUbicacion) {
  const { t: translate } = useTranslation();

  const planta_normalizada = normalizar_opcion_catalogo(
    OFFICIAL_PLANTAS,
    planta_value || "Zacatecas",
  );
  const departamento_normalizado = normalizar_opcion_catalogo(
    OFFICIAL_DEPARTAMENTOS,
    departamento_value,
  );
  const area_normalizada = normalizar_opcion_catalogo(OFFICIAL_AREAS, area_value);
  const etapa_normalizada = normalizar_opcion_catalogo(OFFICIAL_ETAPAS, etapa_value);

  const selectores_ubicacion = [
    {
      etiqueta: "Planta",
      valor: planta_normalizada,
      opciones: resolver_opciones_catalogo(OFFICIAL_PLANTAS, planta_normalizada),
      placeholder: "Seleccionar planta",
      al_cambiar: (valor: string) => on_planta_change?.(valor),
    },
    {
      etiqueta: "Departamento",
      valor: departamento_normalizado,
      opciones: resolver_opciones_catalogo(OFFICIAL_DEPARTAMENTOS, departamento_normalizado),
      placeholder: "Seleccionar departamento",
      al_cambiar: (valor: string) => on_departamento_change?.(valor),
    },
    {
      etiqueta: translate("pdcaPlan.area"),
      valor: area_normalizada,
      opciones: resolver_opciones_catalogo(OFFICIAL_AREAS, area_normalizada),
      placeholder: translate("pdcaPlan.selectArea"),
      al_cambiar: on_area_change,
    },
    {
      etiqueta: "Etapa",
      valor: etapa_normalizada,
      opciones: resolver_opciones_catalogo(OFFICIAL_ETAPAS, etapa_normalizada),
      placeholder: "Seleccionar etapa",
      al_cambiar: (valor: string) => on_etapa_change?.(valor),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {selectores_ubicacion.map((selector) => (
        <div key={selector.etiqueta} className="space-y-1.5">
          <Label className="text-xs font-semibold">{selector.etiqueta}</Label>
          <Select
            value={selector.valor}
            onValueChange={selector.al_cambiar}
            disabled={!is_editable}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder={selector.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selector.opciones.map((opcion_texto) => (
                <SelectItem key={opcion_texto} value={opcion_texto}>
                  {opcion_texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}
