const fs = require('fs');
const translations = require('./generated_translations.json');
const i18nPath = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/lib/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');

while (i18n.includes('dynamic: {')) {
    const start = i18n.indexOf('dynamic: {');
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
        // Find next comma
        let nextComma = i18n.indexOf(',', end);
        let replaceEnd = nextComma !== -1 && nextComma < end + 5 ? nextComma + 1 : end + 1;
        i18n = i18n.slice(0, start) + i18n.slice(replaceEnd);
    } else {
        break;
    }
}

const keysStr = Object.entries(translations).map(([k, v]) => `        ${k}: ${JSON.stringify(v)},`).join('\n');
const dynamicObj = `
      dynamic: {
${keysStr}
      },
`;
i18n = i18n.replace(/pdcaPlan:\s*\{/g, 'pdcaPlan: {' + dynamicObj);
fs.writeFileSync(i18nPath, i18n, 'utf8');
