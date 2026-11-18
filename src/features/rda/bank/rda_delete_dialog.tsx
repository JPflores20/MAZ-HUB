/**
 * @fileoverview Destructive confirmation modal for deleting an RDA report.
 */

import { useTranslation } from "react-i18next";
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

interface RdaDeleteDialogProps {
  open: boolean;
  on_open_change: (is_open: boolean) => void;
  on_confirm_delete: () => Promise<void>;
}

/** Displays confirmation prompt before deleting an RDA document from Firestore. */
export function RdaDeleteDialog({
  open,
  on_open_change,
  on_confirm_delete,
}: RdaDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={on_open_change}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteRdaTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("deleteRdaDesc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void on_confirm_delete()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
