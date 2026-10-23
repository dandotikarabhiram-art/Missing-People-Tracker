import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { MissingPersonReport, CaseFilterOptions } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import {
  Search,
  Filter,
  X,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface SearchCasesProps {
  navigate: (path: string) => void;
  initialQuery?: string;
}

export const SearchCases: React.FC<SearchCasesProps> = ({ navigate, initialQuery = '' }) => {
  const { cases, isLoading } = useData();
  const { role } = useAuth();

  const [filters, setFilters] = useState<CaseFilterOptions>({
    searchQuery: initialQuery,
    gender: 'All',
    status: 'All',
    priority: 'All',
    city: '',
    state: '',
    sortBy: 'newest',
  });

  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const itemsPerPage = 8;

  useEffect(() => {
    if (initialQuery) {
      setFilters(prev => ({ ...prev, searchQuery: initialQuery }));
    }
  }, [initialQuery]);

  // Public visitors only see approved public cases
  const availableCases = useMemo(() => {
    if (role === 'admin') return cases;
    if (role === 'investigator') return cases.filter(c => c.visibility === 'public' || role === 'investigator');
    return cases.filter(c => c.visibility === 'public' && c.status !== 'Pending Review' && c.status !== 'Rejected');
  }, [cases, role]);

  // Apply filters
  const filteredCases = useMemo(() => {
    return availableCases.filter(c => {
      // Text query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = c.fullName.toLowerCase().includes(q);
        const matchesRef = c.referenceNumber.toLowerCase().includes(q);
        const matchesCity = c.lastSeenCity.toLowerCase().includes(q);
        const matchesState = c.lastSeenState.toLowerCase().includes(q);
        const matchesFeatures = c.identifyingFeatures.toLowerCase().includes(q);
        if (!matchesName && !matchesRef && !matchesCity && !matchesState && !matchesFeatures) {
          return false;
        }
      }

      // Age range
      const minAge = ageRange.min ? parseInt(ageRange.min, 10) : undefined;
      const maxAge = ageRange.max ? parseInt(ageRange.max, 10) : undefined;
      if (minAge !== undefined && !isNaN(minAge) && c.age < minAge) return false;
      if (maxAge !== undefined && !isNaN(maxAge) && c.age > maxAge) return false;

      // Gender
      if (filters.gender && filters.gender !== 'All' && c.gender !== filters.gender) return false;

      // Location
      if (filters.city && !c.lastSeenCity.toLowerCase().includes(filters.city.toLowerCase().trim())) return false;
      if (filters.state && !c.lastSeenState.toLowerCase().includes(filters.state.toLowerCase().trim())) return false;

      // Status
      if (filters.status && filters.status !== 'All' && c.status !== filters.status) return false;

      // Priority
      if (filters.priority && filters.priority !== 'All' && c.priority !== filters.priority) return false;

      // Date Last Seen
      if (filters.dateFrom && c.dateLastSeen < filters.dateFrom) return false;
      if (filters.dateTo && c.dateLastSeen > filters.dateTo) return false;

      // Endangered checkbox
      if (filters.isEndangered && !c.isEndangeredOrChild) return false;

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filters.sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (filters.sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (filters.sortBy === 'age') return a.age - b.age;
      return 0;
    });
  }, [availableCases, filters, ageRange]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;
  const paginatedCases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCases.slice(start, start + itemsPerPage);
  }, [filteredCases, currentPage]);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      gender: 'All',
      status: 'All',
      priority: 'All',
      city: '',
      state: '',
      sortBy: 'newest',
    });
    setAgeRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.searchQuery ||
    filters.gender !== 'All' ||
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.city ||
    filters.state ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.isEndangered ||
    ageRange.min ||
    ageRange.max;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">Search Missing Directory</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Browse verified public cases, filter by Indian jurisdiction or characteristics, and submit community observations.
          </p>
        </div>

        <button
          onClick={() => navigate('/report')}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          + File Missing Report
        </button>
      </div>

      {/* Main Search Bar & Quick Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => {
                setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search by full name, report reference number (e.g. MPT-IN-2026-0041), station, city, or state..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-slate-50/50 font-medium"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 transition cursor-pointer ${
                hasActiveFilters
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              )}
            </button>

            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="name">Sort: Name (A-Z)</option>
                <option value="age">Sort: Age</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters Box */}
        {isFilterDrawerOpen && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in text-xs">
            {/* Age Range */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age Range</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Min"
                  value={ageRange.min}
                  onChange={e => {
                    setAgeRange(prev => ({ ...prev, min: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-1/2 p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="Max"
                  value={ageRange.max}
                  onChange={e => {
                    setAgeRange(prev => ({ ...prev, max: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-1/2 p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={filters.gender}
                onChange={e => {
                  setFilters(prev => ({ ...prev, gender: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 bg-white"
              >
                <option value="All">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Case Status</label>
              <select
                value={filters.status}
                onChange={e => {
                  setFilters(prev => ({ ...prev, status: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 bg-white"
              >
                <option value="All">All Public Statuses</option>
                <option value="Verified / Active">Verified / Active</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="New Lead Received">New Lead Received</option>
                <option value="Located — Awaiting Confirmation">Located — Awaiting Confirmation</option>
                <option value="Resolved / Closed">Resolved / Closed</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={filters.priority}
                onChange={e => {
                  setFilters(prev => ({ ...prev, priority: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500 bg-white"
              >
                <option value="All">All Priority Levels</option>
                <option value="Critical / Endangered">Critical / Endangered</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / District</label>
              <input
                type="text"
                placeholder="e.g. New Delhi, Mumbai, Bengaluru, Howrah"
                value={filters.city}
                onChange={e => {
                  setFilters(prev => ({ ...prev, city: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* State / Union Territory */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State / Union Territory</label>
              <select
                value={filters.state}
                onChange={e => {
                  setFilters(prev => ({ ...prev, state: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-amber-500 bg-white"
              >
                <option value="">All Indian States & UTs</option>
                <option value="Delhi">Delhi (NCR)</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Kerala">Kerala</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Punjab">Punjab</option>
                <option value="Bihar">Bihar</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Haryana">Haryana</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Odisha">Odisha</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Goa">Goa</option>
                <option value="Uttarakhand">Uttarakhand</option>
              </select>
            </div>

            {/* Date Seen Range */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Last Seen After</label>
              <input
                type="date"
                value={filters.dateFrom || ''}
                onChange={e => {
                  setFilters(prev => ({ ...prev, dateFrom: e.target.value }));
                  setCurrentPage(1);
                }}
                className="w-full p-2 rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Endangered toggle */}
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!filters.isEndangered}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, isEndangered: e.target.checked }));
                    setCurrentPage(1);
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-800">Child / Endangered Only</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Count & Active Status */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong>{filteredCases.length}</strong> matching approved case{filteredCases.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' (filtered)'}
        </div>
        <div>
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">No Matching Reports Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              We couldn't find any public verified reports matching your search parameters. Try broadening your location or clearing filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-lg bg-teal-600 text-white font-bold text-xs hover:bg-teal-500 transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedCases.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/case/${item.id}`)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 cursor-pointer flex flex-col group"
            >
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={item.photoUrl}
                  alt={item.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                  <StatusBadge status={item.status} className="shadow-sm backdrop-blur-md bg-white/95" />
                  {item.priority === 'Critical / Endangered' && (
                    <PriorityBadge priority={item.priority} className="shadow-sm backdrop-blur-md bg-white/95" />
                  )}
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-950/85 text-[10px] text-white font-mono tabular-nums border border-white/10">
                  {item.referenceNumber}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg group-hover:text-amber-700 transition-colors">
                    {item.fullName}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{item.age} yrs old</span>
                    <span>&bull;</span>
                    <span>{item.gender}</span>
                    {item.height && (
                      <>
                        <span>&bull;</span>
                        <span>{item.height}</span>
                      </>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">
                        {item.lastSeenCity}, {item.lastSeenState}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Last Seen: {item.dateLastSeen}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
                  <span className="group-hover:underline">View Case Profile</span>
                  <span className="text-[11px] text-slate-400 group-hover:text-teal-600">&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                currentPage === idx + 1
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
