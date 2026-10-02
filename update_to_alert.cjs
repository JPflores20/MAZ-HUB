const fs = require('fs');
let code = fs.readFileSync('src/components/pdca_dialog/pdca_phase_plan.tsx', 'utf8');

// Add AlertDialog imports
if (!code.includes('AlertDialog,')) {
  code = code.replace(
    /import \{ Popover, PopoverContent, PopoverTrigger \} from "@\/components\/ui\/popover";/,
    `import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";`
  );
}

// Replace Popover block with AlertDialog
const popoverRegex = /<Popover>[\s\S]*?<\/Popover>/g;
let matchCount = 0;
code = code.replace(popoverRegex, (match) => {
  if (match.includes('QUITAR ANÁLISIS') || match.includes('set_has_flavor_correlation')) {
    matchCount++;
    return `<AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                          <X className="size-4 mr-2" /> Quitar Análisis
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Quitar Análisis de Correlación?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción ocultará la sección de correlación de flavors.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => set_has_flavor_correlation?.(false)}
                          >
                            Sí, quitar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>`;
  }
  return match;
});

fs.writeFileSync('src/components/pdca_dialog/pdca_phase_plan.tsx', code);
console.log('Modified pdca_phase_plan.tsx to use AlertDialog. Matches:', matchCount);
