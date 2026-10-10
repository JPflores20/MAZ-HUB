const fs = require('fs');
let i18n = fs.readFileSync('src/lib/i18n.ts', 'utf8');

// Fix STEP and PASO
for (let i = 20; i <= 32; i++) {
    // step20: { title: "STEP"": ...
    const regexStep = new RegExp('step' + i + ':\\s*\\{\\s*title:\\s*"STEP"":', 'g');
    i18n = i18n.replace(regexStep, 'step' + i + ': {\n            title: "STEP ' + i + ':');
    
    const regexPaso = new RegExp('step' + i + ':\\s*\\{\\s*title:\\s*"PASO"":', 'g');
    i18n = i18n.replace(regexPaso, 'step' + i + ': {\n            title: "PASO ' + i + ':');
    
    // Check mainTitle
    const regexMain = new RegExp('step' + i + ':\\s*\\{\\s*mainTitle:\\s*"PASO"":', 'g');
    i18n = i18n.replace(regexMain, 'step' + i + ': {\n            mainTitle: "PASO ' + i + ':');
}

// Fix secondaryTitlePrefix step 24
i18n = i18n.replace(/secondaryTitlePrefix:\s*"PASO"":/, 'secondaryTitlePrefix: "PASO 24:');

// Fix 1Nada, 2Bajo, etc inside dynamic block. Actually, if it's in dynamic, let's just wipe dynamic block!
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
        let nextComma = i18n.indexOf(',', end);
        let replaceEnd = nextComma !== -1 && nextComma < end + 5 ? nextComma + 1 : end + 1;
        i18n = i18n.slice(0, start) + i18n.slice(replaceEnd);
    } else {
        break;
    }
}

// Ensure the translations are added back perfectly
const translations = require('./generated_translations.json');
const keysStr = Object.entries(translations).map(([k, v]) => '        "' + k + '": ' + JSON.stringify(v) + ',').join('\n');
const dynamicObj = '\n      dynamic: {\n' + keysStr + '\n      },\n';
i18n = i18n.replace(/pdcaPlan:\s*\{/g, 'pdcaPlan: {' + dynamicObj);

fs.writeFileSync('src/lib/i18n.ts', i18n, 'utf8');
