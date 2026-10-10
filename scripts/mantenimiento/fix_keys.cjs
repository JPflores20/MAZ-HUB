const fs = require('fs');
const i18nPath = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/lib/i18n.ts';
let i18n = fs.readFileSync(i18nPath, 'utf8');

// The keys that start with numbers in dynamic: { ... } are 1Nada, 2Bajo, etc.
// Let's just use a regex to wrap them in quotes if they are unquoted numbers
// Or better, just regex replace all keys in the dynamic block that start with a number.
i18n = i18n.replace(/(\s+)([0-9][a-zA-Z0-9_]*):/g, '"":');

fs.writeFileSync(i18nPath, i18n, 'utf8');
