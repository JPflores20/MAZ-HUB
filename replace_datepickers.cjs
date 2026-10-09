const fs = require('fs');
let f = fs.readFileSync('src/components/RDA/RdaPhase7EffectivenessEval.tsx', 'utf8');

if (!f.includes('import { DatePicker }')) {
  f = f.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport { DatePicker } from "@/components/ui/date-picker";'
  );
}

// Helper to convert string to Date and vice-versa
// We'll put this inside the component or just inline it in the props.
// Since DatePicker takes date={Date | undefined} and setDate={setDate}

const oldInputInicio = /<input\s*type="date"\s*className="bg-background border border-border rounded px-2 py-1 text-sm outline-none"\s*value=\{evalData\.periodoEvaluadoInicio \|\| ""\}\s*onChange=\{e => updateData\(\{ periodoEvaluadoInicio: e\.target\.value \}\)\}\s*\/>/;

const newInputInicio = `<DatePicker
                  date={evalData.periodoEvaluadoInicio ? new Date(evalData.periodoEvaluadoInicio) : undefined}
                  setDate={(date) => updateData({ periodoEvaluadoInicio: date ? date.toISOString() : "" })}
                  className="w-[160px] h-8 text-xs"
                />`;

const oldInputFin = /<input\s*type="date"\s*className="bg-background border border-border rounded px-2 py-1 text-sm outline-none"\s*value=\{evalData\.periodoEvaluadoFin \|\| ""\}\s*onChange=\{e => updateData\(\{ periodoEvaluadoFin: e\.target\.value \}\)\}\s*\/>/;

const newInputFin = `<DatePicker
                  date={evalData.periodoEvaluadoFin ? new Date(evalData.periodoEvaluadoFin) : undefined}
                  setDate={(date) => updateData({ periodoEvaluadoFin: date ? date.toISOString() : "" })}
                  className="w-[160px] h-8 text-xs"
                />`;

f = f.replace(oldInputInicio, newInputInicio);
f = f.replace(oldInputFin, newInputFin);

fs.writeFileSync('src/components/RDA/RdaPhase7EffectivenessEval.tsx', f);
