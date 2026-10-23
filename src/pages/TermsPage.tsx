import React from 'react';
import { FileText, AlertTriangle, Scale } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs text-slate-700 leading-relaxed">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Scale className="w-6 h-6 text-teal-600" /> Terms and Conditions of Service
        </h1>
        <p className="text-slate-500">
          Statutory conditions for filing missing person cases and submitting community sighting leads.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-sm font-bold">Severe Legal Penalties for False Reporting</strong>
            Filing fictitious missing person reports, fabricating sightings, or attempting to locate individuals under active restraining orders is a serious criminal offense. All IP addresses and submission timestamps are logged in an immutable audit ledger and forwarded to prosecuting authorities.
          </div>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">1. Verification Requirement</h2>
          <p>
            Submission of a missing person report does not guarantee immediate public broadcast. All reports are subjected to administrative vetting. We reserve the right to decline or withdraw any report that cannot be substantiated with an official law enforcement incident number.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">2. Voluntary Citizen Observations</h2>
          <p>
            Sightings submitted through this service constitute civilian observations and do not establish definitive legal proof of identification or current location. Law enforcement retains exclusive operational authority over search and rescue deployment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">3. Non-Emergency Platform Disclaimer</h2>
          <p>
            Missing People Tracker is an investigation coordination registry and community bulletin. In cases of immediate danger, active abduction, or life-threatening medical emergency, users must contact 911 or their local police department before or immediately upon filing a report.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">4. Withdrawal and Corrections</h2>
          <p>
            Registered family reporters may request modifications or report withdrawal at any time through their User Dashboard. Case records are archived in accordance with official case closure guidelines.
          </p>
        </section>
      </div>
    </div>
  );
};
