const fs = require("fs");
let f = fs.readFileSync("src/components/RDA/RdaValidationTable.tsx", "utf8");

if (!f.includes("import { DatePicker }")) {
  f = f.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";\nimport { DatePicker } from "@/components/ui/date-picker";',
  );
}

const oldInput =
  /<Input\s*type="date"\s*className="h-9"\s*value=\{row\.fechaLimite\}\s*onChange=\{\(e\) => updateRow\(row\.id, "fechaLimite", e\.target\.value\)\}\s*\/>/;

const newInput = `<DatePicker
                      date={row.fechaLimite ? new Date(row.fechaLimite) : undefined}
                      setDate={(date) => updateRow(row.id, "fechaLimite", date ? date.toISOString() : "")}
                      className="h-9 w-full"
                    />`;

f = f.replace(oldInput, newInput);

fs.writeFileSync("src/components/RDA/RdaValidationTable.tsx", f);
