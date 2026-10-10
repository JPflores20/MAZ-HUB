const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

const project = new Project();
const dir = 'c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/components/pdca/1.PLAN';
const pasos = ['paso1', 'paso2', 'paso5', 'paso6', 'paso7', 'paso9'];
const files = [];

pasos.forEach(paso => {
    const pasoDir = dir + '/' + paso;
    if (fs.existsSync(pasoDir)) {
        fs.readdirSync(pasoDir).forEach(f => {
            if (f.endsWith('.tsx')) {
                files.push(pasoDir + '/' + f);
            }
        });
    }
});

files.forEach(f => project.addSourceFileAtPath(f));

let textsToTranslate = new Set();

project.getSourceFiles().forEach(sourceFile => {
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(jsxText => {
        const text = jsxText.getLiteralText().trim();
        if (text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('=>')) {
            textsToTranslate.add(text);
        }
    });

    sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(attr => {
        const name = attr.getNameNode().getText();
        if (['placeholder', 'title', 'label'].includes(name)) {
            const init = attr.getInitializer();
            if (init && init.getKind() === SyntaxKind.StringLiteral) {
                const text = init.getLiteralValue().trim();
                if (text.length > 1 && /[a-zA-Z]/.test(text)) {
                    textsToTranslate.add(text);
                }
            }
        }
    });
});

fs.writeFileSync('texts.json', JSON.stringify(Array.from(textsToTranslate), null, 2));
