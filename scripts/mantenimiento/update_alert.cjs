const fs = require("fs");

let f = fs.readFileSync("src/routes/rda.tsx", "utf8");

// 1. Add AlertDialog imports
if (!f.includes("AlertDialog")) {
  f = f.replace(
    'import { Rda, defaultRda } from "@/data/rda";',
    `import { Rda, defaultRda } from "@/data/rda";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";`,
  );
}

// 2. Add state
if (!f.includes("rdaToDelete")) {
  f = f.replace(
    "const [isDialogOpen, setIsDialogOpen] = useState(false);",
    "const [isDialogOpen, setIsDialogOpen] = useState(false);\n  const [rdaToDelete, setRdaToDelete] = useState<string | null>(null);",
  );
}

// 3. Update handleDelete and add confirmDelete
f = f.replace(
  /const handleDelete = async \(id: string\) => {[\s\S]*?};/,
  `const handleDelete = (id: string) => {
    setRdaToDelete(id);
  };

  const confirmDelete = async () => {
    if (rdaToDelete) {
      await deleteRda(rdaToDelete);
      setRdaToDelete(null);
    }
  };`,
);

// 4. Inject the AlertDialog at the end of the return statement in RdaPage (which returns the main dashboard)
// The dashboard returns <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
// We can just append the AlertDialog right before the final </div> of that view.
const dashboardEndTag = `      </div>
    </div>
  );
}`;

const alertDialogJSX = `      <AlertDialog open={!!rdaToDelete} onOpenChange={(open) => !open && setRdaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar RDA?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este Reporte de Anomalía? Esta acción no se puede deshacer y se perderán todos los datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}`;

if (!f.includes("<AlertDialog open={!!rdaToDelete}")) {
  f = f.replace(dashboardEndTag, alertDialogJSX);
}

fs.writeFileSync("src/routes/rda.tsx", f);
