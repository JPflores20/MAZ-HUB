const fs = require('fs');
let i18n = fs.readFileSync('src/lib/i18n.ts', 'utf8');
i18n = i18n.replace(/(\s+[a-zA-Z0-9_]+)":/g, '$1:');
fs.writeFileSync('src/lib/i18n.ts', i18n, 'utf8');
