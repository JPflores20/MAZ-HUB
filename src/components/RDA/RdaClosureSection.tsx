import { useTranslation } from "react-i18next";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { RdaStandardization, RdaClosure } from "@/data/rda";

interface RdaClosureSectionProps {
  standardization?: RdaStandardization;
  closure?: RdaClosure;
  onChange: (standardization: RdaStandardization, closure: RdaClosure) => void;
}

const defaultStd: RdaStandardization = {
  requiereActualizarMapeo: false,
  requiereOwd: false,
  requiereActualizarSop: false,
  requiereCapacitacion: false,
  requiereMonitoreoIp: false,
};

const defaultClosure: RdaClosure = {
  eliminoCausaRaiz: false,
  requiereEscalar: false,
  necesitaCapex: false,
  incluyeComoGop: false,
  fechaFinalizacion: "",
};

export function RdaClosureSection({
  standardization = defaultStd,
  closure = defaultClosure,
  onChange,
}: RdaClosureSectionProps) {
  const { t } = useTranslation();

  const updateStd = (field: keyof RdaStandardization, value: boolean) => {
    onChange({ ...standardization, [field]: value }, closure);
  };

  const updateClosureBool = (field: keyof RdaClosure, value: boolean) => {
    onChange(standardization, { ...closure, [field]: value });
  };

  const updateClosureText = (field: keyof RdaClosure, value: string) => {
    onChange(standardization, { ...closure, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Standardization */}
      <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2">{t('rdaInternal.standardizationTitle')}</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="req-mapeo"
              checked={standardization.requiereActualizarMapeo}
              onCheckedChange={(checked) => updateStd("requiereActualizarMapeo", !!checked)}
            />
            <Label htmlFor="req-mapeo" className="font-normal cursor-pointer">
              {t('rdaInternal.reqMapeoLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="req-owd"
              checked={standardization.requiereOwd}
              onCheckedChange={(checked) => updateStd("requiereOwd", !!checked)}
            />
            <Label htmlFor="req-owd" className="font-normal cursor-pointer">
              {t('rdaInternal.reqOwdLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="req-sop"
              checked={standardization.requiereActualizarSop}
              onCheckedChange={(checked) => updateStd("requiereActualizarSop", !!checked)}
            />
            <Label htmlFor="req-sop" className="font-normal cursor-pointer">
              {t('rdaInternal.reqSopLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="req-cap"
              checked={standardization.requiereCapacitacion}
              onCheckedChange={(checked) => updateStd("requiereCapacitacion", !!checked)}
            />
            <Label htmlFor="req-cap" className="font-normal cursor-pointer">
              {t('rdaInternal.reqCapacitacionLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="req-monitoreo"
              checked={standardization.requiereMonitoreoIp}
              onCheckedChange={(checked) => updateStd("requiereMonitoreoIp", !!checked)}
            />
            <Label htmlFor="req-monitoreo" className="font-normal cursor-pointer">
              {t('rdaInternal.reqMonitoreoLabel')}
            </Label>
          </div>
        </div>
      </div>

      {/* Closure */}
      <div className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold border-b pb-2">{t('rdaInternal.closureTitle')}</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clo-raiz"
              checked={closure.eliminoCausaRaiz}
              onCheckedChange={(checked) => updateClosureBool("eliminoCausaRaiz", !!checked)}
            />
            <Label htmlFor="clo-raiz" className="font-normal cursor-pointer">
              {t('rdaInternal.cloRaizLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clo-escalar"
              checked={closure.requiereEscalar}
              onCheckedChange={(checked) => updateClosureBool("requiereEscalar", !!checked)}
            />
            <Label htmlFor="clo-escalar" className="font-normal cursor-pointer">
              {t('rdaInternal.cloEscalarLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clo-capex"
              checked={closure.necesitaCapex}
              onCheckedChange={(checked) => updateClosureBool("necesitaCapex", !!checked)}
            />
            <Label htmlFor="clo-capex" className="font-normal cursor-pointer">
              {t('rdaInternal.cloCapexLabel')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="clo-gop"
              checked={closure.incluyeComoGop}
              onCheckedChange={(checked) => updateClosureBool("incluyeComoGop", !!checked)}
            />
            <Label htmlFor="clo-gop" className="font-normal cursor-pointer">
              {t('rdaInternal.cloGopLabel')}
            </Label>
          </div>

          <div className="pt-4 space-y-2">
            <Label htmlFor="fecha-fin" className="font-semibold text-sm">
              {t('rdaInternal.fechaFinLabel')}
            </Label>
            <Input
              id="fecha-fin"
              type="date"
              value={closure.fechaFinalizacion}
              onChange={(e) => updateClosureText("fechaFinalizacion", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
