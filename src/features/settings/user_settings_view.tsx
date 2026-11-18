/**
 * @fileoverview Orchestrator view for user account settings and administrator profile inspection.
 */

import { Sparkles } from "lucide-react";
import { AdminTargetUserBanner } from "./admin_target_user_banner";
import { SettingsPasswordForm } from "./settings_password_form";
import { SettingsProfileForm } from "./settings_profile_form";
import { SettingsSummaryCard } from "./settings_summary_card";
import { usePasswordSettings } from "./use_password_settings";
import { useProfileSettings } from "./use_profile_settings";

/** Renders the `/configuracion` feature view coordinating identity summary, profile editing, and password controls. */
export function UserSettingsView() {
  const profile_state = useProfileSettings();
  const password_state = usePasswordSettings(
    profile_state.target_user,
    profile_state.is_editing_other_user,
  );

  if (!profile_state.current_user || !profile_state.target_user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 py-8 sm:px-10 lg:px-12 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {profile_state.is_editing_other_user
              ? " Administración de Perfiles · MAZ HUB"
              : "Mi Cuenta · MAZ HUB"}
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase tracking-tight text-foreground">
            Configuración de Usuario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile_state.is_editing_other_user
              ? `Editando como administrador los datos personales y de planta de ${profile_state.target_user.name}.`
              : "Administra tu información personal, datos de planta, foto de perfil y seguridad de acceso."}
          </p>
        </div>
        {profile_state.has_profile_changes && (
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles className="size-3.5" />
            Tienes cambios sin guardar en este perfil
          </span>
        )}
      </header>

      {profile_state.is_admin && (
        <AdminTargetUserBanner
          current_user_uid={profile_state.current_user.uid}
          target_user_uid={profile_state.target_user.uid}
          available_users={profile_state.available_users}
          is_editing_other_user={profile_state.is_editing_other_user}
          on_select_uid={profile_state.set_selected_uid}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-12">
        <SettingsSummaryCard
          target_user={profile_state.target_user}
          full_name={profile_state.full_name}
          position={profile_state.position}
          area={profile_state.area}
          plant={profile_state.plant}
          phone={profile_state.phone}
          bio={profile_state.bio}
          avatar_url={profile_state.avatar_url}
          user_initials={profile_state.user_initials}
          user_pdcas_count={profile_state.user_pdcas_count}
          file_input_ref={profile_state.file_input_ref}
          on_avatar_change={(change_event) =>
            void profile_state.handle_avatar_file_change(change_event)
          }
          on_clear_avatar={() => profile_state.set_avatar_url("")}
        />

        <div className="lg:col-span-8 space-y-8">
          <SettingsProfileForm
            target_user_name={profile_state.target_user.name}
            target_user_email={profile_state.target_user.email}
            is_editing_other_user={profile_state.is_editing_other_user}
            is_axel_guillen={profile_state.is_axel_guillen}
            has_profile_changes={profile_state.has_profile_changes}
            is_saving_profile={profile_state.is_saving_profile}
            nombre={profile_state.nombre}
            set_nombre={profile_state.set_nombre}
            paterno={profile_state.paterno}
            set_paterno={profile_state.set_paterno}
            materno={profile_state.materno}
            set_materno={profile_state.set_materno}
            area={profile_state.area}
            set_area={profile_state.set_area}
            position={profile_state.position}
            set_position={profile_state.set_position}
            plant={profile_state.plant}
            set_plant={profile_state.set_plant}
            phone={profile_state.phone}
            set_phone={profile_state.set_phone}
            bio={profile_state.bio}
            set_bio={profile_state.set_bio}
            on_submit={(submit_event) => void profile_state.handle_save_profile(submit_event)}
          />

          <SettingsPasswordForm
            target_user_name={profile_state.target_user.name}
            target_user_email={profile_state.target_user.email}
            is_editing_other_user={profile_state.is_editing_other_user}
            is_sending_reset={password_state.is_sending_reset}
            is_changing_password={password_state.is_changing_password}
            current_password={password_state.current_password}
            set_current_password={password_state.set_current_password}
            new_password={password_state.new_password}
            set_new_password={password_state.set_new_password}
            confirm_password={password_state.confirm_password}
            set_confirm_password={password_state.set_confirm_password}
            show_current_password={password_state.show_current_password}
            on_toggle_current={() =>
              password_state.set_show_current_password((visible) => !visible)
            }
            show_new_password={password_state.show_new_password}
            on_toggle_new={() => password_state.set_show_new_password((visible) => !visible)}
            show_confirm_password={password_state.show_confirm_password}
            on_toggle_confirm={() =>
              password_state.set_show_confirm_password((visible) => !visible)
            }
            password_strength={password_state.password_strength}
            on_send_reset_email={() => void password_state.handle_send_reset_email()}
            on_change_password={(submit_event) =>
              void password_state.handle_change_password(submit_event)
            }
          />
        </div>
      </div>
    </div>
  );
}
