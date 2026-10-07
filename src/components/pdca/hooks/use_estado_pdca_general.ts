import { useState } from "react";
import type { Phase, PdcaComment, PdcaHistoryEvent, ParticipantesData, Pdca } from "@/data/pdca";
import { DEFAULT_PARTICIPANTES } from "@/data/pdca";
import { parse_date_string } from "../utils/date_helpers";

export const use_estado_pdca_general = (
  pdcaInicial: Pdca,
  usuarioActual: { name?: string; email?: string } | null,
) => {
  const [pestañaActiva, setPestañaActiva] = useState<Phase>("Resumen");
  const [tituloProyecto, setTituloProyecto] = useState<string>(pdcaInicial.titulo || "");
  const [areaProyecto, setAreaProyecto] = useState<string>(pdcaInicial.area || "cocimientos");
  const [problemaDeclarado, setProblemaDeclarado] = useState<string>(pdcaInicial.problema || "");
  const [causaRaizIdentificada, setCausaRaizIdentificada] = useState<string>(pdcaInicial.causaRaiz || "");
  
  const [listaComentarios, setListaComentarios] = useState<PdcaComment[]>(
    pdcaInicial.comentarios || [],
  );
  const [historialEventos, setHistorialEventos] = useState<PdcaHistoryEvent[]>(
    pdcaInicial.historial || [],
  );
  const [pestañaInferiorActiva, setPestañaInferiorActiva] = useState<"comments" | "history">("comments");

  const [fechaLimite, setFechaLimite] = useState<Date | undefined>(() =>
    parse_date_string(pdcaInicial.fechaFinalizacion),
  );
  const [nombreAutor, setNombreAutor] = useState<string>(
    pdcaInicial.autor || usuarioActual?.name || "Usuario",
  );
  const [correoAutor, setCorreoAutor] = useState<string>(
    pdcaInicial.autorEmail || usuarioActual?.email || "",
  );
  const [usuariosAsignados, setUsuariosAsignados] = useState<{ name: string; email: string }[]>(
    pdcaInicial.asignados || [],
  );

  const [fasesCompletadas, setFasesCompletadas] = useState<Set<string>>(
    new Set(pdcaInicial.completedPhases || []),
  );
  const [pasosCompletados, setPasosCompletados] = useState<Set<string>>(
    new Set(pdcaInicial.completedSteps || pdcaInicial.completed_steps || []),
  );
  const [pasosNoAplica, setPasosNoAplica] = useState<Set<string>>(
    new Set(pdcaInicial.naSteps || pdcaInicial.na_steps || []),
  );
  
  const [miembrosEquipo, setMiembrosEquipo] = useState<string[]>(pdcaInicial.equipo || []);
  const [datosParticipantes, setDatosParticipantes] = useState<ParticipantesData>(
    pdcaInicial.participantes || DEFAULT_PARTICIPANTES,
  );

  return {
    pestañaActiva, setPestañaActiva,
    tituloProyecto, setTituloProyecto,
    areaProyecto, setAreaProyecto,
    problemaDeclarado, setProblemaDeclarado,
    causaRaizIdentificada, setCausaRaizIdentificada,
    listaComentarios, setListaComentarios,
    historialEventos, setHistorialEventos,
    pestañaInferiorActiva, setPestañaInferiorActiva,
    fechaLimite, setFechaLimite,
    nombreAutor, setNombreAutor,
    correoAutor, setCorreoAutor,
    usuariosAsignados, setUsuariosAsignados,
    fasesCompletadas, setFasesCompletadas,
    pasosCompletados, setPasosCompletados,
    pasosNoAplica, setPasosNoAplica,
    miembrosEquipo, setMiembrosEquipo,
    datosParticipantes, setDatosParticipantes
  };
};
