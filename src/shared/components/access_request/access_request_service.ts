/**
 * @fileoverview Recipient resolution and Firestore notification dispatch for access requests.
 */

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/core/config/firebase";
import type { UserProfile } from "@/features/auth/auth_context";
import type { DirectoryUser, ResponsibleInput } from "@/shared/components/responsible_profile";
import { normalize_identity_string } from "./access_identity_helpers";
import type { AccessRequestTarget } from "./access_target_builders";

/** Selectable approver entry shown in the AccessRequestDialog recipient list. */
export interface RecipientOption {
  key: string;
  uid?: string | undefined;
  name: string;
  email?: string | undefined;
  roleLabel: "Creador" | "Responsable" | "Administrador";
}

/**
 * Builds deduplicated recipient candidates (Creator, Responsibles, Admins) for an access request.
 *
 * @param {AccessRequestTarget | null} access_target - Restricted document descriptor.
 * @param {DirectoryUser[]} user_directory - Loaded directory entries.
 * @param {(input_user: ResponsibleInput) => DirectoryUser} resolve_directory_user - Directory resolver helper.
 * @param {UserProfile | null} current_user - Signed-in requester excluded from self-approval.
 * @returns {RecipientOption[]} Ordered, deduplicated list of approver options.
 */
export function build_access_recipient_options(
  access_target: AccessRequestTarget | null,
  user_directory: DirectoryUser[],
  resolve_directory_user: (input_user: ResponsibleInput) => DirectoryUser,
  current_user: UserProfile | null,
): RecipientOption[] {
  if (!access_target) {
    return [];
  }
  const options_by_key = new Map<string, RecipientOption>();

  const register_candidate = (
    raw_name: string | undefined,
    raw_email: string | undefined,
    role_label: RecipientOption["roleLabel"],
  ) => {
    const clean_name = (raw_name || "").trim();
    if (!clean_name || clean_name === "-" || clean_name.toLowerCase() === "sin autor") {
      return;
    }
    const resolved_user = resolve_directory_user({ name: clean_name, email: raw_email });
    const display_name = resolved_user.name || clean_name;
    if (
      current_user &&
      normalize_identity_string(display_name) === normalize_identity_string(current_user.name)
    ) {
      return;
    }
    const normalized_key = normalize_identity_string(display_name);
    if (!options_by_key.has(normalized_key)) {
      options_by_key.set(normalized_key, {
        key: normalized_key,
        uid: resolved_user.uid,
        name: display_name,
        email: resolved_user.email || raw_email,
        roleLabel: role_label,
      });
    }
  };

  if (access_target.creatorName) {
    register_candidate(access_target.creatorName, access_target.creatorEmail, "Creador");
  }
  for (const responsible_entry of access_target.responsibles) {
    register_candidate(responsible_entry.name, responsible_entry.email, "Responsable");
  }
  for (const directory_entry of user_directory) {
    if (directory_entry.role === "admin") {
      register_candidate(directory_entry.name, directory_entry.email, "Administrador");
    }
  }

  if (options_by_key.size === 0) {
    options_by_key.set("admin-default", {
      key: "admin-default",
      name: "Administrador Global",
      roleLabel: "Administrador",
    });
  }

  return Array.from(options_by_key.values());
}

/**
 * Persists one Firestore access-request notification document per chosen approver.
 * Preserves schema fields validated by Firestore Security Rules (`senderUid`, `type`, `requesterUid`).
 *
 * @param {object} request_params - Dispatch arguments containing target, requester, recipients, and note.
 * @returns {Promise<void>} Resolves once all notification documents are written.
 */
export async function send_access_request_notifications(request_params: {
  target: AccessRequestTarget;
  current_user: UserProfile;
  chosen_recipients: RecipientOption[];
  custom_note: string;
}): Promise<void> {
  const { target, current_user, chosen_recipients, custom_note } = request_params;
  const trimmed_note = custom_note.trim();
  const note_suffix = trimmed_note ? ` — Motivo: "${trimmed_note}"` : "";
  const request_message = `${current_user.name} solicita permiso para ver el ${target.module} "${target.title}" (${target.folioOrCode})${note_suffix}`;
  const action_id = `access-req-${target.module}-${target.id}-${current_user.uid}`;
  const responsible_names = target.responsibles
    .map((responsible_entry) => responsible_entry.name)
    .filter(Boolean);
  const responsible_emails = target.responsibles
    .map((responsible_entry) => responsible_entry.email)
    .filter((candidate_email): candidate_email is string => Boolean(candidate_email))
    .map((candidate_email) => candidate_email.trim().toLowerCase());

  await Promise.all(
    chosen_recipients.map((recipient_entry) =>
      addDoc(collection(db, "notifications"), {
        userId: recipient_entry.name,
        recipientUid: recipient_entry.uid || "",
        recipientEmail: (recipient_entry.email || "").trim().toLowerCase(),
        recipientRole: recipient_entry.roleLabel,
        senderUid: current_user.uid,
        forAdmins: true,
        creatorName: target.creatorName || "",
        creatorEmail: (target.creatorEmail || "").trim().toLowerCase(),
        responsibleNames: responsible_names,
        responsibleEmails: responsible_emails,
        type: "access_request",
        module: target.module,
        folioOrCode: target.folioOrCode,
        ...(target.module === "PDCA" ? { pdcaId: target.id } : { rdaId: target.id }),
        pdcaTitle: `${target.module}: ${target.title}`,
        actionId: action_id,
        requesterUid: current_user.uid,
        requesterName: current_user.name,
        requesterEmail: current_user.email.trim().toLowerCase(),
        customNote: trimmed_note,
        message: request_message,
        read: false,
        approved: false,
        rejected: false,
        createdAt: new Date().toISOString(),
      }),
    ),
  );
}
