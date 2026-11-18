/**
 * @fileoverview Sección de comentarios y retroalimentación colaborativa dentro de un proyecto PDCA.
 */
import { useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { PdcaComment } from "@/domain/pdca";
import { useAuth } from "@/features/auth/auth_context";

const PASOS_PDCA_COMENTARIO = [
  "General",
  "Paso 1: Definición del problema",
  "Paso 2: Meta",
  "Paso 3: Análisis y desdoblamiento",
  "Paso 4: Mapeo de Proceso",
  "Paso 5: VPO Checkpoints",
  "Paso 6: Ishikawa",
  "Paso 7: 5 Por Qués",
  "Paso 8.1: Matriz de impacto",
  "Paso 8.2: Plan de acción",
  "Paso 9: Implementación de soluciones",
  "Paso 10: KPI Final",
  "Paso 11: Gemba Final",
];

interface PropiedadesComentariosPdca {
  comments: PdcaComment[];
  onAddComment: (texto_comentario: string, titulo_paso?: string) => void;
  onDeleteComment?: (comentario_id: string) => void;
  disabled?: boolean;
}

/**
 * Muestra la conversación vinculada al proyecto PDCA y permite redactar o eliminar comentarios propios/admin.
 */
export function PdcaComments({
  comments,
  onAddComment,
  onDeleteComment,
  disabled = false,
}: PropiedadesComentariosPdca) {
  const [texto_nuevo, set_texto_nuevo] = useState("");
  const [paso_seleccionado, set_paso_seleccionado] = useState<string>("General");
  const { currentUser: usuario_actual } = useAuth();

  const manejar_agregar_comentario = () => {
    if (disabled || !texto_nuevo.trim()) return;
    onAddComment(
      texto_nuevo.trim(),
      paso_seleccionado === "General" ? undefined : paso_seleccionado,
    );
    set_texto_nuevo("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="size-5 text-primary" />
        <h3 className="font-semibold text-lg">Comentarios y Foro</h3>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 italic">
            No hay comentarios aún. ¡Sé el primero en participar!
          </p>
        ) : (
          comments.map((comentario_item) => {
            const autor_visible =
              comentario_item.userName || comentario_item.user_name || "Usuario";
            const puede_eliminar =
              !disabled &&
              onDeleteComment &&
              (usuario_actual?.role === "admin" ||
                usuario_actual?.email === comentario_item.userId);

            return (
              <div
                key={comentario_item.id}
                className="flex gap-3 bg-secondary/30 p-3 rounded-lg border border-border/50 text-sm"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold shadow-sm">
                  {autor_visible.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{autor_visible}</span>
                      {comentario_item.stepTitle && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 bg-background">
                          {comentario_item.stepTitle}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {comentario_item.timestamp}
                    </span>
                  </div>
                  <p className="mt-1 text-foreground/90 whitespace-pre-wrap">
                    {comentario_item.text}
                  </p>
                </div>
                {puede_eliminar && (
                  <button
                    type="button"
                    onClick={() => onDeleteComment(comentario_item.id)}
                    className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {!disabled && (
        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <div className="flex gap-2">
            <Select value={paso_seleccionado} onValueChange={set_paso_seleccionado}>
              <SelectTrigger className="w-[200px] h-8 text-xs shrink-0">
                <SelectValue placeholder="Selecciona un paso" />
              </SelectTrigger>
              <SelectContent>
                {PASOS_PDCA_COMENTARIO.map((titulo_paso) => (
                  <SelectItem key={titulo_paso} value={titulo_paso} className="text-xs">
                    {titulo_paso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Textarea
              value={texto_nuevo}
              onChange={(evento) => set_texto_nuevo(evento.target.value)}
              placeholder={`Escribe un comentario sobre ${paso_seleccionado === "General" ? "el PDCA en general" : paso_seleccionado}...`}
              className="min-h-[40px] h-[40px] py-2 resize-none"
              onKeyDown={(evento) => {
                if (evento.key === "Enter" && !evento.shiftKey) {
                  evento.preventDefault();
                  manejar_agregar_comentario();
                }
              }}
            />
            <Button
              onClick={manejar_agregar_comentario}
              disabled={!texto_nuevo.trim()}
              className="shrink-0 h-[40px] px-3"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
