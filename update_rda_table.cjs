const fs = require("fs");

let f = fs.readFileSync("src/routes/rda.tsx", "utf8");

// Replace TableHeader
f = f.replace(
  /<TableHeader>[\s\S]*?<\/TableHeader>/,
  `<TableHeader>
            <TableRow className="bg-secondary/80 hover:bg-secondary/80 text-xs">
              <TableHead className="font-semibold text-foreground/80">TÍTULO DEL REPORTE</TableHead>
              <TableHead className="font-semibold text-foreground/80">ESTATUS</TableHead>
              <TableHead className="font-semibold text-foreground/80">PLANTA</TableHead>
              <TableHead className="font-semibold text-foreground/80">RESPONSABLE</TableHead>
              <TableHead className="font-semibold text-foreground/80">AUTOR / CREADOR</TableHead>
              <TableHead className="font-semibold text-foreground/80">FECHA DE ANOMALÍA</TableHead>
              <TableHead className="font-semibold text-foreground/80">ACTUALIZACIÓN</TableHead>
              <TableHead className="text-right font-semibold text-foreground/80">ACCIÓN</TableHead>
            </TableRow>
          </TableHeader>`,
);

// Replace TableBody mapping
const oldMapping = `              rdas.map((rda) => (
                <TableRow key={rda.id} className="cursor-pointer transition-colors hover:bg-secondary/30" onClick={() => handleEdit(rda)}>
                  <TableCell className="font-medium">{rda.title}</TableCell>
                  <TableCell>{rda.status}</TableCell>
                  <TableCell>{rda.context.planta}</TableCell>
                  <TableCell>{rda.context.responsable || "-"}</TableCell>
                  <TableCell>
                    {rda.createdAt ? new Date(rda.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(rda)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(rda.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))`;

const newMapping = `              rdas.map((rda) => (
                <TableRow key={rda.id} className="cursor-pointer transition-colors hover:bg-secondary/30 text-sm" onClick={() => handleEdit(rda)}>
                  <TableCell className="font-medium">{rda.title}</TableCell>
                  <TableCell>{rda.status}</TableCell>
                  <TableCell>{rda.context.planta}</TableCell>
                  <TableCell>{rda.context.responsable || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium uppercase">{rda.portada?.autorOriginal || "-"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {rda.createdAt ? new Date(rda.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                  </TableCell>
                  <TableCell>
                    {rda.updatedAt ? new Date(rda.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="link" className="text-primary h-8 px-2 font-semibold" onClick={(e) => { e.stopPropagation(); handleEdit(rda); }}>
                        Abrir
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(rda.id); }} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))`;

f = f.replace(
  /              rdas\.map\(\(rda\) => \([\s\S]*?<\/[T]ableRow>\r?\n              \)\)/,
  newMapping,
);
// Handle edge case if regex doesn't match perfectly
if (f.indexOf("AUTOR / CREADOR") === -1) {
  console.log("Regex 1 failed");
}
if (f.indexOf("Abrir") === -1) {
  console.log("Regex 2 failed");
}

fs.writeFileSync("src/routes/rda.tsx", f);
