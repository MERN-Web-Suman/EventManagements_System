// src/pages/Events.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/api';
import EventCard from '../components/events/EventCard';
import { SkeletonGrid } from '../components/common/SkeletonCard';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CATEGORIES = ['All', 'Music', 'Technology', 'Sports', 'Art', 'Food', 'Business', 'Comedy', 'Education', 'Health', 'Other'];
const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Date: Soonest' },
  { value: 'date-desc', label: 'Date: Latest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, limit: 9,
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        sortBy, sortOrder,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        status: 'upcoming',
      };
      const { data } = await eventService.getEvents(params);
      setEvents(data.data.events);
      setPagination(data.data.pagination);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sortBy, sortOrder, minPrice, maxPrice]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleSort = (value) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setSortBy('date');
    setSortOrder('asc');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  const hasActiveFilters = search || category !== 'All' || minPrice || maxPrice;

  return (
    <div className="page-enter min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-black text-4xl text-white mb-2">Discover Events</h1>
          <p className="text-gray-400">Find your next unforgettable experience</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass rounded-2xl p-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, venues, cities..."
                className="w-full bg-dark-800 text-white placeholder-gray-500 rounded-xl pl-9 pr-4 py-2.5 text-sm input-glow border border-white/10 focus:border-primary-500/50"
              />
            </div>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => handleSort(e.target.value)}
              className="bg-dark-800 text-white rounded-xl px-4 py-2.5 text-sm border border-white/10 input-glow"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 glass rounded-xl text-sm text-gray-300 hover:text-white transition-all"
            >
              <FiFilter size={14} /> Filters
              {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full"></span>}
            </button>

            <button type="submit" className="px-6 py-2.5 bg-orange-gradient text-white font-semibold rounded-xl text-sm hover:opacity-90 transition-all shadow-lg shadow-primary-500/20">
              Search
            </button>

            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="flex items-center gap-1 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 rounded-xl hover:bg-red-500/10 transition-all">
                <FiX size={14} /> Clear
              </button>
            )}
          </form>

          {/* Extended filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Min Price (₹)</label>
                <input
                  type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0"
                  className="w-full bg-dark-800 text-white rounded-xl px-3 py-2 text-sm border border-white/10 input-glow"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Max Price (₹)</label>
                <input
                  type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any"
                  className="w-full bg-dark-800 text-white rounded-xl px-3 py-2 text-sm border border-white/10 input-glow"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-orange-gradient text-white shadow-lg shadow-primary-500/20'
                  : 'glass text-gray-400 hover:text-white hover:border-primary-500/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="text-gray-400 text-sm mb-6">
            Showing <span className="text-white font-medium">{events.length}</span> of{' '}
            <span className="text-white font-medium">{pagination.total || 0}</span> events
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <SkeletonGrid count={9} />
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => <EventCard key={event._id} event={event} />)}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-display font-semibold text-xl text-white mb-2">No events found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft /> Prev
            </button>

            <div className="flex gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - page) <= 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                      p === page ? 'bg-orange-gradient text-white' : 'glass text-gray-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
