/**
 * login_form.tsx
 * Componente de formulario de autenticación con correo corporativo y contraseña.
 */
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

interface LoginFormProps {
  on_switch_to_register: () => void;
}

export function LoginForm({ on_switch_to_register }: LoginFormProps) {
  const navigate = useNavigate();
  const { login, resendVerificationEmail } = useAuth();

  // --- states ---
  const [login_email, set_login_email] = useState("");
  const [login_password, set_login_password] = useState("");
  const [login_loading, set_login_loading] = useState(false);
  const [login_error, set_login_error] = useState<string | null>(null);
  const [needs_verification, set_needs_verification] = useState(false);
  const [resend_loading, set_resend_loading] = useState(false);
  const [resend_success, set_resend_success] = useState<string | null>(null);
  const [show_login_password, set_show_login_password] = useState(false);

  // --- handlers ---
  const handle_login = async (e: React.FormEvent) => {
    e.preventDefault();
    set_login_loading(true);
    set_login_error(null);
    set_needs_verification(false);
    set_resend_success(null);

    if (!login_email || !login_password) {
      set_login_error("Por favor, completa todos los campos.");
      set_login_loading(false);
      return;
    }

    try {
      await login(login_email, login_password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      const msg = err.message || "Error al iniciar sesión";
      set_login_error(msg);
      if (msg.toLowerCase().includes("verifica tu correo")) {
        set_needs_verification(true);
      }
    } finally {
      set_login_loading(false);
    }
  };

  const handle_resend_verification = async () => {
    set_resend_success(null);
    if (!login_email || !login_password) {
      set_login_error(
        "Ingresa tu correo electrónico y tu contraseña arriba para poder reenviarte el enlace de verificación.",
      );
      return;
    }

    set_resend_loading(true);
    try {
      await resendVerificationEmail(login_email, login_password);
      set_login_error(null);
      set_needs_verification(false);
      set_resend_success(
        `¡Enlace enviado a ${login_email.trim().toLowerCase()}! Revisa tu bandeja de entrada y también la carpeta de Correo no deseado (Spam).`,
      );
    } catch (err: any) {
      if (err.code === "auth/too-many-requests") {
        set_login_error(
          "Ya se envió un enlace recientemente. Espera unos minutos antes de solicitar otro o revisa tu carpeta de Spam.",
        );
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        set_login_error(
          "Correo o contraseña incorrectos. Verifica tus datos para reenviar el correo de verificación.",
        );
      } else {
        set_login_error(err.message || "No se pudo reenviar el correo de verificación.");
      }
    } finally {
      set_resend_loading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm px-8 py-12">
      {/* Header section */}
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

      {/* Form section */}
      <form onSubmit={handle_login} className="space-y-5" noValidate>
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
                onClick={handle_resend_verification}
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
              onChange={(e) => set_login_email(e.target.value)}
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
              onChange={(e) => set_login_password(e.target.value)}
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

        {/* Footer links */}
        <div className="mt-4 flex flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
          <button
            type="button"
            disabled={resend_loading}
            onClick={handle_resend_verification}
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

      {/* Copyright */}
      <div className="mt-10 text-center text-xs text-muted-foreground">
        <p>© 2026 Grupo Modelo. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
