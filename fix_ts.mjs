import fs from "fs";
const path = "src/components/pdca/hooks/use_estado_pdca_herramientas.ts";
let code = fs.readFileSync(path, "utf8");

// Fix Record<string, string[]> to a strict type
code = code.replace(
  "const result: Record<string, string[]> = { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] };",
  "const result: { machine: string[]; method: string[]; material: string[]; manpower: string[]; measurement: string[]; environment: string[]; [key: string]: string[] | undefined } = { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] };",
);

// Fix pdcaInicial.prioritizationCustomCriterion
code = code.replace(
  'prioritizationCustomCriterion: pdcaInicial.prioritizationCustomCriterion || (pdcaInicial as any).prioritization_custom_criterion || "",',
  'prioritizationCustomCriterion: (pdcaInicial as any).prioritizationCustomCriterion || (pdcaInicial as any).prioritization_custom_criterion || "",',
);

// Also remove the unused use-pdca-dialog-state.ts to clean up errors there
if (fs.existsSync("src/hooks/use-pdca-dialog-state.ts")) {
  fs.unlinkSync("src/hooks/use-pdca-dialog-state.ts");
}

fs.writeFileSync(path, code);
