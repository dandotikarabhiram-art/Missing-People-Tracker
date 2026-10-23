import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { MissingPersonReport, Sighting, InvestigationNote } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { CaseMap } from '../components/map/CaseMap';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Phone,
  Eye,
  AlertTriangle,
  FileText,
  Lock,
  ChevronLeft,
  Share2,
  CheckCircle,
  HelpCircle,
  Building,
  User,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

interface CaseDetailsProps {
  caseId: string;
  navigate: (path: string, state?: any) => void;
}

export const CaseDetails: React.FC<CaseDetailsProps> = ({ caseId, navigate }) => {
  const {
    getCaseById,
    getCaseSightings,
    getCaseNotes,
    addInvestigationNote,
    updateReport,
    withdrawReport,
  } = useData();
  const { user, role } = useAuth();

  const [caseItem, setCaseItem] = useState<MissingPersonReport | null>(null);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [notes, setNotes] = useState<InvestigationNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'sightings' | 'investigation'>('details');

  // Investigation Note Form State
  const [newNote, setNewNote] = useState('');
  const [noteCategory, setNoteCategory] = useState<InvestigationNote['category']>('Lead Follow-up');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Status Change State (for Investigator / Admin)
  const [statusReason, setStatusReason] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const data = await getCaseById(caseId);
      if (mounted) {
        setCaseItem(data);
        if (data) {
          const s = await getCaseSightings(data.id);
          setSightings(s);
          if (role === 'investigator' || role === 'admin') {
            const n = await getCaseNotes(data.id);
            setNotes(n);
          }
        }
        setIsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [caseId, role]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 text-sm">Retrieving secure case dossier...</p>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-4">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 inline-block">
          <AlertTriangle className="w-8 h-8 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Case Record Not Found</h2>
        <p className="text-xs text-slate-600">
          The requested missing person case may be unpublished, pending administrative review, or restricted under privacy safeguards.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2 rounded-lg bg-teal-600 text-white text-xs font-bold hover:bg-teal-500 cursor-pointer"
        >
          &larr; Back to Search Registry
        </button>
      </div>
    );
  }

  const isOwner = user && user.uid === caseItem.ownerId;
  const isAuthorizedOfficial = role === 'admin' || role === 'investigator';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setIsSubmittingNote(true);
    try {
      const created = await addInvestigationNote({
        caseId: caseItem.id,
        caseReferenceNumber: caseItem.referenceNumber,
        category: noteCategory,
        note: newNote.trim(),
        isConfidential: true,
      });
      setNotes(prev => [created, ...prev]);
      setNewNote('');
    } catch (err: any) {
      alert(err.message || 'Failed adding note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleStatusChange = async () => {
    if (!newStatus || !statusReason.trim()) {
      alert('Please select a status and enter an official justification note.');
      return;
    }
    try {
      const updated = await updateReport(caseItem.id, { status: newStatus as any }, statusReason);
      setCaseItem(updated);
      alert(`Case status updated to ${newStatus}.`);
      setNewStatus('');
      setStatusReason('');
    } catch (e: any) {
      alert(e.message || 'Status update failed.');
    }
  };

  const handleWithdraw = async () => {
    const reason = prompt('Please enter the reason for withdrawing this missing person report:');
    if (!reason) return;
    try {
      const updated = await withdrawReport(caseItem.id, reason);
      setCaseItem(updated);
      alert('Report withdrawn successfully.');
    } catch (err: any) {
      alert(err.message || 'Withdrawal failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & quick actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/search')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Search Results
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-display font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            {copiedLink ? 'Link Copied!' : 'Share Case Notice'}
          </button>
          <button
            onClick={() => navigate('/sighting', { caseId: caseItem.id, reference: caseItem.referenceNumber })}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Eye className="w-4 h-4" /> Submit Sighting Tip
          </button>
        </div>
      </div>

      {/* Reporter Private Banner if Owner */}
      {isOwner && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-display font-bold uppercase tracking-wider text-blue-800 text-[11px]">Your Submitted Family Report</span>
            <p className="mt-0.5">
              You are signed in as the registered reporter for this case. Your private contact details are kept strictly safe.
            </p>
          </div>
          {caseItem.status !== 'Withdrawn' && caseItem.status !== 'Resolved / Closed' && (
            <button
              onClick={handleWithdraw}
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-rose-700 font-bold hover:bg-rose-50 transition cursor-pointer shrink-0"
            >
              Withdraw Report
            </button>
          )}
        </div>
      )}

      {/* Main Dossier Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Main Photo Gallery */}
          <div className="bg-slate-950 p-6 flex flex-col items-center justify-center text-white relative">
            <div className="w-full aspect-[3/4] max-w-sm rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl relative">
              <img
                src={caseItem.photoUrl}
                alt={caseItem.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                <StatusBadge status={caseItem.status} className="bg-white/95 shadow text-slate-900" />
                {caseItem.priority === 'Critical / Endangered' && (
                  <PriorityBadge priority={caseItem.priority} className="bg-white/95 shadow" />
                )}
              </div>
            </div>

            <div className="mt-4 text-center">
              <div className="text-[10px] text-teal-400 font-mono tracking-widest font-semibold uppercase">
                Official Case Reference
              </div>
              <div className="text-xl font-extrabold font-mono text-amber-300 tracking-wider mt-0.5 tabular-nums">
                {caseItem.referenceNumber}
              </div>
            </div>
          </div>

          {/* Core Identifying Overview */}
          <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {caseItem.fullName}
                    {caseItem.nickname && (
                      <span className="text-slate-400 font-normal text-xl ml-2">"{caseItem.nickname}"</span>
                    )}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Missing from <strong>{caseItem.lastSeenCity}, {caseItem.lastSeenState}</strong> since{' '}
                    <strong className="font-mono">{caseItem.dateLastSeen}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-display tracking-wider">Investigator</div>
                  <div className="text-xs font-display font-bold text-slate-800">
                    {caseItem.assignedInvestigatorName || 'Investigative Task Force'}
                  </div>
                </div>
              </div>

              {/* Physical Profile Grid */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Age</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{caseItem.age} years</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Gender</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{caseItem.gender}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Height</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{caseItem.height || 'Unknown'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Hair / Eyes</span>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {caseItem.hairColor} / {caseItem.eyeColor}
                  </p>
                </div>
              </div>

              {/* Identifying Marks & Clothing */}
              <div className="mt-6 space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Distinctive Identifying Marks:</span>
                  <p className="text-slate-700 leading-relaxed">{caseItem.identifyingFeatures || 'None disclosed.'}</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Clothing Last Seen Wearing:</span>
                  <p className="text-slate-700 leading-relaxed">{caseItem.clothingLastSeen || 'Not specified.'}</p>
                </div>

                {caseItem.medicalConditionsOrMedication && (
                  <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-red-900">
                    <span className="font-bold block mb-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Medical Alert / Vulnerability Notice:
                    </span>
                    <p className="text-xs leading-relaxed">{caseItem.medicalConditionsOrMedication}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Police Liaison Reference */}
            {caseItem.policeDepartment && (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between text-slate-700">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-bold">Investigating Agency:</span> {caseItem.policeDepartment}
                  </div>
                </div>
                {caseItem.policeReportNumber && (
                  <div className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-300">
                    Case #{caseItem.policeReportNumber}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation for Investigators / Admins */}
      {isAuthorizedOfficial && (
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-6 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'details'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Public Case Dossier
          </button>
          <button
            onClick={() => setActiveTab('sightings')}
            className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sightings'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Sightings & Witness Leads</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {sightings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('investigation')}
            className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'investigation'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3 h-3 text-amber-600" />
            <span>Investigator Confidential Workspace</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
              {notes.length} notes
            </span>
          </button>
        </div>
      )}

      {/* TAB 1: Public Details & Map */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Circumstances & Timeline */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" /> Circumstances of Disappearance
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {caseItem.circumstances}
              </p>
              {caseItem.lastSeenAddressApprox && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <strong>Approximate Vicinity:</strong> {caseItem.lastSeenAddressApprox}
                </div>
              )}
            </div>

            {/* Geographic Map Preview */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" /> Last-Seen Geographic Vicinity
                </h3>
                <span className="text-[11px] text-slate-500">
                  Approx. coordinates: {caseItem.latitude?.toFixed(3)}, {caseItem.longitude?.toFixed(3)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                To safeguard individual privacy and residential security, map markers reflect the approximate reported district or trailhead, not a specific private residence.
              </p>
              <CaseMap
                cases={[caseItem]}
                selectedCaseId={caseItem.id}
                height="320px"
                initialCenter={[caseItem.latitude || 39.5, caseItem.longitude || -98.35]}
                initialZoom={11}
              />
            </div>
          </div>

          {/* Sidebar CTA & Emergency Protocol */}
          <div className="space-y-6">
            {/* Submit Sighting CTA */}
            <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-teal-800 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base">Have You Seen {caseItem.fullName}?</h4>
                <p className="text-xs text-teal-200 mt-1 leading-relaxed">
                  Your observation could be the key lead investigators need. Submit a date, time, and location securely.
                </p>
              </div>
              <button
                onClick={() => navigate('/sighting', { caseId: caseItem.id, reference: caseItem.referenceNumber })}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                Submit a Sighting Tip &rarr;
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                Witness contact information is strictly confidential. Anonymous submissions accepted.
              </p>
            </div>

            {/* Official Reporting Rules */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-3">
              <h5 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-900" /> Law Enforcement Guidelines
              </h5>
              <p className="leading-relaxed">
                If you believe you are currently in contact with the missing individual or if they require immediate medical attention, call <strong>911</strong> or local emergency dispatch immediately before submitting a web report.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Sightings & Witness Leads */}
      {activeTab === 'sightings' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Reported Community Sightings</h3>
              <p className="text-xs text-slate-500">
                Community observations linked to case {caseItem.referenceNumber}.
              </p>
            </div>
            <button
              onClick={() => navigate('/sighting', { caseId: caseItem.id, reference: caseItem.referenceNumber })}
              className="px-3.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition cursor-pointer"
            >
              + Log Sighting
            </button>
          </div>

          {sightings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
              No sightings have been logged for this case yet.
            </div>
          ) : (
            <div className="space-y-4">
              {sightings.map(s => (
                <div
                  key={s.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{s.sightingReference}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                        {s.status}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      Observed: {s.dateObserved} {s.timeObserved ? `at ${s.timeObserved}` : ''}
                    </span>
                  </div>

                  <div className="text-slate-700">
                    <strong>Location:</strong> {s.locationDescription} ({s.city}, {s.state})
                  </div>

                  <p className="text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                    {s.observationDetails}
                  </p>

                  {/* Private witness info for officials only */}
                  {isAuthorizedOfficial && s.witnessContact && (
                    <div className="p-2.5 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-[11px] flex items-center justify-between">
                      <div>
                        <strong>Confidential Witness:</strong> {s.witnessName || 'Citizen'} ({s.witnessContact})
                      </div>
                      <span className="text-[10px] text-amber-700 uppercase font-bold">Investigator Eyes Only</span>
                    </div>
                  )}

                  {s.investigatorNotes && (
                    <div className="text-[11px] text-teal-800 bg-teal-50 p-2 rounded border border-teal-200">
                      <strong>Investigator Lead Note:</strong> {s.investigatorNotes} (by {s.reviewedBy})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Investigator Workspace */}
      {activeTab === 'investigation' && isAuthorizedOfficial && (
        <div className="space-y-6">
          {/* Status updater */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-700" /> Update Official Case Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Choose Status --</option>
                  <option value="Verified / Active">Verified / Active</option>
                  <option value="Under Investigation">Under Investigation</option>
                  <option value="New Lead Received">New Lead Received</option>
                  <option value="Located — Awaiting Confirmation">Located — Awaiting Confirmation</option>
                  <option value="Resolved / Closed">Resolved / Closed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Reason / Official Justification (Mandatory)
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={e => setStatusReason(e.target.value)}
                  placeholder="e.g. Received confirmation from County SAR search director."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              onClick={handleStatusChange}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Commit Status Update to Audit Log
            </button>
          </div>

          {/* Add Confidential Note */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" /> Confidential Case Notes
              </h3>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                Protected from Public Eyes
              </span>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={noteCategory}
                  onChange={e => setNoteCategory(e.target.value as any)}
                  className="p-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Lead Follow-up">Lead Follow-up</option>
                  <option value="Witness Interview">Witness Interview</option>
                  <option value="Law Enforcement Liaison">Law Enforcement Liaison</option>
                  <option value="Forensic/Digital">Forensic / Digital</option>
                  <option value="General">General</option>
                </select>
                <input
                  type="text"
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Enter detailed confidential note..."
                  className="flex-1 p-2 text-xs rounded-lg border border-slate-300 focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>

            <div className="space-y-3 pt-2">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No internal notes recorded yet.</p>
              ) : (
                notes.map(n => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">
                        {n.investigatorName} &bull; <span className="text-teal-700">{n.category}</span>
                      </span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{n.note}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
