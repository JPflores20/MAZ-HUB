/**
 * @fileoverview Selectable recipient list for PDCA/RDA access request notifications.
 */

import type React from "react";
import { Check, Shield, UserCheck, UserPen } from "lucide-react";
import type { RecipientOption } from "./access_request_service";

interface AccessRequestRecipientsListProps {
  recipientOptions: RecipientOption[];
  selectedKeys: string[];
  onToggleRecipient: (recipientKey: string) => void;
}

const ROLE_BADGE_CLASS_BY_LABEL: Record<RecipientOption["roleLabel"], string> = {
  Creador: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  Responsable: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  Administrador: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
};

const ROLE_ICON_BY_LABEL: Record<RecipientOption["roleLabel"], React.ElementType> = {
  Creador: UserPen,
  Responsable: UserCheck,
  Administrador: Shield,
};

/**
 * Renders the scrollable checklist of creator, responsible, and admin approvers.
 *
 * @param {AccessRequestRecipientsListProps} props - Recipient options, selected keys, and toggle handler.
 * @returns {React.ReactElement} Scrollable recipient selector container.
 */
export const AccessRequestRecipientsList: React.FC<AccessRequestRecipientsListProps> = ({
  recipientOptions,
  selectedKeys,
  onToggleRecipient,
}) => (
  <div className="space-y-2">
    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
      Enviar solicitud a:
    </p>
    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
      {recipientOptions.map((recipient_option) => {
        const is_selected = selectedKeys.includes(recipient_option.key);
        const role_badge_classes = ROLE_BADGE_CLASS_BY_LABEL[recipient_option.roleLabel];
        const RoleIcon = ROLE_ICON_BY_LABEL[recipient_option.roleLabel];

        return (
          <button
            key={recipient_option.key}
            type="button"
            onClick={() => onToggleRecipient(recipient_option.key)}
            className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all cursor-pointer ${
              is_selected
                ? "border-primary bg-primary/10 text-foreground shadow-xs"
                : "border-border bg-background hover:bg-secondary/50 text-muted-foreground"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase text-foreground truncate">
                  {recipient_option.name}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${role_badge_classes}`}
                >
                  <RoleIcon className="size-2.5" />
                  {recipient_option.roleLabel}
                </span>
              </div>
              {recipient_option.email &&
                !recipient_option.email.endsWith("@colaborador.local") && (
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {recipient_option.email}
                  </p>
                )}
            </div>
            <div
              className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                is_selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/40"
              }`}
            >
              {is_selected && <Check className="size-3" />}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);
