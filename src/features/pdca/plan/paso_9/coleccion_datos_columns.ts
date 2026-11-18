/**
 * @fileoverview Definición declarativa de grupos y columnas de la tabla del Paso 9 (Colección de Datos).
 */
import type { ColeccionDatosItem } from "@/domain/pdca";

export interface DefinicionGrupoColeccion {
  clave_titulo: string;
  col_span: number;
}

export interface DefinicionColumnaColeccion {
  campo: keyof ColeccionDatosItem;
  clave_titulo: string;
  ejemplo: string;
  ancho_minimo: string;
}

export const GRUPOS_COLECCION_DATOS: DefinicionGrupoColeccion[] = [
  { clave_titulo: "pdcaPlan.dynamic.quMedir", col_span: 4 },
  { clave_titulo: "pdcaPlan.dynamic.cMoMedirlo", col_span: 3 },
  { clave_titulo: "pdcaPlan.dynamic.planDeMuestreo", col_span: 4 },
];

export const COLUMNAS_COLECCION_DATOS: DefinicionColumnaColeccion[] = [
  { campo: "xs_ys", clave_titulo: "pdcaPlan.dynamic.xSOYS", ejemplo: "X1, Y1...", ancho_minimo: "min-w-[70px]" },
  { campo: "variable", clave_titulo: "pdcaPlan.dynamic.variable", ejemplo: "Ej. Smokey", ancho_minimo: "min-w-[100px]" },
  { campo: "tipo_dato", clave_titulo: "pdcaPlan.dynamic.tipoDeDato", ejemplo: "Ej. Dato continuo", ancho_minimo: "min-w-[90px]" },
  { campo: "definicion_operacional", clave_titulo: "pdcaPlan.dynamic.definiciNOperacional", ejemplo: "Ej. Recepción de Arroz", ancho_minimo: "min-w-[150px]" },
  { campo: "metodo_medicion", clave_titulo: "pdcaPlan.dynamic.mTodoDeMediciN", ejemplo: "Ej. Catado Ok-Nook", ancho_minimo: "min-w-[150px]" },
  { campo: "estratificacion", clave_titulo: "pdcaPlan.dynamic.estratificaciN", ejemplo: "Ej. Medición de cada lote...", ancho_minimo: "min-w-[150px]" },
  { campo: "metodo_recoleccion", clave_titulo: "pdcaPlan.dynamic.mTodoDeRecolecciN", ejemplo: "Ej. Sensory One", ancho_minimo: "min-w-[150px]" },
  { campo: "quien", clave_titulo: "pdcaPlan.dynamic.quiN", ejemplo: "Ej. Operador", ancho_minimo: "min-w-[90px]" },
  { campo: "tipo_muestreo", clave_titulo: "pdcaPlan.dynamic.tipoDeMuestreo", ejemplo: "Ej. Proceso", ancho_minimo: "min-w-[90px]" },
  { campo: "cuantos", clave_titulo: "pdcaPlan.dynamic.cuNtos", ejemplo: "Ej. 6 Meses", ancho_minimo: "min-w-[70px]" },
  { campo: "cada_cuando", clave_titulo: "pdcaPlan.dynamic.cadaCuNdo", ejemplo: "Ej. Diario", ancho_minimo: "min-w-[90px]" },
];
