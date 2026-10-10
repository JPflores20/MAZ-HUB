import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const fileMoves = [
  // 1.PLAN
  {
    src: "src/components/pdca/1.PLAN/pdca-goal-definition.tsx",
    dest: "src/components/pdca/1.PLAN/paso1/pdca-goal-definition.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/problem-timeline-section.tsx",
    dest: "src/components/pdca/1.PLAN/paso1/problem-timeline-section.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/vpo-checkpoint-table.tsx",
    dest: "src/components/pdca/1.PLAN/paso2/vpo-checkpoint-table.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/voz-consumidor-table.tsx",
    dest: "src/components/pdca/1.PLAN/paso5/voz-consumidor-table.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/analisis-riesgos-table.tsx",
    dest: "src/components/pdca/1.PLAN/paso6/analisis-riesgos-table.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/analisis-riesgos-proceso-table.tsx",
    dest: "src/components/pdca/1.PLAN/paso6/analisis-riesgos-proceso-table.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/time-series-ytd.tsx",
    dest: "src/components/pdca/1.PLAN/paso7/time-series-ytd.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/coleccion-datos-table.tsx",
    dest: "src/components/pdca/1.PLAN/paso9/coleccion-datos-table.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/pareto-section.tsx",
    dest: "src/components/pdca/1.PLAN/paso10/pareto-section.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/flavor-correlation-section.tsx",
    dest: "src/components/pdca/1.PLAN/paso11/flavor-correlation-section.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/rendimiento-actual-step.tsx",
    dest: "src/components/pdca/1.PLAN/paso14/rendimiento-actual-step.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/GopThemesSection.tsx",
    dest: "src/components/pdca/1.PLAN/paso15/GopThemesSection.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/ishikawa-section.tsx",
    dest: "src/components/pdca/1.PLAN/paso16/ishikawa-section.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/five-whys-section.tsx",
    dest: "src/components/pdca/1.PLAN/paso17/five-whys-section.tsx",
  },
  {
    src: "src/components/pdca/1.PLAN/conclusiones-causa-raiz-table.tsx",
    dest: "src/components/pdca/1.PLAN/paso18/conclusiones-causa-raiz-table.tsx",
  },
  { src: "src/components/pdca/1.PLAN/pareto", dest: "src/components/pdca/1.PLAN/paso10/pareto" }, // directory

  // 2.DO
  {
    src: "src/components/pdca/2.DO/action-plan-table.tsx",
    dest: "src/components/pdca/2.DO/paso18/action-plan-table.tsx",
  },
  {
    src: "src/components/pdca/2.DO/evidencias-solucion-step.tsx",
    dest: "src/components/pdca/2.DO/paso19/evidencias-solucion-step.tsx",
  },
  {
    src: "src/components/pdca/2.DO/gemba-evidencias-step.tsx",
    dest: "src/components/pdca/2.DO/paso9/gemba-evidencias-step.tsx",
  },

  // 3.CHECK
  {
    src: "src/components/pdca/2.DO/pruebas-ejecutadas-table.tsx",
    dest: "src/components/pdca/3.CHECK/paso23/pruebas-ejecutadas-table.tsx",
  }, // cross directory
  {
    src: "src/components/pdca/3.CHECK/nuevo-performance-table.tsx",
    dest: "src/components/pdca/3.CHECK/paso24/nuevo-performance-table.tsx",
  },

  // 4.ACT
  {
    src: "src/components/pdca/4.ACT/tabla-estandarizacion.tsx",
    dest: "src/components/pdca/4.ACT/paso27/tabla-estandarizacion.tsx",
  },
  {
    src: "src/components/pdca/4.ACT/tabla-estandarizacion-vpo.tsx",
    dest: "src/components/pdca/4.ACT/paso27/tabla-estandarizacion-vpo.tsx",
  },
  {
    src: "src/components/pdca/4.ACT/tabla-resultados-finales.tsx",
    dest: "src/components/pdca/4.ACT/paso33/tabla-resultados-finales.tsx",
  },
];

