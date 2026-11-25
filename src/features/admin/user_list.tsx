/**
 * @fileoverview Registered users administration container with role filtering, permissions, and workload.
 */

import type React from "react";
import type { UserProfile } from "@/features/auth/auth_context";
import { ResponsiblePhotoModal } from "@/shared/components/responsible_profile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { AdminUserFiltersBar } from "./admin_user_filters_bar";
import { AdminUserRow } from "./admin_user_row";
import { useAdminUserList } from "./use_admin_user_list";

interface UserListProps {
  users_list: UserProfile[];
  set_users_list?: React.Dispatch<React.SetStateAction<UserProfile[]>> | undefined;
}

const EMPTY_WORKLOAD = { activePdcas: 0, activeRdas: 0, pendingActions: 0 };

/** Displays searchable, role-filterable collaborator table for administrators. */
export function UserList({ users_list, set_users_list }: UserListProps) {
  const {
    merged_users,
    filtered_users,
    counts_by_role,
    available_areas,
    pending_corporate_count,
    workload_by_uid,
    sending_uid,
    approving_uid,
    is_bulk_approving,
    selected_photo_user,
    set_selected_photo_user,
    search_query,
    set_search_query,
    area_filter,
    set_area_filter,
    role_filter,
    set_role_filter,
    pending_only,
    set_pending_only,
    handle_edit_user,
    handle_role_change,
    handle_permission_toggle,
    handle_reset_permissions,
    handle_delete_user,
    handle_send_verification_link,
    handle_approve_user,
    handle_bulk_approve,
    handle_extend_intern_days,
  } = useAdminUserList(users_list, set_users_list);

  return (
    <div className="lg:col-span-2 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <AdminUserFiltersBar
        filtered_count={filtered_users.length}
        total_count={merged_users.length}
        pending_corporate_count={pending_corporate_count}
        is_bulk_approving={is_bulk_approving}
        on_bulk_approve={handle_bulk_approve}
        counts_by_role={counts_by_role}
        available_areas={available_areas}
        search_query={search_query}
        set_search_query={set_search_query}
        area_filter={area_filter}
        set_area_filter={set_area_filter}
        role_filter={role_filter}
        set_role_filter={set_role_filter}
        pending_only={pending_only}
        set_pending_only={set_pending_only}
      />

      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/80">
            <TableHead className="font-semibold text-foreground/80">NOMBRE</TableHead>
            <TableHead className="font-semibold text-foreground/80">ÁREA / PUESTO</TableHead>
            <TableHead className="font-semibold text-foreground/80">CARGA ACTIVA</TableHead>
            <TableHead className="w-60 font-semibold text-foreground/80">ROL Y PERMISOS</TableHead>
            <TableHead className="w-32 font-semibold text-foreground/80 text-center">
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
            filtered_users.map((user_entry) => (
              <AdminUserRow
                key={user_entry.uid}
                user_profile={user_entry}
                workload={workload_by_uid[user_entry.uid] || EMPTY_WORKLOAD}
                is_sending_link={sending_uid === user_entry.uid}
                is_approving={is_bulk_approving || approving_uid === user_entry.uid}
                on_open_photo={set_selected_photo_user}
                on_role_change={handle_role_change}
                on_permission_toggle={handle_permission_toggle}
                on_reset_permissions={handle_reset_permissions}
                on_send_verification_link={handle_send_verification_link}
                on_approve_user={handle_approve_user}
                on_extend_intern_days={handle_extend_intern_days}
                on_edit_user={handle_edit_user}
                on_delete_user={handle_delete_user}
              />
            ))
          )}
        </TableBody>
      </Table>

      {selected_photo_user && (
        <ResponsiblePhotoModal
          open={Boolean(selected_photo_user)}
          onOpenChange={(is_open) => !is_open && set_selected_photo_user(null)}
          user={selected_photo_user}
        />
      )}
    </div>
  );
}
