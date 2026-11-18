/**
 * @fileoverview Chronological timeline editor wrapper adapting PDCA timeline section for RDA events.
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ProblemTimelineSection } from "@/features/pdca/plan/paso_1/problem_timeline_section";
import type { RdaTimelineEvent } from "@/domain/models/rda";

interface RdaTimelineTabProps {
  events: RdaTimelineEvent[];
  onChange: (events: RdaTimelineEvent[]) => void;
}

/** Wraps ProblemTimelineSection while preserving existing attached event images across edits. */
export function RdaTimelineTab({ events, onChange }: RdaTimelineTabProps) {
  const { t } = useTranslation();
  const [timeline_option, set_timeline_option] = useState<"A" | "B">("A");
  const [timeline_filter, set_timeline_filter] = useState<"day" | "week" | "month" | "3months">(
    "day",
  );

  const handle_events_change = (
    updated_events: { id: string; time: string; description: string }[],
  ) => {
    const merged_events = updated_events.map((new_event) => {
      const existing_event = events.find((existing_item) => existing_item.id === new_event.id);
      return {
        ...new_event,
        images: existing_event?.images || [],
      };
    });
    onChange(merged_events);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-2">
        <p className="text-sm text-blue-800">{t("rdaInternal.timelineHelp")}</p>
      </div>

      <div className="-mx-6 -mt-6">
        <ProblemTimelineSection
          timelineOption={timeline_option}
          onOptionChange={set_timeline_option}
          timelineFilter={timeline_filter}
          onFilterChange={set_timeline_filter}
          events={events}
          onEventsChange={handle_events_change}
        />
      </div>
    </div>
  );
}
