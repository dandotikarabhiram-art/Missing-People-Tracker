import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { MissingPersonReport, Sighting } from '../types';
import {
  Shield,
  FileText,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Lock,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';

interface InvestigatorDashboardProps {
  navigate: (path: string, state?: any) => void;
}

export const InvestigatorDashboard: React.FC<InvestigatorDashboardProps> = ({ navigate }) => {
  const { cases, sightings, reviewSighting, updateReport } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'assigned' | 'sightings' | 'all'>('assigned');
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [leadReviewStatus, setLeadReviewStatus] = useState<Sighting['status']>('Verified Relevant');
  const [leadNotes, setLeadNotes] = useState('');
  const [requestInfoCase, setRequestInfoCase] = useState<MissingPersonReport | null>(null);
  const [infoRequestText, setInfoRequestText] = useState('');

  if (!user || (user.role !== 'investigator' && user.role !== 'admin')) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <Lock className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Restricted Access</h2>
        <p className="text-xs text-slate-600">
          This dashboard is strictly reserved for certified law enforcement and authorized search investigators.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
        >
          Sign In as Investigator
        </button>
      </div>
    );
  }

  // Assigned to current investigator (or all active if admin / unassigned)
  const assignedCases = cases.filter(
    c => c.assignedInvestigatorId === user.uid || (user.role === 'admin' && c.status !== 'Rejected')
  );

  const handleLeadReview = async () => {
    if (!selectedSighting) return;
    try {
      await reviewSighting(selectedSighting.id, leadReviewStatus, leadNotes);
      alert(`Lead ${selectedSighting.sightingReference} updated to "${leadReviewStatus}".`);
      setSelectedSighting(null);
      setLeadNotes('');
    } catch (err: any) {
      alert(err.message || 'Lead update failed.');
    }
  };

  const handleSendInfoRequest = async () => {
    if (!requestInfoCase || !infoRequestText.trim()) return;
    try {
      await updateReport(
        requestInfoCase.id,
        { additionalInfoRequested: infoRequestText.trim() },
        `Investigator requested additional info: ${infoRequestText.trim()}`
      );
      alert('Formal request dispatched to reporting family.');
      setRequestInfoCase(null);
      setInfoRequestText('');
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch request.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
            <Shield className="w-3.5 h-3.5" /> Certified Investigation Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user.displayName}
          </h1>
          <p className="text-xs text-slate-300">
            Badge: <strong className="text-white">{user.badgeNumber || 'SAR-LEAD-492'}</strong> &bull; Agency:{' '}
            <span className="text-teal-300 font-medium">{user.department || 'Missing Persons Task Force'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/search')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            Search Global Registry
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'assigned'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Assigned Cases ({assignedCases.length})
        </button>
        <button
          onClick={() => setActiveTab('sightings')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'sightings'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Community Sighting Leads</span>
          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
            {sightings.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Assigned Cases */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedCases.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.photoUrl}
                        alt={item.fullName}
                        className="w-14 h-14 rounded-xl object-cover border"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{item.fullName}</h3>
                        <div className="font-mono text-xs text-slate-500 font-bold">{item.referenceNumber}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {item.age} yrs &bull; {item.gender} &bull; Last seen: {item.lastSeenCity}, {item.lastSeenState}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />
                    </div>
                  </div>

                  {/* Private details for investigator */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                    <div>
                      <strong>Reporting Family:</strong> {item.ownerName} ({item.relationshipToPerson})
                    </div>
                    {item.ownerPhone && (
                      <div>
                        <strong>Confidential Phone:</strong> {item.ownerPhone}
                      </div>
                    )}
                    {item.policeReportNumber && (
                      <div>
                        <strong>Police Filing:</strong> {item.policeDepartment} (#{item.policeReportNumber})
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => setRequestInfoCase(item)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    Request Info
                  </button>

                  <button
                    onClick={() => navigate(`/case/${item.id}`)}
                    className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    Open Investigation Workspace &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Sightings Review */}
      {activeTab === 'sightings' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Incoming Community Sightings</h2>
            <p className="text-xs text-slate-500">
              Review civilian witness tips, verify credibility, and dispatch field units.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {sightings.map(s => (
              <div key={s.id} className="p-6 hover:bg-slate-50/50 transition space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900">{s.sightingReference}</span>
                    <span className="font-semibold text-slate-700">Case: {s.missingPersonName} ({s.caseReferenceNumber})</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                      {s.status}
                    </span>
                  </div>
                  <span className="text-slate-400">
                    Logged: {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
                  <div>
                    <strong>Date & Time Sighted:</strong> {s.dateObserved} {s.timeObserved ? `at ${s.timeObserved}` : ''}
                  </div>
                  <div>
                    <strong>Location:</strong> {s.locationDescription} ({s.city}, {s.state})
                  </div>
                </div>

                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-line">
                  {s.observationDetails}
                </p>

                {/* Confidential witness details */}
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div>
                    <strong>Confidential Witness:</strong> {s.witnessName || 'Anonymous'} {s.witnessContact ? `&bull; ${s.witnessContact}` : ''}
                  </div>
                  <span className="text-[10px] font-bold uppercase text-amber-800">
                    Protected by Shield Law
                  </span>
                </div>

                {/* Lead review controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500">
                    {s.investigatorNotes ? `Notes: ${s.investigatorNotes}` : 'Pending lead evaluation'}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSighting(s);
                      setLeadNotes(s.investigatorNotes || '');
                      setLeadReviewStatus(s.status);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition cursor-pointer"
                  >
                    Evaluate Lead & Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluate Lead Modal */}
      {selectedSighting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Evaluate Lead: {selectedSighting.sightingReference}
            </h3>
            <p className="text-slate-500">
              Update lead validity for {selectedSighting.missingPersonName} ({selectedSighting.caseReferenceNumber}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lead Verification Status</label>
                <select
                  value={leadReviewStatus}
                  onChange={e => setLeadReviewStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                >
                  <option value="New">New / Unscreened</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="Verified Relevant">Verified Relevant (Search Teams Dispatched)</option>
                  <option value="Inconclusive">Inconclusive</option>
                  <option value="Dismissed">Dismissed / Unrelated</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detective Lead Assessment & Field Orders
                </label>
                <textarea
                  rows={3}
                  value={leadNotes}
                  onChange={e => setLeadNotes(e.target.value)}
                  placeholder="Detail why this lead is credible or dismissed, dispatch orders, or witness callback notes..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSighting(null)}
                className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleLeadReview}
                className="px-4 py-2 rounded-lg font-bold bg-blue-900 hover:bg-blue-800 text-white"
              >
                Commit Evaluation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {requestInfoCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Request Additional Information from Family
            </h3>
            <p className="text-slate-500">
              Dispatches a secure request to {requestInfoCase.ownerName} for case {requestInfoCase.referenceNumber}.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Request Details</label>
              <textarea
                rows={4}
                value={infoRequestText}
                onChange={e => setInfoRequestText(e.target.value)}
                placeholder="e.g. Please upload a full-length photo showing Maya's backpack or confirm if she carried a specific cellular power bank..."
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRequestInfoCase(null)}
                className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInfoRequest}
                className="px-4 py-2 rounded-lg font-bold bg-teal-600 hover:bg-teal-500 text-white"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
