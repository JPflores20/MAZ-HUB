const fs = require("fs");
let code = fs.readFileSync("src/routes/rda.tsx", "utf8");

code = code.replace(
  /<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">[\s\S]*?<div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">/,
  `<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {['Abierto', 'En Progreso', 'Cerrado'].map(status => {
          const color = status === 'Abierto' ? 'border-t-phase-plan' : status === 'En Progreso' ? 'border-t-phase-do' : 'border-t-phase-check';
          const bgDot = status === 'Abierto' ? 'bg-phase-plan' : status === 'En Progreso' ? 'bg-phase-do' : 'bg-phase-check';
          return (
            <button key={status} className={\`rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] text-left transition-all hover:scale-[1.01] border-t-4 \${color}\`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={\`w-2 h-2 rounded-full \${bgDot}\`}></span>
                  <span className="text-sm font-semibold uppercase">{status}</span>
                </div>
                <span className="text-2xl font-bold">{rdas.filter(r => r.status === status).length}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">RDAs en estatus {status.toLowerCase()}</p>
            </button>
          )
        })}
      </div>

      <div className="mb-6 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">`,
);

fs.writeFileSync("src/routes/rda.tsx", code);
