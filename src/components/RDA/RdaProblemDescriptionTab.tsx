import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RdaProblemDescription } from "@/data/rda";
import { useTranslation } from "react-i18next";

interface RdaProblemDescriptionTabProps {
  data: RdaProblemDescription;
  onChange: (data: RdaProblemDescription) => void;
}

export function RdaProblemDescriptionTab({ data, onChange }: RdaProblemDescriptionTabProps) {
  const { t } = useTranslation();
  
  const handleChange = (field: keyof RdaProblemDescription, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const concatenatedText = [data.que, data.como, data.cuando, data.donde, data.quien, data.cual]
    .filter(Boolean)
    .map((s) => s.trim())
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          {t("rdaInternal.anomalyDefinitionHelp")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-semibold text-base">{t("rdaInternal.what")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("rdaInternal.whatHelp")}
          </p>
          <Textarea
            placeholder="Ej. En la marca corona..."
            value={data.que}
            onChange={(e) => handleChange("que", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">{t("rdaInternal.how")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("rdaInternal.howHelp")}
          </p>
          <Textarea
            placeholder="Ej. Los polifenoles dan por arriba de especificación..."
            value={data.como}
            onChange={(e) => handleChange("como", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">{t("rdaInternal.when")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("rdaInternal.whenHelp")}
          </p>
          <Textarea
            placeholder="Ej. El 7 de junio del 2026 en segundo turno..."
            value={data.cuando}
            onChange={(e) => handleChange("cuando", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">{t("rdaInternal.where")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("rdaInternal.whereHelp")}
          </p>
          <Textarea
            placeholder="Ej. En los BBT's 25, 28, 58, 60 y 62..."
            value={data.donde}
            onChange={(e) => handleChange("donde", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">{t("rdaInternal.who")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("rdaInternal.whoHelp")}
          </p>
          <Textarea
            placeholder="Ej. Operador de turno 2, personal en entrenamiento..."
            value={data.quien}
            onChange={(e) => handleChange("quien", e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label className="font-semibold text-base">{t("rdaInternal.which")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("rdaInternal.whichHelp")}
          </p>
          <Textarea
            placeholder="Ej. Tendencia al alza en los últimos 3 lotes..."
            value={data.cual}
            onChange={(e) => handleChange("cual", e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <div className="mt-8 border-t pt-8">
        <div className="bg-[#1e293b] border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700/50">
            <h4 className="text-sm font-semibold text-white text-center">
              {t("rdaInternal.problemDesc5W1H")}
            </h4>
          </div>
          <div className="p-4 bg-white dark:bg-transparent text-center min-h-[80px] flex items-center justify-center">
            {concatenatedText ? (
              <p className="text-base font-medium text-foreground">
                {concatenatedText}
                {concatenatedText.endsWith(".") || concatenatedText.endsWith(",") ? "" : ","}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {t("rdaInternal.concatenatedDescPlaceholder")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
