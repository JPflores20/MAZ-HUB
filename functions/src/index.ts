/**
 * Punto de entrada oficial de Cloud Functions v2 para MAZ-HUB.
 * Re-exporta los triggers de Identity Platform, sincronización de perfiles y funciones invocables
 * respetando exactamente los nombres desplegados en Firebase.
 */
export {
  before_user_created_trigger as beforeusercreated,
  before_user_signed_in_trigger as beforeusersignedin,
} from "./auth/identity_triggers";

export { sync_user_profile_trigger as syncuserprofile } from "./users/sync_user_profile";
export { admin_create_user_callable as adminCreateUser } from "./users/admin_create_user";
export { admin_update_user_access_callable as adminUpdateUserAccess } from "./users/admin_update_user_access";
export { admin_delete_user_callable as adminDeleteUser } from "./users/admin_delete_user";
export { approve_access_request_callable as approveAccessRequest } from "./access_requests/approve_access_request";
export { reject_access_request_callable as rejectAccessRequest } from "./access_requests/reject_access_request";
