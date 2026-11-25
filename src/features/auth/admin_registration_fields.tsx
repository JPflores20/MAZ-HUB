/**
 * @fileoverview Presentational identity, email, password, area, and position inputs for admin user registration.
 */

import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { UserRole } from "./auth_types";

interface AdminRegistrationFieldsProps {
  user_name: string;
  set_user_name: (value: string) => void;
  user_email: string;
  set_user_email: (value: string) => void;
  user_password: string;
  set_user_password: (value: string) => void;
  show_password: boolean;
  on_toggle_password: () => void;
  user_role: UserRole;
  user_area: string;
  set_user_area: (value: string) => void;
  user_position: string;
  set_user_position: (value: string) => void;
}

/** Renders the core identity, email policy hint, optional password, and area/position fields. */
export function AdminRegistrationFields({
  user_name,
  set_user_name,
  user_email,
  set_user_email,
  user_password,
  set_user_password,
  show_password,
  on_toggle_password,
  user_role,
  user_area,
  set_user_area,
  user_position,
  set_user_position,
}: AdminRegistrationFieldsProps) {
  return (
    <>
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
          placeholder={
            user_role === "intern"
              ? "becario@gmail.com o correo corporativo"
              : "correo@gmodelo.com.mx o correo@ab-inbev.com"
          }
        />
        <p className="text-[10px] text-muted-foreground">
          {user_role === "intern" ? (
            <>
              Para <strong>Becario</strong> se permite correo externo (ej.{" "}
              <strong>@gmail.com</strong>) o corporativo.
            </>
          ) : (
            <>
              Debe terminar en <strong>@gmodelo.com.mx</strong> o <strong>@ab-inbev.com</strong>.
            </>
          )}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold">
          CONTRASEÑA TEMPORAL (OPCIONAL)
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={show_password ? "text" : "password"}
            value={user_password}
            onChange={(e) => set_user_password(e.target.value)}
            placeholder="Opcional: se enviará enlace para definir contraseña"
            className="pr-10"
          />
          <button
            type="button"
            onClick={on_toggle_password}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {show_password ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
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
    </>
  );
}
