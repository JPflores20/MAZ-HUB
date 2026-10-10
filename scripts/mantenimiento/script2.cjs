const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/components/pdca/1.PLAN';
const pasos = ['paso1', 'paso2', 'paso5', 'paso6', 'paso7', 'paso9'];

let allStrings = [];

pasos.forEach(paso => {
    const pasoDir = path.join(dir, paso);
    if (!fs.existsSync(pasoDir)) return;
    const files = fs.readdirSync(pasoDir).filter(f => f.endsWith('.tsx'));
    files.forEach(f => {
        const content = fs.readFileSync(path.join(pasoDir, f), 'utf-8');
        
        // Find text between > and <
        const matches1 = content.match(/>([^<{}]+)</g);
        if (matches1) {
            matches1.forEach(m => {
                const s = m.slice(1, -1).trim();
                if (s.length > 1 && /[a-zA-Z]/.test(s) && !s.includes('=>') && !s.includes('&&')) allStrings.push(s);
            });
        }
        
        // Find text in placeholder="..."
        const matches2 = content.match(/placeholder="([^"]+)"/g);
        if (matches2) {
            matches2.forEach(m => {
                allStrings.push(m.match(/placeholder="([^"]+)"/)[1]);
            });
        }
        
        // Find text in title="..."
        const matches3 = content.match(/title="([^"]+)"/g);
        if (matches3) {
            matches3.forEach(m => {
                allStrings.push(m.match(/title="([^"]+)"/)[1]);
            });
        }
    });
});

allStrings = [...new Set(allStrings)].sort();
console.log(allStrings.join('\n'));
