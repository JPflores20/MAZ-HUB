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

function replaceInFile(filePath, searchRegex, replaceStr) {
  let content = fs.readFileSync(filePath, "utf8");
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replaceStr);
    fs.writeFileSync(filePath, content, "utf8");
  }
}

// 1. Fix pdca_phase_plan.tsx
replaceInFile(
  "src/components/pdca/1.PLAN/pdca_phase_plan.tsx",
  /\.\.\/\.\.\/\.\.\/\.\.\/kpi-tree/g,
  "../../../kpi-tree",
);
replaceInFile(
  "src/components/pdca/1.PLAN/pdca_phase_plan.tsx",
  /\.\.\/\.\.\/\.\.\/\.\.\/action-kanban/g,
  "../../../action-kanban",
);

// wait, the previous powershell was:
// Get-ChildItem -Path src\components\pdca\1.PLAN -Recurse -Filter *.tsx | ForEach-Object { (Get-Content $_.FullName) -replace '\.\.\/\.\.\/\.\.\/\.\.\/kpi-tree', '../../../kpi-tree' -replace '\.\.\/\.\.\/\.\.\/\.\.\/action-kanban', '../../../action-kanban' | Set-Content $_.FullName }
walkDir("src/components/pdca/1.PLAN", (filePath) => {
  if (filePath.endsWith(".tsx")) {
    replaceInFile(filePath, /\.\.\/\.\.\/\.\.\/\.\.\/kpi-tree/g, "../../../kpi-tree");
    replaceInFile(filePath, /\.\.\/\.\.\/\.\.\/\.\.\/action-kanban/g, "../../../action-kanban");
  }
});

// Get-ChildItem -Path src\components\pdca -Filter *.tsx | ForEach-Object { (Get-Content $_.FullName) -replace '\.\/1\.PLAN\/GopThemesSection', './1.PLAN/paso15/GopThemesSection' | Set-Content $_.FullName }
walkDir("src/components/pdca", (filePath) => {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    // Only at the root of pdca? The powershell was without -Recurse, so it was only root. Let's do it everywhere just in case.
    replaceInFile(filePath, /\.\/1\.PLAN\/GopThemesSection/g, "./1.PLAN/paso15/GopThemesSection");
  }
});

// (Get-Content src\components\RDA\RdaDialog.tsx) -replace '\.\.\/pdca\/1\.PLAN\/ishikawa-section', '../pdca/1.PLAN/paso16/ishikawa-section' -replace '\.\.\/pdca\/1\.PLAN\/five-whys-section', '../pdca/1.PLAN/paso17/five-whys-section' | Set-Content src\components\RDA\RdaDialog.tsx
if (fs.existsSync("src/components/RDA/RdaDialog.tsx")) {
  replaceInFile(
    "src/components/RDA/RdaDialog.tsx",
    /\.\.\/pdca\/1\.PLAN\/ishikawa-section/g,
    "../pdca/1.PLAN/paso16/ishikawa-section",
  );
  replaceInFile(
    "src/components/RDA/RdaDialog.tsx",
    /\.\.\/pdca\/1\.PLAN\/five-whys-section/g,
    "../pdca/1.PLAN/paso17/five-whys-section",
  );
}

// Get-ChildItem -Path src\components\pdca\*\paso* -Recurse -Filter *.tsx | ForEach-Object { ... }
walkDir("src/components/pdca", (filePath) => {
  if (filePath.includes("paso") && filePath.endsWith(".tsx")) {
    replaceInFile(filePath, /"\.\.\/image-upload-section"/g, '"../../image-upload-section"');
    replaceInFile(filePath, /'\.\.\/image-upload-section'/g, "'../../image-upload-section'");

    replaceInFile(filePath, /"\.\.\/step-instructions"/g, '"../../step-instructions"');
    replaceInFile(filePath, /'\.\.\/step-instructions'/g, "'../../step-instructions'");

    replaceInFile(filePath, /"\.\.\/pdca-comments"/g, '"../../pdca-comments"');
    replaceInFile(filePath, /'\.\.\/pdca-comments'/g, "'../../pdca-comments'");

    replaceInFile(filePath, /"\.\.\/pdca-history"/g, '"../../pdca-history"');
    replaceInFile(filePath, /'\.\.\/pdca-history'/g, "'../../pdca-history'");

    replaceInFile(filePath, /"\.\.\/auto-resize-textarea"/g, '"../../auto-resize-textarea"');
    replaceInFile(filePath, /'\.\.\/auto-resize-textarea'/g, "'../../auto-resize-textarea'");

    // Fix ./paso -> ../paso
    replaceInFile(filePath, /"\.\/paso/g, '"../paso');
    replaceInFile(filePath, /'\.\/paso/g, "'../paso");
  }
});

// Pareto fixes
// Get-ChildItem -Path src\components\pdca\1.PLAN\paso10\pareto\__tests__ -Filter *.test.* | ForEach-Object { (Get-Content $_.FullName) -replace '\"\.\.\/\.\.\/pareto', '"../pareto' | Set-Content $_.FullName }
walkDir("src/components/pdca/1.PLAN/paso10/pareto/__tests__", (filePath) => {
  if (filePath.includes(".test.")) {
    replaceInFile(filePath, /"\.\.\/\.\.\/pareto/g, '"../pareto');
    replaceInFile(filePath, /"\.\.\/\.\.\/use_pareto/g, '"../use_pareto');
  }
});

// (Get-Content src\components\pdca\1.PLAN\paso10\pareto\pareto_interactive.tsx) -replace '\.\.\/\.\.\/\.\.\/\.\.\/step-instructions', '../../../step-instructions' | Set-Content src\components\pdca\1.PLAN\paso10\pareto\pareto_interactive.tsx
if (fs.existsSync("src/components/pdca/1.PLAN/paso10/pareto/pareto_interactive.tsx")) {
  replaceInFile(
    "src/components/pdca/1.PLAN/paso10/pareto/pareto_interactive.tsx",
    /\.\.\/\.\.\/\.\.\/\.\.\/step-instructions/g,
    "../../../step-instructions",
  );
}

console.log("Remaining fixes applied.");
