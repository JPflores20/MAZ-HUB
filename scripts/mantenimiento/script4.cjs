const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');
const path = require('path');

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

function slugify(text) {
    let slug = text.trim()
        .replace(/[áäâà]/gi, 'a')
        .replace(/[éëêè]/gi, 'e')
        .replace(/[íïîì]/gi, 'i')
        .replace(/[óöôò]/gi, 'o')
        .replace(/[úüûù]/gi, 'u')
        .replace(/[ñ]/gi, 'n')
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    let words = slug.split(' ').slice(0, 5);
    if (words.length === 0 || words[0] === '') return null;
    return words[0].toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

let translations = {};

project.getSourceFiles().forEach(sourceFile => {
    let fileModified = false;
    let imports = sourceFile.getImportDeclarations();
    let hasUseTranslation = imports.some(imp => imp.getModuleSpecifierValue() === 'react-i18next');
    
    const addTranslation = (text) => {
        let key = slugify(text);
        if (!key) return null;
        if (translations[key] && translations[key] !== text) {
            let i = 2;
            while(translations[key + i] && translations[key + i] !== text) { i++; }
            key = key + i;
        }
        translations[key] = text;
        return key;
    };

    sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(jsxText => {
        const text = jsxText.getLiteralText().trim();
        if (text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('=>') && !text.includes('{')) {
            const key = addTranslation(text);
            if (key) {
                jsxText.replaceWithText("{t('pdcaPlan.dynamic." + key + "')}");
                fileModified = true;
            }
        }
    });

    sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute).forEach(attr => {
        const name = attr.getNameNode().getText();
        if (['placeholder', 'title', 'label'].includes(name)) {
            const init = attr.getInitializer();
            if (init && init.getKind() === SyntaxKind.StringLiteral) {
                const text = init.getLiteralValue().trim();
                if (text.length > 1 && /[a-zA-Z]/.test(text) && !text.includes('{')) {
                    const key = addTranslation(text);
                    if (key) {
                        attr.setInitializer("{t('pdcaPlan.dynamic." + key + "')}");
                        fileModified = true;
                    }
                }
            }
        }
    });

    if (fileModified) {
        if (!hasUseTranslation) {
            sourceFile.addImportDeclaration({
                namedImports: ['useTranslation'],
                moduleSpecifier: 'react-i18next'
            });
        }
        
        // Add hook ONLY to components (top-level functions returning JSX)
        const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
        const arrowFuncs = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
        
        const components = [...functions, ...arrowFuncs].filter(f => {
            // Is it exported and starts with an uppercase letter?
            let isExported = false;
            let name = "";
            if (f.getKind() === SyntaxKind.FunctionDeclaration) {
                isExported = f.hasExportKeyword();
                name = f.getName() || "";
            } else {
                const p = f.getParentIfKind(SyntaxKind.VariableDeclaration);
                if (p) {
                    name = p.getName();
                    const stmt = p.getParentIfKind(SyntaxKind.VariableDeclarationList)?.getParentIfKind(SyntaxKind.VariableStatement);
                    isExported = stmt && stmt.hasExportKeyword();
                }
            }
            return isExported && name.charAt(0) === name.charAt(0).toUpperCase();
        });

        components.forEach(comp => {
            const body = comp.getBody();
            if (body && body.getKind() === SyntaxKind.Block) {
                const bodyText = body.getText();
                if (!bodyText.includes('useTranslation()')) {
                    body.insertStatements(0, 'const { t } = useTranslation();');
                }
            }
        });
        
        sourceFile.saveSync();
    }
});

fs.writeFileSync('generated_translations.json', JSON.stringify(translations, null, 2));
