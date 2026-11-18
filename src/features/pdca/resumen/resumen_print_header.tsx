/**
 * @fileoverview Barra de acciones One-Pager, cabecera de impresión PDF y lista de responsables del Resumen PDCA.
 */
import React from "react";
import { Download, Maximize2, Minimize2, Users } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  ResponsibleProfileCard,
  useDirectoryUsers,
} from "@/shared/components/responsible_profile";

interface PropiedadesBarraResumen {
  modo_presentacion: boolean;
  al_alternar_presentacion: () => void;
  al_exportar_pdf: () => void;
  pdca_title?: string | undefined;
}

/**
 * Renderiza la barra superior de acciones (Presentación One-Pager y Exportar PDF).
 */
export const ResumenActionToolbar: React.FC<PropiedadesBarraResumen> = ({
  modo_presentacion,
  al_alternar_presentacion,
  al_exportar_pdf,
  pdca_title,
}) => (
  <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
    {modo_presentacion ? (
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold uppercase text-primary">
          Modo Presentación One-Pager
        </span>
        <h2 className="text-base font-bold text-foreground">{pdca_title}</h2>
      </div>
    ) : (
      <div />
    )}
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={al_alternar_presentacion}
        className="gap-2 h-9 text-xs font-semibold"
      >
        {modo_presentacion ? (
          <>
            <Minimize2 className="size-4" /> Salir de Presentación
          </>
        ) : (
          <>
            <Maximize2 className="size-4" /> Modo Presentación (One-Pager)
          </>
        )}
      </Button>
      <Button
        onClick={al_exportar_pdf}
        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9 text-xs shadow-sm font-semibold"
      >
        <Download className="size-4" />
        Exportar One-Pager (PDF)
      </Button>
    </div>
  </div>
);

/**
 * Muestra cabecera institucional al imprimir y tarjetas de responsables asignados al proyecto.
 */
export const ResumenCorporateAndTeamBanner: React.FC<{
  pdca_title?: string | undefined;
  document_identifier?: string | undefined;
  assigned_users?: { name: string; email: string }[] | undefined;
}> = ({ pdca_title, document_identifier, assigned_users }) => {
  const { resolve_user } = useDirectoryUsers();

  return (
    <>
      <div className="hidden print:flex items-center justify-between border-b-2 border-[#0078D7] pb-3 mb-2">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#0078D7]">
            Cervecería de Zacatecas • Grupo Modelo • AB InBev
          </span>
          <h1 className="text-xl font-bold text-gray-900 mt-1">
            {pdca_title || "Reporte Resumen de Proyecto PDCA"}
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Metodología de Solución de Problemas (PDCA - Plan, Do, Check, Act)
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="inline-block bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded font-bold">
            Folio: {document_identifier || "PDCA"}
          </div>
          <div className="text-[10px] text-gray-400">
            Fecha de emisión:{" "}
            {new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {(assigned_users ?? []).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-xs print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-3">
            <Users className="size-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Responsables del Proyecto
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {(assigned_users ?? []).map((usuario_asignado) => (
              <ResponsibleProfileCard
                key={usuario_asignado.email || usuario_asignado.name}
                user={resolve_user(usuario_asignado)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};
