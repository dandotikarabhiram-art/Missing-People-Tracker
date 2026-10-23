import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { MissingPersonReport, UserProfile, UserRole } from '../types';
import { dbEngine } from '../lib/database';
import {
  Shield,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  UserCheck,
  Search,
  Filter,
  Eye,
  Clock,
  RotateCcw,
  Building,
  Key,
} from 'lucide-react';

interface AdminDashboardProps {
  navigate: (path: string, state?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const {
    cases,
    sightings,
    auditLogs,
    allUsers,
    approveReport,
    rejectReport,
    assignInvestigator,
    updateReport,
    resetDatabase,
    refreshData,
  } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'pending' | 'cases' | 'users' | 'audit'>('pending');
  const [rejectingCase, setRejectingCase] = useState<MissingPersonReport | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [assigningCase, setAssigningCase] = useState<MissingPersonReport | null>(null);
  const [selectedInvestigatorId, setSelectedInvestigatorId] = useState('');

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Administrative Privileges Required</h2>
        <p className="text-xs text-slate-600">
          Only system administrators can access the system moderation panel and user management.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  // Real statistics
  const pendingCases = cases.filter(c => c.status === 'Pending Review');
  const publishedCases = cases.filter(c => c.visibility === 'public');
  const activeCases = cases.filter(
    c => c.status === 'Verified / Active' || c.status === 'Under Investigation' || c.status === 'New Lead Received'
  );
  const resolvedCases = cases.filter(c => c.status === 'Resolved / Closed');
  const pendingSightings = sightings.filter(s => s.status === 'New');

  const investigators = allUsers.filter(u => u.role === 'investigator');

  const handleApprove = async (caseItem: MissingPersonReport) => {
    const notes = prompt(`Confirm approval of ${caseItem.fullName} (${caseItem.referenceNumber}) for public release:`, 'Verified with law enforcement records');
    if (notes === null) return;
    try {
      await approveReport(caseItem.id, notes);
      alert(`Report ${caseItem.referenceNumber} approved and published to public index.`);
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleRejectCommit = async () => {
    if (!rejectingCase || !rejectionReason.trim()) {
      alert('Please state a reason for rejecting this report.');
      return;
    }
    try {
      await rejectReport(rejectingCase.id, rejectionReason.trim());
      alert(`Report ${rejectingCase.referenceNumber} rejected.`);
      setRejectingCase(null);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  const handleAssignCommit = async () => {
    if (!assigningCase || !selectedInvestigatorId) {
      alert('Please select an investigator.');
      return;
    }
    const inv = investigators.find(i => i.uid === selectedInvestigatorId);
    if (!inv) return;
    try {
      await assignInvestigator(assigningCase.id, inv.uid, inv.displayName);
      alert(`Assigned ${inv.displayName} to case ${assigningCase.referenceNumber}.`);
      setAssigningCase(null);
      setSelectedInvestigatorId('');
    } catch (err: any) {
      alert(err.message || 'Assignment failed.');
    }
  };

  const handleUserRoleChange = async (targetUser: UserProfile, newRole: UserRole) => {
    if (targetUser.uid === user.uid) {
      alert('You cannot alter your own administrative role.');
      return;
    }
    try {
      await dbEngine.updateUserRole(targetUser.uid, newRole, user);
      await refreshData();
      alert(`Updated ${targetUser.displayName}'s role to ${newRole}.`);
    } catch (err: any) {
      alert(err.message || 'Role change failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Command Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-purple-900/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <Shield className="w-3.5 h-3.5" /> Administrator Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            System Administration & Moderation
          </h1>
          <p className="text-xs text-slate-300">
            Active Administrator: <strong className="text-white">{user.displayName}</strong> &bull; Central Audit Logging Active
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset database to default seed data? (Useful for testing)')) {
              resetDatabase();
              alert('Database reset to initial factory seed records.');
            }
          }}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" /> Reset Demo Seed Data
        </button>
      </div>

      {/* Real Real-Time Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Review</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCases.length}</div>
          <p className="text-[10px] text-slate-500">Awaiting approval</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Published Reports</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{publishedCases.length}</div>
          <p className="text-[10px] text-slate-500">Public search index</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Active Searches</span>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">{activeCases.length}</div>
          <p className="text-[10px] text-slate-500">In-progress investigations</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Resolved Cases</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{resolvedCases.length}</div>
          <p className="text-[10px] text-slate-500">Reunited / located</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Sightings</span>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">{pendingSightings.length}</div>
          <p className="text-[10px] text-slate-500">New witness leads</p>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Verification Queue</span>
          {pendingCases.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {pendingCases.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'cases'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All Cases Registry ({cases.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User & Investigator Management ({allUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          System Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: Pending Verification Queue */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Pending Review Queue</h2>
            <p className="text-xs text-slate-500">
              Cross-reference police complaint filings and review physical identifiers prior to public broadcast.
            </p>
          </div>

          {pendingCases.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-bold text-slate-800 text-sm">All Reports Verified</div>
              <p>No missing person reports are currently awaiting administrator review.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {pendingCases.map(item => (
                <div key={item.id} className="p-6 hover:bg-slate-50/50 transition space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.photoUrl}
                        alt={item.fullName}
                        className="w-16 h-16 rounded-xl object-cover border"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">{item.fullName}</h3>
                          <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">
                            {item.referenceNumber}
                          </span>
                        </div>
                        <div className="text-slate-500 mt-1">
                          Age: {item.age} &bull; {item.gender} &bull; Last seen: {item.lastSeenCity}, {item.lastSeenState} ({item.dateLastSeen})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Publish
                      </button>
                      <button
                        onClick={() => setRejectingCase(item)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                    <div>
                      <strong>Reporter:</strong> {item.ownerName} ({item.relationshipToPerson}) &bull; Email:{' '}
                      {item.ownerEmail || 'N/A'} &bull; Phone: {item.ownerPhone || 'N/A'}
                    </div>
                    <div>
                      <strong>Police Reference:</strong> {item.policeDepartment || 'Not provided'}{' '}
                      {item.policeReportNumber ? `(Report #${item.policeReportNumber})` : ''}
                    </div>
                    <div>
                      <strong>Circumstances:</strong> {item.circumstances}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: All Cases & Investigator Assignment */}
      {activeTab === 'cases' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Complete Master Case Registry</h2>
              <p className="text-xs text-slate-500">Assign investigators, adjust priority, and supervise status.</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {cases.map(item => (
              <div key={item.id} className="p-6 hover:bg-slate-50/50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={item.photoUrl} alt={item.fullName} className="w-12 h-12 rounded-lg object-cover border" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.fullName}</span>
                      <span className="font-mono text-[11px] text-slate-500">{item.referenceNumber}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.lastSeenCity}, {item.lastSeenState} &bull; Investigator:{' '}
                      <strong className="text-slate-800">{item.assignedInvestigatorName || 'Unassigned'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />

                  <button
                    onClick={() => {
                      setAssigningCase(item);
                      setSelectedInvestigatorId(item.assignedInvestigatorId || '');
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-semibold cursor-pointer"
                  >
                    Assign Investigator
                  </button>

                  <button
                    onClick={() => navigate(`/case/${item.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: User & Investigator Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">User Role & Investigator Directory</h2>
            <p className="text-xs text-slate-500">
              Manage permissions, promote field investigators, and audit account privileges.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {allUsers.map(u => (
              <div key={u.uid} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{u.displayName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {u.email} {u.phoneNumber ? `&bull; ${u.phoneNumber}` : ''} {u.department ? `&bull; ${u.department}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Change Role:</span>
                  <select
                    value={u.role}
                    onChange={e => handleUserRoleChange(u, e.target.value as UserRole)}
                    disabled={u.uid === user.uid}
                    className="p-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium disabled:opacity-50"
                  >
                    <option value="public">Public</option>
                    <option value="reporter">Reporter</option>
                    <option value="investigator">Investigator</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Security & Operational Audit Logs</h2>
            <p className="text-xs text-slate-500">
              Immutable ledger tracking state transitions, investigator assignments, and report approvals.
            </p>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 hover:bg-slate-50/50 transition flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">{log.userName}</span>
                    <span className="text-slate-400 uppercase text-[10px]">({log.userRole})</span>
                  </div>
                  <p className="text-slate-700">{log.details}</p>
                </div>
                <div className="text-[11px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      {rejectingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Reject Report: {rejectingCase.fullName}
            </h3>
            <p className="text-slate-500">
              Provide an official rationale for rejecting this case. This reason will be recorded in the audit log and dispatched to the submitter.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g. Duplicate report MPT-2026-0044 already active; or unverified law enforcement reference..."
              className="w-full p-2.5 rounded-xl border border-slate-300"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingCase(null)}
                className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCommit}
                className="px-4 py-2 rounded-lg font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Investigator Dialog */}
      {assigningCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Assign Lead Investigator: {assigningCase.fullName}
            </h3>
            <p className="text-slate-500">
              Select an authorized detective or search team leader from the active roster.
            </p>
            <select
              value={selectedInvestigatorId}
              onChange={e => setSelectedInvestigatorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-- Choose Investigator --</option>
              {investigators.map(inv => (
                <option key={inv.uid} value={inv.uid}>
                  {inv.displayName} &bull; Badge: {inv.badgeNumber || 'N/A'} ({inv.department || 'SAR'})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAssigningCase(null)}
                className="px-4 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignCommit}
                className="px-4 py-2 rounded-lg font-bold bg-purple-900 hover:bg-purple-800 text-white"
              >
                Assign Investigator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
