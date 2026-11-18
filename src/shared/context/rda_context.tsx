/**
 * rda_context.tsx
 * Contexto global de Reportes de Anomalía (RDA).
 * Gestiona la caché en memoria mediante React Query para minimizar lecturas a Firestore.
 */
import { type ReactNode, createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Rda } from "@/domain/models/rda";
import { useAuth } from "@/features/auth/auth_context";
import { fetch_rdas } from "@/shared/services/rda/rda_firestore_queries";

interface RdaContextValue {
  rdaList: Rda[];
  allRdas: Rda[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateRdaInCache: (saved_rda: Rda) => void;
  removeRdaFromCache: (rda_id: string) => void;
}

const RdaContext = createContext<RdaContextValue>({
  rdaList: [],
  allRdas: [],
  loading: true,
  refresh: async () => {},
  updateRdaInCache: () => {},
  removeRdaFromCache: () => {},
});

/**
 * Proveedor React de estado compartido para Reportes de Anomalía (RDA).
 *
 * @param props.children - Subárbol de componentes que consumirá `useRdas`.
 */
export function RdaProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const query_client = useQueryClient();

  const { data: raw_rdas = [], isLoading: is_loading } = useQuery({
    queryKey: ["rdas"],
    queryFn: () => fetch_rdas(),
    enabled: Boolean(currentUser),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const refresh = async () => {
    await query_client.invalidateQueries({ queryKey: ["rdas"] });
  };

  /**
   * Inserta o actualiza un RDA en la caché local de React Query tras un guardado exitoso.
   */
  const updateRdaInCache = (saved_rda: Rda) => {
    query_client.setQueryData<Rda[]>(["rdas"], (previous_rdas) => {
      if (!previous_rdas) return [saved_rda];
      const already_exists = previous_rdas.some(
        (existing_rda) => existing_rda.id === saved_rda.id,
      );
      if (already_exists) {
        return previous_rdas.map((existing_rda) =>
          existing_rda.id === saved_rda.id ? saved_rda : existing_rda,
        );
      }
      return [saved_rda, ...previous_rdas];
    });
  };

  /**
   * Elimina inmediatamente un RDA borrado de la caché en memoria.
   */
  const removeRdaFromCache = (rda_id: string) => {
    query_client.setQueryData<Rda[]>(["rdas"], (previous_rdas) =>
      previous_rdas ? previous_rdas.filter((existing_rda) => existing_rda.id !== rda_id) : [],
    );
  };

  const rda_list: Rda[] = currentUser ? raw_rdas : [];

  return (
    <RdaContext.Provider
      value={{
        rdaList: rda_list,
        allRdas: raw_rdas,
        loading: is_loading,
        refresh,
        updateRdaInCache,
        removeRdaFromCache,
      }}
    >
      {children}
    </RdaContext.Provider>
  );
}

/**
 * Devuelve los RDAs visibles para el usuario autenticado junto con acciones de caché.
 * Debe invocarse dentro de `<RdaProvider>`.
 *
 * @returns Estado y acciones del contexto RDA.
 */
export function useRdas(): RdaContextValue {
  return useContext(RdaContext);
}
