/**
 * @fileoverview Post-registration instructions screen prompting corporate email verification and admin approval.
 */

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface AuthRegistrationSuccessProps {
  registered_email: string;
  verification_sent_ok: boolean;
  verification_notice: string | null;
  on_back_to_login: () => void;
}

/**
 * Displays verification instructions and optional delivery warnings after new account creation.
 */
export function AuthRegistrationSuccess({
  registered_email,
  verification_sent_ok,
  verification_notice,
  on_back_to_login,
}: AuthRegistrationSuccessProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-green-500/20 bg-green-50 dark:bg-green-900/20/50 p-8 text-center shadow-lg dark:bg-green-950/20">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
          <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mb-2 font-display text-2xl font-bold text-green-700 dark:text-green-300">
          ¡Casi listo! Verifica tu correo
        </h1>
        <p className="mb-4 text-sm text-green-700/90 dark:text-green-300/90">
          {verification_sent_ok ? (
            <>
              Hemos enviado un enlace de verificación a <strong>{registered_email}</strong>.
            </>
          ) : (
            <>
              Tu cuenta para <strong>{registered_email}</strong> fue creada, pero falta confirmar el
              enlace de verificación.
            </>
          )}
        </p>
        <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-left text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            PASOS OBLIGATORIOS PARA ACTIVAR TU ACCESO:
          </p>
          <p>
            1) Abre el correo enviado y haz clic en el <strong>enlace de verificación</strong>{" "}
            (revisa también <strong>Spam o Correo no deseado</strong>).
          </p>
          <p>
            2) Una vez verificado tu correo, un administrador deberá aprobar tu cuenta antes de
            ingresar. Si necesitas reenviar el enlace, usa la opción en{" "}
            <strong>Iniciar Sesión</strong>.
          </p>
        </div>

        {verification_notice && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/15 p-2.5 text-xs font-medium text-destructive">
            {verification_notice}
          </div>
        )}

        <div className="space-y-2.5">
          <Button
            onClick={on_back_to_login}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Ir a Iniciar Sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
