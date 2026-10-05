const fs = require('fs');
let code = fs.readFileSync('src/components/rda_dialog/RdaDialog.tsx', 'utf8');

if (!code.includes('RdaClosureSection')) {
  code = code.replace(
    'import { RdaPreventionTable } from "./RdaPreventionTable";',
    'import { RdaPreventionTable } from "./RdaPreventionTable";\nimport { RdaClosureSection } from "./RdaClosureSection";'
  );

  const oldClosure = `<div className="p-4 border rounded-md border-dashed text-muted-foreground">
                (Sección de Cierre en construcción...)
              </div>`;
  const newClosure = `<RdaClosureSection
                standardization={(localRda as any).estandarizacion}
                closure={(localRda as any).cierre}
                onChange={(std, cls) => setLocalRda(prev => prev ? { ...prev, estandarizacion: std, cierre: cls } as any : prev)}
              />`;
  code = code.replace(oldClosure, newClosure);

  fs.writeFileSync('src/components/rda_dialog/RdaDialog.tsx', code);
}
