/**
 * registration-form.tsx
 * Formulario administrativo para dar de alta nuevos usuarios, asignarles uno de los 5 roles
 * del sistema y personalizar sus permisos granulares desde el registro.
 */
import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { AlertCircle, UserPlus, SlidersHorizontal, RotateCcw } from "lucide-react";
import { secondaryAuth } from "@/lib/firebase";
import { userService } from "@/services/user-service";
import {
  useAuth,
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_DEFAULT_PERMISSIONS,
  PERMISSION_METADATA,
  type UserRole,
  type UserPermissions,
} from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RegistrationForm() {
  const { addMockUser } = useAuth();

  const [user_name, set_user_name] = useState("");
  const [user_email, set_user_email] = useState("");
  const [user_password, set_user_password] = useState("");
  const [user_role, set_user_role] = useState<UserRole>("user");
  const [user_area, set_user_area] = useState("");
  const [user_position, set_user_position] = useState("");
  const [custom_permissions, set_custom_permissions] = useState<UserPermissions>(
    ROLE_DEFAULT_PERMISSIONS["user"],
  );
  const [show_custom_perms, set_show_custom_perms] = useState(false);

  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);
  const [success_message, set_success_message] = useState<string | null>(null);

  const handle_role_select = (role: UserRole) => {
    set_user_role(role);
    set_custom_permissions({ ...ROLE_DEFAULT_PERMISSIONS[role] });
    if (role === "intern" && !user_position.trim()) {
      set_user_position("BECARIO");
    }
  };

  const handle_toggle_permission = (key: keyof Omit<UserPermissions, "canManageUsers">, checked: boolean) => {
    set_custom_permissions((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

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

      const final_permissions: UserPermissions = {
        ...custom_permissions,
        canManageUsers: user_role === "admin",
      };

      // Guardar perfil en Firestore
      await userService.createUser(uid, {
        name: user_name.trim().toUpperCase(),
        email: email_lower,
        role: user_role,
        permissions: final_permissions,
        area: user_area.trim().toUpperCase(),
        ...(user_position.trim() ? { position: user_position.trim().toUpperCase() } : {}),
        createdAt: new Date().toISOString(),
      });

      // Actualizar lista local de usuarios
      addMockUser({
        uid,
        name: user_name.trim().toUpperCase(),
        email: email_lower,
        pass: user_password,
        role: user_role,
        permissions: final_permissions,
        area: user_area.trim().toUpperCase(),
        ...(user_position.trim() ? { position: user_position.trim().toUpperCase() } : {}),
      });

      set_success_message(
        `Usuario ${user_name} registrado como ${ROLE_LABELS[user_role]}. Se ha enviado un correo de confirmación.`,
      );
      set_user_name("");
      set_user_email("");
      set_user_password("");
      set_user_area("");
      set_user_position("");
      set_user_role("user");
      set_custom_permissions({ ...ROLE_DEFAULT_PERMISSIONS["user"] });
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
        <div>
          <h2 className="font-display text-xl font-bold">Registrar Usuario</h2>
          <p className="text-xs text-muted-foreground">Alta de cuenta y asignación de permisos</p>
        </div>
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

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs font-semibold">
            NOMBRE COMPLETO *
          </Label>
          <Input
            id="name"
            required
            value={user_name}
            onChange={(e) => set_user_name(e.target.value)}
            placeholder="Ej. Roberto Torres"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-semibold">
            CORREO ELECTRÓNICO (OBLIGATORIO) *
          </Label>
          <Input
            id="email"
            type="email"
            required
            value={user_email}
            onChange={(e) => set_user_email(e.target.value)}
            placeholder="correo@gmodelo.com.mx"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-semibold">
            CONTRASEÑA TEMPORAL *
          </Label>
          <Input
            id="password"
            type="password"
            required
            value={user_password}
            onChange={(e) => set_user_password(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="area" className="text-xs font-semibold">
              ÁREA / DEPARTAMENTO *
            </Label>
            <Input
              id="area"
              required
              value={user_area}
              onChange={(e) => set_user_area(e.target.value)}
              placeholder="Ej. COCIMIENTOS"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="position" className="text-xs font-semibold">
              PUESTO / CARGO
            </Label>
            <Input
              id="position"
              value={user_position}
              onChange={(e) => set_user_position(e.target.value)}
              placeholder="Ej. BECARIO / ESPECIALISTA"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">ROL DEL SISTEMA</Label>
          <Select value={user_role} onValueChange={(v) => handle_role_select(v as UserRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
              <SelectItem value="area_lead">{ROLE_LABELS.area_lead}</SelectItem>
              <SelectItem value="user">{ROLE_LABELS.user}</SelectItem>
              <SelectItem value="intern">{ROLE_LABELS.intern}</SelectItem>
              <SelectItem value="viewer">{ROLE_LABELS.viewer}</SelectItem>
            </SelectContent>
          </Select>

          <div className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2.5">
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {ROLE_DESCRIPTIONS[user_role]}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-border/60">
              <button
                type="button"
                onClick={() => set_show_custom_perms((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <SlidersHorizontal className="size-3.5" />
                {show_custom_perms ? "Ocultar casillas de permisos" : "Personalizar permisos"}
              </button>

              {show_custom_perms && (
                <button
                  type="button"
                  onClick={() =>
                    set_custom_permissions({ ...ROLE_DEFAULT_PERMISSIONS[user_role] })
                  }
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                  Restablecer
                </button>
              )}
            </div>

            {show_custom_perms && (
              <div className="space-y-2 pt-1.5">
                {PERMISSION_METADATA.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-start gap-2.5 rounded-md border border-border/60 bg-card p-2 cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    <Checkbox
                      checked={Boolean(custom_permissions[perm.key])}
                      onCheckedChange={(checked) =>
                        handle_toggle_permission(perm.key, Boolean(checked))
                      }
                      className="mt-0.5"
                    />
                    <div className="leading-tight">
                      <span className="block text-xs font-semibold text-foreground">
                        {perm.label}
                      </span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        {perm.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
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
