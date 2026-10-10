const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/components/pdca/1.PLAN';
const pasos = ['paso1', 'paso2', 'paso5', 'paso6', 'paso7', 'paso9'];

pasos.forEach(paso => {
    const pasoDir = path.join(dir, paso);
    if (!fs.existsSync(pasoDir)) return;
    const files = fs.readdirSync(pasoDir).filter(f => f.endsWith('.tsx'));
    files.forEach(f => {
        const content = fs.readFileSync(path.join(pasoDir, f), 'utf-8');
        console.log('--- ' + paso + '/' + f + ' ---');
        
        // Simple regex to find uppercase text inside tags or attributes like title="...", >TEXT<
        const matches = content.match(/>([^<{}a-z]+)</g);
        if (matches) {
            const strings = [...new Set(matches.map(m => m.slice(1, -1).trim()).filter(s => s.length > 2 && /[A-Z-]/.test(s)))];
            console.log(strings);
        }
    });
});
