/**
 * flavor-correlation-editor.tsx
 * Editor tabular de pares de datos (X, Y) para el análisis de correlación.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, ClipboardPaste } from "lucide-react";
import { toast } from "sonner";
import {
  parsearPuntosDesdeTexto,
  type SerieCorrelacion,
  type PuntoCorrelacion,
} from "./flavor-correlation-utils";

interface PropiedadesEditorSerie {
  serie: SerieCorrelacion;
  alActualizarNombre: (idSerie: string, nuevoNombre: string) => void;
  alAgregarPunto: (idSerie: string) => void;
  alEliminarSerie: (idSerie: string) => void;
  alActualizarPunto: (
    idSerie: string,
    indicePunto: number,
    eje: "x" | "y",
    nuevoValor: number,
  ) => void;
  alEliminarPunto: (idSerie: string, indicePunto: number) => void;
  alImportarPuntos?:
    | ((idSerie: string, nuevosPuntos: PuntoCorrelacion[], reemplazar?: boolean) => void)
    | undefined;
}

export function InputPuntoNumerico({
  valor,
  paso = "any",
  alCambiar,
  alPegarTexto,
}: {
  valor: number;
  paso?: string | undefined;
  alCambiar: (nuevoValor: number) => void;
  alPegarTexto?: ((texto: string) => boolean) | undefined;
}) {
  const [textoLocal, setTextoLocal] = React.useState<string>(() => String(valor ?? 0));
  const [enfocado, setEnfocado] = React.useState(false);

  React.useEffect(() => {
    if (!enfocado) {
      setTextoLocal(String(valor ?? 0));
    }
  }, [valor, enfocado]);

  return (
    <Input
      type="number"
      step={paso}
      value={enfocado ? textoLocal : String(valor ?? 0)}
      onFocus={() => {
        setEnfocado(true);
        setTextoLocal(String(valor ?? 0));
      }}
      onPaste={(eventoPaste) => {
        if (!alPegarTexto) return;
        const textoPegado = eventoPaste.clipboardData?.getData("text") || "";
        if (textoPegado.includes("\t") || textoPegado.includes("\n")) {
          if (alPegarTexto(textoPegado)) {
            eventoPaste.preventDefault();
          }
        }
      }}
      onChange={(eventoInput) => {
        const nuevoTexto = eventoInput.target.value;
        setTextoLocal(nuevoTexto);
        if (nuevoTexto !== "" && nuevoTexto !== "-" && !Number.isNaN(Number(nuevoTexto))) {
          alCambiar(Number(nuevoTexto));
        }
      }}
      onBlur={() => {
        setEnfocado(false);
        const numeroFinal =
          textoLocal === "" || textoLocal === "-" || Number.isNaN(Number(textoLocal))
            ? 0
            : Number(textoLocal);
        setTextoLocal(String(numeroFinal));
        if (numeroFinal !== valor) {
          alCambiar(numeroFinal);
        }
      }}
      className="h-6 text-xs px-1"
    />
  );
}

export function EditorSerieCorrelacion({
  serie,
  alActualizarNombre,
  alAgregarPunto,
  alEliminarSerie,
  alActualizarPunto,
  alEliminarPunto,
  alImportarPuntos,
}: PropiedadesEditorSerie) {
  const { t } = useTranslation();
  const [mostrarPegadoExcel, setMostrarPegadoExcel] = React.useState(false);
  const [textoExcel, setTextoExcel] = React.useState("");

  const puntosArreglo = (
    Array.isArray(serie.points) ? serie.points : Object.values(serie.points || {})
  ) as PuntoCorrelacion[];

  const procesarTextoPegado = (texto: string, reemplazar = false): boolean => {
    const puntosExtraidos = parsearPuntosDesdeTexto(texto);
    if (puntosExtraidos.length === 0) {
      toast.error("No se detectaron pares numéricos (X, Y) válidos.");
      return false;
    }
    alImportarPuntos?.(serie.id, puntosExtraidos, reemplazar);
    toast.success(`Se importaron ${puntosExtraidos.length} puntos a "${serie.name}".`);
    setTextoExcel("");
    setMostrarPegadoExcel(false);
    return true;
  };

  return (
    <div className="border rounded p-3 space-y-3 bg-card">
      <div className="flex justify-between items-center gap-1.5">
        <Input
          value={serie.name}
          onChange={(eventoInput) => alActualizarNombre(serie.id, eventoInput.target.value)}
          className="h-7 text-sm font-bold w-full"
          placeholder={t("pdcaPlan.paso11_flavor_editor_series_name")}
        />
        {alImportarPuntos && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMostrarPegadoExcel((prev) => !prev)}
            className="h-7 text-xs px-2 shrink-0"
            title="Pegar columnas X e Y desde Excel"
          >
            <ClipboardPaste className="size-3 mr-1" />
            Excel
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => alAgregarPunto(serie.id)}
          className="h-7 text-xs px-2 shrink-0"
        >
          <Plus className="size-3 mr-1" />{t("pdcaPlan.paso11_flavor_editor_point")}</Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => alEliminarSerie(serie.id)}
          className="h-7 w-7 text-destructive shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>

      {mostrarPegadoExcel && alImportarPuntos && (
        <div className="rounded-md border bg-muted/30 p-2 space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Copia dos columnas <strong>(X, Y)</strong> desde Excel y pégalas aquí (una fila por punto):
          </p>
          <textarea
            value={textoExcel}
            onChange={(e) => setTextoExcel(e.target.value)}
            placeholder={"30\t6.3\n45\t7.1\n70\t7.8"}
            rows={3}
            className="w-full rounded border bg-background p-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() => setMostrarPegadoExcel(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() => procesarTextoPegado(textoExcel, false)}
            >
              Agregar a existentes
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-6 text-[11px] px-2"
              onClick={() => procesarTextoPegado(textoExcel, true)}
            >
              Reemplazar puntos
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {puntosArreglo.map((puntoItem: PuntoCorrelacion, indicePunto: number) => (
          <div
            key={puntoItem.id ?? indicePunto}
            className="flex items-center gap-1 bg-secondary/30 p-1 rounded border"
          >
            <span className="text-[10px] font-bold w-3 text-center">X</span>
            <InputPuntoNumerico
              valor={puntoItem.x}
              paso="any"
              alPegarTexto={
                alImportarPuntos ? (texto) => procesarTextoPegado(texto, false) : undefined
              }
              alCambiar={(nuevoValor) =>
                alActualizarPunto(serie.id, indicePunto, "x", nuevoValor)
              }
            />
            <span className="text-[10px] font-bold w-3 text-center ml-1">Y</span>
            <InputPuntoNumerico
              valor={puntoItem.y}
              paso="0.1"
              alPegarTexto={
                alImportarPuntos ? (texto) => procesarTextoPegado(texto, false) : undefined
              }
              alCambiar={(nuevoValor) =>
                alActualizarPunto(serie.id, indicePunto, "y", nuevoValor)
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => alEliminarPunto(serie.id, indicePunto)}
              className="h-6 w-6 text-destructive shrink-0"
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
        {puntosArreglo.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-2">{t("pdcaPlan.paso11_flavor_editor_no_points")}</p>
        )}
      </div>
    </div>
  );
}

