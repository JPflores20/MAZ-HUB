/**
 * @fileoverview Plant, department, role position, phone, and bio fields inside the profile editor form.
 */

import { Briefcase, Building2, MapPin, Phone } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { SUGGESTED_AREAS, SUGGESTED_PLANTS, SUGGESTED_POSITIONS } from "./settings_utils";

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
      <div className="space-y-2">
        <Label htmlFor="profile-position" className="text-xs font-bold uppercase tracking-wider">
          Puesto / Cargo
        </Label>
        <Select
          value={
            (SUGGESTED_POSITIONS as readonly string[]).includes(position.toUpperCase())
              ? position.toUpperCase()
              : ""
          }
          onValueChange={set_position}
        >
          <SelectTrigger id="profile-position" className="w-full">
            <div className="flex items-center gap-2">
              <Briefcase className="size-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Selecciona tu puesto" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SUGGESTED_POSITIONS.map((position_option) => (
              <SelectItem key={position_option} value={position_option}>
                {position_option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-area" className="text-xs font-bold uppercase tracking-wider">
          Área / Departamento *
        </Label>
        <Select
          value={
            (SUGGESTED_AREAS as readonly string[]).includes(area.toUpperCase())
              ? area.toUpperCase()
              : ""
          }
          onValueChange={set_area}
        >
          <SelectTrigger id="profile-area" className="w-full">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Selecciona tu área" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {SUGGESTED_AREAS.map((area_option) => (
              <SelectItem
                key={area_option}
                value={area_option}
                disabled={area_option === "ELABORACION" && !is_axel_guillen}
              >
                {area_option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-plant" className="text-xs font-bold uppercase tracking-wider">
          Planta / Sede
        </Label>
        <div className="relative">
          <MapPin className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            id="profile-plant"
            list="suggested-plants-list"
            value={plant}
            onChange={(change_event) => set_plant(change_event.target.value)}
            placeholder="Ej. Cervecería Zacatecas"
            className="pl-9"
          />
          <datalist id="suggested-plants-list">
            {SUGGESTED_PLANTS.map((plant_option) => (
              <option key={plant_option} value={plant_option} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-phone" className="text-xs font-bold uppercase tracking-wider">
          Teléfono o Extensión
        </Label>
        <div className="relative">
          <Phone className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            id="profile-phone"
            value={phone}
            onChange={(change_event) => set_phone(change_event.target.value)}
            placeholder="Ej. Ext. 4512 o +52 492 000 0000"
            className="pl-9"
          />
        </div>
      </div>

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
