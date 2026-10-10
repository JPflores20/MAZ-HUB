import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { AlertCircle, UserPlus } from "lucide-react";
import { secondaryAuth } from "@/lib/firebase";
import { userService } from "@/services/user-service";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/context/auth-context";

export function RegistrationForm() {
  const { addMockUser } = useAuth();

  // Variables en snake_case según las reglas
  const [user_name, set_user_name] = useState("");
  const [user_email, set_user_email] = useState("");
  const [user_password, set_user_password] = useState("");
  const [user_role, set_user_role] = useState<UserRole>("user");
  const [user_area, set_user_area] = useState("");

  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);
  const [success_message, set_success_message] = useState<string | null>(null);

  const handle_register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_name || !user_email || !user_password || !user_area) {
      set_error_message("Por favor, completa todos los campos requeridos.");
      return;
    }

    set_is_loading(true);
    set_error_message(null);
    set_success_message(null);

    const email_lower = user_email.trim().toLowerCase();

    try {
      // Crear usuario en Firebase Auth (App Secundaria para no cerrar la sesión activa)
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email_lower, user_password);
      const uid = cred.user.uid;

      // Enviar correo de verificación
      await sendEmailVerification(cred.user);

      // Guardar perfil en Firestore
      await userService.createUser(uid, {
        name: user_name,
        email: email_lower,
        role: user_role,
        area: user_area,
        createdAt: new Date().toISOString(),
      });

      // Actualizar lista local de usuarios
      addMockUser({
        uid,
        name: user_name,
        email: email_lower,
        pass: user_password,
        role: user_role,
        area: user_area,
      });

      set_success_message(
        `Usuario ${user_name} registrado. Se ha enviado un correo de confirmación.`,
      );
      set_user_name("");
      set_user_email("");
      set_user_password("");
      set_user_area("");
    } catch (err: any) {
      set_error_message(err.message || "Error al registrar el usuario.");
    } finally {
      set_is_loading(false);
    }
  };

  return (
    <div className="lg:col-span-1 space-y-6 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] h-fit">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserPlus className="size-5" />
        </div>
        <h2 className="font-display text-xl font-bold">Registrar Usuario</h2>
      </div>

      <form onSubmit={handle_register} className="space-y-4" noValidate>
        {error_message && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p>{error_message}</p>
          </div>
        )}
        {success_message && (
          <div className="flex items-center gap-2 rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
            <p>{success_message}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">NOMBRE COMPLETO</Label>
          <Input
            id="name"
            required
            value={user_name}
            onChange={(e) => set_user_name(e.target.value)}
            placeholder="Ej. Roberto Torres"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">CORREO ELECTRÓNICO (OBLIGATORIO)</Label>
          <Input
            id="email"
            type="email"
            required
            value={user_email}
            onChange={(e) => set_user_email(e.target.value)}
            placeholder="correo@gmodelo.com.mx"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">CONTRASEÑA TEMPORAL</Label>
          <Input
            id="password"
            type="password"
            required
            value={user_password}
            onChange={(e) => set_user_password(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">ÁREA / DEPARTAMENTO</Label>
          <Input
            id="area"
            required
            value={user_area}
            onChange={(e) => set_user_area(e.target.value)}
            placeholder="Ej. Logística"
          />
        </div>

        <div className="space-y-2">
          <Label>ROL DEL SISTEMA</Label>
          <Select value={user_role} onValueChange={(v) => set_user_role(v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">Usuario Regular</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-brand-dark mt-2"
          disabled={is_loading}
        >
          {is_loading ? "Registrando..." : "Crear Cuenta"}
        </Button>
      </form>
    </div>
  );
}
