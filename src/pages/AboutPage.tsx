import React from 'react';
import { ShieldCheck, HeartHandshake, Eye, Users, CheckCircle, Lock } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>About Missing People Tracker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Coordinating Truth, Privacy, and Hope
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The Missing People Tracker and Finder System was founded to bridge the critical gap between distraught families, community observers, and certified law enforcement investigators.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
        <h2 className="text-lg font-bold text-slate-900 border-b pb-2">Our Mission & Principles</h2>
        <p>
          In the acute initial hours of a disappearance, time is the single greatest determinant of safe recovery. However, social media channels frequently suffer from unverified rumors, outdated photos, duplicate postings, and dangerous doxxing of vulnerable individuals or witnesses.
        </p>
        <p>
          Missing People Tracker provides a structured, role-based architecture where every publicly published profile is verified by authorized case administrators in coordination with registered law enforcement incident filings.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Pre-Publication Verification
            </h4>
            <p>
              Cases filed by families remain in "Pending Review" until cross-referenced against official police incident numbers, avoiding fraudulent or harassing submissions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-600" /> Witness Shield Safeguards
            </h4>
            <p>
              Citizens reporting sightings can do so with full confidentiality. Witness contact numbers are strictly restricted to assigned detectives and administrators.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Role-Based Access Control
            </h4>
            <p>
              Segregated dashboards for Public Visitors, Registered Reporters, Field Investigators, and System Administrators prevent unauthorized access to sensitive lead notes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-600" /> Ethical Search Standards
            </h4>
            <p>
              We firmly reject biometric facial recognition harvesting, covert phone GPS tracking, or premature declarations that a subject has been found before formal confirmation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
