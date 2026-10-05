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

walkDir('src/components/pdca', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if it imports PdcaParticipants from pdca-goal-definition
    if (content.includes('PdcaParticipants') && content.includes('pdca-goal-definition') && !filePath.includes('pdca-participants.tsx')) {
        // Find the import statement block
        // It could look like:
        // import {
        //   PdcaGoalDefinition,
        //   PdcaParticipants,
        //   DEFAULT_DEFINICION_META,
        // } from "@/components/pdca/1.PLAN/paso1/pdca-goal-definition";
        
        // Remove PdcaParticipants from pdca-goal-definition import
        content = content.replace(/PdcaParticipants\s*,?\s*/g, '');
        
        // Add new import
        // The file could use different relative paths, but we can just use the alias since it's used in most places
        // or check how pdca-goal-definition is imported
        let importMatch = content.match(/import\s*{[^}]*}\s*from\s*['"]([^'"]*pdca-goal-definition)['"]/);
        if (importMatch) {
            let importPath = importMatch[1];
            let newImportPath = importPath.replace('pdca-goal-definition', 'pdca-participants');
            
            // Add the new import right after
            content = content.replace(importMatch[0], importMatch[0] + '\nimport { PdcaParticipants } from "' + newImportPath + '";');
            modified = true;
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
  }
});
