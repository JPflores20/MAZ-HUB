/**
 * responsible_avatar_stack.tsx
 * Pila compacta de avatares de responsables con popover interactivo para asignar o quitar colaboradores.
 */
import React, { useMemo, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import type { DirectoryUser } from "@/features/auth/auth_context";
import { Popover, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/utils/class_names";
import { get_user_initials, type ResponsibleInput } from "./responsible_types";
import { ResponsibleDirectoryPopover } from "./responsible_directory_popover";

export interface ResponsibleAvatarStackProps {
  /** Lista de responsables actualmente asignados (ya resueltos con resolveUser) */
  assignedUsers: DirectoryUser[];
  /** Directorio completo de usuarios disponibles para asignar/quitar */
  availableUsers?: DirectoryUser[] | undefined;
  /** Función para resolver cualquier usuario del directorio */
  resolveUser?: ((input_user: ResponsibleInput) => DirectoryUser) | undefined;
  /** Callback al seleccionar o deseleccionar un usuario del directorio */
  onToggleUser?: ((directory_user: DirectoryUser) => void) | undefined;
  /** Callback al quitar un responsable desde la lista superior */
  onRemoveUser?: ((directory_user: DirectoryUser, user_index: number) => void) | undefined;
  /** Callback para agregar un nombre personalizado manualmente */
  onAddCustomName?: ((custom_name: string) => void) | undefined;
  /** Máximo de avatares apilados visibles antes de mostrar +N (por defecto 4) */
  maxVisible?: number | undefined;
  /** Tamaño de los avatares: `'sm'` (para tarjetas Kanban) o `'md'` (para tablas) */
  size?: "sm" | "md" | undefined;
  /** Etiqueta cuando no hay responsables asignados */
  emptyLabel?: string | undefined;
}

/**
 * Muestra únicamente las fotografías o iniciales apiladas de los responsables y despliega
 * un popover de inspección/edición al hacer clic.
 *
 * @param props - Propiedades de visualización y callbacks de edición de asignados.
 * @returns Pila de avatares interactiva o etiqueta vacía en modo solo lectura.
 */
export const ResponsibleAvatarStack: React.FC<ResponsibleAvatarStackProps> = ({
  assignedUsers,
  availableUsers = [],
  resolveUser,
  onToggleUser,
  onRemoveUser,
  onAddCustomName,
  maxVisible = 4,
  size = "md",
  emptyLabel = "Asignar...",
}) => {
  const [search_query, set_search_query] = useState("");
  const [show_directory, set_show_directory] = useState(false);

  const can_edit = Boolean(onToggleUser || onRemoveUser || onAddCustomName);
  const visible_users = assignedUsers.slice(0, maxVisible);
  const extra_count = Math.max(0, assignedUsers.length - maxVisible);

  const avatar_size_class = size === "sm" ? "size-7 text-[10px]" : "size-8 text-[11px]";
  const overlap_class = size === "sm" ? "-space-x-2" : "-space-x-2.5";

  const filtered_directory = useMemo(() => {
    const normalized_query = search_query.trim().toLowerCase();
    return availableUsers
      .map((candidate_user) => (resolveUser ? resolveUser(candidate_user) : candidate_user))
      .filter((resolved_user) => {
        if (!normalized_query) return true;
        return (
          resolved_user.name.toLowerCase().includes(normalized_query) ||
          (resolved_user.email || "").toLowerCase().includes(normalized_query) ||
          (resolved_user.area || "").toLowerCase().includes(normalized_query) ||
          (resolved_user.position || "").toLowerCase().includes(normalized_query)
        );
      });
  }, [availableUsers, resolveUser, search_query]);

  const handle_add_custom = () => {
    const trimmed_name = search_query.trim();
    if (!trimmed_name || !onAddCustomName) return;
    onAddCustomName(trimmed_name);
    set_search_query("");
  };

  if (assignedUsers.length === 0 && !can_edit) {
    return <span className="text-[11px] italic text-muted-foreground/70">{emptyLabel}</span>;
  }

  return (
    <div onClick={(click_event) => click_event.stopPropagation()} className="inline-flex items-center">
      <Popover
        onOpenChange={(is_open) => {
          if (!is_open) {
            set_search_query("");
            set_show_directory(false);
          }
        }}
      >
        <PopoverTrigger asChild>
          {assignedUsers.length === 0 ? (
            <button
              type="button"
              title="Haz clic para asignar responsables"
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border hover:border-primary/50 hover:bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground italic transition-colors cursor-pointer"
            >
              <UserPlus className="size-3.5 text-primary" />
              <span>{emptyLabel}</span>
            </button>
          ) : (
            <button
              type="button"
              title={`Responsables (${assignedUsers.length}): ${assignedUsers.map((assigned_user) => assigned_user.name).join(", ")}. Haz clic para ver la lista completa.`}
              className="group inline-flex items-center rounded-full p-0.5 hover:bg-secondary/70 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className={cn("flex items-center", overlap_class)}>
                {visible_users.map((assigned_user, user_index) => (
                  <div
                    key={`${assigned_user.email || assigned_user.name}-${user_index}`}
                    style={{ zIndex: visible_users.length - user_index }}
                    className={cn(
                      "relative shrink-0 rounded-full overflow-hidden ring-2 ring-card border border-primary/25 bg-primary/15 text-primary font-bold flex items-center justify-center shadow-xs transition-transform group-hover:scale-105",
                      avatar_size_class,
                    )}
                  >
                    {assigned_user.avatarUrl ? (
                      <img
                        src={assigned_user.avatarUrl}
                        alt={assigned_user.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <span>{get_user_initials(assigned_user.name)}</span>
                    )}
                  </div>
                ))}

                {extra_count > 0 && (
                  <div
                    style={{ zIndex: 0 }}
                    className={cn(
                      "relative shrink-0 rounded-full ring-2 ring-card border border-border bg-secondary text-foreground font-bold flex items-center justify-center shadow-xs",
                      avatar_size_class,
                    )}
                  >
                    +{extra_count}
                  </div>
                )}

                {can_edit && (
                  <div
                    style={{ zIndex: 0 }}
                    className={cn(
                      "relative shrink-0 rounded-full ring-2 ring-card border border-dashed border-primary/40 bg-primary/10 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary",
                      size === "sm" ? "size-6" : "size-7",
                    )}
                  >
                    <Plus className="size-3" />
                  </div>
                )}
              </div>
            </button>
          )}
        </PopoverTrigger>

        <ResponsibleDirectoryPopover
          assignedUsers={assignedUsers}
          filteredDirectory={filtered_directory}
          searchQuery={search_query}
          showDirectory={show_directory}
          canEdit={can_edit}
          onSearchQueryChange={set_search_query}
          onToggleDirectory={() => set_show_directory((previous_show) => !previous_show)}
          onAddCustom={handle_add_custom}
          onToggleUser={onToggleUser}
          onRemoveUser={onRemoveUser}
          canAddCustomName={Boolean(onAddCustomName)}
        />
      </Popover>
    </div>
  );
};
