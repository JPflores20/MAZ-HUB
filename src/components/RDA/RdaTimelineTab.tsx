import React, { useState } from "react";
import type { RdaTimelineEvent } from "@/data/rda";
import { ProblemTimelineSection } from "@/components/pdca/1.PLAN/paso1/problem-timeline-section";

interface RdaTimelineTabProps {
  events: RdaTimelineEvent[];
  onChange: (events: RdaTimelineEvent[]) => void;
}

export function RdaTimelineTab({ events, onChange }: RdaTimelineTabProps) {
  const [timelineOption, setTimelineOption] = useState<"A" | "B">("A");
  const [timelineFilter, setTimelineFilter] = useState<"day" | "week" | "month" | "3months">("day");

  const handleEventsChange = (newEvents: { id: string; time: string; description: string }[]) => {
    // Merge existing images if needed, or just cast
    const merged = newEvents.map(newEv => {
      const existing = events.find(e => e.id === newEv.id);
      return {
        ...newEv,
        images: existing?.images || []
      };
    });
    onChange(merged);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
        <p className="text-sm text-blue-800">
          Construye una secuencia cronológica de los eventos previos y posteriores a la detección del problema, 
          apoyándose en horarios, descripciones operativas y registros visuales o pantallazos.
        </p>
      </div>

      <div className="-mx-6 -mt-6">
        {/* We use negative margins to negate the padding of the parent card in RdaDialog, 
            so the timeline section fits nicely as it renders its own Card. */}
        <ProblemTimelineSection
          timelineOption={timelineOption}
          onOptionChange={setTimelineOption}
          timelineFilter={timelineFilter}
          onFilterChange={setTimelineFilter}
          events={events}
          onEventsChange={handleEventsChange}
        />
      </div>
    </div>
  );
}
