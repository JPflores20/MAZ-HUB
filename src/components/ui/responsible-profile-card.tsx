/**
 * responsible-profile-card.tsx
 * Componentes reutilizables para mostrar las tarjetas de usuarios responsables con su foto de perfil,
 * nombre completo, puesto y área, incluyendo visor modal (lightbox) al hacer clic sobre la fotografía
 * y pila compacta de avatares (ResponsibleAvatarStack) con desplegable al hacer clic.
 */
import React, { useState, useMemo } from "react";
import { Briefcase, Building2, Check, Plus, Search, UserPlus, X, ZoomIn } from "lucide-react";
import { useAuth, type DirectoryUser } from "@/context/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ResponsibleInput =
  | string
  | {
      uid?: string | undefined;
      name: string;
      email?: string | undefined;
      area?: string | undefined;
      position?: string | undefined;
      avatarUrl?: string | undefined;
    };

function getInitials(name: string): string {
  const parts = (name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return (parts[0]?.slice(0, 2) || "U").toUpperCase();
  return `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase();
}

/**
 * Hook que unifica el directorio de usuarios disponibles (Firestore + sesión actual + mocks)
 * y permite resolver cualquier nombre o correo a su perfil completo (foto, nombre, puesto, área).
 */
export function useDirectoryUsers(externalUsers?: DirectoryUser[]) {
  let authUsers: DirectoryUser[] = [];
  let mockUsers: DirectoryUser[] = [];
  let currentUser: DirectoryUser | null = null;

  try {
    const auth = useAuth();
    authUsers = auth.usersList || [];
    mockUsers = auth.mockUsers || [];
    currentUser = auth.currentUser;
  } catch {
    // En caso de renderizarse en tests unitarios sin AuthProvider
  }

  const directory = useMemo(() => {
    const map = new Map<string, DirectoryUser>();

    const register = (u?: Partial<DirectoryUser> | null) => {
      if (!u || !u.name) return;
      const key = u.name.trim().toUpperCase();
      const existing = map.get(key);
      map.set(key, {
        uid: u.uid || existing?.uid,
        name: u.name.trim(),
        email: u.email || existing?.email || "",
        area:
          u.area && u.area !== "Usuario"
            ? u.area
            : existing?.area && existing?.area !== "Usuario"
              ? existing.area
              : u.area || existing?.area || "",
        position: u.position || existing?.position || "",
        avatarUrl: u.avatarUrl || existing?.avatarUrl || "",
        role: u.role || existing?.role,
      });
    };

    for (const u of mockUsers) register(u);
    if (externalUsers) {
      for (const u of externalUsers) register(u);
    }
    for (const u of authUsers) register(u);
    if (currentUser) register(currentUser);

    return Array.from(map.values());
  }, [authUsers, mockUsers, currentUser, externalUsers]);

  const resolveUser = useMemo(() => {
    return (input: ResponsibleInput): DirectoryUser => {
      const rawName = typeof input === "string" ? input.trim() : (input.name || "").trim();
      const rawEmail = typeof input === "string" ? "" : (input.email || "").trim();

      const match = directory.find((u) => {
        if (rawEmail && u.email && u.email.toLowerCase() === rawEmail.toLowerCase()) {
          return true;
        }
        if (rawName && u.name.toLowerCase() === rawName.toLowerCase()) {
          return true;
        }
        if (rawName && u.email && u.email.toLowerCase() === rawName.toLowerCase()) {
          return true;
        }
        return false;
      });

      const resolvedArea =
        (typeof input === "object" && input.area ? input.area : match?.area) || "";
      const cleanArea = resolvedArea === "Usuario" ? "" : resolvedArea;

      return {
        uid: (typeof input === "object" ? input.uid : undefined) || match?.uid,
        name: match?.name || rawName || "USUARIO",
        email: match?.email || rawEmail || "",
        area: cleanArea,
        position:
          (typeof input === "object" && input.position ? input.position : match?.position) || "",
        avatarUrl:
          (typeof input === "object" && input.avatarUrl ? input.avatarUrl : match?.avatarUrl) || "",
      };
    };
  }, [directory]);

  return { directory, resolveUser };
}

interface ResponsiblePhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: DirectoryUser;
}

export const ResponsiblePhotoModal: React.FC<ResponsiblePhotoModalProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const displayArea = user.area && user.area !== "Usuario" ? user.area : "SIN ÁREA ASIGNADA";
  const displayPosition = user.position || "SIN PUESTO ASIGNADO";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="p-4 pb-2 border-b border-border bg-secondary/30">
          <DialogTitle className="text-sm font-bold uppercase tracking-wide text-foreground">
            {user.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fotografía y datos del responsable asignado
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 flex flex-col items-center gap-4">
          <div className="relative w-full flex items-center justify-center rounded-xl bg-muted/50 border border-border p-3 min-h-[260px] max-h-[65vh] overflow-hidden">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`Foto de ${user.name}`}
                className="max-h-[58vh] w-auto max-w-full rounded-lg object-contain shadow-md transition-transform"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
                <div className="flex size-28 items-center justify-center rounded-full bg-primary/10 text-primary text-3xl font-black border-2 border-primary/20 shadow-inner">
                  {getInitials(user.name)}
                </div>
                <span className="text-xs italic">Sin fotografía de perfil cargada</span>
              </div>
            )}
          </div>

          <div className="w-full rounded-xl border border-border bg-secondary/20 p-3.5 space-y-2">
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-wide text-foreground">
                {user.name}
              </p>
              {user.email && !user.email.endsWith("@colaborador.local") && (
                <p className="text-[11px] text-muted-foreground">{user.email}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
              <div className="rounded-lg bg-background/80 p-2 border border-border/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                  <Briefcase className="size-3 text-primary" />
                  Puesto
                </span>
                <span className="mt-0.5 block font-bold uppercase text-foreground text-[11px]">
                  {displayPosition}
                </span>
              </div>
              <div className="rounded-lg bg-background/80 p-2 border border-border/60 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                  <Building2 className="size-3 text-primary" />
                  Área
                </span>
                <span className="mt-0.5 block font-bold uppercase text-foreground text-[11px]">
                  {displayArea}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ResponsibleProfileCardProps {
  user: DirectoryUser;
  onRemove?: (() => void) | undefined;
  compact?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Tarjeta visual de un responsable asignado.
 * Muestra su foto (que al darle clic se expande en un modal), nombre, puesto y área.
 */
export const ResponsibleProfileCard: React.FC<ResponsibleProfileCardProps> = ({
  user,
  onRemove,
  compact = false,
  className,
}) => {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);

  const displayPosition = user.position || "SIN PUESTO";
  const displayArea = user.area && user.area !== "Usuario" ? user.area : "SIN ÁREA";

  return (
    <>
      <div
        className={cn(
          "group relative inline-flex items-center gap-2.5 rounded-xl border border-border bg-card text-card-foreground shadow-xs transition-all hover:border-primary/40 hover:shadow-sm",
          compact ? "px-2 py-1.5" : "px-3 py-2",
          className,
        )}
      >
        {/* Foto del responsable (clic para expandir) */}
        <button
          type="button"
          title="Haz clic para expandir la foto"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsPhotoOpen(true);
          }}
          className={cn(
            "relative shrink-0 rounded-full overflow-hidden border-2 border-primary/25 bg-primary/10 text-primary font-bold flex items-center justify-center cursor-pointer transition-transform hover:scale-105 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40",
            compact ? "size-8 text-[10px]" : "size-10 text-xs",
          )}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="size-full object-cover"
            />
          ) : (
            <span>{getInitials(user.name)}</span>
          )}
          <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <ZoomIn className={compact ? "size-3" : "size-3.5"} />
          </span>
        </button>

        {/* Datos: Nombre, Puesto y Área */}
        <div className="min-w-0 flex-1 text-left leading-tight">
          <p
            className={cn(
              "font-bold uppercase tracking-tight text-foreground truncate",
              compact ? "text-[11px] max-w-[175px]" : "text-xs max-w-[220px]",
            )}
            title={user.name}
          >
            {user.name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1">
            <Badge
              variant="secondary"
              className={cn(
                "font-semibold uppercase tracking-wide px-1.5 py-0 h-4 bg-primary/10 text-primary border-none",
                compact ? "text-[9px]" : "text-[10px]",
              )}
            >
              {displayPosition}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "font-medium uppercase tracking-wide px-1.5 py-0 h-4 text-muted-foreground border-border",
                compact ? "text-[9px]" : "text-[10px]",
              )}
            >
              {displayArea}
            </Badge>
          </div>
        </div>

        {/* Botón opcional para desasignar */}
        {onRemove && (
          <button
            type="button"
            title="Quitar responsable"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            className="ml-0.5 rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer shrink-0"
          >
            <X className={compact ? "size-3" : "size-3.5"} />
          </button>
        )}
      </div>

      <ResponsiblePhotoModal
        open={isPhotoOpen}
        onOpenChange={setIsPhotoOpen}
        user={user}
      />
    </>
  );
};

interface ResponsibleSelectorItemProps {
  user: DirectoryUser;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Fila de usuario dentro del Popover de selección de múltiples responsables.
 * Muestra la foto (con clic para expandir), nombre, puesto y área.
 */
export const ResponsibleSelectorItem: React.FC<ResponsibleSelectorItemProps> = ({
  user,
  selected,
  onToggle,
}) => {
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const displayPosition = user.position || "SIN PUESTO";
  const displayArea = user.area && user.area !== "Usuario" ? user.area : "SIN ÁREA";

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer border",
          selected
            ? "bg-primary/10 border-primary/30 text-primary font-semibold"
            : "border-transparent hover:bg-muted text-foreground",
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            title="Ver foto en grande"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsPhotoOpen(true);
            }}
            className="relative group/avatar size-8 shrink-0 rounded-full overflow-hidden border border-primary/30 bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="size-full object-cover" />
            ) : (
              <span>{getInitials(user.name)}</span>
            )}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ZoomIn className="size-3" />
            </span>
          </button>

          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate font-bold uppercase text-[11px] text-foreground">
              {user.name}
            </p>
            <p className="truncate text-[10px] text-muted-foreground font-medium uppercase mt-0.5">
              {displayPosition} • {displayArea}
            </p>
          </div>
        </div>

        {selected && <Check className="size-4 shrink-0 text-primary" />}
      </div>

      <ResponsiblePhotoModal
        open={isPhotoOpen}
        onOpenChange={setIsPhotoOpen}
        user={user}
      />
    </>
  );
};

export interface ResponsibleAvatarStackProps {
  /** Lista de responsables actualmente asignados (ya resueltos con resolveUser) */
  assignedUsers: DirectoryUser[];
  /** Directorio completo de usuarios disponibles para asignar/quitar */
  availableUsers?: DirectoryUser[] | undefined;
  /** Función para resolver cualquier usuario del directorio */
  resolveUser?: ((input: ResponsibleInput) => DirectoryUser) | undefined;
  /** Callback al seleccionar o deseleccionar un usuario del directorio */
  onToggleUser?: ((user: DirectoryUser) => void) | undefined;
  /** Callback al quitar un responsable desde la lista superior */
  onRemoveUser?: ((user: DirectoryUser, index: number) => void) | undefined;
  /** Callback para agregar un nombre personalizado manualmente */
  onAddCustomName?: ((name: string) => void) | undefined;
  /** Máximo de avatares apilados visibles antes de mostrar +N (por defecto 4) */
  maxVisible?: number | undefined;
  /** Tamaño de los avatares: 'sm' (para tarjetas Kanban) o 'md' (para tablas) */
  size?: "sm" | "md" | undefined;
  /** Etiqueta cuando no hay responsables asignados */
  emptyLabel?: string | undefined;
}

/**
 * Muestra únicamente las fotografías/avatares apilados de los responsables asignados.
 * Al hacer clic sobre el área apilada, despliega un Popover con la lista detallada de todos los
 * responsables (foto ampliable, nombre, puesto, área y botón de quitar) y el selector para asignar más.
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showDirectory, setShowDirectory] = useState(false);

  const canEdit = Boolean(onToggleUser || onRemoveUser || onAddCustomName);
  const visibleUsers = assignedUsers.slice(0, maxVisible);
  const extraCount = Math.max(0, assignedUsers.length - maxVisible);

  const avatarDim = size === "sm" ? "size-7 text-[10px]" : "size-8 text-[11px]";
  const overlapClass = size === "sm" ? "-space-x-2" : "-space-x-2.5";

  const filteredDirectory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return availableUsers
      .map((u) => (resolveUser ? resolveUser(u) : u))
      .filter((u) => {
        if (!q) return true;
        return (
          u.name.toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.area || "").toLowerCase().includes(q) ||
          (u.position || "").toLowerCase().includes(q)
        );
      });
  }, [availableUsers, resolveUser, searchQuery]);

  const handleAddCustom = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || !onAddCustomName) return;
    onAddCustomName(trimmed);
    setSearchQuery("");
  };

  if (assignedUsers.length === 0 && !canEdit) {
    return <span className="text-[11px] italic text-muted-foreground/70">{emptyLabel}</span>;
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center">
      <Popover
        onOpenChange={(open) => {
          if (!open) {
            setSearchQuery("");
            setShowDirectory(false);
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
              title={`Responsables (${assignedUsers.length}): ${assignedUsers.map((u) => u.name).join(", ")}. Haz clic para ver la lista completa.`}
              className="group inline-flex items-center rounded-full p-0.5 hover:bg-secondary/70 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className={cn("flex items-center", overlapClass)}>
                {visibleUsers.map((u, idx) => (
                  <div
                    key={`${u.email || u.name}-${idx}`}
                    style={{ zIndex: visibleUsers.length - idx }}
                    className={cn(
                      "relative shrink-0 rounded-full overflow-hidden ring-2 ring-card border border-primary/25 bg-primary/15 text-primary font-bold flex items-center justify-center shadow-xs transition-transform group-hover:scale-105",
                      avatarDim,
                    )}
                  >
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.name} className="size-full object-cover" />
                    ) : (
                      <span>{getInitials(u.name)}</span>
                    )}
                  </div>
                ))}

                {extraCount > 0 && (
                  <div
                    style={{ zIndex: 0 }}
                    className={cn(
                      "relative shrink-0 rounded-full ring-2 ring-card border border-border bg-secondary text-foreground font-bold flex items-center justify-center shadow-xs",
                      avatarDim,
                    )}
                  >
                    +{extraCount}
                  </div>
                )}

                {canEdit && (
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

        <PopoverContent
          className="w-80 sm:w-96 p-3.5 space-y-3 shadow-xl border-border"
          align="start"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Cabecera del desplegable */}
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
                onClick={() => setShowDirectory((prev) => !prev)}
                className="h-7 px-2.5 text-[11px] font-semibold gap-1"
              >
                <UserPlus className="size-3 text-primary" />
                {showDirectory ? "Ocultar directorio" : "Asignar más"}
              </Button>
            )}
          </div>

          {/* Lista detallada de responsables asignados */}
          {assignedUsers.length > 0 ? (
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-0.5">
              {assignedUsers.map((person, idx) => (
                <ResponsibleProfileCard
                  key={`${person.email || person.name}-${idx}`}
                  compact
                  user={person}
                  className="w-full"
                  onRemove={
                    onRemoveUser ? () => onRemoveUser(person, idx) : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <p className="py-2 text-center text-xs italic text-muted-foreground">
              Aún no hay responsables asignados a este registro.
            </p>
          )}

          {/* Selector de usuarios del directorio (siempre visible si hay 0 asignados o al pulsar "Asignar más") */}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                      }
                    }}
                    placeholder="Buscar o escribir nombre..."
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                {onAddCustomName && searchQuery.trim() && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleAddCustom}
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
                  {filteredDirectory.map((u) => {
                    const isSelected = assignedUsers.some(
                      (a) =>
                        (u.email && a.email && a.email.toLowerCase() === u.email.toLowerCase()) ||
                        a.name.toLowerCase() === u.name.toLowerCase(),
                    );
                    return (
                      <ResponsibleSelectorItem
                        key={u.email || u.name}
                        user={u}
                        selected={isSelected}
                        onToggle={() => onToggleUser(u)}
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
      </Popover>
    </div>
  );
};
