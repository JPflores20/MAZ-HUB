const fs = require('fs');

const file1 = 'src/components/pdca/1.PLAN/paso11/flavor-correlation-section.tsx';
let c1 = fs.readFileSync(file1, 'utf8');
c1 = c1.replace('import React from "react";', 'import React from "react";\nimport { useTranslation } from "react-i18next";');
c1 = c1.replace(/export function FlavorCorrelationSection\([^\{]*\{/m, "$& \n  const { t } = useTranslation();\n");
c1 = c1.replace(/>Editar Puntos</g, '>{t("pdcaPlan.paso11_flavor_section_edit_points", "Editar Puntos")}<');
c1 = c1.replace(/>GESTOR DINÁMICO DE CORRELACIONES</g, '>{t("pdcaPlan.paso11_flavor_section_dynamic_manager", "GESTOR DINÁMICO DE CORRELACIONES")}<');
c1 = c1.replace(/>Nueva Correlación</g, '>{t("pdcaPlan.paso11_flavor_section_new_correlation", "Nueva Correlación")}<');
c1 = c1.replace(/>Guardar y Cerrar</g, '>{t("pdcaPlan.paso11_flavor_section_save_close", "Guardar y Cerrar")}<');
fs.writeFileSync(file1, c1, 'utf8');

const file2 = 'src/components/pdca/1.PLAN/paso14/rendimiento-actual-evidences.tsx';
let c2 = fs.readFileSync(file2, 'utf8');
c2 = c2.replace('import React from "react";', 'import React from "react";\nimport { useTranslation } from "react-i18next";');
c2 = c2.replace(/export function SeccionEvidenciasRendimiento\([^\{]*\{/m, "$& \n  const { t } = useTranslation();\n");
c2 = c2.replace(/>EVIDENCIAS POR INDICADOR</g, '>{t("pdcaPlan.paso14_rendimiento_evidences", "EVIDENCIAS POR INDICADOR")}<');
c2 = c2.replace(/>Subiendo...</g, '>{t("pdcaPlan.paso14_rendimiento_uploading", "Subiendo...")}<');
fs.writeFileSync(file2, c2, 'utf8');

const file3 = 'src/components/pdca/1.PLAN/paso14/rendimiento-actual-step.tsx';
let c3 = fs.readFileSync(file3, 'utf8');
c3 = c3.replace('import React from "react";', 'import React from "react";\nimport { useTranslation } from "react-i18next";');
c3 = c3.replace(/export function RendimientoActualStep\([^\{]*\{/m, "$& \n  const { t } = useTranslation();\n");
c3 = c3.replace(/>Enumere los PIs a ser rastreados.</g, '>{t("pdcaPlan.paso14_rendimiento_step_list_pis", "Enumere los PIs a ser rastreados.")}<');
c3 = c3.replace(/>Agregar Fila</g, '>{t("pdcaPlan.paso14_rendimiento_step_add_row", "Agregar Fila")}<');
fs.writeFileSync(file3, c3, 'utf8');

const file4 = 'src/components/pdca/1.PLAN/paso14/rendimiento-actual-table.tsx';
let c4 = fs.readFileSync(file4, 'utf8');
c4 = c4.replace('import React from "react";', 'import React from "react";\nimport { useTranslation } from "react-i18next";');
c4 = c4.replace(/export function TablaRendimientoActual\([^\{]*\{/m, "$& \n  const { t } = useTranslation();\n");
c4 = c4.replace(/>Estación de trabajo de operador o técnico</g, '>{t("pdcaPlan.paso14_rendimiento_table_workstation", "Estación de trabajo de operador o técnico")}<');
c4 = c4.replace(/>Nombre de Indicador</g, '>{t("pdcaPlan.paso14_rendimiento_table_indicator", "Nombre de Indicador")}<');
c4 = c4.replace(/>Estado Actual</g, '>{t("pdcaPlan.paso14_rendimiento_table_current_state", "Estado Actual")}<');
c4 = c4.replace(/>Puesto Responsable</g, '>{t("pdcaPlan.paso14_rendimiento_table_responsible", "Puesto Responsable")}<');
c4 = c4.replace(/>Herramienta en la que se Encuentra</g, '>{t("pdcaPlan.paso14_rendimiento_table_tool", "Herramienta en la que se Encuentra")}<');
c4 = c4.replace(/>Ubicación de PI</g, '>{t("pdcaPlan.paso14_rendimiento_table_location", "Ubicación de PI")}<');
c4 = c4.replace(/>No hay datos registrados.</g, '>{t("pdcaPlan.paso14_rendimiento_table_no_data", "No hay datos registrados.")}<');
fs.writeFileSync(file4, c4, 'utf8');

const file5 = 'src/components/pdca/1.PLAN/paso18/conclusiones-causa-raiz-table.tsx';
let c5 = fs.readFileSync(file5, 'utf8');
c5 = c5.replace('import React from "react";', 'import React from "react";\nimport { useTranslation } from "react-i18next";');
c5 = c5.replace(/export function TablaConclusionesCausaRaiz\([^\{]*\{/m, "$& \n  const { t } = useTranslation();\n");
c5 = c5.replace(/>No hay conclusiones registradas.</g, '>{t("pdcaPlan.paso18_conclusiones_no_data", "No hay conclusiones registradas.")}<');
fs.writeFileSync(file5, c5, 'utf8');

const file6 = 'src/components/pdca/1.PLAN/paso10/pareto-section.tsx';
let c6 = fs.readFileSync(file6, 'utf8');
c6 = c6.replace('import React, { useState } from "react";', 'import React, { useState } from "react";\nimport { useTranslation } from "react-i18next";');
c6 = c6.replace(/export function ParetoSection\([^\{]*\{/m, "$& \n  const { t } = useTranslation();\n");
fs.writeFileSync(file6, c6, 'utf8');

console.log('Restored translations to the 6 wiped files!');
