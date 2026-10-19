/**
 * login.tsx
 * Vista de inicio de sesión y autenticación de usuarios de la plataforma MAZ HUB.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/login_form";
import { RegisterForm } from "@/components/auth/register_form";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Iniciar Sesión · MAZ HUB" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { resendVerificationEmail } = useAuth();

  // --- States ---
  const [is_registering, set_is_registering] = useState(false);
  const [reg_success, set_reg_success] = useState(false);
  const [registered_email, set_registered_email] = useState("");
  const [registered_password, set_registered_password] = useState("");
  const [resending, set_resending] = useState(false);
  const [resend_msg, set_resend_msg] = useState<string | null>(null);
  const [resend_err, set_resend_err] = useState<string | null>(null);

  // --- Handlers ---
  const handle_success = (email: string, password?: string) => {
    set_registered_email(email);
    set_registered_password(password || "");
    set_resend_msg(null);
    set_resend_err(null);
    set_reg_success(true);
  };

  const handle_resend_on_success = async () => {
    if (!registered_email || !registered_password) return;
    set_resending(true);
    set_resend_msg(null);
    set_resend_err(null);
    try {
      await resendVerificationEmail(registered_email, registered_password);
      set_resend_msg(
        "¡Hemos enviado nuevamente el enlace de verificación! Revisa tu bandeja de entrada y tu carpeta de Spam / Correo no deseado.",
      );
    } catch (err: any) {
      if (err.code === "auth/too-many-requests") {
        set_resend_err(
          "Acabamos de enviarte un enlace hace unos momentos. Espera un minuto antes de solicitar otro.",
        );
      } else {
        set_resend_err(err.message || "No se pudo reenviar el enlace.");
      }
    } finally {
      set_resending(false);
    }
  };

  // --- Success view ---
  if (reg_success) {
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
            Hemos enviado un enlace de verificación a <strong>{registered_email}</strong>.
          </p>
          <div className="mb-5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-left text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              PASO OBLIGATORIO PARA COMPLETAR TU REGISTRO:
            </p>
            <p>
              Debes abrir el correo que te enviamos y hacer clic en el{" "}
              <strong>enlace de verificación</strong> antes de poder iniciar sesión. Revisa también
              tu carpeta de <strong>Spam o Correo no deseado</strong>.
            </p>
          </div>

          {resend_msg && (
            <div className="mb-4 rounded-lg border border-green-600/30 bg-green-600/15 p-2.5 text-xs font-medium text-green-800 dark:text-green-200">
              {resend_msg}
            </div>
          )}
          {resend_err && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/15 p-2.5 text-xs font-medium text-destructive">
              {resend_err}
            </div>
          )}

          <div className="space-y-2.5">
            {registered_password && (
              <Button
                type="button"
                variant="outline"
                disabled={resending}
                onClick={handle_resend_on_success}
                className="w-full border-green-600/40 text-green-700 hover:bg-green-600/10 dark:text-green-300"
              >
                <Send className="mr-2 size-4" />
                {resending ? "Reenviando enlace..." : "Volver a enviar enlace de verificación"}
              </Button>
            )}
            <Button
              onClick={() => {
                set_reg_success(false);
                set_is_registering(false);
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Auth UI ---
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background">
      {/* WHITE PANEL (Forms Container) */}
      <div className="absolute inset-0 flex w-full">
        {/* LOGIN FORM (Left half) */}
        <div
          className={`flex w-full lg:w-1/2 items-center justify-center transition-all duration-700 ease-in-out ${is_registering ? "-translate-x-[100%] opacity-0 pointer-events-none absolute" : "translate-x-0 opacity-100 relative z-10"}`}
        >
          <LoginForm on_switch_to_register={() => set_is_registering(true)} />
        </div>

        {/* REGISTER FORM (Right half) */}
        <div
          className={`flex w-full lg:w-1/2 items-center justify-center transition-all duration-700 ease-in-out absolute top-0 bottom-0 right-0 ${is_registering ? "opacity-100 z-10 scale-100 pointer-events-auto" : "opacity-0 z-0 scale-95 pointer-events-none"}`}
        >
          <RegisterForm
            on_switch_to_login={() => set_is_registering(false)}
            on_success={handle_success}
          />
        </div>
      </div>

      {/* BLUE SLIDING OVERLAY (Desktop only) */}
      <div
        className={`hidden lg:flex absolute top-0 left-0 h-full w-1/2 bg-gradient-to-b from-[#0a1428] via-[#0f1c38] to-[#080e1e] text-white z-20 transition-transform duration-700 ease-in-out shadow-2xl items-center justify-center overflow-hidden ${is_registering ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Background accent decorations */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        {/* CONTENT: LOGIN MODE (Shows when panel is on the right) */}
        <div
          className={`absolute inset-0 flex flex-col p-16 transition-all duration-700 ease-in-out ${is_registering ? "opacity-0 translate-x-16 pointer-events-none" : "opacity-100 translate-x-0 delay-100"}`}
        >
          <div className="flex flex-col flex-1 justify-center items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-6">
              Programa de Excelencia
            </p>
            <h2 className="text-4xl xl:text-5xl font-display font-bold leading-[1.1] mb-6">
              TRANSFORMANDO EL
              <br />
              FUTURO CON
              <br />
              MEJORA CONTINUA.
            </h2>
            <p className="text-base text-white/80 max-w-md leading-relaxed">
              Aplica la metodología Plan-Do-Check-Act para estandarizar procesos, reducir mermas y
              potenciar tu desarrollo dentro de Grupo Modelo.
            </p>

            <div className="mt-12 space-y-4">
              <p className="text-sm font-medium text-white/70">¿Eres nuevo en la plataforma?</p>
              <Button
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
                onClick={() => set_is_registering(true)}
              >
                Regístrate aquí
              </Button>
            </div>
          </div>

          <div className="flex gap-4 text-sm font-medium text-white/60 pb-4">
            <span>AB InBev</span>
            <span>•</span>
            <span>Grupo Modelo</span>
          </div>
        </div>

        {/* CONTENT: REGISTER MODE (Shows when panel is on the left) */}
        <div
          className={`absolute inset-0 flex flex-col p-16 transition-all duration-700 ease-in-out ${is_registering ? "opacity-100 translate-x-0 delay-100" : "opacity-0 -translate-x-16 pointer-events-none"}`}
        >
          <div className="flex flex-col flex-1 justify-center items-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-6">
              Cultura MAZ
            </p>
            <h2 className="text-4xl xl:text-5xl font-display font-bold leading-[1.1] mb-6">
              ÚNETE AL EQUIPO
              <br />
              QUE LIDERA EL
              <br />
              CAMBIO.
            </h2>
            <p className="text-base text-white/80 max-w-md leading-relaxed">
              Regístrate para obtener acceso al Módulo PDCA. Al crear tu cuenta, tu identidad
              corporativa será resguardada bajo los más altos estándares de seguridad.
            </p>

            <div className="mt-12 space-y-4">
              <p className="text-sm font-medium text-white/70">¿Ya tienes una cuenta?</p>
              <Button
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white px-8"
                onClick={() => set_is_registering(false)}
              >
                Iniciar Sesión
              </Button>
            </div>
          </div>

          <div className="flex gap-4 text-sm font-medium text-white/60 pb-4">
            <span>Cervecería Zacatecas</span>
            <span>•</span>
            <span>Mejora Continua</span>
          </div>
        </div>
      </div>
    </div>
  );
}
