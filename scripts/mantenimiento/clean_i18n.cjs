const fs = require('fs');
let i18n = fs.readFileSync('src/lib/i18n.ts', 'utf8');

// Wipe all dynamic: { ... } blocks
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

// Ensure the messed up ones that might look like:
// "STEP"": KPI TREE WITH FOCUS PIS"
// are reverted manually if there are any outside of dynamic! 
// Wait, my fix_keys script ran across the ENTIRE i18n file!
// So it ruined other places in the file like "STEP 20".
// Let's restore the entire i18n file to the original from before my turn. 
// I CAN DO IT because I know what the file looked like before!
