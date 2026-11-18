/**
 * @fileoverview Self-service collaborator registration form requiring corporate email and strong password.
 */

import type React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { RegisterSuccessOptions } from "./auth_types";
import { PasswordVisibilityField } from "./password_visibility_field";
import { useRegisterForm } from "./use_register_form";

export type { RegisterSuccessOptions };

interface RegisterFormProps {
  on_switch_to_login: () => void;
  on_success: (email: string, password?: string, options?: RegisterSuccessOptions) => void;
}

/**
 * Renders the self-registration form for new corporate users awaiting email + admin verification.
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

  const handle_uppercase =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (change_event: React.ChangeEvent<HTMLInputElement>) => {
      setter(change_event.target.value.toUpperCase());
    };

  const password_match_border =
    reg_password && confirm_password
      ? reg_password === confirm_password
        ? "border-green-500 focus-visible:ring-green-500"
        : "border-red-500 focus-visible:ring-red-500"
      : "";

  return (
    <div className="mx-auto w-full max-w-md px-8 py-12 overflow-y-auto max-h-screen">
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

      <form onSubmit={(submit_event) => void handle_register(submit_event)} className="space-y-5" noValidate>
        {reg_error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <p>{reg_error}</p>
          </div>
        )}

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
              onChange={(change_event) => set_reg_email(change_event.target.value)}
              placeholder="correo@gmodelo.com.mx o correo@ab-inbev.com"
            />
            <p className="text-[10px] text-muted-foreground">
              Debe terminar en <strong>@gmodelo.com.mx</strong> o <strong>@ab-inbev.com</strong>.
            </p>
          </div>

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

        <div className="pt-2">
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
