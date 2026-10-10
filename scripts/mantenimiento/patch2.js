const fs = require("fs");
const path = "src/components/pdca/pdca_dialog.tsx";
let code = fs.readFileSync(path, "utf8");
code = code.replace(
  "<RenderizadorPestanasPdca",
  '<button onClick={() => navigator.clipboard.writeText(JSON.stringify({fw: current_pdca.fiveWhysTables, fw_old: (current_pdca as any).five_whys_tables, fw_very_old: (current_pdca as any).five_whys, ish: current_pdca.ishikawas, ish_old: current_pdca.ishikawaCauses, ish_very_old: (current_pdca as any).ishikawa_causes}, null, 2)).then(() => alert("Copiado! Pega esto al asistente"))} className="bg-red-500 text-white p-2 rounded w-full mb-4 font-bold">CLICK AQUÍ PARA COPIAR DATOS DE DEPURACIÓN AL PORTAPAPELES</button><RenderizadorPestanasPdca',
);
fs.writeFileSync(path, code);
