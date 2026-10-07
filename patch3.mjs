import fs from 'fs';
const path = 'src/components/pdca/hooks/use_estado_pdca_herramientas.ts';
let code = fs.readFileSync(path, 'utf8');

// Fix 5 Whys stringified rows
code = code.replace(
  'let rawRows = table.rows || table.data;',
  'let rawRows = table.rows || table.data;\n        if (typeof rawRows === "string") { try { rawRows = JSON.parse(rawRows); } catch(e) {} }'
);

// Fix Ishikawa stringified causes
code = code.replace(
  'const normalizeCauses = (causes: any) => {',
  'const normalizeCauses = (causes: any) => {\n      if (typeof causes === "string") { try { causes = JSON.parse(causes); } catch(e) {} }'
);

// Fix Ishikawa stringified prioritization
code = code.replace(
  'causes: normalizeCauses(ish.causes)',
  'causes: normalizeCauses(ish.causes),\n        prioritization: typeof ish.prioritization === "string" ? (() => { try { return JSON.parse(ish.prioritization); } catch(e) { return []; } })() : (ish.prioritization || [])'
);

// Fix legacy Ishikawa stringified prioritization
code = code.replace(
  'prioritization: pdcaInicial.prioritizationCauses || (pdcaInicial as any).prioritization_causes || [],',
  'prioritization: (() => { const p = pdcaInicial.prioritizationCauses || (pdcaInicial as any).prioritization_causes; if (typeof p === "string") { try { return JSON.parse(p); } catch(e) { return []; } } return p || []; })(),'
);

fs.writeFileSync(path, code);
