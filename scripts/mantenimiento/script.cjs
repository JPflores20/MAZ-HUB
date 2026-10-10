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
        
        const lines = content.split('\n');
        lines.forEach((l, i) => {
             // find potential Spanish texts in JSX
             if (l.match(/>[^<{}]+</) || l.match(/placeholder="[^"]+"/) || l.match(/title="[^"]+"/)) {
                  console.log(i + 1, l.trim());
             }
        });
    });
});
