/**
 * selectores_severidad_y_sdca.tsx
 * Subcomponente reutilizable de selección interactiva para los 7 criterios de la Matriz de Severidad
 * y los 12 pilares del Ciclo SDCA VPO.
 */
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  CATALOGO_CRITERIOS_SEVERIDAD,
  CATALOGO_PILARES_SDCA,
} from "@/data/usabilidad/usabilidad_catalogs";
import type {
  ClavePilarSdca,
  CriteriosSeveridad,
  MapaPilaresSdca,
} from "@/data/usabilidad/usabilidad_types";

interface PropiedadesSelectoresSeveridadSdca {
  criterios_severidad: CriteriosSeveridad;
  on_alternar_criterio: (clave_criterio: keyof CriteriosSeveridad) => void;
  pilares_sdca: MapaPilaresSdca;
  on_alternar_pilar: (clave_pilar: ClavePilarSdca) => void;
}

export function SelectoresSeveridadYSdca({
  criterios_severidad,
  on_alternar_criterio,
  pilares_sdca,
  on_alternar_pilar,
}: PropiedadesSelectoresSeveridadSdca) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">
          Matriz de Severidad (≥ 100 pts = Incidente de Proceso)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {CATALOGO_CRITERIOS_SEVERIDAD.map((criterio) => {
            const esta_marcado = Boolean(criterios_severidad[criterio.clave]);
            return (
              <div
                key={criterio.clave}
                onClick={() => on_alternar_criterio(criterio.clave)}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                  esta_marcado
                    ? "bg-rose-500/10 border-rose-500/50 font-semibold"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox checked={esta_marcado} />
                  <span>{criterio.etiqueta}</span>
                </div>
                <Badge variant={esta_marcado ? "destructive" : "outline"}>
                  {criterio.puntos}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-xs font-bold uppercase text-muted-foreground mb-1.5 block">
          Herramientas Accionadas en el Ciclo SDCA (12 Pilares)
        </Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {CATALOGO_PILARES_SDCA.map((pilar) => {
            const esta_marcado = Boolean(pilares_sdca[pilar.clave]);
            return (
              <div
                key={pilar.clave}
                onClick={() => on_alternar_pilar(pilar.clave)}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                  esta_marcado
                    ? "bg-blue-500/10 border-blue-500/50 font-semibold"
                    : "hover:bg-muted/50"
                }`}
              >
                <Checkbox checked={esta_marcado} />
                <span className="truncate">{pilar.etiqueta_corta}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
