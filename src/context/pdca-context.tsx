/**
 * pdca-context.tsx
 * Contexto global de proyectos PDCA. Sincroniza el estado en tiempo real con Firestore, caché local y operaciones CRUD.
 */
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
    if (currentUser.role === "admin" || permissions.canViewAll) return rawPdcas;
    const emailLower = (currentUser.email || "").trim().toLowerCase();
    const nameLower = (currentUser.name || "").trim().toLowerCase();
    const userAreaNorm = normalizeStr(currentUser.area);

    return rawPdcas.filter((p) => {
      if (
        permissions.canViewArea &&
        userAreaNorm &&
        userAreaNorm !== "usuario" &&
        normalizeStr(p.area) === userAreaNorm
      ) {
        return true;
      }

      const isAuthor =
        (Boolean(emailLower) && p.autorEmail?.trim().toLowerCase() === emailLower) ||
        (Boolean(nameLower) && p.autor?.trim().toLowerCase() === nameLower);

      // Si el PDCA no tiene asignados, usamos la lógica original
      if (!p.asignados || p.asignados.length === 0) {
        if (!p.autorEmail && !p.autor) return true;
        return isAuthor;
      }

      // Si tiene asignados, verificamos si el usuario actual está en la lista (por correo o nombre) o es el autor original
      const isAssigned = p.asignados.some(
        (a) =>
          (Boolean(emailLower) && a.email?.trim().toLowerCase() === emailLower) ||
          (Boolean(nameLower) && a.name?.trim().toLowerCase() === nameLower),
      );
      const isInTeam = p.equipo?.some((member) => member.trim().toLowerCase() === nameLower) ?? false;
      return isAssigned || isInTeam || isAuthor;
    });
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
