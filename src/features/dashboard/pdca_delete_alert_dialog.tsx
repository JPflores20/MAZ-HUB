/**
 * @fileoverview Confirmation alert dialog for permanent deletion of a PDCA project.
 */

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

interface PdcaDeleteAlertDialogProps {
  open: boolean;
  on_open_change: (is_open: boolean) => void;
  on_confirm_delete: () => Promise<void>;
}

/** Displays a destructive confirmation modal before removing a PDCA document. */
export function PdcaDeleteAlertDialog({
  open,
  on_open_change,
  on_confirm_delete,
}: PdcaDeleteAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={on_open_change}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar PDCA?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente este PDCA y todos sus
            datos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void on_confirm_delete()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
