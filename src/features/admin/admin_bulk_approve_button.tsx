/**
 * @fileoverview Confirmed bulk action button to approve and email-verify pending corporate accounts without sending mail.
 */

import { Loader2, ShieldCheck } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert_dialog";
import { Button } from "@/shared/ui/button";

interface AdminBulkApproveButtonProps {
  pending_corporate_count: number;
  is_bulk_approving: boolean;
  on_bulk_approve: () => Promise<void>;
}

/** Renders a confirmation dialog trigger that approves and verifies pending corporate accounts in one step. */
export function AdminBulkApproveButton({
  pending_corporate_count,
  is_bulk_approving,
  on_bulk_approve,
}: AdminBulkApproveButtonProps) {
  if (pending_corporate_count === 0) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          disabled={is_bulk_approving}
          className="h-7 gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          {is_bulk_approving ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="size-3.5" />
          )}
          Aprobar corporativos ({pending_corporate_count})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Aprobar {pending_corporate_count} cuenta(s) corporativa(s)?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Se aprobarán directamente y se marcarán como correo verificado en Firebase Authentication
            y Firestore todas las cuentas pendientes con dominio{" "}
            <strong className="text-foreground">@ab-inbev.com</strong> o{" "}
            <strong className="text-foreground">@gmodelo.com.mx</strong>, sin enviar correos de
            verificación. Los dominios externos seguirán bloqueados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void on_bulk_approve()}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Aprobar sin correo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
