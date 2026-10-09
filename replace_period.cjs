const fs = require('fs');

let f = fs.readFileSync('src/components/RDA/RdaPhase7EffectivenessEval.tsx', 'utf8');

f = f.replace(
  /<div className="flex items-center gap-2">\s*<span className="font-semibold">Periodo evaluado:<\/span>\s*<input\s*type="text"\s*className="bg-background border-b border-border px-2 py-1 outline-none flex-1 max-w-sm"\s*placeholder="Ej\. 01 al 30 de octubre de 2026"\s*value=\{evalData\.periodoEvaluado\}\s*onChange=\{e => updateData\(\{ periodoEvaluado: e\.target\.value \}\)\}\s*\/>\s*<\/div>/,
  `<div className="flex items-center gap-4">
              <span className="font-semibold">Periodo evaluado:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Inicio:</span>
                <input 
                  type="date" 
                  className="bg-background border border-border rounded px-2 py-1 text-sm outline-none"
                  value={evalData.periodoEvaluadoInicio || ""}
                  onChange={e => updateData({ periodoEvaluadoInicio: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Fin:</span>
                <input 
                  type="date" 
                  className="bg-background border border-border rounded px-2 py-1 text-sm outline-none"
                  value={evalData.periodoEvaluadoFin || ""}
                  onChange={e => updateData({ periodoEvaluadoFin: e.target.value })}
                />
              </div>
            </div>`
);

fs.writeFileSync('src/components/RDA/RdaPhase7EffectivenessEval.tsx', f);
