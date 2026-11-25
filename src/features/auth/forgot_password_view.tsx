/**
 * @fileoverview Anti-enumeration password recovery view with corporate domain validation and local throttling.
 */

import type React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { primary_auth } from "@/core/config/firebase";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { validate_general_email } from "./email_validation";

const RESET_COOLDOWN_SECONDS = 60;

/**
 * Displays the forgot-password form enforcing corporate domain checks and anti-enumeration messaging.
 */
export function ForgotPasswordView() {
  const navigate = useNavigate();
  const [target_email, set_target_email] = useState("");
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);
  const [sent_notice, set_sent_notice] = useState<string | null>(null);
  const [cooldown_seconds, set_cooldown_seconds] = useState(0);

  useEffect(() => {
    if (cooldown_seconds <= 0) {
      return undefined;
    }
    const countdown_timer = setInterval(() => {
      set_cooldown_seconds((previous_seconds) => (previous_seconds > 0 ? previous_seconds - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown_timer);
  }, [cooldown_seconds]);

  const handle_submit = async (submit_event: React.FormEvent) => {
    submit_event.preventDefault();
    set_error_message(null);
    set_sent_notice(null);

    const validation = validate_general_email(target_email);
    if (!validation.valid) {
      set_error_message(validation.error || "Ingresa un correo electrónico válido.");
      return;
    }

    if (cooldown_seconds > 0) {
      set_error_message(`Espera ${cooldown_seconds} segundos antes de solicitar otro enlace.`);
      return;
    }

    set_is_loading(true);
    try {
      primary_auth.languageCode = "es";
      await sendPasswordResetEmail(primary_auth, validation.normalized);
    } catch {
      // Intentional anti-enumeration response: identical UI notice regardless of account existence
    } finally {
      set_is_loading(false);
      set_cooldown_seconds(RESET_COOLDOWN_SECONDS);
      set_sent_notice(
        "Si el correo corporativo está registrado en la plataforma, recibirás un enlace para restablecer tu contraseña. Revisa también tu carpeta de Spam.",
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground text-center">
          Recuperar Contraseña
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center mb-6">
          Ingresa tu correo corporativo y te enviaremos instrucciones para restablecer tu acceso.
        </p>

        <form
          onSubmit={(submit_event) => void handle_submit(submit_event)}
          className="space-y-4"
          noValidate
        >
          {error_message && (
            <div className="flex items-start gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p>{error_message}</p>
            </div>
          )}

          {sent_notice && (
            <div className="flex items-start gap-2 rounded-md border border-green-500/30 bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-300">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <p>{sent_notice}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="resetEmail">CORREO CORPORATIVO</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="resetEmail"
                type="email"
                required
                value={target_email}
                onChange={(change_event) => set_target_email(change_event.target.value)}
                placeholder="usuario@gmodelo.com.mx"
                className="pl-9"
              />
            </div>
          </div>

          <Button type="submit" disabled={is_loading || cooldown_seconds > 0} className="w-full">
            <Send className="mr-2 size-4" />
            {is_loading
              ? "Procesando..."
              : cooldown_seconds > 0
                ? `Reenviar en ${cooldown_seconds}s`
                : "Enviar enlace de recuperación"}
          </Button>
        </form>

        <Button
          onClick={() => void navigate({ to: "/login" })}
          variant="outline"
          className="mt-4 w-full"
        >
          <ArrowLeft className="mr-2 size-4" /> Volver al Inicio de Sesión
        </Button>
      </div>
    </div>
  );
}
