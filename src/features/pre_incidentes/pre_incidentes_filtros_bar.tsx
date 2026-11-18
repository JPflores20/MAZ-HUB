/**
 * @fileoverview Multi-criteria filter bar for the Precursors & Process Incidents Matrix.
 */

import { Search } from "lucide-react";
import { CATALOGO_AREAS } from "@/domain/constants/usabilidad_catalogs";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

interface PropiedadesFiltrosPreIncidentes {
  texto_busqueda: string;
  on_cambiar_busqueda: (valor: string) => void;
  clasificacion_seleccionada: string;
  on_cambiar_clasificacion: (valor: string) => void;
  area_seleccionada: string;
  on_cambiar_area: (valor: string) => void;
  anio_seleccionado: string;
  on_cambiar_anio: (valor: string) => void;
  anios_disponibles: number[];
}

/** Filter bar for text search, severity classification, brewing area, and year. */
export function PreIncidentesFiltrosBar({
  texto_busqueda,
  on_cambiar_busqueda,
  clasificacion_seleccionada,
  on_cambiar_clasificacion,
  area_seleccionada,
  on_cambiar_area,
  anio_seleccionado,
  on_cambiar_anio,
  anios_disponibles,
}: PropiedadesFiltrosPreIncidentes) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Buscar por Falla, Equipo, Variable o Responsable
            </label>
            <div className="relative">
              <Search className="size-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Ej. Color, Filtro, Corona, BBT..."
                value={texto_busqueda}
                onChange={(evento_cambio) => on_cambiar_busqueda(evento_cambio.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Clasificación de Severidad
            </label>
            <select
              value={clasificacion_seleccionada}
              onChange={(evento_cambio) => on_cambiar_clasificacion(evento_cambio.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Todos (Precursores + Incidentes)</option>
              <option value="Precursor">Solo Precursores (&lt; 100 pts)</option>
              <option value="Incidente">Solo Incidentes de Proceso (≥ 100 pts)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Área
            </label>
            <select
              value={area_seleccionada}
              onChange={(evento_cambio) => on_cambiar_area(evento_cambio.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">Todas las áreas</option>
              {CATALOGO_AREAS.map((nombre_area) => (
                <option key={nombre_area} value={nombre_area}>
                  {nombre_area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block">
              Año
            </label>
            <select
              value={anio_seleccionado}
              onChange={(evento_cambio) => on_cambiar_anio(evento_cambio.target.value)}
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
        </div>
      </CardContent>
    </Card>
  );
}
