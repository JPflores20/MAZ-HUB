/**
 * @fileoverview Virtualized table container for the PDCA projects bank.
 */

import type React from "react";
import { useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTranslation } from "react-i18next";
import type { Pdca } from "@/domain/pdca";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import type { ResponsibleInput } from "@/shared/components/responsible_profile";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import type { TogglePdcaUserHandler } from "./pdca_table_actions";
import { PdcaVirtualTableRow } from "./pdca_virtual_table_row";

interface PdcaVirtualTableProps {
  rows: Pdca[];
  current_user: UserProfile | null;
  user_permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_select_pdca: (id: string) => void;
  on_request_delete: (click_event: React.MouseEvent, id: string) => void;
  on_deadline_change: (
    pdca_id: string,
    selected_date: Date | undefined,
    is_no_limit?: boolean,
  ) => Promise<void> | void;
  on_remove_deadline: (click_event: React.MouseEvent, pdca_id: string) => void;
  on_toggle_pdca_user: TogglePdcaUserHandler;
}

/** Virtualized PDCA table supporting large project lists without scroll lag. */
export function PdcaVirtualTable({
  rows,
  current_user,
  user_permissions,
  available_users,
  resolve_user,
  on_select_pdca,
  on_request_delete,
  on_deadline_change,
  on_remove_deadline,
  on_toggle_pdca_user,
}: PdcaVirtualTableProps) {
  const { t } = useTranslation();
  const scroll_parent_ref = useRef<HTMLDivElement>(null);
  const [deadline_picker_open_id, set_deadline_picker_open_id] = useState<string | null>(null);

  const row_virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scroll_parent_ref.current,
    estimateSize: () => 64,
    overscan: 5,
  });

  const virtual_items = row_virtualizer.getVirtualItems();

  return (
    <div ref={scroll_parent_ref} className="max-h-[600px] overflow-auto relative rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
          <TableRow className="bg-secondary/80 hover:bg-secondary/80">
            <TableHead className="font-semibold text-foreground/80">{t("table.projectTitle")}</TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.responsible", "RESPONSABLE")}
            </TableHead>
            <TableHead className="hidden sm:table-cell font-semibold text-foreground/80">
              {t("table.author")}
            </TableHead>
            <TableHead className="hidden md:table-cell font-semibold text-foreground/80">
              {t("table.area")}
            </TableHead>
            <TableHead className="w-32 font-semibold text-foreground/80">
              {t("table.currentPhase")}
            </TableHead>
            <TableHead className="hidden w-36 lg:table-cell font-semibold text-foreground/80">
              {t("table.deadline")}
            </TableHead>
            <TableHead className="hidden w-40 lg:table-cell font-semibold text-foreground/80">
              {t("table.updated")}
            </TableHead>
            <TableHead className="w-32 text-right font-semibold text-foreground/80">
              {t("table.action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {virtual_items.length > 0 && (
            <TableRow>
              <TableCell style={{ height: `${virtual_items[0]?.start || 0}px`, padding: 0 }} colSpan={8} />
            </TableRow>
          )}
          {virtual_items.map((virtual_item) => {
            const pdca_entry = rows[virtual_item.index];
            if (!pdca_entry) return null;
            return (
              <PdcaVirtualTableRow
                key={pdca_entry.id}
                pdca_entry={pdca_entry}
                virtual_index={virtual_item.index}
                measure_element={row_virtualizer.measureElement}
                current_user={current_user}
                user_permissions={user_permissions}
                available_users={available_users}
                resolve_user={resolve_user}
                is_deadline_picker_open={deadline_picker_open_id === pdca_entry.id}
                on_deadline_picker_open_change={(is_open) =>
                  set_deadline_picker_open_id(is_open ? pdca_entry.id : null)
                }
                on_select_pdca={on_select_pdca}
                on_request_delete={on_request_delete}
                on_deadline_change={on_deadline_change}
                on_remove_deadline={on_remove_deadline}
                on_toggle_pdca_user={on_toggle_pdca_user}
              />
            );
          })}
          {virtual_items.length > 0 && (
            <TableRow>
              <TableCell
                style={{
                  height: `${row_virtualizer.getTotalSize() - (virtual_items[virtual_items.length - 1]?.end || 0)}px`,
                  padding: 0,
                }}
                colSpan={7}
              />
            </TableRow>
          )}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                No hay PDCAs que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
