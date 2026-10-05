import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RdaValidationAction } from "@/data/rda";

interface RdaValidationTableProps {
  items: RdaValidationAction[];
  onChange: (items: RdaValidationAction[]) => void;
}

export function RdaValidationTable({ items, onChange }: RdaValidationTableProps) {
  const addRow = () => {
    onChange([
      ...items,
      {
        id: Date.now().toString(),
        categoria: "Mano de obra",
        causaPotencial: "",
        accion: "",
        responsable: "",
        fechaLimite: "",
        estatus: "Pendiente",
        esCausaRaiz: "NO",
      },
    ]);
  };

  const updateRow = (id: string, field: keyof RdaValidationAction, value: string) => {
    onChange(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const deleteRow = (id: string) => {
    onChange(items.filter((it) => it.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary/50">
              <TableRow>
                <TableHead className="w-[150px]">Categoría M</TableHead>
                <TableHead className="w-[200px]">Causa Potencial</TableHead>
                <TableHead className="w-[250px]">Acción de Validación</TableHead>
                <TableHead className="w-[120px]">¿Es Causa Raíz?</TableHead>
                <TableHead className="w-[150px]">Responsable</TableHead>
                <TableHead className="w-[130px]">Fecha Límite</TableHead>
                <TableHead className="w-[130px]">Eestatus</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.categoria}
                      onValueChange={(val) => updateRow(row.id, "categoria", val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mano de obra">Mano de obra</SelectItem>
                        <SelectItem value="Medio ambiente">Medio ambiente</SelectItem>
                        <SelectItem value="Máquina">Máquina</SelectItem>
                        <SelectItem value="Método">Método</SelectItem>
                        <SelectItem value="Medición">Medición</SelectItem>
                        <SelectItem value="Material">Material</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Textarea
                      className="min-h-[60px] resize-none"
                      value={row.causaPotencial}
                      onChange={(e) => updateRow(row.id, "causaPotencial", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Textarea
                      className="min-h-[60px] resize-none"
                      value={row.accion}
                      onChange={(e) => updateRow(row.id, "accion", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.esCausaRaiz}
                      onValueChange={(val) => updateRow(row.id, "esCausaRaiz", val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">Sí</SelectItem>
                        <SelectItem value="NO">No</SelectItem>
                        <SelectItem value="Pendiente">Por determinar</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Input
                      className="h-9"
                      value={row.responsable}
                      onChange={(e) => updateRow(row.id, "responsable", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Input
                      type="date"
                      className="h-9"
                      value={row.fechaLimite}
                      onChange={(e) => updateRow(row.id, "fechaLimite", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.estatus}
                      onValueChange={(val) => updateRow(row.id, "estatus", val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En progreso">En progreso</SelectItem>
                        <SelectItem value="Completa">Completada</SelectItem>
                        <SelectItem value="Retrasado">Retrasado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRow(row.id)}
                      className="text-muted-foreground hover:text-destructive h-9 w-9"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                    No hay acciones de validación registradas.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
        <Plus className="h-4 w-4" />
        Agregar Acción de Validación
      </Button>
    </div>
  );
}
