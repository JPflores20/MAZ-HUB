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
  
  // Remove the badly placed one
  content = content.replace(/\s*const \{ t \} = useTranslation\(\);\s*/, '\n');
  
  // Now place it correctly by finding the component body start.
  // The component body start is right after `) {` or `}) {` or `}> = ({ ... }) => {`
  // An easy way to find it is to look for the first `{` AFTER the function signature closes.
  // We can just use `replace()` on a very specific string per file or rely on `) {` / `=> {`
  
  if (file.includes('flavor-correlation-section.tsx')) {
    content = content.replace(/\} \)\s*\{/, '} ) {\n  const { t } = useTranslation();');
    // wait it's `}: {\n  ... \n} ) {` ? Actually it's `}: { ... } ) {` No, it's `}: { ... }) {`
    content = content.replace(/\}\) \{/, '}) {\n  const { t } = useTranslation();');
  } else if (file.includes('pareto-section.tsx')) {
    content = content.replace(/\}\) \{/, '}) {\n  const { t } = useTranslation();');
  } else if (file.includes('evidences.tsx')) {
    content = content.replace(/\}\) \{/, '}) {\n  const { t } = useTranslation();');
  } else if (file.includes('rendimiento-actual-step.tsx')) {
    content = content.replace(/\}\) => \{/, '}) => {\n  const { t } = useTranslation();');
  } else if (file.includes('rendimiento-actual-table.tsx')) {
    content = content.replace(/\}\) => \{/, '}) => {\n  const { t } = useTranslation();');
  } else if (file.includes('conclusiones-causa-raiz-table.tsx')) {
    content = content.replace(/\}\) \{/, '}) {\n  const { t } = useTranslation();');
  }
  
  fs.writeFileSync(file, content, 'utf8');
});
