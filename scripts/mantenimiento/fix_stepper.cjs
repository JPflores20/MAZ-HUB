const fs = require('fs');
let content = fs.readFileSync('src/components/pdca/stepper/stepper-constants.ts', 'utf8');

content = content.replace(/export const getCustomPhases = \(isAdmin: boolean\): CustomPhase\[\] => {[\s\S]*?return base;\n};/, 
\export const getCustomPhases = (isAdmin: boolean, t: any): CustomPhase[] => {
  const base: CustomPhase[] = [
    { id: "Resumen", label: t('pdcaGlobal.resumen', "RESUMEN"), sub: "" },
    { id: "Plan", label: t('pdcaGlobal.plan', "1. PLAN"), sub: "" },
    { id: "Do", label: t('pdcaGlobal.do', "2. DO"), sub: "" },
    { id: "Check", label: t('pdcaGlobal.check', "3. CHECK"), sub: "" },
    { id: "Act", label: t('pdcaGlobal.act', "4. ACT"), sub: "" },
  ];

  if (isAdmin) {
    return [...base, { id: "Evaluacion", label: t('pdcaGlobal.evaluacionR2D2', "EVALUACIÓN R2D2"), sub: t('pdcaGlobal.soloAdmins', "Solo Administradores") }];
  }
  return base;
};\);

fs.writeFileSync('src/components/pdca/stepper/stepper-constants.ts', content, 'utf8');
