const fs = require('fs');
let text = fs.readFileSync('src/lib/i18n.ts', 'utf8');

// Fix STEP"":
text = text.replace(/step(\d+):\s*\{\s*title:\s*"STEP"":/g, 'step$1: {\n            title: "STEP $1:');
text = text.replace(/step(\d+):\s*\{\s*title:\s*"PASO"":/g, 'step$1: {\n            title: "PASO $1:');
text = text.replace(/step24:\s*\{\s*mainTitle:\s*"PASO"":/g, 'step24: {\n            mainTitle: "PASO 24:');
text = text.replace(/secondaryTitlePrefix:\s*"PASO"":/g, 'secondaryTitlePrefix: "PASO 24:');
text = text.replace(/title:\s*"PASO"":/g, 'title: "PASO 32:'); // Wait, step32 etc. Let's just do a smarter replace.

// A smarter replace:
const lines = text.split('\n');
let currentStep = "";
for (let i = 0; i < lines.length; i++) {
    const stepMatch = lines[i].match(/step(\d+):/);
    if (stepMatch) {
        currentStep = stepMatch[1];
    }
    if (lines[i].includes('"STEP"":')) {
        lines[i] = lines[i].replace('"STEP"":', `"STEP ${currentStep}:`);
    }
    if (lines[i].includes('"PASO"":')) {
        lines[i] = lines[i].replace('"PASO"":', `"PASO ${currentStep}:`);
    }
}
text = lines.join('\n');

fs.writeFileSync('src/lib/i18n.ts', text, 'utf8');
