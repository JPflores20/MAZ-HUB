/**
 * @fileoverview Shared operational profile fields (position, area, plant, and phone/extension) for registration and settings.
 */

import { Briefcase, Building2, MapPin, Phone } from "lucide-react";
import {
  SUGGESTED_AREAS,
  SUGGESTED_PLANTS,
  SUGGESTED_POSITIONS,
} from "@/domain/constants/plant_catalog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export interface OperationalProfileFieldsProps {
  id_prefix?: string;
  area: string;
  set_area: (next_area: string) => void;
  position: string;
  set_position: (next_position: string) => void;
  plant: string;
  set_plant: (next_plant: string) => void;
  phone: string;
  set_phone: (next_phone: string) => void;
  can_select_elaboracion?: boolean;
  label_class_name?: string;
}

/** Renders Puesto / Cargo, Área / Departamento *, Planta / Sede, and Teléfono o Extensión inside a 2-column grid. */
export function OperationalProfileFields({
  id_prefix = "profile",
  area,
  set_area,
  position,
  set_position,
  plant,
  set_plant,
  phone,
  set_phone,
  can_select_elaboracion = false,
  label_class_name = "text-xs font-bold uppercase tracking-wider",
}: OperationalProfileFieldsProps) {
  const position_id = `${id_prefix}-position`;
  const area_id = `${id_prefix}-area`;
  const plant_id = `${id_prefix}-plant`;
  const phone_id = `${id_prefix}-phone`;
  const plants_list_id = `${id_prefix}-suggested-plants-list`;

  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor={position_id} className={label_class_name}>
          PUESTO / CARGO
        </Label>
        <Select
          value={
            (SUGGESTED_POSITIONS as readonly string[]).includes(position.toUpperCase())
              ? position.toUpperCase()
              : ""
          }
          onValueChange={set_position}
        >
          <SelectTrigger id={position_id} className="w-full">
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

      <div className="space-y-1.5">
        <Label htmlFor={area_id} className={label_class_name}>
          ÁREA / DEPARTAMENTO *
        </Label>
        <Select
          value={
            (SUGGESTED_AREAS as readonly string[]).includes(area.toUpperCase())
              ? area.toUpperCase()
              : ""
          }
          onValueChange={set_area}
        >
          <SelectTrigger id={area_id} className="w-full">
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
                disabled={area_option === "ELABORACION" && !can_select_elaboracion}
              >
                {area_option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={plant_id} className={label_class_name}>
          PLANTA / SEDE
        </Label>
        <div className="relative">
          <MapPin className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            id={plant_id}
            list={plants_list_id}
            value={plant}
            maxLength={80}
            onChange={(change_event) => set_plant(change_event.target.value)}
            placeholder="Ej. Cervecería Zacatecas"
            className="pl-9"
          />
          <datalist id={plants_list_id}>
            {SUGGESTED_PLANTS.map((plant_option) => (
              <option key={plant_option} value={plant_option} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={phone_id} className={label_class_name}>
          TELÉFONO O EXTENSIÓN
        </Label>
        <div className="relative">
          <Phone className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            id={phone_id}
            type="tel"
            value={phone}
            maxLength={40}
            onChange={(change_event) => set_phone(change_event.target.value)}
            placeholder="Ej. Ext. 4512 o +52 492 000 0000"
            className="pl-9"
          />
        </div>
      </div>
    </>
  );
}
