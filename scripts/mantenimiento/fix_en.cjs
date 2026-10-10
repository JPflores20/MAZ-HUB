const fs = require('fs');
let content = fs.readFileSync('src/lib/i18n.ts', 'utf8');

const englishReplacements = {
  "seleccionarUsuarios": "Select users...",
  "asignado": "Assigned",
  "descripciNDelProblema": "PROBLEM DESCRIPTION",
  "definiciNDeLaMeta": "GOAL DEFINITION (VPO STANDARD)",
  "formatoOficialA3A8Inbev": "• Official A3 / A8 InBev format",
  "paso1DeclaraciNDel": "STEP 1: PROJECT DECLARATION",
  "ejReducciNDeMermas": "Ex: Waste reduction in brewing",
  "seleccionarRea": "Select Area",
  "seleccionarFechaLMite": "Select deadline",
  "seleccionarAutor": "Select author",
  "definiciNDeLaMeta2": "GOAL DEFINITION",
  "kpi": "KPI",
  "piS": "PI (s)",
  "mTodoDeCLculo": "CALCULATION METHOD",
  "desdeValor": "FROM (Value):",
  "aValor": "TO (Value):",
  "hastaFecha": "UNTIL (Date):",
  "unidadDeMedida": "UNIT OF MEASURE:",
  "benchmark": "BENCHMARK:",
  "mejora": "IMPROVEMENT:",
  "lowerReducirMenor": "lower (Reduce / Lower)",
  "higherIncrementarMayor": "higher (Increase / Higher)",
  "responsable": "RESPONSIBLE:",
  "facilitadorLDer": "FACILITATOR/LEADER:",
  "ejPRdidaDeExtracto": "Ex: EXTRACT LOSS",
  "indicadoresDeProcesoPi": "Process Indicators (PI)",
  "ejHanna": "Ex: HANNA",
  "ej258": "Ex: 2.58",
  "ej235": "Ex: 2.35",
  "seleccionarFecha": "Select date",
  "ej": "Ex: %",
  "valorOPlantaBenchmark": "Value or benchmark plant",
  "seleccionar": "Select",
  "nombreDelResponsable": "Responsible name"
};

// We will split the file into 'en' block and 'es' block to only affect 'en'
const enIndex = content.indexOf('en: {');
const esIndex = content.indexOf('es: {');

if (enIndex !== -1 && esIndex !== -1) {
  let enBlock = content.substring(enIndex, esIndex);
  let rest = content.substring(esIndex);
  
  for (const [key, val] of Object.entries(englishReplacements)) {
    // Regex to match "key": "...", in enBlock
    const regex = new RegExp('"' + key + '":\\s*".*?"', 'g');
    enBlock = enBlock.replace(regex, '"' + key + '": "' + val + '"');
  }
  
  fs.writeFileSync('src/lib/i18n.ts', content.substring(0, enIndex) + enBlock + rest, 'utf8');
  console.log('Fixed translations in en block!');
} else {
  console.log('Could not find en: { or es: {');
}
