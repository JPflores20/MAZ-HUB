import {
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  limit,
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Rda } from "@/data/rda";
import {
  DocumentTooLargeError,
  FIRESTORE_SAFE_DOC_BYTES,
  estimateDocBytes,
  externalizeInlineMedia,
} from "@/services/inline-media";

const RDA_COLLECTION = "rdas";

export async function fetchRdas(maxLimit?: number): Promise<Rda[]> {
  try {
    const collectionRef = collection(db, RDA_COLLECTION);
    const fetchQuery = maxLimit ? query(collectionRef, limit(maxLimit)) : collectionRef;

    const snapshot = await getDocs(fetchQuery);
    return snapshot.docs.map((d) => d.data() as Rda);
  } catch (error) {
    console.error("[rda-service] Error al obtener RDAs:", error);
    return [];
  }
}

export function subscribeToRdas(onUpdate: (rdas: Rda[]) => void, maxLimit?: number): () => void {
  const collectionRef = collection(db, RDA_COLLECTION);
  const subscribeQuery = maxLimit ? query(collectionRef, limit(maxLimit)) : collectionRef;

  return onSnapshot(
    subscribeQuery,
    (snapshot) => {
      const rdas = snapshot.docs.map((d) => d.data() as Rda);
      onUpdate(rdas);
    },
    (error) => {
      console.error("[rda-service] Error en listener en tiempo real:", error);
    },
  );
}

export async function createRda(rda: Rda): Promise<void> {
  try {
    const docRef = doc(db, RDA_COLLECTION, rda.id);
    const cleanRda = JSON.parse(JSON.stringify(rda));
    await setDoc(docRef, cleanRda);
  } catch (error) {
    console.error("[rda-service] Error al crear RDA:", error);
    throw error;
  }
}

/**
 * Guarda el RDA completo.
 * - Sube a Storage cualquier evidencia embebida como base64 (evita el límite de 1 MiB).
 * - Actualiza `updatedAt`.
 * - Escribe el documento completo (sin `merge`) para que también se persistan
 *   los elementos que el usuario BORRÓ dentro de objetos anidados.
 * Devuelve el RDA tal como quedó guardado.
 */
export async function updateRda(rda: Rda): Promise<Rda> {
  try {
    const { value: withUrls } = await externalizeInlineMedia(rda, "rda_images");
    const cleanRda: Rda = JSON.parse(
      JSON.stringify({ ...withUrls, updatedAt: new Date().toISOString() }),
    );

    const bytes = estimateDocBytes(cleanRda);
    if (bytes > FIRESTORE_SAFE_DOC_BYTES) {
      throw new DocumentTooLargeError(bytes);
    }

    await setDoc(doc(db, RDA_COLLECTION, rda.id), cleanRda);
    return cleanRda;
  } catch (error) {
    console.error("[rda-service] Error al actualizar RDA:", error);
    throw error;
  }
}

export async function deleteRda(rdaId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, RDA_COLLECTION, rdaId));
  } catch (error) {
    console.error("[rda-service] Error al eliminar RDA:", error);
    throw error;
  }
}
