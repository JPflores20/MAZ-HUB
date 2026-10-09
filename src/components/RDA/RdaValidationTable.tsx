import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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


const getStatusColor = (status: string) => {
  switch (status) {
    case "En progreso": return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
    case "Completa": return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    case "Retrasado": return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    case "Pendiente": 
    default: return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200";
  }
};

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
            <TableHeader className="bg-[#0078D7] [&_th]:text-white">
              <TableRow className="hover:bg-[#0078D7]">
                <TableHead className="w-[150px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">Categoría M</TableHead>
                <TableHead className="w-[200px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">Causa Potencial</TableHead>
                <TableHead className="w-[250px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">Acción de Validación</TableHead>
                <TableHead className="w-[120px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">¿Es Causa Raíz?</TableHead>
                <TableHead className="w-[150px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">Responsable</TableHead>
                <TableHead className="w-[130px] font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">Fecha Límite</TableHead>
                <TableHead className="w-[130px] font-bold uppercase text-[10px] tracking-wider text-white">Estatus</TableHead>
                <TableHead className="w-[50px] text-white"></TableHead>
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
                      <SelectTrigger className={`h-9 ${getStatusColor(row.estatus)}`}>
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
                    <DatePicker
                      date={row.fechaLimite ? new Date(row.fechaLimite) : undefined}
                      setDate={(date) => updateRow(row.id, "fechaLimite", date ? date.toISOString() : "")}
                      className="h-9 w-full"
                    />
                  </TableCell>
                  <TableCell className="align-top p-2">
                    <Select
                      value={row.estatus}
                      onValueChange={(val) => updateRow(row.id, "estatus", val)}
                    >
                      <SelectTrigger className={`h-9 ${getStatusColor(row.estatus)}`}>
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
