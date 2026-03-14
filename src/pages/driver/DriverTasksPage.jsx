import React, { useState, useMemo } from 'react';
import { PickupDetailModal } from './PickupDetailModal';
import { LoadingCard, SectionHeader, EmptySection } from '../../components/common';
import { SearchBar, FilterDropdown } from '../../components/ui';
import { CalendarDays } from 'lucide-react';
import { useDriverTasks } from './hooks/useDriverTasks';
import { TaskGrid } from './components/TaskGrid';
import { UpcomingSection } from './components/UpcomingSection';
import { PreviousSection } from './components/PreviousSection';
import {
  isToday,
  isFuture,
  todayLabel,
  applyStatusFilter,
  STATUS_FILTER_OPTIONS,
} from './utils/taskFilters';

// ── Main page ─────────────────────────────────────────────────────────────────
export const DriverTasksPage = () => {
  const { assignments, loading, error, handleStatusUpdate } = useDriverTasks();
  const [selected,     setSelected]     = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('active');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignments.filter((a) => {
      if (!applyStatusFilter(a, statusFilter)) return false;
      if (!q) return true;
      return (
        (a.pickup?.organizationName || '').toLowerCase().includes(q) ||
        (a.delivery?.hungerSpotName  || '').toLowerCase().includes(q) ||
        (a.opportunityName           || '').toLowerCase().includes(q)
      );
    });
  }, [assignments, searchQuery, statusFilter]);

  const todayTasks    = useMemo(() => filtered.filter((a) =>  isToday(a.pickup?.scheduledTime)), [filtered]);
  const upcomingTasks = useMemo(() => filtered.filter((a) =>  isFuture(a.pickup?.scheduledTime)), [filtered]);
  const previousTasks = useMemo(() => filtered.filter((a) => !isToday(a.pickup?.scheduledTime) && !isFuture(a.pickup?.scheduledTime)), [filtered]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-ngo-dark dark:text-gray-200 mb-1">
          My Tasks
        </h1>
        <p className="text-sm md:text-base text-ngo-gray dark:text-gray-400">
          All your pickup assignments
        </p>
      </div>

      {/* Toolbar: search + status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by donor, location or hunger spot…"
          className="flex-1"
        />
        <FilterDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
          placeholder="All Active"
          label="Filter by status"
          className="w-full sm:w-auto sm:min-w-[200px]"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <LoadingCard key={i} />)}
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-red-100 p-8 text-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      ) : (
        <>
          {/* ── Today ── */}
          <section>
            <SectionHeader
              icon={CalendarDays}
              label={`Today — ${todayLabel()}`}
              count={todayTasks.length}
              accent
            />
            {todayTasks.length === 0
              ? <EmptySection message="No tasks scheduled for today." />
              : <TaskGrid tasks={todayTasks} onSelect={setSelected} />
            }
          </section>

          {/* ── Upcoming tasks ── */}
          {upcomingTasks.length > 0 && (
            <UpcomingSection tasks={upcomingTasks} onSelect={setSelected} />
          )}

          {/* ── Previous tasks with date filter ── */}
          {previousTasks.length > 0 && (
            <PreviousSection tasks={previousTasks} onSelect={setSelected} />
          )}

          {/* Neither section has results */}
          {todayTasks.length === 0 && upcomingTasks.length === 0 && previousTasks.length === 0 && (
            <EmptySection message="No tasks match your search or filter." />
          )}
        </>
      )}

      {/* Detail modal — same as Dashboard */}
      <PickupDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        assignment={selected}
        onStatusUpdate={handleStatusUpdate}
        readOnly={isFuture(selected?.pickup?.scheduledTime)}
      />
    </div>
  );
};
