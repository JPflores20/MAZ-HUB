/**
 * @fileoverview Diálogo de confirmación antes de eliminar permanentemente una acción del Plan.
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

interface PropiedadesDialogoEliminarAccion {
  descripcion_accion: string | null;
  al_cerrar: () => void;
  al_confirmar: () => void;
}

/**
 * Solicita confirmación explícita al usuario para prevenir borrado accidental de acciones del plan.
 */
export function ActionPlanDeleteDialog({
  descripcion_accion,
  al_cerrar,
  al_confirmar,
}: PropiedadesDialogoEliminarAccion) {
  return (
    <AlertDialog
      open={Boolean(descripcion_accion)}
      onOpenChange={(abierto) => {
        if (!abierto) al_cerrar();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro de eliminar esta acción?</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará del plan la acción{" "}
            <span className="font-semibold text-foreground">&ldquo;{descripcion_accion}&rdquo;</span>
            . Esta operación no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={al_confirmar}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Sí, eliminar acción
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
