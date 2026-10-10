const fs = require('fs');
const translations = require('./generated_translations.json');
const i18nPath = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/lib/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');
const keysStr = Object.entries(translations).map(([k, v]) => `        ${k}: ${JSON.stringify(v)},`).join('\n');
const dynamicObj = `
      dynamic: {
${keysStr}
      },
`;
i18n = i18n.replace(/pdcaPlan:\s*\{/g, 'pdcaPlan: {' + dynamicObj);
fs.writeFileSync(i18nPath, i18n, 'utf8');
