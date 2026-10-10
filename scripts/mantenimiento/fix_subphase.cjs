const fs = require('fs');
let text = fs.readFileSync('src/lib/i18n.ts', 'utf8');
text = text.replace(/"Subphase"": Problem Identification/g, '"Subphase 1: Problem Identification');
text = text.replace(/"Subphase"": Analysis/g, '"Subphase 2: Analysis');
text = text.replace(/"Subfase"": Identificacin/g, '"Subfase 1: Identificacin');
text = text.replace(/"Subfase"": Anǭlisis/g, '"Subfase 2: Anǭlisis');
text = text.replace(/"STEP 32: PROJECT DECLARATION"/g, '"STEP 1: PROJECT DECLARATION"');

fs.writeFileSync('src/lib/i18n.ts', text, 'utf8');
