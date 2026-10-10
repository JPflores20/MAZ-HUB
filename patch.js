import * as fs from "fs";
const hookPath = "src/components/pdca/hooks/use_estado_pdca_herramientas.ts";
let code = fs.readFileSync(hookPath, "utf8");
code = code.replace(
  "const rawTablesObj = pdcaInicial.fiveWhysTables || (pdcaInicial as any).five_whys_tables;",
  'const rawTablesObj = pdcaInicial.fiveWhysTables || (pdcaInicial as any).five_whys_tables;\n    console.log("DEBUG_PDCA: fiveWhys:", (pdcaInicial as any).five_whys, "fiveWhysTables:", pdcaInicial.fiveWhysTables);',
);
fs.writeFileSync(hookPath, code);
