import type { ParetoItem } from "@/data/pdca";

export interface FilaPareto extends ParetoItem {
  porcentajeIndividual: number;
  porcentajeAcumulado: number;
}

export function construirDatosPareto(datosCrudos: ParetoItem[]): {
  listaOrdenada: ParetoItem[];
  gapTotal: number;
  filasPareto: FilaPareto[];
} {
  const datosSeguros = datosCrudos || [];
  const listaOrdenada = [...datosSeguros].sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0));
  const gapTotal = listaOrdenada.reduce((suma, item) => suma + (item.gap ?? 0), 0);

  let acumulado = 0;
  const filasPareto: FilaPareto[] = listaOrdenada.map((item) => {
    const gap = item.gap ?? 0;
    const porcentajeIndividual = gapTotal > 0 ? (gap / gapTotal) * 100 : 0;
    acumulado += porcentajeIndividual;
    return { ...item, porcentajeIndividual, porcentajeAcumulado: acumulado };
  });

  return { listaOrdenada, gapTotal, filasPareto };
}

export function formatearValorPareto(
  valor: number | undefined | null,
  unidadMedida?: string,
): string {
  if (valor === null || valor === undefined || isNaN(valor)) return "";
  const textoNumerico = Number(valor).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (unidadMedida === "$") return "$" + textoNumerico;
  return textoNumerico + (unidadMedida ? (unidadMedida === "%" ? "%" : " " + unidadMedida) : "");
}
