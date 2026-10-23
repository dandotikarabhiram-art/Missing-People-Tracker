import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  const handleQuickLogin = (role: 'reporter' | 'investigator' | 'admin') => {
    switchDemoRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'investigator') navigate('/investigator');
    else navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-600 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 font-bold">
          <ShieldAlert className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In to Missing Tracker</h1>
        <p className="text-xs text-slate-500">
          Access your case reports, investigation dossiers, or administrative tools.
        </p>
      </div>

      {/* Quick Testing Persona Buttons */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
        <div className="font-bold text-slate-700 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
          <UserCheck className="w-3.5 h-3.5 text-teal-600" /> One-Click Demo Role Sign-In:
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('reporter')}
            className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-slate-800 text-left flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <span className="font-bold">Sunita Sharma</span> &bull;{' '}
              <span className="text-amber-700 font-semibold">Registered Family Reporter (New Delhi)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('investigator')}
            className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-slate-800 text-left flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <span className="font-bold">Insp. Rajesh Kumar (CID)</span> &bull;{' '}
              <span className="text-blue-700 font-semibold">Delhi Police Anti-Trafficking Unit</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 hover:border-purple-500 text-slate-800 text-left flex items-center justify-between transition cursor-pointer"
          >
            <div>
              <span className="font-bold">Chief Coord. Alok Verma</span> &bull;{' '}
              <span className="text-purple-700 font-semibold">National Missing Cell Admin</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="sarah.jenkins@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[11px] text-teal-700 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition cursor-pointer"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-teal-700 font-bold hover:underline cursor-pointer"
          >
            Register as a Family Reporter
          </button>
        </div>
      </div>
    </div>
  );
};
