/**
 * @fileoverview Security and password management card supporting Firebase Auth password update and reset links.
 */

import type React from "react";
import { CheckCircle2, KeyRound, Lock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { SettingsPasswordInput } from "./settings_password_input";
import { STRONG_PASSWORD_REGEX } from "./settings_utils";

interface SettingsPasswordFormProps {
  target_user_name: string;
  target_user_email: string;
  is_editing_other_user: boolean;
  is_sending_reset: boolean;
  is_changing_password: boolean;
  current_password: string;
  set_current_password: (value: string) => void;
  new_password: string;
  set_new_password: (value: string) => void;
  confirm_password: string;
  set_confirm_password: (value: string) => void;
  show_current_password: boolean;
  on_toggle_current: () => void;
  show_new_password: boolean;
  on_toggle_new: () => void;
  show_confirm_password: boolean;
  on_toggle_confirm: () => void;
  password_strength: { score: number; label: string; color: string };
  on_send_reset_email: () => void;
  on_change_password: (submit_event: React.FormEvent) => void;
}

/** Displays password reset action and, for the active user's own account, an interactive password updater. */
export function SettingsPasswordForm({
  target_user_name,
  target_user_email,
  is_editing_other_user,
  is_sending_reset,
  is_changing_password,
  current_password,
  set_current_password,
  new_password,
  set_new_password,
  confirm_password,
  set_confirm_password,
  show_current_password,
  on_toggle_current,
  show_new_password,
  on_toggle_new,
  show_confirm_password,
  on_toggle_confirm,
  password_strength,
  on_send_reset_email,
  on_change_password,
}: SettingsPasswordFormProps) {
  const is_submit_disabled =
    is_changing_password ||
    !current_password ||
    !STRONG_PASSWORD_REGEX.test(new_password) ||
    new_password !== confirm_password;

  return (
    <form
      onSubmit={on_change_password}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Lock className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Seguridad y Contraseña
            </h2>
            <p className="text-xs text-muted-foreground">
              {is_editing_other_user
                ? `Envía un enlace seguro de restablecimiento de contraseña al correo corporativo de ${target_user_name}.`
                : "Actualiza tu contraseña actual o solicita un enlace de recuperación a tu correo corporativo."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={is_sending_reset}
          onClick={on_send_reset_email}
          className="text-xs gap-1.5"
        >
          <KeyRound className="size-3.5" />
          {is_sending_reset
            ? "Enviando correo..."
            : is_editing_other_user
              ? `Enviar enlace a ${target_user_email}`
              : "Enviar enlace a mi correo"}
        </Button>
      </div>

      {!is_editing_other_user && (
        <>
          <div className="grid gap-5 sm:grid-cols-2 pt-2 border-t border-border/60">
            <div className="sm:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Cambiar Contraseña
              </h3>
            </div>

            <SettingsPasswordInput
              id="current-password"
              label="Contraseña Actual *"
              value={current_password}
              on_change={set_current_password}
              is_visible={show_current_password}
              on_toggle_visible={on_toggle_current}
              placeholder="Ingresa tu contraseña actual"
              icon={Lock}
              wrapper_class_name="space-y-2 sm:col-span-2"
            />

            <SettingsPasswordInput
              id="new-password"
              label="Nueva Contraseña *"
              value={new_password}
              on_change={set_new_password}
              is_visible={show_new_password}
              on_toggle_visible={on_toggle_new}
              placeholder="Mínimo 6 caracteres"
              icon={KeyRound}
            >
              {new_password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1.5 h-1.5">
                    {[1, 2, 3].map((step_level) => (
                      <div
                        key={step_level}
                        className={`flex-1 rounded-full transition-colors ${
                          password_strength.score >= step_level
                            ? password_strength.color
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Seguridad de contraseña:{" "}
                    <strong className="text-foreground">{password_strength.label}</strong>
                  </p>
                </div>
              )}
            </SettingsPasswordInput>

            <SettingsPasswordInput
              id="confirm-password"
              label="Confirmar Nueva Contraseña *"
              value={confirm_password}
              on_change={set_confirm_password}
              is_visible={show_confirm_password}
              on_toggle_visible={on_toggle_confirm}
              placeholder="Repite la nueva contraseña"
              icon={CheckCircle2}
            >
              {confirm_password && confirm_password !== new_password && (
                <p className="text-[11px] text-destructive font-medium">
                  Las contraseñas aún no coinciden.
                </p>
              )}
            </SettingsPasswordInput>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="submit"
              variant="secondary"
              disabled={is_submit_disabled}
              className="gap-2 px-6 font-semibold"
            >
              <Lock className="size-4" />
              {is_changing_password ? "Actualizando..." : "Actualizar Contraseña"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
