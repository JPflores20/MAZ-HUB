import fs from 'fs';
const path = 'src/components/pdca/hooks/use_estado_pdca_herramientas.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const result: { machine: string[]; method: string[]; material: string[]; manpower: string[]; measurement: string[]; environment: string[]; [key: string]: string[] | undefined } = { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] };',
  'const result = { machine: [] as string[], method: [] as string[], material: [] as string[], manpower: [] as string[], measurement: [] as string[], environment: [] as string[] };'
);

fs.writeFileSync(path, code);
