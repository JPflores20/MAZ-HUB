/**
 * @fileoverview Shared personal identity fields (legal uppercase names and corporate email) for settings and registration.
 */

import type React from "react";
import { Mail } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

export interface PersonalIdentityFieldsProps {
  nombre: string;
  set_nombre: React.Dispatch<React.SetStateAction<string>>;
  paterno: string;
  set_paterno: React.Dispatch<React.SetStateAction<string>>;
  materno: string;
  set_materno: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  set_email?: (next_email: string) => void;
  email_read_only?: boolean;
  email_hint?: React.ReactNode;
  id_prefix?: string;
}

/** Renders uppercase Nombre(s), Apellido Paterno, Apellido Materno, and Correo Corporativo fields. */
export function PersonalIdentityFields({
  nombre,
  set_nombre,
  paterno,
  set_paterno,
  materno,
  set_materno,
  email,
  set_email,
  email_read_only = false,
  email_hint,
  id_prefix = "profile",
}: PersonalIdentityFieldsProps) {
  const handle_uppercase =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (change_event: React.ChangeEvent<HTMLInputElement>) => {
      setter(change_event.target.value.toUpperCase());
    };

  const nombre_id = `${id_prefix}-nombre`;
  const paterno_id = `${id_prefix}-paterno`;
  const materno_id = `${id_prefix}-materno`;
  const email_id = `${id_prefix}-email`;

  return (
    <>
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={nombre_id} className="text-xs font-bold uppercase tracking-wider">
          NOMBRE(S) *
        </Label>
        <Input
          id={nombre_id}
          required
          value={nombre}
          onChange={handle_uppercase(set_nombre)}
          placeholder="Ej. ANA MARIA"
          className="uppercase"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={paterno_id} className="text-xs font-bold uppercase tracking-wider">
          APELLIDO PATERNO *
        </Label>
        <Input
          id={paterno_id}
          required
          value={paterno}
          onChange={handle_uppercase(set_paterno)}
          placeholder="LOPEZ"
          className="uppercase"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={materno_id} className="text-xs font-bold uppercase tracking-wider">
          APELLIDO MATERNO
        </Label>
        <Input
          id={materno_id}
          value={materno}
          onChange={handle_uppercase(set_materno)}
          placeholder="HERNANDEZ"
          className="uppercase"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={email_id} className="text-xs font-bold uppercase tracking-wider">
          {email_read_only ? "CORREO CORPORATIVO" : "CORREO CORPORATIVO *"}
        </Label>
        <div className="relative">
          <Mail className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            id={email_id}
            type="email"
            required={!email_read_only}
            disabled={email_read_only}
            value={email}
            onChange={(change_event) => set_email?.(change_event.target.value)}
            placeholder="correo@gmodelo.com.mx"
            className={
              email_read_only ? "pl-9 bg-muted/50 text-muted-foreground cursor-not-allowed" : "pl-9"
            }
          />
        </div>
        {email_hint}
      </div>
    </>
  );
}
