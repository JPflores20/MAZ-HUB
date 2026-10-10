const fs = require("fs");
let code = fs.readFileSync("src/routes/rda.tsx", "utf8");

const rdaPageTop = `function RdaPage() {
  const [rdas, setRdas] = useState<Rda[]>([]);
  const [selectedRda, setSelectedRda] = useState<Rda | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);`;

const newRenderLogic = `  if (selectedRda || isDialogOpen) {
    return (
      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
        <RdaDialog
          rda={selectedRda}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRda(null);
              setIsDialogOpen(false);
            }
          }}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (`;

code = code.replace(
  '  return (\n    <div className="mx-auto w-full',
  newRenderLogic + '\n    <div className="mx-auto w-full',
);

fs.writeFileSync("src/routes/rda.tsx", code);
