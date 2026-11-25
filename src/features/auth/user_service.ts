/**
 * @fileoverview Unified user service facade composing profile CRUD, directory streams, and admin callables.
 */

import type { UserPermissions } from "./auth_types";
import {
  admin_create_user,
  admin_delete_user,
  admin_sync_auth_users,
  admin_update_user_access,
  approve_access_request_callable,
  reject_access_request_callable,
  subscribe_to_all_users,
  sync_verified_profile,
  update_user_role_via_admin,
} from "./user_admin_service";
import { subscribe_to_user_directory } from "./user_directory_service";
import {
  create_user_profile,
  get_user_profile,
  mark_user_email_verified,
  record_verification_sent_timestamp,
  subscribe_to_own_user_profile,
  update_user_profile_fields,
} from "./user_profile_service";

export type * from "./auth_types";

export const user_service = {
  get_user: get_user_profile,
  subscribe_to_own_user: subscribe_to_own_user_profile,
  create_user: create_user_profile,
  admin_create_user,
  admin_update_user_access,
  update_user_role: update_user_role_via_admin,
  update_user_permissions: async (
    target_uid: string,
    next_permissions: Partial<UserPermissions>,
  ): Promise<void> => {
    await admin_update_user_access({ uid: target_uid, permissions: next_permissions });
  },
  update_user_profile: update_user_profile_fields,
  mark_user_verified: async (target_uid: string, verified_by_admin = false): Promise<void> => {
    if (verified_by_admin) {
      await admin_update_user_access({
        uid: target_uid,
        approved: true,
        verifiedByAdmin: true,
      });
      return;
    }
    await mark_user_email_verified(target_uid);
  },
  record_verification_sent: record_verification_sent_timestamp,
  sync_verified_profile,
  admin_sync_auth_users,
  delete_user: admin_delete_user,
  approve_access_request: approve_access_request_callable,
  reject_access_request: reject_access_request_callable,
  subscribe_to_user_directory,
  subscribe_to_users: subscribe_to_all_users,
};
