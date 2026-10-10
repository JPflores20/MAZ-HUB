const fs = require('fs');
let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

// We will inject new translations into the en and es blocks under a new key 'pdcaGlobal'
const enInsert = "pdcaGlobal": {
          "resumen": "SUMMARY",
          "plan": "1. PLAN",
          "do": "2. DO",
          "check": "3. CHECK",
          "act": "4. ACT",
          "evaluacionR2D2": "R2D2 EVALUATION",
          "soloAdmins": "Admins Only",
          "completado": "Completed",
          "desmarcar": "Unmark as completed",
          "marcar": "Mark as completed",
          "instrucciones": "Instructions"
        },
;
const esInsert = "pdcaGlobal": {
          "resumen": "RESUMEN",
          "plan": "1. PLAN",
          "do": "2. DO",
          "check": "3. CHECK",
          "act": "4. ACT",
          "evaluacionR2D2": "EVALUACIÓN R2D2",
          "soloAdmins": "Solo Administradores",
          "completado": "Completado",
          "desmarcar": "Desmarcar paso como completado",
          "marcar": "Marcar paso como completado",
          "instrucciones": "Instrucciones"
        },
;

const replaceAfter = (str, search, insert) => {
  const index = str.indexOf(search);
  if (index !== -1) {
    return str.substring(0, index + search.length) + '\n        ' + insert + str.substring(index + search.length);
  }
  return str;
};

content = replaceAfter(content, 'en: {\n    translation: {', enInsert);
content = replaceAfter(content, 'es: {\n    translation: {', esInsert);

fs.writeFileSync('src/lib/i18n.ts', content, 'utf8');
console.log('Injected global translations!');
