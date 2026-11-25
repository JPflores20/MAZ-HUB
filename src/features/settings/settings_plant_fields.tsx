/**
 * @fileoverview Plant, department, role position, phone, and bio fields inside the profile editor form.
 */

import { OperationalProfileFields } from "@/shared/components/operational_profile_fields";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

interface SettingsPlantFieldsProps {
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
  is_axel_guillen: boolean;
}

/** Renders operational plant, position, department, phone, and VPO specialty inputs. */
export function SettingsPlantFields({
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
  is_axel_guillen,
}: SettingsPlantFieldsProps) {
  return (
    <>
      <OperationalProfileFields
        id_prefix="profile"
        area={area}
        set_area={set_area}
        position={position}
        set_position={set_position}
        plant={plant}
        set_plant={set_plant}
        phone={phone}
        set_phone={set_phone}
        can_select_elaboracion={is_axel_guillen}
      />

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="profile-bio" className="text-xs font-bold uppercase tracking-wider">
          Acerca de mí / Especialidad VPO
        </Label>
        <Textarea
          id="profile-bio"
          value={bio}
          onChange={(change_event) => set_bio(change_event.target.value)}
          placeholder="Describe brevemente el rol en planta, pilares VPO o áreas de enfoque..."
          rows={3}
          className="resize-none"
        />
      </div>
    </>
  );
}
