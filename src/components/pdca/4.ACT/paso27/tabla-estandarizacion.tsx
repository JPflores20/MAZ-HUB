import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StepInstructions } from "../../step-instructions";
import type { TablaEstandarizacionItem } from "@/data/pdca";

interface TablaEstandarizacionProps {
  items: TablaEstandarizacionItem[];
  onChange: (items: TablaEstandarizacionItem[]) => void;
}

export const TablaEstandarizacion: React.FC<TablaEstandarizacionProps> = ({ items, onChange }) => {
  const handleAdd = () => {
    const newItem: TablaEstandarizacionItem = {
      id: crypto.randomUUID(),
      accionesMitigar: "",
      herramientaVpo: "",
      dueno: "",
      equipoComunicara: "",
      datosEntrenamiento: "",
      gopPresentacion: "",
      fechaFinalizacion: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, field: keyof TablaEstandarizacionItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Definir las acciones que se estandarizarÃ¡n y rellenar el grÃ¡fico.</li>
          <li>Rellene cada columna con informaciÃ³n detallada sobre la acciÃ³n elegida.</li>
          <li>
            La columna "Herramienta VPO" estÃ¡ pensada para ser rellenada con items como SOP, Checklists, planes y rutinas PM, SWIs, Checklist de ATO CIL, actualizaciones PTS, actualizaciones del mapa de procesos, actualizaciones del panel de control KPI/PI, creaciÃ³n/modificaciones de entrenamiento, actualizaciones SKAP, cambios en la rutina de reuniones, etc.
          </li>
          <li>
            La pestaÃ±a de Mapa de Problemas serÃ¡ Ãºtil como referencia para comprobar todos los pilares de los elementos que deben ser creados o actualizados como parte de la etapa de normalizaciÃ³n, ya que los mencionados aquÃ­ son sÃ³lo ejemplos de las muchas posibilidades.
          </li>
          <li>
            Nota: si la respuesta es "SÃ­" a la presentaciÃ³n del GOP/PrÃ¡ctica Ã³ptima, por favor introdÃºzcala en el Eureka! Buenas Ideas en el Portal Global de VPO
          </li>
        </ol>
      </StepInstructions>

      <div className="flex items-center justify-end">
        <Button onClick={handleAdd} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> Agregar Fila
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[1000px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">ACCIONES PARA MITIGAR EL RIESGO o MANTENER LA GANANCIA</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">HERRAMIENTA VPO</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">DUEÃ‘O</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">EQUIPO QUE SE COMUNICARÃ/ENTRENARÃ</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">DATOS DE ENTRENAMIENTO</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">GOP O LA PRESENTACIÃ“N DE LAS MEJORES PRÃCTICAS?</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">FECHA DE FINALIZACIÃ“N</TableHead>
              <TableHead className="w-12 border-none"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No hay registros de estandarizaciÃ³n. Agrega uno.
                </TableCell>
              </TableRow>
            )}
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.accionesMitigar || ""}
                    onChange={(e) => handleUpdate(item.id, "accionesMitigar", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.herramientaVpo || ""}
                    onChange={(e) => handleUpdate(item.id, "herramientaVpo", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.dueno || ""}
                    onChange={(e) => handleUpdate(item.id, "dueno", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.equipoComunicara || ""}
                    onChange={(e) => handleUpdate(item.id, "equipoComunicara", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.datosEntrenamiento || ""}
                    onChange={(e) => handleUpdate(item.id, "datosEntrenamiento", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.gopPresentacion || ""}
                    onChange={(e) => handleUpdate(item.id, "gopPresentacion", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    value={item.fechaFinalizacion || ""}
                    onChange={(e) => handleUpdate(item.id, "fechaFinalizacion", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
