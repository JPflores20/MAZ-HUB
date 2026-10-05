const fs = require('fs');
let code = fs.readFileSync('src/routes/rda.tsx', 'utf8');

const oldHeader = `<div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={handleCreateNew}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            <Plus className="mr-2 h-4 w-4" /> Crear Nuevo RDA
          </Button>
        </div>`;

const newHeader = `<div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => window.location.reload()}
            className="hidden sm:flex bg-card"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            className="bg-[#0038A8] hover:bg-[#002d8a] text-white shadow-sm font-semibold"
            onClick={handleCreateNew}
          >
            <Plus className="mr-1.5 size-4" /> Crear Nuevo RDA
          </Button>
        </div>`;

code = code.replace(oldHeader, newHeader);

if (!code.includes('RefreshCw')) {
    code = code.replace(
        'import { Plus, Search, Trash2, Edit } from "lucide-react";',
        'import { Plus, Search, Trash2, Edit, RefreshCw } from "lucide-react";'
    );
}

fs.writeFileSync('src/routes/rda.tsx', code);
