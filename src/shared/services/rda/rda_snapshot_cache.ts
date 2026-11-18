/**
 * rda_snapshot_cache.ts
 * Caché en memoria de documentos RDA y utilidad de timeout para evitar bloqueos
 * indefinidos de la UI cuando `persistentLocalCache` espera confirmación remota.
 */
import type { Rda } from "@/domain/models/rda";

export const RDA_COLLECTION = "rdas";
const WRITE_ACK_TIMEOUT_MS = 8000;

/** Mapa en memoria de `rda_id` → último snapshot conocido del RDA. */
export const rda_snapshot_cache = new Map<string, Rda>();

/**
 * Ejecuta una promesa de escritura en Firestore con un tiempo máximo de espera de red.
 * Con `persistentLocalCache` activo, el cambio ya queda persistido localmente en IndexedDB
 * aunque un proxy corporativo reinicie el canal antes del ACK remoto.
 *
 * @param write_promise - Promesa retornada por `setDoc` o `deleteDoc`.
 * @param timeout_ms - Límite en milisegundos antes de continuar sin bloquear la interfaz.
 */
export async function with_write_ack_timeout(
  write_promise: Promise<void>,
  timeout_ms = WRITE_ACK_TIMEOUT_MS,
): Promise<void> {
  let timeout_handle: ReturnType<typeof setTimeout> | undefined;
  const timeout_promise = new Promise<void>((resolve) => {
    timeout_handle = setTimeout(() => {
      console.warn(
        `[rda_snapshot_cache] La confirmación remota tardó más de ${timeout_ms}ms; el cambio quedó respaldado en la caché persistente de Firestore y se sincronizará en segundo plano.`,
      );
      resolve();
    }, timeout_ms);
  });

  try {
    await Promise.race([write_promise, timeout_promise]);
  } finally {
    if (timeout_handle) clearTimeout(timeout_handle);
  }
}
