import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { subirArchivoAFirebase } from "./five-whys-firebase";
import { BarraHerramientasTabla } from "./components/five-whys-toolbar";
import { TablaCuerpo } from "./components/five-whys-table-body";

interface PropiedadesFiveWhysInteractivo {
  value?: any[];
  onChange?: (filas: any[]) => void;
  title?: string;
  onTitleChange?: (titulo: string) => void;
  index: number;
  onRemoveTable?: (() => void) | undefined;
}

export function FiveWhysInteractive({
  value,
  onChange,
  title,
  onTitleChange,
  index,
  onRemoveTable,
}: PropiedadesFiveWhysInteractivo) {
  const { t } = useTranslation();

  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);
  const [filasSubiendo, setFilasSubiendo] = useState<Set<number>>(new Set());

  // Firebase a veces guarda arrays como objetos con claves numéricas
  const filasNormalizadas: any[] = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value)
      : [];

  const actualizarFila = (id: number, campo: string, valor: string) => {
    if (!onChange) return;
    onChange(
      filasNormalizadas.map((fila: any) => (fila.id === id ? { ...fila, [campo]: valor } : fila)),
    );
  };

  const agregarFila = () => {
    if (onChange) {
      onChange([
        ...filasNormalizadas,
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
    }
  };

  const eliminarFila = (id: number) => {
    if (onChange) {
      if (filasNormalizadas.length === 1) return;
      onChange(filasNormalizadas.filter((fila: any) => fila.id !== id));
    }
  };

  const cantidadPorques = Math.max(
    5,
    ...filasNormalizadas.flatMap((fila: any) =>
      Object.keys(fila)
        .filter((k) => k.startsWith("q"))
        .map((k) => parseInt(k.substring(1)))
        .filter((n) => !isNaN(n)),
    ),
  );

  const agregarColumnaPorque = () => {
    if (onChange) {
      const siguientePorque = cantidadPorques + 1;
      onChange(
        filasNormalizadas.map((fila: any) => ({
          ...fila,
          [`q${siguientePorque}`]: "",
          [`w${siguientePorque}`]: "",
        })),
      );
    }
  };

  const quitarColumnaPorque = () => {
    if (onChange && cantidadPorques > 5) {
      onChange(
        filasNormalizadas.map((fila: any) => {
          const nuevaFila = { ...fila };
          delete nuevaFila[`q${cantidadPorques}`];
          delete nuevaFila[`w${cantidadPorques}`];
          return nuevaFila;
        }),
      );
    }
  };

  const contenidoTabla = (
    <div
      className={cn(
        "overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background shadow-sm flex-1",
        esPantallaCompleta ? "flex flex-col h-full" : "",
      )}
    >
      <BarraHerramientasTabla
        titulo={title}
        alCambiarTitulo={onTitleChange}
        indice={index}
        esPantallaCompleta={esPantallaCompleta}
        alExpandir={() => setEsPantallaCompleta(true)}
        cantidadPorques={cantidadPorques}
        alAgregarPorque={agregarColumnaPorque}
        alQuitarPorque={quitarColumnaPorque}
        alAgregarCausa={agregarFila}
        alEliminarTabla={onRemoveTable}
      />
      <TablaCuerpo
        filasNormalizadas={filasNormalizadas}
        cantidadPorques={cantidadPorques}
        filasSubiendo={filasSubiendo}
        alActualizarFila={actualizarFila}
        alEliminarFila={eliminarFila}
        alSubirEvidencia={async (idFila, archivo) => {
          try {
            setFilasSubiendo((prev) => new Set(prev).add(idFila));
            const url = await subirArchivoAFirebase(archivo);
            actualizarFila(idFila, "evidencia", url);
          } catch (error) {
            console.error("Error subiendo evidencia:", error);
          } finally {
            setFilasSubiendo((prev) => {
              const siguiente = new Set(prev);
              siguiente.delete(idFila);
              return siguiente;
            });
          }
        }}
      />
    </div>
  );

  return (
    <>
      {!esPantallaCompleta && contenidoTabla}
      <Dialog open={esPantallaCompleta} onOpenChange={setEsPantallaCompleta}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-2 sm:p-6 flex flex-col gap-2 overflow-hidden bg-muted/20">
          <DialogHeader className="sr-only">
            <DialogTitle>{title || "5 WHYS"}</DialogTitle>
          </DialogHeader>
          {contenidoTabla}
        </DialogContent>
      </Dialog>
    </>
  );
}
