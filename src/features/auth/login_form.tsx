/**
 * @fileoverview Corporate login form UI with verification resend CTA and password visibility toggle.
 */

import { Link } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, Send } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useLoginForm } from "./use_login_form";

interface LoginFormProps {
  on_switch_to_register: () => void;
}

/**
 * Renders the sign-in panel for MAZ HUB corporate accounts.
 *
 * @param {LoginFormProps} props - Callback toggling the sliding view to self-registration on mobile.
 */
export function LoginForm({ on_switch_to_register }: LoginFormProps) {
  const {
    login_email,
    set_login_email,
    login_password,
    set_login_password,
    login_loading,
    login_error,
    needs_verification,
    resend_loading,
    resend_success,
    show_login_password,
    set_show_login_password,
    handle_login,
    handle_resend_verification,
  } = useLoginForm();

  return (
    <div className="mx-auto w-full max-w-sm px-8 py-12">
      <div className="mb-10 flex flex-col items-center justify-center text-center">
        <img
          src="/logos/MAZ.webp"
          alt="Logo MAZ"
          className="mb-6 h-36 w-auto object-contain rounded-2xl shadow-2xl transition-transform duration-700 hover:scale-105"
        />
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
          MAZ HUB
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Módulo PDCA de Mejora Continua</p>
      </div>

      <form onSubmit={(submit_event) => void handle_login(submit_event)} className="space-y-5" noValidate>
        {login_error && (
          <div className="space-y-2.5 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <div className="flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <p>{login_error}</p>
            </div>
            {needs_verification && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resend_loading}
                onClick={() => void handle_resend_verification()}
                className="w-full border-destructive/40 bg-background/90 text-destructive hover:bg-destructive hover:text-white font-semibold"
              >
                <Send className="mr-2 size-3.5" />
                {resend_loading
                  ? "Enviando enlace..."
                  : "Reenviar enlace de verificación al correo"}
              </Button>
            )}
          </div>
        )}

        {resend_success && (
          <div className="flex items-start gap-2 rounded-md border border-green-500/30 bg-green-500/15 p-3 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <p>{resend_success}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="loginEmail">CORREO ELECTRÓNICO</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="loginEmail"
              value={login_email}
              onChange={(change_event) => set_login_email(change_event.target.value)}
              type="email"
              required
              className="pl-9"
              placeholder="ana.lopez@gmodelo.com.mx"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="loginPassword">CONTRASEÑA</Label>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="loginPassword"
              value={login_password}
              onChange={(change_event) => set_login_password(change_event.target.value)}
              type={show_login_password ? "text" : "password"}
              required
              className="pl-9 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => set_show_login_password(!show_login_password)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show_login_password ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] hover:opacity-90 text-white shadow-md"
          disabled={login_loading}
        >
          {login_loading ? "Iniciando sesión..." : "Ingresar a mi cuenta"}
          {!login_loading && <ArrowRight className="ml-2 size-4" />}
        </Button>

        <div className="mt-4 flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
          <button
            type="button"
            disabled={resend_loading}
            onClick={() => void handle_resend_verification()}
            className="text-xs text-muted-foreground hover:text-primary hover:underline font-medium cursor-pointer"
          >
            {resend_loading
              ? "Enviando enlace de verificación..."
              : "¿No recibiste el correo de verificación? Reenviar enlace"}
          </button>
          <div className="flex items-center gap-1 lg:hidden">
            <span>¿No tienes una cuenta?</span>
            <button
              type="button"
              onClick={on_switch_to_register}
              className="text-primary hover:underline font-medium"
            >
              Regístrate aquí
            </button>
          </div>
        </div>
      </form>

      <div className="mt-10 text-center text-xs text-muted-foreground">
        <p>© 2026 Grupo Modelo. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
