import { createContext, useContext, ReactNode } from "react";
import { fetchPdcasFromFirestore } from "@/services/pdca-service";
import { type Pdca } from "@/data/pdca";
import { useAuth } from "@/context/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface PdcaContextValue {
  pdcaList: Pdca[];
  allPdcas: Pdca[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const PdcaContext = createContext<PdcaContextValue>({
  pdcaList: [],
  allPdcas: [],
  loading: true,
  refresh: async () => {},
});

export function PdcaProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
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

  const pdcaList: Pdca[] = (() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return rawPdcas;
    const emailLower = currentUser.email.toLowerCase();
    return rawPdcas.filter((p) => {
      // Si el PDCA no tiene asignados, usamos la lógica original
      if (!p.asignados || p.asignados.length === 0) {
        if (!p.autorEmail) return true;
        return p.autorEmail.toLowerCase() === emailLower || p.autor === currentUser.name;
      }

      // Si tiene asignados, verificamos si el usuario actual está en la lista o es el autor original
      const isAssigned = p.asignados.some((a) => a.email.toLowerCase() === emailLower);
      const isAuthor = p.autorEmail?.toLowerCase() === emailLower || p.autor === currentUser.name;
      return isAssigned || isAuthor;
    });
  })();

  return (
    <PdcaContext.Provider value={{ pdcaList, allPdcas: rawPdcas, loading: isLoading, refresh }}>
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
