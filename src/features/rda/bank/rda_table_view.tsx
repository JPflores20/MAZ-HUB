/**
 * @fileoverview Tabular view of registered RDA records with loading skeletons and empty state.
 */

import { useTranslation } from "react-i18next";
import type { Rda } from "@/domain/models/rda";
import type { DirectoryUser, UserPermissions, UserProfile } from "@/features/auth/auth_context";
import type { AccessRequestTarget } from "@/shared/components/access_request";
import type { ResponsibleInput } from "@/shared/components/responsible_profile";
import { Skeleton } from "@/shared/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { RdaTableRow } from "./rda_table_row";

interface RdaTableViewProps {
  filtered_rdas: Rda[];
  loading: boolean;
  current_user: UserProfile | null;
  permissions: UserPermissions;
  available_users: DirectoryUser[];
  resolve_user: (input: ResponsibleInput) => DirectoryUser;
  on_edit_rda: (rda_record: Rda) => void;
  on_request_access: (target: AccessRequestTarget) => void;
  on_request_delete: (rda_record: Rda) => void;
  on_toggle_responsible: (rda_record: Rda, person_name: string) => Promise<void>;
}

/** Renders the sortable/filterable RDA list table with skeletons while fetching. */
export function RdaTableView({
  filtered_rdas,
  loading,
  current_user,
  permissions,
  available_users,
  resolve_user,
  on_edit_rda,
  on_request_access,
  on_request_delete,
  on_toggle_responsible,
}: RdaTableViewProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/80 hover:bg-secondary/80 text-xs">
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.folio", "Folio")}
            </TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.title")}
            </TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.status")}
            </TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.plant")}
            </TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.responsible")}
            </TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.author")}
            </TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.deadline")}
            </TableHead>
            <TableHead className="font-semibold text-foreground/80">
              {t("rdaTable.update")}
            </TableHead>
            <TableHead className="text-right font-semibold text-foreground/80">
              {t("rdaTable.action")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_placeholder, skeleton_index) => (
              <TableRow key={skeleton_index} className="hover:bg-transparent">
                <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-8 w-[60px] ml-auto" /></TableCell>
              </TableRow>
            ))
          ) : filtered_rdas.length === 0 ? (
            <TableRow className="bg-secondary/80 hover:bg-secondary/80">
              <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                {t("rdaTable.noRdas")}
              </TableCell>
            </TableRow>
          ) : (
            filtered_rdas.map((rda_record) => (
              <RdaTableRow
                key={rda_record.id}
                rda_record={rda_record}
                current_user={current_user}
                permissions={permissions}
                available_users={available_users}
                resolve_user={resolve_user}
                on_edit_rda={on_edit_rda}
                on_request_access={on_request_access}
                on_request_delete={on_request_delete}
                on_toggle_responsible={on_toggle_responsible}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
