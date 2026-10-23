import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { CaseMap } from '../components/map/CaseMap';
import {
  Search,
  PlusCircle,
  Eye,
  ShieldCheck,
  Users,
  CheckCircle,
  FileSearch,
  Clock,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Lock,
  ChevronRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

interface HomeProps {
  navigate: (path: string, state?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const { cases, sightings } = useData();
  const { role } = useAuth();
  const [heroSearch, setHeroSearch] = useState('');

  // Calculate real metrics directly from database
  const approvedCases = cases.filter(c => c.visibility === 'public');
  const activeCasesCount = approvedCases.filter(
    c => c.status === 'Verified / Active' || c.status === 'Under Investigation' || c.status === 'New Lead Received'
  ).length;
  const resolvedCount = cases.filter(c => c.status === 'Resolved / Closed').length;
  const totalLeadsCount = sightings.length;
  const pendingReviewCount = cases.filter(c => c.status === 'Pending Review').length;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/search', { query: heroSearch });
  };

  const handleStateQuickFilter = (stateName: string) => {
    navigate('/search', { query: stateName });
  };

  const recentCases = approvedCases.slice(0, 4);

  const popularStates = [
    'Delhi NCR',
    'Maharashtra',
    'Karnataka',
    'West Bengal',
    'Telangana',
    'Tamil Nadu',
    'Uttar Pradesh',
    'Gujarat',
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Subtle decorative mesh and glowing Indian saffron/teal light pools */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_0.8px,transparent_0.8px)] [background-size:28px_28px] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-10 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-display tracking-wide uppercase text-[11px] font-bold">National Missing Persons Registry</span>
            <span className="text-slate-500">&bull;</span>
            <span className="font-devanagari text-xs text-amber-400">खोया-पाया भारत</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
              Every Second Counts. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-teal-200 to-emerald-300">
                Help Bring Them Home.
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-sm sm:text-lg text-slate-300 leading-relaxed font-normal">
              A verified national coordination network uniting distressed families, Indian Railways & transit witnesses, and state police crime branches. Safeguarding privacy under Indian child protection standards.
            </p>
          </div>

          {/* Quick Search Form */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-xl p-2 rounded-2xl border border-slate-700/80 hover:border-amber-500/40 focus-within:border-amber-400 shadow-2xl transition-all flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={heroSearch}
                onChange={e => setHeroSearch(e.target.value)}
                placeholder="Search by name, FIR reference, police station, city, or state..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950/70 text-white rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/60 font-medium border border-slate-800"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Search className="w-4 h-4" />
              Search Registry
            </button>
          </form>

          {/* Popular Regional States Quick Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400 text-[11px] font-semibold mr-1 font-display tracking-wide uppercase">Regions:</span>
            {popularStates.map(st => (
              <button
                key={st}
                onClick={() => handleStateQuickFilter(st)}
                className="px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-amber-400/50 hover:text-white transition-all cursor-pointer text-[11px] font-medium"
              >
                {st}
              </button>
            ))}
          </div>

          {/* 3 Core Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/report')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-bold text-sm transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              Report a Missing Person
            </button>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-display font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileSearch className="w-4 h-4 text-teal-400" />
              Search Missing Directory
            </button>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3.5 rounded-xl bg-teal-950/70 hover:bg-teal-900/90 text-teal-200 font-display font-semibold text-sm border border-teal-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Eye className="w-4 h-4 text-teal-400" />
              Submit a Sighting Tip
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Strip for Indian Helpline Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-950/90 via-slate-950 to-red-950/90 rounded-2xl p-4 sm:p-5 text-white border border-red-900/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-red-600 rounded-xl shadow-lg shadow-red-600/30 shrink-0">
              <PhoneCall className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white flex items-center gap-2">
                <span>Immediate Emergency Police Dispatch</span>
                <span className="text-[10px] bg-red-600/30 border border-red-500/40 px-2 py-0.5 rounded text-red-200 uppercase font-mono tracking-wider">
                  24x7 Pan-India
                </span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">
                For active disappearances or immediate rescue, call emergency helplines before or right after registering on this portal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
            <a
              href="tel:112"
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-red-500/40 text-red-300 hover:bg-red-950 transition cursor-pointer"
            >
              ERSS: 112
            </a>
            <a
              href="tel:1098"
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300 hover:bg-amber-950 transition cursor-pointer"
            >
              Childline: 1098
            </a>
            <a
              href="tel:139"
              className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-teal-500/40 text-teal-300 hover:bg-teal-950 transition cursor-pointer"
            >
              Railways: 139
            </a>
            <button
              onClick={() => navigate('/contact')}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-display font-bold text-xs transition cursor-pointer shadow"
            >
              All State Helplines &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Real-time System Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="font-display font-bold text-slate-900 text-xl tracking-tight">National Registry Overview</h3>
              <p className="text-xs text-slate-500">Live operational data from verified police FIRs and citizen sighting reports</p>
            </div>
            <span className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Sync Active
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-display">Active Search Cases</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-950 mt-1 font-display tabular-nums tracking-tight">{activeCasesCount}</div>
              <p className="text-xs text-slate-500 mt-1">Verified & under active investigation</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50/50 to-slate-50 border border-teal-200/50">
              <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider font-display">Community Sightings</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-800 mt-1 font-display tabular-nums tracking-tight">{totalLeadsCount}</div>
              <p className="text-xs text-slate-500 mt-1">Railway, bus depot & citizen tips</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-slate-50 border border-emerald-200/50">
              <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-display">Safely Traced / Reunited</div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 mt-1 font-display tabular-nums tracking-tight">{resolvedCount}</div>
              <p className="text-xs text-slate-500 mt-1">Confirmed located & reunited with family</p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-slate-50 border border-purple-200/50">
              <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider font-display">
                {role === 'admin' ? 'Awaiting Verification' : 'Verified Profiles'}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-purple-900 mt-1 font-display tabular-nums tracking-tight">
                {role === 'admin' ? pendingReviewCount : approvedCases.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {role === 'admin' ? 'Pending officer verification' : 'Approved public case notices'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Approved Missing Person Reports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-display font-bold uppercase tracking-wider text-amber-700">Recent Public Notices</div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recently Approved Missing Persons</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Every profile below has been verified against police incident reports and certified for public assistance.
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-display font-bold text-teal-800 hover:text-teal-900 transition cursor-pointer self-start sm:self-auto"
          >
            <span>View all approved cases ({approvedCases.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentCases.map(item => (
            <div
              key={item.id}
              onClick={() => navigate(`/case/${item.id}`)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 cursor-pointer flex flex-col group"
            >
              {/* Photo & Badges */}
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  src={item.photoUrl}
                  alt={item.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
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

              {/* Info Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-lg group-hover:text-amber-700 transition-colors">
                    {item.fullName}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{item.age} years</span>
                    <span aria-hidden="true">&bull;</span>
                    <span>{item.gender}</span>
                  </div>

                  <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">
                        {item.lastSeenCity}, {item.lastSeenState}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">Last Seen: {item.dateLastSeen}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-display font-semibold text-teal-800 group-hover:underline">
                    View Dossier & Sighting Tip
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-teal-700 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Map Preview Section centered on India */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-display font-bold uppercase tracking-wider text-teal-700">Geographic Spread</div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">National Map of Approved Cases</h2>
            <p className="text-xs text-slate-600">
              Interactive OpenStreetMap view showing approximate reported locations across India.
            </p>
          </div>
          <button
            onClick={() => navigate('/map')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-display font-bold hover:bg-slate-800 transition cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          >
            Open Fullscreen India Map &rarr;
          </button>
        </div>

        <CaseMap
          cases={approvedCases}
          height="420px"
          onSelectCase={c => navigate(`/case/${c.id}`)}
        />
      </section>

      {/* How the System Works in Indian Context */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">How the Indian Verification System Works</h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bridging the gap between distressed families, police stations, and transit networks under strict ethical standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-amber-400/40 transition">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-display font-extrabold text-base">
                01
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">FIR & Intake</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Family members file identifying photographs, physical characteristics, language spoken, and police station complaint / FIR numbers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-blue-400/40 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-display font-extrabold text-base">
                02
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">Administrative Vetting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Case details remain in "Pending Review" until cross-verified with local Police Stations, Childline (1098), or TrackChild registries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-teal-400/40 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center font-display font-extrabold text-base">
                03
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">Transit Sightings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Railway passengers, bus conductors, and citizens log sightings. Witness details are strictly shielded from public display.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-3 hover:border-emerald-400/40 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-display font-extrabold text-base">
                04
              </div>
              <h3 className="font-display font-bold text-slate-900 text-base">Formal Handover</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cases are resolved only upon verified physical handover and formal documentation by the investigating police authority.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Child Safeguarding Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" /> Juvenile Justice & DPDP Act 2023 Compliant
            </div>
            <h3 className="text-2xl font-bold">Safeguarding Children & Vulnerable Individuals</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We never perform commercial biometric harvesting or unauthorized device tracking. Juvenile cases receive heightened administrative oversight to prevent misuse in domestic or custody disputes.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/safety')}
              className="px-5 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow cursor-pointer"
            >
              Indian Safety Protocols
            </button>
            <button
              onClick={() => navigate('/privacy')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs border border-slate-700 transition cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
