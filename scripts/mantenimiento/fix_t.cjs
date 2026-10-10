const fs = require('fs');

const files = [
  'src/components/pdca/1.PLAN/paso10/pareto-section.tsx',
  'src/components/pdca/1.PLAN/paso11/flavor-correlation-section.tsx',
  'src/components/pdca/1.PLAN/paso14/rendimiento-actual-evidences.tsx',
  'src/components/pdca/1.PLAN/paso14/rendimiento-actual-step.tsx',
  'src/components/pdca/1.PLAN/paso14/rendimiento-actual-table.tsx',
  'src/components/pdca/1.PLAN/paso18/conclusiones-causa-raiz-table.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // First, remove the bad insertion `\n  const { t } = useTranslation();\n` (which is literally "\n")
  content = content.replace(/\\n\s*const \{ t \} = useTranslation\(\);\n/, '');
  // Now do the correct replace
  content = content.replace(/(export function [a-zA-Z0-9_]+\s*\([^)]*\)(?:\s*:\s*[a-zA-Z<>]+)?\s*\{\s*)/, "$1\n  const { t } = useTranslation();\n");
  
  // Wait, flavor-correlation-section.tsx has:
  // export function FlavorCorrelationSection({
  //  data,
  //  onChange,
  // }: PropiedadesSeccionCorrelacion) {
  // My regex didn't handle the Props closing tag properly. 
  // A safer regex:
  content = content.replace(/(\{\s*const datosActuales)/, "\n  const { t } = useTranslation();\n$1");

  fs.writeFileSync(file, content, 'utf8');
});
