const fs = require("fs");
let code = fs.readFileSync("src/components/rda_dialog/RdaDialog.tsx", "utf8");

if (!code.includes("RdaValidationTable")) {
  code = code.replace(
    'import { ArrowLeft, Save, UploadCloud, Check } from "lucide-react";',
    'import { RdaValidationTable } from "./RdaValidationTable";\nimport { RdaPreventionTable } from "./RdaPreventionTable";\nimport { ArrowLeft, Save, UploadCloud, Check } from "lucide-react";',
  );

  const oldValidation = `<div className="p-4 border rounded-md border-dashed text-muted-foreground">
                (Tabla de Validación en construcción...)
              </div>`;
  const newValidation = `<RdaValidationTable
                items={(localRda as any).validacion || []}
                onChange={(items) => setLocalRda(prev => prev ? { ...prev, validacion: items } as any : prev)}
              />`;
  code = code.replace(oldValidation, newValidation);

  const oldPrevention = `<div className="p-4 border rounded-md border-dashed text-muted-foreground">
                (Tabla de Prevención en construcción...)
              </div>`;
  const newPrevention = `<RdaPreventionTable
                items={(localRda as any).prevencion || []}
                onChange={(items) => setLocalRda(prev => prev ? { ...prev, prevencion: items } as any : prev)}
              />`;
  code = code.replace(oldPrevention, newPrevention);

  fs.writeFileSync("src/components/rda_dialog/RdaDialog.tsx", code);
}
