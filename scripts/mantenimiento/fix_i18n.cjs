const fs = require('fs');
const translations = require('./generated_translations.json');
const i18nPath = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/lib/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');

// Strip all dynamic: { ... } blocks up to the closing brace
// Since nested structures might be hard with regex, we can just remove dynamic: { ... } where we inserted it.
// Actually, it's easier to just find the dynamic block and remove it:
while (i18n.includes('dynamic: {')) {
    const start = i18n.indexOf('dynamic: {');
    // find matching brace
    let braceCount = 0;
    let end = -1;
    for (let i = start + 9; i < i18n.length; i++) {
        if (i18n[i] === '{') braceCount++;
        else if (i18n[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                end = i;
                break;
            }
        }
    }
    if (end !== -1) {
        // remove from start to end + 2 (to include },)
        i18n = i18n.slice(0, start) + i18n.slice(end + 1).replace(/^,\s*/, '');
    } else {
        break; // fallback
    }
}

const keysStr = Object.entries(translations).map(([k, v]) => \        \: \,\).join('\n');
const dynamicObj = \
      dynamic: {
\
      },
\;
i18n = i18n.replace(/pdcaPlan:\\s*\\{/g, 'pdcaPlan: {' + dynamicObj);
fs.writeFileSync(i18nPath, i18n, 'utf8');
