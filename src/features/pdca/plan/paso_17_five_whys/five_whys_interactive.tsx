/**
 * @fileoverview Editor interactivo de una tabla de 5 Porqués con expansión modal y subida de evidencias.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { cn } from "@/shared/utils/class_names";
import { subir_evidencia_five_whys } from "./five_whys_firebase";
import { BarraHerramientasTabla } from "./five_whys_toolbar";
import { TablaCuerpo } from "./five_whys_table_body";
import type { FilaCincoPorques, PropiedadesFiveWhysInteractivo } from "./five_whys_types";

/**
 * Administra columnas dinámicas (5+ porqués), edición de celdas y modal de pantalla completa.
 */
export function FiveWhysInteractive({
  value,
  onChange,
  title,
  onTitleChange,
  index,
  onRemoveTable,
}: PropiedadesFiveWhysInteractivo) {
  const [es_pantalla_completa, set_es_pantalla_completa] = useState(false);
  const [filas_subiendo, set_filas_subiendo] = useState<Set<number>>(new Set());

  // Firebase a veces deserializa arreglos como mapas con claves numéricas
  const filas_normalizadas: FilaCincoPorques[] = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value)
      : [];

  const actualizar_fila = (fila_id: number, campo: string, valor: string) => {
    if (!onChange) return;
    onChange(
      filas_normalizadas.map((fila_actual) =>
        fila_actual.id === fila_id ? { ...fila_actual, [campo]: valor } : fila_actual,
      ),
    );
  };

  const agregar_fila = () => {
    if (!onChange) return;
    onChange([
      ...filas_normalizadas,
      {
        id: Date.now(),
        q1: "",
        q2: "",
        q3: "",
        q4: "",
        q5: "",
        w1: "",
        w2: "",
        w3: "",
        w4: "",
        w5: "",
        accion: "",
      },
    ]);
  };

  const eliminar_fila = (fila_id: number) => {
    if (!onChange || filas_normalizadas.length === 1) return;
    onChange(filas_normalizadas.filter((fila_actual) => fila_actual.id !== fila_id));
  };

  const cantidad_porques = Math.max(
    5,
    ...filas_normalizadas.flatMap((fila_actual) =>
      Object.keys(fila_actual)
        .filter((clave) => clave.startsWith("q"))
        .map((clave) => parseInt(clave.substring(1), 10))
        .filter((numero) => !Number.isNaN(numero)),
    ),
  );

  const agregar_columna_porque = () => {
    if (!onChange) return;
    const siguiente_porque = cantidad_porques + 1;
    onChange(
      filas_normalizadas.map((fila_actual) => ({
        ...fila_actual,
        [`q${siguiente_porque}`]: "",
        [`w${siguiente_porque}`]: "",
      })),
    );
  };

  const quitar_columna_porque = () => {
    if (!onChange || cantidad_porques <= 5) return;
    onChange(
      filas_normalizadas.map((fila_actual) => {
        const copia_fila = { ...fila_actual };
        delete copia_fila[`q${cantidad_porques}`];
        delete copia_fila[`w${cantidad_porques}`];
        return copia_fila;
      }),
    );
  };

  const manejar_subida_evidencia = async (fila_id: number, archivo: File) => {
    try {
      set_filas_subiendo((previas) => new Set(previas).add(fila_id));
      const url_descarga = await subir_evidencia_five_whys(archivo);
      actualizar_fila(fila_id, "evidencia", url_descarga);
    } catch (error_subida) {
      console.error("Error subiendo evidencia:", error_subida);
    } finally {
      set_filas_subiendo((previas) => {
        const siguientes = new Set(previas);
        siguientes.delete(fila_id);
        return siguientes;
      });
    }
  };

  const contenido_tabla = (
    <div
      className={cn(
        "overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background shadow-sm flex-1",
        es_pantalla_completa && "flex flex-col h-full",
      )}
    >
      <BarraHerramientasTabla
        titulo={title}
        al_cambiar_titulo={onTitleChange}
        indice={index}
        es_pantalla_completa={es_pantalla_completa}
        al_expandir={() => set_es_pantalla_completa(true)}
        cantidad_porques={cantidad_porques}
        al_agregar_porque={agregar_columna_porque}
        al_quitar_porque={quitar_columna_porque}
        al_agregar_causa={agregar_fila}
        al_eliminar_tabla={onRemoveTable}
      />
      <TablaCuerpo
        filas_normalizadas={filas_normalizadas}
        cantidad_porques={cantidad_porques}
        filas_subiendo={filas_subiendo}
        al_actualizar_fila={actualizar_fila}
        al_eliminar_fila={eliminar_fila}
        al_subir_evidencia={manejar_subida_evidencia}
      />
    </div>
  );

  return (
    <>
      {!es_pantalla_completa && contenido_tabla}
      <Dialog open={es_pantalla_completa} onOpenChange={set_es_pantalla_completa}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-2 sm:p-6 flex flex-col gap-2 overflow-hidden bg-muted/20">
          <DialogHeader className="sr-only">
            <DialogTitle>{title || "5 WHYS"}</DialogTitle>
          </DialogHeader>
          {contenido_tabla}
        </DialogContent>
      </Dialog>
    </>
  );
}
