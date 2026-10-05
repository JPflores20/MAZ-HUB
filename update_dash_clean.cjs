const fs = require('fs');
let code = fs.readFileSync('src/routes/dashboard.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import { useMemo, useState } from "react";',
  'import { useState, useEffect } from "react";\nimport { subscribeToRdas } from "@/services/rda-service";\nimport type { Rda } from "@/data/rda";'
);

// 2. Add RDA Progress helper
code = code.replace(
  'function getComputedProgress(p: Pdca): number {',
  `function getRdaComputedProgress(r: Rda): number {
  if (r.status === "Cerrado") return 100;
  if (r.status === "Abierto") return 10;
  if (r.status === "En Progreso") return 50;
  return 0;
}
function getComputedProgress(p: Pdca): number {`
);

// 3. Update Dashboard Logic
const oldDashboardStart = `function Dashboard() {
  const { currentUser } = useAuth();
  // Use the shared context – no additional Firestore subscription needed
  const { pdcaList: userPdcas, refresh } = usePdcas();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const activos = useMemo(() => userPdcas.filter((p) => p.fase !== "Act").length, [userPdcas]);
  const cerrados = useMemo(() => userPdcas.filter((p) => p.fase === "Act").length, [userPdcas]);
  const avance = useMemo(() => {
    if (userPdcas.length === 0) return 0;
    return Math.round(userPdcas.reduce((a, p) => a + getComputedProgress(p), 0) / userPdcas.length);
  }, [userPdcas]);

  const tareas = useMemo(() => userPdcas.flatMap((p) => p.acciones || []), [userPdcas]);
  const pendientes = useMemo(() => tareas.filter((t) => !t.done).length, [tareas]);`;

const newDashboardStart = `function Dashboard() {
  const { currentUser } = useAuth();
  const { pdcaList: userPdcas, refresh } = usePdcas();
  const [rdasList, setRdasList] = useState<Rda[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToRdas((data) => {
      setRdasList(data);
    });
    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const pdcasActivos = userPdcas.filter((p) => p.fase !== "Act").length;
  const rdasActivos = rdasList.filter((r) => r.status !== "Cerrado").length;
  const activos = pdcasActivos + rdasActivos;

  const pdcasCerrados = userPdcas.filter((p) => p.fase === "Act").length;
  const rdasCerrados = rdasList.filter((r) => r.status === "Cerrado").length;
  const cerrados = pdcasCerrados + rdasCerrados;

  const totalProyectos = userPdcas.length + rdasList.length;
  const avance = totalProyectos === 0 ? 0 : Math.round(
    (userPdcas.reduce((a, p) => a + getComputedProgress(p), 0) + 
     rdasList.reduce((a, r) => a + getRdaComputedProgress(r), 0)) / totalProyectos
  );

  const pdcaTareas = userPdcas.flatMap((p) => p.acciones || []);
  const rdaTareasVal = rdasList.flatMap((r) => (r as any).validacion || []);
  const rdaTareasPrev = rdasList.flatMap((r) => (r as any).prevencion || []);
  
  const pendientesPdca = pdcaTareas.filter((t) => !t.done);
  const pendientesRda = [...rdaTareasVal, ...rdaTareasPrev].filter((t) => t.estatus !== "Completa" && t.estatus !== "Completada");
  
  const pendientes = pendientesPdca.length + pendientesRda.length;

  const tareas = [
    ...pendientesPdca.map((t) => ({
      id: t.id,
      description: t.what || t.accion || t.tema || "Sin descripción",
      deadline: t.when || (t as any).fechaLimite || "Sin fecha",
      owner: t.who || t.responsable || "Sin asignar",
      type: "PDCA"
    })),
    ...pendientesRda.map((t) => ({
      id: t.id,
      description: t.accion || t.asunto || "Sin descripción",
      deadline: t.fechaLimite || "Sin fecha",
      owner: t.responsable || "Sin asignar",
      type: "RDA"
    }))
  ];
  
  const recientes = [
    ...userPdcas.map(p => ({
      id: p.id,
      title: p.titulo || "Sin título",
      area: p.area,
      date: p.actualizado,
      progress: getComputedProgress(p),
      phase: p.fase,
      type: 'PDCA'
    })),
    ...rdasList.map(r => ({
      id: r.id,
      title: r.title || "Sin título",
      area: r.context?.planta || "Otra",
      date: new Date(r.updatedAt || Date.now()).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
      progress: getRdaComputedProgress(r),
      phase: r.status,
      type: 'RDA'
    }))
  ].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);`;

code = code.replace(oldDashboardStart, newDashboardStart);

// 4. Update KPI Hints
code = code.replace('hint: "En Plan, Do o Check"', 'hint: "PDCAs y RDAs en curso"');
code = code.replace('hint: "Listos para estandarizar"', 'hint: "Listos para estandarizar / cerrar"');

// 5. Replace Recientes <ul> ONLY
const oldRecientesUl = `<ul className="mt-4 space-y-3">
            {userPdcas.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.area} • actualizado {p.actualizado}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:block">
                    <span
                      className="block h-full rounded-full bg-brand-yellow"
                      style={{ width: \`\${getComputedProgress(p)}%\` }}
                    />
                  </span>
                  <PhaseBadge phase={p.fase} />
                </div>
              </li>
            ))}
            {userPdcas.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay PDCAs registrados para mostrar.
              </li>
            )}
          </ul>`;

const newRecientesUl = `<ul className="mt-4 space-y-3">
            {recientes.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p.type}</span>
                    <p className="truncate text-sm font-semibold">{p.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.area} • actualizado {p.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:block">
                    <span
                      className="block h-full rounded-full bg-brand-yellow"
                      style={{ width: \`\${p.progress}%\` }}
                    />
                  </span>
                  {p.type === 'PDCA' ? (
                    <PhaseBadge phase={p.phase as any} />
                  ) : (
                    <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded border border-current text-blue-600 bg-blue-500/10">
                      {p.phase}
                    </span>
                  )}
                </div>
              </li>
            ))}
            {recientes.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay registros para mostrar.
              </li>
            )}
          </ul>`;

code = code.replace(oldRecientesUl, newRecientesUl);

// 6. Replace Tareas <ul> ONLY
const oldTareasUl = `<ul className="mt-4 space-y-3">
            {tareas
              .filter((t) => !t.done)
              .slice(0, 6)
              .map((t) => (
                <li key={t.id} className="border-l-2 border-brand-yellow pl-3">
                  <p className="text-sm font-medium">{t.what}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.who} • {t.when}
                  </p>
                </li>
              ))}
            {tareas.filter((t) => !t.done).length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay compromisos pendientes.
              </li>
            )}
          </ul>`;

const newTareasUl = `<ul className="mt-4 space-y-3">
            {tareas
              .slice(0, 6)
              .map((t) => (
                <li key={t.id} className="border-l-2 border-brand-yellow pl-3 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-muted text-muted-foreground">{t.type}</span>
                    <p className="text-sm font-medium truncate">{t.description}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.owner} • {t.deadline}
                  </p>
                </li>
              ))}
            {tareas.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay compromisos pendientes.
              </li>
            )}
          </ul>`;

code = code.replace(oldTareasUl, newTareasUl);

fs.writeFileSync('src/routes/dashboard.tsx', code);
