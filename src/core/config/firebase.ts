/**
 * Inicialización y configuración centralizada de los servicios de Firebase (App, Auth, Firestore, Storage y Functions).
 * Aplica App Check con Fraud Defense (reCAPTCHA Enterprise) cuando existe clave pública y conecta emuladores solo bajo bandera explícita.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";

interface BanderaGlobalFirebase {
  __APP_CHECK_INITIALIZED__?: boolean;
  __FIREBASE_EMULATORS_CONNECTED__?: boolean;
}

const configuracion_entorno = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"]?.trim() || "",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"]?.trim() || "",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"]?.trim() || "",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"]?.trim() || "",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"]?.trim() || "",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"]?.trim() || "",
};

/** Indica si todas las credenciales públicas `VITE_FIREBASE_*` están presentes en el entorno. */
export const is_firebase_configured = Boolean(
  configuracion_entorno.apiKey &&
    configuracion_entorno.authDomain &&
    configuracion_entorno.projectId &&
    configuracion_entorno.storageBucket &&
    configuracion_entorno.messagingSenderId &&
    configuracion_entorno.appId,
);

const es_entorno_pruebas =
  import.meta.env["MODE"] === "test" || Boolean(import.meta.env["VITEST"]);

if (!is_firebase_configured && !es_entorno_pruebas) {
  throw new Error(
    "Configuración de Firebase incompleta. Define todas las variables VITE_FIREBASE_* en el entorno.",
  );
}

const configuracion_firebase = is_firebase_configured
  ? configuracion_entorno
  : {
      apiKey: "test-api-key",
      authDomain: "localhost",
      projectId: "demo-test",
      storageBucket: "demo-test.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:000000000000",
    };

// Inicializar la aplicación principal (las cuentas de terceros se crean exclusivamente en Cloud Functions)
const aplicacion_principal = !getApps().length
  ? initializeApp(configuracion_firebase)
  : getApp();

/** Instancia de Firebase Authentication principal del cliente web. */
export const primary_auth = getAuth(aplicacion_principal);

// Habilitar caché offline nativo y forzar Long-Polling en navegador para evitar cortes de canal bajo proxies corporativos.
/** Instancia de Cloud Firestore configurada con persistencia multipestaña en navegador. */
export const db = initializeFirestore(
  aplicacion_principal,
  typeof window !== "undefined"
    ? {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
        experimentalForceLongPolling: true,
      }
    : {},
);

/** Instancia de Cloud Storage vinculada al proyecto Firebase activo. */
export const storage = getStorage(aplicacion_principal);

/** Instancia de Cloud Functions invocables desde el frontend. */
export const functions = getFunctions(aplicacion_principal);

/**
 * Inicializa Firebase App Check con Fraud Defense (reCAPTCHA Enterprise) una sola vez en navegador.
 * Debe invocarse tras completar la hidratación del DOM para evitar que React elimine el nodo oculto de reCAPTCHA.
 */
export function ensure_app_check_initialized(): void {
  if (typeof window === "undefined" || typeof document === "undefined" || !document.body) {
    return;
  }
  const clave_sitio_recaptcha = import.meta.env["VITE_FIREBASE_RECAPTCHA_SITE_KEY"]?.trim();
  const banderas_globales = globalThis as typeof globalThis & BanderaGlobalFirebase;

  if (clave_sitio_recaptcha && !banderas_globales.__APP_CHECK_INITIALIZED__) {
    banderas_globales.__APP_CHECK_INITIALIZED__ = true;
    initializeAppCheck(aplicacion_principal, {
      provider: new ReCaptchaEnterpriseProvider(clave_sitio_recaptcha),
      isTokenAutoRefreshEnabled: true,
    });
  }
}

if (typeof window !== "undefined") {
  const banderas_globales = globalThis as typeof globalThis & BanderaGlobalFirebase;

  if (
    import.meta.env["VITE_USE_FIREBASE_EMULATORS"] === "true" &&
    !banderas_globales.__FIREBASE_EMULATORS_CONNECTED__
  ) {
    banderas_globales.__FIREBASE_EMULATORS_CONNECTED__ = true;
    connectAuthEmulator(primary_auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectStorageEmulator(storage, "127.0.0.1", 9199);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  }
}
