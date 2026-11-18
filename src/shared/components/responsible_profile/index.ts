/**
 * index.ts
 * Exportación pública del sistema modular de perfiles y asignación de responsables.
 */
export type { DirectoryUser } from "@/features/auth/auth_context";
export type { ResponsibleInput } from "./responsible_types";
export { useDirectoryUsers } from "./use_directory_users";
export { ResponsiblePhotoModal } from "./responsible_photo_modal";
export { ResponsibleProfileCard } from "./responsible_profile_card";
export { ResponsibleSelectorItem } from "./responsible_selector_item";
export {
  ResponsibleAvatarStack,
  type ResponsibleAvatarStackProps,
} from "./responsible_avatar_stack";
