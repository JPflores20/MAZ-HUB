/**
 * user-list.tsx
 * Contenedor de gestión y visualización de la lista de usuarios registrados,
 * con separación por los 5 roles (Admin, Líder de Área, Usuario General, Becario, Visor),
 * personalización individual de permisos granulares y columna de Carga de Trabajo Activa.
 */
import { useState, useMemo } from "react";
import {
  Shield,
  User,
  Trash2,
  Pencil,
  ZoomIn,
  Search,
  FolderKanban,
  FileWarning,
  ClipboardList,
  GraduationCap,
  Briefcase,
  Eye,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { userService } from "@/services/user-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ResponsiblePhotoModal } from "@/components/ui/responsible-profile-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  ROLE_LABELS,
  ROLE_DESCRIPTIONS,
  ROLE_DEFAULT_PERMISSIONS,
  PERMISSION_METADATA,
  getEffectivePermissions,
  hasCustomPermissions,
  type UserRole,
  type UserProfile,
  type UserPermissions,
} from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { useRdas } from "@/context/rda-context";
import { getRdaStatus } from "@/components/RDA/rda-status";

interface UserListProps {
  users_list: UserProfile[];
  mock_users: UserProfile[];
  set_users_list?: React.Dispatch<React.SetStateAction<UserProfile[]>> | undefined;
}

