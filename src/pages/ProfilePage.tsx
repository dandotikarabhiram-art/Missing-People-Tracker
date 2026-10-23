import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, Building, Award, CheckCircle } from 'lucide-react';

interface ProfilePageProps {
  navigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ navigate }) => {
  const { user, updateProfile, logout } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ displayName: displayName.trim(), phoneNumber: phoneNumber.trim() });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Account Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your identity and private contact information.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
        {/* User Identity Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-teal-600/20">
            {user.displayName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{user.displayName}</h3>
            <p className="text-slate-500">{user.email}</p>
            <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold uppercase border">
              Role: {user.role}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Email addresses are verified upon creation and cannot be changed arbitrarily.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Confidential Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Used strictly for confidential detective follow-ups on active leads.
            </p>
          </div>

          {/* Investigator or Official Badges */}
          {(user.role === 'investigator' || user.role === 'admin') && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-900" /> Authorized Official Credentials
              </span>
              <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
                <div>
                  <strong>Badge Number:</strong> {user.badgeNumber || 'SAR-CHIEF-01'}
                </div>
                <div>
                  <strong>Department:</strong> {user.department || 'National Coordination'}
                </div>
              </div>
            </div>
          )}

          {isSaved && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-300 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Profile information successfully updated.</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={logout}
              className="px-4 py-2 text-rose-700 hover:bg-rose-50 rounded-lg font-semibold transition cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow transition cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
