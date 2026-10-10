import React from "react";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import type { RdaAnalysis } from "@/data/rda";
import { MultiImageUploadSection } from "@/components/pdca/image-upload-section";

interface RdaAnalysisTabProps {
  data: RdaAnalysis;
  onChange: (data: RdaAnalysis) => void;
}

export function RdaAnalysisTab({ data, onChange }: RdaAnalysisTabProps) {
  const { t } = useTranslation();

  const updateField = (field: keyof RdaAnalysis, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          {t('rdaInternal.infoText')}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">{t('rdaInternal.analysisTitle')}</label>
          <Textarea
            placeholder={t('rdaInternal.analysisPlaceholder')}
            value={data.data}
            onChange={(e) => updateField("data", e.target.value)}
            className="min-h-[200px]"
          />
        </div>

        <div className="pt-4">
          <MultiImageUploadSection
            images={data.images || []}
            onChange={(imgs) => updateField("images", imgs)}
            title={t('rdaInternal.graphsTitle')}
            subtitle={t('rdaInternal.graphsSubtitle')}
          />
        </div>
      </div>
    </div>
  );
}
