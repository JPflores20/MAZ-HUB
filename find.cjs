const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir("src", function (filePath) {
  if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
    const content = fs.readFileSync(filePath, "utf8");
    if (content.match(/11\. CHECKLIST/i) || content.match(/soluci.n a la rutina/i)) {
      console.log("FOUND IN:", filePath);
    }
  }
});
