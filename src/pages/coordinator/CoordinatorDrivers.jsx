import React, { useState, useEffect, useMemo } from 'react';
import { SearchBar, SortDropdown, sortList } from '../../components/ui';
import { Pagination, ITEMS_PER_PAGE } from '../../components/pagination/Pagination';
import { TileCard } from '../../components/cards/TileCard';
import { Loader2 } from 'lucide-react';
import { UserApi } from '../../services/api/userService';

export const CoordinatorDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const users = await UserApi.getUserByRole('DRIVER');
      const driversData = users
        .filter((u) => u.roles && u.roles.includes('DRIVER'))
        .map((u) => ({
          id: u.user_id,
          name: u.name,
          phone: u.mobile_number,
          email: u.email || '',
          status: u.is_active ? 'active' : 'inactive',
        }));
      setDrivers(driversData);
    } catch (error) {
      console.error('Failed to load drivers:', error);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').toString().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }, [drivers, searchQuery]);

  const sorted = useMemo(() => {
    const list = sortList(filtered, sortBy, (c) => c.name || '', (c) => c.id || 0);
    return [...list.filter(c => c.status === 'active'), ...list.filter(c => c.status !== 'active')];
  }, [filtered, sortBy]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-ngo-orange" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-ngo-dark mb-1">Drivers</h1>
          <p className="text-sm text-ngo-gray">View driver details (read-only)</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search drivers..." />
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {paginated.length === 0 ? (
        <p className="text-center text-ngo-gray py-8">No drivers found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {paginated.map((driver) => (
            <TileCard
              key={driver.id}
              title={driver.name}
              subtitle={
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  driver.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {driver.status}
                </span>
              }
              fields={[
                { label: 'Phone', value: driver.phone },
                { label: 'Email', value: driver.email || '—' },
              ]}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={sorted.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
