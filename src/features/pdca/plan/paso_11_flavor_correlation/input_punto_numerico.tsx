/**
 * @fileoverview Campo numérico controlado con soporte para pegado masivo desde Excel/portapapeles.
 */
import { useEffect, useState } from "react";
import { Input } from "@/shared/ui/input";

interface PropiedadesInputPuntoNumerico {
  valor: number;
  paso?: string | undefined;
  al_cambiar: (nuevo_valor: number) => void;
  al_pegar_texto?: ((texto: string) => boolean) | undefined;
}

/**
 * Permite capturar valores decimales manteniendo estados transitorios (`""` o `"-"`) hasta blur.
 */
export function InputPuntoNumerico({
  valor,
  paso = "any",
  al_cambiar,
  al_pegar_texto,
}: PropiedadesInputPuntoNumerico) {
  const [texto_local, set_texto_local] = useState<string>(() => String(valor ?? 0));
  const [enfocado, set_enfocado] = useState(false);

  useEffect(() => {
    if (!enfocado) {
      set_texto_local(String(valor ?? 0));
    }
  }, [valor, enfocado]);

  return (
    <Input
      type="number"
      step={paso}
      value={enfocado ? texto_local : String(valor ?? 0)}
      onFocus={() => {
        set_enfocado(true);
        set_texto_local(String(valor ?? 0));
      }}
      onPaste={(evento_pegar) => {
        if (!al_pegar_texto) return;
        const texto_pegado = evento_pegar.clipboardData?.getData("text") || "";
        if (texto_pegado.includes("\t") || texto_pegado.includes("\n")) {
          if (al_pegar_texto(texto_pegado)) {
            evento_pegar.preventDefault();
          }
        }
      }}
      onChange={(evento) => {
        const nuevo_texto = evento.target.value;
        set_texto_local(nuevo_texto);
        if (nuevo_texto !== "" && nuevo_texto !== "-" && !Number.isNaN(Number(nuevo_texto))) {
          al_cambiar(Number(nuevo_texto));
        }
      }}
      onBlur={() => {
        set_enfocado(false);
        const numero_final =
          texto_local === "" || texto_local === "-" || Number.isNaN(Number(texto_local))
            ? 0
            : Number(texto_local);
        set_texto_local(String(numero_final));
        if (numero_final !== valor) {
          al_cambiar(numero_final);
        }
      }}
      className="h-6 text-xs px-1"
    />
  );
}
