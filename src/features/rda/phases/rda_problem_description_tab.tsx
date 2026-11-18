/**
 * @fileoverview Structured 5W1H problem description form generating a concatenated anomaly summary.
 */

import { useTranslation } from "react-i18next";
import type { RdaProblemDescription } from "@/domain/models/rda";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

interface RdaProblemDescriptionTabProps {
  data: RdaProblemDescription;
  onChange: (data: RdaProblemDescription) => void;
}

const QUESTION_FIELDS: {
  field: keyof RdaProblemDescription;
  label_key: string;
  help_key: string;
  placeholder: string;
}[] = [
  {
    field: "que",
    label_key: "rdaInternal.what",
    help_key: "rdaInternal.whatHelp",
    placeholder: "Ej. En la marca corona...",
  },
  {
    field: "como",
    label_key: "rdaInternal.how",
    help_key: "rdaInternal.howHelp",
    placeholder: "Ej. Los polifenoles dan por arriba de especificación...",
  },
  {
    field: "cuando",
    label_key: "rdaInternal.when",
    help_key: "rdaInternal.whenHelp",
    placeholder: "Ej. El 7 de junio del 2026 en segundo turno...",
  },
  {
    field: "donde",
    label_key: "rdaInternal.where",
    help_key: "rdaInternal.whereHelp",
    placeholder: "Ej. En los BBT's 25, 28, 58, 60 y 62...",
  },
  {
    field: "quien",
    label_key: "rdaInternal.who",
    help_key: "rdaInternal.whoHelp",
    placeholder: "Ej. Operador de turno 2, personal en entrenamiento...",
  },
  {
    field: "cual",
    label_key: "rdaInternal.which",
    help_key: "rdaInternal.whichHelp",
    placeholder: "Ej. Tendencia al alza en los últimos 3 lotes...",
  },
];

/** Renders the 5W+1H inputs and live concatenated sentence preview. */
export function RdaProblemDescriptionTab({ data, onChange }: RdaProblemDescriptionTabProps) {
  const { t } = useTranslation();

  const handle_field_change = (field_name: keyof RdaProblemDescription, field_value: string) => {
    onChange({ ...data, [field_name]: field_value });
  };

  const concatenated_text = [data.que, data.como, data.cuando, data.donde, data.quien, data.cual]
    .filter(Boolean)
    .map((segment) => segment.trim())
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">{t("rdaInternal.anomalyDefinitionHelp")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {QUESTION_FIELDS.map((question_spec) => (
          <div key={question_spec.field} className="space-y-2">
            <Label className="font-semibold text-base">{t(question_spec.label_key)}</Label>
            <p className="text-xs text-muted-foreground">{t(question_spec.help_key)}</p>
            <Textarea
              placeholder={question_spec.placeholder}
              value={data[question_spec.field]}
              onChange={(change_event) =>
                handle_field_change(question_spec.field, change_event.target.value)
              }
              className="min-h-[100px]"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-8">
        <div className="bg-[#1e293b] border border-border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700/50">
            <h4 className="text-sm font-semibold text-white text-center">
              {t("rdaInternal.problemDesc5W1H")}
            </h4>
          </div>
          <div className="p-4 bg-white dark:bg-transparent min-h-[80px] flex items-center justify-center">
            {concatenated_text ? (
              <p className="text-base font-medium text-foreground text-justify w-full">
                {concatenated_text}
                {concatenated_text.endsWith(".") || concatenated_text.endsWith(",") ? "" : ","}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center">
                {t("rdaInternal.concatenatedDescPlaceholder")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
