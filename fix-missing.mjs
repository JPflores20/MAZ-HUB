import fs from 'fs';

function replaceInFile(filePath, searchRegex, replaceStr) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (searchRegex.test(content)) {
      content = content.replace(searchRegex, replaceStr);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}

const updates = [
  ['src/components/pdca/1.PLAN/pdca_phase_plan.tsx', [
      [/\.\/vpo-checkpoint-table/g, './paso2/vpo-checkpoint-table'],
      [/\.\/time-series-ytd/g, './paso7/time-series-ytd'],
      [/\.\/ishikawa-section/g, './paso16/ishikawa-section'],
      [/\.\/five-whys-section/g, './paso17/five-whys-section'],
      [/\.\/flavor-correlation-section/g, './paso11/flavor-correlation-section'],
      [/\.\/GopThemesSection/g, './paso15/GopThemesSection'],
      [/\.\/coleccion-datos-table/g, './paso9/coleccion-datos-table'],
      [/\.\/voz-consumidor-table/g, './paso5/voz-consumidor-table'],
      [/\.\/analisis-riesgos-table/g, './paso6/analisis-riesgos-table']
  ]],
  ['src/components/pdca/auto-resize-textarea.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-participants"/g, '"@/components/pdca/1.PLAN/paso1/pdca-participants"']
  ]],
  ['src/components/pdca/pdca-dialog-step-header.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-participants"/g, '"@/components/pdca/1.PLAN/paso1/pdca-participants"']
  ]],
  ['src/components/pdca/pdca-dialog-stepper.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-participants"/g, '"@/components/pdca/1.PLAN/paso1/pdca-participants"']
  ]],
  ['src/components/pdca/team-members-input.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-participants"/g, '"@/components/pdca/1.PLAN/paso1/pdca-participants"']
  ]],
  ['src/components/pdca/hooks/use_pdca_dialog_state.ts', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"']
  ]],
  ['src/components/pdca/1.PLAN/paso16/ishikawa-section.tsx', [
      [/\.\.\/kpi-tree/g, '../../kpi-tree'],
      [/\.\.\/action-kanban/g, '../../action-kanban'],
      [/\.\/GopThemesSection/g, '../paso15/GopThemesSection']
  ]],
  ['src/components/pdca/1.PLAN/paso17/five-whys-section.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-participants"/g, '"@/components/pdca/1.PLAN/paso1/pdca-participants"'],
      [/\.\.\/kpi-tree/g, '../../kpi-tree'],
      [/\.\.\/action-kanban/g, '../../action-kanban'],
      [/\.\/GopThemesSection/g, '../paso15/GopThemesSection']
  ]],
  ['src/components/pdca/1.PLAN/paso2/vpo-checkpoint-table.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-participants"/g, '"@/components/pdca/1.PLAN/paso1/pdca-participants"'],
      [/\.\.\/kpi-tree/g, '../../kpi-tree'],
      [/\.\.\/action-kanban/g, '../../action-kanban'],
      [/\.\/GopThemesSection/g, '../paso15/GopThemesSection']
  ]],
  ['src/components/pdca/1.PLAN/paso7/time-series-ytd.tsx', [
      [/"@\/components\/pdca\/1\.PLAN\/pdca-goal-definition"/g, '"@/components/pdca/1.PLAN/paso1/pdca-goal-definition"'],
      [/"@\/components\/pdca\/1\.PLAN\/pdca-participants"/g, '"@/components/pdca/1.PLAN/paso1/pdca-participants"'],
      [/\.\.\/kpi-tree/g, '../../kpi-tree'],
      [/\.\.\/action-kanban/g, '../../action-kanban'],
      [/\.\/GopThemesSection/g, '../paso15/GopThemesSection']
  ]]
];

for (const [file, replaces] of updates) {
  for (const [search, replace] of replaces) {
    replaceInFile(file, search, replace);
  }
}
