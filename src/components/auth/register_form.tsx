import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { primaryAuth } from "@/lib/firebase";
import { userService } from "@/services/user-service";

interface RegisterFormProps {
  on_switch_to_login: () => void;
  on_success: (email: string) => void;
}

export function RegisterForm({ on_switch_to_login, on_success }: RegisterFormProps) {
  // --- states ---
  const [nombre, set_nombre] = useState("");
  const [paterno, set_paterno] = useState("");
  const [materno, set_materno] = useState("");
  const [reg_email, set_reg_email] = useState("");
  const [reg_password, set_reg_password] = useState("");
  const [confirm_password, set_confirm_password] = useState("");
  const [reg_loading, set_reg_loading] = useState(false);
  const [reg_error, set_reg_error] = useState<string | null>(null);
  const [show_reg_password, set_show_reg_password] = useState(false);
  const [show_confirm_password, set_show_confirm_password] = useState(false);

  // --- handlers ---
  const handle_register = async (e: React.FormEvent) => {
    e.preventDefault();
    set_reg_error(null);

    if (!nombre || !paterno || !materno || !reg_email || !reg_password || !confirm_password) {
      set_reg_error("Por favor, completa todos los campos.");
      return;
    }

    if (reg_password !== confirm_password) {
      set_reg_error("Las contraseñas no coinciden.");
      return;
    }

    const password_regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!password_regex.test(reg_password)) {
      set_reg_error(
        "La contraseña debe tener mínimo 6 caracteres, una mayúscula, un número y un carácter especial.",
      );
      return;
    }

    set_reg_loading(true);

    try {
      const full_name = [nombre, paterno, materno].filter(Boolean).join(" ");
      const email_lower = reg_email.trim().toLowerCase();

      primaryAuth.languageCode = "es";
      const cred = await createUserWithEmailAndPassword(primaryAuth, email_lower, reg_password);
      const user = cred.user;

      await userService.createUser(user.uid, {
        name: full_name,
        email: email_lower,
        role: "user",
        area: "Usuario",
        createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(user);
      await signOut(primaryAuth);

      on_success(email_lower);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        set_reg_error(
          "Este correo corporativo ya está registrado. Por favor, intenta iniciar sesión.",
        );
      } else if (err.code === "auth/invalid-email") {
        set_reg_error("El correo electrónico no es válido.");
      } else if (err.code === "auth/weak-password") {
        set_reg_error("La contraseña es demasiado débil. Usa al menos 6 caracteres.");
      } else {
        console.error("Error en registro:", err);
        set_reg_error(`Error al registrar: ${err.message}`);
      }
    } finally {
      set_reg_loading(false);
    }
  };

  const handle_uppercase =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value.toUpperCase());
    };

  return (
    <div className="mx-auto w-full max-w-md px-8 py-12 overflow-y-auto max-h-screen">
      {/* Header section */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
          <img
            src="/logos/MAZ.webp"
            alt="Logo"
            className="h-full w-full object-cover rounded-xl opacity-90"
          />
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          Registro de Colaborador
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa tus datos oficiales para solicitar acceso a MAZ HUB.
        </p>
      </div>

      {/* Form section */}
      <form onSubmit={handle_register} className="space-y-5" noValidate>
        {reg_error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p>{reg_error}</p>
          </div>
        )}

        {/* Personal data */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
            Datos Personales
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="nombre" className="text-xs">
                NOMBRE(S) *
              </Label>
              <Input
                id="nombre"
                required
                value={nombre}
                onChange={handle_uppercase(set_nombre)}
                placeholder="Ej. ANA MARIA"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="paterno" className="text-xs">
                APELLIDO PATERNO *
              </Label>
              <Input
                id="paterno"
                required
                value={paterno}
                onChange={handle_uppercase(set_paterno)}
                placeholder="LOPEZ"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="materno" className="text-xs">
                APELLIDO MATERNO
              </Label>
              <Input
                id="materno"
                value={materno}
                onChange={handle_uppercase(set_materno)}
                placeholder="HERNANDEZ"
              />
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
            Credenciales
          </h3>
          <div className="space-y-1">
            <Label htmlFor="regEmail" className="text-xs">
              CORREO ELECTRÓNICO CORPORATIVO *
            </Label>
            <Input
              id="regEmail"
              type="email"
              required
              value={reg_email}
              onChange={(e) => set_reg_email(e.target.value)}
              placeholder="correo@gmodelo.com.mx"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="regPassword" className="text-xs">
                CONTRASEÑA *
              </Label>
              <div className="relative">
                <Input
                  id="regPassword"
                  type={show_reg_password ? "text" : "password"}
                  required
                  value={reg_password}
                  onChange={(e) => set_reg_password(e.target.value)}
                  placeholder="••••••••"
                  className={`pr-10 ${
                    reg_password && confirm_password
                      ? reg_password === confirm_password
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => set_show_reg_password(!show_reg_password)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show_reg_password ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-xs">
                CONFIRMAR *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={show_confirm_password ? "text" : "password"}
                  required
                  value={confirm_password}
                  onChange={(e) => set_confirm_password(e.target.value)}
                  placeholder="••••••••"
                  className={`pr-10 ${
                    reg_password && confirm_password
                      ? reg_password === confirm_password
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "border-red-500 focus-visible:ring-red-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => set_show_confirm_password(!show_confirm_password)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show_confirm_password ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Mínimo 6 caracteres, al menos una mayúscula, un número y un símbolo (!@#$%).
          </p>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] hover:opacity-90 text-white shadow-md"
            disabled={reg_loading}
          >
            {reg_loading ? "Procesando Registro..." : "Crear Mi Cuenta"}
          </Button>
        </div>

        {/* Mobile footer */}
        <div className="text-center text-sm text-muted-foreground lg:hidden">
          <button
            type="button"
            onClick={on_switch_to_login}
            className="text-primary hover:underline font-medium"
          >
            Ya tengo cuenta, iniciar sesión
          </button>
        </div>
      </form>
    </div>
  );
}
