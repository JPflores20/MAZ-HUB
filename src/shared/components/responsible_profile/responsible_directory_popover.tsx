/**
 * responsible_directory_popover.tsx
 * Contenido del popover para listar, quitar o asignar nuevos responsables desde el directorio.
 */
import React from "react";
import { Plus, Search, UserPlus } from "lucide-react";
import type { DirectoryUser } from "@/features/auth/auth_context";
import { PopoverContent } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ResponsibleProfileCard } from "./responsible_profile_card";
import { ResponsibleSelectorItem } from "./responsible_selector_item";

interface ResponsibleDirectoryPopoverProps {
  assignedUsers: DirectoryUser[];
  filteredDirectory: DirectoryUser[];
  searchQuery: string;
  showDirectory: boolean;
  canEdit: boolean;
  onSearchQueryChange: (next_query: string) => void;
  onToggleDirectory: () => void;
  onAddCustom: () => void;
  onToggleUser?: ((directory_user: DirectoryUser) => void) | undefined;
  onRemoveUser?: ((directory_user: DirectoryUser, user_index: number) => void) | undefined;
  canAddCustomName: boolean;
}

/**
 * Despliega las tarjetas detalladas de responsables asignados y el buscador del directorio.
 *
 * @param props - Lista de asignados, directorio filtrado, búsqueda y callbacks de edición.
 * @returns Contenido `<PopoverContent />` para `ResponsibleAvatarStack`.
 */
export const ResponsibleDirectoryPopover: React.FC<ResponsibleDirectoryPopoverProps> = ({
  assignedUsers,
  filteredDirectory,
  searchQuery,
  showDirectory,
  canEdit,
  onSearchQueryChange,
  onToggleDirectory,
  onAddCustom,
  onToggleUser,
  onRemoveUser,
  canAddCustomName,
}) => (
  <PopoverContent
    className="w-80 sm:w-96 p-3.5 space-y-3 shadow-xl border-border"
    align="start"
    onClick={(click_event) => click_event.stopPropagation()}
  >
    <div className="flex items-center justify-between border-b border-border pb-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">
          Responsables Asignados ({assignedUsers.length})
        </p>
        <p className="text-[10px] text-muted-foreground">
          Haz clic en cualquier foto para ampliarla
        </p>
      </div>
      {canEdit && assignedUsers.length > 0 && (
        <Button
          type="button"
          variant={showDirectory ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleDirectory}
          className="h-7 px-2.5 text-[11px] font-semibold gap-1"
        >
          <UserPlus className="size-3 text-primary" />
          {showDirectory ? "Ocultar directorio" : "Asignar más"}
        </Button>
      )}
    </div>

    {assignedUsers.length > 0 ? (
      <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
        {assignedUsers.map((assigned_person, person_index) => (
          <ResponsibleProfileCard
            key={`${assigned_person.email || assigned_person.name}-${person_index}`}
            compact
            user={assigned_person}
            className="w-full"
            onRemove={
              onRemoveUser ? () => onRemoveUser(assigned_person, person_index) : undefined
            }
          />
        ))}
      </div>
    ) : (
      <p className="py-2 text-center text-xs italic text-muted-foreground">
        Aún no hay responsables asignados a este registro.
      </p>
    )}

    {canEdit && (assignedUsers.length === 0 || showDirectory) && (
      <div className="space-y-2 border-t border-border pt-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Seleccionar o agregar colaborador
        </p>

        <div className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(change_event) => onSearchQueryChange(change_event.target.value)}
              onKeyDown={(keyboard_event) => {
                if (keyboard_event.key === "Enter") {
                  keyboard_event.preventDefault();
                  onAddCustom();
                }
              }}
              placeholder="Buscar o escribir nombre..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          {canAddCustomName && searchQuery.trim() && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onAddCustom}
              title="Agregar nombre escrito"
              className="h-8 px-2.5 text-xs shrink-0 gap-1"
            >
              <Plus className="size-3.5" />
              Agregar
            </Button>
          )}
        </div>

        {onToggleUser && (
          <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
            {filteredDirectory.map((candidate_user) => {
              const is_selected = assignedUsers.some(
                (assigned_person) =>
                  (candidate_user.email &&
                    assigned_person.email &&
                    assigned_person.email.toLowerCase() === candidate_user.email.toLowerCase()) ||
                  assigned_person.name.toLowerCase() === candidate_user.name.toLowerCase(),
              );
              return (
                <ResponsibleSelectorItem
                  key={candidate_user.email || candidate_user.name}
                  user={candidate_user}
                  selected={is_selected}
                  onToggle={() => onToggleUser(candidate_user)}
                />
              );
            })}
            {filteredDirectory.length === 0 && (
              <p className="py-3 text-center text-[11px] text-muted-foreground">
                No coincide ningún usuario del directorio. Presiona{" "}
                <strong>Agregar</strong> para incluirlo.
              </p>
            )}
          </div>
        )}
      </div>
    )}
  </PopoverContent>
);
