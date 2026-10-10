const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

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

project.getSourceFiles().forEach(sourceFile => {
    let modified = false;
    
    // We will look for variable statements 'const { t } = useTranslation();'
    sourceFile.getDescendantsOfKind(SyntaxKind.VariableStatement).forEach(stmt => {
        if (stmt.getText().includes('useTranslation()')) {
            const parent = stmt.getParent();
            const grandParent = parent ? parent.getParent() : null;
            
            // Only keep it if the grandparent is a function/arrow func whose parent is NOT a block (i.e., top-level)
            // Or simpler: check if it's returning JSX or is a top-level component.
            // But an easier heuristic: if there's more than one useTranslation() in the same file, we can't just delete blindly.
            // Let's remove ALL useTranslation() declarations, and then re-add them ONLY to the top-level functions that return JSX.
            stmt.remove();
            modified = true;
        }
    });

    if (modified) {
        // Re-add them correctly
        const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
        const arrowFuncs = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
        
        const components = [...functions, ...arrowFuncs].filter(f => {
            // Check if it's top-level or its parent is VariableDeclaration -> VariableDeclarationList -> VariableStatement -> SourceFile
            let isTop = false;
            if (f.getKind() === SyntaxKind.FunctionDeclaration) {
                isTop = f.getParent().getKind() === SyntaxKind.SourceFile;
            } else {
                try {
                    isTop = f.getParent().getParent().getParent().getParent().getKind() === SyntaxKind.SourceFile;
                } catch(e) {}
            }
            return isTop && f.getBody() && f.getBody().getKind() === SyntaxKind.Block;
        });

        components.forEach(comp => {
            const body = comp.getBody();
            if (body && !body.getText().includes('useTranslation()')) {
                body.insertStatements(0, 'const { t } = useTranslation();');
            }
        });
        
        sourceFile.saveSync();
    }
});
