/**
 * usabilidad_filtros_bar.tsx
 * Barra de filtros multicriterio para el módulo de Usabilidad de Herramientas:
 * búsqueda textual, filtro por año, mes, área operativa, herramienta y cruce con RDAs/PDCAs.
 */
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NOMBRES_MESES } from "@/data/usabilidad/usabilidad_catalogs";

interface PropiedadesBarraFiltrosUsabilidad {
  texto_busqueda: string;
  on_cambiar_busqueda: (valor: string) => void;
  anio_seleccionado: string;
  on_cambiar_anio: (valor: string) => void;
  mes_seleccionado: string;
  on_cambiar_mes: (valor: string) => void;
  area_seleccionada: string;
  on_cambiar_area: (valor: string) => void;
  herramienta_seleccionada: string;
  on_cambiar_herramienta: (valor: string) => void;
  anios_disponibles: number[];
  areas_disponibles: string[];
  incluir_documentos_plataforma: boolean;
  on_cambiar_incluir_plataforma: (activo: boolean) => void;
  conteo_registros_plataforma: number;
}

export function UsabilidadFiltrosBar({
  texto_busqueda,
  on_cambiar_busqueda,
  anio_seleccionado,
  on_cambiar_anio,
  mes_seleccionado,
  on_cambiar_mes,
  area_seleccionada,
  on_cambiar_area,
  herramienta_seleccionada,
  on_cambiar_herramienta,
  anios_disponibles,
  areas_disponibles,
  incluir_documentos_plataforma,
  on_cambiar_incluir_plataforma,
  conteo_registros_plataforma,
}: PropiedadesBarraFiltrosUsabilidad) {
  return (
    <Card className="border-slate-200/80 dark:border-slate-800 shadow-xs">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Buscar Falla / Responsable / IAL
            </label>
            <div className="relative">
              <Search className="size-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Ej. Filtro Lauter, Samantha, 370228..."
                value={texto_busqueda}
                onChange={(e) => on_cambiar_busqueda(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Año
            </label>
            <select
              value={anio_seleccionado}
              onChange={(e) => on_cambiar_anio(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Todos los años</option>
              {anios_disponibles.map((anio) => (
                <option key={anio} value={String(anio)}>
                  {anio}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Mes
            </label>
            <select
              value={mes_seleccionado}
              onChange={(e) => on_cambiar_mes(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Todos los meses</option>
              {Object.entries(NOMBRES_MESES).map(([numero_mes, etiqueta_mes]) => (
                <option key={numero_mes} value={numero_mes}>
                  {numero_mes} - {etiqueta_mes}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Área Operativa
            </label>
            <select
              value={area_seleccionada}
              onChange={(e) => on_cambiar_area(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Todas las áreas</option>
              {areas_disponibles.map((nombre_area) => (
                <option key={nombre_area} value={nombre_area}>
                  {nombre_area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Herramienta
            </label>
            <select
              value={herramienta_seleccionada}
              onChange={(e) => on_cambiar_herramienta(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Todas (5W + RDA + PDCA)</option>
              <option value="5W">5W (Interaction Log)</option>
              <option value="RDA">RDA (Reporte de Anomalía)</option>
              <option value="PDCA">PDCA (Ciclos de Mejora)</option>
            </select>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 h-9 bg-muted/30">
            <Label
              htmlFor="sync-platform-switch"
              className="text-xs font-medium cursor-pointer"
            >
              Cruzar RDAs/PDCAs App ({conteo_registros_plataforma})
            </Label>
            <Switch
              id="sync-platform-switch"
              checked={incluir_documentos_plataforma}
              onCheckedChange={on_cambiar_incluir_plataforma}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
