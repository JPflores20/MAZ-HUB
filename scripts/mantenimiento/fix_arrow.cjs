const fs = require('fs');

let f1 = 'src/components/pdca/1.PLAN/paso14/rendimiento-actual-step.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/export const RendimientoActualStep: React\.FC<PropiedadesPasoRendimiento> = \([^\{]*\{/, "$& \n  const { t } = useTranslation();\n");
fs.writeFileSync(f1, c1, 'utf8');

let f2 = 'src/components/pdca/1.PLAN/paso14/rendimiento-actual-table.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/export const TablaRendimientoActual: React\.FC<PropiedadesTablaRendimiento> = \([^\{]*\{/, "$& \n  const { t } = useTranslation();\n");
fs.writeFileSync(f2, c2, 'utf8');

console.log("Fixed arrow functions!");
