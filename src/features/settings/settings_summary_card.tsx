/**
 * @fileoverview Left-column user identity summary card with WebP avatar uploader and linked PDCA counter.
 */

import type React from "react";
import { Camera, FileText, Lock, Mail, MapPin, Phone, Shield, Trash2 } from "lucide-react";
import type { UserProfile } from "@/features/auth/auth_context";
import { ROLE_LABELS } from "@/features/auth/role_normalization";
import { Button } from "@/shared/ui/button";

interface SettingsSummaryCardProps {
  target_user: UserProfile;
  full_name: string;
  position: string;
  area: string;
  plant: string;
  phone: string;
  bio: string;
  avatar_url: string;
  user_initials: string;
  user_pdcas_count: number;
  file_input_ref: React.RefObject<HTMLInputElement | null>;
  on_avatar_change: (change_event: React.ChangeEvent<HTMLInputElement>) => void;
  on_clear_avatar: () => void;
}

/** Displays identity badge, photo controls, contact summary, and PDCA count. */
export function SettingsSummaryCard({
  target_user,
  full_name,
  position,
  area,
  plant,
  phone,
  bio,
  avatar_url,
  user_initials,
  user_pdcas_count,
  file_input_ref,
  on_avatar_change,
  on_clear_avatar,
}: SettingsSummaryCardProps) {
  return (
    <div className="lg:col-span-4 space-y-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="h-28 bg-gradient-to-r from-[#0a1428] via-[#13284c] to-[#0f1c38] relative">
          <div className="absolute right-4 top-4">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${
                target_user.role === "admin"
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                  : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
              }`}
            >
              <Shield className="size-3.5" />
              {ROLE_LABELS[target_user.role] || "Usuario General"}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="relative -mt-14 mb-4 flex items-end justify-between">
            <div className="relative group">
              {avatar_url ? (
                <img
                  src={avatar_url}
                  alt={full_name || target_user.name}
                  className="size-28 rounded-2xl object-cover border-4 border-card shadow-xl bg-secondary"
                />
              ) : (
                <div className="flex size-28 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-3xl font-bold text-white border-4 border-card shadow-xl">
                  {user_initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => file_input_ref.current?.click()}
                title="Cambiar foto de perfil"
                className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-card"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={file_input_ref}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={on_avatar_change}
              />
            </div>

            {avatar_url && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={on_clear_avatar}
                className="text-xs text-muted-foreground hover:text-destructive gap-1.5 h-8"
              >
                <Trash2 className="size-3.5" />
                Quitar foto
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground truncate uppercase">
              {full_name || target_user.name}
            </h2>
            <p className="text-sm font-medium text-primary">
              {position || "Integrante VPO"} · {area || target_user.area}
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
              {plant || "Cervecería Zacatecas"}
            </p>
          </div>

          {bio && (
            <p className="mt-4 text-xs text-muted-foreground bg-secondary/50 rounded-xl p-3 border border-border/60 leading-relaxed">
              {bio}
            </p>
          )}

          <div className="mt-6 pt-5 border-t border-border space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <Mail className="size-3.5" /> Correo
              </span>
              <span className="font-medium text-foreground truncate max-w-[200px]">
                {target_user.email}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <Lock className="size-3.5" /> Contraseña
              </span>
              <span className="text-[11px] text-muted-foreground italic">
                Protegida en Firebase Auth (ver Seguridad ↓)
              </span>
            </div>
            {phone && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="size-3.5" /> Contacto
                </span>
                <span className="font-medium text-foreground">{phone}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-2">
                <FileText className="size-3.5" /> Proyectos PDCA vinculados
              </span>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 font-bold text-primary">
                {user_pdcas_count}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
