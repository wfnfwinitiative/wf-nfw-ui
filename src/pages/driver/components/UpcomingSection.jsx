import React from 'react';
import { CalendarClock } from 'lucide-react';
import { SectionHeader, DashedSeparator } from '../../../components/common';
import { TaskGrid } from './TaskGrid';

/**
 * Section that lists future (upcoming) assignments.
 * Cards are read-only — drivers cannot fill details until the scheduled day.
 */
export function UpcomingSection({ tasks, onSelect }) {
  return (
    <>
      <DashedSeparator label="Upcoming" />
      <section>
        <SectionHeader
          icon={CalendarClock}
          label="Upcoming Assignments"
          count={tasks.length}
        />
        <TaskGrid tasks={tasks} onSelect={onSelect} disableCards />
      </section>
    </>
  );
}
