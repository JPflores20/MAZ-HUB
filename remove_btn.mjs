import fs from 'fs';
const path = 'src/components/pdca/pdca_dialog.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(
  /<button onClick=\{\(\) => navigator\.clipboard\.writeText.*?<\/button>/,
  ''
);
fs.writeFileSync(path, code);