console.log("Moving files...");
for (const move of fileMoves) {
  const destDir = path.dirname(move.dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  try {
    execSync(`git mv "${move.src}" "${move.dest}"`);
    console.log(`Moved ${move.src} -> ${move.dest}`);
  } catch (e) {
    console.error(`Failed to move ${move.src}: ${e.message}`);
  }
}

// Global find and replace across all tsx and ts files
const importReplacements = [
  // 1.PLAN
  { search: /from "\.\/pdca-goal-definition"/g, replace: 'from "./paso1/pdca-goal-definition"' },
  {
    search: /from "\.\/problem-timeline-section"/g,
    replace: 'from "./paso1/problem-timeline-section"',
  },
  { search: /from "\.\/vpo-checkpoint-table"/g, replace: 'from "./paso2/vpo-checkpoint-table"' },
  { search: /from "\.\/voz-consumidor-table"/g, replace: 'from "./paso5/voz-consumidor-table"' },
  {
    search: /from "\.\/analisis-riesgos-table"/g,
    replace: 'from "./paso6/analisis-riesgos-table"',
  },
  {
    search: /from "\.\/analisis-riesgos-proceso-table"/g,
    replace: 'from "./paso6/analisis-riesgos-proceso-table"',
  },
  { search: /from "\.\/time-series-ytd"/g, replace: 'from "./paso7/time-series-ytd"' },
  { search: /from "\.\/coleccion-datos-table"/g, replace: 'from "./paso9/coleccion-datos-table"' },
  { search: /from "\.\/pareto-section"/g, replace: 'from "./paso10/pareto-section"' },
  {
    search: /from "\.\/flavor-correlation-section"/g,
    replace: 'from "./paso11/flavor-correlation-section"',
  },
  {
    search: /from "\.\/rendimiento-actual-step"/g,
    replace: 'from "./paso14/rendimiento-actual-step"',
  },
  { search: /from "\.\/GopThemesSection"/g, replace: 'from "./paso15/GopThemesSection"' },
  { search: /from "\.\/ishikawa-section"/g, replace: 'from "./paso16/ishikawa-section"' },
  { search: /from "\.\/five-whys-section"/g, replace: 'from "./paso17/five-whys-section"' },
  {
    search: /from "\.\/conclusiones-causa-raiz-table"/g,
    replace: 'from "./paso18/conclusiones-causa-raiz-table"',
  },
  { search: /from "\.\/pareto\//g, replace: 'from "./paso10/pareto/' },

  // Aliases (just in case they are used with @/...)
  {
    search: /@\/components\/pdca\/1\.PLAN\/pareto-section/g,
    replace: "@/components/pdca/1.PLAN/paso10/pareto-section",
  },
  {
    search: /@\/components\/pdca\/1\.PLAN\/flavor-correlation-section/g,
    replace: "@/components/pdca/1.PLAN/paso11/flavor-correlation-section",
  },
  {
    search: /@\/components\/pdca\/1\.PLAN\/pdca-goal-definition/g,
    replace: "@/components/pdca/1.PLAN/paso1/pdca-goal-definition",
  },

  // Sibling files in 1.PLAN that import from each other (if they moved, they need to do ../)
  // Actually, mostly they are imported by pdca_phase_plan.tsx which stays in 1.PLAN!
  // Sibling files inside pasoX shouldn't need updates because they are the leaf components.

  // 2.DO
  { search: /from "\.\/action-plan-table"/g, replace: 'from "./paso18/action-plan-table"' },
  {
    search: /from "\.\/evidencias-solucion-step"/g,
    replace: 'from "./paso19/evidencias-solucion-step"',
  },
  { search: /from "\.\/gemba-evidencias-step"/g, replace: 'from "./paso9/gemba-evidencias-step"' },

  // 3.CHECK
  {
    search: /from "\.\/nuevo-performance-table"/g,
    replace: 'from "./paso24/nuevo-performance-table"',
  },
  // 3.CHECK imports from 2.DO
  {
    search: /from "\.\.\/2\.DO\/pruebas-ejecutadas-table"/g,
    replace: 'from "./paso23/pruebas-ejecutadas-table"',
  }, // since it moved to 3.CHECK/paso23!

  // 4.ACT
  { search: /from "\.\/tabla-estandarizacion"/g, replace: 'from "./paso27/tabla-estandarizacion"' },
  {
    search: /from "\.\/tabla-estandarizacion-vpo"/g,
    replace: 'from "./paso27/tabla-estandarizacion-vpo"',
  },
  {
    search: /from "\.\/tabla-resultados-finales"/g,
    replace: 'from "./paso33/tabla-resultados-finales"',
  },

  // pdca_phase_act imports from 1.PLAN
  {
    search: /from "\.\.\/1\.PLAN\/analisis-riesgos-proceso-table"/g,
    replace: 'from "../1.PLAN/paso6/analisis-riesgos-proceso-table"',
  },

  // pdca_phase_check imports from 1.PLAN
  {
    search: /from "\.\.\/1\.PLAN\/time-series-ytd"/g,
    replace: 'from "../1.PLAN/paso7/time-series-ytd"',
  },
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

console.log("Updating imports...");
walkDir("./src", function (filePath) {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;
    for (let r of importReplacements) {
      if (r.search.test(content)) {
        content = content.replace(r.search, r.replace);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated ${filePath}`);
    }
  }
});

console.log("Done.");
