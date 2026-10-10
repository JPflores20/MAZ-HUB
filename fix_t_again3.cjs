const fs = require('fs');

let f1 = 'src/components/pdca/1.PLAN/paso14/rendimiento-actual-evidences.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/PropiedadesEvidenciasRendimiento> = \([^)]*\) => \{/, "$&\n  const { t } = useTranslation();");
fs.writeFileSync(f1, c1, 'utf8');

let f2 = 'src/components/pdca/1.PLAN/paso18/conclusiones-causa-raiz-table.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/ConclusionesCausaRaizTableProps> = \([^)]*\) => \{/, "$&\n  const { t } = useTranslation();");
fs.writeFileSync(f2, c2, 'utf8');

console.log("Fixed final arrow functions!");
