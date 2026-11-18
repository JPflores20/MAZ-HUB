/**
 * @fileoverview Popover validado para adjuntar URLs externas seguras (http/https) como evidencia PDCA.
 */
import React, { useRef } from "react";
import { LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { sanitize_external_url } from "@/core/security";

interface PropiedadesPopoverEnlace {
  al_confirmar_enlace: (url_segura: string) => void;
  deshabilitado?: boolean;
  tamano?: "sm" | "xs";
}

/**
 * Permite pegar un enlace externo y lo sanitiza antes de propagarlo al estado del componente padre.
 */
export const PopoverPegarEnlace: React.FC<PropiedadesPopoverEnlace> = ({
  al_confirmar_enlace,
  deshabilitado = false,
  tamano = "sm",
}) => {
  const referencia_input = useRef<HTMLInputElement>(null);

  const confirmar_enlace = () => {
    const valor_url = referencia_input.current?.value?.trim();
    if (!valor_url) return;
    const url_sanitizada = sanitize_external_url(valor_url);
    if (!url_sanitizada) {
      toast.error("Enlace no permitido. Usa una URL válida con https:// o http://.");
      return;
    }
    al_confirmar_enlace(url_sanitizada);
    if (referencia_input.current) referencia_input.current.value = "";
  };

  const manejar_teclado = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "Enter") confirmar_enlace();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${tamano === "xs" ? "h-6 text-[10px] bg-background/50 hover:bg-background" : "bg-background shadow-sm"}`}
          disabled={deshabilitado}
          onClick={(evento) => evento.stopPropagation()}
        >
          <LinkIcon className={tamano === "xs" ? "size-3" : "size-4"} />
          {tamano === "xs" ? "URL" : "Subir enlace"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" onClick={(evento) => evento.stopPropagation()}>
        <div className="flex flex-col gap-2">
          <h4 className="font-medium text-sm">Pegar enlace</h4>
          <p className="text-xs text-muted-foreground">
            Pega la URL de la imagen o archivo que quieres adjuntar
          </p>
          <div className="flex gap-2 mt-1">
            <Input
              ref={referencia_input}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="h-8 text-sm flex-1"
              onKeyDown={manejar_teclado}
            />
            <Button size="sm" className="h-8 shrink-0" onClick={confirmar_enlace}>
              Aceptar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
