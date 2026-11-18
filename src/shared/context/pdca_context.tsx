/**
 * pdca_context.tsx
 * Contexto global de proyectos PDCA. Sincroniza la colección de Firestore mediante
 * React Query para compartir caché entre rutas y reducir lecturas redundantes.
 */
import { type ReactNode, createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Pdca } from "@/domain/pdca";
import { useAuth } from "@/features/auth/auth_context";
import { fetch_pdcas_from_firestore } from "@/shared/services/pdca/pdca_firestore_queries";

interface PdcaContextValue {
  pdcaList: Pdca[];
  allPdcas: Pdca[];
  loading: boolean;
  refresh: () => Promise<void>;
  updatePdcaInCache: (saved_pdca: Pdca) => void;
}

const PdcaContext = createContext<PdcaContextValue>({
  pdcaList: [],
  allPdcas: [],
  loading: true,
  refresh: async () => {},
  updatePdcaInCache: () => {},
});

/**
 * Proveedor React de estado compartido para proyectos PDCA de la planta.
 *
 * @param props.children - Subárbol de componentes que consumirá `usePdcas`.
 */
export function PdcaProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const query_client = useQueryClient();

  const { data: raw_pdcas = [], isLoading: is_loading } = useQuery({
    queryKey: ["pdcas"],
    queryFn: () => fetch_pdcas_from_firestore(), // Evita pasar el contexto de React Query como límite
    enabled: Boolean(currentUser),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const refresh = async () => {
    await query_client.invalidateQueries({ queryKey: ["pdcas"] });
  };

  /**
   * Inserta o actualiza un PDCA en la caché local de React Query sin re-consultar Firestore.
   */
  const updatePdcaInCache = (saved_pdca: Pdca) => {
    query_client.setQueryData<Pdca[]>(["pdcas"], (previous_pdcas) => {
      if (!previous_pdcas) return [saved_pdca];
      const already_exists = previous_pdcas.some(
        (existing_pdca) => existing_pdca.id === saved_pdca.id,
      );
      if (already_exists) {
        return previous_pdcas.map((existing_pdca) =>
          existing_pdca.id === saved_pdca.id ? saved_pdca : existing_pdca,
        );
      }
      return [saved_pdca, ...previous_pdcas];
    });
  };

  const pdca_list: Pdca[] = currentUser ? raw_pdcas : [];

  return (
    <PdcaContext.Provider
      value={{
        pdcaList: pdca_list,
        allPdcas: raw_pdcas,
        loading: is_loading,
        refresh,
        updatePdcaInCache,
      }}
    >
      {children}
    </PdcaContext.Provider>
  );
}

/**
 * Devuelve la lista de PDCAs visible para el usuario actual y utilidades de caché/recarga.
 * Debe invocarse dentro de `<PdcaProvider>`.
 *
 * @returns Estado y acciones del contexto PDCA.
 */
export function usePdcas(): PdcaContextValue {
  return useContext(PdcaContext);
}
