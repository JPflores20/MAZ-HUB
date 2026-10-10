import fs from "fs";
import path from "path";

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  {
    regex: /@\/components\/pdca_dialog\/pdca_dialog_header/g,
    replace: "@/components/pdca/pdca_dialog_header",
  },
  { regex: /@\/components\/pdca_dialog/g, replace: "@/components/pdca" },
  { regex: /@\/components\/pdca-dialog"/g, replace: '@/components/pdca/pdca-dialog-wrapper"' },
  { regex: /@\/components\/pdca-dialog\//g, replace: "@/components/pdca/" },
  { regex: /@\/components\/pdca-badge/g, replace: "@/components/pdca/pdca-badge" },
  { regex: /@\/components\/pdca-comments/g, replace: "@/components/pdca/pdca-comments" },
  {
    regex: /@\/components\/pdca-goal-definition/g,
    replace: "@/components/pdca/1.PLAN/pdca-goal-definition",
  },
  {
    regex: /@\/components\/image-upload-section/g,
    replace: "@/components/pdca/image-upload-section",
  },
  { regex: /@\/components\/PDCA/g, replace: "@/components/pdca" },
  { regex: /from "\.\/PDCA\//g, replace: 'from "./pdca/' },
  { regex: /from "\.\.\/PDCA\//g, replace: 'from "../pdca/' },
];

walkDir("./src", function (filePath) {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    let content = fs.readFileSync(filePath, "utf8");
    let changed = false;
    for (let r of replacements) {
      if (r.regex.test(content)) {
        content = content.replace(r.regex, r.replace);
        changed = true;
      }
    }
    // Fix internal imports inside team-members-input and others where ts-morph used PDCA casing
    if (content.includes("PDCA/")) {
      content = content.replace(/PDCA\//g, "pdca/");
      changed = true;
    }
    if (changed) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Updated ${filePath}`);
    }
  }
});
console.log("Done replacing.");
