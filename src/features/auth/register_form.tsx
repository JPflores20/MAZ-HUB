/**
 * @fileoverview Self-service collaborator registration form collecting personal, operational plant, and credential fields.
 */

import { AlertCircle } from "lucide-react";
import { OperationalProfileFields } from "@/shared/components/operational_profile_fields";
import { PersonalIdentityFields } from "@/shared/components/personal_identity_fields";
import { Button } from "@/shared/ui/button";
import type { RegisterSuccessOptions } from "./auth_types";
import { PasswordVisibilityField } from "./password_visibility_field";
import { useRegisterForm } from "./use_register_form";

export type { RegisterSuccessOptions };

interface RegisterFormProps {
  on_switch_to_login: () => void;
  on_success: (email: string, password?: string, options?: RegisterSuccessOptions) => void;
}

/**
 * Renders the self-registration form for new corporate users with personal, plant, and password details.
 */
export function RegisterForm({ on_switch_to_login, on_success }: RegisterFormProps) {
  const {
    nombre,
    set_nombre,
    paterno,
    set_paterno,
    materno,
    set_materno,
    reg_email,
    set_reg_email,
    position,
    set_position,
    area,
    set_area,
    plant,
    set_plant,
    phone,
    set_phone,
    can_select_elaboracion,
    reg_password,
    set_reg_password,
    confirm_password,
    set_confirm_password,
    reg_loading,
    reg_error,
    show_reg_password,
    set_show_reg_password,
    show_confirm_password,
    set_show_confirm_password,
    handle_register,
  } = useRegisterForm(on_success);

  const password_match_border =
    reg_password && confirm_password
      ? reg_password === confirm_password
        ? "border-green-500 focus-visible:ring-green-500"
        : "border-red-500 focus-visible:ring-red-500"
      : "";

  return (
    <div className="mx-auto w-full max-w-lg px-6 sm:px-8 py-8 overflow-y-auto max-h-screen">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
          <img
            src="/logos/MAZ.webp"
            alt="Logo"
            className="h-full w-full object-cover rounded-xl opacity-90"
          />
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          Registro de Colaborador
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Completa tu información personal, de planta y credenciales para acceder a MAZ HUB.
        </p>
      </div>

      <form
        onSubmit={(submit_event) => void handle_register(submit_event)}
        className="space-y-4"
        noValidate
      >
        {reg_error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p>{reg_error}</p>
          </div>
        )}

        <div className="space-y-3.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
            Información Personal y de Planta
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <PersonalIdentityFields
              id_prefix="reg"
              nombre={nombre}
              set_nombre={set_nombre}
              paterno={paterno}
              set_paterno={set_paterno}
              materno={materno}
              set_materno={set_materno}
              email={reg_email}
              set_email={set_reg_email}
              email_hint={
                <p className="text-[10px] text-muted-foreground">
                  Usa <strong>@gmodelo.com.mx</strong> o <strong>@ab-inbev.com</strong>.
                </p>
              }
            />

            <OperationalProfileFields
              id_prefix="reg"
              area={area}
              set_area={set_area}
              position={position}
              set_position={set_position}
              plant={plant}
              set_plant={set_plant}
              phone={phone}
              set_phone={set_phone}
              can_select_elaboracion={can_select_elaboracion}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
            Seguridad de Cuenta
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <PasswordVisibilityField
              id="regPassword"
              label="CONTRASEÑA *"
              value={reg_password}
              on_change={set_reg_password}
              is_visible={show_reg_password}
              on_toggle_visible={() => set_show_reg_password(!show_reg_password)}
              required
              class_name={password_match_border}
            />
            <PasswordVisibilityField
              id="confirmPassword"
              label="CONFIRMAR *"
              value={confirm_password}
              on_change={set_confirm_password}
              is_visible={show_confirm_password}
              on_toggle_visible={() => set_show_confirm_password(!show_confirm_password)}
              required
              class_name={password_match_border}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Mínimo 8 caracteres, al menos una mayúscula, un número y un símbolo (!@#$%).
          </p>
        </div>

        <div className="pt-1">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] hover:opacity-90 text-white shadow-md"
            disabled={reg_loading}
          >
            {reg_loading ? "Procesando Registro..." : "Crear Mi Cuenta"}
          </Button>
        </div>

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
