const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src/components');
let fixedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Match "import React from 'react';" and variants
  const lines = content.split('\n');
  let hasReact = false;
  let newLines = [];
  let changed = false;
  for (let line of lines) {
    if (line.trim().startsWith('import React ') || line.trim() === 'import React from "react";' || line.trim() === "import React from 'react';") {
      if (!hasReact) {
        hasReact = true;
        newLines.push(line);
      } else {
        changed = true;
        // skip this duplicate line
      }
    } else {
      newLines.push(line);
    }
  }
  
  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'), 'utf8');
    fixedFiles++;
    console.log('Fixed:', file);
  }
});
console.log('Total fixed files:', fixedFiles);
