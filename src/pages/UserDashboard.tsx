import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { MissingPersonReport } from '../types';
import {
  FileText,
  Clock,
  MapPin,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ExternalLink,
  Edit,
  Trash2,
  Bell,
  User,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface UserDashboardProps {
  navigate: (path: string, state?: any) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ navigate }) => {
  const { cases, notifications, withdrawReport, updateReport } = useData();
  const { user, logout } = useAuth();

  const [editingCase, setEditingCase] = useState<MissingPersonReport | null>(null);
  const [clothingEdit, setClothingEdit] = useState('');
  const [identifyingEdit, setIdentifyingEdit] = useState('');

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <p className="text-xs text-slate-600">Please sign in to access your registered reporter case dashboard.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Filter cases owned by this user
  const myReports = cases.filter(c => c.ownerId === user.uid);
  const userNotifs = notifications.filter(n => n.recipientId === user.uid);

  const handleWithdraw = async (caseItem: MissingPersonReport) => {
    const reason = prompt(`Enter reason for withdrawing report ${caseItem.referenceNumber}:`);
    if (!reason) return;
    try {
      await withdrawReport(caseItem.id, reason);
      alert('Case marked as Withdrawn.');
    } catch (e: any) {
      alert(e.message || 'Failed to withdraw.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCase) return;
    try {
      await updateReport(
        editingCase.id,
        {
          clothingLastSeen: clothingEdit,
          identifyingFeatures: identifyingEdit,
        },
        'Reporter submitted updated physical identifiers'
      );
      alert('Report updated successfully.');
      setEditingCase(null);
    } catch (e: any) {
      alert(e.message || 'Update failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
            Registered Reporter Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user.displayName}
          </h1>
          <p className="text-xs text-slate-300">
            Account: <strong className="text-white">{user.email}</strong> &bull; Role:{' '}
            <span className="uppercase text-teal-400 font-bold">{user.role}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/report')}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            File New Report
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            Profile Settings
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">My Filed Reports</span>
          <div className="text-3xl font-extrabold text-slate-900 mt-1">{myReports.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Submitted missing person cases</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Under Review</span>
          <div className="text-3xl font-extrabold text-amber-700 mt-1">
            {myReports.filter(c => c.status === 'Pending Review').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting administrator verification</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Active / Verified</span>
          <div className="text-3xl font-extrabold text-teal-700 mt-1">
            {myReports.filter(c => c.status === 'Verified / Active' || c.status === 'Under Investigation').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Publicly listed & investigated</p>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Missing Person Reports</h2>
            <p className="text-xs text-slate-500">Track verification status, assigned detectives, and updates.</p>
          </div>
        </div>

        {myReports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-700 text-sm">No Reports Filed Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't filed any missing person cases under this account.
            </p>
            <button
              onClick={() => navigate('/report')}
              className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 cursor-pointer"
            >
              + File First Report
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myReports.map(item => (
              <div key={item.id} className="p-6 hover:bg-slate-50/50 transition space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.photoUrl}
                      alt={item.fullName}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{item.fullName}</h3>
                        <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                          {item.referenceNumber}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                        <span>Submitted: {new Date(item.createdAt).toLocaleDateString()}</span>
                        <span>&bull;</span>
                        <span>Last Seen: {item.lastSeenCity}, {item.lastSeenState}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                  </div>
                </div>

                {/* Additional Info Requested Banner if present */}
                {item.additionalInfoRequested && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Investigator Request:</strong> {item.additionalInfoRequested}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Controls */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    Assigned: <strong>{item.assignedInvestigatorName || 'Pending task-force assignment'}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/case/${item.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Public Page
                    </button>

                    <button
                      onClick={() => {
                        setEditingCase(item);
                        setClothingEdit(item.clothingLastSeen || '');
                        setIdentifyingEdit(item.identifyingFeatures || '');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-medium transition cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Update Details
                    </button>

                    {item.status !== 'Withdrawn' && item.status !== 'Resolved / Closed' && (
                      <button
                        onClick={() => handleWithdraw(item)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium border border-rose-200 transition cursor-pointer flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Withdraw
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">
              Update Report: {editingCase.fullName} ({editingCase.referenceNumber})
            </h3>
            <p className="text-xs text-slate-500">
              Provide updated physical descriptions or clothing details observed by family.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Distinctive Identifying Marks</label>
                <textarea
                  rows={3}
                  value={identifyingEdit}
                  onChange={e => setIdentifyingEdit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clothing Last Seen</label>
                <textarea
                  rows={2}
                  value={clothingEdit}
                  onChange={e => setClothingEdit(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingCase(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
