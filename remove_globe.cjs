const fs = require('fs');
let content = fs.readFileSync('src/components/layout/layout-header.tsx', 'utf8');

// replace the button block
content = content.replace(/<Button\s+variant="ghost"\s+size="icon"\s+onClick=\{[^}]+\}\s+className="[^"]+"\s*>\s*<Globe[^>]+>\s*<\/Button>/, '');

fs.writeFileSync('src/components/layout/layout-header.tsx', content, 'utf8');
console.log('Removed Globe!');