const ROLE_FILTER_TABS: {
  id: "all" | UserRole;
  label: string;
  badgeClass: string;
}[] = [
  {
    id: "all",
    label: "Todos",
    badgeClass: "border-border bg-secondary/60 text-foreground",
  },
  {
    id: "admin",
    label: "Administradores",
    badgeClass:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  {
    id: "area_lead",
    label: "Líderes de Área",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  {
    id: "user",
    label: "Usuarios Generales",
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
  },
  {
    id: "intern",
    label: "Becarios / Practicantes",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  {
    id: "viewer",
    label: "Auditores / Visores",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
];

function userMatchesIdentifier(
  user: UserProfile,
  candidateName?: string,
  candidateEmail?: string,
): boolean {
  const uName = (user.name || "").trim().toLowerCase();
  const uEmail = (user.email || "").trim().toLowerCase();
  const cName = (candidateName || "").trim().toLowerCase();
  const cEmail = (candidateEmail || "").trim().toLowerCase();

  if (uEmail && cEmail && uEmail === cEmail) return true;
  if (!uName || !cName) return false;
  if (uName === cName) return true;

  const parts = cName
    .split(/[,;/]+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.some((p) => p === uName || uName.includes(p) || p.includes(uName));
}

export function UserList({ users_list, mock_users, set_users_list }: UserListProps) {
  const navigate = useNavigate();
  const { allPdcas } = usePdcas();
  const { allRdas } = useRdas();

  const base_users = users_list.length > 0 ? users_list : mock_users;
  const [role_overrides, set_role_overrides] = useState<Record<string, UserRole>>({});
  const [perm_overrides, set_perm_overrides] = useState<
    Record<string, Partial<UserPermissions>>
  >({});
  const [selected_photo_user, set_selected_photo_user] = useState<UserProfile | null>(null);

  // Filtros de búsqueda
  const [search_query, set_search_query] = useState("");
  const [area_filter, set_area_filter] = useState("all");
  const [role_filter, set_role_filter] = useState<"all" | UserRole>("all");

  const merged_users = useMemo(() => {
    return base_users.map((u) => {
      const overriddenRole = role_overrides[u.uid];
      const overriddenPerms = perm_overrides[u.uid];
      return {
        ...u,
        role: overriddenRole ?? u.role ?? "user",
        permissions: overriddenPerms ?? u.permissions,
      };
    });
  }, [base_users, role_overrides, perm_overrides]);

  // Conteo de usuarios por rol para las pestañas superiores
  const counts_by_role = useMemo(() => {
    const counts: Record<"all" | UserRole, number> = {
      all: merged_users.length,
      admin: 0,
      area_lead: 0,
      user: 0,
      intern: 0,
      viewer: 0,
    };
    for (const u of merged_users) {
      counts[u.role] = (counts[u.role] || 0) + 1;
    }
    return counts;
  }, [merged_users]);

  // Áreas disponibles para filtrar
  const available_areas = useMemo(() => {
    const set = new Set<string>();
    merged_users.forEach((u) => {
      if (u.area && u.area.trim()) {
        set.add(u.area.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  }, [merged_users]);

  // Cálculo en memoria de la carga de trabajo por usuario (0 lecturas extra a Firestore)
  const workload_by_uid = useMemo(() => {
    const map: Record<
      string,
      { activePdcas: number; activeRdas: number; pendingActions: number }
    > = {};

    for (const u of merged_users) {
      let activePdcas = 0;
      let activeRdas = 0;
      let pendingActions = 0;

      for (const p of allPdcas) {
        const isClosed = p.fase === "Act" && p.progreso === 100;
        const isAuthorOrAssigned =
          userMatchesIdentifier(u, p.autor, p.autorEmail) ||
          (p.asignados || []).some((a) => userMatchesIdentifier(u, a.name, a.email));

        if (!isClosed && isAuthorOrAssigned) {
          activePdcas++;
        }

        const actions = p.acciones || [];
        for (const act of actions) {
          if (
            act.status !== "Completada" &&
            userMatchesIdentifier(u, act.who || act.responsable)
          ) {
            pendingActions++;
          }
        }
      }

      for (const r of allRdas) {
        const status = getRdaStatus(r);
        const isAuthorOrAssigned =
          userMatchesIdentifier(u, r.portada?.autorOriginal, r.portada?.autorEmail) ||
          userMatchesIdentifier(u, r.context?.responsable) ||
          (r.portada?.usuariosAsignados || []).some((name) => userMatchesIdentifier(u, name));

        if (status === "Abierto" && isAuthorOrAssigned) {
          activeRdas++;
        }

        for (const act of r.validationActions || []) {
          if (act.estatus !== "Completa" && userMatchesIdentifier(u, act.responsable)) {
            pendingActions++;
          }
        }
        for (const act of r.pda || []) {
          if (
            act.status !== "Completada" &&
            userMatchesIdentifier(u, act.who || act.responsable)
          ) {
            pendingActions++;
          }
        }
      }

      map[u.uid] = { activePdcas, activeRdas, pendingActions };
    }

    return map;
  }, [merged_users, allPdcas, allRdas]);

  const filtered_users = useMemo(() => {
    const q = search_query.trim().toLowerCase();
    return merged_users.filter((u) => {
      const matchesQuery =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.area || "").toLowerCase().includes(q) ||
        (u.position || "").toLowerCase().includes(q);
      const matchesArea =
        area_filter === "all" ||
        (u.area || "").trim().toLowerCase() === area_filter.toLowerCase();
      const matchesRole = role_filter === "all" || u.role === role_filter;
      return matchesQuery && matchesArea && matchesRole;
    });
  }, [merged_users, search_query, area_filter, role_filter]);

  const handle_edit_user = (uid: string) => {
    navigate({ to: "/configuracion", search: { uid } as any });
  };

  const handle_role_change = async (uid: string, new_role: UserRole) => {
    const next_default_perms = { ...ROLE_DEFAULT_PERMISSIONS[new_role] };
    set_role_overrides((prev) => ({ ...prev, [uid]: new_role }));
    set_perm_overrides((prev) => ({ ...prev, [uid]: next_default_perms }));
    set_users_list?.((prev) =>
      prev.map((u) =>
        u.uid === uid ? { ...u, role: new_role, permissions: next_default_perms } : u,
      ),
    );

    try {
      await userService.updateUserRole(uid, new_role, next_default_perms);
      toast.success(`Rol cambiado a ${ROLE_LABELS[new_role]}.`);
    } catch (err: any) {
      console.error("Error al actualizar rol:", err);
      if (err?.code === "permission-denied" || err?.message?.includes("permissions")) {
        toast.warning(
          "Rol actualizado localmente, pero Firebase bloqueó el guardado en la nube por Reglas de Firestore.",
          { duration: 6000 },
        );
      } else {
        toast.error("Error al actualizar rol de usuario en la base de datos.");
      }
    }
  };

  const handle_permission_toggle = async (
    user: UserProfile,
    key: keyof Omit<UserPermissions, "canManageUsers">,
    checked: boolean,
  ) => {
    const currentEffective = getEffectivePermissions(user);
    const nextPerms: UserPermissions = {
      ...currentEffective,
      [key]: checked,
      canManageUsers: user.role === "admin",
    };

    set_perm_overrides((prev) => ({ ...prev, [user.uid]: nextPerms }));
    set_users_list?.((prev) =>
      prev.map((u) => (u.uid === user.uid ? { ...u, permissions: nextPerms } : u)),
    );

    try {
      await userService.updateUserPermissions(user.uid, nextPerms);
      toast.success(`Permisos de ${user.name} actualizados.`);
    } catch (err) {
      console.error("Error al actualizar permisos:", err);
      toast.error("No se pudieron guardar los permisos personalizados.");
    }
  };

  const handle_reset_permissions = async (user: UserProfile) => {
    const defaults = { ...ROLE_DEFAULT_PERMISSIONS[user.role] };
    set_perm_overrides((prev) => ({ ...prev, [user.uid]: defaults }));
    set_users_list?.((prev) =>
      prev.map((u) => (u.uid === user.uid ? { ...u, permissions: defaults } : u)),
    );

    try {
      await userService.updateUserPermissions(user.uid, defaults);
      toast.success(`Permisos de ${user.name} restablecidos a ${ROLE_LABELS[user.role]}.`);
    } catch (err) {
      console.error("Error al restablecer permisos:", err);
      toast.error("No se pudieron restablecer los permisos.");
    }
  };

  const handle_delete_user = async (uid: string, name: string) => {
    if (mock_users.find((u) => u.uid === uid) && users_list.length === 0) {
      toast.info("No se puede eliminar un usuario simulado de prueba local.");
      return;
    }

    try {
      await userService.deleteUser(uid);
      toast.success(`El usuario ${name} ha sido eliminado exitosamente.`);
    } catch (err: any) {
      console.error("Error al eliminar usuario:", err);
      if (err?.code === "permission-denied") {
        toast.error("No tienes permisos suficientes en Firestore para eliminar usuarios.");
      } else {
        toast.error("Error al eliminar el usuario en la base de datos.");
      }
    }
  };

  return (
    <div className="lg:col-span-2 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      {/* Cabecera, Pestañas de Rol y Filtros */}
      <div className="flex flex-col gap-3.5 border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold">
              Usuarios Registrados ({filtered_users.length} de {merged_users.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              Filtra por categoría de usuario o personaliza permisos individuales con el botón de ajustes
            </p>
          </div>
          {(search_query || area_filter !== "all" || role_filter !== "all") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                set_search_query("");
                set_area_filter("all");
                set_role_filter("all");
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Pestañas rápidas para separar usuarios por Rol (incluyendo Becarios) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_FILTER_TABS.map((tab) => {
            const active = role_filter === tab.id;
            const count = counts_by_role[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => set_role_filter(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? `${tab.badgeClass} ring-2 ring-primary/30 shadow-xs`
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-background/80 px-1.5 py-0 text-[10px] font-bold">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search_query}
              onChange={(e) => set_search_query(e.target.value)}
              placeholder="Buscar nombre, correo o puesto..."
              className="h-8 pl-8 text-xs"
            />
          </div>

          <select
            value={area_filter}
            onChange={(e) => set_area_filter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs ring-offset-background"
          >
            <option value="all">Todas las Áreas</option>
            {available_areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            value={role_filter}
            onChange={(e) => set_role_filter(e.target.value as "all" | UserRole)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs ring-offset-background"
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">{ROLE_LABELS.admin}</option>
            <option value="area_lead">{ROLE_LABELS.area_lead}</option>
            <option value="user">{ROLE_LABELS.user}</option>
            <option value="intern">{ROLE_LABELS.intern}</option>
            <option value="viewer">{ROLE_LABELS.viewer}</option>
          </select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/80">
            <TableHead className="font-semibold text-foreground/80">NOMBRE</TableHead>
            <TableHead className="font-semibold text-foreground/80">ÁREA / PUESTO</TableHead>
            <TableHead className="font-semibold text-foreground/80">CARGA ACTIVA</TableHead>
            <TableHead className="w-60 font-semibold text-foreground/80">
              ROL Y PERMISOS
            </TableHead>
            <TableHead className="w-24 font-semibold text-foreground/80 text-center">
              ACCIONES
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered_users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                No se encontraron usuarios con los filtros seleccionados.
              </TableCell>
            </TableRow>
          ) : (
            filtered_users.map((u) => {
              const workload = workload_by_uid[u.uid] || {
                activePdcas: 0,
                activeRdas: 0,
                pendingActions: 0,
              };
              const effectivePerms = getEffectivePermissions(u);
              const isCustomized = hasCustomPermissions(u);

              return (
                <TableRow key={u.uid} className="transition-colors hover:bg-secondary/30">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        title="Haz clic para expandir la foto"
                        onClick={() => set_selected_photo_user(u)}
                        className="group relative size-8 rounded-full overflow-hidden border border-primary/25 bg-primary/15 text-xs font-bold text-primary shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
                      >
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span>{u.name.charAt(0).toUpperCase()}</span>
                        )}
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="size-3" />
                        </span>
                      </button>
                      <div className="min-w-0">
                        <span className="block uppercase font-semibold text-xs truncate">
                          {u.name}
                        </span>
                        <span className="block text-[11px] text-muted-foreground truncate">
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-foreground/90">{u.area}</span>
                      {u.position && (
                        <span className="text-[10px] text-muted-foreground uppercase">
                          {u.position}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        title={`${workload.activePdcas} PDCAs activos`}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          workload.activePdcas > 0
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <FolderKanban className="size-3" />
                        {workload.activePdcas} PDCA
                      </span>
                      <span
                        title={`${workload.activeRdas} RDAs abiertos`}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          workload.activeRdas > 0
                            ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "border-border bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <FileWarning className="size-3" />
                        {workload.activeRdas} RDA
                      </span>
                      <span
                        title={`${workload.pendingActions} acciones pendientes`}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          workload.pendingActions > 0
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-border bg-secondary/40 text-muted-foreground"
                        }`}
                      >
                        <ClipboardList className="size-3" />
                        {workload.pendingActions} Acc.
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Select
                        value={u.role}
                        onValueChange={(v) => handle_role_change(u.uid, v as UserRole)}
                      >
                        <SelectTrigger className="h-8 w-44 text-xs font-semibold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                              <Shield className="size-3.5" /> Admin
                            </span>
                          </SelectItem>
                          <SelectItem value="area_lead">
                            <span className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
                              <Briefcase className="size-3.5" /> Líder de Área
                            </span>
                          </SelectItem>
                          <SelectItem value="user">
                            <span className="flex items-center gap-1.5">
                              <User className="size-3.5 text-primary" /> Usuario General
                            </span>
                          </SelectItem>
                          <SelectItem value="intern">
                            <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
                              <GraduationCap className="size-3.5" /> Becario
                            </span>
                          </SelectItem>
                          <SelectItem value="viewer">
                            <span className="flex items-center gap-1.5 font-semibold text-purple-600 dark:text-purple-400">
                              <Eye className="size-3.5" /> Visor (Lectura)
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Popover para personalizar permisos individuales del usuario */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant={isCustomized ? "default" : "outline"}
                            size="icon"
                            title={
                              isCustomized
                                ? "Permisos personalizados activos (clic para configurar)"
                                : "Personalizar permisos individuales"
                            }
                            className={`h-8 w-8 shrink-0 ${
                              isCustomized
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <SlidersHorizontal className="size-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 space-y-3" align="end">
                          <div className="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                            <div>
                              <p className="text-xs font-bold uppercase text-foreground">
                                {u.name}
                              </p>
                              <p className="text-[11px] font-semibold text-primary">
                                Rol: {ROLE_LABELS[u.role]}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {ROLE_DESCRIPTIONS[u.role]}
                              </p>
                            </div>
                            {isCustomized && (
                              <button
                                type="button"
                                onClick={() => void handle_reset_permissions(u)}
                                title="Restablecer a los permisos por defecto del rol"
                                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer shrink-0"
                              >
                                <RotateCcw className="size-2.5" />
                                Restablecer
                              </button>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Permisos Granulares Activos
                            </p>
                            {PERMISSION_METADATA.map((perm) => (
                              <label
                                key={perm.key}
                                className="flex items-start gap-2.5 rounded-lg border border-border/70 bg-secondary/20 p-2 cursor-pointer hover:border-primary/40 transition-colors"
                              >
                                <Checkbox
                                  checked={Boolean(effectivePerms[perm.key])}
                                  onCheckedChange={(checked) =>
                                    void handle_permission_toggle(u, perm.key, Boolean(checked))
                                  }
                                  className="mt-0.5"
                                />
                                <div className="leading-tight">
                                  <span className="block text-xs font-semibold text-foreground">
                                    {perm.label}
                                  </span>
                                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                                    {perm.description}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title={`Editar datos personales de ${u.name}`}
                        onClick={() => handle_edit_user(u.uid)}
                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={`Eliminar a ${u.name}`}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro que deseas eliminar a{" "}
                              <strong className="text-foreground">{u.name}</strong> del sistema? Esta
                              acción no se puede deshacer. Se le revocará el acceso inmediatamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handle_delete_user(u.uid, u.name)}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {selected_photo_user && (
        <ResponsiblePhotoModal
          open={!!selected_photo_user}
          onOpenChange={(open) => !open && set_selected_photo_user(null)}
          user={selected_photo_user}
        />
      )}
    </div>
  );
}
