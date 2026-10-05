import React, { useState } from "react";
import type { ParetoItem } from "@/data/pdca";
import { ParetoInteractive } from "./pareto/pareto-interactive";

interface PropiedadesSeccionPareto {
  drillDowns: string[];
  setDrillDowns: (drills: string[]) => void;
  dataMap: Record<string, ParetoItem[]>;
  setDataMap: (mapa: Record<string, ParetoItem[]>) => void;
  unit?: string;
  onUnitChange?: (nuevaUnidad: string) => void;
  paretoTitles?: Record<string, string>;
  onParetoTitlesChange?: (titulos: Record<string, string>) => void;
  isStepCompleted?: boolean;
  isNa?: boolean;
  onToggleStep?: () => void;
  onToggleNa?: () => void;
  mainTitle?: string;
  secondaryTitlePrefix?: string;
}

export function ParetoSection({
  drillDowns: nivelesDesglose,
  setDrillDowns: asignarNivelesDesglose,
  dataMap: mapaDatosParetos,
  setDataMap: asignarMapaDatosParetos,
  unit: unidadMedida = "",
  onUnitChange: alCambiarUnidadMedida,
  paretoTitles: titulosParetosExternos,
  onParetoTitlesChange: alCambiarTitulosExternos,
  isStepCompleted: pasoEstaCompletado,
  isNa: pasoEsNoAplica,
  onToggleStep: alAlternarEstadoPaso,
  onToggleNa: alAlternarNoAplica,
  mainTitle: tituloPrincipalSeccion = "PASO 10: ESTRATIFICACIÓN DEL PROBLEMA (PARETO)",
  secondaryTitlePrefix: prefijoTitulosSecundarios = "PASO 10: PARETO INDEPENDIENTE",
}: PropiedadesSeccionPareto) {
  const [mapaTitulosInterno, asignarMapaTitulosInterno] = useState<Record<string, string>>({});
  const mapaTitulosFinal = titulosParetosExternos ?? mapaTitulosInterno;
  const manejadorCambioTitulos = alCambiarTitulosExternos ?? asignarMapaTitulosInterno;

  const llavesParetosRaiz = Object.keys(mapaDatosParetos)
    .filter((llaveFiltro) => llaveFiltro === "root" || llaveFiltro.startsWith("root-"))
    .sort();
  if (llavesParetosRaiz.length === 0) llavesParetosRaiz.push("root");

  const actualizarDatosEspecificos = (rutaPareto: string, nuevosDatosArray: ParetoItem[]) =>
    asignarMapaDatosParetos({ ...mapaDatosParetos, [rutaPareto]: nuevosDatosArray });

  const actualizarTituloEspecifico = (rutaPareto: string, nuevoTituloTexto: string) =>
    manejadorCambioTitulos({ ...mapaTitulosFinal, [rutaPareto]: nuevoTituloTexto });

  const manejarClicBarraGrafica = (categoriaClic: string, nivelAnidacion: number, idPadre: string) => {
    if (!categoriaClic) return;
    const nuevaRutaIdentificadora =
      idPadre === "root" ? `level-${nivelAnidacion + 1}-${categoriaClic}` : `${idPadre}-level-${nivelAnidacion + 1}-${categoriaClic}`;

    const primerNivelExistente = nivelesDesglose[0] ?? "";
    const esFormatoAntiguo = nivelesDesglose.length > 0 && !primerNivelExistente.includes("level-");

    const nivelesFormateados = esFormatoAntiguo ? nivelesDesglose.map((nivelItem, indiceLoop) => `level-${indiceLoop + 1}-${nivelItem}`) : [...nivelesDesglose];

    if (!nivelesFormateados.includes(nuevaRutaIdentificadora)) asignarNivelesDesglose([...nivelesFormateados, nuevaRutaIdentificadora]);

    const datosAnidadosActuales = mapaDatosParetos[nuevaRutaIdentificadora];
    if (!datosAnidadosActuales) asignarMapaDatosParetos({ ...mapaDatosParetos, [nuevaRutaIdentificadora]: [] });
  };

  const manejarCierreNivelDesglose = (rutaCierre: string) => {
    const primerNivelExistente = nivelesDesglose[0] ?? "";
    const esFormatoAntiguo = nivelesDesglose.length > 0 && !primerNivelExistente.includes("level-");

    const nivelesFormateados = esFormatoAntiguo ? nivelesDesglose.map((nivelItem, indiceLoop) => `level-${indiceLoop + 1}-${nivelItem}`) : [...nivelesDesglose];

    asignarNivelesDesglose(nivelesFormateados.filter((rutaFiltro) => rutaFiltro !== rutaCierre && !rutaFiltro.startsWith(`${rutaCierre}-`)));
    
    const mapaDatosCopia = { ...mapaDatosParetos };
    Object.keys(mapaDatosCopia).forEach((llaveMapa) => {
      if (llaveMapa === rutaCierre || llaveMapa.startsWith(`${rutaCierre}-`)) delete mapaDatosCopia[llaveMapa];
    });
    asignarMapaDatosParetos(mapaDatosCopia);
  };

  const manejarCierreParetoRaiz = (llaveCierre: string) => {
    asignarNivelesDesglose(nivelesDesglose.filter((rutaFiltro) => !rutaFiltro.startsWith(`${llaveCierre}-`)));
    const mapaDatosCopia = { ...mapaDatosParetos };
    Object.keys(mapaDatosCopia).forEach((llaveMapa) => {
      if (llaveMapa === llaveCierre || llaveMapa.startsWith(`${llaveCierre}-`)) delete mapaDatosCopia[llaveMapa];
    });
    asignarMapaDatosParetos(mapaDatosCopia);
  };

  const manejarCreacionParetoRaiz = () => asignarMapaDatosParetos({ ...mapaDatosParetos, [`root-${Date.now()}`]: [] });

  const analizarRutaNiveles = (rutaCompleta: string, indiceArray: number) => {
    if (!rutaCompleta.includes("level-"))
      return { rutaReal: `level-${indiceArray + 1}-${rutaCompleta}`, nivelProfundidad: indiceArray + 1, nombreCategoria: rutaCompleta };

    if (rutaCompleta.includes("-level-")) {
      const partesRuta = rutaCompleta.split("-level-");
      const parteNivelCategoria = partesRuta[1] ?? "";
      const fragmentosCategoria = parteNivelCategoria.split("-");
      const stringNivel = fragmentosCategoria[0] ?? "0";
      return { rutaReal: rutaCompleta, nivelProfundidad: parseInt(stringNivel, 10), nombreCategoria: fragmentosCategoria.slice(1).join("-") };
    }

    const fragmentosIniciales = rutaCompleta.split("-");
    const stringNivelBasico = fragmentosIniciales[1] ?? "0";
    return { rutaReal: rutaCompleta, nivelProfundidad: parseInt(stringNivelBasico, 10), nombreCategoria: fragmentosIniciales.slice(2).join("-") };
  };

  return (
    <div className="space-y-4">
      {llavesParetosRaiz.map((llaveIteracion, indiceRaiz) => (
        <ParetoInteractive
          key={llaveIteracion}
          title={indiceRaiz === 0 ? tituloPrincipalSeccion : `${prefijoTitulosSecundarios} ${indiceRaiz + 1}`}
          level={0}
          data={mapaDatosParetos[llaveIteracion] ?? []}
          onDataChange={(nuevosDatosGenerados) => actualizarDatosEspecificos(llaveIteracion, nuevosDatosGenerados)}
          onBarClick={(categoriaClickeada) => manejarClicBarraGrafica(categoriaClickeada, 0, llaveIteracion)}
          unit={unidadMedida}
          {...(indiceRaiz === 0 ? { onAddRoot: manejarCreacionParetoRaiz } : {})}
          {...(indiceRaiz > 0 ? { onClose: () => manejarCierreParetoRaiz(llaveIteracion) } : {})}
          {...(alCambiarUnidadMedida ? { onUnitChange: alCambiarUnidadMedida } : {})}
          {...(indiceRaiz === 0 && pasoEstaCompletado !== undefined ? { isStepCompleted: pasoEstaCompletado } : {})}
          {...(indiceRaiz === 0 && alAlternarEstadoPaso ? { onToggleStep: alAlternarEstadoPaso } : {})}
          chart_title={mapaTitulosFinal[llaveIteracion] ?? ""}
          on_chart_title_change={(textoCambiado) => actualizarTituloEspecifico(llaveIteracion, textoCambiado)}
        />
      ))}
      
      {nivelesDesglose.map((rutaDesglose, indiceDesglose) => {
        const { rutaReal, nivelProfundidad, nombreCategoria } = analizarRutaNiveles(rutaDesglose, indiceDesglose);
        return (
          <ParetoInteractive
            key={rutaReal}
            level={nivelProfundidad}
            title={`Sub-Pareto: ${nombreCategoria}`}
            subtitle={`Desglose (Nivel ${nivelProfundidad + 1}) de la categoria ${nombreCategoria}.`}
            data={mapaDatosParetos[rutaReal] ?? []}
            onDataChange={(nuevosDatosDesglose) => actualizarDatosEspecificos(rutaReal, nuevosDatosDesglose)}
            onBarClick={(categoriaDesglose) => manejarClicBarraGrafica(categoriaDesglose, nivelProfundidad, rutaReal)}
            onClose={() => manejarCierreNivelDesglose(rutaReal)}
            unit={unidadMedida}
            {...(alCambiarUnidadMedida ? { onUnitChange: alCambiarUnidadMedida } : {})}
            chart_title={mapaTitulosFinal[rutaReal] ?? ""}
            on_chart_title_change={(tituloCambiado) => actualizarTituloEspecifico(rutaReal, tituloCambiado)}
          />
        );
      })}
    </div>
  );
}

// force vite reload
