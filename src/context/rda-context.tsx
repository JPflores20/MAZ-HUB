/**
 * rda-context.tsx
 * Contexto global de Reportes de Anomalía (RDA).
 * Gestiona la caché en memoria mediante React Query para minimizar lecturas a Firestore
 * y proteger el plan gratuito de Firebase al navegar entre Dashboard y Mis RDAs.
 */
import { createContext, useContext, ReactNode } from "react";
import { fetchRdas } from "@/services/rda-service";
import type { Rda } from "@/data/rda";
import { doesAreaBelongToParentOrMatch } from "@/data/pdca-defaults";
import { useAuth } from "@/context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface RdaContextValue {
  rdaList: Rda[];
  allRdas: Rda[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateRdaInCache: (savedRda: Rda) => void;
  removeRdaFromCache: (rdaId: string) => void;
}

const RdaContext = createContext<RdaContextValue>({
  rdaList: [],
  allRdas: [],
  loading: true,
  refresh: async () => {},
  updateRdaInCache: () => {},
  removeRdaFromCache: () => {},
});

function getRdaResponsibles(rda: Rda): string[] {
  const fromContext = (rda.context?.responsable || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromContext.length > 0) return fromContext;
  return (rda.portada?.usuariosAsignados || []).map((s) => s.trim()).filter(Boolean);
}

export function RdaProvider({ children }: { children: ReactNode }) {
  const { currentUser, permissions } = useAuth();
  const queryClient = useQueryClient();

  const { data: rawRdas = [], isLoading } = useQuery({
    queryKey: ["rdas"],
    queryFn: () => fetchRdas(),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000, // 5 minutos sin re-leer Firestore al cambiar de pestaña
    gcTime: 30 * 60 * 1000,   // 30 minutos en memoria
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["rdas"] });
  };

  /**
   * Actualiza o inserta un RDA en la caché de React Query en memoria
   * para evitar re-leer toda la colección de Firestore tras cada guardado.
   */
  const updateRdaInCache = (savedRda: Rda) => {
    queryClient.setQueryData<Rda[]>(["rdas"], (prev) => {
      if (!prev) return [savedRda];
      const exists = prev.some((item) => item.id === savedRda.id);
      if (exists) {
        return prev.map((item) => (item.id === savedRda.id ? savedRda : item));
      }
      return [savedRda, ...prev];
    });
  };

  /**
   * Elimina un RDA de la caché en memoria sin necesidad de re-leer la colección.
   */
  const removeRdaFromCache = (rdaId: string) => {
    queryClient.setQueryData<Rda[]>(["rdas"], (prev) =>
      prev ? prev.filter((item) => item.id !== rdaId) : [],
    );
  };

  const normalizeStr = (val?: string) =>
    (val || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const rdaList: Rda[] = (() => {
    if (!currentUser) return [];
    // Por el momento todos los usuarios pueden ver todos los RDAs
    return rawRdas;
  })();

  return (
    <RdaContext.Provider
      value={{
        rdaList,
        allRdas: rawRdas,
        loading: isLoading,
        refresh,
        updateRdaInCache,
        removeRdaFromCache,
      }}
    >
      {children}
    </RdaContext.Provider>
  );
}

export function useRdas(): RdaContextValue {
  return useContext(RdaContext);
}
