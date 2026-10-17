/**
 * rda-service.ts
 * Servicio de persistencia en Firestore y Storage para el módulo RDA (creación, suscripción en tiempo real, actualización y borrado).
 */
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
import { generateNextRdaFolio } from "@/components/RDA/rda-name";

const RDA_COLLECTION = "rdas";
const rdaSnapshotCache = new Map<string, Rda>();

export async function fetchRdas(maxLimit?: number): Promise<Rda[]> {
  try {
    const collectionRef = collection(db, RDA_COLLECTION);
    const fetchQuery = maxLimit ? query(collectionRef, limit(maxLimit)) : collectionRef;

    const snapshot = await getDocs(fetchQuery);
    return snapshot.docs.map((d) => {
      const rda = d.data() as Rda;
      if (rda?.id) rdaSnapshotCache.set(rda.id, rda);
      return rda;
    });
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
      const rdas = snapshot.docs.map((d) => {
        const rda = d.data() as Rda;
        if (rda?.id) rdaSnapshotCache.set(rda.id, rda);
        return rda;
      });
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
    const cleanRda = JSON.parse(JSON.stringify(rda)) as Rda;
    if (!cleanRda.context?.folio?.trim()) {
      cleanRda.context = {
        ...cleanRda.context,
        folio: generateNextRdaFolio(Array.from(rdaSnapshotCache.values())),
      };
    }
    await setDoc(docRef, cleanRda);
    rdaSnapshotCache.set(rda.id, cleanRda);
  } catch (error) {
    console.error("[rda-service] Error al crear RDA:", error);
    throw error;
  }
}

/**
 * Guarda el RDA completo.
 * - Sube a Storage cualquier evidencia embebida como base64 (evita el límite de 1 MiB).
 * - Actualiza `updatedAt`.
 * - Notifica a los nuevos responsables asignados en el PDA (Paso 12).
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
    if (!cleanRda.context?.folio?.trim()) {
      cleanRda.context = {
        ...cleanRda.context,
        folio: generateNextRdaFolio(Array.from(rdaSnapshotCache.values())),
      };
    }

    const bytes = estimateDocBytes(cleanRda);
    if (bytes > FIRESTORE_SAFE_DOC_BYTES) {
      throw new DocumentTooLargeError(bytes);
    }

    // Detectar nuevas asignaciones de responsables en PDA (Paso 12) para enviar notificación
    const prevRda = rdaSnapshotCache.get(rda.id);
    const oldPda = prevRda?.pda || [];
    const newPda = cleanRda.pda || [];
    const rdaLabel = cleanRda.title || cleanRda.context?.folio || `RDA ${cleanRda.id}`;

    newPda.forEach((action) => {
      const oldAction = oldPda.find((a) => a.id === action.id);
      const currentResp = (action.responsable || action.who || "").trim();
      const oldResp = (oldAction?.responsable || oldAction?.who || "").trim();
      if (currentResp && currentResp !== oldResp) {
        import("firebase/firestore").then(({ addDoc }) => {
          addDoc(collection(db, "notifications"), {
            userId: currentResp,
            rdaId: cleanRda.id,
            pdcaTitle: `RDA: ${rdaLabel}`,
            actionId: action.id,
            message: `Has sido asignado como responsable en el PDA del RDA: ${action.accion || action.what || "Nueva Acción"}`,
            read: false,
            createdAt: new Date().toISOString(),
          }).catch((e) => console.error("[rda-service] Error creando notificación RDA:", e));
        });
      }
    });

    await setDoc(doc(db, RDA_COLLECTION, rda.id), cleanRda);
    rdaSnapshotCache.set(rda.id, cleanRda);
    return cleanRda;
  } catch (error) {
    console.error("[rda-service] Error al actualizar RDA:", error);
    throw error;
  }
}

export async function deleteRda(rdaId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, RDA_COLLECTION, rdaId));
    rdaSnapshotCache.delete(rdaId);
  } catch (error) {
    console.error("[rda-service] Error al eliminar RDA:", error);
    throw error;
  }
}
