import React from "react";
import { type ParticipantesData } from "@/data/pdca";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO, isValid } from "date-fns";
import TextareaAutosize from "react-textarea-autosize";
import { useTranslation } from "react-i18next";

interface PropiedadesParticipantes {
  value: ParticipantesData;
  onChange?: (nuevosParticipantes: ParticipantesData) => void;
  readOnly?: boolean;
}

export function PdcaParticipants({
  value: participantesActuales,
  onChange: alCambiarParticipantes,
  readOnly: modoSoloLectura = false,
}: PropiedadesParticipantes) {
    const { t } = useTranslation();
  
  const actualizarCampoParticipante = (
    nombreCampo: keyof ParticipantesData, 
    nuevoValorCampo: string
  ) => {
    if (alCambiarParticipantes && !modoSoloLectura) {
      alCambiarParticipantes({ 
        ...participantesActuales, 
        [nombreCampo]: nuevoValorCampo 
      });
    }
  };

  const analizarFechaValida = (fechaTexto?: string) => {
    return fechaTexto && isValid(parseISO(fechaTexto)) ? parseISO(fechaTexto) : undefined;
  };

  const formatearFechaGuardado = (nuevaFecha?: Date) => {
    return nuevaFecha ? format(nuevaFecha, "yyyy-MM-dd") : "";
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
                {t('pdcaPlan.dynamic.participantes')}</th>
            </tr>
          </thead>
          <tbody>
            {/* Participantes Locales */}
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 w-[20%] border border-white/20 align-middle text-justify">
                {t('pdcaPlan.dynamic.participantesLocales')}</td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 w-[30%] border border-[#174373]/20">
                <TextareaAutosize
                  value={participantesActuales.localesNombres}
                  onChange={(eventoCambioTextarea) => 
                    actualizarCampoParticipante("localesNombres", eventoCambioTextarea.target.value)
                  }
                  disabled={modoSoloLectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={t('pdcaPlan.dynamic.ejAxelGuillNRam')}
                />
              </td>
              <td className="bg-[#174373] text-white p-3 w-[20%] text-[10px] leading-tight text-left border border-white/20">
                <strong className="block mb-1 text-justify">{t('pdcaPlan.dynamic.papelResponsabilidadEnEsteEquipo')}</strong>
                <span className="text-white/80 text-justify block">
                  {t('pdcaPlan.dynamic.noElTTuloDel')}</span>
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 w-[30%] border border-[#174373]/20">
                <TextareaAutosize
                  value={participantesActuales.localesRoles}
                  onChange={(eventoCambioTextarea) => 
                    actualizarCampoParticipante("localesRoles", eventoCambioTextarea.target.value)
                  }
                  disabled={modoSoloLectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={t('pdcaPlan.dynamic.ejGerenteDeElaboraciN')}
                />
              </td>
            </tr>

            {/* Recursos Externos */}
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle text-justify">
                {t('pdcaPlan.dynamic.recursosExternos')}</td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <TextareaAutosize
                  value={participantesActuales.externosNombres}
                  onChange={(eventoCambioTextarea) => 
                    actualizarCampoParticipante("externosNombres", eventoCambioTextarea.target.value)
                  }
                  disabled={modoSoloLectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={t('pdcaPlan.dynamic.ejManuelPRez')}
                />
              </td>
              <td className="bg-[#174373] text-white p-3 text-[10px] leading-tight text-left border border-white/20">
                <strong className="block mb-1 text-justify">{t('pdcaPlan.dynamic.papelResponsabilidadEnEsteEquipo')}</strong>
                <span className="text-white/80 text-justify block">
                  {t('pdcaPlan.dynamic.noElTTuloDel2')}</span>
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <TextareaAutosize
                  value={participantesActuales.externosRoles}
                  onChange={(eventoCambioTextarea) => 
                    actualizarCampoParticipante("externosRoles", eventoCambioTextarea.target.value)
                  }
                  disabled={modoSoloLectura}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder={t('pdcaPlan.dynamic.ejRegional')}
                />
              </td>
            </tr>

            {/* Fechas Reuniones */}
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle uppercase text-justify">
                {t('pdcaPlan.dynamic.fechaDeLaReuniN')}</td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-2 border border-[#174373]/20">
                <DatePicker
                  date={analizarFechaValida(participantesActuales.fechaReunionInicial)}
                  setDate={(nuevaFecha) => 
                    actualizarCampoParticipante("fechaReunionInicial", formatearFechaGuardado(nuevaFecha))
                  }
                  placeholder={t('pdcaPlan.dynamic.seleccionar')}
                  disabled={modoSoloLectura}
                  className="h-8 w-full text-xs font-bold justify-center shadow-none focus-visible:ring-1 focus-visible:ring-black/20 bg-transparent border-black/10 hover:bg-transparent"
                />
              </td>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle uppercase text-justify">
                {t('pdcaPlan.dynamic.reuniNDeRevisiN')}</td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <Input
                  value={participantesActuales.reunionRutina}
                  onChange={(eventoCambioInput) => 
                    actualizarCampoParticipante("reunionRutina", eventoCambioInput.target.value)
                  }
                  disabled={modoSoloLectura}
                  className="h-9 w-full text-xs font-bold text-center border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:ring-black/20"
                  placeholder={t('pdcaPlan.dynamic.ejSemanalMiRcoles14')}
                />
              </td>
            </tr>
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle uppercase text-justify">
                {t('pdcaPlan.dynamic.fechaDeLaReuniN2')}</td>
              <td colSpan={3} className="bg-[#F2F8FC] dark:bg-secondary p-2 border border-[#174373]/20 text-center">
                <DatePicker
                  date={
                    analizarFechaValida(participantesActuales.fechaReunionFinal) || 
                    analizarFechaValida(participantesActuales.fecha_reunion_final)
                  }
                  setDate={(nuevaFecha) => 
                    actualizarCampoParticipante("fechaReunionFinal", formatearFechaGuardado(nuevaFecha))
                  }
                  placeholder={t('pdcaPlan.dynamic.seleccionar')}
                  disabled={modoSoloLectura}
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
