const fs = require('fs');
let text = fs.readFileSync('src/lib/i18n.ts', 'utf8');

text = text.replace(/"Subphase"":/g, '"Subphase 1:'); // wait, the second one is Subphase 2:!
text = text.replace(/"Subfase"":/g, '"Subfase 1:');

text = text.replace(/Subphase 1: Analysis/g, 'Subphase 2: Analysis');
text = text.replace(/Subfase 1: An/g, 'Subfase 2: An');

text = text.replace(/"PASO 32: DECLARACI/g, '"PASO 1: DECLARACI');

fs.writeFileSync('src/lib/i18n.ts', text, 'utf8');
