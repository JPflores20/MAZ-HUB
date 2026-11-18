/**
 * Inicialización centralizada del SDK de Firebase Admin para Cloud Functions v2.
 * Provee instancias compartidas de Firestore, Authentication y constantes de seguridad.
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

initializeApp();

/** Instancia de servidor de Firestore con privilegios administrativos. */
export const firestore_db = getFirestore();

/** Instancia de servidor de Firebase Authentication para gestionar cuentas y claims. */
export const firebase_auth = getAuth();

/** Helper de valores de servidor de Firestore (borrado de campos, marcas de tiempo). */
export const firestore_field_value = FieldValue;

/** Indica si se exige token válido de Firebase App Check en las funciones invocables. */
export const enforce_app_check = process.env["ENFORCE_APP_CHECK"] === "true";
