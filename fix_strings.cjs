const fs = require('fs');
let text = fs.readFileSync('src/lib/i18n.ts', 'utf8');

text = text.replace(/"STEP"([0-9]+)":/g, '"STEP $1:');
text = text.replace(/"PASO"([0-9]+)":/g, '"PASO $1:');
text = text.replace(/([a-zA-Z]+)"([0-9]+)":/g, '$1 $2:');

fs.writeFileSync('src/lib/i18n.ts', text, 'utf8');
