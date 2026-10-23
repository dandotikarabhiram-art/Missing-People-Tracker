import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { CaseMap } from '../components/map/CaseMap';
import { MissingPersonReport } from '../types';
import { MapPin, Search, Filter, Shield, AlertTriangle } from 'lucide-react';

interface FullMapPageProps {
  navigate: (path: string) => void;
}

export const FullMapPage: React.FC<FullMapPageProps> = ({ navigate }) => {
  const { cases } = useData();
  const [regionSearch, setRegionSearch] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<string | undefined>();

  const publicCases = cases.filter(
    c => c.visibility === 'public' && c.status !== 'Pending Review' && c.status !== 'Rejected'
  );

  const filteredCases = publicCases.filter(c => {
    if (!regionSearch.trim()) return true;
    const q = regionSearch.toLowerCase().trim();
    return (
      c.lastSeenCity.toLowerCase().includes(q) ||
      c.lastSeenState.toLowerCase().includes(q) ||
      c.fullName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-teal-600" /> Geographic Case Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing verified last-seen geographic vicinities across North America.
          </p>
        </div>

        {/* Region filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={regionSearch}
            onChange={e => setRegionSearch(e.target.value)}
            placeholder="Filter by city, state, or name..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
      </div>

      {/* Safeguarding notice */}
      <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Privacy Safeguard:</strong> Geographic pins depict approximate reported landmarks and jurisdictions. They do not publish exact domestic residences and do NOT imply real-time device tracking.
        </span>
      </div>

      {/* Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <CaseMap
            cases={filteredCases}
            selectedCaseId={selectedCaseId}
            onSelectCase={c => navigate(`/case/${c.id}`)}
            height="620px"
          />
        </div>

        {/* Sidebar Case List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3 flex flex-col max-h-[620px]">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Cases in View ({filteredCases.length})
          </h3>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
            {filteredCases.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedCaseId(item.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer text-xs ${
                  selectedCaseId === item.id
                    ? 'border-teal-500 bg-teal-50/60'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <img src={item.photoUrl} alt={item.fullName} className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{item.fullName}</div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.lastSeenCity}, {item.lastSeenState}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Ref: {item.referenceNumber}</span>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/case/${item.id}`);
                    }}
                    className="text-teal-700 font-bold hover:underline"
                  >
                    Open Case &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
