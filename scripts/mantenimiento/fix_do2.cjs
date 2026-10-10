const fs = require('fs');
let file = 'src/components/pdca/2.DO/paso18/components/action-plan-row.tsx';
let content = fs.readFileSync(file, 'utf8');

// I will create a function `traducirPuntaje(label)` inside `FilaAccionPlan` or just map inline.
const mapping = `
                      {opt.label === "5 - Alto" ? t("pdcaDropdowns.alto", "5 - Alto") :
                       opt.label === "3 - Medio" ? t("pdcaDropdowns.medio", "3 - Medio") :
                       opt.label === "1 - Bajo" ? t("pdcaDropdowns.bajo", "1 - Bajo") :
                       opt.label === "5 - Menor costo" ? t("pdcaDropdowns.menorCosto", "5 - Menor costo") :
                       opt.label === "1 - Mayor costo" ? t("pdcaDropdowns.mayorCosto", "1 - Mayor costo") :
                       opt.label}
`;

content = content.replace(/\{opt\.label\}/, mapping.trim());

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed dropdown translations in action-plan-row!');
