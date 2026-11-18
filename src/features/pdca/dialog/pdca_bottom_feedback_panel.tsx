/**
 * @fileoverview Panel inferior de Comentarios e Historial compartido debajo de todas las pestañas del PDCA.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { PdcaComments } from "../components/pdca_comments";
import { PdcaHistory } from "../components/pdca_history";
import type { EstadoDialogoPdca } from "../hooks/use_pdca_dialog_state";
import type { ControlAutoguardadoPdca } from "../hooks/use_pdca_autosave";

interface PropiedadesPanelInferior {
  estado_dialogo: EstadoDialogoPdca;
  auto_guardado: ControlAutoguardadoPdca;
  es_editable: boolean;
  usuario_autenticado: { name?: string; email?: string } | null;
}

/**
 * Alterna entre el hilo de comentarios colaborativos y la bitácora histórica del proyecto.
 */
export const PdcaBottomFeedbackPanel: React.FC<PropiedadesPanelInferior> = ({
  estado_dialogo,
  auto_guardado,
  es_editable,
  usuario_autenticado,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          type="button"
          className={`px-3 py-1 text-xs font-semibold rounded-md ${
            estado_dialogo.bottom_tab === "comments"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
          onClick={() => estado_dialogo.set_bottom_tab("comments")}
        >
          {translate("pdcaDialog.comments")}
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-xs font-semibold rounded-md ${
            estado_dialogo.bottom_tab === "history"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          }`}
          onClick={() => estado_dialogo.set_bottom_tab("history")}
        >
          {translate("pdcaDialog.history")}
        </button>
      </div>

      {estado_dialogo.bottom_tab === "comments" ? (
        <PdcaComments
          comments={estado_dialogo.comments_list}
          disabled={!es_editable}
          onAddComment={(texto_comentario, titulo_paso) => {
            if (!es_editable) return;
            const nuevo_comentario = {
              id: crypto.randomUUID(),
              userId: usuario_autenticado?.email || "anonymous",
              userName: usuario_autenticado?.name || "Usuario",
              text: texto_comentario,
              timestamp: new Date().toISOString(),
              stepTitle: titulo_paso,
            };
            estado_dialogo.set_comments_list([...estado_dialogo.comments_list, nuevo_comentario]);
            auto_guardado.mark_as_modified();
          }}
          onDeleteComment={(comentario_id) => {
            if (!es_editable) return;
            estado_dialogo.set_comments_list(
              estado_dialogo.comments_list.filter((comentario) => comentario.id !== comentario_id),
            );
            auto_guardado.mark_as_modified();
          }}
        />
      ) : (
        <PdcaHistory history={estado_dialogo.history_events} />
      )}
    </div>
  );
};
