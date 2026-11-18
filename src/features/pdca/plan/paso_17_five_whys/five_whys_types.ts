/**
 * @fileoverview Tipos TypeScript compartidos por las tablas, barra de herramientas y evidencias de 5 Porqués.
 */

export type FilaCincoPorques = {
  id: number;
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  w1?: string;
  w2?: string;
  w3?: string;
  w4?: string;
  w5?: string;
  isRootCause?: string;
  accion?: string;
  evidencia?: string;
  [clave_dinamica: string]: unknown;
};

export interface PropiedadesFiveWhysInteractivo {
  value?: FilaCincoPorques[] | Record<string, FilaCincoPorques> | undefined;
  onChange?: ((filas: FilaCincoPorques[]) => void) | undefined;
  title?: string | undefined;
  onTitleChange?: ((titulo: string) => void) | undefined;
  index: number;
  onRemoveTable?: (() => void) | undefined;
}

export interface PropiedadesBarraHerramientas {
  titulo?: string | undefined;
  al_cambiar_titulo?: ((nuevo_titulo: string) => void) | undefined;
  indice: number;
  es_pantalla_completa: boolean;
  al_expandir: () => void;
  cantidad_porques: number;
  al_agregar_porque: () => void;
  al_quitar_porque: () => void;
  al_agregar_causa: () => void;
  al_eliminar_tabla?: (() => void) | undefined;
}

export interface PropiedadesTablaCuerpo {
  filas_normalizadas: FilaCincoPorques[];
  cantidad_porques: number;
  filas_subiendo: Set<number>;
  al_actualizar_fila: (fila_id: number, campo: string, valor: string) => void;
  al_eliminar_fila: (fila_id: number) => void;
  al_subir_evidencia: (fila_id: number, archivo: File) => Promise<void>;
}

export interface PropiedadesSeccionEvidencias {
  filas_normalizadas: FilaCincoPorques[];
  filas_subiendo: Set<number>;
  al_actualizar_fila: (fila_id: number, campo: string, valor: string) => void;
  al_subir_evidencia: (fila_id: number, archivo: File) => Promise<void>;
}
