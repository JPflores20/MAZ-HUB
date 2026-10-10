const fs = require('fs');
const path = require('path');

const files = [
  'src/components/pdca/1.PLAN/paso10/pareto/pareto-interactive.tsx',
  'src/components/pdca/1.PLAN/paso10/pareto-section.tsx',
  'src/components/pdca/1.PLAN/paso14/rendimiento-actual-evidences.tsx',
  'src/components/pdca/1.PLAN/paso16/ishikawa-category-box.tsx',
  'src/components/pdca/1.PLAN/paso17/five-whys-interactive.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // replace the first import React from "react";
  content = content.replace(/import React from ["']react["'];/, 'import React, { useState } from "react";');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed:', file);
});
