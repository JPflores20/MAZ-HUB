/**
 * @fileoverview Selector e insignias editables para gestionar integrantes del equipo de trabajo PDCA.
 */
import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

interface PropiedadesEquipoInput {
  members?: string[];
  onChange: (miembros_actualizados: string[]) => void;
  disabled?: boolean | undefined;
}

/**
 * Permite agregar o quitar nombres de integrantes mediante campo de texto y etiquetas (chips).
 */
export function TeamMembersInput({
  members = [],
  onChange,
  disabled = false,
}: PropiedadesEquipoInput) {
  const [valor_entrada, set_valor_entrada] = useState("");

  const agregar_integrante = () => {
    if (disabled) return;
    const nombre_limpio = valor_entrada.trim();
    if (nombre_limpio && !members.includes(nombre_limpio)) {
      onChange([...members, nombre_limpio]);
      set_valor_entrada("");
    }
  };

  const manejar_tecla_presionada = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      agregar_integrante();
    }
  };

  const eliminar_integrante = (indice_a_eliminar: number) => {
    if (disabled) return;
    onChange(members.filter((_miembro, indice_actual) => indice_actual !== indice_a_eliminar));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {members.map((nombre_miembro, indice_miembro) => (
          <div
            key={`${nombre_miembro}-${indice_miembro}`}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/20"
          >
            <span>{nombre_miembro}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => eliminar_integrante(indice_miembro)}
                className="ml-1 rounded-full p-0.5 hover:bg-primary/20 hover:text-destructive transition-colors"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input
            id="equipo"
            value={valor_entrada}
            onChange={(evento) => set_valor_entrada(evento.target.value)}
            onKeyDown={manejar_tecla_presionada}
            placeholder="Ej. Ana López (Líder)"
            className="flex-1"
          />
          <Button type="button" variant="secondary" onClick={agregar_integrante}>
            Agregar
          </Button>
        </div>
      )}
    </div>
  );
}
