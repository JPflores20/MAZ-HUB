const fs = require('fs');
const files = [
  'src/components/pdca/1.PLAN/paso10/pareto-section.tsx',
  'src/components/pdca/1.PLAN/paso14/rendimiento-actual-evidences.tsx',
  'src/components/pdca/1.PLAN/paso14/rendimiento-actual-step.tsx',
  'src/components/pdca/1.PLAN/paso14/rendimiento-actual-table.tsx',
  'src/components/pdca/1.PLAN/paso18/conclusiones-causa-raiz-table.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('const { t } = useTranslation()')) {
    // find the first { after the function declaration line
    if (file.includes('pareto-section.tsx')) {
      content = content.replace(/PropiedadesSeccionPareto\) \{/, 'PropiedadesSeccionPareto) {\n  const { t } = useTranslation();');
    } else if (file.includes('evidences.tsx')) {
      content = content.replace(/PropiedadesSeccionEvidencias\) \{/, 'PropiedadesSeccionEvidencias) {\n  const { t } = useTranslation();');
    } else if (file.includes('rendimiento-actual-step.tsx')) {
      content = content.replace(/PropiedadesPasoRendimiento> = \([^)]*\) => \{/, '$&\n  const { t } = useTranslation();');
    } else if (file.includes('rendimiento-actual-table.tsx')) {
      content = content.replace(/PropiedadesTablaRendimiento> = \([^)]*\) => \{/, '$&\n  const { t } = useTranslation();');
    } else if (file.includes('conclusiones-causa-raiz-table.tsx')) {
      content = content.replace(/PropiedadesTablaConclusiones\) \{/, 'PropiedadesTablaConclusiones) {\n  const { t } = useTranslation();');
    }
    fs.writeFileSync(file, content, 'utf8');
  }
});
console.log("Fixed other files");
