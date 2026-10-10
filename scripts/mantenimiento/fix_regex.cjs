const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/components/pdca/1.PLAN';
const pasos = ['paso1', 'paso2', 'paso5', 'paso6', 'paso7', 'paso9'];

pasos.forEach(paso => {
    const pasoDir = dir + '/' + paso;
    if (fs.existsSync(pasoDir)) {
        fs.readdirSync(pasoDir).forEach(f => {
            if (f.endsWith('.tsx')) {
                const fullPath = pasoDir + '/' + f;
                let content = fs.readFileSync(fullPath, 'utf8');
                
                // Remove ALL instances of const { t } = useTranslation();
                content = content.replace(/const \{ t \} = useTranslation\(\);\n?/g, '');
                
                // Now, re-insert it right after the first '{' of functions that start with export function ComponentName,
                // or export const ComponentName = () => {
                
                // A simpler regex approach:
                // Find export function X() {
                content = content.replace(/(export (?:default )?function [A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/g, "\n  const { t } = useTranslation();");
                
                // Find export const X = (...) => { where X starts with capital
                content = content.replace(/(export const [A-Z][a-zA-Z0-9_]*\s*=\s*(?:<[^>]+>\s*)?\([^)]*\)(?:\s*:\s*[^{=]+)?\s*=>\s*\{)/g, "\n  const { t } = useTranslation();");
                
                // Also default exports without name
                content = content.replace(/(export default\s*\([^)]*\)\s*=>\s*\{)/g, "\n  const { t } = useTranslation();");
                
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        });
    }
});
