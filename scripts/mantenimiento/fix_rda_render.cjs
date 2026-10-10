const fs = require("fs");
let code = fs.readFileSync("src/routes/rda.tsx", "utf8");

// 1. Remove the <RdaDialog /> from the bottom
code = code.replace(/<RdaDialog[\s\S]*?\/>/, "");

// 2. Insert the conditional rendering at the beginning of the return
code = code.replace(
  '  return (\n      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">',
  `  if (selectedRda || isDialogOpen) {
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

  return (
      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">`,
);

fs.writeFileSync("src/routes/rda.tsx", code);
