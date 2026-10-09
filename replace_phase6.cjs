const fs = require('fs');

let f = fs.readFileSync('src/components/RDA/RdaPhase6QualityEval.tsx', 'utf8');

if (!f.includes('RichTextEditor')) {
  f = f.replace(
    'import { Textarea } from "@/components/ui/textarea";', // If it exists
    'import { Textarea } from "@/components/ui/textarea";\nimport { RichTextEditor } from "@/components/ui/rich-text-editor";'
  );
  if (!f.includes('RichTextEditor')) {
    f = f.replace(
      'import { ScoreSelector } from "./ScoreSelector";',
      'import { ScoreSelector } from "./ScoreSelector";\nimport { RichTextEditor } from "@/components/ui/rich-text-editor";'
    );
  }
}

const oldTextarea = /<textarea\s*className="w-full bg-background border border-border rounded-md p-3 min-h-\[120px\] text-sm"\s*placeholder="Escribe la conclusin..."\s*value=\{evalData\.conclusion\}\s*onChange=\{e => updateData\(\{ conclusion: e\.target\.value \}\)\}\s*\/>/;

// Wait, the character  might cause regex issues in Node if the file is utf8. Let's use a simpler regex.
const oldTextarea2 = /<textarea[^>]*placeholder="Escribe la conclusi[^>]*\/>/s;

const newTextarea = `<RichTextEditor 
                className="w-full bg-background border border-border rounded-md text-sm"
                placeholder="Escribe la conclusión..."
                value={evalData.conclusion}
                onChange={val => updateData({ conclusion: val })}
              />`;

f = f.replace(oldTextarea2, newTextarea);

fs.writeFileSync('src/components/RDA/RdaPhase6QualityEval.tsx', f);
