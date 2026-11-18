/**
 * @fileoverview Tabla de registro de participantes locales, recursos externos y fechas clave de reunión del PDCA.
 */
import { format, parseISO, isValid } from "date-fns";
import TextareaAutosize from "react-textarea-autosize";
import { useTranslation } from "react-i18next";
import type { ParticipantesData } from "@/domain/pdca";
import { Input } from "@/shared/ui/input";
import { DatePicker } from "@/shared/ui/date_picker";

interface PropiedadesParticipantes {
  value: ParticipantesData;
  onChange?: (nuevos_participantes: ParticipantesData) => void;
  readOnly?: boolean;
}

const analizar_fecha_iso = (fecha_texto?: string): Date | undefined =>
  fecha_texto && isValid(parseISO(fecha_texto)) ? parseISO(fecha_texto) : undefined;

const formatear_fecha_iso = (fecha?: Date): string =>
  fecha ? format(fecha, "yyyy-MM-dd") : "";

/**
 * Permite registrar los integrantes del equipo, sus roles dentro del proyecto y las fechas de seguimiento.
 */
export function PdcaParticipants({
  value: participantes_actuales,
  onChange: al_cambiar_participantes,
  readOnly: solo_lectura = false,
}: PropiedadesParticipantes) {
  const { t: translate } = useTranslation();

  const actualizar_campo = (nombre_campo: keyof ParticipantesData, nuevo_valor: string) => {
    if (al_cambiar_participantes && !solo_lectura) {
      al_cambiar_participantes({ ...participantes_actuales, [nombre_campo]: nuevo_valor });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto rounded-sm border border-[#174373]">
        <table className="w-full border-collapse text-xs text-center">
          <thead>
            <tr className="bg-[#174373] text-white">
              <th
                colSpan={4}
                className="p-1.5 font-bold uppercase tracking-widest text-[11px] border border-[#174373]"
              >
                {translate("pdcaPlan.dynamic.participantes")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 w-[20%] border border-white/20 align-middle text-justify">
                {translate("pdcaPlan.dynamic.participantesLocales")}
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 w-[30%] border border-[#174373]/20">
                <TextareaAutosize
                  value={participantes_actuales.localesNombres}
                  onChange={(evento) => actualizar_campo("localesNombres", evento.target.value)}
                  disabled={solo_lectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={translate("pdcaPlan.dynamic.ejAxelGuillNRam")}
                />
              </td>
              <td className="bg-[#174373] text-white p-3 w-[20%] text-[10px] leading-tight text-left border border-white/20">
                <strong className="block mb-1 text-justify">
                  {translate("pdcaPlan.dynamic.papelResponsabilidadEnEsteEquipo")}
                </strong>
                <span className="text-white/80 text-justify block">
                  {translate("pdcaPlan.dynamic.noElTTuloDel")}
                </span>
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 w-[30%] border border-[#174373]/20">
                <TextareaAutosize
                  value={participantes_actuales.localesRoles}
                  onChange={(evento) => actualizar_campo("localesRoles", evento.target.value)}
                  disabled={solo_lectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={translate("pdcaPlan.dynamic.ejGerenteDeElaboraciN")}
                />
              </td>
            </tr>

            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle text-justify">
                {translate("pdcaPlan.dynamic.recursosExternos")}
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <TextareaAutosize
                  value={participantes_actuales.externosNombres}
                  onChange={(evento) => actualizar_campo("externosNombres", evento.target.value)}
                  disabled={solo_lectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={translate("pdcaPlan.dynamic.ejManuelPRez")}
                />
              </td>
              <td className="bg-[#174373] text-white p-3 text-[10px] leading-tight text-left border border-white/20">
                <strong className="block mb-1 text-justify">
                  {translate("pdcaPlan.dynamic.papelResponsabilidadEnEsteEquipo")}
                </strong>
                <span className="text-white/80 text-justify block">
                  {translate("pdcaPlan.dynamic.noElTTuloDel2")}
                </span>
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <TextareaAutosize
                  value={participantes_actuales.externosRoles}
                  onChange={(evento) => actualizar_campo("externosRoles", evento.target.value)}
                  disabled={solo_lectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={translate("pdcaPlan.dynamic.ejRegional")}
                />
              </td>
            </tr>

            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle uppercase text-justify">
                {translate("pdcaPlan.dynamic.fechaDeLaReuniN")}
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-2 border border-[#174373]/20">
                <DatePicker
                  date={analizar_fecha_iso(participantes_actuales.fechaReunionInicial)}
                  setDate={(nueva_fecha) =>
                    actualizar_campo("fechaReunionInicial", formatear_fecha_iso(nueva_fecha))
                  }
                  placeholder={translate("pdcaPlan.dynamic.seleccionar")}
                  disabled={solo_lectura}
                  className="h-8 w-full text-xs font-bold justify-center shadow-none focus-visible:ring-1 focus-visible:ring-black/20 bg-transparent border-black/10 hover:bg-transparent"
                />
              </td>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle uppercase text-justify">
                {translate("pdcaPlan.dynamic.reuniNDeRevisiN")}
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <Input
                  value={participantes_actuales.reunionRutina}
                  onChange={(evento) => actualizar_campo("reunionRutina", evento.target.value)}
                  disabled={solo_lectura}
                  className="h-9 w-full text-xs font-bold text-center border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:ring-black/20"
                  placeholder={translate("pdcaPlan.dynamic.ejSemanalMiRcoles14")}
                />
              </td>
            </tr>
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle uppercase text-justify">
                {translate("pdcaPlan.dynamic.fechaDeLaReuniN2")}
              </td>
              <td
                colSpan={3}
                className="bg-[#F2F8FC] dark:bg-secondary p-2 border border-[#174373]/20 text-center"
              >
                <DatePicker
                  date={
                    analizar_fecha_iso(participantes_actuales.fechaReunionFinal) ||
                    analizar_fecha_iso(participantes_actuales.fecha_reunion_final)
                  }
                  setDate={(nueva_fecha) =>
                    actualizar_campo("fechaReunionFinal", formatear_fecha_iso(nueva_fecha))
                  }
                  placeholder={translate("pdcaPlan.dynamic.seleccionar")}
                  disabled={solo_lectura}
                  className="h-8 w-[50%] mx-auto text-xs font-bold justify-center shadow-none focus-visible:ring-1 focus-visible:ring-black/20 bg-transparent border-black/10 hover:bg-transparent"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
