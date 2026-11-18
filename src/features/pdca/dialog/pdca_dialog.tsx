/**
 * @fileoverview Envoltorio raíz del diálogo PDCA encargado de restaurar borradores locales e hidratar su clave de montaje.
 */
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/auth_context";
import type { Pdca } from "@/domain/pdca";
import { resolver_pdca_efectivo } from "./pdca_dialog_helpers";
import { PdcaDialogContent } from "./pdca_dialog_content";

/**
 * Renderiza el editor modal/inline de un PDCA cuando `open` es verdadero.
 */
export const PdcaDialog: React.FC<{
  pdca: Pdca | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ pdca, open, onOpenChange }) => {
  const { currentUser: usuario_autenticado } = useAuth();
  const [pdca_restaurado, set_pdca_restaurado] = useState<Pdca | null>(null);
  const [version_restauracion, set_version_restauracion] = useState(0);

  useEffect(() => {
    set_pdca_restaurado(null);
  }, [pdca?.id]);

  const pdca_efectivo = useMemo(
    () => resolver_pdca_efectivo(pdca, pdca_restaurado, usuario_autenticado),
    [pdca, pdca_restaurado, usuario_autenticado],
  );

  if (!open) return null;

  return (
    <PdcaDialogContent
      key={`${pdca_efectivo.id}-${version_restauracion}`}
      current_pdca={pdca_efectivo}
      is_new_draft={!pdca}
      onOpenChange={onOpenChange}
      on_restore_draft={(payload_borrador) => {
        set_pdca_restaurado(payload_borrador);
        set_version_restauracion((version) => version + 1);
      }}
    />
  );
};
