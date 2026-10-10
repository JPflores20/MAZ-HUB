const fs = require('fs');
let i18n = fs.readFileSync('src/lib/i18n.ts', 'utf8');
i18n = i18n.replace(/thUnidadesPerdidas":/g, 'thUnidadesPerdidas:');
fs.writeFileSync('src/lib/i18n.ts', i18n, 'utf8');
