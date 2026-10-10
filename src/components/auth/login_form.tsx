import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";

interface LoginFormProps {
  on_switch_to_register: () => void;
}

export function LoginForm({ on_switch_to_register }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();

  // --- states ---
  const [login_email, set_login_email] = useState("");
  const [login_password, set_login_password] = useState("");
  const [login_loading, set_login_loading] = useState(false);
  const [login_error, set_login_error] = useState<string | null>(null);
  const [show_login_password, set_show_login_password] = useState(false);

  // --- handlers ---
  const handle_login = async (e: React.FormEvent) => {
    e.preventDefault();
    set_login_loading(true);
    set_login_error(null);

    if (!login_email || !login_password) {
      set_login_error("Por favor, completa todos los campos.");
      set_login_loading(false);
      return;
    }

    try {
      await login(login_email, login_password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      set_login_error(err.message || "Error al iniciar sesión");
    } finally {
      set_login_loading(false);
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
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p>{login_error}</p>
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
