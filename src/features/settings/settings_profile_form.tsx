/**
 * @fileoverview Personal and plant profile editor card inside user settings.
 */

import type React from "react";
import { Mail, Save, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { SettingsPlantFields } from "./settings_plant_fields";

interface SettingsProfileFormProps {
  target_user_name: string;
  target_user_email: string;
  is_editing_other_user: boolean;
  is_axel_guillen: boolean;
  has_profile_changes: boolean;
  is_saving_profile: boolean;
  nombre: string;
  set_nombre: React.Dispatch<React.SetStateAction<string>>;
  paterno: string;
  set_paterno: React.Dispatch<React.SetStateAction<string>>;
  materno: string;
  set_materno: React.Dispatch<React.SetStateAction<string>>;
  area: string;
  set_area: (next_area: string) => void;
  position: string;
  set_position: (next_position: string) => void;
  plant: string;
  set_plant: (next_plant: string) => void;
  phone: string;
  set_phone: (next_phone: string) => void;
  bio: string;
  set_bio: (next_bio: string) => void;
  on_submit: (submit_event: React.FormEvent) => void;
}

/** Form card editing uppercase legal names, readonly email, and operational plant details. */
export function SettingsProfileForm({
  target_user_name,
  target_user_email,
  is_editing_other_user,
  is_axel_guillen,
  has_profile_changes,
  is_saving_profile,
  nombre,
  set_nombre,
  paterno,
  set_paterno,
  materno,
  set_materno,
  area,
  set_area,
  position,
  set_position,
  plant,
  set_plant,
  phone,
  set_phone,
  bio,
  set_bio,
  on_submit,
}: SettingsProfileFormProps) {
  const handle_uppercase =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (change_event: React.ChangeEvent<HTMLInputElement>) => {
      setter(change_event.target.value.toUpperCase());
    };

  return (
    <form
      onSubmit={on_submit}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] space-y-6"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Información Personal y de Planta
            </h2>
            <p className="text-xs text-muted-foreground">
              {is_editing_other_user
                ? `Modificando como administrador los datos personales de ${target_user_name}.`
                : "Estos datos se mostrarán como autor o participante en tus proyectos PDCA y RDAs."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-nombre" className="text-xs font-bold uppercase tracking-wider">
            NOMBRE(S) *
          </Label>
          <Input
            id="profile-nombre"
            value={nombre}
            onChange={handle_uppercase(set_nombre)}
            placeholder="Ej. ANA MARIA"
            className="uppercase"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-paterno" className="text-xs font-bold uppercase tracking-wider">
            APELLIDO PATERNO *
          </Label>
          <Input
            id="profile-paterno"
            value={paterno}
            onChange={handle_uppercase(set_paterno)}
            placeholder="LOPEZ"
            className="uppercase"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-materno" className="text-xs font-bold uppercase tracking-wider">
            APELLIDO MATERNO
          </Label>
          <Input
            id="profile-materno"
            value={materno}
            onChange={handle_uppercase(set_materno)}
            placeholder="HERNANDEZ"
            className="uppercase"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-wider">
            Correo Corporativo
          </Label>
          <div className="relative">
            <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              id="profile-email"
              value={target_user_email}
              disabled
              className="pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        <SettingsPlantFields
          area={area}
          set_area={set_area}
          position={position}
          set_position={set_position}
          plant={plant}
          set_plant={set_plant}
          phone={phone}
          set_phone={set_phone}
          bio={bio}
          set_bio={set_bio}
          is_axel_guillen={is_axel_guillen}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <Button
          type="submit"
          disabled={is_saving_profile || !has_profile_changes}
          className="gap-2 px-6 font-semibold shadow-sm"
        >
          <Save className="size-4" />
          {is_saving_profile
            ? "Guardando cambios..."
            : is_editing_other_user
              ? `Guardar Datos de ${nombre || "Usuario"}`
              : "Guardar Datos Personales"}
        </Button>
      </div>
    </form>
  );
}
