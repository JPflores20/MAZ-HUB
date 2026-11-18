/**
 * @fileoverview Custom hook managing profile form state, change detection, WebP avatar upload, and saving.
 */

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { get_auth_error_info } from "@/features/auth/email_validation";
import { usePdcas } from "@/shared/context/pdca_context";
import {
  compress_avatar_image,
  compute_settings_initials,
  get_user_name_parts,
  is_axel_guillen_identity,
} from "./settings_utils";
import { useAdminTargetUser } from "./use_admin_target_user";

/** Coordinates personal/plant form fields, change tracking, and WebP avatar persistence. */
export function useProfileSettings() {
  const { allPdcas } = usePdcas();
  const file_input_ref = useRef<HTMLInputElement>(null);
  const {
    current_user,
    is_admin,
    available_users,
    target_user,
    is_editing_other_user,
    set_selected_uid,
    save_target_user_data,
  } = useAdminTargetUser();

  const initial_name_parts = useMemo(() => get_user_name_parts(target_user), [target_user]);

  const [nombre, set_nombre] = useState(initial_name_parts.nombre);
  const [paterno, set_paterno] = useState(initial_name_parts.paterno);
  const [materno, set_materno] = useState(initial_name_parts.materno);
  const [area, set_area] = useState(target_user?.area || "");
  const [position, set_position] = useState(target_user?.position || "");
  const [plant, set_plant] = useState(target_user?.plant || "Cervecería Zacatecas");
  const [phone, set_phone] = useState(target_user?.phone || "");
  const [bio, set_bio] = useState(target_user?.bio || "");
  const [avatar_url, set_avatar_url] = useState(target_user?.avatarUrl || "");
  const [is_saving_profile, set_is_saving_profile] = useState(false);

  useEffect(() => {
    if (!target_user) return;
    const next_parts = get_user_name_parts(target_user);
    set_nombre(next_parts.nombre);
    set_paterno(next_parts.paterno);
    set_materno(next_parts.materno);
    set_area(target_user.area || "");
    set_position(target_user.position || "");
    set_plant(target_user.plant || "Cervecería Zacatecas");
    set_phone(target_user.phone || "");
    set_bio(target_user.bio || "");
    set_avatar_url(target_user.avatarUrl || "");
  }, [target_user]);

  const full_name = useMemo(
    () => [nombre.trim(), paterno.trim(), materno.trim()].filter(Boolean).join(" ").toUpperCase(),
    [nombre, paterno, materno],
  );
  const is_axel_guillen = useMemo(
    () => is_axel_guillen_identity(full_name, target_user),
    [full_name, target_user],
  );
  const user_initials = useMemo(
    () => compute_settings_initials(full_name || target_user?.name || "U"),
    [full_name, target_user?.name],
  );

  const user_pdcas_count = useMemo(() => {
    if (!target_user) return 0;
    const email_lower = target_user.email.toLowerCase();
    return allPdcas.filter(
      (pdca_entry) =>
        pdca_entry.autorEmail?.toLowerCase() === email_lower ||
        pdca_entry.autor?.toLowerCase() === target_user.name.toLowerCase() ||
        pdca_entry.asignados?.some((assignee) => assignee.email.toLowerCase() === email_lower),
    ).length;
  }, [allPdcas, target_user]);

  const has_profile_changes = useMemo(() => {
    if (!target_user) return false;
    return (
      full_name !== (target_user.name || "").trim().toUpperCase() ||
      nombre.trim() !== initial_name_parts.nombre ||
      paterno.trim() !== initial_name_parts.paterno ||
      materno.trim() !== initial_name_parts.materno ||
      area.trim() !== (target_user.area || "") ||
      position.trim() !== (target_user.position || "") ||
      plant.trim() !== (target_user.plant || "Cervecería Zacatecas") ||
      phone.trim() !== (target_user.phone || "") ||
      bio.trim() !== (target_user.bio || "") ||
      avatar_url !== (target_user.avatarUrl || "")
    );
  }, [target_user, full_name, nombre, paterno, materno, initial_name_parts, area, position, plant, phone, bio, avatar_url]);

  const handle_avatar_file_change = async (change_event: React.ChangeEvent<HTMLInputElement>) => {
    const selected_file = change_event.target.files?.[0];
    if (!selected_file || !target_user) return;
    if (!selected_file.type.startsWith("image/") || selected_file.type === "image/svg+xml") {
      toast.error("Por favor selecciona una imagen válida (JPG, PNG, WebP).");
      return;
    }
    try {
      const { data_url, size_kb } = await compress_avatar_image(selected_file);
      set_avatar_url(data_url);
      await save_target_user_data({ avatarUrl: data_url });
      toast.success(
        is_editing_other_user
          ? `Foto de ${full_name || target_user.name} transformada a .webp (${size_kb} KB) y guardada.`
          : `Foto transformada a .webp (${size_kb} KB) y guardada en tu perfil.`,
      );
    } catch (caught_error: unknown) {
      toast.error(get_auth_error_info(caught_error).message || "No se pudo procesar la imagen.");
    } finally {
      if (file_input_ref.current) file_input_ref.current.value = "";
    }
  };

  const handle_save_profile = async (submit_event: React.FormEvent) => {
    submit_event.preventDefault();
    if (!nombre.trim() || !paterno.trim()) {
      toast.error("Por favor ingresa al menos Nombre(s) y Apellido Paterno.");
      return;
    }
    if (!area.trim()) {
      toast.error("Por favor indica el Área o Departamento.");
      return;
    }
    set_is_saving_profile(true);
    try {
      await save_target_user_data({
        name: full_name,
        firstName: nombre.trim().toUpperCase(),
        paternalLastName: paterno.trim().toUpperCase(),
        maternalLastName: materno.trim().toUpperCase(),
        area: area.trim(),
        position: position.trim(),
        plant: plant.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        avatarUrl: avatar_url,
      });
      toast.success(
        is_editing_other_user
          ? `Los datos personales de ${full_name} han sido actualizados correctamente.`
          : "Tus datos personales han sido actualizados correctamente.",
      );
    } catch (caught_error: unknown) {
      console.error("Error al guardar perfil:", caught_error);
      toast.error(
        get_auth_error_info(caught_error).message || "No se pudieron guardar los cambios en la nube.",
      );
    } finally {
      set_is_saving_profile(false);
    }
  };

  return {
    current_user,
    is_admin,
    available_users,
    target_user,
    is_editing_other_user,
    set_selected_uid,
    file_input_ref,
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
    avatar_url,
    set_avatar_url,
    full_name,
    is_axel_guillen,
    user_initials,
    user_pdcas_count,
    has_profile_changes,
    is_saving_profile,
    handle_avatar_file_change,
    handle_save_profile,
  };
}
