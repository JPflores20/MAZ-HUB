/**
 * @fileoverview Confirmation modal for deleting a row from Step 9 Root-Cause Validation table.
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

interface RdaValidationDeleteDialogProps {
  description: string | null;
  on_close: () => void;
  on_confirm: () => void;
}

/** Confirms irreversible removal of an individual RDA validation action row. */
export function RdaValidationDeleteDialog({
  description,
  on_close,
  on_confirm,
}: RdaValidationDeleteDialogProps) {
  return (
    <AlertDialog
      open={Boolean(description)}
      onOpenChange={(is_open) => {
        if (!is_open) on_close();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar esta acción?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará la acción de validación{" "}
            <span className="font-semibold text-foreground">&ldquo;{description}&rdquo;</span>. Esta
            operación no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={on_confirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sí, eliminar acción
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
