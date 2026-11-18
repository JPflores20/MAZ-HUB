/**
 * @fileoverview Form modal for registering a new process precursor or incident event with live scoring.
 */

import type React from "react";
import { calcular_puntaje_severidad } from "@/domain/calculators/usabilidad_calculators";
import {
  CATALOGO_AREAS,
  CATALOGO_KPIS,
  CATALOGO_MARCAS,
  CATALOGO_PROCESOS,
  CATALOGO_VARIABLES,
} from "@/domain/constants/usabilidad_catalogs";
import type {
  CriteriosSeveridad,
  MapaPilaresSdca,
  TipoHerramienta,
} from "@/domain/models/usabilidad/usabilidad_types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SelectoresSeveridadYSdca } from "./selectores_severidad_y_sdca";

export interface FormularioNuevoPrecursor {
  fecha_evento: string;
  id_ial: string;
  descripcion_falla: string;
  nombre_responsable: string;
  tipo_herramienta: TipoHerramienta;
  estatus_analisis: "Completo" | "En Proceso";
  area_operativa: string;
  proceso_cervecero: string;
  equipo_afectado: string;
  marca_cerveza: string;
  variable_afectada: string;
  kpi_afectado: string;
  criterios_severidad: CriteriosSeveridad;
  pilares_sdca: MapaPilaresSdca;
}

interface PropiedadesModalNuevoPrecursor {
  esta_abierto: boolean;
  on_cambiar_abierto: (abierto: boolean) => void;
  datos_formulario: FormularioNuevoPrecursor;
  on_cambiar_formulario: React.Dispatch<React.SetStateAction<FormularioNuevoPrecursor>>;
  on_enviar_formulario: (evento: React.FormEvent) => void;
}

/** Modal form computing severity classification and QIR requirement live as fields change. */
export function ModalNuevoPrecursor({
  esta_abierto,
  on_cambiar_abierto,
  datos_formulario,
  on_cambiar_formulario,
  on_enviar_formulario,
}: PropiedadesModalNuevoPrecursor) {
  const calculo_severidad = calcular_puntaje_severidad(datos_formulario.criterios_severidad);
  const actualizar_campo = <ClaveCampo extends keyof FormularioNuevoPrecursor>(
    clave: ClaveCampo,
    valor: FormularioNuevoPrecursor[ClaveCampo],
  ) => on_cambiar_formulario((previo) => ({ ...previo, [clave]: valor }));

  const clase_select = "w-full h-8 rounded-md border bg-background px-2 text-xs mt-1";

  return (
    <Dialog open={esta_abierto} onOpenChange={on_cambiar_abierto}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-4">
            <span>Registrar Nuevo Evento en Matriz (5W / RDA)</span>
            <Badge className={calculo_severidad.es_incidente ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"}>
              {calculo_severidad.porcentaje_severidad} pts · {calculo_severidad.clasificacion}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Agrega un nuevo análisis a la Matriz de Precursores e Incidentes de Proceso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={on_enviar_formulario} className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Fecha del Evento</Label>
              <Input type="date" value={datos_formulario.fecha_evento} onChange={(evento_cambio) => actualizar_campo("fecha_evento", evento_cambio.target.value)} required className="h-8 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">Herramienta</Label>
              <select value={datos_formulario.tipo_herramienta} onChange={(evento_cambio) => actualizar_campo("tipo_herramienta", evento_cambio.target.value as TipoHerramienta)} className={clase_select}>
                <option value="5W">5W (Interaction Log)</option>
                <option value="RDA">RDA</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">ID IAL / Folio</Label>
              <Input placeholder="Ej. 426958" value={datos_formulario.id_ial} onChange={(evento_cambio) => actualizar_campo("id_ial", evento_cambio.target.value)} className="h-8 text-xs mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Descripción de la Falla</Label>
              <Input placeholder="Ej. Filtración larga del cocto Corona..." value={datos_formulario.descripcion_falla} onChange={(evento_cambio) => actualizar_campo("descripcion_falla", evento_cambio.target.value)} required className="h-8 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">Responsable</Label>
              <Input placeholder="Nombre del responsable" value={datos_formulario.nombre_responsable} onChange={(evento_cambio) => actualizar_campo("nombre_responsable", evento_cambio.target.value)} required className="h-8 text-xs mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">Área</Label>
              <select value={datos_formulario.area_operativa} onChange={(evento_cambio) => actualizar_campo("area_operativa", evento_cambio.target.value)} className={clase_select}>
                {CATALOGO_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Proceso</Label>
              <select value={datos_formulario.proceso_cervecero} onChange={(evento_cambio) => actualizar_campo("proceso_cervecero", evento_cambio.target.value)} className={clase_select}>
                {CATALOGO_PROCESOS.map((proceso) => <option key={proceso} value={proceso}>{proceso}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Marca</Label>
              <select value={datos_formulario.marca_cerveza} onChange={(evento_cambio) => actualizar_campo("marca_cerveza", evento_cambio.target.value)} className={clase_select}>
                {CATALOGO_MARCAS.map((marca) => <option key={marca} value={marca}>{marca}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">KPI Afectado</Label>
              <select value={datos_formulario.kpi_afectado} onChange={(evento_cambio) => actualizar_campo("kpi_afectado", evento_cambio.target.value)} className={clase_select}>
                {CATALOGO_KPIS.map((kpi) => <option key={kpi} value={kpi}>{kpi}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Equipo</Label>
              <Input placeholder="Ej. FILTRO LAUTER" value={datos_formulario.equipo_afectado} onChange={(evento_cambio) => actualizar_campo("equipo_afectado", evento_cambio.target.value)} className="h-8 text-xs mt-1" />
            </div>
            <div>
              <Label className="text-xs">Variable Afectada</Label>
              <select value={datos_formulario.variable_afectada} onChange={(evento_cambio) => actualizar_campo("variable_afectada", evento_cambio.target.value)} className={clase_select}>
                {CATALOGO_VARIABLES.map((nombre_variable) => <option key={nombre_variable} value={nombre_variable}>{nombre_variable}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Estatus</Label>
              <select value={datos_formulario.estatus_analisis} onChange={(evento_cambio) => actualizar_campo("estatus_analisis", evento_cambio.target.value as "Completo" | "En Proceso")} className={clase_select}>
                <option value="Completo">Completo</option>
                <option value="En Proceso">En Proceso</option>
              </select>
            </div>
          </div>

          <SelectoresSeveridadYSdca
            criterios_severidad={datos_formulario.criterios_severidad}
            on_alternar_criterio={(clave) =>
              actualizar_campo("criterios_severidad", {
                ...datos_formulario.criterios_severidad,
                [clave]: !datos_formulario.criterios_severidad[clave],
              })
            }
            pilares_sdca={datos_formulario.pilares_sdca}
            on_alternar_pilar={(clave) =>
              actualizar_campo("pilares_sdca", {
                ...datos_formulario.pilares_sdca,
                [clave]: !datos_formulario.pilares_sdca[clave],
              })
            }
          />

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => on_cambiar_abierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Guardar en Matriz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
