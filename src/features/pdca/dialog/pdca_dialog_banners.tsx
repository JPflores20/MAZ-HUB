/**
 * @fileoverview Banners de estado (solo lectura, recuperación de borrador local) y alerta de salida del editor PDCA.
 */
import React from "react";
import type { Pdca } from "@/domain/pdca";
import { Button } from "@/shared/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert_dialog";

interface PropiedadesBannersDialogo {
  is_editable: boolean;
  local_draft: { savedAt: string; payload: Pdca } | null;
  on_discard_draft: () => void;
  on_restore_and_sync: () => Promise<boolean>;
  on_draft_restored: (payload: Pdca) => void;
}

/**
 * Muestra alertas contextuales superiores cuando el PDCA es solo lectura o existe borrador local sin sincronizar.
 */
export const PdcaDialogStatusBanners: React.FC<PropiedadesBannersDialogo> = ({
  is_editable,
  local_draft,
  on_discard_draft,
  on_restore_and_sync,
  on_draft_restored,
}) => (
  <>
    {!is_editable && (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-medium text-amber-800 dark:text-amber-300">
        Modo solo lectura: no cuentas con permisos de edición sobre este proyecto PDCA.
      </div>
    )}
    {is_editable && local_draft && (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
        <div>
          <span className="font-bold">Respaldo local detectado:</span> Se encontró un borrador
          guardado automáticamente en tu navegador que no se había sincronizado con la base de
          datos.
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={on_discard_draft}>
            Descartar borrador
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            onClick={async () => {
              const payload_recuperado = local_draft?.payload;
              const sincronizado = await on_restore_and_sync();
              if (sincronizado && payload_recuperado) on_draft_restored(payload_recuperado);
            }}
          >
            Sincronizar borrador con BD
          </Button>
        </div>
      </div>
    )}
  </>
);

/**
 * Diálogo de confirmación para evitar perder cambios sin guardar en Firestore al cerrar el editor.
 */
export const PdcaCloseConfirmDialog: React.FC<{
  open: boolean;
  on_open_change: (abierto: boolean) => void;
  on_exit_without_sync: () => void;
  on_save_and_exit: () => Promise<void>;
}> = ({ open, on_open_change, on_exit_without_sync, on_save_and_exit }) => (
  <AlertDialog open={open} onOpenChange={on_open_change}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Tienes cambios sin sincronizar en la base de datos</AlertDialogTitle>
        <AlertDialogDescription>
          Tus cambios ya están respaldados localmente en este navegador (sin consumir lecturas ni
          escrituras de Firestore). ¿Deseas sincronizarlos en la base de datos antes de salir?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Seguir editando</AlertDialogCancel>
        <Button type="button" variant="outline" onClick={on_exit_without_sync}>
          Salir sin sincronizar
        </Button>
        <AlertDialogAction
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => void on_save_and_exit()}
        >
          Guardar y Salir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
