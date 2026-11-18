/**
 * @fileoverview Tab 1 Recharts dashboards for monthly tool usage, 12 SDCA pillars, top processes, and area split.
 */

import { Layers } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

const COLORES_GRAFICO = ["#0078D7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

interface PropiedadesTabGraficosUsabilidad {
  datos_serie_mensual: {
    mes_numero: number;
    etiqueta_mes: string;
    conteo_5w: number;
    conteo_rda_pdca: number;
    completos: number;
    en_proceso: number;
    total: number;
  }[];
  datos_pilares_sdca: {
    clave: string;
    nombre_corto: string;
    nombre_completo: string;
    cantidad: number;
  }[];
  datos_top_procesos: {
    nombre_proceso: string;
    conteo_5w: number;
    conteo_rda: number;
    total: number;
  }[];
  datos_pastel_area: { name: string; value: number }[];
}

/** Renders the four interactive usability charts for tool trends, SDCA closure, processes, and areas. */
export function TabGraficosUsabilidad({
  datos_serie_mensual,
  datos_pilares_sdca,
  datos_top_procesos,
  datos_pastel_area,
}: PropiedadesTabGraficosUsabilidad) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Evolución Mensual de Herramientas (5W vs RDA/PDCA)
            </CardTitle>
            <CardDescription>Cuenta mensual de análisis registrados en Elaboración</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datos_serie_mensual} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis dataKey="etiqueta_mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="conteo_5w" name="5W" stackId="a" fill="#0078D7" />
                <Bar
                  dataKey="conteo_rda_pdca"
                  name="RDA / PDCA"
                  stackId="a"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="size-4 text-blue-600" />
              Cierre de Ciclo por Herramienta SDCA (12 Pilares VPO)
            </CardTitle>
            <CardDescription>
              Frecuencia con la que cada pilar SDCA es utilizado para estandarizar
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos_pilares_sdca}
                layout="vertical"
                margin={{ top: 5, right: 25, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="nombre_corto" type="category" width={95} tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="cantidad" name="Activaciones SDCA" fill="#0078D7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Top 10 Procesos con Mayor Uso de Herramientas
            </CardTitle>
            <CardDescription>
              Estratificación de análisis 5W y RDA por etapa del proceso cervecero
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datos_top_procesos}
                margin={{ top: 10, right: 20, left: 0, bottom: 45 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis
                  dataKey="nombre_proceso"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip />
                <Legend verticalAlign="top" />
                <Bar dataKey="conteo_5w" name="5W" stackId="proc" fill="#2563eb" />
                <Bar
                  dataKey="conteo_rda"
                  name="RDA / PDCA"
                  stackId="proc"
                  fill="#059669"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Distribución por Área</CardTitle>
            <CardDescription>Proporción de análisis entre áreas operativas</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datos_pastel_area}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={88}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {datos_pastel_area.map((_segmento_area, indice) => (
                    <Cell key={indice} fill={COLORES_GRAFICO[indice % COLORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
