import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function replaceInFile(filePath, searchRegex, replaceStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replaceStr);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

// 1. Fix internal imports inside paso folders (e.g. ../ -> ../../)
walkDir('src/components/pdca', (filePath) => {
    if (filePath.includes('paso') && filePath.endsWith('.tsx')) {
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
        
        // Fix GopThemesSection in paso files
        replaceInFile(filePath, /"\.\.\/GopThemesSection"/g, '"../paso15/GopThemesSection"');
        replaceInFile(filePath, /'\.\.\/GopThemesSection'/g, "'../paso15/GopThemesSection'");
    }
});

// Pareto internal fixes
walkDir('src/components/pdca/1.PLAN/paso10/pareto/__tests__', (filePath) => {
    if (filePath.includes('.test.')) {
        replaceInFile(filePath, /"\.\.\/\.\.\/pareto/g, '"../pareto');
        replaceInFile(filePath, /"\.\.\/\.\.\/use_pareto/g, '"../use_pareto');
    }
});
if (fs.existsSync('src/components/pdca/1.PLAN/paso10/pareto/pareto_interactive.tsx')) {
    replaceInFile('src/components/pdca/1.PLAN/paso10/pareto/pareto_interactive.tsx', /\.\.\/\.\.\/\.\.\/\.\.\/step-instructions/g, '../../../step-instructions');
}

// 2. Fix global imports
walkDir('src/components/pdca', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    replaceInFile(filePath, /\.\.\/\.\.\/\.\.\/\.\.\/kpi-tree/g, '../../../kpi-tree');
    replaceInFile(filePath, /\.\.\/\.\.\/\.\.\/\.\.\/action-kanban/g, '../../../action-kanban');
    
    // Replace ./1.PLAN/GopThemesSection -> ./1.PLAN/paso15/GopThemesSection
    replaceInFile(filePath, /\.\/1\.PLAN\/GopThemesSection/g, './1.PLAN/paso15/GopThemesSection');
  }
});

// Update phase plan components
const phaseUpdates = [
  ['src/components/pdca/1.PLAN/pdca_phase_plan.tsx', [
      [/\.\/rendimiento-actual-step/g, './paso14/rendimiento-actual-step'],
      [/\.\/conclusiones-causa-raiz-table/g, './paso18/conclusiones-causa-raiz-table'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pareto-section"/g, '"@/components/pdca/1.PLAN/paso10/pareto-section"']
  ]],
  ['src/components/pdca/2.DO/pdca_phase_do.tsx', [
      [/\.\/action-plan-table/g, './paso18/action-plan-table'],
      [/\.\/evidencias-solucion-step/g, './paso19/evidencias-solucion-step']
  ]],
  ['src/components/pdca/3.CHECK/pdca_phase_check.tsx', [
      [/\.\.\/1\.PLAN\/time-series-ytd/g, '../1.PLAN/paso7/time-series-ytd'],
      [/"@\/components\/pdca\/1\.PLAN\/pareto-section"/g, '"@/components/pdca/1.PLAN/paso10/pareto-section"'],
      [/"@\/components\/pdca\/1\.PLAN\/flavor-correlation-section"/g, '"@/components/pdca/1.PLAN/paso11/flavor-correlation-section"'],
      [/\.\.\/2\.DO\/pruebas-ejecutadas-table/g, '../3.CHECK/paso23/pruebas-ejecutadas-table'], // wait, it was moved to 3.CHECK/paso23
      [/\.\/nuevo-performance-table/g, './paso24/nuevo-performance-table']
  ]],
  ['src/components/pdca/4.ACT/pdca_phase_act.tsx', [
      [/\.\/tabla-estandarizacion/g, './paso27/tabla-estandarizacion'],
      [/\.\.\/1\.PLAN\/analisis-riesgos-proceso-table/g, '../1.PLAN/paso6/analisis-riesgos-proceso-table']
  ]],
  ['src/components/pdca/__tests__/pdca_phase_plan.test.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"']
  ]]
];

for (const [file, replaces] of phaseUpdates) {
  if (fs.existsSync(file)) {
      for (const [search, replace] of replaces) {
          replaceInFile(file, search, replace);
      }
  }
}

// 3. Fix PdcaParticipants imports
walkDir('src/components/pdca', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if it imports PdcaParticipants
    if (content.includes('PdcaParticipants') && content.includes('pdca-goal-definition') && !filePath.includes('pdca-participants.tsx')) {
        // Find the import block and add the new import line below it
        let importMatch = content.match(/import\s*{[^}]*}\s*from\s*['"][^'"]*pdca-goal-definition['"];?/);
        if (importMatch) {
            let importPath = importMatch[0].match(/from\s*['"]([^'"]*)['"]/)[1];
            let newImportPath = importPath.replace('pdca-goal-definition', 'pdca-participants');
            
            // Remove PdcaParticipants from the original block
            let newBlock = importMatch[0].replace(/PdcaParticipants\s*,?\s*/g, '');
            // Sometimes it leaves an empty comma or weird spacing, clean it up if you want
            newBlock = newBlock.replace(/{\s*,/g, '{').replace(/,\s*}/g, '}');
            
            // Reconstruct the imports
            content = content.replace(importMatch[0], newBlock + '\nimport { PdcaParticipants } from "' + newImportPath + '";');
            modified = true;
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed PdcaParticipants in', filePath);
    }
  }
});
