import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowLeft, Shield } from 'lucide-react';

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-teal-400 flex items-center justify-center mx-auto shadow-lg font-bold">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
        <p className="text-xs text-slate-500">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-xs">
        {submitted ? (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-slate-900 text-base">Recovery Link Sent</h3>
            <p className="text-slate-600 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure reset token has been dispatched. Check your inbox and spam folder.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Registered Account Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition cursor-pointer"
            >
              Send Password Reset Link
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
