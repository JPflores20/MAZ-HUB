import fs from "fs";
import path from "path";

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const phases = ["1.PLAN", "2.DO", "3.CHECK", "4.ACT"];

for (const phase of phases) {
  const phaseDir = path.join("./src/components/pdca", phase);
  if (!fs.existsSync(phaseDir)) continue;

  fs.readdirSync(phaseDir).forEach((item) => {
    if (item.startsWith("paso")) {
      const pasoDir = path.join(phaseDir, item);
      if (fs.statSync(pasoDir).isDirectory()) {
        walkDir(pasoDir, (filePath) => {
          if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
            let content = fs.readFileSync(filePath, "utf8");
            let changed = false;

            // from "../../something" -> from "../../../something"
            if (/from "\.\.\/\.\.\//.test(content)) {
              content = content.replace(/from "\.\.\/\.\.\//g, 'from "../../../');
              changed = true;
            }
            // from "../something" -> from "../../something" (but be careful not to replace the ones we just did)
            // It's safer to do this with a regex that ignores if it already has ../../
            // wait, we can just replace `from "../` with `from "../../` EXCEPT if it's `from "../../../`
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes('from "') || lines[i].includes("from '")) {
                // if it has ../../ we skip? no, we already handled ../../ above.
                // Actually, let's just do a string replacement on lines.
                let line = lines[i];
                if (line.includes('from "../../')) {
                  // already handled or need to change?
                  // If it was ../../ originally, we made it ../../../
                  // If it wasn't, let's do this carefully:
                }
              }
            }

            // Better approach: regex that matches exactly the number of dots.
            // from "../../ -> from "../../../
            content = content.replace(/from (['"])\.\.\/\.\.\/([^'"]+)\1/g, "from $1../../../$2$1");
            // from "../ -> from "../../ (only if it doesn't start with ../../)
            content = content.replace(
              /from (['"])\.\.\/(?!\.\.\/)([^'"]+)\1/g,
              "from $1../../$2$1",
            );
            // from "./pasoX -> from "../pasoX
            content = content.replace(/from (['"])\.\/paso([^'"]+)\1/g, "from $1../paso$2$1");
            // from "./some-sibling -> if some-sibling is not in pasoX, it should be ../some-sibling
            // wait, if it was `./step-instructions`, and `step-instructions` is in `pdca`, wait!
            // If it was `./` in `1.PLAN`, it pointed to `1.PLAN/something`. Now we are in `1.PLAN/pasoX`, so to point to `1.PLAN/something`, we need `../something`.
            // But if it points to a file that was ALSO moved to the SAME pasoX folder, it should remain `./something`!
            // Let's assume all files in `pasoX` were moved. The only things left in `1.PLAN` are `pdca_phase_plan.tsx` and `time-series-ytd.tsx` (wait no, time-series was moved).
            content = content.replace(/from (['"])\.\/(?!paso)([^'"]+)\1/g, (match, q, file) => {
              // if file exists in current dir, keep ./
              const checkPath =
                path.join(path.dirname(filePath), file) +
                (file.endsWith(".ts") || file.endsWith(".tsx") ? "" : ".tsx");
              if (fs.existsSync(checkPath) || fs.existsSync(checkPath.replace(".tsx", ".ts"))) {
                return match;
              }
              return `from ${q}../${file}${q}`;
            });

            if (content !== fs.readFileSync(filePath, "utf8")) {
              fs.writeFileSync(filePath, content, "utf8");
              console.log(`Fixed imports in ${filePath}`);
            }
          }
        });
      }
    }
  });
}

// Fix RDA dialog imports
let rdaPath = "./src/components/RDA/RdaDialog.tsx";
if (fs.existsSync(rdaPath)) {
  let content = fs.readFileSync(rdaPath, "utf8");
  content = content.replace(
    /from '\.\.\/pdca\/1\.PLAN\/ishikawa-section'/g,
    "from '../pdca/1.PLAN/paso16/ishikawa-section'",
  );
  content = content.replace(
    /from '\.\.\/pdca\/1\.PLAN\/five-whys-section'/g,
    "from '../pdca/1.PLAN/paso17/five-whys-section'",
  );
  fs.writeFileSync(rdaPath, content, "utf8");
}

console.log("Internal imports fixed.");
