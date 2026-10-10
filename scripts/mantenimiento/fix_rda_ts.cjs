const fs = require("fs");

let prev = fs.readFileSync("src/components/rda_dialog/RdaPreventionTable.tsx", "utf8");
prev = prev.replace(/tema/g, "asunto");
prev = prev.replace(/status/g, "estatus");
prev = prev.replace(/"Completada"/g, '"Completa"');
fs.writeFileSync("src/components/rda_dialog/RdaPreventionTable.tsx", prev);

let val = fs.readFileSync("src/components/rda_dialog/RdaValidationTable.tsx", "utf8");
val = val.replace(/status/g, "estatus");
val = val.replace(/"Completada"/g, '"Completa"');
val = val.replace(/"No"/g, '"NO"');
val = val.replace(/"Sí"/g, '"SI"');
val = val.replace(/"Por determinar"/g, '"Pendiente"');
fs.writeFileSync("src/components/rda_dialog/RdaValidationTable.tsx", val);
