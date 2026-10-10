const fs = require('fs');
let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

const enInsert = `"pdcaDropdowns": {
          "alto": "5 - High",
          "medio": "3 - Medium",
          "bajo": "1 - Low",
          "menorCosto": "5 - Lower Cost",
          "mayorCosto": "1 - Higher Cost",
          "pendiente": "Pending",
          "enProgreso": "In progress",
          "retrasado": "Delayed",
          "completada": "Completed",
          "leccion1Punto": "1-Point Lesson",
          "otra": "Other"
        },
`;
const esInsert = `"pdcaDropdowns": {
          "alto": "5 - Alto",
          "medio": "3 - Medio",
          "bajo": "1 - Bajo",
          "menorCosto": "5 - Menor costo",
          "mayorCosto": "1 - Mayor costo",
          "pendiente": "Pendiente",
          "enProgreso": "En progreso",
          "retrasado": "Retrasado",
          "completada": "Completada",
          "leccion1Punto": "Lección de 1 Punto",
          "otra": "Otra"
        },
`;

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
console.log('Injected dropdown translations!');
