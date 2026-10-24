/**
 * tab_analisis_variables_charts.tsx
 * Pestaña 2 de Pre Incidentes Proceso: Gráficos de Top 12 Variables Afectadas
 * (Precursores vs Incidentes) y conteo de activaciones por cada criterio de la Matriz de Severidad.
 */
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PropiedadesTabAnalisisVariables {
  datos_top_variables_afectadas: {
    nombre_variable: string;
    precursores: number;
    incidentes: number;
    total: number;
  }[];
  datos_activacion_criterios: {
    etiqueta_criterio: string;
    puntos_criterio: number;
    cantidad_eventos: number;
  }[];
}

export function TabAnalisisVariablesCharts({
  datos_top_variables_afectadas,
  datos_activacion_criterios,
}: PropiedadesTabAnalisisVariables) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            Top 12 Variables Afectadas (Precursores vs Incidentes)
          </CardTitle>
          <CardDescription>
            Parámetros fisicoquímicos y operativos con mayor incidencia de
            desviaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={datos_top_variables_afectadas}
              layout="vertical"
              margin={{ top: 5, right: 25, left: 45, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="nombre_variable"
                type="category"
                width={130}
                tick={{ fontSize: 11 }}
              />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="precursores"
                name="Precursor"
                stackId="v"
                fill="#0078D7"
              />
              <Bar
                dataKey="incidentes"
                name="Incidente"
                stackId="v"
                fill="#e11d48"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            Activación de Criterios de la Matriz de Severidad
          </CardTitle>
          <CardDescription>
            Frecuencia con la que cada factor de riesgo se ha activado en los
            análisis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 pt-2">
            {datos_activacion_criterios.map((criterio) => (
              <div
                key={criterio.etiqueta_criterio}
                className="flex items-center justify-between p-3 rounded-xl border bg-muted/20"
              >
                <div>
                  <div className="font-semibold text-sm">
                    {criterio.etiqueta_criterio}
                  </div>
                  <Badge variant="outline" className="text-[10px] mt-0.5">
                    Peso: {criterio.puntos_criterio} pts
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                    {criterio.cantidad_eventos}
                  </span>
                  <div className="text-[11px] text-muted-foreground">eventos</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
