/**
 * pdca-context.tsx
 * Contexto global de proyectos PDCA. Sincroniza el estado en tiempo real con Firestore, caché local y operaciones CRUD.
 */
import { createContext, useContext, ReactNode } from "react";
import { fetchPdcasFromFirestore } from "@/services/pdca-service";
import { type Pdca, doesAreaBelongToParentOrMatch } from "@/data/pdca";
import { useAuth } from "@/auth/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PdcaContextValue {
  pdcaList: Pdca[];
  allPdcas: Pdca[];
  loading: boolean;
  refresh: () => Promise<void>;
  updatePdcaInCache: (savedPdca: Pdca) => void;
}

const PdcaContext = createContext<PdcaContextValue>({
  pdcaList: [],
  allPdcas: [],
  loading: true,
  refresh: async () => {},
  updatePdcaInCache: () => {},
});

export function PdcaProvider({ children }: { children: ReactNode }) {
  const { currentUser, permissions } = useAuth();
  const queryClient = useQueryClient();

  const { data: rawPdcas = [], isLoading } = useQuery({
    queryKey: ["pdcas"],
    queryFn: () => fetchPdcasFromFirestore(), // Do not pass React Query context as max_limit
    enabled: !!currentUser, // Only fetch if user is logged in
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes (no background fetch)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["pdcas"] });
  };

  /**
   * Actualiza o inserta un PDCA en la caché de React Query en memoria
   * para evitar re-leer toda la colección de Firestore tras cada guardado.
   */
  const updatePdcaInCache = (savedPdca: Pdca) => {
    queryClient.setQueryData<Pdca[]>(["pdcas"], (prev) => {
      if (!prev) return [savedPdca];
      const exists = prev.some((item) => item.id === savedPdca.id);
      if (exists) {
        return prev.map((item) => (item.id === savedPdca.id ? savedPdca : item));
      }
      return [savedPdca, ...prev];
    });
  };

  const normalizeStr = (val?: string) =>
    (val || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const pdcaList: Pdca[] = (() => {
    if (!currentUser) return [];
    // Por el momento todos los usuarios pueden ver todos los PDCAs
    return rawPdcas;
  })();

  return (
    <PdcaContext.Provider
      value={{ pdcaList, allPdcas: rawPdcas, loading: isLoading, refresh, updatePdcaInCache }}
    >
      {children}
    </PdcaContext.Provider>
  );
}

/**
 * Returns the PDCAs visible to the current user plus a loading flag.
 * Must be used inside a <PdcaProvider>.
 */
export function usePdcas(): PdcaContextValue {
  return useContext(PdcaContext);
}
