/**
 * @fileoverview Lienzo visual de espina de pescado 6M (espinas superiores, espina central y cabeza editable).
 */
import TextareaAutosize from "react-textarea-autosize";
import { CajaCategoriaIshikawa } from "./ishikawa_category_box";

export interface CategoriaIshikawaConfig {
  id: string;
  label: string;
  position: "top" | "bottom";
}

interface PropiedadesLienzoIshikawa {
  categorias: CategoriaIshikawaConfig[];
  causas_registradas: Record<string, string[]>;
  efecto_principal: string;
  al_cambiar_efecto: (nuevo_efecto: string) => void;
  al_agregar_causa: (categoria_id: string, texto_causa: string) => void;
  al_eliminar_causa: (categoria_id: string, indice_causa: number) => void;
  al_editar_causa: (categoria_id: string, indice_causa: number, nuevo_valor: string) => void;
  al_cambiar_etiqueta: (categoria_id: string, nueva_etiqueta: string) => void;
}

/**
 * Dibuja las 6 ramas de causas alrededor del eje central y permite editar directamente la cabeza del diagrama.
 */
export function IshikawaDiagramCanvas({
  categorias,
  causas_registradas,
  efecto_principal,
  al_cambiar_efecto,
  al_agregar_causa,
  al_eliminar_causa,
  al_editar_causa,
  al_cambiar_etiqueta,
}: PropiedadesLienzoIshikawa) {
  const categorias_superiores = categorias.filter((item) => item.position === "top");
  const categorias_inferiores = categorias.filter((item) => item.position === "bottom");

  return (
    <div className="relative pt-4 pb-4 overflow-x-auto">
      <div className="min-w-[820px] relative mt-2">
        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10 items-stretch">
          {categorias_superiores.map((categoria_item) => (
            <div key={categoria_item.id} className="flex flex-col items-center h-full">
              <CajaCategoriaIshikawa
                categoria={categoria_item}
                lista_causas={causas_registradas[categoria_item.id] || []}
                al_agregar_causa={al_agregar_causa}
                al_eliminar_causa={al_eliminar_causa}
                al_editar_causa={al_editar_causa}
                al_cambiar_etiqueta={al_cambiar_etiqueta}
              />
              <div className="w-0.5 flex-1 min-h-[28px] bg-slate-300 dark:bg-border" />
            </div>
          ))}
        </div>

        <div className="relative flex items-center my-0">
          <div className="w-full mr-36 h-1.5 bg-slate-300 dark:bg-border rounded-full relative z-0">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-[8px] border-transparent border-l-slate-300 dark:border-l-border" />
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-widest p-2.5 rounded-xl border border-destructive/30 z-20 w-36 text-center flex flex-col items-center justify-center shadow-sm min-h-[90px]">
            <span className="text-[9px] font-semibold text-destructive/70 uppercase tracking-wider mb-1">
              Efecto / Problema
            </span>
            <TextareaAutosize
              value={efecto_principal}
              onChange={(evento) => al_cambiar_efecto(evento.target.value)}
              placeholder="Escribe el efecto..."
              minRows={2}
              className="w-full text-center bg-transparent border-none text-destructive font-bold text-xs resize-none focus-visible:ring-1 focus-visible:ring-destructive/40 p-0 shadow-none outline-none cursor-text"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10 items-start">
          {categorias_inferiores.map((categoria_item) => (
            <div key={categoria_item.id} className="flex flex-col items-center">
              <div className="w-0.5 h-7 bg-slate-300 dark:bg-border" />
              <CajaCategoriaIshikawa
                categoria={categoria_item}
                lista_causas={causas_registradas[categoria_item.id] || []}
                al_agregar_causa={al_agregar_causa}
                al_eliminar_causa={al_eliminar_causa}
                al_editar_causa={al_editar_causa}
                al_cambiar_etiqueta={al_cambiar_etiqueta}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
