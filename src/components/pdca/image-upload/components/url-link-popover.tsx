import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PropiedadesPopoverEnlace {
  /** Callback al confirmar un enlace (URL pegada) */
  alConfirmarEnlace: (url: string) => void;
  /** Deshabilitar el botón */
  deshabilitado?: boolean;
  /** Variante de tamaño: 'sm' para tarjeta vacía, 'xs' para celda pequeña */
  tamano?: "sm" | "xs";
}

/**
 * Popover con campo de texto para pegar un enlace URL como evidencia.
 * Usado tanto en ImageUploadSection como en MultiImageUploadSection.
 */
export const PopoverPegarEnlace: React.FC<PropiedadesPopoverEnlace> = ({
  alConfirmarEnlace,
  deshabilitado = false,
  tamano = "sm",
}) => {
  const refInput = useRef<HTMLInputElement>(null);

  const confirmar = () => {
    const valorUrl = refInput.current?.value?.trim();
    if (valorUrl) {
      alConfirmarEnlace(valorUrl);
      if (refInput.current) refInput.current.value = "";
    }
  };

  const manejarTeclado = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") confirmar();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={tamano}
          className={`gap-2 ${tamano === "xs" ? "h-6 text-[10px] bg-background/50 hover:bg-background" : "bg-background shadow-sm"}`}
          disabled={deshabilitado}
          onClick={(e) => e.stopPropagation()}
        >
          <LinkIcon className={tamano === "xs" ? "size-3" : "size-4"} />
          {tamano === "xs" ? "URL" : "Subir enlace"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <h4 className="font-medium text-sm">Pegar enlace</h4>
          <p className="text-xs text-muted-foreground">
            Pega la URL de la imagen o archivo que quieres adjuntar
          </p>
          <div className="flex gap-2 mt-1">
            <Input
              ref={refInput}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="h-8 text-sm flex-1"
              onKeyDown={manejarTeclado}
            />
            <Button size="sm" className="h-8 shrink-0" onClick={confirmar}>
              Aceptar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
