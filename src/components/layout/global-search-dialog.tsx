/**
 * global-search-dialog.tsx
 * Buscador global instantáneo (Command Palette Ctrl+K) en el encabezado superior.
 * Busca en memoria (0 lecturas adicionales a Firestore) entre PDCAs, RDAs, Acciones y Usuarios.
 */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ClipboardList,
  ExternalLink,
  ListChecks,
  Lock,
  Search,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePdcas } from "@/context/pdca-context";
import { useRdas } from "@/context/rda-context";
import { useAuth } from "@/context/auth-context";
import { useDirectoryUsers } from "@/components/ui/responsible-profile-card";
import { getRdaDisplayName } from "@/components/RDA/rda-name";
import { getRdaStatus } from "@/components/RDA/rda-status";
import { canUserAccessPdca, canUserAccessRda } from "@/components/ui/access-request-dialog";

type SearchCategory = "ALL" | "PDCA" | "RDA" | "ACTION" | "USER";

interface SearchResultItem {
  id: string;
  category: "PDCA" | "RDA" | "ACTION" | "USER";
  title: string;
  subtitle: string;
  badgeText: string;
  restricted?: boolean | undefined;
  onSelect: () => void;
}

export function GlobalSearchDialog() {
  const navigate = useNavigate();
  const { currentUser, permissions } = useAuth();
  const { allPdcas } = usePdcas();
  const { allRdas } = useRdas();
  const { directory } = useDirectoryUsers();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("ALL");

  const isAdmin = currentUser?.role === "admin";

  // Atajo global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. PDCAs (Banco completo)
    allPdcas.forEach((p) => {
      const hasAccess = canUserAccessPdca(p, currentUser, permissions);
      items.push({
        id: `pdca-${p.id}`,
        category: "PDCA",
        title: p.titulo || `PDCA ${p.id}`,
        subtitle: `${p.id} • ${p.area || "Sin área"} • Autor: ${p.autor || "-"} • ${p.problema || ""}`,
        badgeText: hasAccess ? p.fase || "Plan" : "Solicitar permiso",
        restricted: !hasAccess,
        onSelect: () => {
          setOpen(false);
          try {
            sessionStorage.setItem("maz_hub_open_pdca_id", p.id);
          } catch {
            // ignore
          }
          void navigate({ to: "/" });
        },
      });

      // Acciones de PDCA
      (p.acciones || []).forEach((acc, idx) => {
        const desc = (acc.accion || acc.what || acc.tema || "").trim();
        if (!desc) return;
        items.push({
          id: `act-pdca-${p.id}-${acc.id || idx}`,
          category: "ACTION",
          title: desc,
          subtitle: `PDCA: ${p.titulo || p.id} • Resp: ${acc.responsable || acc.who || "Sin asignar"}`,
          badgeText: acc.done || acc.status === "Completada" ? "Completada" : "Acción PDCA",
          restricted: !hasAccess,
          onSelect: () => {
            setOpen(false);
            try {
              sessionStorage.setItem("maz_hub_open_pdca_id", p.id);
            } catch {
              // ignore
            }
            void navigate({ to: "/" });
          },
        });
      });
    });

    // 2. RDAs (Banco completo)
    allRdas.forEach((r) => {
      const hasAccess = canUserAccessRda(r, currentUser, permissions);
      const rdaTitle = getRdaDisplayName(r, `RDA ${r.id}`);
      const rdaStatus = getRdaStatus(r);
      items.push({
        id: `rda-${r.id}`,
        category: "RDA",
        title: rdaTitle,
        subtitle: `Folio: ${r.context?.folio || r.id} • ${r.context?.area || r.context?.planta || ""} • Equipo: ${r.context?.equiposAfectados || "-"}`,
        badgeText: hasAccess ? rdaStatus : "Solicitar permiso",
        restricted: !hasAccess,
        onSelect: () => {
          setOpen(false);
          try {
            sessionStorage.setItem("maz_hub_open_rda_id", r.id);
          } catch {
            // ignore
          }
          void navigate({ to: "/rda" });
        },
      });

      // Acciones de RDA (PDA)
      (r.pda || []).forEach((acc, idx) => {
        const desc = (acc.accion || acc.what || acc.tema || "").trim();
        if (!desc) return;
        items.push({
          id: `act-rda-${r.id}-${acc.id || idx}`,
          category: "ACTION",
          title: desc,
          subtitle: `RDA: ${rdaTitle} • Resp: ${acc.responsable || acc.who || "Sin asignar"}`,
          badgeText: acc.done || acc.status === "Completada" ? "Completada" : "PDA RDA",
          restricted: !hasAccess,
          onSelect: () => {
            setOpen(false);
            try {
              sessionStorage.setItem("maz_hub_open_rda_id", r.id);
            } catch {
              // ignore
            }
            void navigate({ to: "/rda" });
          },
        });
      });
    });

    // 3. Usuarios del directorio
    directory.forEach((u, idx) => {
      items.push({
        id: `user-${u.uid || u.email || idx}`,
        category: "USER",
        title: u.name,
        subtitle: `${u.email || "Sin correo"} • ${u.area || "Sin área"} ${u.position ? `• ${u.position}` : ""}`,
        badgeText: u.role === "admin" ? "Admin" : "Usuario",
        onSelect: () => {
          setOpen(false);
          if (isAdmin && u.uid) {
            void navigate({ to: "/configuracion", search: { uid: u.uid } as any });
          } else {
            void navigate({ to: "/dashboard" });
          }
        },
      });
    });

    return items;
  }, [allPdcas, allRdas, directory, currentUser, permissions, isAdmin, navigate]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allItems
      .filter((item) => {
        if (category !== "ALL" && item.category !== category) return false;
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.badgeText.toLowerCase().includes(q)
        );
      })
      .slice(0, 20);
  }, [allItems, query, category]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs text-blue-100/80 hover:text-white transition-all cursor-pointer"
        title="Buscador global rápido (Ctrl + K)"
      >
        <Search className="size-3.5 text-blue-300" />
        <span className="hidden lg:inline">Buscar PDCA, RDA, acción o usuario...</span>
        <span className="lg:hidden">Buscar...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/20 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-blue-200">
          Ctrl K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[640px] p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogTitle className="sr-only">Buscador Global MAZ HUB</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/30">
            <Search className="size-4 text-primary shrink-0" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe folio, título de PDCA/RDA, equipo, causa raíz, acción o usuario..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-8 text-sm px-1"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Pestañas de categoría */}
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-2 bg-secondary/20 overflow-x-auto">
            {(
              [
                { id: "ALL", label: "Todo" },
                { id: "PDCA", label: "PDCAs" },
                { id: "RDA", label: "RDAs" },
                { id: "ACTION", label: "Acciones" },
                { id: "USER", label: "Usuarios" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategory(tab.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                  category === tab.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Lista de resultados */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60 p-2">
            {filteredResults.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                No se encontraron coincidencias para "{query}".
              </div>
            ) : (
              filteredResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onSelect}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-secondary/60 transition-colors group cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {item.category === "PDCA" ? (
                        <ClipboardList className="size-4" />
                      ) : item.category === "RDA" ? (
                        <ShieldAlert className="size-4" />
                      ) : item.category === "ACTION" ? (
                        <ListChecks className="size-4" />
                      ) : (
                        <User className="size-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {item.restricted && (
                          <Lock className="size-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        item.restricted
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                          : ""
                      }`}
                    >
                      {item.badgeText}
                    </Badge>
                    {item.restricted ? (
                      <Lock className="size-3.5 text-amber-500" />
                    ) : (
                      <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
