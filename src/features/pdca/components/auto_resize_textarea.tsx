/**
 * @fileoverview Área de texto autoajustable en altura al contenido escrito dentro de celdas y tablas PDCA.
 */
import React, { useRef, useEffect } from "react";
import { cn } from "@/shared/utils/class_names";

interface PropiedadesTextareaAutoajuste {
  value: string;
  onChange: (nuevo_texto: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Renderiza un elemento textarea cuya altura crece o encoge dinámicamente con el contenido.
 */
export function AutoResizeTextarea({
  value,
  onChange,
  className,
  placeholder,
}: PropiedadesTextareaAutoajuste) {
  const referencia_textarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (referencia_textarea.current) {
      referencia_textarea.current.style.height = "auto";
      referencia_textarea.current.style.height = `${referencia_textarea.current.scrollHeight}px`;
    }
  }, [value]);

  const manejar_entrada_texto = (evento: React.ChangeEvent<HTMLTextAreaElement>) => {
    evento.target.style.height = "auto";
    evento.target.style.height = `${evento.target.scrollHeight}px`;
    onChange(evento.target.value);
  };

  return (
    <textarea
      ref={referencia_textarea}
      value={value}
      onChange={manejar_entrada_texto}
      placeholder={placeholder}
      rows={1}
      className={cn(
        "w-full resize-none overflow-hidden bg-transparent text-justify focus:outline-none focus-visible:ring-1",
        className,
      )}
      style={{ minHeight: "32px", height: "auto" }}
    />
  );
}
