/**
 * @fileoverview Botones de cabecera para eliminar diagrama Ishikawa o abrir su vista expandida modal.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Maximize2, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog";
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

interface PropiedadesAccionesEncabezadoIshikawa {
  titulo_modal: string;
  diagrama_nodo: React.ReactNode;
  al_eliminar_ishikawa?: (() => void) | undefined;
}

/**
 * Encapsula la confirmación de borrado y el diálogo de pantalla completa para un diagrama de Ishikawa.
 */
export function IshikawaHeaderActions({
  titulo_modal,
  diagrama_nodo,
  al_eliminar_ishikawa,
}: PropiedadesAccionesEncabezadoIshikawa) {
  const { t: translate } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {al_eliminar_ishikawa && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 px-2.5 text-[11px] font-bold uppercase shadow-sm gap-1"
            >
              <X className="size-3.5" />
              {translate("pdcaPlan.paso16_ishikawa_delete")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar diagrama de Ishikawa?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán permanentemente las causas y
                priorizaciones registradas en este diagrama.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {translate("pdcaPlan.paso16_ishikawa_cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={al_eliminar_ishikawa}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {translate("pdcaPlan.paso17_five_whys_delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2">
            <Maximize2 className="size-3.5" />
            {translate("pdcaPlan.paso16_ishikawa_expand")}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[95vw] w-full p-6">
          <h3 className="text-lg font-bold uppercase mb-4">{titulo_modal}</h3>
          {diagrama_nodo}
        </DialogContent>
      </Dialog>
    </div>
  );
}
